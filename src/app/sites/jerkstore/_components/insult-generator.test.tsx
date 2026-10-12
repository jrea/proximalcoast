import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InsultGenerator } from "./insult-generator";
import { getStarterPrompt } from "../_content/starter-prompts";

const { submit, capture, fetchMock, hookOptions, hookState, matchMedia } = vi.hoisted(() => ({
  submit: vi.fn(),
  capture: vi.fn(),
  fetchMock: vi.fn(() => { throw new Error("Unexpected network request in generator test"); }),
  matchMedia: vi.fn(() => ({ matches: false })),
  hookOptions: { current: undefined as undefined | { schema: { safeParse(input: unknown): { success: boolean } }; onFinish(input: { object: { roasts: string[] } }): void } },
  hookState: { object: undefined as undefined | { roasts: string[] }, isLoading: false, error: undefined as undefined | Error },
}));

vi.mock("@ai-sdk/react", () => ({
  experimental_useObject: (options: typeof hookOptions.current) => { hookOptions.current = options; return { ...hookState, submit }; },
}));

vi.mock("posthog-js/react", () => ({
  usePostHog: () => ({ capture }),
}));

vi.mock("./share-card", () => ({ ShareCard: () => null }));
vi.mock("./login-button", () => ({ LoginButton: () => null }));
vi.mock("./access-modal", () => ({
  AccessModal: ({ title }: { title: string }) => <div role="dialog" aria-label={title} />,
}));

const defaultProps = {
  isActive: true,
  plan: "trial",
  credits: 0,
  isHomePage: true,
  initialTopicLabel: "What are we roasting?",
  initialButtonLabel: "Generate insults",
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("matchMedia", matchMedia);
  matchMedia.mockReturnValue({ matches: false });
  hookState.object = undefined;
  hookState.isLoading = false;
  hookState.error = undefined;
});

