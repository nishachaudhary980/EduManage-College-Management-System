// ============ GLOBAL STATE ============
let currentUser = null;
let students = [];
let faculty = [];
let books = [];
let fees = [];
let editingStudentId = null;
let editingFacultyId = null;
let editingBookId = null;
let qrScanner = null;
let currentProfileType = null;
let currentProfileId = null;

// ============ STORAGE ============
function saveToStorage() {
  localStorage.setItem('edu_students', JSON.stringify(students));
  localStorage.setItem('edu_faculty', JSON.stringify(faculty));
  localStorage.setItem('edu_books', JSON.stringify(books));
  localStorage.setItem('edu_fees', JSON.stringify(fees));
}

function loadFromStorage() {
  try {
    students = JSON.parse(localStorage.getItem('edu_students')) || getDefaultStudents();
    faculty = JSON.parse(localStorage.getItem('edu_faculty')) || getDefaultFaculty();
    books = JSON.parse(localStorage.getItem('edu_books')) || getDefaultBooks();
    fees = JSON.parse(localStorage.getItem('edu_fees')) || getDefaultFees();
  } catch (e) {
    students = getDefaultStudents();
    faculty = getDefaultFaculty();
    books = getDefaultBooks();
    fees = getDefaultFees();
  }
}

// ============ DEFAULT DATA ============
function getDefaultStudents() {
  return [
    { id: 1, roll: 'BCA001', name: 'Rahul Sharma', course: 'BCA', year: '2nd Year', marks: 88, email: 'rahul@college.com', photo: '' },
    { id: 2, roll: 'BCA002', name: 'Priya Patel', course: 'BCA', year: '2nd Year', marks: 92, email: 'priya@college.com', photo: '' },
    { id: 3, roll: 'BBA001', name: 'Amit Kumar', course: 'BBA', year: '1st Year', marks: 75, email: 'amit@college.com', photo: '' },
    { id: 4, roll: 'BCOM001', name: 'Sneha Verma', course: 'B.Com', year: '3rd Year', marks: 81, email: 'sneha@college.com', photo: '' },
    { id: 5, roll: 'BSC001', name: 'Vikram Singh', course: 'B.Sc', year: '1st Year', marks: 68, email: 'vikram@college.com', photo: '' }
  ];
}

function getDefaultFaculty() {
  return [
    { id: 1, facId: 'FAC001', name: 'Dr. Anita Verma', dept: 'Computer Science', designation: 'Professor', email: 'anita@college.com', phone: '9876543210', photo: '' },
    { id: 2, facId: 'FAC002', name: 'Prof. Rajesh Kumar', dept: 'Commerce', designation: 'Assistant Professor', email: 'rajesh@college.com', phone: '9876543211', photo: '' }
  ];
}

function getDefaultBooks() {
  const today = new Date();
  const due = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  return [
    { id: 1, bookId: 'BK001', title: 'Data Structures', author: 'R. K. Sharma', category: 'CS', status: 'Issued', issuedTo: 'Rahul Sharma', dueDate: due.toISOString().split('T')[0] },
    { id: 2, bookId: 'BK002', title: 'JavaScript Guide', author: 'D. Flanagan', category: 'CS', status: 'Available', issuedTo: '', dueDate: '' },
    { id: 3, bookId: 'BK003', title: 'Database Systems', author: 'A. Silberschatz', category: 'CS', status: 'Available', issuedTo: '', dueDate: '' }
  ];
}

function getDefaultFees() {
  const today = new Date();
  const d1 = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000);
  return [
    { id: 1, receipt: 'RCP001', student: 'Rahul Sharma', amount: 25000, date: d1.toISOString().split('T')[0], status: 'Paid' }
  ];
}

// ============ LOGIN / LOGOUT ============
function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('login-user').value.trim();
  const password = document.getElementById('login-pass').value.trim();

  if (username === 'admin' && password === 'admin123') {
    currentUser = { name: 'Admin', role: 'Administrator' };
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'grid';
    loadFromStorage();
    initDashboard();
    showToast('Welcome back, Admin! 👋', 'success');
  } else {
    showToast('Invalid credentials', 'error');
  }
}

