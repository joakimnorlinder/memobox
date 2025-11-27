"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface CreateFolderDialogProps {
  onFolderCreated?: () => void
}

export function CreateFolderDialog({ onFolderCreated }: CreateFolderDialogProps) {
  const [open, setOpen] = useState(false)
  const [folderName, setFolderName] = useState("")
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!folderName.trim()) return

    setCreating(true)
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: folderName.trim(),
          color: '#6366f1',
          icon: 'folder',
        })
      })

      if (response.ok) {
        toast.success('Folder created successfully')
        setFolderName("")
        setOpen(false)
        onFolderCreated?.()
      } else {
        toast.error('Failed to create folder')
      }
    } catch (error) {
      console.error('Error creating folder:', error)
      toast.error('Failed to create folder. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          aria-label="Create new folder"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>
            Create a new folder to organize your notes
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <label htmlFor="folder-name" className="text-sm font-medium">
            Folder name
          </label>
          <Input
            id="folder-name"
            placeholder="e.g., Personal Notes"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !creating) {
                handleCreate()
              }
            }}
            aria-invalid={folderName.trim().length === 0 && folderName.length > 0}
            autoFocus
          />
          {folderName.trim().length === 0 && folderName.length > 0 && (
            <p className="text-sm text-destructive">
              Folder name cannot be empty
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={creating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={creating || !folderName.trim()}
          >
            {creating ? 'Creating...' : 'Create Folder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
