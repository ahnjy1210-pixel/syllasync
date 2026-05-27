import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "PROFESSOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Course name is required" }, { status: 400 });
    }

    let inviteCode = generateInviteCode();
    // Simple loop to ensure unique invite code
    let isUnique = false;
    while (!isUnique) {
      const existing = await prisma.course.findUnique({ where: { inviteCode } });
      if (!existing) {
        isUnique = true;
      } else {
        inviteCode = generateInviteCode();
      }
    }

    const course = await prisma.course.create({
      data: {
        name,
        description,
        inviteCode,
        professorId: session.user.id as string
      }
    });

    return NextResponse.json({ message: "Course created", course }, { status: 201 });
  } catch (error) {
    console.error("Course creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
