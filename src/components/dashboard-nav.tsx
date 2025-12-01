'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { LayoutDashboard, Calendar, Bot, Cog, ListMusic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudents } from '@/contexts/StudentsContext';

export function DashboardNav() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { currentUser } = useStudents();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher', 'student'] },
    { href: '/schedule', label: 'Schedule', icon: Calendar, roles: ['admin', 'teacher', 'student'] },
    {
      href: '/practice-plan-generator',
      label: 'AI Practice Planner',
      icon: Bot,
      roles: ['admin', 'teacher'],
    },
     // This will be a placeholder, the real link is dynamic from student page
    { href: '#', label: 'Record Lesson', icon: ListMusic, roles: ['admin', 'teacher'], disabled: true },
    { href: '/settings', label: 'Settings', icon: Cog, roles: ['admin', 'teacher', 'student'] },
  ];

  const visibleNavItems = navItems.filter(item => currentUser && item.roles.includes(currentUser.role));


  return (
    <SidebarMenu>
      {visibleNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith(item.href) && item.href !== '#'}
            className={cn('w-full justify-start', item.disabled && "opacity-50 cursor-not-allowed")}
            onClick={() => !item.disabled && setOpenMobile(false)}
            disabled={item.disabled}
          >
            <Link href={item.disabled ? '#' : item.href}>
              <item.icon className="h-5 w-5 mr-3" />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
