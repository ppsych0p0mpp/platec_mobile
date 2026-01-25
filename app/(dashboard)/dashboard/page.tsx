'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';

interface ClassInfo {
  id: string;
  name: string;
  code: string;
  subject: string | null;
}

interface AttendanceRecord {
  _id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  class: ClassInfo | null;
}

interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  total: number;
}

interface EnrolledClass {
  id: string;
  name: string;
  code: string;
  subject: string | null;
  teacher?: { name: string };
}

export default function DashboardPage() {
  const { student } = useAuth();
  const [stats, setStats] = useState<AttendanceStats>({ present: 0, absent: 0, late: 0, total: 0 });
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([]);
  const [enrolledClasses, setEnrolledClasses] = useState<EnrolledClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('student_token');
      
      // Fetch attendance
      const attendanceRes = await fetch('/api/student/attendance?limit=5', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const attendanceData = await attendanceRes.json();
      
      if (attendanceData.success) {
        setStats(attendanceData.stats);
        setRecentRecords(attendanceData.records || []);
      }

      // Fetch enrolled classes
      const classesRes = await fetch('/api/student/classes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const classesData = await classesRes.json();
      
      if (classesData.success) {
        setEnrolledClasses(classesData.classes || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const attendanceRate = stats.total > 0
    ? (((stats.present + stats.late) / stats.total) * 100).toFixed(1)
    : '0';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: 'present' | 'absent' | 'late') => {
    const variants = {
      present: 'success' as const,
      absent: 'danger' as const,
      late: 'warning' as const,
    };
    return variants[status];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-white">
          Hello, {student?.name?.split(' ')[0] || 'Student'} 👋
        </h1>
        <p className="text-slate-400 mt-1">
          {student?.course} - Year {student?.year} Section {student?.section}
        </p>
      </div>

      {/* Enrolled Classes Count */}
      <Card variant="gradient" className="animate-fade-in stagger-1 relative overflow-hidden" style={{ opacity: 0 }}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">Enrolled Classes</p>
            <p className="text-5xl font-bold text-violet-400 mt-2">{enrolledClasses.length}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-sm">Total Attendance Records</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
        </div>
      </Card>

      {/* Attendance Rate Card */}
      <Card variant="gradient" className="animate-fade-in stagger-2 relative overflow-hidden" style={{ opacity: 0 }}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-400 text-sm font-medium">Overall Attendance Rate</p>
              <p className="text-5xl font-bold text-violet-400 mt-2">{attendanceRate}%</p>
            </div>
            <Badge variant={parseFloat(attendanceRate) >= 80 ? 'success' : 'warning'}>
              {parseFloat(attendanceRate) >= 80 ? 'Good Standing' : 'Needs Improvement'}
            </Badge>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(parseFloat(attendanceRate), 100)}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="animate-fade-in stagger-3" style={{ opacity: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Present</p>
              <p className="text-3xl font-bold text-emerald-400 mt-1">{stats.present}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="animate-fade-in stagger-4" style={{ opacity: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Absent</p>
              <p className="text-3xl font-bold text-rose-400 mt-1">{stats.absent}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="animate-fade-in stagger-5" style={{ opacity: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Late</p>
              <p className="text-3xl font-bold text-amber-400 mt-1">{stats.late}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* My Classes */}
      {enrolledClasses.length > 0 && (
        <Card variant="gradient" className="animate-fade-in stagger-5" style={{ opacity: 0 }}>
          <CardHeader>
            <CardTitle>My Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {enrolledClasses.slice(0, 4).map((cls) => (
                <div
                  key={cls.id}
                  className="p-4 rounded-xl bg-slate-800/50 border border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{cls.name}</p>
                      <p className="text-sm text-slate-500">{cls.subject || 'No subject'}</p>
                    </div>
                    <code className="px-2 py-1 bg-violet-500/20 rounded text-violet-400 text-sm">
                      {cls.code}
                    </code>
                  </div>
                  {cls.teacher && (
                    <p className="text-xs text-slate-500 mt-2">Teacher: {cls.teacher.name}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Attendance */}
      <Card variant="gradient" className="animate-fade-in stagger-5" style={{ opacity: 0 }}>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          {recentRecords.length > 0 ? (
            <div className="space-y-3">
              {recentRecords.map((record) => (
                <div
                  key={record._id}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      record.status === 'present' ? 'bg-emerald-500' :
                      record.status === 'absent' ? 'bg-rose-500' : 'bg-amber-500'
                    }`} />
                    <div>
                      <span className="text-white font-medium">{formatDate(record.date)}</span>
                      {record.class && (
                        <p className="text-xs text-violet-400">{record.class.name}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={getStatusBadge(record.status)}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-8">No attendance records yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
