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
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: courseId } = await params;

    // Get all messages in the course
    const messages = await prisma.message.findMany({
      where: { courseId },
      select: { id: true }
    });

    if (messages.length > 0) {
      const existingViews = await prisma.messageView.findMany({
        where: {
          userId,
          messageId: { in: messages.map(m => m.id) }
        },
        select: { messageId: true }
      });

      const existingIds = new Set(existingViews.map(v => v.messageId));
      const newViews = messages
        .filter(msg => !existingIds.has(msg.id))
        .map(msg => ({
          messageId: msg.id,
          userId
        }));

      if (newViews.length > 0) {
        await prisma.messageView.createMany({
          data: newViews
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark messages read error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
