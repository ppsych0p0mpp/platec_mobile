'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import MobileHeader from '@/components/MobileHeader';

interface ClassInfo {
  id: string;
  name: string;
  code: string;
  description: string | null;
  subject: string | null;
  schedule: string | null;
  enrolled_at?: string;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchClasses = async () => {
    try {
      const response = await api.get<{ success: boolean; classes: ClassInfo[] }>('/student/classes');
      if (response.success && response.data) {
        setClasses(response.data.classes || []);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleJoinClass = async () => {
    if (!joinCode.trim()) return;
    
    setIsJoining(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post<{ success: boolean; error?: string; class?: ClassInfo }>(
        '/student/classes/join',
        { code: joinCode.toUpperCase() }
      );

      if (response.success) {
        setSuccess('Successfully joined the class!');
        setJoinCode('');
        fetchClasses();
        setTimeout(() => {
          setShowJoinModal(false);
          setSuccess('');
        }, 1500);
      } else {
        setError(response.error || 'Failed to join class');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="px-5 pt-12 safe-area-top">
        <div className="h-10 w-32 skeleton rounded-lg mb-6" />
        <div className="h-14 skeleton rounded-2xl mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="hide-scrollbar">
      <MobileHeader title="My Classes" />

      <div className="px-5 space-y-5 pb-6">
        {/* Join Class Button */}
        <button
          onClick={() => setShowJoinModal(true)}
          className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium shadow-lg shadow-violet-500/20 active:scale-[0.98] transition-transform animate-fade-in"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Join a Class
        </button>

        {/* Classes List */}
        {classes.length > 0 ? (
          <div className="space-y-4 animate-fade-in stagger-1">
            {classes.map((cls, index) => (
              <div
                key={cls.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/50 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xl">{cls.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-white text-lg truncate">{cls.name}</h3>
                      <code className="text-xs text-violet-400 bg-violet-500/10 px-2 py-1 rounded-lg flex-shrink-0">
                        {cls.code}
                      </code>
                    </div>
                    {cls.subject && (
                      <p className="text-slate-400 text-sm mt-1">{cls.subject}</p>
                    )}
                    {cls.schedule && (
                      <div className="flex items-center gap-2 mt-2 text-slate-500 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {cls.schedule}
                      </div>
                    )}
                    {cls.description && (
                      <p className="text-slate-500 text-sm mt-2 line-clamp-2">{cls.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-900/60 flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No classes yet</h3>
            <p className="text-slate-500 text-sm mb-6">Join a class using the code from your teacher</p>
          </div>
        )}
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm safe-area-bottom">
          <div 
            className="w-full max-w-lg bg-slate-900 rounded-t-3xl p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-6" />

            <h2 className="text-xl font-bold text-white text-center mb-2">Join a Class</h2>
            <p className="text-slate-400 text-center text-sm mb-6">
              Enter the class code provided by your teacher
            </p>

            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 mb-4 animate-scale-in">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4 animate-scale-in">
                <p className="text-emerald-400 text-sm text-center">{success}</p>
              </div>
            )}

            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter class code"
              maxLength={10}
              className="w-full px-4 py-4 rounded-2xl bg-slate-800 border border-slate-700 text-white text-center text-2xl tracking-widest font-mono placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all uppercase"
              autoFocus
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinCode('');
                  setError('');
                }}
                className="flex-1 py-4 rounded-2xl bg-slate-800 text-slate-300 font-medium active:scale-[0.98] transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinClass}
                disabled={!joinCode.trim() || isJoining}
                className="flex-1 py-4 rounded-2xl bg-violet-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
              >
                {isJoining ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Joining...
                  </span>
                ) : (
                  'Join Class'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
