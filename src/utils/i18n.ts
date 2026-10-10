// Centralized Bilingual Translation System for StudySprint (English & Hindi)

export type Language = 'en' | 'hi';

export interface Translations {
  // Navigation
  navDashboard: string;
  navSyllabus: string;
  navMaterials: string;
  navPdfs: string;
  navSmartPlan: string;
  navPlanner: string;
  navTasks: string;
  navTimer: string;
  navChat: string;
  navPracticals: string;

  // Header / Auth
  searchPlaceholder: string;
  voiceSearch: string;
  signIn: string;
  signOut: string;
  viewProfile: string;
  accountSettings: string;
  streak: string;
  cloudSync: string;
  connected: string;
  guestUser: string;

  // Common Actions
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  close: string;
  back: string;
  filter: string;
  all: string;
  upload: string;
  download: string;
  preview: string;
  explain: string;
  generate: string;
  schedule: string;
  apply: string;
  loading: string;
  success: string;
  error: string;
  confirm: string;
  add: string;

  // Dashboard
  welcomeHeadline: string;
  welcomeSubtitle: string;
  startFocusSession: string;
  uploadStudyNotes: string;
  daysUntilBoardExam: string;
  todayTarget: string;
  studyStreakDays: string;
  focusTimeToday: string;
  tasksCompleted: string;
  overallMastery: string;
  upcomingPlanSessions: string;
  priorityPendingTasks: string;
  viewAll: string;
  noTasksFound: string;
  noSessionsFound: string;

  // Understand My Syllabus
  syllabusTitle: string;
  syllabusSubtitle: string;
  uploadSyllabusBtn: string;
  exploreSampleBtn: string;
  tabTheory: string;
  tabPracticals: string;
  tabTermWork: string;
  tabMicroProjects: string;
  tabAssessment: string;
  askAiMentor: string;
  generatePlanBtn: string;
  searchTopics: string;
  allSubjects: string;
  filterStatus: string;
  mastery: string;
  done: string;
  whatIsAbout: string;
  whyItMatters: string;

  // Practicals and Lab Section
  practicalLabTitle: string;
  practicalLabSubtitle: string;
  addExperiment: string;
  editExperiment: string;
  deleteExperiment: string;
  experimentNumber: string;
  experimentTitle: string;
  subjectName: string;
  description: string;
  requiredTools: string;
  submissionDeadline: string;
  statusNotStarted: string;
  statusInProgress: string;
  statusCompleted: string;
  scheduleToPlanner: string;
  noPracticalsFound: string;
  labExecuted: string;
  journalCertified: string;

  // Preparation Strategy / Smart Plan
  prepStrategyTitle: string;
  prepStrategySubtitle: string;
  selectSyllabus: string;
  uploadNewSyllabus: string;
  analyzeSyllabusForStrategy: string;
  examDate: string;
  dailyStudyHours: string;
  targetGoal: string;
  estimatedEffort: string;
  topicDifficulty: string;
  generateStudyPlan: string;
  applyPlanToPlanner: string;

  // Planner & Tasks
  plannerTitle: string;
  tasksTitle: string;
  addNewTask: string;
  taskTitle: string;
  priority: string;
  dueDate: string;
  completed: string;
  pending: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    navDashboard: 'Dashboard',
    navSyllabus: 'Understand My Syllabus',
    navMaterials: 'Materials',
    navPdfs: 'PDF Library',
    navSmartPlan: 'Preparation Strategy',
    navPlanner: 'Planner',
    navTasks: 'Tasks',
    navTimer: 'Focus Timer',
    navChat: 'AI Tutor',
    navPracticals: 'Practicals & Labs',

    // Header / Auth
    searchPlaceholder: 'Search materials, PDFs, topics, tasks...',
    voiceSearch: 'Voice search',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    viewProfile: 'View Profile',
    accountSettings: 'Account Settings',
    streak: 'Streak',
    cloudSync: 'Cloud Sync',
    connected: 'Connected',
    guestUser: 'Student (Guest)',

    // Common Actions
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    back: 'Back',
    filter: 'Filter',
    all: 'All',
    upload: 'Upload',
    download: 'Download',
    preview: 'Preview',
    explain: 'Explain',
    generate: 'Generate',
    schedule: 'Schedule',
    apply: 'Apply',
    loading: 'Loading...',
    success: 'Success',
    error: 'Error',
    confirm: 'Confirm',
    add: 'Add',

