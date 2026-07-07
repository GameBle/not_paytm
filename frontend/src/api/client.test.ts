import { describe, expect, it } from "vitest";
import { getAccessToken, setAccessToken } from "../api/client";

describe("api client token helpers", () => {
  it("stores and retrieves access token when persist is true", () => {
    localStorage.clear();
    setAccessToken("test-token-123", true);
    expect(getAccessToken()).toBe("test-token-123");
    expect(localStorage.getItem("token")).toBe("test-token-123");
  });

  it("keeps token in memory only when persist is false", () => {
    localStorage.clear();
    setAccessToken("session-token", false);
    expect(getAccessToken()).toBe("session-token");
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("clears access token on logout", () => {
    setAccessToken("test-token-123", true);
    setAccessToken(null);
    expect(getAccessToken()).toBeNull();
  });
});
