import request from "supertest";
import { createApp } from "../app";
import { disconnectDb } from "../db";
import { Account } from "../models/Account";
import { User } from "../models/User";

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
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.firstName).toBe("Carol");
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

  it("transfers funds between users", async () => {
    const sender = await createUser("sender@example.com", "Sender", 1000);
    const recipient = await createUser("recipient@example.com", "Recipient", 100);

    const res = await request(app)
      .post("/api/v1/account/transfer")
      .set("Authorization", `Bearer ${sender.token}`)
      .send({ to: recipient.userId, amount: 250 });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Transfer successful");

    const senderAccount = await Account.findOne({ userId: sender.userId });
    const recipientAccount = await Account.findOne({ userId: recipient.userId });

    expect(senderAccount!.balance).toBe(750);
    expect(recipientAccount!.balance).toBe(350);
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
