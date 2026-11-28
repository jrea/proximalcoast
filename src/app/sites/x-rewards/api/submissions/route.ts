import { NextRequest, NextResponse } from "next/server";
import { validateSubmission, queueStatus } from "../../../../../../sideprojects/x-rewards/lib/submissions.mjs";
import { submissionStore } from "../../../../../../sideprojects/x-rewards/lib/submission-store.mjs";

export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET() {
  try {
    const store = submissionStore();
    const stats = store ? await store.stats() : queueStatus;
    return NextResponse.json(stats, { status: 200, headers: NO_STORE });
  } catch {
    return NextResponse.json(queueStatus, { status: 200, headers: NO_STORE });
  }
}

export async function POST(req: NextRequest) {
  const size = Number(req.headers.get("content-length") || 0);
  if (size > 1000) {
    return new NextResponse(null, { status: 413, headers: NO_STORE });
  }

  let submission;
  try {
    const raw = await req.text();
    if (Buffer.byteLength(raw, "utf8") > 1000) {
      return new NextResponse(null, { status: 413, headers: NO_STORE });
    }
    const body = JSON.parse(raw);
    submission = validateSubmission(body);
  } catch {
    return NextResponse.json(
      { error: "Send payoutUrl and impressionsUrl as public X post URLs, with optIn: true." },
      { status: 400, headers: NO_STORE },
    );
  }

  try {
    const store = submissionStore();
    if (store) {
      const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined;
      const outcome = await store.enqueue(submission, ip);
      if (outcome === "accepted") {
        return NextResponse.json({ status: "queued" }, { status: 202, headers: NO_STORE });
      }
      if (outcome === "rate-limited") {
        return NextResponse.json(
          { error: "Submission limit reached. Try tomorrow." },
          { status: 429, headers: { ...NO_STORE, "Retry-After": "86400" } },
        );
      }
    }
  } catch {
    // Fail closed: never log user inputs or connection information.
  }

  return NextResponse.json(
    { error: "Submission queue is not open. No submission was confirmed." },
    { status: 503, headers: NO_STORE },
  );
}