function handleLogout() {
  if (!confirm('Logout?')) return;
  currentUser = null;
  document.getElementById('app').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  showToast('Logged out', 'success');
}

// ============ QR ON LOGIN PAGE ============
function generateLoginQR() {
  const el = document.getElementById('login-qr-code');
  if (!el) return;
  el.innerHTML = '';
  let url = window.location.href;
  new QRCode(el, {
    text: url,
    width: 130,
    height: 130,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  });
}

// ============ TAB SWITCHING ============
function switchTab(tabName, btn) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const tab = document.getElementById('tab-' + tabName);
  if (tab) tab.classList.add('active');
  if (btn) btn.classList.add('active');

  const titles = {
    dashboard: ['Dashboard', 'Overview of your college'],
    students: ['Students Management', 'Add, edit and manage student records'],
    faculty: ['Faculty Management', 'Manage teaching staff'],
    library: ['Library Management', 'Manage books and issue records'],
    fees: ['Fees Management', 'Track fee payments'],
    analytics: ['Analytics', 'Visual insights and reports'],
    qrscan: ['QR Code Scanner', 'Scan to view profiles']
  };
  if (titles[tabName]) {
    document.getElementById('page-title').textContent = titles[tabName][0];
    document.getElementById('page-sub').textContent = titles[tabName][1];
  }

  if (tabName === 'students') renderStudents();
  if (tabName === 'faculty') renderFaculty();
  if (tabName === 'library') renderLibrary();
  if (tabName === 'fees') renderFees();
  if (tabName === 'analytics') renderAnalytics();
  if (tabName === 'dashboard') initDashboard();
}

function switchTabByName(name) {
  const btn = document.querySelector(`.nav-item[data-tab="${name}"]`);
  switchTab(name, btn);
}

// ============ DASHBOARD ============
function initDashboard() {
  animateNumber('stat-students', students.length);
  animateNumber('stat-faculty', faculty.length);
  animateNumber('stat-books', books.length);
  const collected = fees.filter(f => f.status === 'Paid').reduce((s, f) => s + Number(f.amount), 0);
  animateNumber('stat-fees', collected, '₹');
  animateNumber('stat-issued', books.filter(b => b.status === 'Issued').length);
  renderRecentStudents();
}

function animateNumber(id, target, prefix = '') {
  const el = document.getElementById(id);
  if (!el) return;
  const duration = 1200;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const val = Math.floor(eased * target);
    el.textContent = prefix + val.toLocaleString('en-IN');
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = prefix + target.toLocaleString('en-IN');
  }
  requestAnimationFrame(tick);
}

function renderRecentStudents() {
  const container = document.getElementById('recent-students');
  if (!container) return;
  const recent = students.slice(0, 5);
  if (recent.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-3)">No students yet</div>';
    return;
  }
  container.innerHTML = recent.map(s => `
    <div class="recent-item">
      ${s.photo
        ? `<img src="${s.photo}" class="recent-avatar" style="object-fit:cover;">`
        : `<div class="recent-avatar">${s.name.charAt(0)}</div>`}
      <div class="recent-info">
        <div class="recent-name">${s.name}</div>
        <div class="recent-meta">${s.roll} · ${s.course}</div>
      </div>
      <div class="recent-grade grade-${getGrade(s.marks).charAt(0)}">${getGrade(s.marks)}</div>
    </div>
  `).join('');
}

// ============ IMAGE PREVIEW ============
function previewImage(input, previewId) {
  const file = input.files[0];
  const img = document.getElementById(previewId);
  if (!img) return;
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
      img.style.display = 'block';
    };
    reader.readAsDataURL(file);
  } else {
    img.src = '';
    img.style.display = 'none';
  }
}

// ============ STUDENTS ============
function getGrade(marks) {
  if (marks >= 90) return 'A+';
  if (marks >= 80) return 'A';
  if (marks >= 70) return 'B';
  if (marks >= 60) return 'C';
  return 'D';
}

function getGradeClass(marks) {
  if (marks >= 80) return 'grade-A';
  if (marks >= 70) return 'grade-B';
  if (marks >= 60) return 'grade-C';
  return 'grade-D';
}

