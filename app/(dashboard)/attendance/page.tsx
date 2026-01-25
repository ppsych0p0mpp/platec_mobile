'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui';

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
  remarks: string | null;
  classId: string | null;
  class: ClassInfo | null;
}

interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  total: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({ present: 0, absent: 0, late: 0, total: 0 });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecords = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('student_token');
      const response = await fetch(`/api/student/attendance?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }

      const data = await response.json();
      if (data.success) {
        setRecords(data.records || []);
        setStats(data.stats);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch records:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords(1);
  }, [fetchRecords]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'long' }),
      date: date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    };
  };

  const getStatusStyles = (status: 'present' | 'absent' | 'late') => {
    const styles = {
      present: { bg: 'bg-emerald-500/20', border: 'border-emerald-500', icon: '✓', color: 'text-emerald-400' },
      absent: { bg: 'bg-rose-500/20', border: 'border-rose-500', icon: '✕', color: 'text-rose-400' },
      late: { bg: 'bg-amber-500/20', border: 'border-amber-500', icon: '⏱', color: 'text-amber-400' },
    };
    return styles[status];
  };

  const attendanceRate = stats.total > 0
    ? (((stats.present + stats.late) / stats.total) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-white">Attendance History</h1>
        <p className="text-slate-400 mt-1">{pagination.total} total records across all classes</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in stagger-1" style={{ opacity: 0 }}>
        <Card className="text-center">
          <CardContent className="py-4">
            <p className="text-3xl font-bold text-violet-400">{attendanceRate}%</p>
            <p className="text-sm text-slate-500">Attendance Rate</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="py-4">
            <p className="text-3xl font-bold text-emerald-400">{stats.present}</p>
            <p className="text-sm text-slate-500">Present</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="py-4">
            <p className="text-3xl font-bold text-rose-400">{stats.absent}</p>
            <p className="text-sm text-slate-500">Absent</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="py-4">
            <p className="text-3xl font-bold text-amber-400">{stats.late}</p>
            <p className="text-sm text-slate-500">Late</p>
          </CardContent>
        </Card>
      </div>

      {/* Records */}
      <Card variant="gradient" className="animate-fade-in stagger-2" style={{ opacity: 0 }}>
        <CardHeader>
          <CardTitle>All Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : records.length > 0 ? (
            <>
              <div className="space-y-3">
                {records.map((record) => {
                  const { day, date } = formatDate(record.date);
                  const statusStyle = getStatusStyles(record.status);

                  return (
                    <div
                      key={record._id}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${statusStyle.bg} border ${statusStyle.border} flex items-center justify-center`}>
                          <span className={`text-lg ${statusStyle.color}`}>{statusStyle.icon}</span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{day}</p>
                          <p className="text-sm text-slate-400">{date}</p>
                          {record.class && (
                            <p className="text-xs text-violet-400 mt-1">
                              {record.class.name} ({record.class.code})
                            </p>
                          )}
                          {record.remarks && (
                            <p className="text-xs text-slate-500 mt-1 italic">{record.remarks}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant={
                            record.status === 'present' ? 'success' :
                            record.status === 'absent' ? 'danger' : 'warning'
                          }
                        >
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Badge>
                        {record.class?.subject && (
                          <span className="text-xs text-slate-500">{record.class.subject}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-800">
                  <p className="text-sm text-slate-500">
                    Page {pagination.page} of {pagination.pages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() => fetchRecords(pagination.page - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={pagination.page === pagination.pages}
                      onClick={() => fetchRecords(pagination.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-slate-500">No attendance records yet</p>
              <p className="text-slate-600 text-sm mt-1">Join a class and your attendance will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
