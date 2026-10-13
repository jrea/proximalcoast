import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SignInPage from "./page";

const { capture, push, emailSignIn, emailSignUp, socialSignIn } = vi.hoisted(() => ({ capture: vi.fn(), push: vi.fn(), emailSignIn: vi.fn(async () => ({ error: null })), emailSignUp: vi.fn(async () => ({ error: null })), socialSignIn: vi.fn(async () => ({})) }));
const location = vi.hoisted(() => ({ search: "" }));
vi.mock("posthog-js/react", () => ({ usePostHog: () => ({ capture }) }));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(location.search), useRouter: () => ({ push }) }));
vi.mock("@/lib/auth-client", () => ({ authClient: { signIn: { email: emailSignIn, social: socialSignIn }, signUp: { email: emailSignUp } } }));
afterEach(cleanup);
beforeEach(() => { location.search = ""; });

describe("auth completion navigation", () => {
  it("leaves the email loading screen after a successful login", async () => {
    render(<SignInPage />);
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "fixture@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "test-only-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/app?auth_result=login&auth_provider=email"));
    expect(capture).toHaveBeenCalledWith("auth_attempt", { site: "jerkstore", provider: "email", type: "login" });
  });
  it("uses Google's new-user callback to distinguish signup from returning login", () => {
    render(<SignInPage />);
    fireEvent.click(screen.getByRole("button", { name: /Google/ }));
    expect(socialSignIn).toHaveBeenCalledWith({ provider: "google", callbackURL: "/app?auth_result=login&auth_provider=google", newUserCallbackURL: "/app?auth_result=signup&auth_provider=google" });
    expect(capture).not.toHaveBeenCalledWith("auth_completed", expect.anything());
  });
  it("allows retry after a Google auth failure and keeps its message out of analytics", async () => {
    socialSignIn.mockRejectedValueOnce(new Error("Private provider error"));
    render(<SignInPage />);
    fireEvent.click(screen.getByRole("button", { name: /Google/ }));
    await waitFor(() => expect(screen.getByRole<HTMLButtonElement>("button", { name: /Google/ }).disabled).toBe(false));
    expect(capture).toHaveBeenCalledWith("auth_error", { site: "jerkstore", provider: "google", type: "login", category: "authentication_failed" });
    expect(push).not.toHaveBeenCalled();
  });
  it("returns an email login to the selected language page", async () => {
    location.search = "returnTo=%2Fai-insults%2Fklingon";
    render(<SignInPage />);
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "fixture@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "test-only-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/ai-insults/klingon?auth_result=login&auth_provider=email"));
    expect(emailSignIn).toHaveBeenCalledWith(expect.objectContaining({ callbackURL: "/ai-insults/klingon" }));
  });
  it("keeps Google login and signup callbacks on the selected language", () => {
    location.search = "returnTo=%2Fai-insults%2Fhigh-valyrian";
    render(<SignInPage />);
    fireEvent.click(screen.getByRole("button", { name: /Google/ }));
    expect(socialSignIn).toHaveBeenCalledWith({ provider: "google", callbackURL: "/ai-insults/high-valyrian?auth_result=login&auth_provider=google", newUserCallbackURL: "/ai-insults/high-valyrian?auth_result=signup&auth_provider=google" });
  });
});
