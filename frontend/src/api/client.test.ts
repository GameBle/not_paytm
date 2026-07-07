import { describe, expect, it } from "vitest";
import { getAccessToken, setAccessToken } from "../api/client";

describe("api client token helpers", () => {
  it("stores and retrieves access token", () => {
    localStorage.clear();
    setAccessToken("test-token-123");
    expect(getAccessToken()).toBe("test-token-123");
  });

  it("clears access token on logout", () => {
    setAccessToken("test-token-123");
    setAccessToken(null);
    expect(getAccessToken()).toBeNull();
  });
});
