// StudySprint - Vanilla JS Client communicating with Spring Boot REST API

let chatHistory = [];
let timerSeconds = 25 * 60;
let timerRunning = false;
let timerInterval = null;

let allNotes = [];
let allTasks = [];
let allPdfs = [];

// Initialize app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupSearch();
  setupTimer();
  setupChat();
  setupAudioDictate();
  setupPdfUpload();
  setupSyllabusUpload();
  loadNotes();
  loadTasks();
  loadPdfs();
});

// Navigation tab switcher
function setupNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });
}

function switchTab(tabId) {
  document.querySelectorAll('.nav-btn').forEach((b) => b.classList.remove('active'));
  document.querySelectorAll('.view-panel').forEach((p) => p.classList.remove('active'));

  const targetBtn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
  const targetView = document.getElementById(`view-${tabId}`);
  if (targetBtn) targetBtn.classList.add('active');
  if (targetView) targetView.classList.add('active');
}

// ----------------- SEARCH INTERFACE -----------------
function setupSearch() {
  const overlay = document.getElementById('search-overlay');
  const triggerBtn = document.getElementById('open-search-panel-btn');
  const backBtn = document.getElementById('search-panel-back-btn');
  const closeBtn = document.getElementById('search-panel-close-btn');
  const searchInput = document.getElementById('search-panel-input');
  const resultsContainer = document.getElementById('search-results-container');

  function openSearch() {
    overlay.classList.remove('hidden');
    searchInput.focus();
    renderSearchResults(searchInput.value);
  }

  function closeSearch() {
    overlay.classList.add('hidden');
    searchInput.value = '';
  }

  triggerBtn?.addEventListener('click', openSearch);
  backBtn?.addEventListener('click', closeSearch);
  closeBtn?.addEventListener('click', closeSearch);

  // Keyboard shortcuts (Cmd+K / Ctrl+K and Escape)
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (overlay.classList.contains('hidden')) {
        openSearch();
      } else {
        closeSearch();
      }
    } else if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
      closeSearch();
    }
  });

  searchInput?.addEventListener('input', (e) => {
    renderSearchResults(e.target.value);
  });
}

function renderSearchResults(query) {
  const container = document.getElementById('search-results-container');
  if (!container) return;
  const q = (query || '').toLowerCase().trim();

  if (!q) {
    container.innerHTML = `
      <p style="color:#94a3b8;text-align:center;padding:2rem 0;font-size:0.85rem;">
        Type to search across your notes, tasks, and uploaded PDFs.
      </p>
    `;
    return;
  }

  const matchedNotes = allNotes.filter(
    (n) =>
      (n.title && n.title.toLowerCase().includes(q)) ||
      (n.subject && n.subject.toLowerCase().includes(q)) ||
      (n.content && n.content.toLowerCase().includes(q))
  );

  const matchedTasks = allTasks.filter(
    (t) =>
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.subject && t.subject.toLowerCase().includes(q))
  );

  const matchedPdfs = allPdfs.filter(
    (p) =>
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.fileName && p.fileName.toLowerCase().includes(q)) ||
      (p.subject && p.subject.toLowerCase().includes(q))
  );

  if (matchedNotes.length === 0 && matchedTasks.length === 0 && matchedPdfs.length === 0) {
    container.innerHTML = `
      <p style="color:#94a3b8;text-align:center;padding:2rem 0;font-size:0.85rem;">
        No results found for "${escapeHtml(q)}".
      </p>
    `;
    return;
  }

  let html = '';

  if (matchedNotes.length > 0) {
    html += `<h4 style="font-size:0.75rem;color:#818cf8;text-transform:uppercase;margin:0.5rem 0 0.5rem 0;">Notes (${matchedNotes.length})</h4>`;
    matchedNotes.slice(0, 3).forEach((n) => {
      html += `
        <div style="background:#1e293b;padding:0.75rem;border-radius:8px;margin-bottom:0.5rem;cursor:pointer;" onclick="switchTab('notes');document.getElementById('search-overlay').classList.add('hidden');">
          <strong style="color:white;font-size:0.9rem;">${escapeHtml(n.title)}</strong>
          <div style="font-size:0.75rem;color:#94a3b8;margin-top:0.25rem;">${escapeHtml(n.subject)} • ${escapeHtml(n.topic || '')}</div>
        </div>
      `;
    });
  }

  if (matchedTasks.length > 0) {
    html += `<h4 style="font-size:0.75rem;color:#10b981;text-transform:uppercase;margin:1rem 0 0.5rem 0;">Tasks (${matchedTasks.length})</h4>`;
    matchedTasks.slice(0, 3).forEach((t) => {
      html += `
        <div style="background:#1e293b;padding:0.75rem;border-radius:8px;margin-bottom:0.5rem;cursor:pointer;" onclick="switchTab('tasks');document.getElementById('search-overlay').classList.add('hidden');">
          <strong style="color:white;font-size:0.9rem;">${escapeHtml(t.title)}</strong>
          <div style="font-size:0.75rem;color:#94a3b8;margin-top:0.25rem;">Due: ${escapeHtml(t.dueDate || 'Today')} • Status: ${escapeHtml(t.status)}</div>
        </div>
      `;
    });
  }

  if (matchedPdfs.length > 0) {
    html += `<h4 style="font-size:0.75rem;color:#a855f7;text-transform:uppercase;margin:1rem 0 0.5rem 0;">PDFs (${matchedPdfs.length})</h4>`;
    matchedPdfs.slice(0, 3).forEach((p) => {
      html += `
        <div style="background:#1e293b;padding:0.75rem;border-radius:8px;margin-bottom:0.5rem;cursor:pointer;" onclick="switchTab('pdfs');document.getElementById('search-overlay').classList.add('hidden');">
          <strong style="color:white;font-size:0.9rem;">${escapeHtml(p.title)}</strong>
          <div style="font-size:0.75rem;color:#94a3b8;margin-top:0.25rem;">${escapeHtml(p.fileName)} • ${p.pageCount || 1} pages</div>
        </div>
      `;
    });
  }

  container.innerHTML = html;
}

