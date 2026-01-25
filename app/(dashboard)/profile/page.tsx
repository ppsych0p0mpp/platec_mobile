'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';

export default function ProfilePage() {
  const { student, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      router.push('/login');
    }
  };

  const profileInfo = [
    { label: 'Student ID', value: student?.studentId || '-' },
    { label: 'Email', value: student?.email || '-' },
    { label: 'Course', value: student?.course || '-' },
    { label: 'Year', value: student?.year?.toString() || '-' },
    { label: 'Section', value: student?.section || '-' },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        <p className="text-slate-400 mt-1">Your student information</p>
      </div>

      {/* Avatar Section */}
      <Card variant="gradient" className="animate-fade-in stagger-1" style={{ opacity: 0 }}>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-violet-500/25">
            {student?.name?.charAt(0).toUpperCase() || 'S'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{student?.name || 'Student'}</h2>
            <p className="text-violet-400 font-medium">{student?.studentId}</p>
            <p className="text-slate-400 text-sm mt-1">
              {student?.course} - Year {student?.year} Section {student?.section}
            </p>
          </div>
        </div>
      </Card>

      {/* Profile Info */}
      <Card variant="gradient" className="animate-fade-in stagger-2" style={{ opacity: 0 }}>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profileInfo.map((item, index) => (
              <div
                key={item.label}
                className={`flex items-center justify-between py-3 ${
                  index < profileInfo.length - 1 ? 'border-b border-slate-800' : ''
                }`}
              >
                <span className="text-slate-400">{item.label}</span>
                <span className="text-white font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card className="animate-fade-in stagger-3" style={{ opacity: 0 }}>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-400">Application</span>
              <span className="text-white">SAMS Student Portal</span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-slate-800">
              <span className="text-slate-400">Version</span>
              <span className="text-white">1.0.0</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logout Button */}
      <Button
        variant="danger"
        size="lg"
        className="w-full animate-fade-in stagger-4"
        style={{ opacity: 0 }}
        onClick={handleLogout}
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Logout
      </Button>
    </div>
  );
}
