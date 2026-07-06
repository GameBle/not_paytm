import { buildMongoUrl } from "../utils/mongoUrl";

describe("buildMongoUrl", () => {
  it("URL-encodes special characters in password", () => {
    const url = buildMongoUrl(
      "myuser",
      "p@ss#word!",
      "cluster0.abc123.mongodb.net",
      "not_paytm"
    );

    expect(url).toBe(
      "mongodb+srv://myuser:p%40ss%23word!@cluster0.abc123.mongodb.net/not_paytm?retryWrites=true&w=majority"
    );
  });

  it("uses the database name from MONGO_DB, not the cluster name", () => {
    const url = buildMongoUrl(
      "user",
      "secret",
      "cluster0.abc123.mongodb.net",
      "not_paytm"
    );

    expect(url).toContain("/not_paytm?");
    expect(url).not.toContain("/cluster0?");
  });
});
