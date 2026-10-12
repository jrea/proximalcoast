import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { JerkstoreAnalytics } from "./analytics";

const { capture, identify, reset, replace, state } = vi.hoisted(() => ({ capture: vi.fn(), identify: vi.fn(), reset: vi.fn(), replace: vi.fn(), state: { pathname: "/", params: new URLSearchParams(), session: null as null | { user: { id: string } }, isPending: false } }));
vi.mock("posthog-js/react", () => ({ usePostHog: () => ({ capture, identify, reset }) }));
vi.mock("@/lib/auth-client", () => ({ authClient: { useSession: () => ({ data: state.session, isPending: state.isPending }) } }));
vi.mock("next/navigation", () => ({ usePathname: () => state.pathname, useSearchParams: () => state.params, useRouter: () => ({ replace }) }));
beforeEach(() => { state.pathname = "/"; state.params = new URLSearchParams(); state.session = null; state.isPending = false; window.history.replaceState({}, "", "/"); });
afterEach(cleanup);

describe("conversion identity and authentication completion", () => {
  it("counts one landing visit and does not treat an anonymous visit as signup", () => {
    const view = render(<JerkstoreAnalytics />); view.rerender(<JerkstoreAnalytics />);
    expect(capture).toHaveBeenCalledExactlyOnceWith("jerkstore_landing_viewed", { site: "jerkstore" });
    expect(identify).not.toHaveBeenCalled();
  });
  it("only counts the auth return after a real session exists, then removes the marker", () => {
    state.pathname = "/app"; state.params = new URLSearchParams("auth_result=signup&auth_provider=google&utm_source=test");
    window.history.replaceState({}, "", "/app?auth_result=signup&auth_provider=google&utm_source=test");
    state.isPending = true;
    const view = render(<JerkstoreAnalytics />);
    expect(capture).not.toHaveBeenCalled();
    state.isPending = false; state.session = { user: { id: "internal-user-id" } };
    view.rerender(<JerkstoreAnalytics />); view.rerender(<JerkstoreAnalytics />);
    expect(identify).toHaveBeenCalledExactlyOnceWith("internal-user-id");
    expect(capture).toHaveBeenCalledExactlyOnceWith("auth_completed", { site: "jerkstore", provider: "google", type: "signup" });
    expect(replace).toHaveBeenCalledExactlyOnceWith("/app?utm_source=test", { scroll: false });
  });
  it("resets the signed-in identity on logout", () => {
    state.pathname = "/app"; state.session = { user: { id: "internal-user-id" } };
    const view = render(<JerkstoreAnalytics />);
    state.session = null; view.rerender(<JerkstoreAnalytics />);
    expect(reset).toHaveBeenCalledOnce();
  });
});
