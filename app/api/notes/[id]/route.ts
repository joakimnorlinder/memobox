import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const note = await prisma.note.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null, // Exclude deleted notes
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
          }
        },
        todoItems: {
          orderBy: { order: 'asc' }
        },
      }
    })

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    return NextResponse.json(note)
  } catch (error) {
    console.error('Error fetching note:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, folderId, isPinned } = body

    // First check if note exists and is not deleted
    const existingNote = await prisma.note.findFirst({
      where: {
        id,
        userId: session.user.id,
        deletedAt: null,
      }
    })

    if (!existingNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    const note = await prisma.note.update({
      where: {
        id,
      },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(folderId !== undefined && { folderId }),
        ...(isPinned !== undefined && { isPinned }),
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
          }
        },
        todoItems: {
          orderBy: { order: 'asc' }
        },
      }
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error('Error updating note:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Soft delete by setting deletedAt timestamp
    await prisma.note.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        deletedAt: new Date(),
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
