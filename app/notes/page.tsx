"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Pin, Trash2, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  isPinned: boolean
  updatedAt: string
  folder?: {
    id: string
    name: string
    color: string | null
  } | null
}

export default function HomePage() {
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes')
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
          content: { type: 'doc', content: [] }
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
        fetchNotes()
      }
    } catch (error) {
      console.error('Error updating note:', error)
    }
  }

  const deleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchNotes()
      }
    } catch (error) {
      console.error('Error deleting note:', error)
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
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              All Notes
            </h1>
            <p className="text-muted-foreground">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </p>
          </div>
          <Button
            onClick={createNote}
            size="lg"
            className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            New Note
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-colors"
          />
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Plus className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No notes yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first note to get started
          </p>
          <Button onClick={createNote}>Create Note</Button>
        </div>
      ) : (
        <div className="space-y-8">
          {pinnedNotes.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                <Pin className="h-4 w-4 fill-primary" />
                Pinned
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onTogglePin={togglePin}
                    onDelete={deleteNote}
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
                    onDelete={deleteNote}
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
      className={`cursor-pointer hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:scale-[1.02] border-2 ${
        note.isPinned
          ? 'border-primary/30 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent'
          : 'border-border hover:border-primary/50 bg-gradient-to-br from-card via-card to-muted/20'
      }`}
      onClick={() => router.push(`/notes/note/${note.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className={`text-lg truncate ${note.isPinned ? 'text-primary' : ''}`}>
              {note.title}
            </CardTitle>
            {note.folder && (
              <CardDescription className="flex items-center gap-1 mt-1">
                <span
                  className="inline-block w-2 h-2 rounded-full shadow-lg"
                  style={{
                    backgroundColor: note.folder.color || '#6366f1',
                    boxShadow: `0 0 8px ${note.folder.color || '#6366f1'}40`
                  }}
                />
                {note.folder.name}
              </CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary">
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
                className="text-destructive hover:bg-destructive/10"
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