function renderStudents() {
  const tbody = document.getElementById('students-tbody');
  if (!tbody) return;
  const search = document.getElementById('global-search')?.value.toLowerCase() || '';
  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search) ||
    s.roll.toLowerCase().includes(search) ||
    s.course.toLowerCase().includes(search)
  );

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="8">No students found</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(s => `
    <tr>
      <td>
        ${s.photo
          ? `<img src="${s.photo}" class="table-avatar" onclick="viewProfile('student', ${s.id})">`
          : `<div class="table-avatar placeholder" onclick="viewProfile('student', ${s.id})">${s.name.charAt(0)}</div>`}
      </td>
      <td><b>${s.roll}</b></td>
      <td>${s.name}</td>
      <td>${s.course}</td>
      <td>${s.year}</td>
      <td>${s.marks}/100</td>
      <td><span class="grade-badge ${getGradeClass(s.marks)}">${getGrade(s.marks)}</span></td>
      <td>
        <button class="action-btn" onclick="viewProfile('student', ${s.id})" title="QR/ID">🎫</button>
        <button class="action-btn" onclick="editStudent(${s.id})">✏️</button>
        <button class="action-btn danger" onclick="deleteStudent(${s.id})">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function openStudentModal() {
  editingStudentId = null;
  document.getElementById('student-modal-title').textContent = 'Add Student';
  document.getElementById('student-modal-badge').textContent = 'New Record';
  document.getElementById('s-roll').value = '';
  document.getElementById('s-name').value = '';
  document.getElementById('s-course').value = 'BCA';
  document.getElementById('s-year').value = '1st Year';
  document.getElementById('s-marks').value = '';
  document.getElementById('s-email').value = '';
  document.getElementById('s-photo').value = '';
  const prev = document.getElementById('s-photo-preview');
  prev.src = ''; prev.style.display = 'none';
  openModal('student-modal');
}

function editStudent(id) {
  const s = students.find(x => x.id === id);
  if (!s) return;
  editingStudentId = id;
  document.getElementById('student-modal-title').textContent = 'Edit Student';
  document.getElementById('student-modal-badge').textContent = 'Editing';
  document.getElementById('s-roll').value = s.roll;
  document.getElementById('s-name').value = s.name;
  document.getElementById('s-course').value = s.course;
  document.getElementById('s-year').value = s.year;
  document.getElementById('s-marks').value = s.marks;
  document.getElementById('s-email').value = s.email || '';
  const prev = document.getElementById('s-photo-preview');
  if (s.photo) { prev.src = s.photo; prev.style.display = 'block'; }
  else { prev.src = ''; prev.style.display = 'none'; }
  openModal('student-modal');
}

function saveStudent() {
  const roll = document.getElementById('s-roll').value.trim();
  const name = document.getElementById('s-name').value.trim();
  const course = document.getElementById('s-course').value;
  const year = document.getElementById('s-year').value;
  const marks = parseInt(document.getElementById('s-marks').value) || 0;
  const email = document.getElementById('s-email').value.trim();

  if (!roll || !name) {
    showToast('Please fill Roll Number and Name', 'warning');
    return;
  }

  const photoInput = document.getElementById('s-photo');
  const finishSave = (photoData) => {
    if (editingStudentId) {
      const s = students.find(x => x.id === editingStudentId);
      if (s) {
        Object.assign(s, { roll, name, course, year, marks, email });
        if (photoData) s.photo = photoData;
      }
      showToast('Student updated ✅', 'success');
    } else {
      const newId = students.length ? Math.max(...students.map(s => s.id)) + 1 : 1;
      students.push({ id: newId, roll, name, course, year, marks, email, photo: photoData || '' });
      showToast('Student added ✅', 'success');
    }
    saveToStorage();
    closeModal('student-modal');
    renderStudents();
    initDashboard();
  };

  if (photoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => finishSave(e.target.result);
    reader.readAsDataURL(photoInput.files[0]);
  } else {
    const existing = students.find(s => s.id === editingStudentId);
    finishSave(existing ? existing.photo : '');
  }
}

function deleteStudent(id) {
  const s = students.find(x => x.id === id);
  if (!s) return;
  if (!confirm(`Delete student "${s.name}"?`)) return;
  students = students.filter(x => x.id !== id);
  saveToStorage();
  renderStudents();
  initDashboard();
  showToast('Student deleted', 'success');
}

// ============ FACULTY ============
function openFacultyModal() {
  editingFacultyId = null;
  document.getElementById('faculty-modal-title').textContent = 'Add Faculty';
  document.getElementById('faculty-modal-badge').textContent = 'New Record';
  document.getElementById('f-id').value = '';
  document.getElementById('f-name').value = '';
  document.getElementById('f-dept').value = 'Computer Science';
  document.getElementById('f-designation').value = 'Assistant Professor';
  document.getElementById('f-email').value = '';
  document.getElementById('f-phone').value = '';
  document.getElementById('f-photo').value = '';
  const prev = document.getElementById('f-photo-preview');
  prev.src = ''; prev.style.display = 'none';
  openModal('faculty-modal');
}

function editFaculty(id) {
  const f = faculty.find(x => x.id === id);
  if (!f) return;
  editingFacultyId = id;
  document.getElementById('faculty-modal-title').textContent = 'Edit Faculty';
  document.getElementById('faculty-modal-badge').textContent = 'Editing';
  document.getElementById('f-id').value = f.facId;
  document.getElementById('f-name').value = f.name;
  document.getElementById('f-dept').value = f.dept;
  document.getElementById('f-designation').value = f.designation;
  document.getElementById('f-email').value = f.email || '';
  document.getElementById('f-phone').value = f.phone || '';
  const prev = document.getElementById('f-photo-preview');
  if (f.photo) { prev.src = f.photo; prev.style.display = 'block'; }
  else { prev.src = ''; prev.style.display = 'none'; }
  openModal('faculty-modal');
}

function saveFaculty() {
  const facId = document.getElementById('f-id').value.trim();
  const name = document.getElementById('f-name').value.trim();
  const dept = document.getElementById('f-dept').value;
  const designation = document.getElementById('f-designation').value;
  const email = document.getElementById('f-email').value.trim();
  const phone = document.getElementById('f-phone').value.trim();

  if (!facId || !name) {
    showToast('Please fill Faculty ID and Name', 'warning');
    return;
  }

  const photoInput = document.getElementById('f-photo');
  const finishSave = (photoData) => {
    if (editingFacultyId) {
      const f = faculty.find(x => x.id === editingFacultyId);
      if (f) {
        Object.assign(f, { facId, name, dept, designation, email, phone });
        if (photoData) f.photo = photoData;
      }
      showToast('Faculty updated ✅', 'success');
    } else {
      const newId = faculty.length ? Math.max(...faculty.map(f => f.id)) + 1 : 1;
      faculty.push({ id: newId, facId, name, dept, designation, email, phone, photo: photoData || '' });
      showToast('Faculty added ✅', 'success');
    }
    saveToStorage();
    closeModal('faculty-modal');
    renderFaculty();
    initDashboard();
  };

  if (photoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => finishSave(e.target.result);
    reader.readAsDataURL(photoInput.files[0]);
  } else {
    const existing = faculty.find(f => f.id === editingFacultyId);
    finishSave(existing ? existing.photo : '');
  }
}

function deleteFaculty(id) {
  const f = faculty.find(x => x.id === id);
  if (!f) return;
  if (!confirm(`Delete faculty "${f.name}"?`)) return;
  faculty = faculty.filter(x => x.id !== id);
  saveToStorage();
  renderFaculty();
  initDashboard();
  showToast('Faculty deleted', 'success');
}

function renderFaculty() {
  const grid = document.getElementById('faculty-grid');
  if (!grid) return;
  if (faculty.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-3)">No faculty yet. Click "Add Faculty" 👨‍🏫</div>';
    return;
  }
  grid.innerHTML = faculty.map(f => `
    <div class="faculty-card">
      <div class="faculty-photo-wrap">
        ${f.photo
          ? `<img src="${f.photo}" class="faculty-photo" alt="${f.name}">`
          : `<div class="faculty-photo-placeholder">${f.name.charAt(0)}</div>`}
      </div>
      <div class="faculty-name">${f.name}</div>
      <div class="faculty-desig">${f.designation}</div>
      <div class="faculty-dept">${f.dept}</div>
      <div class="faculty-meta">
        <div>🆔 ${f.facId}</div>
        <div>📧 ${f.email || '—'}</div>
        <div>📞 ${f.phone || '—'}</div>
      </div>
      <div class="faculty-actions">
        <button class="action-btn" onclick="viewProfile('faculty', ${f.id})" title="View/QR">👁️</button>
        <button class="action-btn" onclick="editFaculty(${f.id})" title="Edit">✏️</button>
        <button class="action-btn danger" onclick="deleteFaculty(${f.id})" title="Delete">🗑️</button>
      </div>
    </div>
  `).join('');
}

// ============ LIBRARY ============
function renderLibrary() {
  const tbody = document.getElementById('library-tbody');
  if (!tbody) return;
  if (books.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="7">No books</td></tr>';
    return;
  }
  tbody.innerHTML = books.map(b => `
    <tr>
      <td><b>${b.bookId}</b></td>
      <td>${b.title}</td>
      <td>${b.author}</td>
      <td><span class="status-badge status-${b.status.toLowerCase()}">${b.status}</span></td>
      <td>${b.issuedTo || '—'}</td>
      <td>${b.dueDate || '—'}</td>
      <td>
        ${b.status === 'Available'
          ? `<button class="action-btn" onclick="openIssueModal(${b.id})">📖 Issue</button>`
          : `<button class="action-btn" onclick="returnBook(${b.id})">↩️ Return</button>`}
        <button class="action-btn danger" onclick="deleteBook(${b.id})">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function openBookModal() {
  document.getElementById('b-id').value = '';
  document.getElementById('b-title').value = '';
  document.getElementById('b-author').value = '';
  document.getElementById('b-category').value = '';
  openModal('book-modal');
}

function saveBook() {
  const bookId = document.getElementById('b-id').value.trim();
  const title = document.getElementById('b-title').value.trim();
  const author = document.getElementById('b-author').value.trim();
  const category = document.getElementById('b-category').value.trim() || 'General';
  if (!bookId || !title) { showToast('Fill Book ID and Title', 'warning'); return; }
  const newId = books.length ? Math.max(...books.map(b => b.id)) + 1 : 1;
  books.push({ id: newId, bookId, title, author, category, status: 'Available', issuedTo: '', dueDate: '' });
  saveToStorage(); closeModal('book-modal'); renderLibrary(); initDashboard();
  showToast('Book added ✅', 'success');
}
function deleteBook(id) {
  if (!confirm('Delete this book?')) return;
  books = books.filter(b => b.id !== id);
  saveToStorage(); renderLibrary(); initDashboard();
  showToast('Book deleted', 'success');
}

function openIssueModal(bookId) {
  const b = books.find(x => x.id === bookId);
  if (!b) return;
  document.getElementById('issue-book-id').value = bookId;
  document.getElementById('issue-student').value = '';
  const due = new Date(); due.setDate(due.getDate() + 7);
  document.getElementById('issue-due').value = due.toISOString().split('T')[0];
  openModal('issue-modal');
}

function confirmIssue() {
  const bookId = parseInt(document.getElementById('issue-book-id').value);
  const student = document.getElementById('issue-student').value.trim();
  const dueDate = document.getElementById('issue-due').value;
  if (!student || !dueDate) { showToast('Fill all fields', 'warning'); return; }
  const b = books.find(x => x.id === bookId);
  if (b) { b.status = 'Issued'; b.issuedTo = student; b.dueDate = dueDate; }
  saveToStorage(); closeModal('issue-modal'); renderLibrary(); initDashboard();
  showToast(`Issued to ${student} 📖`, 'success');
}

function returnBook(id) {
  const b = books.find(x => x.id === id);
  if (!b) return;
  b.status = 'Available'; b.issuedTo = ''; b.dueDate = '';
  saveToStorage(); renderLibrary(); initDashboard();
  showToast('Returned ↩️', 'success');
}

// ============ FEES ============
function renderFees() {
  const tbody = document.getElementById('fees-tbody');
  if (!tbody) return;
  const collected = fees.filter(f => f.status === 'Paid').reduce((s, f) => s + Number(f.amount), 0);
  const pending = fees.filter(f => f.status === 'Pending').reduce((s, f) => s + Number(f.amount), 0);
  document.getElementById('fee-collected').textContent = '₹' + collected.toLocaleString('en-IN');
  document.getElementById('fee-pending').textContent = '₹' + pending.toLocaleString('en-IN');
  if (fees.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="5">No fee records</td></tr>';
    return;
  }
  tbody.innerHTML = fees.map(f => `
    <tr>
      <td><b>${f.receipt}</b></td>
      <td>${f.student}</td>
      <td>₹${Number(f.amount).toLocaleString('en-IN')}</td>
      <td>${f.date}</td>
      <td><span class="status-badge status-${f.status.toLowerCase()}">${f.status}</span></td>
    </tr>
  `).join('');
}

function openFeeModal() {
  document.getElementById('f-student').value = '';
  document.getElementById('f-amount').value = '';
  document.getElementById('f-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('f-status').value = 'Paid';
  openModal('fee-modal');
}

function saveFee() {
  const student = document.getElementById('f-student').value.trim();
  const amount = parseFloat(document.getElementById('f-amount').value);
  const date = document.getElementById('f-date').value;
  const status = document.getElementById('f-status').value;
  if (!student || !amount || !date) { showToast('Fill all fields', 'warning'); return; }
  const newId = fees.length ? Math.max(...fees.map(f => f.id)) + 1 : 1;
  fees.push({ id: newId, receipt: 'RCP' + String(newId).padStart(3, '0'), student, amount, date, status });
  saveToStorage(); closeModal('fee-modal'); renderFees(); initDashboard();
  showToast(`₹${amount} recorded 💰`, 'success');
}

// ============ ANALYTICS ============
function renderAnalytics() {
  renderCourseChart(); renderFeeChart(); renderLibraryChart(); renderTopPerformers();
}
function renderCourseChart() {
  const el = document.getElementById('chart-courses');
  if (!el) return;
  const counts = {};
  students.forEach(s => { counts[s.course] = (counts[s.course] || 0) + 1; });
  const max = Math.max(...Object.values(counts), 1);
  el.innerHTML = '<div class="chart-bars">' + Object.entries(counts).map(([c, n]) => `
    <div class="chart-bar-wrap"><div class="chart-bar-value">${n}</div>
    <div class="chart-bar" style="height: ${(n/max)*140}px"></div>
    <div class="chart-bar-label">${c}</div></div>
  `).join('') + '</div>';
}
function renderFeeChart() {
  const el = document.getElementById('chart-fees');
  if (!el) return;
  const paid = fees.filter(f => f.status === 'Paid').length;
  const pending = fees.filter(f => f.status === 'Pending').length;
  const max = Math.max(paid, pending, 1);
  el.innerHTML = '<div class="chart-bars">' +
    `<div class="chart-bar-wrap"><div class="chart-bar-value">${paid}</div><div class="chart-bar" style="height:${(paid/max)*140}px;background:linear-gradient(180deg,#10b981,#059669);"></div><div class="chart-bar-label">Paid</div></div>
     <div class="chart-bar-wrap"><div class="chart-bar-value">${pending}</div><div class="chart-bar" style="height:${(pending/max)*140}px;background:linear-gradient(180deg,#f59e0b,#d97706);"></div><div class="chart-bar-label">Pending</div></div>` + '</div>';
}
function renderLibraryChart() {
  const el = document.getElementById('chart-library');
  if (!el) return;
  const avail = books.filter(b => b.status === 'Available').length;
  const iss = books.filter(b => b.status === 'Issued').length;
  const max = Math.max(avail, iss, 1);
  el.innerHTML = '<div class="chart-bars">' +
    `<div class="chart-bar-wrap"><div class="chart-bar-value">${avail}</div><div class="chart-bar" style="height:${(avail/max)*140}px;"></div><div class="chart-bar-label">Available</div></div>
     <div class="chart-bar-wrap"><div class="chart-bar-value">${iss}</div><div class="chart-bar" style="height:${(iss/max)*140}px;background:linear-gradient(180deg,#c084fc,#818cf8);"></div><div class="chart-bar-label">Issued</div></div>` + '</div>';
}
function renderTopPerformers() {
  const el = document.getElementById('top-performers');
  if (!el) return;
  const sorted = [...students].sort((a, b) => b.marks - a.marks).slice(0, 5);
  if (sorted.length === 0) { el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-3)">No data</div>'; return; }
  el.innerHTML = sorted.map((s, i) => {
    const rc = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-other';
    const ri = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1);
    return `<div class="top-performer"><div class="rank-badge ${rc}">${ri}</div><div class="performer-info"><div class="performer-name">${s.name}</div><div class="performer-meta">${s.roll} · ${s.course}</div></div><div class="performer-score">${s.marks}</div></div>`;
  }).join('');
}

// ============ PROFILE / ID CARD ============
function viewProfile(type, id) {
  let data, role, idLabel, idValue, extra;
  if (type === 'student') {
    data = students.find(s => s.id === id);
    if (!data) return;
    role = 'STUDENT';
    idLabel = 'Roll No';
    idValue = data.roll;
    extra = `Course: ${data.course} · Year: ${data.year}`;
  } else {
    data = faculty.find(f => f.id === id);
    if (!data) return;
    role = 'FACULTY';
    idLabel = 'Faculty ID';
    idValue = data.facId;
    extra = `${data.designation} · ${data.dept}`;
  }
  currentProfileType = type;
  currentProfileId = id;

  const photo = data.photo
    ? `<img src="${data.photo}" class="idcard-photo">`
    : `<div class="idcard-photo idcard-photo-placeholder">${data.name.charAt(0)}</div>`;

  const qrText = type === 'student'
    ? `STUDENT:${data.roll}:${data.name}`
    : `FACULTY:${data.facId}:${data.name}`;

  document.getElementById('id-card-content').innerHTML = `
    <div class="id-card" id="idcard-print">
      <div class="idcard-header">
        <div class="idcard-logo">🎓</div>
        <div>
          <div class="idcard-college">EduManage College</div>
          <div class="idcard-role">${role} ID CARD</div>
        </div>
      </div>
      <div class="idcard-body">
        <div class="idcard-left">${photo}</div>
        <div class="idcard-right">
          <div class="idcard-name">${data.name}</div>
          <div class="idcard-row"><b>${idLabel}:</b> ${idValue}</div>
          <div class="idcard-row">${extra}</div>
          <div class="idcard-row">📧 ${data.email || '—'}</div>
        </div>
      </div>
      <div class="idcard-footer">
        <div id="idcard-qr"></div>
        <div class="idcard-footer-text">
          <div><b>Scan to view profile</b></div>
          <div style="font-size:0.7rem;opacity:0.6;">EduManage · v2.0</div>
        </div>
      </div>
    </div>
  `;

  openModal('profile-modal');

  setTimeout(() => {
    const qrEl = document.getElementById('idcard-qr');
    if (qrEl) {
      qrEl.innerHTML = '';
      new QRCode(qrEl, {
        text: qrText, width: 90, height: 90,
        colorDark: '#000000', colorLight: '#ffffff'
      });
    }
  }, 100);
}

function printIDCard() {
  const card = document.getElementById('idcard-print');
  if (!card) return;
  const w = window.open('', '', 'width=800,height=600');
  w.document.write(`
    <html><head><title>ID Card</title>
    <style>
      body { font-family: Arial, sans-serif; display:flex; justify-content:center; padding:20px; }
      .id-card { width: 400px; border:2px solid #333; border-radius:12px; padding:20px; }
      .idcard-header { display:flex; gap:12px; align-items:center; border-bottom:2px solid #333; padding-bottom:10px; margin-bottom:15px; }
      .idcard-logo { font-size:2rem; }
      .idcard-college { font-weight:bold; font-size:1.1rem; }
      .idcard-role { font-size:0.8rem; color:#666; }
      .idcard-body { display:flex; gap:15px; margin-bottom:15px; }
      .idcard-photo, .idcard-photo-placeholder { width:100px; height:100px; border-radius:50%; object-fit:cover; background:#ddd; display:flex; align-items:center; justify-content:center; font-size:2rem; font-weight:bold; }
      .idcard-name { font-size:1.2rem; font-weight:bold; margin-bottom:8px; }
      .idcard-row { font-size:0.85rem; margin-bottom:4px; }
      .idcard-footer { display:flex; gap:12px; align-items:center; border-top:1px solid #999; padding-top:10px; }
      .idcard-footer-text { font-size:0.8rem; }
    </style></head><body>${card.outerHTML}</body></html>
  `);
  w.document.close();
  setTimeout(() => { w.print(); }, 500);
}

// ============ QR SCANNER ============
function startQRScanner() {
  const reader = document.getElementById('qr-reader');
  if (!reader) return;
  if (qrScanner) return;

  qrScanner = new Html5Qrcode("qr-reader");
  qrScanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decodedText) => {
      document.getElementById('qr-result').innerHTML = `
        <p style="color:var(--success);font-weight:700;">✅ Scanned: ${decodedText}</p>
      `;
      handleQRResult(decodedText);
    },
    (err) => {}
  ).catch(err => {
    showToast('Camera access denied or not available', 'error');
    qrScanner = null;
  });
}

