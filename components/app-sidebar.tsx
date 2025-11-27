"use client"

import * as React from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Folder,
  Home,
  Search,
  Settings,
  Plus,
  LogOut,
  ChevronRight,
  Trash2,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { CreateFolderDialog } from "@/components/create-folder-dialog"
import { ThemeToggle } from "@/components/theme-toggle"

interface FolderWithChildren {
  id: string
  name: string
  color?: string | null
  icon?: string | null
  children?: FolderWithChildren[]
  _count?: {
    notes: number
  }
}

export function AppSidebar() {
  const { data: session } = useSession()
  const router = useRouter()
  const [folders, setFolders] = React.useState<FolderWithChildren[]>([])

  const fetchFolders = React.useCallback(() => {
    if (session?.user) {
      fetch('/api/folders')
        .then(res => res.json())
        .then(data => setFolders(data))
        .catch(console.error)
    }
  }, [session])

  React.useEffect(() => {
    fetchFolders()
  }, [fetchFolders])

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <Image
            src="/memobox_logo.png"
            alt="MemoBox Logo"
            width={32}
            height={32}
            className="rounded-lg shadow-lg shadow-primary/30"
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              MemoBox
            </span>
            <span className="text-xs text-muted-foreground">Your notes</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/notes">
                    <Home className="h-4 w-4" />
                    <span>All Notes</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/notes/trash">
                    <Trash2 className="h-4 w-4" />
                    <span>Trash</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center justify-between w-full">
              <span>Folders</span>
              <CreateFolderDialog onFolderCreated={fetchFolders} />
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {folders.map((folder) => (
                <FolderItem key={folder.id} folder={folder} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="flex-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={session?.user?.image || undefined} />
                      <AvatarFallback>
                        {session?.user?.name?.[0] || session?.user?.email?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-left">
                      <span className="text-sm font-medium truncate max-w-[120px]">
                        {session?.user?.name || session?.user?.email}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <ThemeToggle />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

function FolderItem({ folder }: { folder: FolderWithChildren }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const hasChildren = folder.children && folder.children.length > 0

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild onClick={() => hasChildren && setIsOpen(!isOpen)}>
        <a href={`/notes/folder/${folder.id}`} className="flex items-center gap-2">
          {hasChildren && (
            <ChevronRight
              className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
            />
          )}
          <Folder className="h-4 w-4" style={{ color: folder.color || undefined }} />
          <span className="flex-1">{folder.name}</span>
          {folder._count && folder._count.notes > 0 && (
            <span className="text-xs text-muted-foreground">{folder._count.notes}</span>
          )}
        </a>
      </SidebarMenuButton>
      {hasChildren && isOpen && (
        <SidebarMenuSub>
          {folder.children!.map((child) => (
            <SidebarMenuSubItem key={child.id}>
              <SidebarMenuSubButton asChild>
                <a href={`/notes/folder/${child.id}`}>
                  <Folder className="h-4 w-4" style={{ color: child.color || undefined }} />
                  <span>{child.name}</span>
                </a>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  )
}
