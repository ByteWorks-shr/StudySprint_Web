/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, loginWithGoogle } from './firebase';
import {
  StudyMaterial,
  PdfDocument,
  StudyTask,
  StudyPlan,
  StudySession,
  UserStats,
  ChatMessage,
  ViewTab,
  SyllabusDocument,
  StudentCurriculumProgress,
  PracticalExperiment,
} from './types';
import {
  subscribeMaterials,
  saveMaterial,
  deleteMaterial,
  subscribePdfs,
  savePdf,
  deletePdf,
  subscribeTasks,
  saveTask,
  updateTaskStatus,
  deleteTask,
  subscribeStudyPlans,
  saveStudyPlan,
  subscribeStudySessions,
  recordStudySession,
  subscribeUserStats,
  subscribeChatMessages,
  saveChatMessage,
  subscribeSyllabi,
  saveSyllabus,
  deleteSyllabus,
  subscribeCurriculumProgress,
  saveCurriculumProgress,
  subscribePracticals,
  savePracticalToFirestore,
  deletePracticalFromFirestore,
  generateId,
  apiFetchTasks,
  apiSaveTask,
  apiUpdateTask,
  apiDeleteTask,
  apiFetchMaterials,
  apiSaveMaterial,
  apiDeleteMaterial,
  apiFetchPdfs,
  apiDeletePdf,
  apiFetchSyllabi,
  apiSaveSyllabus,
  apiDeleteSyllabus,
  apiFetchCurriculumProgress,
  apiSaveCurriculumProgress,
  apiFetchPracticals,
  apiSavePractical,
  apiUpdatePractical,
  apiDeletePractical,
} from './services/studyService';
import {
  getSampleMaterials,
  getSamplePdfs,
  getSampleTasks,
  getSamplePlan,
  getSampleStats,
} from './utils/initialData';

