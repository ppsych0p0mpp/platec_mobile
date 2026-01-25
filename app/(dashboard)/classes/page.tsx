'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input } from '@/components/ui';

interface ClassData {
  id: string;
  name: string;
  code: string;
  description: string | null;
  subject: string | null;
  schedule: string | null;
  is_active: boolean;
  enrolledAt: string;
  teacher?: { name: string };
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchClasses = useCallback(async () => {
    try {
      const token = localStorage.getItem('student_token');
      const res = await fetch('/api/student/classes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setClasses(data.classes);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    setIsJoining(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('student_token');
      const res = await fetch('/api/student/classes/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: joinCode.toUpperCase() }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setJoinCode('');
        setShowJoinForm(false);
        fetchClasses();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to join class' });
    } finally {
      setIsJoining(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white">My Classes</h1>
          <p className="text-slate-400 mt-1">View your enrolled classes</p>
        </div>
        <Button onClick={() => setShowJoinForm(!showJoinForm)}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Join Class
        </Button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-xl ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
          }`}
        >
          {message.text}
          <button
            onClick={() => setMessage(null)}
            className="float-right text-current opacity-70 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      {/* Join Class Form */}
      {showJoinForm && (
        <Card variant="gradient" className="animate-fade-in">
          <CardHeader>
            <CardTitle>Join a Class</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinClass} className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter class code (e.g., ABC123)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="font-mono text-lg tracking-widest uppercase"
                  maxLength={6}
                />
              </div>
              <Button type="submit" isLoading={isJoining}>
                Join
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowJoinForm(false)}>
                Cancel
              </Button>
            </form>
            <p className="text-sm text-slate-500 mt-3">
              Ask your teacher for the 6-character class code to join their class.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classes.map((cls, index) => (
          <Card
            key={cls.id}
            variant="gradient"
            className={`animate-fade-in stagger-${(index % 5) + 1}`}
            style={{ opacity: 0 }}
          >
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-lg">{cls.name}</CardTitle>
                <p className="text-violet-400 text-sm mt-1">{cls.subject || 'No subject'}</p>
              </div>
              <Badge variant={cls.is_active ? 'success' : 'default'}>
                {cls.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </CardHeader>
            <CardContent>
              {/* Description */}
              {cls.description && (
                <p className="text-slate-400 text-sm mb-4">{cls.description}</p>
              )}

              {/* Details */}
              <div className="space-y-2 text-sm">
                {cls.teacher && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Teacher: <span className="text-white">{cls.teacher.name}</span></span>
                  </div>
                )}
                {cls.schedule && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{cls.schedule}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Enrolled: {formatDate(cls.enrolledAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {classes.length === 0 && !showJoinForm && (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-slate-500">You haven&apos;t joined any classes yet</p>
            <p className="text-slate-600 text-sm mt-1 mb-4">
              Click &quot;Join Class&quot; and enter a code from your teacher
            </p>
            <Button onClick={() => setShowJoinForm(true)}>
              Join Your First Class
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
