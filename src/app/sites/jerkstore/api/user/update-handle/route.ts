
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { handle } = await req.json();

  if (!handle || typeof handle !== "string" || !handle.trim()) {
    return NextResponse.json({ message: "Invalid handle." }, { status: 400 });
  }

  const newHandle = handle.trim();

  // Validate length
  if (newHandle.length > 20) {
    return NextResponse.json({ message: "Handle too long (max 20 chars)." }, { status: 400 });
  }
  if (newHandle.length < 3) {
    return NextResponse.json({ message: "Handle too short (min 3 chars)." }, { status: 400 });
  }

  // Validate characters (alphanumeric + underscore/dash)
  if (!/^[a-zA-Z0-9_-]+$/.test(newHandle)) {
    return NextResponse.json({ message: "Handle can only contain letters, numbers, and underscores." }, { status: 400 });
  }

  // Check uniqueness
  const existingUser = await prisma.user.findFirst({
    where: {
      name: {
        equals: newHandle,
        mode: 'insensitive', // Case insensitive check
      },
      id: {
        not: session.user.id
      }
    }
  });

  if (existingUser) {
    return NextResponse.json({ message: "Handle already taken. Try another." }, { status: 409 });
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: newHandle },
    });
    return NextResponse.json({ success: true, handle: newHandle });
  } catch (error) {
    console.error("Failed to update handle:", error);
    return NextResponse.json({ message: "Failed to save handle." }, { status: 500 });
  }
}
