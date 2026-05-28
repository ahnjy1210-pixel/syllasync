const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // --- PROFESSOR ---
  const professorEmail = "ahnjy1210@gmail.com";
  let professor = await prisma.user.findUnique({ where: { email: professorEmail } });
  if (!professor) {
    professor = await prisma.user.create({
      data: { name: "Professor Ahn", email: professorEmail, passwordHash: "123456789", role: "PROFESSOR" }
    });
    console.log("Created professor:", professor.email);
  } else {
    professor = await prisma.user.update({
      where: { email: professorEmail },
      data: { passwordHash: "123456789", role: "PROFESSOR" }
    });
    console.log("Updated professor:", professor.email);
  }

  // --- STUDENT ---
  const studentEmail = "student@wsu.ac.kr";
  let student = await prisma.user.findUnique({ where: { email: studentEmail } });
  if (!student) {
    student = await prisma.user.create({
      data: { name: "Kim Ji-hoon", email: studentEmail, passwordHash: "student123", role: "STUDENT" }
    });
    console.log("Created student:", student.email);
  }

  // --- COURSE ---
  let course = await prisma.course.findFirst({ where: { professorId: professor.id } });
  if (!course) {
    course = await prisma.course.create({
      data: {
        name: "Advanced Software Engineering",
        description: "Core principles of software design, patterns, and team development workflows.",
        professorId: professor.id,
        inviteCode: "ASE2026",
      }
    });
    console.log("Created course:", course.name);
  }

  // --- ENROLLMENT ---
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: student.id, courseId: course.id } }
  });
  if (!existingEnrollment) {
    await prisma.enrollment.create({ data: { userId: student.id, courseId: course.id } });
    console.log("Enrolled student in course");
  }

  // --- LESSONS ---
  const lessonCount = await prisma.lesson.count({ where: { courseId: course.id } });
  if (lessonCount === 0) {
    await prisma.lesson.createMany({
      data: [
        { courseId: course.id, title: "Introduction to Software Architecture", startTime: new Date("2026-06-02T09:00:00"), endTime: new Date("2026-06-02T10:30:00"), room: "Room 302, W1" },
        { courseId: course.id, title: "Design Patterns in Practice", startTime: new Date("2026-06-09T09:00:00"), endTime: new Date("2026-06-09T10:30:00"), room: "Room 302, W1" },
        { courseId: course.id, title: "Agile & Scrum Methodologies", startTime: new Date("2026-06-16T09:00:00"), endTime: new Date("2026-06-16T10:30:00"), room: "Room 302, W1", isCancelled: false },
      ]
    });
    console.log("Created sample lessons");
  }

  // --- HOMEWORK ---
  const hwCount = await prisma.homework.count({ where: { courseId: course.id } });
  if (hwCount === 0) {
    await prisma.homework.createMany({
      data: [
        { courseId: course.id, title: "Lab 1: UML Diagrams", description: "Create a class diagram for a simple e-commerce system. Export as PDF.", dueDate: new Date("2026-06-05T23:59:00") },
        { courseId: course.id, title: "Lab 2: Singleton Pattern", description: "Implement a thread-safe Singleton in Java and write a brief analysis.", dueDate: new Date("2026-06-12T23:59:00") },
      ]
    });
    console.log("Created sample homework");
  }

  // --- ANNOUNCEMENT ---
  const announcementCount = await prisma.announcement.count({ where: { courseId: course.id } });
  if (announcementCount === 0) {
    await prisma.announcement.create({
      data: {
        courseId: course.id,
        title: "Welcome to Advanced Software Engineering!",
        content: "Please review the syllabus before our first class on June 2nd. Office hours are Tuesdays 2–4 PM via Zoom.",
      }
    });
    console.log("Created sample announcement");
  }

  // --- NOTIFICATIONS ---
  const notifCount = await prisma.notification.count({ where: { userId: professor.id } });
  if (notifCount === 0) {
    await prisma.notification.createMany({
      data: [
        { userId: professor.id, title: "New Enrollment", body: "Kim Ji-hoon has joined Advanced Software Engineering.", link: `/dashboard/professor/course/${course.id}`, isRead: false },
        { userId: professor.id, title: "Homework Deadline Soon", body: "Lab 1: UML Diagrams is due in 2 days.", link: `/dashboard/professor/course/${course.id}`, isRead: false },
        { userId: professor.id, title: "New Chat Message", body: "Kim Ji-hoon sent a message in ASE2026.", link: `/dashboard/professor/chat`, isRead: true },
      ]
    });
    console.log("Created sample notifications");
  }

  console.log("\n✅ Seed complete!");
  console.log("  Professor → ahnjy1210@gmail.com / 123456789");
  console.log("  Student   → student@wsu.ac.kr   / student123");
  console.log(`  Course    → ${course.name} (Invite: ${course.inviteCode})`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });



