"use client"

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Pin, Trash2, MoreVertical, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { toast } from 'sonner'

interface Note {
  id: string
  title: string
  content: any
  isPinned: boolean
  updatedAt: string
  folder?: {
    id: string
    name: string
    color: string | null
  } | null
}

interface Folder {
  id: string
  name: string
  color: string | null
}

export default function FolderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [folder, setFolder] = useState<Folder | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; noteId: string | null }>({
    open: false,
    noteId: null
  })

  useEffect(() => {
    fetchFolder()
    fetchNotes()
  }, [resolvedParams.id])

  const fetchFolder = async () => {
    try {
      const response = await fetch(`/api/folders/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setFolder(data)
      }
    } catch (error) {
      console.error('Error fetching folder:', error)
    }
  }

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/notes?folderId=${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const createNote = async () => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled Note',
          content: { type: 'doc', content: [] },
          folderId: resolvedParams.id
        })
      })

      if (response.ok) {
        const note = await response.json()
        router.push(`/notes/note/${note.id}`)
      }
    } catch (error) {
      console.error('Error creating note:', error)
    }
  }

  const togglePin = async (noteId: string, isPinned: boolean) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !isPinned })
      })

      if (response.ok) {
        toast.success(isPinned ? 'Note unpinned' : 'Note pinned')
        fetchNotes()
      } else {
        toast.error('Failed to update note')
      }
    } catch (error) {
      console.error('Error updating note:', error)
      toast.error('Failed to update note. Please try again.')
    }
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.noteId) return

    try {
      const response = await fetch(`/api/notes/${deleteConfirm.noteId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Note deleted successfully')
        fetchNotes()
      } else {
        toast.error('Failed to delete note')
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      toast.error('Failed to delete note. Please try again.')
    }
  }

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pinnedNotes = filteredNotes.filter(note => note.isPinned)
  const regularNotes = filteredNotes.filter(note => !note.isPinned)

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading notes...</div>
      </div>
    )
  }

  return (
    <div className="h-full">
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, noteId: null })}
        onConfirm={confirmDelete}
        title="Delete Note"
        description="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />

      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/notes')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          {folder && (
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: folder.color || '#6366f1' }}
              />
              <h1 className="text-3xl font-bold tracking-tight">{folder.name}</h1>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </p>
          <Button onClick={createNote} size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            New Note
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Plus className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No notes in this folder</h3>
          <p className="text-muted-foreground mb-4">
            Create your first note in this folder
          </p>
          <Button onClick={createNote}>Create Note</Button>
        </div>
      ) : (
        <div className="space-y-8">
          {pinnedNotes.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                <Pin className="h-4 w-4" />
                Pinned
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onTogglePin={togglePin}
                    onDelete={(noteId) => setDeleteConfirm({ open: true, noteId })}
                  />
                ))}
              </div>
            </div>
          )}

          {regularNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && (
                <h2 className="text-sm font-semibold text-muted-foreground mb-4">
                  All Notes
                </h2>
              )}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {regularNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onTogglePin={togglePin}
                    onDelete={(noteId) => setDeleteConfirm({ open: true, noteId })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function NoteCard({
  note,
  onTogglePin,
  onDelete,
}: {
  note: Note
  onTogglePin: (id: string, isPinned: boolean) => void
  onDelete: (id: string) => void
}) {
  const router = useRouter()

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

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => router.push(`/notes/note/${note.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{note.title}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                onTogglePin(note.id, note.isPinned)
              }}>
                <Pin className="mr-2 h-4 w-4" />
                {note.isPinned ? 'Unpin' : 'Pin'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(note.id)
                }}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {getPreviewText(note.content) || 'Empty note'}
        </p>
        <p className="text-xs text-muted-foreground mt-3">
          {new Date(note.updatedAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  )
}
