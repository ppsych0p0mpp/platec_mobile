'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import MobileHeader from '@/components/MobileHeader';

interface ClassInfo {
  id: string;
  name: string;
  code: string;
  subject: string | null;
  schedule: string | null;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  class_name?: string;
  class_code?: string;
}

interface DashboardData {
  myClasses: ClassInfo[];
  recentAttendance: AttendanceRecord[];
  stats: {
    present: number;
    absent: number;
    late: number;
    total: number;
  };
}

export default function DashboardPage() {
  const { student } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [classesRes, attendanceRes] = await Promise.all([
          api.get<{ success: boolean; classes: ClassInfo[] }>('/student/classes'),
          api.get<{ success: boolean; records: AttendanceRecord[]; stats: DashboardData['stats'] }>('/student/attendance?limit=5'),
        ]);

        setData({
          myClasses: classesRes.data?.classes || [],
          recentAttendance: attendanceRes.data?.records || [],
          stats: attendanceRes.data?.stats || { present: 0, absent: 0, late: 0, total: 0 },
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const attendanceRate = data?.stats.total 
    ? Math.round((data.stats.present / data.stats.total) * 100) 
    : 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'text-emerald-400 bg-emerald-500/10';
      case 'absent': return 'text-red-400 bg-red-500/10';
      case 'late': return 'text-amber-400 bg-amber-500/10';
      default: return 'text-slate-400 bg-slate-500/10';
    }
  };

  if (isLoading) {
    return (
      <div className="px-5 pt-12 safe-area-top">
        <div className="h-8 w-32 skeleton rounded-lg mb-2" />
        <div className="h-10 w-48 skeleton rounded-lg mb-8" />
        <div className="h-40 skeleton rounded-3xl mb-6" />
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="hide-scrollbar">
      <MobileHeader showGreeting />

      <div className="px-5 space-y-6 pb-6">
        {/* Attendance Rate Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-6 animate-fade-in">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative">
            <p className="text-violet-200 text-sm font-medium mb-1">Overall Attendance</p>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-5xl font-bold text-white">{attendanceRate}</span>
              <span className="text-2xl text-violet-200 mb-1">%</span>
            </div>
            
            {/* Progress bar */}
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${attendanceRate}%` }}
              />
            </div>
            
            <p className="text-violet-200 text-sm mt-3">
              {data?.stats.present || 0} present out of {data?.stats.total || 0} classes
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 animate-fade-in stagger-1">
          <div className="stat-present rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{data?.stats.present || 0}</p>
            <p className="text-xs text-slate-400 mt-1">Present</p>
          </div>
          <div className="stat-absent rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{data?.stats.absent || 0}</p>
            <p className="text-xs text-slate-400 mt-1">Absent</p>
          </div>
          <div className="stat-late rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">{data?.stats.late || 0}</p>
            <p className="text-xs text-slate-400 mt-1">Late</p>
          </div>
        </div>

        {/* My Classes */}
        {data?.myClasses && data.myClasses.length > 0 && (
          <div className="animate-fade-in stagger-2">
            <h2 className="text-lg font-semibold text-white mb-3">My Classes</h2>
            <div className="space-y-3">
              {data.myClasses.slice(0, 3).map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/50"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">{cls.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{cls.name}</p>
                    <p className="text-sm text-slate-400 truncate">
                      {cls.subject || cls.schedule || `Code: ${cls.code}`}
                    </p>
                  </div>
                  <code className="text-xs text-violet-400 bg-violet-500/10 px-2 py-1 rounded-lg flex-shrink-0">
                    {cls.code}
                  </code>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Attendance */}
        <div className="animate-fade-in stagger-3">
          <h2 className="text-lg font-semibold text-white mb-3">Recent Attendance</h2>
          
          {data?.recentAttendance && data.recentAttendance.length > 0 ? (
            <div className="space-y-2">
              {data.recentAttendance.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusColor(record.status)}`}>
                      {record.status === 'present' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {record.status === 'absent' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      {record.status === 'late' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">
                        {record.class_name || 'Class'}
                      </p>
                      <p className="text-xs text-slate-500">{formatDate(record.date)}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 rounded-2xl bg-slate-900/40 border border-slate-800/50">
              <svg className="w-12 h-12 mx-auto text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-slate-500 text-sm">No attendance records yet</p>
            </div>
          )}
        </div>

        {/* Student Info */}
        {student && (
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/50 animate-fade-in stagger-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{student.name.charAt(0)}</span>
              </div>
              <div>
                <p className="font-medium text-white">{student.name}</p>
                <p className="text-sm text-slate-400">
                  {student.course} • Year {student.year} - {student.section}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
