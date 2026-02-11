'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import MobileHeader from '@/components/MobileHeader';

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  remarks?: string;
  class_name?: string;
  class_code?: string;
}

interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  total: number;
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({ present: 0, absent: 0, late: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'present' | 'absent' | 'late'>('all');

  useEffect(() => {
    async function fetchAttendance() {
      try {
        const response = await api.get<{
          success: boolean;
          records: AttendanceRecord[];
          stats: AttendanceStats;
        }>('/student/attendance?limit=100');

        if (response.success && response.data) {
          setRecords(response.data.records || []);
          setStats(response.data.stats || { present: 0, absent: 0, late: 0, total: 0 });
        }
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAttendance();
  }, []);

  const filteredRecords = filter === 'all' 
    ? records 
    : records.filter(r => r.status === filter);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
    };
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'present': return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' };
      case 'absent': return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
      case 'late': return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  const attendanceRate = stats.total ? Math.round((stats.present / stats.total) * 100) : 0;

  if (isLoading) {
    return (
      <div className="px-5 pt-12 safe-area-top">
        <div className="h-10 w-40 skeleton rounded-lg mb-6" />
        <div className="h-24 skeleton rounded-2xl mb-6" />
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-20 skeleton rounded-full" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="hide-scrollbar">
      <MobileHeader title="Attendance" />

      <div className="px-5 space-y-5 pb-6">
        {/* Summary Card */}
        <div className="p-5 rounded-2xl bg-gray-100 border border-gray-200 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm">Attendance Rate</p>
              <p className="text-3xl font-bold text-gray-900">{attendanceRate}%</p>
            </div>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              attendanceRate >= 80 ? 'bg-emerald-100' : attendanceRate >= 60 ? 'bg-amber-100' : 'bg-red-100'
            }`}>
              <span className={`text-2xl font-bold ${
                attendanceRate >= 80 ? 'text-emerald-600' : attendanceRate >= 60 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {attendanceRate >= 80 ? '👍' : attendanceRate >= 60 ? '⚠️' : '⚠️'}
              </span>
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-emerald-600">{stats.present} Present</span>
            <span className="text-gray-400">•</span>
            <span className="text-red-600">{stats.absent} Absent</span>
            <span className="text-gray-400">•</span>
            <span className="text-amber-600">{stats.late} Late</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar animate-fade-in stagger-1">
          {(['all', 'present', 'absent', 'late'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all touch-feedback ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 border border-gray-300'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && (
                <span className="ml-1.5 opacity-70">
                  ({status === 'present' ? stats.present : status === 'absent' ? stats.absent : stats.late})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Records List */}
        <div className="space-y-3 animate-fade-in stagger-2">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => {
              const date = formatDate(record.date);
              const styles = getStatusStyles(record.status);
              
              return (
                <div
                  key={record.id}
                  className={`flex items-center gap-4 p-4 rounded-2xl bg-gray-100 border ${styles.border}`}
                >
                  {/* Date */}
                  <div className="text-center min-w-[50px]">
                    <p className="text-2xl font-bold text-gray-900">{date.day}</p>
                    <p className="text-xs text-gray-600">{date.month}</p>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-12 bg-gray-300" />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {record.class_name || 'Class Session'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {date.weekday}
                      {record.class_code && ` • ${record.class_code}`}
                    </p>
                    {record.remarks && (
                      <p className="text-xs text-gray-600 mt-1 truncate">{record.remarks}</p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className={`px-3 py-1.5 rounded-full ${styles.bg}`}>
                    <span className={`text-xs font-semibold capitalize ${styles.text}`}>
                      {record.status}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 rounded-2xl bg-slate-900/40 border border-slate-800/50">
              <svg className="w-16 h-16 mx-auto text-slate-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-slate-500">No {filter === 'all' ? '' : filter + ' '}records found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
