import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "PROFESSOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const announcements = await prisma.announcement.findMany({
    where: { course: { professorId: session.user.id as string } },
    include: { course: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(announcements);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "PROFESSOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { courseId, title, content } = await req.json();
  if (!courseId || !title || !content) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  // Verify professor owns this course
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.professorId !== session.user.id) {
    return NextResponse.json({ error: "Not authorized for this course" }, { status: 403 });
  }
  const announcement = await prisma.announcement.create({
    data: { courseId, title, content },
  });
  return NextResponse.json(announcement, { status: 201 });
}
