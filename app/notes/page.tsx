"use client"

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Pin, Trash2, MoreVertical, X } from 'lucide-react'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
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
import { Skeleton } from '@/components/ui/skeleton'
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

export default function HomePage() {
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; noteId: string | null }>({
    open: false,
    noteId: null
  })
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewNote: () => createNote(),
    onSearch: () => searchInputRef.current?.focus()
  })

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes')
      if (response.ok) {
        const data = await response.json()
        setNotes(data)
      } else {
        toast.error('Failed to load notes')
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
      toast.error('Failed to load notes. Please try again.')
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
        toast.success('Note created successfully')
        router.push(`/notes/note/${note.id}`)
      } else {
        toast.error('Failed to create note')
      }
    } catch (error) {
      console.error('Error creating note:', error)
      toast.error('Failed to create note. Please try again.')
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

  const deleteNote = async (noteId: string) => {
    setDeleteConfirm({ open: true, noteId })
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
      <div className="h-full">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-11 w-32" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-2">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-4/6 mb-3" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
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
            title="New Note (⌘N)"
          >
            <Plus className="h-4 w-4" />
            New Note
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
          <Input
            ref={searchInputRef}
            placeholder="Search notes... (⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 border-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-colors"
            aria-label="Search notes"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {searchQuery && (
          <p className="text-sm text-muted-foreground mt-2">
            Found {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
          </p>
        )}
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
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                aria-label={`Options for ${note.title}`}
              >
                <MoreVertical className="h-4 w-4" aria-hidden="true" />
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
