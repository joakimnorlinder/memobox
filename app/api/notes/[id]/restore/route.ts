import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Restore note by clearing deletedAt timestamp
    const note = await prisma.note.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        deletedAt: null,
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
          }
        },
      }
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error('Error restoring note:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
