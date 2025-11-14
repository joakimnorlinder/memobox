import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get folders with nested structure
    const folders = await prisma.folder.findMany({
      where: {
        userId: session.user.id,
        parentId: null, // Only root folders
      },
      include: {
        children: {
          include: {
            _count: {
              select: { notes: true }
            }
          },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { notes: true }
        }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(folders)
  } catch (error) {
    console.error('Error fetching folders:', error)
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
    const { name, color, icon, parentId } = body

    const folder = await prisma.folder.create({
      data: {
        name,
        color: color || "#6366f1",
        icon: icon || "folder",
        parentId: parentId || null,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { notes: true }
        }
      }
    })

    return NextResponse.json(folder)
  } catch (error) {
    console.error('Error creating folder:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
