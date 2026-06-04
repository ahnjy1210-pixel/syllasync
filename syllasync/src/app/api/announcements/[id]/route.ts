import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

async function verifyOwnership(announcementId: string, professorId: string) {
  const ann = await prisma.announcement.findUnique({
    where: { id: announcementId },
    include: { course: { select: { professorId: true } } },
  });
  if (!ann) return null;
  if (ann.course.professorId !== professorId) return null;
  return ann;
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
    const ann = await verifyOwnership(id, session.user.id as string);
    if (!ann) {
      return NextResponse.json({ error: "Announcement not found or unauthorized" }, { status: 404 });
    }

    const { title, content, attachmentUrl, attachmentName } = await req.json();
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        title: title.trim(),
        content: content.trim(),
        attachmentUrl: attachmentUrl?.trim() || null,
        attachmentName: attachmentName?.trim() || null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update announcement error:", error);
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
    const ann = await verifyOwnership(id, session.user.id as string);
    if (!ann) {
      return NextResponse.json({ error: "Announcement not found or unauthorized" }, { status: 404 });
    }

    await prisma.announcement.delete({ where: { id } });

    return NextResponse.json({ message: "Announcement deleted" });
  } catch (error) {
    console.error("Delete announcement error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
