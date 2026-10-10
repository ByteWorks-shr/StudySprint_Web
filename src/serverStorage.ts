import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  StudyMaterial,
  PdfDocument,
  StudyTask,
  SyllabusDocument,
  StudentCurriculumProgress,
  PracticalExperiment,
} from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export const UPLOADS_PDF_DIR = path.resolve(rootDir, 'uploads', 'pdfs');
export const UPLOADS_SYLLABUS_DIR = path.resolve(rootDir, 'uploads', 'syllabi');
export const DATA_DIR = path.resolve(rootDir, 'data');
export const STORAGE_FILE = path.resolve(DATA_DIR, 'app_storage.json');

// Ensure required persistent storage directories exist
[UPLOADS_PDF_DIR, UPLOADS_SYLLABUS_DIR, DATA_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

interface AppStorage {
  tasks: StudyTask[];
  materials: StudyMaterial[];
  pdfs: PdfDocument[];
  syllabi: SyllabusDocument[];
  practicals: PracticalExperiment[];
  curriculumProgress: Record<string, StudentCurriculumProgress>;
}

function loadStorage(): AppStorage {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
        materials: Array.isArray(parsed.materials) ? parsed.materials : [],
        pdfs: Array.isArray(parsed.pdfs) ? parsed.pdfs : [],
        syllabi: Array.isArray(parsed.syllabi) ? parsed.syllabi : [],
        practicals: Array.isArray(parsed.practicals) ? parsed.practicals : [],
        curriculumProgress: parsed.curriculumProgress || {},
      };
    }
  } catch (err) {
    console.error('Error reading storage file, initializing fresh:', err);
  }

  // Initial starter data if file doesn't exist
  return {
    tasks: [
      {
        id: 'task_starter_1',
        userId: 'guest_student',
        title: 'Complete Java JDBC Practical Assignment',
        subject: 'Java Programming',
        topic: 'Database Connection & PreparedStatement',
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        priority: 'high',
        status: 'pending',
        estimatedMinutes: 60,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'task_starter_2',
        userId: 'guest_student',
        title: 'Revise Software Engineering Agile Milestones',
        subject: 'Software Engineering',
        topic: 'Scrum Sprints & User Stories',
        dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        priority: 'medium',
        status: 'in_progress',
        estimatedMinutes: 45,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'task_starter_3',
        userId: 'guest_student',
        title: 'Computer Networks TCP/IP 3-Way Handshake Review',
        subject: 'Computer Networks',
        topic: 'Transport Layer Protocols',
        dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        priority: 'high',
        status: 'completed',
        completedAt: new Date().toISOString(),
        estimatedMinutes: 40,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    materials: [
      {
        id: 'mat_starter_1',
        userId: 'guest_student',
        title: 'Java Exception Handling & Multithreading Guide',
        subject: 'Java Programming',
        topic: 'Core OOP & Concurrency',
        content:
          'Comprehensive notes on Checked vs Unchecked Exceptions, try-catch-finally mechanisms, and Thread lifecycle in Java.',
        tags: ['Java', 'ExamPrep', 'Multithreading'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    pdfs: [],
    syllabi: [],
    practicals: [
      {
        id: 'prac_1',
        userId: 'guest_student',
        subjectName: 'Java Programming',
        experimentNumber: '1',
        title: 'Implementation of Multithreading & Synchronization in Java',
        description:
          'Create a producer-consumer problem using Thread class, Runnable interface, and synchronized blocks.',
        requiredTools: 'JDK 17+, IntelliJ IDEA / Eclipse',
        submissionDeadline: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
        status: 'in_progress',
        isCompulsory: true,
        labExecuted: true,
        journalCertified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prac_2',
        userId: 'guest_student',
        subjectName: 'Computer Networks',
        experimentNumber: '2',
        title: 'Packet Sniffing and Protocol Analysis using Wireshark',
        description:
          'Capture TCP three-way handshake, DNS queries, and analyze HTTP vs HTTPS packet headers.',
        requiredTools: 'Wireshark, Cisco Packet Tracer',
        submissionDeadline: new Date(Date.now() + 86400000 * 8).toISOString().split('T')[0],
        status: 'not_started',
        isCompulsory: true,
        labExecuted: false,
        journalCertified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prac_3',
        userId: 'guest_student',
        subjectName: 'Python Programming',
        experimentNumber: '3',
        title: 'Data Visualization and NumPy Array Operations',
        description:
          'Implement matrix manipulations, calculate statistical metrics, and plot graphs using Matplotlib.',
        requiredTools: 'Python 3.10+, Jupyter Notebook / VS Code',
        submissionDeadline: new Date(Date.now() + 86400000 * 12).toISOString().split('T')[0],
        status: 'completed',
        isCompulsory: false,
        labExecuted: true,
        journalCertified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    curriculumProgress: {},
  };
}

let inMemoryStorage: AppStorage = loadStorage();

function persistStorage(): void {
  try {
    const tempFile = `${STORAGE_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(inMemoryStorage, null, 2), 'utf-8');
    fs.renameSync(tempFile, STORAGE_FILE);
  } catch (err) {
    console.error('Failed to persist storage to disk:', err);
  }
}

// Write on initial boot if file does not exist yet
if (!fs.existsSync(STORAGE_FILE)) {
  persistStorage();
}

// ----------------- TASKS -----------------
export function getTasks(userId?: string): StudyTask[] {
  if (!userId || userId === 'guest_student') {
    return inMemoryStorage.tasks;
  }
  return inMemoryStorage.tasks.filter((t) => t.userId === userId || t.userId === 'guest_student');
}

export function saveTask(task: StudyTask): StudyTask {
  const index = inMemoryStorage.tasks.findIndex((t) => t.id === task.id);
  const now = new Date().toISOString();
  const cleanTask: StudyTask = {
    ...task,
    updatedAt: now,
    createdAt: task.createdAt || now,
  };

  if (index >= 0) {
    inMemoryStorage.tasks[index] = cleanTask;
  } else {
    inMemoryStorage.tasks.unshift(cleanTask);
  }
  persistStorage();
  return cleanTask;
}

export function updateTask(id: string, updates: Partial<StudyTask>): StudyTask | null {
  const index = inMemoryStorage.tasks.findIndex((t) => t.id === id);
  if (index < 0) return null;

  const existing = inMemoryStorage.tasks[index];
  const now = new Date().toISOString();

  let completedAt = existing.completedAt;
  if (updates.status === 'completed' && !existing.completedAt) {
    completedAt = now;
  } else if (updates.status && updates.status !== 'completed') {
    completedAt = undefined;
  }

  const updated: StudyTask = {
    ...existing,
    ...updates,
    completedAt,
    updatedAt: now,
  };

  inMemoryStorage.tasks[index] = updated;
  persistStorage();
  return updated;
}

export function deleteTask(id: string): boolean {
  const prevLen = inMemoryStorage.tasks.length;
  inMemoryStorage.tasks = inMemoryStorage.tasks.filter((t) => t.id !== id);
  if (inMemoryStorage.tasks.length !== prevLen) {
    persistStorage();
    return true;
  }
  return false;
}

// ----------------- MATERIALS -----------------
export function getMaterials(userId?: string): StudyMaterial[] {
  if (!userId || userId === 'guest_student') {
    return inMemoryStorage.materials;
  }
  return inMemoryStorage.materials.filter((m) => m.userId === userId || m.userId === 'guest_student');
}

export function saveMaterial(material: StudyMaterial): StudyMaterial {
  const index = inMemoryStorage.materials.findIndex((m) => m.id === material.id);
  const now = new Date().toISOString();
  const cleanMat: StudyMaterial = {
    ...material,
    updatedAt: now,
    createdAt: material.createdAt || now,
  };

  if (index >= 0) {
    inMemoryStorage.materials[index] = cleanMat;
  } else {
    inMemoryStorage.materials.unshift(cleanMat);
  }
  persistStorage();
  return cleanMat;
}

export function updateMaterial(id: string, updates: Partial<StudyMaterial>): StudyMaterial | null {
  const index = inMemoryStorage.materials.findIndex((m) => m.id === id);
  if (index < 0) return null;

  const existing = inMemoryStorage.materials[index];
  const updated: StudyMaterial = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  inMemoryStorage.materials[index] = updated;
  persistStorage();
  return updated;
}

export function deleteMaterial(id: string): boolean {
  const prevLen = inMemoryStorage.materials.length;
  inMemoryStorage.materials = inMemoryStorage.materials.filter((m) => m.id !== id);
  if (inMemoryStorage.materials.length !== prevLen) {
    persistStorage();
    return true;
  }
  return false;
}

// ----------------- PDFS -----------------
export function getPdfs(userId?: string): PdfDocument[] {
  if (!userId || userId === 'guest_student') {
    return inMemoryStorage.pdfs;
  }
  return inMemoryStorage.pdfs.filter((p) => p.userId === userId || p.userId === 'guest_student');
}

export function getPdfById(id: string): PdfDocument | null {
  return inMemoryStorage.pdfs.find((p) => p.id === id) || null;
}

export function savePdf(pdf: PdfDocument): PdfDocument {
  const index = inMemoryStorage.pdfs.findIndex((p) => p.id === pdf.id);
  const now = new Date().toISOString();
  const cleanPdf: PdfDocument = {
    ...pdf,
    updatedAt: now,
    createdAt: pdf.createdAt || now,
  };

  if (index >= 0) {
    inMemoryStorage.pdfs[index] = cleanPdf;
  } else {
    inMemoryStorage.pdfs.unshift(cleanPdf);
  }
  persistStorage();
  return cleanPdf;
}

export function deletePdf(id: string): boolean {
  const target = inMemoryStorage.pdfs.find((p) => p.id === id);
  if (!target) return false;

  // Remove physical file from disk if present
  if (target.storagePath && fs.existsSync(target.storagePath)) {
    try {
      fs.unlinkSync(target.storagePath);
    } catch (e) {
      console.warn('Failed to delete physical PDF file:', e);
    }
  }

  inMemoryStorage.pdfs = inMemoryStorage.pdfs.filter((p) => p.id !== id);
  persistStorage();
  return true;
}

// ----------------- SYLLABI -----------------
export function getSyllabi(userId?: string): SyllabusDocument[] {
  if (!userId || userId === 'guest_student') {
    return inMemoryStorage.syllabi;
  }
  return inMemoryStorage.syllabi.filter((s) => s.userId === userId || s.userId === 'guest_student');
}

export function getSyllabusById(id: string): SyllabusDocument | null {
  return inMemoryStorage.syllabi.find((s) => s.id === id) || null;
}

export function saveSyllabus(syllabus: SyllabusDocument): SyllabusDocument {
  const index = inMemoryStorage.syllabi.findIndex((s) => s.id === syllabus.id);
  const now = new Date().toISOString();
  const cleanSyl: SyllabusDocument = {
    ...syllabus,
    updatedAt: now,
    createdAt: syllabus.createdAt || now,
  };

  if (index >= 0) {
    inMemoryStorage.syllabi[index] = cleanSyl;
  } else {
    inMemoryStorage.syllabi.unshift(cleanSyl);
  }
  persistStorage();
  return cleanSyl;
}

export function deleteSyllabus(id: string): boolean {
  const target = inMemoryStorage.syllabi.find((s) => s.id === id);
  if (!target) return false;

  if (target.storagePath && fs.existsSync(target.storagePath)) {
    try {
      fs.unlinkSync(target.storagePath);
    } catch (e) {
      console.warn('Failed to delete physical syllabus file:', e);
    }
  }

  inMemoryStorage.syllabi = inMemoryStorage.syllabi.filter((s) => s.id !== id);
  persistStorage();
  return true;
}

// ----------------- CURRICULUM PROGRESS -----------------
export function getCurriculumProgress(syllabusId: string): StudentCurriculumProgress | null {
  return inMemoryStorage.curriculumProgress[syllabusId] || null;
}

export function saveCurriculumProgress(progress: StudentCurriculumProgress): StudentCurriculumProgress {
  inMemoryStorage.curriculumProgress[progress.syllabusId] = progress;
  persistStorage();
  return progress;
}

// ----------------- PRACTICAL EXPERIMENTS -----------------
export function getPracticals(userId?: string): PracticalExperiment[] {
  if (!userId || userId === 'guest_student') {
    return inMemoryStorage.practicals || [];
  }
  return (inMemoryStorage.practicals || []).filter(
    (p) => p.userId === userId || p.userId === 'guest_student'
  );
}

export function getPracticalById(id: string): PracticalExperiment | null {
  return (inMemoryStorage.practicals || []).find((p) => p.id === id) || null;
}

export function savePractical(practical: PracticalExperiment): PracticalExperiment {
  if (!inMemoryStorage.practicals) inMemoryStorage.practicals = [];
  const index = inMemoryStorage.practicals.findIndex((p) => p.id === practical.id);
  const now = new Date().toISOString();
  const cleanPrac: PracticalExperiment = {
    ...practical,
    updatedAt: now,
    createdAt: practical.createdAt || now,
  };

  if (index >= 0) {
    inMemoryStorage.practicals[index] = cleanPrac;
  } else {
    inMemoryStorage.practicals.unshift(cleanPrac);
  }
  persistStorage();
  return cleanPrac;
}

export function updatePractical(
  id: string,
  updates: Partial<PracticalExperiment>
): PracticalExperiment | null {
  if (!inMemoryStorage.practicals) inMemoryStorage.practicals = [];
  const index = inMemoryStorage.practicals.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updated: PracticalExperiment = {
    ...inMemoryStorage.practicals[index],
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  };
  inMemoryStorage.practicals[index] = updated;
  persistStorage();
  return updated;
}

export function deletePractical(id: string): boolean {
  if (!inMemoryStorage.practicals) return false;
  const initialLen = inMemoryStorage.practicals.length;
  inMemoryStorage.practicals = inMemoryStorage.practicals.filter((p) => p.id !== id);
  if (inMemoryStorage.practicals.length !== initialLen) {
    persistStorage();
    return true;
  }
  return false;
}

