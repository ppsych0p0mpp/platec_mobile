'use client';

import { useAuth } from '@/lib/auth';

interface MobileHeaderProps {
  title?: string;
  showGreeting?: boolean;
}

export default function MobileHeader({ title, showGreeting = false }: MobileHeaderProps) {
  const { student } = useAuth();

  if (showGreeting && student) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    
    return (
      <header className="px-5 pt-12 pb-4 safe-area-top">
        <p className="text-gray-500 text-sm">{greeting},</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-0.5">{student.name.split(' ')[0]} 👋</h1>
      </header>
    );
  }

  return (
    <header className="px-5 pt-12 pb-4 safe-area-top">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
    </header>
  );
}
