import request from "supertest";
import { createApp } from "../app";
import { disconnectDb } from "../db";
import { Account } from "../models/Account";
import { Notification } from "../models/Notification";
import { Transaction } from "../models/Transaction";
import { User } from "../models/User";
import { generateToken, hashToken } from "../utils/tokens";

const app = createApp();

afterAll(async () => {
  await disconnectDb();
});

describe("Auth API", () => {
  it("signs up a new user and returns a token", async () => {
    const res = await request(app)
      .post("/api/v1/user/signup")
      .send({
        username: "alice@example.com",
        firstName: "Alice",
        lastName: "Smith",
        password: "password123",
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.firstName).toBe("Alice");
    expect(res.body.emailVerified).toBe(false);

    const account = await Account.findOne({});
    expect(account).not.toBeNull();
    expect(account!.balance).toBeGreaterThan(0);
  });

  it("rejects duplicate signup", async () => {
    await request(app).post("/api/v1/user/signup").send({
      username: "bob@example.com",
      firstName: "Bob",
      lastName: "Jones",
      password: "password123",
    });

    const res = await request(app).post("/api/v1/user/signup").send({
      username: "bob@example.com",
      firstName: "Bob",
      lastName: "Jones",
      password: "password123",
    });

    expect(res.status).toBe(411);
  });

  it("signs in with correct credentials", async () => {
    await request(app).post("/api/v1/user/signup").send({
      username: "carol@example.com",
      firstName: "Carol",
      lastName: "Lee",
      password: "password123",
    });

    const res = await request(app).post("/api/v1/user/signin").send({
      username: "carol@example.com",
      password: "password123",
      rememberMe: true,
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.firstName).toBe("Carol");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("rejects signin with wrong password", async () => {
    await request(app).post("/api/v1/user/signup").send({
      username: "dave@example.com",
      firstName: "Dave",
      lastName: "Kim",
      password: "password123",
    });

    const res = await request(app).post("/api/v1/user/signin").send({
      username: "dave@example.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(411);
  });

  it("returns current user profile for authenticated request", async () => {
    const signupRes = await request(app).post("/api/v1/user/signup").send({
      username: "me@example.com",
      firstName: "Maya",
      lastName: "Patel",
      password: "password123",
    });

    const res = await request(app)
      .get("/api/v1/user/me")
      .set("Authorization", `Bearer ${signupRes.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe("Maya");
    expect(res.body.lastName).toBe("Patel");
    expect(res.body.username).toBe("me@example.com");
    expect(res.body.role).toBe("user");
    expect(res.body.emailVerified).toBe(false);
  });

  it("refreshes access token with refresh cookie", async () => {
    await request(app).post("/api/v1/user/signup").send({
      username: "refresh@example.com",
      firstName: "Refresh",
      lastName: "User",
      password: "password123",
    });

    const agent = request.agent(app);
    const signinRes = await agent.post("/api/v1/user/signin").send({
      username: "refresh@example.com",
      password: "password123",
    });
    expect(signinRes.body.token).toBeDefined();

    const refreshRes = await agent.post("/api/v1/auth/refresh");
    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.token).toBeDefined();
  });

  it("verifies email with valid token", async () => {
    await request(app).post("/api/v1/user/signup").send({
      username: "verify@example.com",
      firstName: "Verify",
      lastName: "User",
      password: "password123",
    });

    const token = generateToken();
    await User.updateOne(
      { username: "verify@example.com" },
      {
        $set: {
          verificationToken: hashToken(token),
          verificationTokenExpiry: new Date(Date.now() + 3600000),
        },
      }
    );

    const res = await request(app).post("/api/v1/auth/verify-email").send({ token });
    expect(res.status).toBe(200);

    const user = await User.findOne({ username: "verify@example.com" });
    expect(user!.emailVerified).toBe(true);
  });

  it("resets password with valid token", async () => {
    await request(app).post("/api/v1/user/signup").send({
      username: "reset@example.com",
      firstName: "Reset",
      lastName: "User",
      password: "password123",
    });

    const token = generateToken();
    await User.updateOne(
      { username: "reset@example.com" },
      {
        $set: {
          resetToken: hashToken(token),
          resetTokenExpiry: new Date(Date.now() + 3600000),
        },
      }
    );

    const res = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({ token, password: "newpassword123" });
    expect(res.status).toBe(200);

    const signinRes = await request(app).post("/api/v1/user/signin").send({
      username: "reset@example.com",
      password: "newpassword123",
    });
    expect(signinRes.status).toBe(200);
  });
});

describe("Account API", () => {
  async function createUser(
    email: string,
    firstName: string,
    balance: number
  ): Promise<{ token: string; userId: string }> {
    const signupRes = await request(app).post("/api/v1/user/signup").send({
      username: email,
      firstName,
      lastName: "Test",
      password: "password123",
    });

    const user = await User.findOne({ username: email });
    await Account.updateOne({ userId: user!._id }, { balance });

    return {
      token: signupRes.body.token,
      userId: user!._id.toString(),
    };
  }

  it("returns balance for authenticated user", async () => {
    const { token } = await createUser("eve@example.com", "Eve", 500);

    const res = await request(app)
      .get("/api/v1/account/balance")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.balance).toBe(500);
  });

  it("transfers funds between users and records transaction", async () => {
    const sender = await createUser("sender@example.com", "Sender", 1000);
    const recipient = await createUser("recipient@example.com", "Recipient", 100);

    const res = await request(app)
      .post("/api/v1/account/transfer")
      .set("Authorization", `Bearer ${sender.token}`)
      .send({ to: recipient.userId, amount: 250 });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Transfer successful");
    expect(res.body.transactionId).toBeDefined();

    const senderAccount = await Account.findOne({ userId: sender.userId });
    const recipientAccount = await Account.findOne({ userId: recipient.userId });
    const tx = await Transaction.findById(res.body.transactionId);

    expect(senderAccount!.balance).toBe(750);
    expect(recipientAccount!.balance).toBe(350);
    expect(tx).not.toBeNull();

    const notification = await Notification.findOne({ userId: recipient.userId });
    expect(notification).not.toBeNull();
  });

  it("rejects transfer with insufficient balance", async () => {
    const sender = await createUser("poor@example.com", "Poor", 50);
    const recipient = await createUser("rich@example.com", "Rich", 100);

    const res = await request(app)
      .post("/api/v1/account/transfer")
      .set("Authorization", `Bearer ${sender.token}`)
      .send({ to: recipient.userId, amount: 100 });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Insufficient balance");
  });

  it("rejects transfer to invalid account", async () => {
    const sender = await createUser("valid@example.com", "Valid", 500);

    const res = await request(app)
      .post("/api/v1/account/transfer")
      .set("Authorization", `Bearer ${sender.token}`)
      .send({ to: "507f1f77bcf86cd799439011", amount: 100 });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid account");
  });

  it("rejects invalid transfer amount", async () => {
    const sender = await createUser("amount@example.com", "Amount", 500);
    const recipient = await createUser("amount2@example.com", "Amount2", 100);

    const res = await request(app)
      .post("/api/v1/account/transfer")
      .set("Authorization", `Bearer ${sender.token}`)
      .send({ to: recipient.userId, amount: -10 });

    expect(res.status).toBe(400);
  });
});

describe("Transactions API", () => {
  async function createUserWithTransfer() {
    const sender = await request(app).post("/api/v1/user/signup").send({
      username: "txsender@example.com",
      firstName: "TxSender",
      lastName: "Test",
      password: "password123",
    });
    const recipient = await request(app).post("/api/v1/user/signup").send({
      username: "txrecipient@example.com",
      firstName: "TxRecipient",
      lastName: "Test",
      password: "password123",
    });
    const recipientUser = await User.findOne({ username: "txrecipient@example.com" });
    await Account.updateOne({ userId: recipientUser!._id }, { balance: 100 });
    const senderUser = await User.findOne({ username: "txsender@example.com" });
    await Account.updateOne({ userId: senderUser!._id }, { balance: 1000 });

    const transferRes = await request(app)
      .post("/api/v1/account/transfer")
      .set("Authorization", `Bearer ${sender.body.token}`)
      .send({ to: recipientUser!._id.toString(), amount: 100 });

    return {
      senderToken: sender.body.token,
      transactionId: transferRes.body.transactionId as string,
    };
  }

  it("lists user transactions", async () => {
    const { senderToken } = await createUserWithTransfer();

    const res = await request(app)
      .get("/api/v1/transactions")
      .set("Authorization", `Bearer ${senderToken}`);

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThanOrEqual(1);
    expect(res.body.items[0].direction).toBe("sent");
  });

  it("returns transaction receipt for owner", async () => {
    const { senderToken, transactionId } = await createUserWithTransfer();

    const res = await request(app)
      .get(`/api/v1/transactions/${transactionId}`)
      .set("Authorization", `Bearer ${senderToken}`);

    expect(res.status).toBe(200);
    expect(res.body.amount).toBe(100);
    expect(res.body.from).toBeDefined();
    expect(res.body.to).toBeDefined();
  });
});

describe("Notifications API", () => {
  it("lists notifications for user", async () => {
    const signupRes = await request(app).post("/api/v1/user/signup").send({
      username: "notif@example.com",
      firstName: "Notif",
      lastName: "User",
      password: "password123",
    });
    const user = await User.findOne({ username: "notif@example.com" });
    await Notification.create({
      userId: user!._id,
      type: "test",
      message: "Hello",
      read: false,
    });

    const res = await request(app)
      .get("/api/v1/notifications")
      .set("Authorization", `Bearer ${signupRes.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(1);
    expect(res.body.unreadCount).toBe(1);
  });
});

describe("Admin API", () => {
  async function createAdmin() {
    const signupRes = await request(app).post("/api/v1/user/signup").send({
      username: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      password: "password123",
    });
    await User.updateOne({ username: "admin@example.com" }, { $set: { role: "admin" } });
    return signupRes.body.token as string;
  }

  it("returns stats for admin", async () => {
    const token = await createAdmin();
    const res = await request(app)
      .get("/api/v1/admin/stats")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.totalUsers).toBeGreaterThanOrEqual(1);
  });

  it("rejects non-admin access", async () => {
    const signupRes = await request(app).post("/api/v1/user/signup").send({
      username: "regular@example.com",
      firstName: "Regular",
      lastName: "User",
      password: "password123",
    });

    const res = await request(app)
      .get("/api/v1/admin/stats")
      .set("Authorization", `Bearer ${signupRes.body.token}`);
    expect(res.status).toBe(403);
  });
});

describe("User search", () => {
  it("filters users by name", async () => {
    await request(app).post("/api/v1/user/signup").send({
      username: "frank@example.com",
      firstName: "Frank",
      lastName: "Miller",
      password: "password123",
    });

    const res = await request(app).get("/api/v1/user/bulk?filter=Frank");

    expect(res.status).toBe(200);
    expect(res.body.user.length).toBeGreaterThanOrEqual(1);
    expect(res.body.user[0].firstName).toBe("Frank");
  });
});