    // Dashboard
    welcomeHeadline: 'Ready to Ace Your Semester Board Exams?',
    welcomeSubtitle: 'Master your subjects, syllabus topics, and lab practicals with high-yield notes and AI guidance.',
    startFocusSession: 'Start Focus Session',
    uploadStudyNotes: 'Upload Study Notes',
    daysUntilBoardExam: 'Days Until Board Exam',
    todayTarget: "Today's Target",
    studyStreakDays: 'Study Streak',
    focusTimeToday: 'Focus Time Today',
    tasksCompleted: 'Tasks Completed',
    overallMastery: 'Curriculum Mastery',
    upcomingPlanSessions: 'Upcoming Study Sessions',
    priorityPendingTasks: 'Priority Pending Tasks',
    viewAll: 'View All',
    noTasksFound: 'No pending tasks. Great job!',
    noSessionsFound: 'No scheduled sessions. Generate a plan to get started!',

    // Understand My Syllabus
    syllabusTitle: 'Understand My Official Syllabus',
    syllabusSubtitle: 'Extract units, chapters, practicals & term-work from your syllabus with AI-powered student explanations.',
    uploadSyllabusBtn: 'Upload Official Syllabus',
    exploreSampleBtn: 'Load Sample SBTE 5th Sem Syllabus',
    tabTheory: 'Theory & Units',
    tabPracticals: 'Practical & Lab Work',
    tabTermWork: 'Term Work',
    tabMicroProjects: 'Micro Projects',
    tabAssessment: 'Exam Pattern',
    askAiMentor: 'Ask AI Syllabus Mentor',
    generatePlanBtn: 'Generate Study Plan from Syllabus',
    searchTopics: 'Search units, topics, concepts...',
    allSubjects: 'All Subjects',
    filterStatus: 'Status Filter',
    mastery: 'Mastery',
    done: 'Done',
    whatIsAbout: 'What is this subject about',
    whyItMatters: 'Why it matters',

    // Practicals and Lab Section
    practicalLabTitle: 'Laboratory & Practical Experiments',
    practicalLabSubtitle: 'Manage your lab experiments, pre-lab preparations, equipment, and submission deadlines.',
    addExperiment: 'Add Practical Experiment',
    editExperiment: 'Edit Experiment',
    deleteExperiment: 'Delete Experiment',
    experimentNumber: 'Experiment Number',
    experimentTitle: 'Experiment Title',
    subjectName: 'Subject Name',
    description: 'Description & Objectives',
    requiredTools: 'Required Materials / Software',
    submissionDeadline: 'Submission Deadline',
    statusNotStarted: 'Not Started',
    statusInProgress: 'In Progress',
    statusCompleted: 'Completed',
    scheduleToPlanner: 'Schedule to Planner',
    noPracticalsFound: 'No practical experiments found. Add your first lab task above!',
    labExecuted: 'Lab Executed',
    journalCertified: 'Journal Certified',

    // Preparation Strategy / Smart Plan
    prepStrategyTitle: 'Curriculum Preparation Strategy',
    prepStrategySubtitle: 'Analyze syllabus depth, topic difficulty, and synthesize a structured high-yield study schedule.',
    selectSyllabus: 'Select Syllabus',
    uploadNewSyllabus: 'Upload / Paste New Syllabus',
    analyzeSyllabusForStrategy: 'Analyze Syllabus for Strategy',
    examDate: 'Exam Target Date',
    dailyStudyHours: 'Daily Study Hours',
    targetGoal: 'Target Score / Academic Goal',
    estimatedEffort: 'Estimated Study Effort',
    topicDifficulty: 'Topic Difficulty Assessment',
    generateStudyPlan: 'Generate Structured Preparation Plan',
    applyPlanToPlanner: 'Apply Plan to Study Planner',

