'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { File, FileText, Database, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: File },
  { href: '/files', label: 'Files', icon: FileText },
  { href: '/knowledge-base', label: 'Knowledge Base', icon: Database },
  { href: '/integrations', label: 'Integrations', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="w-64 border-r bg-card relative h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold">AI File Platform</h2>
      </div>
      <nav className="space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
                ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
              `}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="absolute bottom-4 left-4 right-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
