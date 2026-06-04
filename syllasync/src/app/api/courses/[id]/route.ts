import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "PROFESSOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params;
    const { name, description, syllabusUrl, lessons } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Course name is required" }, { status: 400 });
    }

    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course || course.professorId !== session.user.id) {
      return NextResponse.json({ error: "Course not found or unauthorized" }, { status: 403 });
    }

    // Update course details
    await prisma.course.update({
      where: { id: courseId },
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        syllabusUrl: syllabusUrl ? syllabusUrl.trim() : null,
      }
    });

    // Sync lessons if provided
    if (Array.isArray(lessons)) {
      // 1. Get existing lessons to identify which ones to delete
      const existingLessons = await prisma.lesson.findMany({
        where: { courseId },
        select: { id: true }
      });
      const existingIds = existingLessons.map(l => l.id);

      const payloadIds = lessons.map(l => l.id).filter(Boolean) as string[];

      // Identify deleted lessons
      const idsToDelete = existingIds.filter(id => !payloadIds.includes(id));
      if (idsToDelete.length > 0) {
        await prisma.lesson.deleteMany({
          where: { id: { in: idsToDelete } }
        });
      }

      // Upsert (create or update) lessons
      for (const lesson of lessons) {
        const lessonData = {
          courseId,
          title: lesson.title.trim(),
          startTime: new Date(lesson.startTime),
          endTime: new Date(lesson.endTime),
          room: lesson.room ? lesson.room.trim() : null,
          notes: lesson.notes ? lesson.notes.trim() : null,
          isCancelled: !!lesson.isCancelled
        };

        if (lesson.id && existingIds.includes(lesson.id)) {
          await prisma.lesson.update({
            where: { id: lesson.id },
            data: lessonData
          });
        } else {
          await prisma.lesson.create({
            data: lessonData
          });
        }
      }
    }

    return NextResponse.json({ message: "Course updated successfully" });
  } catch (error) {
    console.error("Update course error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
