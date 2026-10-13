import { useState } from "react";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LandingGenerator } from "./landing-generator";

const { useSession, fetchMock } = vi.hoisted(() => ({
  useSession: vi.fn(),
  fetchMock: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({ authClient: { useSession } }));
vi.mock("./insult-generator", () => ({
  InsultGenerator: (props: { initialLanguage: string; returnTo?: string; credits: number; areFeaturesLocked: boolean; isHomePage: boolean }) => {
    const [selectedLanguage] = useState(props.initialLanguage);
    return <div data-testid="generator" data-credits={props.credits} data-locked={props.areFeaturesLocked} data-home={props.isHomePage} data-return-to={props.returnTo}>
      <button>{selectedLanguage}</button>
    </div>;
  },
}));

beforeEach(() => {
  useSession.mockReturnValue({ data: null, isPending: false });
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Jerkstore static page generator access", () => {
  it("retains the language and return destination without reading account data for guests", () => {
    render(<LandingGenerator initialLanguage="Klingon" isHomePage={false} returnTo="/ai-insults/klingon" />);

    const generator = screen.getByTestId("generator");
    expect(screen.getByRole("button", { name: "Klingon" })).toBeTruthy();
    expect(generator.getAttribute("data-return-to")).toBe("/ai-insults/klingon");
    expect(generator.getAttribute("data-locked")).toBe("true");
    expect(generator.getAttribute("data-home")).toBe("false");
    expect(generator.getAttribute("data-credits")).toBe("0");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("disables generator controls until the browser session resolves", () => {
    useSession.mockReturnValue({ data: null, isPending: true });
    const { rerender } = render(<LandingGenerator initialLanguage="Spanish" />);

    expect(screen.getByRole("button", { name: "Spanish" }).matches(":disabled")).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();

    useSession.mockReturnValue({ data: null, isPending: false });
    rerender(<LandingGenerator initialLanguage="Spanish" />);
    expect(screen.getByRole("button", { name: "Spanish" }).matches(":disabled")).toBe(false);
  });

  it("uses the authenticated credit balance without caching personalized data", async () => {
    useSession.mockReturnValue({ data: { user: { id: "member-a" } }, isPending: false });
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ credits: 275 }), { status: 200 }));
    render(<LandingGenerator initialLanguage="High Valyrian" />);

    await waitFor(() => expect(screen.getByTestId("generator").getAttribute("data-credits")).toBe("275"));
    expect(screen.getByTestId("generator").getAttribute("data-locked")).toBe("false");
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith("/api/credits", expect.objectContaining({ cache: "no-store", signal: expect.any(AbortSignal) }));
  });

  it("does not carry one member's balance into a different member or a signed-out session", async () => {
    useSession.mockReturnValue({ data: { user: { id: "member-a" } }, isPending: false });
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ credits: 600 }), { status: 200 }));
    const { rerender } = render(<LandingGenerator initialLanguage="Japanese" />);
    await waitFor(() => expect(screen.getByTestId("generator").getAttribute("data-credits")).toBe("600"));

    let finishNextRequest!: (response: Response) => void;
    fetchMock.mockReturnValueOnce(new Promise<Response>(resolve => { finishNextRequest = resolve; }));
    useSession.mockReturnValue({ data: { user: { id: "member-b" } }, isPending: false });
    rerender(<LandingGenerator initialLanguage="Japanese" />);
    expect(screen.getByTestId("generator").getAttribute("data-credits")).toBe("0");

    useSession.mockReturnValue({ data: null, isPending: false });
    rerender(<LandingGenerator initialLanguage="Japanese" />);
    await act(async () => finishNextRequest(new Response(JSON.stringify({ credits: 275 }), { status: 200 })));

    expect(screen.getByTestId("generator").getAttribute("data-credits")).toBe("0");
    expect(screen.getByTestId("generator").getAttribute("data-locked")).toBe("true");
    expect(fetchMock.mock.calls[1][1].signal.aborted).toBe(true);
  });

  it("resets the selected language when navigating between language pages", () => {
    const { rerender } = render(<LandingGenerator initialLanguage="French" />);
    rerender(<LandingGenerator initialLanguage="Dothraki" />);
    expect(screen.getByRole("button", { name: "Dothraki" })).toBeTruthy();
  });
});