// ----------------- STUDY NOTES API -----------------
async function loadNotes() {
  try {
    const res = await fetch('/api/materials');
    if (!res.ok) return;
    allNotes = await res.json();
    renderNotes(allNotes);
    document.getElementById('kpi-notes').innerText = `${allNotes.length} Notes`;
  } catch (err) {
    console.error('Failed to load notes from Spring Boot:', err);
  }
}

function renderNotes(notes) {
  const container = document.getElementById('notes-list');
  if (!container) return;
  if (!notes || notes.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:3rem 1rem;background:#131b2e;border:1px dashed #334155;border-radius:12px;">
        <p style="color:#cbd5e1;font-weight:600;margin-bottom:0.5rem;">No study materials yet</p>
        <p style="color:#94a3b8;font-size:0.85rem;margin-bottom:1rem;">Add lecture notes, formulas, or study guides to get started.</p>
        <button class="btn btn-primary" onclick="document.getElementById('open-note-modal').click()">+ Create First Note</button>
      </div>
    `;
    return;
  }

  container.innerHTML = notes
    .map(
      (n) => `
    <div class="note-card">
      <div>
        <div class="note-card-top">
          <span class="note-badge">${escapeHtml(n.subject)}</span>
          <span style="font-size:0.7rem;color:#64748b;">${n.updatedAt ? n.updatedAt.split('T')[0] : 'Recent'}</span>
        </div>
        <h4>${escapeHtml(n.title)}</h4>
        <div class="note-sub">Topic: ${escapeHtml(n.topic || n.subject)}</div>
        <p class="note-content">${escapeHtml(n.content)}</p>
      </div>
      <div class="note-card-actions">
        <button class="btn btn-secondary" style="font-size:0.75rem;padding:0.35rem 0.65rem;" onclick="copyNoteContent('${escapeHtml(n.content).replace(/'/g, "\\'")}')">Copy</button>
        <button class="btn btn-secondary" style="font-size:0.75rem;padding:0.35rem 0.65rem;color:#f43f5e;" onclick="deleteNote(${n.id})">Delete</button>
      </div>
    </div>
  `
    )
    .join('');
}

function copyNoteContent(text) {
  navigator.clipboard.writeText(text);
  alert('Note content copied to clipboard!');
}

async function deleteNote(id) {
  if (!confirm('Are you sure you want to delete this study note?')) return;
  await fetch(`/api/materials/${id}`, { method: 'DELETE' });
  loadNotes();
}

document.getElementById('open-note-modal')?.addEventListener('click', () => {
  const modal = document.getElementById('modal-container');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  modalTitle.innerText = 'Create Study Note';
  modalBody.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:0.75rem;">
      <input id="note-title-in" placeholder="Note Title (e.g. Java Multithreading)" style="padding:0.6rem;background:#1e293b;border:1px solid #334155;color:white;border-radius:6px;" />
      <input id="note-subj-in" placeholder="Subject (e.g. Java Programming)" style="padding:0.6rem;background:#1e293b;border:1px solid #334155;color:white;border-radius:6px;" />
      <input id="note-topic-in" placeholder="Topic (e.g. Thread Lifecycle & Synchronization)" style="padding:0.6rem;background:#1e293b;border:1px solid #334155;color:white;border-radius:6px;" />
      <textarea id="note-content-in" rows="5" placeholder="Key concepts, definitions, derivations..." style="padding:0.6rem;background:#1e293b;border:1px solid #334155;color:white;border-radius:6px;"></textarea>
      <div style="display:flex;justify-content:flex-end;gap:0.5rem;margin-top:0.5rem;">
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="submitNote()">Save Note</button>
      </div>
    </div>
  `;
  modal.classList.remove('hidden');
});

