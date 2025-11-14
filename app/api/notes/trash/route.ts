import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch only deleted notes (deletedAt is not null)
    const notes = await prisma.note.findMany({
      where: {
        userId: session.user.id,
        deletedAt: {
          not: null,
        },
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
          }
        },
      },
      orderBy: {
        deletedAt: 'desc',
      },
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error('Error fetching trash:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
