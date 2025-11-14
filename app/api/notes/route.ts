import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('folderId')
    const search = searchParams.get('search')

    let where: any = {
      userId: session.user.id,
    }

    if (folderId) {
      where.folderId = folderId
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        // For JSON content search, we'd need to implement full-text search
      ]
    }

    const notes = await prisma.note.findMany({
      where,
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
      },
      orderBy: [
        { isPinned: 'desc' },
        { updatedAt: 'desc' }
      ]
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, folderId } = body

    const note = await prisma.note.create({
      data: {
        title: title || "Untitled Note",
        content: content || { type: 'doc', content: [] },
        folderId: folderId || null,
        userId: session.user.id,
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
          }
        },
        todoItems: true,
      }
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
