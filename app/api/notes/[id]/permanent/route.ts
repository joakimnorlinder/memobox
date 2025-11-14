import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    // Permanently delete note (hard delete)
    await prisma.note.delete({
      where: {
        id,
        userId: session.user.id,
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error permanently deleting note:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