async function submitNote() {
  const title = document.getElementById('note-title-in').value.trim();
  const subject = document.getElementById('note-subj-in').value.trim();
  const topic = document.getElementById('note-topic-in').value.trim();
  const content = document.getElementById('note-content-in').value.trim();
  if (!title || !subject) {
    alert('Please provide a title and subject');
    return;
  }

  await fetch('/api/materials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, subject, topic: topic || subject, content, tags: 'Study' }),
  });

  closeModal();
  loadNotes();
}

// ----------------- PDF LIBRARY API -----------------
async function loadPdfs() {
  try {
    const res = await fetch('/api/pdfs');
    if (!res.ok) return;
    allPdfs = await res.json();
    renderPdfs(allPdfs);
    const elem = document.getElementById('kpi-pdfs');
    if (elem) elem.innerText = `${allPdfs.length} Documents`;
  } catch (err) {
    console.error('Failed to load PDFs:', err);
  }
}

function renderPdfs(pdfs) {
  const container = document.getElementById('pdfs-list');
  if (!container) return;
  if (!pdfs || pdfs.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:3rem 1rem;background:#131b2e;border:1px dashed #334155;border-radius:12px;">
        <p style="color:#cbd5e1;font-weight:600;margin-bottom:0.5rem;">No PDFs in library</p>
        <p style="color:#94a3b8;font-size:0.85rem;margin-bottom:1rem;">Upload textbook chapters or syllabus PDFs to store them permanently.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = pdfs
    .map(
      (p) => `
    <div class="note-card">
      <div>
        <div class="note-card-top">
          <span class="note-badge" style="background:rgba(168,85,247,0.15);color:#c084fc;border-color:rgba(168,85,247,0.3);">${escapeHtml(p.subject || 'General')}</span>
          <span style="font-size:0.7rem;color:#64748b;">${p.pageCount || 1} pages</span>
        </div>
        <h4>${escapeHtml(p.title)}</h4>
        <div class="note-sub font-mono" style="font-size:0.7rem;color:#94a3b8;">${escapeHtml(p.fileName)}</div>
        <p class="note-content" style="max-height:80px;overflow:hidden;">${escapeHtml(p.extractedText ? p.extractedText.slice(0, 150) + '...' : 'PDF stored in library.')}</p>
      </div>
      <div class="note-card-actions">
        <a href="/api/pdfs/${p.id}/download" target="_blank" class="btn btn-secondary" style="font-size:0.75rem;padding:0.35rem 0.65rem;text-decoration:none;display:inline-block;">Download / View</a>
        <button class="btn btn-secondary" style="font-size:0.75rem;padding:0.35rem 0.65rem;color:#f43f5e;" onclick="deletePdfItem(${p.id})">Delete</button>
      </div>
    </div>
  `
    )
    .join('');
}

function setupPdfUpload() {
  const input = document.getElementById('spring-pdf-input');
  const status = document.getElementById('pdf-upload-status');

  input?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please select a valid PDF file.');
      return;
    }

    status.innerHTML = `<div style="background:#1e1b4b;padding:0.75rem 1rem;border-radius:8px;border:1px solid #4338ca;color:#c7d2fe;font-size:0.85rem;">⏳ Uploading and processing "${file.name}"...</div>`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    formData.append('subject', 'Computer Science');

    try {
      const res = await fetch('/api/pdfs/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      status.innerHTML = `<div style="background:#064e3b;padding:0.75rem 1rem;border-radius:8px;border:1px solid #059669;color:#a7f3d0;font-size:0.85rem;">✅ "${file.name}" permanently stored!</div>`;
      setTimeout(() => (status.innerHTML = ''), 4000);
      loadPdfs();
    } catch (err) {
      status.innerHTML = `<div style="background:#4c0519;padding:0.75rem 1rem;border-radius:8px;border:1px solid #e11d48;color:#fecdd3;font-size:0.85rem;">❌ Failed to upload PDF: ${err.message}</div>`;
    } finally {
      input.value = '';
    }
  });
}

