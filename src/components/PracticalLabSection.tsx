import React, { useState, useMemo } from 'react';
import {
  FlaskConical,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Calendar,
  Trash2,
  Edit,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Loader2,
  Check,
  FileCheck,
  Wrench,
  BookOpen,
  X,
} from 'lucide-react';
import { PracticalExperiment, PracticalStatus, StudyTask } from '../types';
import { generateId } from '../services/studyService';
import { Language, t } from '../utils/i18n';

interface PracticalLabSectionProps {
  practicals: PracticalExperiment[];
  onSavePractical: (item: PracticalExperiment) => Promise<void> | void;
  onUpdatePractical: (item: PracticalExperiment) => Promise<void> | void;
  onDeletePractical: (id: string) => Promise<void> | void;
  onScheduleToPlanner?: (task: StudyTask) => Promise<void> | void;
  userId: string;
  lang: Language;
}

export const PracticalLabSection: React.FC<PracticalLabSectionProps> = ({
  practicals,
  onSavePractical,
  onUpdatePractical,
  onDeletePractical,
  onScheduleToPlanner,
  userId,
  lang,
}) => {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | PracticalStatus>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PracticalExperiment | null>(null);

  // Form State
  const [subjectName, setSubjectName] = useState('');
  const [experimentNumber, setExperimentNumber] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredTools, setRequiredTools] = useState('');
  const [submissionDeadline, setSubmissionDeadline] = useState('');
  const [status, setStatus] = useState<PracticalStatus>('not_started');
  const [isCompulsory, setIsCompulsory] = useState(false);

  // Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Available subjects from practicals list
  const availableSubjects = useMemo(() => {
    const subs = new Set<string>();
    practicals.forEach((p) => {
      if (p.subjectName?.trim()) subs.add(p.subjectName.trim());
    });
    return Array.from(subs);
  }, [practicals]);

  // Filtered List
  const filteredPracticals = useMemo(() => {
    return practicals.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.experimentNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubject = selectedSubject === 'all' || item.subjectName === selectedSubject;
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;

      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [practicals, searchQuery, selectedSubject, selectedStatus]);

  // Statistics
  const completedCount = practicals.filter((p) => p.status === 'completed').length;
  const inProgressCount = practicals.filter((p) => p.status === 'in_progress').length;
  const notStartedCount = practicals.filter((p) => p.status === 'not_started').length;

  const openCreateModal = () => {
    setEditingItem(null);
    setSubjectName(availableSubjects[0] || 'Java Programming');
    setExperimentNumber(String(practicals.length + 1));
    setTitle('');
    setDescription('');
    setRequiredTools('');
    setSubmissionDeadline(new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]);
    setStatus('not_started');
    setIsCompulsory(false);
    setIsModalOpen(true);
  };

  const openEditModal = (item: PracticalExperiment) => {
    setEditingItem(item);
    setSubjectName(item.subjectName);
    setExperimentNumber(item.experimentNumber);
    setTitle(item.title);
    setDescription(item.description);
    setRequiredTools(item.requiredTools || '');
    setSubmissionDeadline(item.submissionDeadline || '');
    setStatus(item.status);
    setIsCompulsory(!!item.isCompulsory);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectName.trim()) {
      setFeedback({
        type: 'error',
        message: lang === 'hi' ? 'कृपया प्रयोग का शीर्षक और विषय दर्ज करें।' : 'Please enter title and subject.',
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const now = new Date().toISOString();
      if (editingItem) {
        const updated: PracticalExperiment = {
          ...editingItem,
          subjectName: subjectName.trim(),
          experimentNumber: experimentNumber.trim(),
          title: title.trim(),
          description: description.trim(),
          requiredTools: requiredTools.trim(),
          submissionDeadline: submissionDeadline || undefined,
          status,
          isCompulsory,
          updatedAt: now,
        };
        await onUpdatePractical(updated);
        setFeedback({
          type: 'success',
          message:
            lang === 'hi'
              ? 'प्रैक्टिकल प्रयोग सफलतापूर्वक अपडेट किया गया!'
              : 'Practical experiment updated successfully!',
        });
      } else {
        const newItem: PracticalExperiment = {
          id: generateId('prac'),
          userId,
          subjectName: subjectName.trim(),
          experimentNumber: experimentNumber.trim() || String(practicals.length + 1),
          title: title.trim(),
          description: description.trim(),
          requiredTools: requiredTools.trim(),
          submissionDeadline: submissionDeadline || undefined,
          status,
          isCompulsory,
          labExecuted: status === 'completed',
          journalCertified: false,
          createdAt: now,
          updatedAt: now,
        };
        await onSavePractical(newItem);
        setFeedback({
          type: 'success',
          message:
            lang === 'hi'
              ? 'नया प्रैक्टिकल प्रयोग सफलतापूर्वक जोड़ा गया!'
              : 'Practical experiment saved to backend successfully!',
        });
      }

      setIsModalOpen(false);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      console.error(err);
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to save practical experiment.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: PracticalExperiment) => {
    const nextStatus: PracticalStatus =
      item.status === 'not_started'
        ? 'in_progress'
        : item.status === 'in_progress'
        ? 'completed'
        : 'not_started';

    const updated: PracticalExperiment = {
      ...item,
      status: nextStatus,
      labExecuted: nextStatus === 'completed',
      updatedAt: new Date().toISOString(),
    };

    await onUpdatePractical(updated);
  };

  const handleScheduleTask = (item: PracticalExperiment) => {
    if (!onScheduleToPlanner) return;

    const task: StudyTask = {
      id: generateId('task_prac'),
      userId,
      title: `Lab Exp #${item.experimentNumber}: ${item.title}`,
      subject: item.subjectName,
      topic: `Practical: ${item.title}`,
      dueDate: item.submissionDeadline || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      priority: item.isCompulsory ? 'high' : 'medium',
      status: item.status === 'completed' ? 'completed' : 'pending',
      estimatedMinutes: 90,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onScheduleToPlanner(task);
    setFeedback({
      type: 'success',
      message:
        lang === 'hi'
          ? `प्रैक्टिकल #${item.experimentNumber} को प्लानर और टास्क सूची में जोड़ा गया!`
          : `Scheduled Lab #${item.experimentNumber} to your planner & task list!`,
    });
    setTimeout(() => setFeedback(null), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <FlaskConical className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t('tabPracticals', lang)}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {t('practicalLabTitle', lang)}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            {t('practicalLabSubtitle', lang)}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="self-start md:self-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addExperiment', lang)}</span>
        </button>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 transition animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Statistics Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">{t('all', lang)} Practicals</span>
          <p className="text-xl font-extrabold text-white">{practicals.length}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-emerald-400 font-medium">{t('statusCompleted', lang)}</span>
          <p className="text-xl font-extrabold text-emerald-300">{completedCount}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-amber-400 font-medium">{t('statusInProgress', lang)}</span>
          <p className="text-xl font-extrabold text-amber-300">{inProgressCount}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">{t('statusNotStarted', lang)}</span>
          <p className="text-xl font-extrabold text-slate-300">{notStartedCount}</p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'hi'
                ? 'प्रयोग, विषय या उपकरण खोजें...'
                : 'Search experiments, tools, or subjects...'
            }
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-slate-800/80 border border-slate-700/80 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-hidden"
          >
            <option value="all">{t('allSubjects', lang)}</option>
            {availableSubjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="bg-slate-800/80 border border-slate-700/80 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-hidden"
          >
            <option value="all">{t('all', lang)} Status</option>
            <option value="not_started">{t('statusNotStarted', lang)}</option>
            <option value="in_progress">{t('statusInProgress', lang)}</option>
            <option value="completed">{t('statusCompleted', lang)}</option>
          </select>
        </div>
      </div>

      {/* Practical Experiments Cards Grid */}
      {filteredPracticals.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl space-y-3">
          <FlaskConical className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">{t('noPracticalsFound', lang)}</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {lang === 'hi'
              ? 'प्रैक्टिकल और लैब कार्य ट्रैक करने के लिए अपना पहला प्रयोग जोड़ें।'
              : 'Add your official syllabus practicals to keep track of software tools, journals, and submission deadlines.'}
          </p>
          <button
            onClick={openCreateModal}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('addExperiment', lang)}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPracticals.map((item) => {
            const isCompleted = item.status === 'completed';
            const isInProgress = item.status === 'in_progress';

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 flex flex-col justify-between gap-4 transition shadow-md"
              >
                <div className="space-y-2.5">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-indigo-400">
                      Exp #{item.experimentNumber} · {item.subjectName}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {item.isCompulsory && (
                        <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          Compulsory
                        </span>
                      )}
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border cursor-pointer transition ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : isInProgress
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                        title="Click to toggle status"
                      >
                        {item.status === 'completed'
                          ? t('statusCompleted', lang)
                          : item.status === 'in_progress'
                          ? t('statusInProgress', lang)
                          : t('statusNotStarted', lang)}
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong>Objectives: </strong>
                      {item.description}
                    </p>
                  )}

                  {item.requiredTools && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Wrench className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">
                        <strong>Tools: </strong>
                        {item.requiredTools}
                      </span>
                    </div>
                  )}

                  {item.submissionDeadline && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        <strong>Deadline: </strong>
                        {item.submissionDeadline}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title={t('edit', lang)}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeletePractical(item.id)}
                      className="p-1.5 rounded-lg text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title={t('delete', lang)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {onScheduleToPlanner && (
                      <button
                        onClick={() => handleScheduleTask(item)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>{t('scheduleToPlanner', lang)}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Practical Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingItem ? t('editExperiment', lang) : t('addExperiment', lang)}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'hi'
                    ? 'प्रयोग विवरण, आवश्यक सॉफ्टवेयर और सबमिशन तारीख भरें।'
                    : 'Fill laboratory experiment details and tracking status.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {t('experimentNumber', lang)}
                  </label>
                  <input
                    type="text"
                    required
                    value={experimentNumber}
                    onChange={(e) => setExperimentNumber(e.target.value)}
                    placeholder="e.g. 1"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {t('subjectName', lang)}
                  </label>
                  <input
                    type="text"
                    required
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="e.g. Java Programming"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {t('experimentTitle', lang)}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Implementation of Multithreading & Synchronization in Java"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {t('description', lang)}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Objective, algorithmic approach, and expected experiment output..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {t('requiredTools', lang)}
                  </label>
                  <input
                    type="text"
                    value={requiredTools}
                    onChange={(e) => setRequiredTools(e.target.value)}
                    placeholder="e.g. JDK 17, Wireshark, VS Code"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {t('submissionDeadline', lang)}
                  </label>
                  <input
                    type="date"
                    value={submissionDeadline}
                    onChange={(e) => setSubmissionDeadline(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="not_started">{t('statusNotStarted', lang)}</option>
                    <option value="in_progress">{t('statusInProgress', lang)}</option>
                    <option value="completed">{t('statusCompleted', lang)}</option>
                  </select>
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={isCompulsory}
                      onChange={(e) => setIsCompulsory(e.target.checked)}
                      className="rounded-sm accent-rose-500"
                    />
                    <span>Compulsory for Board Exam</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  {t('cancel', lang)}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingItem ? t('save', lang) : t('add', lang)}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
