import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

async function verifyOwnership(homeworkId: string, professorId: string) {
  const hw = await prisma.homework.findUnique({
    where: { id: homeworkId },
    include: { course: { select: { professorId: true } } },
  });
  if (!hw) return null;
  if (hw.course.professorId !== professorId) return null;
  return hw;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "PROFESSOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const hw = await verifyOwnership(id, session.user.id as string);
    if (!hw) {
      return NextResponse.json({ error: "Homework not found or unauthorized" }, { status: 404 });
    }

    const { title, description, dueDate } = await req.json();
    if (!title?.trim() || !dueDate) {
      return NextResponse.json({ error: "Title and due date are required" }, { status: 400 });
    }

    const updated = await prisma.homework.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        dueDate: new Date(dueDate),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update homework error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "PROFESSOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const hw = await verifyOwnership(id, session.user.id as string);
    if (!hw) {
      return NextResponse.json({ error: "Homework not found or unauthorized" }, { status: 404 });
    }

    await prisma.homework.delete({ where: { id } });

    return NextResponse.json({ message: "Homework deleted" });
  } catch (error) {
    console.error("Delete homework error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