    // Planner & Tasks
    plannerTitle: 'Daily & Weekly Study Planner',
    tasksTitle: 'Study & Lab Task Management',
    addNewTask: 'Add New Task',
    taskTitle: 'Task Title',
    priority: 'Priority',
    dueDate: 'Due Date',
    completed: 'Completed',
    pending: 'Pending',
  },

  hi: {
    // Navigation
    navDashboard: 'डैशबोर्ड',
    navSyllabus: 'सिलेबस समझें (Understand Syllabus)',
    navMaterials: 'अध्ययन सामग्री (Materials)',
    navPdfs: 'पीडीएफ लाइब्रेरी',
    navSmartPlan: 'तैयारी रणनीति (Preparation Strategy)',
    navPlanner: 'स्टडी प्लानर',
    navTasks: 'कार्य सूची (Tasks)',
    navTimer: 'फोकस टाइमर',
    navChat: 'एआई ट्यूटर (AI Tutor)',
    navPracticals: 'प्रैक्टिकल व लैब (Practicals & Labs)',

    // Header / Auth
    searchPlaceholder: 'सामग्री, पीडीएफ, टॉपिक्स, टास्क खोजें...',
    voiceSearch: 'वॉयस सर्च',
    signIn: 'साइन इन करें',
    signOut: 'साइन आउट',
    viewProfile: 'प्रोफ़ाइल देखें',
    accountSettings: 'खाता सेटिंग्स',
    streak: 'स्ट्राइक',
    cloudSync: 'क्लाउड सिंक',
    connected: 'कनेक्टेड',
    guestUser: 'छात्र (अतिथि)',

    // Common Actions
    save: 'सहेजें (Save)',
    cancel: 'रद्द करें',
    delete: 'हटाएं (Delete)',
    edit: 'संपादित करें (Edit)',
    close: 'बंद करें',
    back: 'पीछे जाएं',
    filter: 'फ़िल्टर',
    all: 'सभी',
    upload: 'अपलोड करें',
    download: 'डाउनलोड',
    preview: 'पूर्वावलोकन',
    explain: 'सरल भाषा में समझें',
    generate: 'उत्पन्न करें (Generate)',
    schedule: 'शेड्यूल करें',
    apply: 'लागू करें',
    loading: 'लोड हो रहा है...',
    success: 'सफलता',
    error: 'त्रुटि (Error)',
    confirm: 'पुष्टि करें',
    add: 'जोड़ें',

    // Dashboard
    welcomeHeadline: 'क्या आप सेमेस्टर बोर्ड परीक्षा में अव्वल आने के लिए तैयार हैं?',
    welcomeSubtitle: 'हाई-यील्ड नोट्स और एआई मार्गदर्शन से अपने विषयों, यूनिट्स और लैब प्रैक्टिकल्स में महारत हासिल करें।',
    startFocusSession: 'फोकस सत्र शुरू करें',
    uploadStudyNotes: 'स्टडी नोट्स अपलोड करें',
    daysUntilBoardExam: 'बोर्ड परीक्षा में शेष दिन',
    todayTarget: 'आज का लक्ष्य',
    studyStreakDays: 'अध्ययन स्ट्रीक',
    focusTimeToday: 'आज का अध्ययन समय',
    tasksCompleted: 'पूर्ण किए गए टास्क',
    overallMastery: 'सिलेबस प्रगति (Mastery)',
    upcomingPlanSessions: 'आगामी अध्ययन सत्र',
    priorityPendingTasks: 'प्राथमिकता वाले लंबित कार्य',
    viewAll: 'सभी देखें',
    noTasksFound: 'कोई लंबित कार्य नहीं है। शानदार!',
    noSessionsFound: 'कोई सत्र निर्धारित नहीं है। शुरू करने के लिए प्लान बनाएं!',

    // Understand My Syllabus
    syllabusTitle: 'अपना आधिकारिक सिलेबस समझें',
    syllabusSubtitle: 'अपने सिलेबस से यूनिट्स, चैप्टर्स, प्रैक्टिकल और टर्म वर्क को छात्र-अनुकूल एआई व्याख्या के साथ समझें।',
    uploadSyllabusBtn: 'आधिकारिक सिलेबस अपलोड करें',
    exploreSampleBtn: 'सैंपल SBTE 5th Sem सिलेबस लोड करें',
    tabTheory: 'थ्योरी और यूनिट्स',
    tabPracticals: 'प्रैक्टिकल और लैब कार्य',
    tabTermWork: 'टर्म वर्क (Term Work)',
    tabMicroProjects: 'माइक्रो प्रोजेक्ट्स',
    tabAssessment: 'परीक्षा पैटर्न (Exam Pattern)',
    askAiMentor: 'एआई सिलेबस मेंटर से पूछें',
    generatePlanBtn: 'सिलेबस से स्टडी प्लान बनाएं',
    searchTopics: 'यूनिट्स, टॉपिक्स या कॉन्सेप्ट खोजें...',
    allSubjects: 'सभी विषय',
    filterStatus: 'स्थिति फ़िल्टर',
    mastery: 'प्रगति',
    done: 'पूर्ण',
    whatIsAbout: 'यह विषय किस बारे में है',
    whyItMatters: 'यह क्यों महत्वपूर्ण है',

    // Practicals and Lab Section
    practicalLabTitle: 'प्रयोगशाला और प्रैक्टिकल प्रयोग (Lab Practicals)',
    practicalLabSubtitle: 'अपने लैब प्रयोगों, प्री-लैब तैयारी, आवश्यक सामग्री और जमा करने की समय-सीमा को प्रबंधित करें।',
    addExperiment: 'नया प्रैक्टिकल प्रयोग जोड़ें',
    editExperiment: 'प्रयोग संपादित करें',
    deleteExperiment: 'प्रयोग हटाएं',
    experimentNumber: 'प्रयोग संख्या (Exp No)',
    experimentTitle: 'प्रयोग का शीर्षक (Title)',
    subjectName: 'विषय का नाम (Subject)',
    description: 'उद्देश्य व विवरण (Objectives)',
    requiredTools: 'आवश्यक उपकरण / सॉफ्टवेयर',
    submissionDeadline: 'जमा करने की अंतिम तिथि (Deadline)',
    statusNotStarted: 'शुरू नहीं हुआ (Not Started)',
    statusInProgress: 'प्रगति पर (In Progress)',
    statusCompleted: 'पूर्ण (Completed)',
    scheduleToPlanner: 'प्लानर में शेड्यूल करें',
    noPracticalsFound: 'कोई प्रैक्टिकल प्रयोग नहीं मिला। ऊपर नया प्रयोग जोड़ें!',
    labExecuted: 'लैब में किया गया',
    journalCertified: 'जर्नल प्रमाणित (Certified)',

    // Preparation Strategy / Smart Plan
    prepStrategyTitle: 'सिलेबस तैयारी रणनीति (Preparation Strategy)',
    prepStrategySubtitle: 'सिलेबस की गहराई, विषय की कठिनाई का विश्लेषण करें और उच्च-परिणाम अध्ययन रणनीति तैयार करें।',
    selectSyllabus: 'सिलेबस चुनें',
    uploadNewSyllabus: 'नया सिलेबस अपलोड / पेस्ट करें',
    analyzeSyllabusForStrategy: 'रणनीति हेतु सिलेबस विश्लेषण',
    examDate: 'परीक्षा की लक्षित तिथि',
    dailyStudyHours: 'दैनिक अध्ययन घंटे',
    targetGoal: 'लक्षित अंक / शैक्षणिक लक्ष्य',
    estimatedEffort: 'अनुमानित अध्ययन प्रयास',
    topicDifficulty: 'टॉपिक कठिनाई मूल्यांकन',
    generateStudyPlan: 'संरचित तैयारी योजना बनाएं',
    applyPlanToPlanner: 'प्लानर में योजना लागू करें',

    // Planner & Tasks
    plannerTitle: 'दैनिक और साप्ताहिक स्टडी प्लानर',
    tasksTitle: 'अध्ययन और लैब टास्क प्रबंधन',
    addNewTask: 'नया टास्क जोड़ें',
    taskTitle: 'टास्क शीर्षक',
    priority: 'प्राथमिकता',
    dueDate: 'अंतिम तिथि',
    completed: 'पूर्ण',
    pending: 'लंबित',
  },
};

const STORAGE_KEY = 'studysprint_app_lang';

export function getStoredLanguage(): Language {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val === 'hi' || val === 'en') return val;
  } catch (e) {
    // ignore
  }
  return 'en';
}

export function setStoredLanguage(lang: Language) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch (e) {
    // ignore
  }
}

export function t(key: keyof Translations, lang: Language = 'en'): string {
  const currentDict = translations[lang] || translations.en;
  return currentDict[key] || translations.en[key] || String(key);
}

export default translations;
