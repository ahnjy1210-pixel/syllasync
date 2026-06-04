import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

async function checkCourseAccess(userId: string, courseId: string, role: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId }
  });
  if (!course) return null;

  if (role === "PROFESSOR") {
    return course.professorId === userId ? course : null;
  }

  // Student check
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId
      }
    }
  });
  return enrollment ? course : null;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; homeworkId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId, homeworkId } = await params;
    const role = (session.user as any).role;

    const course = await checkCourseAccess(session.user.id, courseId, role);
    if (!course) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify homework belongs to this course
    const homework = await prisma.homework.findFirst({
      where: { id: homeworkId, courseId }
    });
    if (!homework) {
      return NextResponse.json({ error: "Homework not found" }, { status: 404 });
    }

    if (role === "PROFESSOR") {
      // Return all submissions
      const submissions = await prisma.submission.findMany({
        where: { homeworkId },
        include: {
          student: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { submittedAt: "desc" }
      });
      return NextResponse.json(submissions);
    } else {
      // Return student's own submission
      const submission = await prisma.submission.findUnique({
        where: {
          homeworkId_studentId: {
            homeworkId,
            studentId: session.user.id
          }
        }
      });
      return NextResponse.json(submission ? [submission] : []);
    }
  } catch (error) {
    console.error("Fetch submissions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; homeworkId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId, homeworkId } = await params;
    const role = (session.user as any).role;

    if (role !== "STUDENT") {
      return NextResponse.json({ error: "Only students can submit homework" }, { status: 403 });
    }

    const course = await checkCourseAccess(session.user.id, courseId, role);
    if (!course) {
      return NextResponse.json({ error: "Forbidden: Not enrolled in this course" }, { status: 403 });
    }

    const { content, fileUrl, fileName } = await req.json();

    const submission = await prisma.submission.upsert({
      where: {
        homeworkId_studentId: {
          homeworkId,
          studentId: session.user.id
        }
      },
      update: {
        content: content?.trim() || null,
        fileUrl: fileUrl?.trim() || null,
        fileName: fileName?.trim() || null,
        submittedAt: new Date()
      },
      create: {
        homeworkId,
        studentId: session.user.id,
        content: content?.trim() || null,
        fileUrl: fileUrl?.trim() || null,
        fileName: fileName?.trim() || null
      }
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Create submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; homeworkId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId, homeworkId } = await params;
    const role = (session.user as any).role;

    if (role !== "PROFESSOR") {
      return NextResponse.json({ error: "Only professors can grade homework" }, { status: 403 });
    }

    const course = await checkCourseAccess(session.user.id, courseId, role);
    if (!course) {
      return NextResponse.json({ error: "Forbidden: You are not the professor of this course" }, { status: 403 });
    }

    const { studentId, grade, feedback } = await req.json();
    if (!studentId) {
      return NextResponse.json({ error: "Missing studentId" }, { status: 400 });
    }

    const submission = await prisma.submission.upsert({
      where: {
        homeworkId_studentId: {
          homeworkId,
          studentId
        }
      },
      update: {
        grade: grade?.trim() || null,
        feedback: feedback?.trim() || null,
        gradedAt: new Date()
      },
      create: {
        homeworkId,
        studentId,
        grade: grade?.trim() || null,
        feedback: feedback?.trim() || null
      }
    });

    // Send a notification to the student
    await prisma.notification.create({
      data: {
        userId: studentId,
        title: "Homework Graded",
        body: `Your submission for "${course.name}" assignment has been graded.`,
        link: `/dashboard/student/course/${courseId}`
      }
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Grade submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
