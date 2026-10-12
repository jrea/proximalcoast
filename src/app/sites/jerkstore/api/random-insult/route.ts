import { exampleRoasts } from "../../_content/example-roasts";

export function GET() {
  const example = exampleRoasts[Math.floor(Math.random() * exampleRoasts.length)];
  return Response.json({ topic: example.topic, content: example.roast, language: "English", source: "authored-example" });
}