import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { SyllabusExplainerView } from './components/SyllabusExplainerView';
import { StudyMaterialsView } from './components/StudyMaterialsView';
import { PdfLibraryView } from './components/PdfLibraryView';
import { SmartPlanView } from './components/SmartPlanView';
import { StudyPlannerView } from './components/StudyPlannerView';
import { TaskManagementView } from './components/TaskManagementView';
import { StudyTimerView } from './components/StudyTimerView';
import { GeminiChatView } from './components/GeminiChatView';
import { ProgressStreakView } from './components/ProgressStreakView';
import { AudioTranscribeModal } from './components/AudioTranscribeModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { PracticalLabSection } from './components/PracticalLabSection';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { Language, getStoredLanguage, setStoredLanguage } from './utils/i18n';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');

  // State
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [pdfs, setPdfs] = useState<PdfDocument[]>([]);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [syllabi, setSyllabi] = useState<SyllabusDocument[]>([]);
  const [curriculumProgress, setCurriculumProgress] = useState<StudentCurriculumProgress | null>(null);
  const [practicals, setPracticals] = useState<PracticalExperiment[]>([]);

  // Language state (persisted)
  const [lang, setLang] = useState<Language>(() => getStoredLanguage());
  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    setStoredLanguage(newLang);
  };

  // Modals & timer pass-through
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMicModalOpen, setIsMicModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileModalMode, setProfileModalMode] = useState<'profile' | 'settings'>('profile');
  const [timerInitialConfig, setTimerInitialConfig] = useState<{
    subject: string;
    topic: string;
    durationMinutes: number;
  }>({
    subject: 'General Study',
    topic: 'Focus Block',
    durationMinutes: 25,
  });

  const activeUserId = currentUser ? currentUser.uid : 'guest_student';

  // 1. Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 2. Attach Firestore Listeners or load local/starter data
  useEffect(() => {
    if (currentUser) {
      // User is logged in: listen to their private Firestore data
      const unsubMat = subscribeMaterials(currentUser.uid, (data) => {
        if (data.length === 0) {
          // If fresh account, seed starter materials into Firestore
          const sampleMats = getSampleMaterials(currentUser.uid);
          sampleMats.forEach((m) => saveMaterial(m));
        } else {
          setMaterials(data);
        }
      });

      const unsubPdf = subscribePdfs(currentUser.uid, (data) => {
        if (data.length === 0) {
          const samplePdfs = getSamplePdfs(currentUser.uid);
          samplePdfs.forEach((p) => savePdf(p));
        } else {
          setPdfs(data);
        }
      });

      const unsubTasks = subscribeTasks(currentUser.uid, (data) => {
        if (data.length === 0) {
          const sampleTasks = getSampleTasks(currentUser.uid);
          sampleTasks.forEach((t) => saveTask(t));
        } else {
          setTasks(data);
        }
      });

      const unsubPlans = subscribeStudyPlans(currentUser.uid, (data) => {
        if (data.length === 0) {
          const samplePlan = getSamplePlan(currentUser.uid);
          saveStudyPlan(samplePlan);
        } else {
          setStudyPlans(data);
        }
      });

      const unsubSessions = subscribeStudySessions(currentUser.uid, (data) => {
        setSessions(data);
      });

      const unsubStats = subscribeUserStats(currentUser.uid, (data) => {
        setStats(data || getSampleStats(currentUser.uid));
      });

      const unsubChat = subscribeChatMessages(currentUser.uid, (data) => {
        setChatMessages(data);
      });

      const unsubSyllabi = subscribeSyllabi(currentUser.uid, (data) => {
        setSyllabi(data);
      });

      const unsubPracticals = subscribePracticals(currentUser.uid, (data) => {
        setPracticals(data);
      });

      return () => {
        unsubMat();
        unsubPdf();
        unsubTasks();
        unsubPlans();
        unsubSessions();
        unsubStats();
        unsubChat();
        unsubSyllabi();
        unsubPracticals();
      };
    } else {
      // Unauthenticated / Preview Mode: initialize from persistent backend REST database
      setStudyPlans([getSamplePlan(activeUserId)]);
      setStats(getSampleStats(activeUserId));

      // Fetch saved practicals from backend REST API
      apiFetchPracticals(activeUserId).then((savedPracs) => {
        if (savedPracs && savedPracs.length > 0) {
          setPracticals(savedPracs);
        }
      });

      // Fetch saved tasks from backend REST API
      apiFetchTasks(activeUserId).then((savedTasks) => {
        if (savedTasks && savedTasks.length > 0) {
          setTasks(savedTasks);
        } else {
          const sampleTasks = getSampleTasks(activeUserId);
          setTasks(sampleTasks);
          sampleTasks.forEach((t) => apiSaveTask(t));
        }
      });

      // Fetch saved materials from backend REST API
      apiFetchMaterials(activeUserId).then((savedMaterials) => {
        if (savedMaterials && savedMaterials.length > 0) {
          setMaterials(savedMaterials);
        } else {
          const sampleMats = getSampleMaterials(activeUserId);
          setMaterials(sampleMats);
          sampleMats.forEach((m) => apiSaveMaterial(m));
        }
      });

      // Fetch saved PDFs from backend REST API
      apiFetchPdfs(activeUserId).then((savedPdfs) => {
        if (savedPdfs && savedPdfs.length > 0) {
          setPdfs(savedPdfs);
        } else {
          setPdfs(getSamplePdfs(activeUserId));
        }
      });

      // Fetch saved Syllabi from backend REST API
      apiFetchSyllabi(activeUserId).then((savedSyllabi) => {
        if (savedSyllabi && savedSyllabi.length > 0) {
          setSyllabi(savedSyllabi);
          // Also fetch curriculum progress for the primary syllabus
          apiFetchCurriculumProgress(savedSyllabi[0].id).then((savedProg) => {
            if (savedProg) setCurriculumProgress(savedProg);
          });
        }
      });
    }
  }, [currentUser]);

  // Handlers
  const handleSaveMaterial = (item: StudyMaterial) => {
    setMaterials((prev) => {
      const idx = prev.findIndex((m) => m.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [item, ...prev];
    });
    apiSaveMaterial(item).catch((err) => console.error('Failed to save material to backend:', err));
    if (currentUser) {
      saveMaterial(item);
    }
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    apiDeleteMaterial(id).catch((err) => console.error('Failed to delete material on backend:', err));
    if (currentUser) {
      deleteMaterial(id);
    }
  };

  const handleSavePdf = (pdf: PdfDocument) => {
    setPdfs((prev) => {
      const idx = prev.findIndex((p) => p.id === pdf.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = pdf;
        return copy;
      }
      return [pdf, ...prev];
    });
    if (currentUser) {
      savePdf(pdf);
    }
  };

  const handleDeletePdf = (id: string) => {
    setPdfs((prev) => prev.filter((p) => p.id !== id));
    apiDeletePdf(id).catch((err) => console.error('Failed to delete PDF from backend:', err));
    if (currentUser) {
      deletePdf(id);
    }
  };

  const handleSaveTask = (task: StudyTask) => {
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === task.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = task;
        return copy;
      }
      return [task, ...prev];
    });
    apiSaveTask(task).catch((err) => console.error('Failed to save task to backend:', err));
    if (currentUser) {
      saveTask(task);
    }
  };

  const handleToggleTaskStatus = (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: nextStatus as any,
              completedAt: nextStatus === 'completed' ? now : undefined,
            }
          : t
      )
    );
    apiUpdateTask(taskId, {
      status: nextStatus as any,
      completedAt: nextStatus === 'completed' ? now : undefined,
    }).catch((err) => console.error('Failed to update task status in backend:', err));
    if (currentUser) {
      updateTaskStatus(taskId, nextStatus, nextStatus === 'completed' ? now : null);
    }
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    apiDeleteTask(id).catch((err) => console.error('Failed to delete task from backend:', err));
    if (currentUser) {
      deleteTask(id);
    }
  };

  const handleSaveStudyPlan = (plan: StudyPlan) => {
    if (currentUser) {
      saveStudyPlan(plan);
    } else {
      setStudyPlans([plan]);
    }
  };

  const handleSaveSyllabus = (item: SyllabusDocument) => {
    setSyllabi((prev) => {
      const idx = prev.findIndex((s) => s.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [item, ...prev];
    });
    apiSaveSyllabus(item).catch((err) => console.error('Failed to save syllabus to backend:', err));
    if (currentUser) {
      saveSyllabus(item);
    }
  };

  const handleDeleteSyllabus = (id: string) => {
    setSyllabi((prev) => prev.filter((s) => s.id !== id));
    apiDeleteSyllabus(id).catch((err) => console.error('Failed to delete syllabus from backend:', err));
    if (currentUser) {
      deleteSyllabus(id);
    }
  };

  const handleSaveCurriculumProgress = (progress: StudentCurriculumProgress) => {
    setCurriculumProgress(progress);
    apiSaveCurriculumProgress(progress).catch((err) =>
      console.error('Failed to save curriculum progress to backend:', err)
    );
    if (currentUser) {
      saveCurriculumProgress(progress);
    }
  };

  const handleSaveTasksBatch = (newTasks: StudyTask[]) => {
    setTasks((prev) => [...newTasks, ...prev]);
    newTasks.forEach((t) => {
      apiSaveTask(t).catch((err) => console.error('Failed to save batch task to backend:', err));
      if (currentUser) {
        saveTask(t);
      }
    });
  };

  const handleSavePractical = async (item: PracticalExperiment) => {
    setPracticals((prev) => [item, ...prev.filter((p) => p.id !== item.id)]);
    await apiSavePractical(item).catch((err) =>
      console.error('Failed to save practical to backend:', err)
    );
    if (currentUser) {
      await savePracticalToFirestore(item);
    }
  };

  const handleUpdatePractical = async (item: PracticalExperiment) => {
    setPracticals((prev) => prev.map((p) => (p.id === item.id ? item : p)));
    await apiUpdatePractical(item).catch((err) =>
      console.error('Failed to update practical on backend:', err)
    );
    if (currentUser) {
      await savePracticalToFirestore(item);
    }
  };

  const handleDeletePractical = async (id: string) => {
    setPracticals((prev) => prev.filter((p) => p.id !== id));
    await apiDeletePractical(id).catch((err) =>
      console.error('Failed to delete practical on backend:', err)
    );
    if (currentUser) {
      await deletePracticalFromFirestore(id);
    }
  };

  const handleSchedulePracticalToPlanner = (task: StudyTask) => {
    handleSaveTask(task);
  };

  const handleSessionCompleted = async (session: StudySession) => {
    if (currentUser) {
      const updated = await recordStudySession(session, stats);
      setStats(updated);
    } else {
      setSessions((prev) => [session, ...prev]);
      setStats((prev) => ({
        userId: activeUserId,
        currentStreak: (prev?.currentStreak || 1) + 1,
        longestStreak: Math.max((prev?.longestStreak || 1), (prev?.currentStreak || 1) + 1),
        lastStudyDate: new Date().toISOString().split('T')[0],
        totalStudyMinutes: (prev?.totalStudyMinutes || 0) + session.durationMinutes,
        completedTasksCount: prev?.completedTasksCount || 0,
        updatedAt: new Date().toISOString(),
      }));
    }
  };

  const handleSendChatMessage = (msg: ChatMessage) => {
    if (currentUser) {
      saveChatMessage(msg);
    } else {
      setChatMessages((prev) => [...prev, msg]);
    }
  };

  const handleStartSessionWithTopic = (
    subject: string,
    topic: string,
    durationMinutes = 25
  ) => {
    setTimerInitialConfig({ subject, topic, durationMinutes });
    setCurrentTab('timer');
  };

  // Convert audio transcription into note / task / chat
  const handleUseTranscriptAsNote = (text: string) => {
    const newNote: StudyMaterial = {
      id: generateId('mat_voice'),
      userId: activeUserId,
      title: 'Voice Note: ' + text.slice(0, 35) + '...',
      subject: 'Lecture Audio',
      topic: 'Voice Dictation',
      content: text,
      tags: ['Voice Note', 'Transcribed'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    handleSaveMaterial(newNote);
    setCurrentTab('materials');
  };

  const handleUseTranscriptAsTask = (text: string) => {
    const newTask: StudyTask = {
      id: generateId('task_voice'),
      userId: activeUserId,
      title: text.slice(0, 80),
      subject: 'Study Goals',
      topic: 'Dictated Action',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'high',
      status: 'pending',
      estimatedMinutes: 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    handleSaveTask(newTask);
    setCurrentTab('tasks');
  };

  const handleUseTranscriptInChat = (text: string) => {
    const userMsg: ChatMessage = {
      id: generateId('chat_usr'),
      userId: activeUserId,
      role: 'user',
      text,
      createdAt: new Date().toISOString(),
    };
    handleSendChatMessage(userMsg);
    setCurrentTab('chat');
  };

  const activePlan = studyPlans.find((p) => p.status === 'active') || studyPlans[0] || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        stats={stats}
        currentUser={currentUser}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenMic={() => setIsMicModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={(mode) => {
          setProfileModalMode(mode);
          setIsProfileModalOpen(true);
        }}
        lang={lang}
        onLanguageChange={handleLanguageChange}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            materials={materials}
            pdfs={pdfs}
            tasks={tasks}
            activePlan={activePlan}
            stats={stats}
            onNavigate={setCurrentTab}
            onToggleTask={handleToggleTaskStatus}
            onStartSessionWithTopic={handleStartSessionWithTopic}
            onOpenNewNoteModal={() => setCurrentTab('materials')}
            onOpenMic={() => setIsMicModalOpen(true)}
            lang={lang}
            practicals={practicals}
          />
        )}

        {currentTab === 'syllabus' && (
          <SyllabusExplainerView
            userId={activeUserId}
            syllabi={syllabi}
            onSaveSyllabus={handleSaveSyllabus}
            onDeleteSyllabus={handleDeleteSyllabus}
            curriculumProgress={curriculumProgress}
            onSaveProgress={handleSaveCurriculumProgress}
            onSavePlan={handleSaveStudyPlan}
            onSaveTasksBatch={handleSaveTasksBatch}
            onNavigateToPlanner={() => setCurrentTab('planner')}
            lang={lang}
            onLanguageChange={handleLanguageChange}
            practicals={practicals}
            onSavePractical={handleSavePractical}
            onUpdatePractical={handleUpdatePractical}
            onDeletePractical={handleDeletePractical}
            onScheduleToPlanner={handleSchedulePracticalToPlanner}
          />
        )}

        {currentTab === 'practicals' && (
          <PracticalLabSection
            practicals={practicals}
            onSavePractical={handleSavePractical}
            onUpdatePractical={handleUpdatePractical}
            onDeletePractical={handleDeletePractical}
            onScheduleToPlanner={handleSchedulePracticalToPlanner}
            userId={activeUserId}
            lang={lang}
          />
        )}

        {currentTab === 'materials' && (
          <StudyMaterialsView
            materials={materials}
            onSaveMaterial={handleSaveMaterial}
            onDeleteMaterial={handleDeleteMaterial}
            userId={activeUserId}
          />
        )}

        {currentTab === 'pdfs' && (
          <PdfLibraryView
            pdfs={pdfs}
            onSavePdf={handleSavePdf}
            onDeletePdf={handleDeletePdf}
            userId={activeUserId}
          />
        )}

        {currentTab === 'smart-plan' && (
          <SmartPlanView
            currentPlan={activePlan}
            onSavePlan={handleSaveStudyPlan}
            userId={activeUserId}
            onStartSessionWithTopic={handleStartSessionWithTopic}
            onNavigateToSyllabus={() => setCurrentTab('syllabus')}
            syllabi={syllabi}
            onSaveTasksBatch={handleSaveTasksBatch}
            onNavigateToPlanner={() => setCurrentTab('planner')}
            lang={lang}
          />
        )}

        {currentTab === 'planner' && (
          <StudyPlannerView
            activePlan={activePlan}
            onUpdatePlan={handleSaveStudyPlan}
            onStartSessionWithTopic={handleStartSessionWithTopic}
            onNavigateToSmartPlan={() => setCurrentTab('smart-plan')}
          />
        )}

        {currentTab === 'tasks' && (
          <TaskManagementView
            tasks={tasks}
            onSaveTask={handleSaveTask}
            onUpdateStatus={(id, status) => {
              if (currentUser) updateTaskStatus(id, status);
              else setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
            }}
            onDeleteTask={handleDeleteTask}
            userId={activeUserId}
          />
        )}

        {currentTab === 'timer' && (
          <StudyTimerView
            initialSubject={timerInitialConfig.subject}
            initialTopic={timerInitialConfig.topic}
            initialDurationMinutes={timerInitialConfig.durationMinutes}
            onSessionCompleted={handleSessionCompleted}
            stats={stats}
            userId={activeUserId}
          />
        )}

        {currentTab === 'chat' && (
          <GeminiChatView
            messages={chatMessages}
            onSendMessage={handleSendChatMessage}
            userId={activeUserId}
            onOpenMicForChat={() => setIsMicModalOpen(true)}
          />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        lang={lang}
      />

      {/* Profile & Account Settings Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        mode={profileModalMode}
        lang={lang}
        onLanguageChange={handleLanguageChange}
      />

      {/* Global Audio Transcription Modal */}
      <AudioTranscribeModal
        isOpen={isMicModalOpen}
        onClose={() => setIsMicModalOpen(false)}
        onUseAsNote={handleUseTranscriptAsNote}
        onUseAsTask={handleUseTranscriptAsTask}
        onAskChat={handleUseTranscriptInChat}
      />

      {/* Global Quick Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        materials={materials}
        pdfs={pdfs}
        tasks={tasks}
        activePlan={activePlan}
        syllabi={syllabi}
        onNavigateToTab={setCurrentTab}
        onOpenMic={() => setIsMicModalOpen(true)}
      />
    </div>
  );
}
