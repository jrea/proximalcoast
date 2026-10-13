import { describe, expect, it } from "vitest";
import { authCallback, signInDestination } from "./auth-return";

describe("language page authentication return", () => {
  it.each(["/ai-insults/spanish", "/ai-insults/sindarin-elvish", "/ai-insults/high-valyrian"])("keeps the public destination %s", path => {
    expect(signInDestination(path)).toBe(path);
    expect(authCallback(path, "signup", "google")).toBe(`${path}?auth_result=signup&auth_provider=google`);
  });

  it.each([null, undefined, "", "https://example.com", "//example.com", "/\\example.com", "/ai-insults/%2fexample.com", "/ai-insults/spanish?returnTo=https://example.com", "/api/auth", "/sites/jerkstore/ai-insults/spanish"])("uses the app for invalid destination %s", path => {
    expect(signInDestination(path)).toBe("/app");
  });
});
