"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RotateCcw, Trash2 as TrashIcon, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Note {
  id: string
  title: string
  content: any
  deletedAt: string
  folder?: {
    id: string
    name: string
    color: string | null
  } | null
}

export default function TrashPage() {
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrash()
  }, [])

  const fetchTrash = async () => {
    try {
      const response = await fetch('/api/notes/trash')
      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      }
    } catch (error) {
      console.error('Error fetching trash:', error)
    } finally {
      setLoading(false)
    }
  }

  const restoreNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}/restore`, {
        method: 'POST'
      })

      if (response.ok) {
        fetchTrash()
      }
    } catch (error) {
      console.error('Error restoring note:', error)
    }
  }

  const permanentlyDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to permanently delete this note? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/notes/${noteId}/permanent`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchTrash()
      }
    } catch (error) {
      console.error('Error permanently deleting note:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading trash...</div>
      </div>
    )
  }

  return (
    <div className="h-full">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 bg-gradient-to-r from-destructive via-accent to-primary bg-clip-text text-transparent">
              <TrashIcon className="h-8 w-8 text-destructive" />
              Trash
            </h1>
            <p className="text-muted-foreground mt-2">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'} in trash
            </p>
          </div>
        </div>

        {notes.length > 0 && (
          <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-medium mb-1">Notes in trash</p>
              <p className="text-muted-foreground">
                Notes will be permanently deleted after 30 days. You can restore them or delete them permanently at any time.
              </p>
            </div>
          </div>
        )}
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <TrashIcon className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Trash is empty</h3>
          <p className="text-muted-foreground">
            Deleted notes will appear here
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <TrashNoteCard
              key={note.id}
              note={note}
              onRestore={restoreNote}
              onPermanentDelete={permanentlyDeleteNote}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function TrashNoteCard({
  note,
  onRestore,
  onPermanentDelete,
}: {
  note: Note
  onRestore: (id: string) => void
  onPermanentDelete: (id: string) => void
}) {
  const getPreviewText = (content: any): string => {
    if (!content?.content) return ''
    const text = content.content
      .map((node: any) => {
        if (node.type === 'paragraph' && node.content) {
          return node.content.map((c: any) => c.text || '').join('')
        }
        return ''
      })
      .filter(Boolean)
      .join(' ')
    return text.substring(0, 150)
  }

  const getDeletedTime = (deletedAt: string): string => {
    const date = new Date(deletedAt)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60))
        return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    }
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  }

  return (
    <Card className="opacity-75 hover:opacity-100 transition-all duration-300 hover:shadow-lg hover:shadow-destructive/10 border-2 border-border hover:border-destructive/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{note.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {note.folder && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span
                    className="inline-block w-2 h-2 rounded-full shadow-lg"
                    style={{
                      backgroundColor: note.folder.color || '#6366f1',
                      boxShadow: `0 0 8px ${note.folder.color || '#6366f1'}40`
                    }}
                  />
                  {note.folder.name}
                </div>
              )}
              <span className="text-xs text-muted-foreground">
                Deleted {getDeletedTime(note.deletedAt)}
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-secondary/20 hover:text-secondary transition-all"
              onClick={() => onRestore(note.id)}
              title="Restore"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all"
              onClick={() => onPermanentDelete(note.id)}
              title="Delete permanently"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {getPreviewText(note.content) || 'Empty note'}
        </p>
      </CardContent>
    </Card>
  )
}
