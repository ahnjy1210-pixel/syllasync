import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "PROFESSOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params;
    const { email } = await req.json();

    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Student email is required" }, { status: 400 });
    }

    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course || course.professorId !== session.user.id) {
      return NextResponse.json({ error: "Course not found or unauthorized" }, { status: 403 });
    }

    // Find student by email
    const student = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!student) {
      return NextResponse.json({ error: "User with this email not found" }, { status: 404 });
    }

    if (student.role !== "STUDENT") {
      return NextResponse.json({ error: "This user is not a student" }, { status: 400 });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: student.id,
          courseId
        }
      }
    });

    if (existingEnrollment) {
      return NextResponse.json({ error: "Student is already enrolled in this course" }, { status: 400 });
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: student.id,
        courseId
      },
      include: {
        user: true
      }
    });

    // Create notification for student
    await prisma.notification.create({
      data: {
        userId: student.id,
        title: "Enrolled in New Course",
        body: `You have been manually enrolled in "${course.name}" by Prof. ${session.user.name}.`,
        link: `/dashboard/student/course/${course.id}`,
        isRead: false
      }
    });

    return NextResponse.json({ message: "Student enrolled successfully", enrollment }, { status: 201 });
  } catch (error) {
    console.error("Enroll student error:", error);
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

    const { id: courseId } = await params;
    const { enrollmentId } = await req.json();

    if (!enrollmentId) {
      return NextResponse.json({ error: "Enrollment ID is required" }, { status: 400 });
    }

    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course || course.professorId !== session.user.id) {
      return NextResponse.json({ error: "Course not found or unauthorized" }, { status: 403 });
    }

    // Verify enrollment belongs to this course
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId }
    });

    if (!enrollment || enrollment.courseId !== courseId) {
      return NextResponse.json({ error: "Enrollment not found in this course" }, { status: 404 });
    }

    // Delete enrollment
    await prisma.enrollment.delete({
      where: { id: enrollmentId }
    });

    return NextResponse.json({ message: "Student unenrolled successfully" });
  } catch (error) {
    console.error("Unenroll student error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
