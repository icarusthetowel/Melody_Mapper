'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { LayoutDashboard, Calendar, Bot, Cog } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  {
    href: '/practice-plan-generator',
    label: 'AI Practice Planner',
    icon: Bot,
  },
  { href: '/settings', label: 'Settings', icon: Cog },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            className={cn('w-full justify-start')}
            onClick={() => setOpenMobile(false)}
          >
            <Link href={item.href}>
              <item.icon className="h-5 w-5 mr-3" />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