function stopQRScanner() {
  if (qrScanner) {
    qrScanner.stop().then(() => {
      qrScanner.clear();
      qrScanner = null;
      document.getElementById('qr-result').innerHTML = '<p>📷 Stopped</p>';
    }).catch(() => { qrScanner = null; });
  }
}

function handleQRResult(text) {
  // Format: "STUDENT:BCA001:Rahul" or "FACULTY:FAC001:Dr. Anita"
  const parts = text.split(':');
  if (parts.length >= 2) {
    const type = parts[0].toLowerCase();
    const idValue = parts[1];
    if (type === 'student') {
      const s = students.find(x => x.roll === idValue);
      if (s) { setTimeout(() => viewProfile('student', s.id), 500); return; }
    }
    if (type === 'faculty') {
      const f = faculty.find(x => x.facId === idValue);
      if (f) { setTimeout(() => viewProfile('faculty', f.id), 500); return; }
    }
  }
  showToast('QR scanned, but no matching profile found', 'warning');
}

// ============ MODALS ============
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('active');
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('active');
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
  }
});

// ============ TOAST ============
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { success: '✅', error: '❌', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============ EXPORT ============
function exportReport() {
  let report = 'EDUMANAGE - COLLEGE REPORT\n' + '='.repeat(40) + '\n\n';
  report += `Generated: ${new Date().toLocaleString()}\n\n`;
  report += 'STUDENTS:\n';
  students.forEach(s => report += `  ${s.roll} | ${s.name} | ${s.course} | Marks: ${s.marks}\n`);
  report += '\nFACULTY:\n';
  faculty.forEach(f => report += `  ${f.facId} | ${f.name} | ${f.dept} | ${f.designation}\n`);
  report += '\nBOOKS:\n';
  books.forEach(b => report += `  ${b.bookId} | ${b.title} | ${b.status}\n`);
  report += '\nFEES:\n';
  fees.forEach(f => report += `  ${f.receipt} | ${f.student} | ₹${f.amount} | ${f.status}\n`);

  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `EduManage-Report-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Report exported 📄', 'success');
}

// ============ SEARCH ============
document.addEventListener('input', (e) => {
  if (e.target.id === 'global-search') {
    const active = document.querySelector('.tab-content.active')?.id;
    if (active === 'tab-students') renderStudents();
  }
});

// ============ VFX ============
function initVFX() {
  const canvas = document.getElementById('vfx-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height, particles = [];
  const count = window.innerWidth < 700 ? 20 : 45;
  const maxDist = 140;
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width, y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.4 + 0.5
    });
  }
  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          ctx.beginPath();
          ctx.strokeStyle = '#818cf8';
          ctx.globalAlpha = (1 - dist / maxDist) * 0.15;
          ctx.lineWidth = 0.6;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      ctx.beginPath();
      ctx.fillStyle = '#818cf8';
      ctx.globalAlpha = 0.5;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
}

function initCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  if (!glow) return;
  document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}

// ============ INIT ============
window.addEventListener('load', () => {
  loadFromStorage();
  initVFX();
  initCursorGlow();
});