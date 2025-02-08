'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, Users, MessageSquare, Send, LayoutDashboard, Menu, X } from 'lucide-react';
import { Toaster } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Bots', href: '/dashboard/bots', icon: Bot },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'Mailing Lists', href: '/dashboard/mailing-lists', icon: Send },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const NavItems = () => (
    <nav className="space-y-1">
      {navigation.map((item) => (
        <Link key={item.name} href={item.href} onClick={() => setOpen(false)}>
          <Button
            variant={pathname === item.href ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start',
              pathname === item.href
                ? 'bg-muted'
                : 'hover:bg-muted'
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Button>
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="bottom-center" />
      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <Link href="/" className="flex items-center space-x-2">
                <Bot className="h-6 w-6" />
                <span className="font-bold text-xl">TG Bot Mailing</span>
              </Link>
            </div>
            <div className="mt-8 flex-1 px-2">
              <NavItems />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header with burger menu */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle>Menu</SheetTitle>
            <div className="flex flex-1 flex-col">
              <div className="flex h-16 shrink-0 items-center px-4 border-b">
                <Link href="/" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
                  <Bot className="h-6 w-6" />
                  <span className="font-bold text-xl">TG Bot Mailing</span>
                </Link>
              </div>
              <div className="flex-1 overflow-y-auto py-4 px-2">
                <NavItems />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 justify-between">
          <div className="flex flex-1">
            <Link href="/" className="flex items-center space-x-2">
              <Bot className="h-6 w-6" />
              <span className="font-bold text-xl">TG Bot Mailing</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col md:pl-64">
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}