import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId, messageId } = await params;
    const { content } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Fetch the message
    const message = await prisma.message.findFirst({
      where: { id: messageId, courseId }
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Verify sender
    if (message.senderId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: You are not the sender" }, { status: 403 });
    }

    // Verify 5-minute time window (5 * 60 * 1000 = 300000ms)
    const timeDiff = Date.now() - new Date(message.timestamp).getTime();
    if (timeDiff > 300000) {
      return NextResponse.json({ error: "Time limit exceeded: Messages can only be edited within 5 minutes" }, { status: 400 });
    }

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { content: content.trim() },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
            avatar: true
          }
        }
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Edit message error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
