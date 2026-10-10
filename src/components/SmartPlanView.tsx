import React, { useState, useMemo } from 'react';
import {
  Brain,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle,
  Save,
  BookOpen,
  AlertCircle,
  Loader2,
  ChevronRight,
  Target,
  Zap,
  GraduationCap,
  Layers,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Flame,
  Plus,
} from 'lucide-react';
import { StudyPlan, StudyPlanSession, SyllabusDocument, StudyTask } from '../types';
import { generateId } from '../services/studyService';
import { Language, t } from '../utils/i18n';

interface SmartPlanViewProps {
  currentPlan: StudyPlan | null;
  onSavePlan: (plan: StudyPlan) => void;
  userId: string;
  onStartSessionWithTopic: (subject: string, topic: string, durationMinutes: number) => void;
  onNavigateToSyllabus?: () => void;
  syllabi?: SyllabusDocument[];
  onSaveTasksBatch?: (tasks: StudyTask[]) => void;
  onNavigateToPlanner?: () => void;
  lang?: Language;
}

export const SmartPlanView: React.FC<SmartPlanViewProps> = ({
  currentPlan,
  onSavePlan,
  userId,
  onStartSessionWithTopic,
  onNavigateToSyllabus,
  syllabi = [],
  onSaveTasksBatch,
  onNavigateToPlanner,
  lang = 'en',
}) => {
  // Strategy Mode: Curriculum Syllabus Analysis vs Custom Topic Sprint
  const [strategyMode, setStrategyMode] = useState<'syllabus' | 'custom'>('syllabus');

  // Selected Syllabus for Analysis
  const [selectedSyllabusId, setSelectedSyllabusId] = useState<string>(() => {
    return syllabi.length > 0 ? syllabi[0].id : '';
  });

  const activeSyllabus = useMemo(() => {
    return syllabi.find((s) => s.id === selectedSyllabusId) || syllabi[0] || null;
  }, [syllabi, selectedSyllabusId]);

  // Strategy Form Inputs
  const [examDate, setExamDate] = useState(() => {
    const d = new Date(Date.now() + 86400000 * 30);
    return d.toISOString().split('T')[0];
  });
  const [dailyHours, setDailyHours] = useState(3.5);
  const [goal, setGoal] = useState(
    'Score 85%+ in Semester Board Examination, complete all lab journals, and master high-yield topics'
  );
  const [knowledgeLevel, setKnowledgeLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  // Custom Sprint Inputs fallback
  const [customTitle, setCustomTitle] = useState('Core Engineering Board Exam Sprint (30-Day Plan)');
  const [customSubjects, setCustomSubjects] = useState('Java Programming, Computer Networks, Software Engineering');
  const [customTopics, setCustomTopics] = useState('Multithreading, OSI 7 Layers, SDLC & Agile, PreparedStatement');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<StudyPlan | null>(currentPlan);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [scheduledTasksCount, setScheduledTasksCount] = useState<number | null>(null);

  // Compute Syllabus Analysis Metrics
  const analysisMetrics = useMemo(() => {
    if (!activeSyllabus || !activeSyllabus.analysis) return null;
    const subjects = activeSyllabus.analysis.subjects || [];
    let totalUnits = 0;
    let totalTopics = 0;
    let highDifficultyTopics = 0;

    subjects.forEach((sub) => {
      (sub.units || []).forEach((u) => {
        totalUnits++;
        (u.topics || []).forEach((t) => {
          totalTopics++;
          if (t.importanceLevel === 'high' || t.name.toLowerCase().includes('concurrency') || t.name.toLowerCase().includes('crypto') || t.name.toLowerCase().includes('design')) {
            highDifficultyTopics++;
          }
        });
      });
    });

    const daysAvailable = Math.max(
      1,
      Math.ceil((new Date(examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    );
    const totalStudyHoursAvailable = Math.round(daysAvailable * dailyHours);
    const estimatedEffortHours = Math.max(40, totalTopics * 1.5 + (activeSyllabus.analysis.practicals?.length || 0) * 2);

    return {
      subjectsCount: subjects.length,
      totalUnits,
      totalTopics,
      highDifficultyTopics,
      practicalsCount: activeSyllabus.analysis.practicals?.length || 0,
      daysAvailable,
      totalStudyHoursAvailable,
      estimatedEffortHours,
      readinessRatio: Math.min(100, Math.round((totalStudyHoursAvailable / estimatedEffortHours) * 100)),
    };
  }, [activeSyllabus, examDate, dailyHours]);

  // Generate Plan from Syllabus Analysis
  const handleGenerateFromSyllabus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setSavedSuccess(false);
    setScheduledTasksCount(null);

    try {
      if (!activeSyllabus) {
        throw new Error('Please select or upload a syllabus first.');
      }

      const subjectsPayload = (activeSyllabus.analysis?.subjects || []).map((s) => ({
        name: s.name,
        code: s.code,
        units: (s.units || []).map((u) => ({
          title: `Unit ${u.unitNumber}: ${u.title}`,
          topics: (u.topics || []).map((t) => t.name),
        })),
      }));

      const practicalsPayload = (activeSyllabus.analysis?.practicals || []).map((p) => ({
        title: `Exp ${p.experimentNumber}: ${p.title}`,
        subjectName: p.subjectName,
      }));

      const response = await fetch('/api/gemini/curriculum-study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syllabusTitle: activeSyllabus.title,
          subjects: subjectsPayload,
          practicals: practicalsPayload,
          termWork: activeSyllabus.analysis?.termWork || [],
          microProjects: activeSyllabus.analysis?.microProjects || [],
          examDate,
          dailyHours: Number(dailyHours),
          knowledgeLevel,
          prioritySubjects: subjectsPayload.map((s) => s.name),
          includePracticals: true,
          includeTermWork: true,
          includeMicroProjects: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Syllabus strategy generation failed. Please retry.');
      }

      const data = await response.json();
      const planData = data.plan;

      const newPlan: StudyPlan = {
        id: generateId('plan'),
        userId,
        title: planData.title || `${activeSyllabus.title} Strategy Plan`,
        examDate,
        dailyStudyHours: Number(dailyHours),
        subjects: subjectsPayload.map((s) => s.name),
        schedule: (planData.sessions || []).map((s: any, idx: number) => ({
          dayNumber: s.dayNumber || idx + 1,
          dateOffsetDays: s.dateOffsetDays || idx,
          subject: s.subject || 'General Engineering',
          topic: s.topic || 'Review',
          durationMinutes: s.durationMinutes || Math.round(Number(dailyHours) * 60),
          priority: s.priority || 'medium',
          objectives: s.objectives || [],
          studyTechnique: s.studyTechnique || 'Active Recall & Lab Review',
          completed: false,
        })),
        summary: planData.summary || '',
        strategyTips: planData.strategyTips || [],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setGeneratedPlan(newPlan);
      onSavePlan(newPlan);
      setSavedSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error formulating study strategy.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate Custom Sprint Plan
  const handleGenerateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const subjects = customSubjects.split(',').map((s) => s.trim()).filter(Boolean);
      const topics = customTopics.split(',').map((t) => t.trim()).filter(Boolean);

      const response = await fetch('/api/gemini/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects,
          topics,
          examDate,
          dailyHours: Number(dailyHours),
          goal,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate custom study plan');

      const data = await response.json();
      const planData = data.plan;

      const newPlan: StudyPlan = {
        id: generateId('plan'),
        userId,
        title: planData.title || customTitle,
        examDate,
        dailyStudyHours: Number(dailyHours),
        subjects,
        schedule: (planData.sessions || []).map((s: any, idx: number) => ({
          dayNumber: s.dayNumber || idx + 1,
          dateOffsetDays: s.dateOffsetDays || idx,
          subject: s.subject || 'General Study',
          topic: s.topic || 'Topic Review',
          durationMinutes: s.durationMinutes || 60,
          priority: s.priority || 'medium',
          objectives: s.objectives || [],
          studyTechnique: s.studyTechnique || 'Active Recall',
          completed: false,
        })),
        summary: planData.summary || '',
        strategyTips: planData.strategyTips || [],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setGeneratedPlan(newPlan);
      onSavePlan(newPlan);
      setSavedSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error formulating custom plan.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Connect Strategy to Study Planner & Schedule Recommended Tasks
  const handleScheduleStrategyToPlanner = () => {
    if (!generatedPlan) return;

    if (onSaveTasksBatch) {
      const newTasks: StudyTask[] = generatedPlan.schedule.slice(0, 14).map((session, i) => {
        const dueDate = new Date(Date.now() + 86400000 * (session.dateOffsetDays || i + 1))
          .toISOString()
          .split('T')[0];
        return {
          id: generateId('task_strat'),
          userId,
          title: `[Day ${session.dayNumber}] ${session.subject}: ${session.topic}`,
          subject: session.subject,
          topic: session.topic,
          dueDate,
          priority: session.priority,
          status: 'pending',
          estimatedMinutes: session.durationMinutes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

      onSaveTasksBatch(newTasks);
      setScheduledTasksCount(newTasks.length);
    }

    onSavePlan(generatedPlan);
    setSavedSuccess(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Brain className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t('navSmartPlan', lang)}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {t('prepStrategyTitle', lang)}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            {t('prepStrategySubtitle', lang)}
          </p>
        </div>

        {/* Strategy Mode Switcher */}
        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 self-start md:self-center">
          <button
            type="button"
            onClick={() => setStrategyMode('syllabus')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              strategyMode === 'syllabus'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'सिलेबस विश्लेषण' : 'Syllabus Analysis'}</span>
          </button>
          <button
            type="button"
            onClick={() => setStrategyMode('custom')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              strategyMode === 'custom'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'कस्टम स्प्रिंट' : 'Custom Sprint'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              {scheduledTasksCount
                ? lang === 'hi'
                  ? `रणनीति सहेजी गई और ${scheduledTasksCount} टास्क प्लानर में शेड्यूल किए गए!`
                  : `Strategy plan saved & ${scheduledTasksCount} tasks added to your planner!`
                : lang === 'hi'
                ? 'तैयारी रणनीति सफलतापूर्वक उत्पन्न और सहेजी गई!'
                : 'Preparation strategy generated and saved successfully!'}
            </span>
          </div>
          {onNavigateToPlanner && (
            <button
              onClick={onNavigateToPlanner}
              className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-semibold text-[11px] flex items-center gap-1 transition"
            >
              <span>{t('navPlanner', lang)}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* MAIN WORKFLOW GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>{lang === 'hi' ? 'रणनीति कॉन्फ़िगरेशन' : 'Strategy Parameters'}</span>
              </h3>
            </div>

            {strategyMode === 'syllabus' ? (
              <form onSubmit={handleGenerateFromSyllabus} className="space-y-4 text-xs sm:text-sm">
                {/* Syllabus Selector */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {t('selectSyllabus', lang)}
                  </label>
                  {syllabi.length > 0 ? (
                    <select
                      value={selectedSyllabusId}
                      onChange={(e) => setSelectedSyllabusId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                    >
                      {syllabi.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title} ({s.fileName})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-400 flex items-center justify-between">
                      <span>No uploaded syllabus found.</span>
                      {onNavigateToSyllabus && (
                        <button
                          type="button"
                          onClick={onNavigateToSyllabus}
                          className="text-indigo-400 hover:underline font-semibold"
                        >
                          Upload Syllabus
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Target Exam Date & Daily Hours */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      {t('examDate', lang)}
                    </label>
                    <input
                      type="date"
                      required
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      {t('dailyStudyHours', lang)}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="12"
                      required
                      value={dailyHours}
                      onChange={(e) => setDailyHours(parseFloat(e.target.value) || 2)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Student Current Knowledge Level */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {lang === 'hi' ? 'वर्तमान समझ का स्तर' : 'Current Preparation Level'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setKnowledgeLevel(lvl)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-semibold capitalize border transition cursor-pointer ${
                          knowledgeLevel === lvl
                            ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                            : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Goal */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {t('targetGoal', lang)}
                  </label>
                  <textarea
                    rows={2}
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                {/* Generate Button */}
                <button
                  type="submit"
                  disabled={isGenerating || !activeSyllabus}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('loading', lang)}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{t('generateStudyPlan', lang)}</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Custom Sprint Form */
              <form onSubmit={handleGenerateCustom} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {lang === 'hi' ? 'योजना का शीर्षक' : 'Plan Title'}
                  </label>
                  <input
                    type="text"
                    required
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {lang === 'hi' ? 'विषय (अल्पविराम से अलग)' : 'Subjects (Comma separated)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={customSubjects}
                    onChange={(e) => setCustomSubjects(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {lang === 'hi' ? 'प्रमुख टॉपिक्स' : 'Key Topics'}
                  </label>
                  <textarea
                    rows={2}
                    value={customTopics}
                    onChange={(e) => setCustomTopics(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      {t('examDate', lang)}
                    </label>
                    <input
                      type="date"
                      required
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      {t('dailyStudyHours', lang)}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="12"
                      required
                      value={dailyHours}
                      onChange={(e) => setDailyHours(parseFloat(e.target.value) || 2)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{t('generateStudyPlan', lang)}</span>
                </button>
              </form>
            )}
          </div>

          {/* Syllabus Analysis Breakdown Metric Card */}
          {activeSyllabus && analysisMetrics && (
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t('topicDifficulty', lang)}</span>
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-0.5">
                  <span className="text-[11px] text-slate-400 block">Total Subjects</span>
                  <span className="font-bold text-white">{analysisMetrics.subjectsCount} Subjects</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-0.5">
                  <span className="text-[11px] text-slate-400 block">Curriculum Units</span>
                  <span className="font-bold text-white">{analysisMetrics.totalUnits} Units</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-0.5">
                  <span className="text-[11px] text-slate-400 block">Syllabus Topics</span>
                  <span className="font-bold text-white">{analysisMetrics.totalTopics} Topics</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-0.5">
                  <span className="text-[11px] text-rose-400 block">High Difficulty</span>
                  <span className="font-bold text-rose-300">{analysisMetrics.highDifficultyTopics} Topics</span>
                </div>
              </div>

              {/* Estimated Effort Bar */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>{t('estimatedEffort', lang)}:</span>
                  <span className="font-semibold text-white">
                    {analysisMetrics.estimatedEffortHours} hrs needed ({analysisMetrics.totalStudyHoursAvailable} hrs planned)
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all"
                    style={{ width: `${analysisMetrics.readinessRatio}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Output Panel: Active or Generated Strategy Plan */}
        <div className="lg:col-span-7 space-y-4">
          {generatedPlan ? (
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-xl">
              {/* Plan Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Active Preparation Strategy
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white">{generatedPlan.title}</h3>
                  <p className="text-xs text-slate-400">
                    Exam Date: <strong className="text-white">{generatedPlan.examDate}</strong> · Daily:{' '}
                    <strong className="text-white">{generatedPlan.dailyStudyHours} hrs</strong> · Total:{' '}
                    <strong className="text-white">{generatedPlan.schedule.length} sessions</strong>
                  </p>
                </div>

                {/* Action Buttons: Schedule to Planner */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleScheduleStrategyToPlanner}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                    title="Convert roadmap into daily tasks and schedule to study planner"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{t('applyPlanToPlanner', lang)}</span>
                  </button>
                </div>
              </div>

              {/* Strategy Advice Tips */}
              {generatedPlan.strategyTips && generatedPlan.strategyTips.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-1.5 text-xs">
                  <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    AI Preparation Strategy Advice
                  </span>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {generatedPlan.strategyTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Scheduled Sessions List */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Day-by-Day Learning Roadmap ({generatedPlan.schedule.length} Sessions)
                </h4>

                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {generatedPlan.schedule.map((session, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-indigo-400">Day {session.dayNumber}</span>
                          <span className="text-slate-500">·</span>
                          <span className="font-semibold text-slate-300">{session.subject}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              session.priority === 'high'
                                ? 'bg-rose-500/20 text-rose-300'
                                : session.priority === 'medium'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {session.priority}
                          </span>
                        </div>
                        <h5 className="text-xs sm:text-sm font-semibold text-white truncate">
                          {session.topic}
                        </h5>
                        {session.studyTechnique && (
                          <p className="text-[11px] text-slate-400">
                            Technique: <span className="text-slate-300">{session.studyTechnique}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          onClick={() =>
                            onStartSessionWithTopic(
                              session.subject,
                              session.topic,
                              session.durationMinutes
                            )
                          }
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center gap-1"
                        >
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{session.durationMinutes}m Focus</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-20 px-4 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl space-y-3">
              <Brain className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No Strategy Plan Formulated Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {lang === 'hi'
                  ? 'अपने आधिकारिक पाठ्यक्रम का विश्लेषण करें या तुरंत परीक्षा तैयारी योजना तैयार करने के लिए अपने लक्ष्य निर्धारित करें।'
                  : 'Configure your target exam date and daily hours on the left to synthesize an AI-powered curriculum study strategy.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