async function deletePdfItem(id) {
  if (!confirm('Are you sure you want to delete this PDF?')) return;
  await fetch(`/api/pdfs/${id}`, { method: 'DELETE' });
  loadPdfs();
}

// ----------------- SYLLABUS EXPLAINER -----------------
function setupSyllabusUpload() {
  const input = document.getElementById('spring-syllabus-input');
  const status = document.getElementById('syllabus-status');
  const content = document.getElementById('syllabus-content');

  input?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    status.innerHTML = `<div style="background:#1e1b4b;padding:0.75rem 1rem;border-radius:8px;border:1px solid #4338ca;color:#c7d2fe;font-size:0.85rem;">⏳ Uploading syllabus and analyzing curriculum with Gemini...</div>`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('university', 'SBTE Bihar');
    formData.append('course', 'Diploma in CSE');
    formData.append('branch', 'Computer Science & Engineering');
    formData.append('semester', '5th Semester');

    try {
      const res = await fetch('/api/syllabus/upload-and-analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Syllabus processing failed');
      }

      const result = await res.json();
      status.innerHTML = `<div style="background:#064e3b;padding:0.75rem 1rem;border-radius:8px;border:1px solid #059669;color:#a7f3d0;font-size:0.85rem;">✅ Syllabus successfully analyzed!</div>`;
      
      const doc = result.syllabus;
      content.innerHTML = `
        <div class="hero-card" style="margin-top:1rem;">
          <h3>${escapeHtml(doc.title)}</h3>
          <p style="margin-top:0.5rem;color:#cbd5e1;">Uploaded: ${escapeHtml(doc.fileName)} • ${doc.pageCount || 1} pages</p>
          <div style="margin-top:1rem;background:#1e293b;padding:1rem;border-radius:8px;border:1px solid #334155;">
            <h4 style="color:#818cf8;margin-bottom:0.5rem;">Curriculum Analysis Complete</h4>
            <p style="font-size:0.85rem;color:#e2e8f0;line-height:1.5;">Official syllabus stored. Theory units, practical lab experiments, and evaluation criteria identified.</p>
          </div>
        </div>
      `;
    } catch (err) {
      status.innerHTML = `<div style="background:#4c0519;padding:0.75rem 1rem;border-radius:8px;border:1px solid #e11d48;color:#fecdd3;font-size:0.85rem;">❌ ${err.message}</div>`;
    } finally {
      input.value = '';
    }
  });
}

// ----------------- TASKS API -----------------
async function loadTasks() {
  try {
    const res = await fetch('/api/tasks');
    if (!res.ok) return;
    allTasks = await res.json();
    renderTasks(allTasks);

    const completed = allTasks.filter((t) => t.status === 'completed').length;
    document.getElementById('kpi-tasks').innerText = `${completed} / ${allTasks.length}`;
  } catch (err) {
    console.error('Failed to load tasks from Spring Boot:', err);
  }
}

function renderTasks(tasks) {
  const container = document.getElementById('tasks-list');
  if (!container) return;
  if (!tasks || tasks.length === 0) {
    container.innerHTML = '<p style="color:#94a3b8;padding:1rem 0;">No tasks yet. Click "+ Add Task" to schedule one.</p>';
    return;
  }

  container.innerHTML = tasks
    .map(
      (t) => `
    <div class="task-item ${t.status === 'completed' ? 'completed' : ''}">
      <div>
        <strong style="color:${t.status === 'completed' ? '#94a3b8' : 'white'};">${escapeHtml(t.title)}</strong>
        <div style="font-size:0.75rem;color:#94a3b8;margin-top:0.25rem;">
          <span style="color:#818cf8;font-weight:600;">${escapeHtml(t.subject)}</span> • Due: ${t.dueDate || 'Today'} • Status: <span style="color:${t.status === 'completed' ? '#10b981' : '#f59e0b'};font-weight:600;">${escapeHtml(t.status)}</span>
        </div>
      </div>
      <div style="display:flex;gap:0.5rem;">
        <button class="btn btn-secondary" onclick="toggleTask(${t.id}, '${t.status}')">
          ${t.status === 'completed' ? '↩ Undo' : '✓ Complete'}
        </button>
        <button class="btn btn-secondary" style="color:#f43f5e;" onclick="deleteTaskItem(${t.id})">Delete</button>
      </div>
    </div>
  `
    )
    .join('');
}

