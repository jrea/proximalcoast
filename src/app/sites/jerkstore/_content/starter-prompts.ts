// Public, authored prompts. URLs carry an ID, never a visitor's own subject.
export const starterPrompts = [
  { id: "browser-tabs", label: "Too many browser tabs", text: "Roast my habit of keeping 47 browser tabs open. Keep it playful and focus on the tabs." },
  { id: "overengineered-code", label: "Overengineered code", text: "Roast my own overengineered code: I built a microservice to choose lunch. Keep it light." },
  { id: "always-late", label: "A friend who is always late", text: "My friend agreed to a playful roast about always being five minutes late. Use an absurd comparison, no personal attacks." },
  { id: "coffee-order", label: "My complicated coffee order", text: "A playful roast of my needlessly complicated coffee order. Keep it mild." },
  { id: "group-chat", label: "An indecisive group chat", text: "A friendly roast of our group chat taking three weeks to choose a restaurant. Everyone is in on the joke." },
  { id: "meeting", label: "A meeting about meetings", text: "Roast the idea of a meeting about scheduling another meeting. Make it one dry, silly comparison." },
] as const;

export function getStarterPrompt(id: string) {
  return starterPrompts.find((prompt) => prompt.id === id)?.text;
}
