import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoginButton } from "./login-button";

const { push, useSession } = vi.hoisted(() => ({ push: vi.fn(), useSession: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/lib/auth-client", () => ({ authClient: { useSession } }));
vi.mock("../_lib/analytics-client", () => ({ useJerkstoreAnalytics: () => ({ capture: vi.fn() }) }));

beforeEach(() => {
  vi.useFakeTimers();
  useSession.mockReturnValue({ data: null });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("Jerkstore language sign-in navigation", () => {
  it("preserves a language page when sending a guest to sign in", async () => {
    render(<LoginButton text="Create Free Account" returnTo="/ai-insults/klingon" reason="limit" />);
    fireEvent.click(screen.getByRole("button", { name: "Create Free Account" }));
    await act(async () => { await vi.advanceTimersByTimeAsync(300); });

    expect(push).toHaveBeenCalledOnce();
    const destination = new URL(push.mock.calls[0][0]);
    expect(destination.pathname).toBe("/sign-in");
    expect(destination.searchParams.get("returnTo")).toBe("/ai-insults/klingon");
    expect(destination.searchParams.get("reason")).toBe("limit");
  });

  it("retains existing sign-in behavior without an explicit language destination", async () => {
    render(<LoginButton text="Login" />);
    fireEvent.click(screen.getByRole("button", { name: "Login" }));
    await act(async () => { await vi.advanceTimersByTimeAsync(300); });

    const destination = new URL(push.mock.calls[0][0]);
    expect(destination.pathname).toBe("/sign-in");
    expect(destination.searchParams.has("returnTo")).toBe(false);
  });

  it("returns an already authenticated visitor to their language page", () => {
    useSession.mockReturnValue({ data: { user: { id: "member-a" } } });
    render(<LoginButton text="Go to generator" returnTo="/ai-insults/high-valyrian" />);
    fireEvent.click(screen.getByRole("button", { name: "Go to generator" }));
    expect(push).toHaveBeenCalledExactlyOnceWith("/ai-insults/high-valyrian");
  });
});
