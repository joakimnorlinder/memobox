"use client"

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, Save, Folder as FolderIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TiptapEditor } from '@/components/editor/tiptap-editor'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDebounce } from '@/hooks/use-debounce'

interface Note {
  id: string
  title: string
  content: any
  folderId: string | null
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

export default function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [note, setNote] = useState<Note | null>(null)
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const debouncedTitle = useDebounce(title, 500)
  const debouncedContent = useDebounce(content, 500)

  useEffect(() => {
    fetchNote()
    fetchFolders()
  }, [resolvedParams.id])

  useEffect(() => {
    // Only save if note is loaded and values have actually changed
    if (!note || !debouncedContent) return

    const titleChanged = debouncedTitle !== note.title
    const contentChanged = JSON.stringify(debouncedContent) !== JSON.stringify(note.content)

    if (titleChanged || contentChanged) {
      console.log('Saving note:', { titleChanged, contentChanged })
      saveNote()
    }
  }, [debouncedTitle, debouncedContent])

  const fetchNote = async () => {
    try {
      const response = await fetch(`/api/notes/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setNote(data)
        setTitle(data.title)
        setContent(data.content)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching note:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const fetchFolders = async () => {
    try {
      const response = await fetch('/api/folders')
      if (response.ok) {
        const data = await response.json()
        // Flatten folders for selection
        const flatFolders: Folder[] = []
        const flatten = (folders: any[]) => {
          folders.forEach(folder => {
            flatFolders.push({
              id: folder.id,
              name: folder.name,
              color: folder.color
            })
            if (folder.children) flatten(folder.children)
          })
        }
        flatten(data)
        setFolders(flatFolders)
      }
    } catch (error) {
      console.error('Error fetching folders:', error)
    }
  }

  const saveNote = async () => {
    if (!note) return

    setSaving(true)
    try {
      const payload = {
        title: debouncedTitle,
        content: debouncedContent
      }
      console.log('Sending PATCH request:', payload)

      const response = await fetch(`/api/notes/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const updated = await response.json()
        console.log('Note saved successfully:', updated.id)
        // Update the note state with the saved version to prevent re-saving
        setNote(updated)
      } else {
        console.error('Failed to save note:', response.status)
      }
    } catch (error) {
      console.error('Error saving note:', error)
    } finally {
      setTimeout(() => setSaving(false), 500)
    }
  }

  const moveToFolder = async (folderId: string | null) => {
    try {
      const response = await fetch(`/api/notes/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId })
      })

      if (response.ok) {
        const data = await response.json()
        setNote(data)
      }
    } catch (error) {
      console.error('Error moving note:', error)
    }
  }

  const deleteNote = async () => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const response = await fetch(`/api/notes/${resolvedParams.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/')
      }
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading note...</div>
      </div>
    )
  }

  if (!note) {
    return null
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {note.folder && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: note.folder.color || '#6366f1' }}
              />
              {note.folder.name}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {saving && (
            <span className="text-sm text-muted-foreground">Saving...</span>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <FolderIcon className="h-4 w-4" />
                Move to folder
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => moveToFolder(null)}>
                No folder
              </DropdownMenuItem>
              {folders.map((folder) => (
                <DropdownMenuItem
                  key={folder.id}
                  onClick={() => moveToFolder(folder.id)}
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: folder.color || '#6366f1' }}
                  />
                  {folder.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="destructive"
            size="sm"
            onClick={deleteNote}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className="text-2xl font-bold border-none shadow-none px-0 mb-4 focus-visible:ring-0"
        />

        <TiptapEditor
          content={content}
          onChange={setContent}
          placeholder="Start writing your note..."
        />
      </div>
    </div>
  )
}
