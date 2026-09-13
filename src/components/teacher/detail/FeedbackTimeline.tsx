import React, { useState } from 'react';
import { FeedbackEntry } from '../../../types';
import { useAppState } from '../../../lib/useAppState';
import {
  MessageSquare,
  Plus,
  Trash2,
  Calendar,
  UserCheck,
  Send,
  Quote,
} from 'lucide-react';
import { EmptyState } from '../../ui/EmptyState';

export interface FeedbackTimelineProps {
  feedback: FeedbackEntry[];
  onSaveFeedback?: (updatedFeedback: FeedbackEntry[]) => void;
  editable?: boolean;
}

export const FeedbackTimeline: React.FC<FeedbackTimelineProps> = ({
  feedback,
  onSaveFeedback,
  editable = true,
}) => {
  const { state } = useAppState();
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteMessage, setNoteMessage] = useState('');

  // Chronological sort: newest first
  const sortedFeedback = [...feedback].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const handleDeleteFeedback = (id: string) => {
    if (!onSaveFeedback) return;
    const nextFeedback = feedback.filter((item) => item.id !== id);
    onSaveFeedback(nextFeedback);
  };

  const handleAddFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSaveFeedback || !noteMessage.trim()) return;

    const newEntry: FeedbackEntry = {
      id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: new Date().toISOString(),
      teacherId: state.teacher.id,
      teacherName: state.teacher.name,
      message: noteMessage.trim(),
    };

    onSaveFeedback([newEntry, ...feedback]);
    setNoteMessage('');
    setIsAddingNote(false);
  };

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-text-primary tracking-tight flex items-center gap-2">
            <MessageSquare size={18} className="text-accent-primary" />
            <span>Teacher Feedback &amp; Academic Timeline</span>
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Institutional qualitative observations, progress milestones, and intervention logs.
          </p>
        </div>

        {editable && (
          <button
            type="button"
            onClick={() => setIsAddingNote((prev) => !prev)}
            className="px-3 py-1.5 rounded-lg bg-bg-surface-raised hover:bg-bg-base border border-border-subtle hover:border-border-focus text-xs font-medium text-text-primary flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus size={13} className="text-accent-primary" />
            <span>{isAddingNote ? 'Cancel' : 'Add Teacher Note'}</span>
          </button>
        )}
      </div>

      {/* Add New Note Drawer */}
      {editable && isAddingNote && (
        <form
          onSubmit={handleAddFeedback}
          className="p-5 bg-bg-base/70 border-b border-border-subtle space-y-3"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-text-primary">
            <UserCheck size={14} className="text-accent-primary" />
            <span>Posting as: <strong className="text-accent-primary">{state.teacher.name}</strong> ({state.teacher.id})</span>
          </div>

          <textarea
            required
            rows={3}
            value={noteMessage}
            onChange={(e) => setNoteMessage(e.target.value)}
            placeholder="Document academic progress, observed strengths, homework habits, or intervention notes..."
            className="w-full bg-bg-surface border border-border-subtle focus:border-accent-primary rounded-lg p-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent-primary leading-relaxed resize-none"
          />

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingNote(false)}
              className="px-3 py-1.5 rounded-lg bg-bg-surface text-text-secondary text-xs hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!noteMessage.trim()}
              className="px-3.5 py-1.5 rounded-lg bg-accent-primary hover:bg-accent-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Send size={12} />
              <span>Post Feedback Note</span>
            </button>
          </div>
        </form>
      )}

      {/* Timeline Stream */}
      {sortedFeedback.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={MessageSquare}
            title="No notes recorded"
            description="No qualitative feedback or progress observations recorded yet."
            className="border-none bg-transparent p-6"
          />
        </div>
      ) : (
        <div className="p-6 space-y-4">
          <div className="relative pl-6 border-l-2 border-border-subtle space-y-6">
            {sortedFeedback.map((entry) => {
              const formattedDate = new Date(entry.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div key={entry.id} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-bg-base border-2 border-accent-primary group-hover:bg-accent-primary transition-colors" />

                  {/* Feedback Card */}
                  <div className="p-4 rounded-xl bg-bg-base/60 border border-border-subtle hover:border-border-focus/60 transition-colors space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-text-primary">
                          {entry.teacherName}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-bg-surface text-[10px] font-mono text-text-muted border border-border-subtle">
                          {entry.teacherId}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[11px] font-mono text-text-muted">
                          <Calendar size={11} />
                          {formattedDate}
                        </span>

                        {editable && (
                          <button
                            type="button"
                            onClick={() => handleDeleteFeedback(entry.id)}
                            title="Delete note"
                            className="p-1 rounded text-text-muted hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-text-secondary leading-relaxed flex items-start gap-2">
                      <Quote size={14} className="text-text-muted shrink-0 mt-0.5 opacity-60" />
                      <p className="italic">{entry.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-3 bg-bg-base/30 border-t border-border-subtle text-[11px] text-text-muted px-6 flex items-center justify-between">
        <span>Chronological feedback entries logged by faculty instructors.</span>
        <span className="font-mono tabular-nums">{feedback.length} Notes</span>
      </div>
    </div>
  );
};