async function toggleTask(id, currentStatus) {
  const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
  try {
    await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    loadTasks();
  } catch (err) {
    console.error('Failed to update task:', err);
  }
}

async function deleteTaskItem(id) {
  if (!confirm('Are you sure you want to delete this task?')) return;
  await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  loadTasks();
}

document.getElementById('open-task-modal')?.addEventListener('click', () => {
  const modal = document.getElementById('modal-container');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  modalTitle.innerText = 'Create Study Task';
  modalBody.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:0.75rem;">
      <input id="task-title-in" placeholder="Task Title (e.g. Implement Socket Client-Server)" style="padding:0.6rem;background:#1e293b;border:1px solid #334155;color:white;border-radius:6px;" />
      <input id="task-subj-in" placeholder="Subject (e.g. Computer Networks)" style="padding:0.6rem;background:#1e293b;border:1px solid #334155;color:white;border-radius:6px;" />
      <input id="task-due-in" type="date" value="${new Date().toISOString().split('T')[0]}" style="padding:0.6rem;background:#1e293b;border:1px solid #334155;color:white;border-radius:6px;" />
      <div style="display:flex;justify-content:flex-end;gap:0.5rem;margin-top:0.5rem;">
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="submitTask()">Save Task</button>
      </div>
    </div>
  `;
  modal.classList.remove('hidden');
});

async function submitTask() {
  const title = document.getElementById('task-title-in').value.trim();
  const subject = document.getElementById('task-subj-in').value.trim();
  const dueDate = document.getElementById('task-due-in').value;
  if (!title) {
    alert('Task title is required');
    return;
  }

  await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      subject: subject || 'General',
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      priority: 'high',
      status: 'pending',
    }),
  });

  closeModal();
  loadTasks();
}

function closeModal() {
  document.getElementById('modal-container')?.classList.add('hidden');
}

// ----------------- FOCUS TIMER -----------------
function setupTimer() {
  const clock = document.getElementById('timer-clock');
  const startBtn = document.getElementById('timer-start-btn');
  const resetBtn = document.getElementById('timer-reset-btn');
  const presets = document.querySelectorAll('.btn-preset');

  function updateClockDisplay() {
    const m = Math.floor(timerSeconds / 60);
    const s = timerSeconds % 60;
    clock.innerText = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }

  startBtn?.addEventListener('click', () => {
    if (timerRunning) {
      clearInterval(timerInterval);
      timerRunning = false;
      startBtn.innerText = 'Start';
    } else {
      timerRunning = true;
      startBtn.innerText = 'Pause';
      timerInterval = setInterval(() => {
        if (timerSeconds <= 0) {
          clearInterval(timerInterval);
          timerRunning = false;
          startBtn.innerText = 'Start';
          alert('Focus Session Completed! Great job!');
          return;
        }
        timerSeconds--;
        updateClockDisplay();
      }, 1000);
    }
  });

  resetBtn?.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerRunning = false;
    startBtn.innerText = 'Start';
    timerSeconds = 25 * 60;
    updateClockDisplay();
  });

  presets.forEach((btn) => {
    btn.addEventListener('click', () => {
      presets.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      clearInterval(timerInterval);
      timerRunning = false;
      startBtn.innerText = 'Start';
      timerSeconds = parseInt(btn.getAttribute('data-time'), 10) * 60;
      updateClockDisplay();
    });
  });
}

// ----------------- GEMINI CHAT -----------------
function setupChat() {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const thread = document.getElementById('chat-thread');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userText = input.value.trim();
    if (!userText) return;

    input.value = '';
    appendMessage('user', userText);

    chatHistory.push({ role: 'user', content: userText });

    const loadingElem = appendMessage('model', 'StudySprint AI is reasoning...');

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory,
          systemInstruction: 'You are an elite academic tutor. Answer clearly with markdown and equations.',
          model: 'gemini-3.5-flash',
        }),
      });

      const data = await res.json();
      loadingElem.innerText = data.reply || 'No response generated.';
      chatHistory.push({ role: 'model', content: data.reply });
    } catch (err) {
      loadingElem.innerText = 'Error calling Gemini API: ' + err.message;
    }
  });

  function appendMessage(role, text) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${role}`;
    msg.innerText = text;
    thread.appendChild(msg);
    thread.scrollTop = thread.scrollHeight;
    return msg;
  }
}

// ----------------- AUDIO RECORDING & TRANSCRIBE -----------------
function setupAudioDictate() {
  const panelDictateBtn = document.getElementById('panel-dictate-btn');

  panelDictateBtn?.addEventListener('click', async () => {
    alert('Use speech-to-text or type in the search bar.');
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