describe("Jerkstore completed results", () => {
  it.each([1, 3, 5])("accepts %i results for long, free and paid requests", count => {
    render(<InsultGenerator {...defaultProps} />);
    expect(hookOptions.current?.schema.safeParse({ roasts: Array.from({ length: count }, (_, i) => `Roast ${i}`) }).success).toBe(true);
    expect(hookOptions.current?.schema.safeParse({ roasts: [] }).success).toBe(false);
    expect(hookOptions.current?.schema.safeParse({ roasts: [" "] }).success).toBe(false);
  });

  it("shows completed roasts, preserves the editable topic and links to history", () => {
    const props = { ...defaultProps, initialTopic: "My meetings have meetings" };
    const { rerender } = render(<InsultGenerator {...props} />);
    fireEvent.click(screen.getByRole("button", { name: /Generate insults/i }));
    expect(screen.getByRole<HTMLInputElement>("textbox").value).toBe(props.initialTopic);
    hookState.object = { roasts: ["Your calendar has a management layer.", "Your agenda needs an agenda.", "Meeting adjourned. Nobody noticed."] };
    act(() => hookOptions.current?.onFinish({ object: hookState.object! }));
    rerender(<InsultGenerator {...props} />);
    expect(screen.getByRole("status").textContent).toBe("Your calendar has a management layer.");
    fireEvent.click(screen.getByRole("button", { name: "Roast 2" }));
    expect(screen.getByRole("status").textContent).toBe("Your agenda needs an agenda.");
    expect(screen.getByRole("button", { name: "Roast 2", pressed: true })).toBeTruthy();
    expect(screen.getByRole("link", { name: "View all your roasts" }).getAttribute("href")).toBe("/roasts");
    expect(capture).toHaveBeenCalledWith("insult_generation_completed", { site: "jerkstore", resultCount: 3, language: "English", heatLevel: "mild", isEmail: false });
    expect(screen.getByRole<HTMLInputElement>("textbox").value).toBe(props.initialTopic);
  });

  it("rolls back a failed rating and lets the visitor retry", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Rating API unavailable"));
    const { rerender } = render(<InsultGenerator {...defaultProps} initialTopic="My calendar" />);
    fireEvent.click(screen.getByRole("button", { name: /Generate insults/i }));
    hookState.object = { roasts: ["Your calendar has a management layer."] };
    act(() => hookOptions.current?.onFinish({ object: hookState.object! }));
    rerender(<InsultGenerator {...defaultProps} initialTopic="My calendar" />);
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Solid burn (+1)" })));
    expect(screen.getByRole("alert").textContent).toContain("not saved");
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Solid burn (+1)" }).disabled).toBe(false);
    expect(capture).not.toHaveBeenCalledWith("insult_rated", expect.anything());
  });

  it("focuses desktop typing and does not invoke the mobile keyboard on arrival", () => {
    const mobile = render(<InsultGenerator {...defaultProps} />);
    expect(document.activeElement).not.toBe(screen.getByRole("textbox", { name: "What are we roasting?" }));
    mobile.unmount();
    matchMedia.mockReturnValue({ matches: true });
    render(<InsultGenerator {...defaultProps} />);
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "What are we roasting?" }));
    expect(submit).not.toHaveBeenCalled();
  });

  it("does not focus a desktop field below the viewport", () => {
    matchMedia.mockReturnValue({ matches: true });
    const bounds = vi.spyOn(HTMLInputElement.prototype, "getBoundingClientRect")
      .mockReturnValue({ top: 900, bottom: 960 } as DOMRect);
    try {
      render(<InsultGenerator {...defaultProps} />);
      expect(document.activeElement).not.toBe(screen.getByRole("textbox"));
    } finally {
      bounds.mockRestore();
    }
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("Jerkstore starter prompt interaction", () => {
  it("shows the chosen starter prompt without generating on mount or after idle time", () => {
    const prompt = getStarterPrompt("browser-tabs");
    render(<InsultGenerator {...defaultProps} initialTopic={prompt} />);

    const topic = screen.getByRole<HTMLInputElement>("textbox", { name: "What are we roasting?" });
    expect(topic.value).toBe(prompt);
    expect(screen.getByRole<HTMLButtonElement>("button", { name: /Generate insults/i }).disabled).toBe(false);

    act(() => vi.advanceTimersByTime(30_000));

    expect(topic.value).toBe(prompt);
    expect(submit).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps a visitor's edited topic after blur and idle time", () => {
    render(<InsultGenerator {...defaultProps} initialTopic={getStarterPrompt("coffee-order")} />);

    const topic = screen.getByRole<HTMLInputElement>("textbox", { name: "What are we roasting?" });
    act(() => topic.focus());
    fireEvent.change(topic, { target: { value: "My coffee order needs its own table of contents" } });
    act(() => screen.getByRole("combobox", { name: "Language" }).focus());
    expect(document.activeElement).not.toBe(topic);

    act(() => vi.advanceTimersByTime(30_000));

    expect(topic.value).toBe("My coffee order needs its own table of contents");
    expect(submit).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps a cleared topic empty and disables generation until it has content", () => {
    render(<InsultGenerator {...defaultProps} initialTopic={getStarterPrompt("browser-tabs")} />);

    fireEvent.click(screen.getByRole("button", { name: "Clear Input" }));
    act(() => vi.advanceTimersByTime(30_000));

    expect(screen.getByRole<HTMLInputElement>("textbox", { name: "What are we roasting?" }).value).toBe("");
    expect(screen.getByRole<HTMLButtonElement>("button", { name: /Generate insults/i }).disabled).toBe(true);
    expect(submit).not.toHaveBeenCalled();
  });

  it("labels controls and sends only the visitor's explicitly submitted choices", () => {
    render(<InsultGenerator {...defaultProps} initialTopic="My meetings have meetings" />);

    const language = screen.getByRole<HTMLSelectElement>("combobox", { name: "Language" });
    const effort = screen.getByRole<HTMLInputElement>("slider", { name: "Max Effort" });
    expect(language.value).toBe("English");
    expect(effort.getAttribute("aria-valuetext")).toBe("Standard roast pack");
    expect(screen.getByRole("button", { name: "Mild heat", pressed: true })).toBeTruthy();

    fireEvent.change(language, { target: { value: "Spanish" } });
    fireEvent.click(screen.getByRole("button", { name: "Spicy heat" }));
    expect(screen.getByRole("button", { name: "Spicy heat", pressed: true })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Mild heat", pressed: false })).toBeTruthy();
    expect(submit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /Generate insults/i }));

    expect(submit).toHaveBeenCalledExactlyOnceWith({
      language: "Spanish",
      isEmail: false,
      topic: "My meetings have meetings",
      heatLevel: "spicy",
      useReasoning: false,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("exposes the Max Effort mode in its accessible value when changed", () => {
    render(<InsultGenerator {...defaultProps} initialTopic="My alarm snooze habit" />);
    const effort = screen.getByRole<HTMLInputElement>("slider", { name: "Max Effort" });

    fireEvent.change(effort, { target: { value: "100" } });

    expect(effort.getAttribute("aria-valuetext")).toBe("Long roast");
    expect(submit).not.toHaveBeenCalled();

    fireEvent.change(effort, { target: { value: "0" } });
    expect(effort.getAttribute("aria-valuetext")).toBe("Standard roast pack");
  });

  it("keeps locked guest features from silently changing the selected heat or mode", () => {
    render(<InsultGenerator {...defaultProps} areFeaturesLocked initialTopic="My houseplant" />);

    expect(screen.getByRole<HTMLInputElement>("slider", { name: "Max Effort" }).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Nuclear heat: sign in to unlock" }));

    expect(screen.getByRole("dialog", { name: "WARNING: NUCLEAR OPTION" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Mild heat", pressed: true })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Nuclear heat: sign in to unlock", pressed: false })).toBeTruthy();
    expect(submit).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
