'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { logout } from '@/actions/auth'
import { Link2, Palette, Settings, LogOut, ExternalLink, Users, BarChart3 } from 'lucide-react'
import type { Profile } from '@/types/database'

interface DashboardNavProps {
  profile: Profile
}

const navItems = [
  { href: '/dashboard', label: 'Links', icon: Link2 },
  { href: '/subscribers', label: 'Inscritos', icon: Users },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/appearance', label: 'Aparencia', icon: Palette },
  { href: '/settings', label: 'Configuracoes', icon: Settings },
]

export function DashboardNav({ profile }: DashboardNavProps) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-bold">
            Links
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  pathname === item.href
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/${profile.username}`} target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              Ver pagina
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile.avatar_url || undefined} alt={profile.display_name || profile.username} />
                  <AvatarFallback>
                    {(profile.display_name || profile.username).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{profile.display_name || profile.username}</p>
                  <p className="text-xs text-muted-foreground">@{profile.username}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="md:hidden">
                <Link href="/dashboard">
                  <Link2 className="mr-2 h-4 w-4" />
                  Links
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="md:hidden">
                <Link href="/subscribers">
                  <Users className="mr-2 h-4 w-4" />
                  Inscritos
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="md:hidden">
                <Link href="/analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="md:hidden">
                <Link href="/appearance">
                  <Palette className="mr-2 h-4 w-4" />
                  Aparencia
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="md:hidden">
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Configuracoes
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="md:hidden" />
              <DropdownMenuItem asChild>
                <form action={logout} className="w-full">
                  <button type="submit" className="flex items-center w-full">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
