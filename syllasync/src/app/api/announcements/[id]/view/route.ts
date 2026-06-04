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

    const { id: announcementId } = await params;

    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId }
    });

    if (!announcement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    // Check if already viewed
    const existing = await prisma.announcementView.findUnique({
      where: {
        announcementId_userId: {
          announcementId,
          userId: session.user.id
        }
      }
    });

    if (!existing) {
      await prisma.announcementView.create({
        data: {
          announcementId,
          userId: session.user.id
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark announcement viewed error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
