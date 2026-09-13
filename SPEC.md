# SPEC.md — Student Data Manager

## 0. Overview

**Product:** Student Data Manager — a single web app with two role-based experiences:
a **Teacher** console (full CRUD over student records) and a **Student** dashboard
(read-only view of one's own performance).

**Stack:** React (Next.js-style layout, but works as a plain SPA), Tailwind CSS,
Lucide-react icons, local mock state persisted to `localStorage`. No backend —
this spec defines contracts so a real API can be swapped in later without
changing component shape.

---

## 1. Project Vision & Aesthetics

### 1.1 Vibe
Minimalist, quiet, high-signal. A dark control-room, not a dashboard theme-park.
Zero decorative gradients, zero drop-shadows-for-fun. Every visual element
either communicates state (status, role, trend) or organizes space.

### 1.2 Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--bg-base` | `#0B0F17` | App background |
| `--bg-surface` | `#111827` | Cards, panels, modals |
| `--bg-surface-raised` | `#161E2E` | Hover/active surface, table row hover |
| `--border-subtle` | `#1F2937` | Default borders/dividers |
| `--border-focus` | `#334155` | Focused input borders |
| `--text-primary` | `#E5E7EB` | Headings, primary content |
| `--text-secondary` | `#9CA3AF` | Labels, meta text |
| `--text-muted` | `#6B7280` | Placeholders, disabled |
| `--accent-primary` | `#6366F1` | Primary actions, active nav, focus rings |
| `--accent-primary-hover` | `#818CF8` | Hover state on primary accent |
| `--success` | `#22C55E` | Good attendance/grades, positive badges |
| `--warning` | `#EAB308` | At-risk attendance, mid-range grades |
| `--danger` | `#EF4444` | Failing grades, low attendance, delete actions |
| `--info` | `#38BDF8` | Neutral informational badges |

**Rule:** color always pairs with an icon or label — never color alone to
convey meaning (accessibility).

### 1.3 Typography
- Font: `Inter` (or system-ui fallback stack) for UI; tabular numerals
  (`font-variant-numeric: tabular-nums`) for grades/percentages so columns align.
- Scale: `text-xs` (12px) meta → `text-sm` (14px) body → `text-base` (16px)
  emphasized body → `text-lg`/`text-xl` section headers → `text-2xl` page titles.
- Weight: 400 body, 500 labels/table headers, 600 page titles, 700 only for
  large stat numbers (GPA, attendance %).

### 1.4 Spacing & Layout Feel
- Base spacing unit: 4px grid (Tailwind default). Cards use `p-6`, list items
  `p-4`, tight badge padding `px-2.5 py-0.5`.
- Generous whitespace between sections (`space-y-8` at page level).
- Max content width `max-w-7xl`, centered, with a fixed-width sidebar (240px)
  on desktop that collapses to a top bar on mobile.
- Border radius: `rounded-xl` (12px) for cards/modals, `rounded-full` for
  pills/badges/avatars, `rounded-lg` (8px) for buttons/inputs.
- Borders over shadows: `1px solid var(--border-subtle)` is the primary way
  to separate surfaces. Shadows reserved for modals/popovers only, and kept
  subtle (`shadow-lg shadow-black/40`).

### 1.5 Component Feel
- **Buttons:** solid accent for primary, ghost/outline for secondary, text-only
  for tertiary/cancel. All buttons have icon + label where it aids scanning.
- **Pill badges:** used for status (Present/Absent, Pass/Fail, grade letter,
  role tag). Background = color at low opacity (e.g. `bg-emerald-500/10`),
  text/border = full color.
- **Tables:** no heavy grid lines — only horizontal dividers between rows,
  header row in `text-secondary` uppercase `text-xs tracking-wide`.
- **Modals:** centered, `bg-surface`, backdrop `bg-black/60 backdrop-blur-sm`,
  slide/fade-in transition (150–200ms), focus trapped, `Esc` to close.
- **Empty states:** centered icon + one-line message + optional CTA, never a
  bare blank table.

---

## 2. Information Architecture & Role-Based Views

### 2.1 Global Shell
```
┌─────────────────────────────────────────────┐
│ Topbar: Logo | Role Switcher | User chip     │
├───────────┬───────────────────────────────────┤
│ Sidebar   │ Main content area (per-route)     │
│ (nav)     │                                    │
└───────────┴───────────────────────────────────┘
```
- **Role Switcher** (topbar, always visible): a segmented control /
  dropdown to simulate switching identity — "Teacher" vs a list of specific
  mock students ("Student: Aisha Khan", "Student: Rohan Mehta", …). Switching
  re-renders the shell into the matching role layout instantly (client-side
  only, no reload).
- Sidebar nav items are role-conditional (see below).

### 2.2 Teacher Role — Routes & Views

| Route | View | Purpose |
|---|---|---|
| `/teacher/dashboard` | **Overview** | Summary stat cards (total students, avg attendance, avg GPA, at-risk count) + recent activity list |
| `/teacher/students` | **Student Roster** | Searchable/filterable table of all students, row actions (view/edit/delete), "Add Student" + "Import CSV" buttons |
| `/teacher/students/:id` | **Student Detail** | Full profile, grade history, attendance log, remarks — with inline edit |

**Roster view interactions:**
- Live search box (filters by name or student ID as you type, debounced ~150ms).
- Filter chips: by grade band (A/B/C/D/F), attendance status (Good ≥90%,
  Warning 75–89%, Critical <75%), sortable columns (name, attendance, GPA).
- Bulk-safe delete: delete triggers a confirmation modal (never instant delete).
- "Add Student" opens a modal form (manual entry).
- "Import CSV" opens a modal with file drop zone, column-mapping preview,
  and a validation summary (rows accepted / rows with errors) before commit.
- Edit is inline-modal: click a row's edit icon → modal pre-filled → save
  patches mock state + localStorage.

### 2.3 Student Role — Routes & Views

| Route | View | Purpose |
|---|---|---|
| `/student/dashboard` | **My Performance** | Single-page read-only dashboard scoped to the logged-in student only |

**Dashboard sections (top to bottom):**
1. **Profile header** — avatar initials, name, student ID, class/section, pill badge for overall status.
2. **Stat row** — GPA (large number), Attendance % (large number + ring/progress indicator), Grade trend (up/down indicator).
3. **Grades table** — subject, grade, letter badge, teacher remark per subject.
4. **Attendance tracker** — simple calendar-heatmap or bar-per-month view of present/absent/late.
5. **Teacher Feedback** — list/timeline of remarks with date + teacher name.

**Hard rule:** Student views never expose navigation to other students'
records, no search box, no edit affordances anywhere. Any attempt to alter
the URL/id client-side is blocked at the data-access layer (§3.4).

---

## 3. Data Schema & Mock Data Structure

### 3.1 Entity: `Student`
```ts
type Grade = {
  subject: string;          // e.g. "Mathematics"
  score: number;            // 0–100
  letter: "A" | "B" | "C" | "D" | "F";
  remark?: string;          // teacher note specific to this subject
  updatedAt: string;        // ISO 8601
};

type AttendanceRecord = {
  date: string;             // ISO 8601 date, "YYYY-MM-DD"
  status: "present" | "absent" | "late" | "excused";
};

type FeedbackEntry = {
  id: string;
  date: string;             // ISO 8601
  teacherId: string;
  teacherName: string;
  message: string;
};

type Student = {
  id: string;                 // e.g. "STU-1001"
  name: string;
  email: string;
  section: string;            // e.g. "Grade 10 - B"
  avatarInitials: string;     // derived, e.g. "AK"
  grades: Grade[];
  gpa: number;                // computed or stored, 0.0–4.0 or 0–10 scale (pick one, document it)
  attendance: AttendanceRecord[];
  attendancePct: number;      // computed: present / total * 100
  feedback: FeedbackEntry[];
  status: "good" | "warning" | "critical"; // derived from attendancePct + gpa thresholds
  createdAt: string;
  updatedAt: string;
};
```

### 3.2 Entity: `Teacher` (mock identity only)
```ts
type Teacher = {
  id: string;         // e.g. "TCH-01"
  name: string;
  email: string;
};
```

### 3.3 App State Shape (localStorage-persisted)
```ts
type AppState = {
  currentRole: "teacher" | "student";
  currentStudentId: string | null;   // set when currentRole === "student"
  teacher: Teacher;
  students: Student[];
  ui: {
    search: string;
    filters: {
      gradeBand: string | null;
      attendanceStatus: "good" | "warning" | "critical" | null;
    };
    sort: { column: string; direction: "asc" | "desc" };
  };
};
```
- Persisted key: `student-data-manager:v1`.
- `ui` slice is persisted too so a teacher's search/filter survives a refresh
  (optional but nice); role/student selection always persists so the role
  switcher "remembers" the last simulated identity.

### 3.4 Access Rules (enforced in a single data-access hook, not per-component)
- `useStudents()` — teacher-only; throws/blocks if `currentRole !== "teacher"`.
- `useMyProfile()` — student-only; always resolves via `currentStudentId`,
  ignores any externally-passed id, so a student can never fetch another
  student's record even by manipulating the URL.
- All writes (`addStudent`, `updateStudent`, `deleteStudent`, `importCsv`)
  live behind a single `useTeacherActions()` hook, gated the same way.

### 3.5 CSV Import Contract
Expected headers (case-insensitive, order-independent):
```
student_id, name, email, section, subject, score, attendance_status, date
```
- One row = one grade/attendance event; importer groups rows by `student_id`
  and upserts into `students[]`.
- Validation per row: `student_id` and `name` required; `score` must be
  0–100; `attendance_status` must be one of the enum values; malformed rows
  are collected into an errors list and shown in the preview modal, not
  silently dropped.

### 3.6 Derived/Computed Values (never hand-edited, always recalculated)
- `attendancePct` = `present-equivalent days / total logged days * 100`
  (define "excused" as excluded from denominator; document this choice
  in-app via a tooltip).
- `gpa` = average of `grades[].score` mapped to a 4.0 scale (or kept as
  raw 0–100 average — pick one and keep it consistent across UI).
- `status` thresholds: `good` ≥ 90% attendance AND GPA ≥ 3.0; `critical`
  < 75% attendance OR GPA < 2.0; everything else `warning`.

---

## 4. Component Hierarchy

```
<App>
├── <AppStateProvider>                # context wrapping localStorage-synced state
│   ├── <AppShell>
│   │   ├── <Topbar>
│   │   │   ├── <Logo />
│   │   │   ├── <RoleSwitcher />      # dropdown/segmented control
│   │   │   └── <UserChip />          # shows current simulated identity
│   │   ├── <Sidebar>
│   │   │   └── <NavItem />[]         # role-conditional list
│   │   └── <MainContent>             # router outlet
│   │
│   ├── [Teacher Routes]
│   │   ├── <TeacherDashboardPage>
│   │   │   ├── <StatCard />[]
│   │   │   └── <RecentActivityList />
│   │   ├── <StudentRosterPage>
│   │   │   ├── <SearchBar />
│   │   │   ├── <FilterChipGroup />
│   │   │   ├── <RosterTable>
│   │   │   │   └── <RosterRow />[]
│   │   │   │       ├── <StatusBadge />
│   │   │   │       └── <RowActions />   # view / edit / delete icons
│   │   │   ├── <AddStudentModal>
│   │   │   │   └── <StudentForm />
│   │   │   ├── <EditStudentModal>
│   │   │   │   └── <StudentForm />
│   │   │   ├── <ImportCsvModal>
│   │   │   │   ├── <FileDropZone />
│   │   │   │   ├── <ColumnMappingPreview />
│   │   │   │   └── <ImportSummary />
│   │   │   └── <ConfirmDeleteModal />
│   │   └── <StudentDetailPage>
│   │       ├── <ProfileHeader />
│   │       ├── <GradesTable editable />
│   │       ├── <AttendanceLog editable />
│   │       └── <FeedbackTimeline editable />
│   │
│   └── [Student Routes]
│       └── <StudentDashboardPage>
│           ├── <ProfileHeader />
│           ├── <StatRow>
│           │   ├── <GpaCard />
│           │   ├── <AttendanceRing />
│           │   └── <TrendIndicator />
│           ├── <GradesTable readOnly />
│           ├── <AttendanceHeatmap />
│           └── <FeedbackTimeline readOnly />
│
├── Shared/UI primitives
│   ├── <Button variant="primary|ghost|text|danger" />
│   ├── <Badge tone="success|warning|danger|info|neutral" />
│   ├── <Modal />
│   ├── <Input />, <Select />, <FileInput />
│   ├── <Table />, <TableRow />, <TableCell />
│   ├── <EmptyState />
│   ├── <Toast /> / <ToastProvider>     # save/delete/import confirmations
│   └── <Avatar initials />
│
└── lib/
    ├── useAppState.ts        # context + localStorage sync
    ├── useStudents.ts        # teacher read hook
    ├── useMyProfile.ts       # student read hook
    ├── useTeacherActions.ts  # add/update/delete/import
    ├── csvParser.ts
    ├── derived.ts            # gpa/attendancePct/status calculators
    └── mockData.ts           # seed data (10–15 sample students)
```

---

## 5. Step-by-Step Build Order (Iterative Vibe-Coding Turns)

Each step should be one working, visually-inspectable increment — commit/checkpoint after each.

1. **Scaffold & theme tokens** — set up project, Tailwind config with the
   palette as CSS variables / theme extension, global dark background,
   font setup. Render a blank `<AppShell>` with empty Topbar + Sidebar to
   confirm the dark aesthetic reads correctly before any data exists.

2. **Mock data + state layer** — write `mockData.ts` (10–15 students with
   varied grades/attendance/status so all badge colors are exercised),
   `AppStateProvider` with localStorage sync, and `derived.ts` calculators.
   No UI yet beyond a console/dev check that state loads and persists.

3. **Role Switcher + shell navigation** — build `<RoleSwitcher>`, wire it to
   `currentRole`/`currentStudentId`, make Sidebar nav react to role. Verify
   switching roles instantly swaps the nav and routes without reload.

4. **Teacher Dashboard (overview)** — `<StatCard>` grid + recent activity,
   fed by derived aggregate values across all students. This is the
   simplest data-bound page — good first "real" screen.

5. **Student Roster table (read-only first)** — `<RosterTable>` rendering
   all students with `<StatusBadge>`s, no search/filter/edit yet. Confirms
   table styling, spacing, and badge system.

6. **Search + filters** — add `<SearchBar>` and `<FilterChipGroup>`, wire to
   `ui.search`/`ui.filters` in state, implement client-side filter/sort logic.

7. **Add/Edit Student modals** — build `<Modal>` primitive first (reusable),
   then `<StudentForm>`, then wire Add and Edit flows through
   `useTeacherActions`. Confirm optimistic UI update + localStorage persist.

8. **Delete flow** — `<ConfirmDeleteModal>`, wire delete action, add a toast
   confirmation.

9. **Student Detail page** — profile header, editable grades table,
   attendance log, feedback timeline, all wired to the same student record
   used in the roster (so edits here reflect back in roster/dashboard).

10. **CSV Import** — `<ImportCsvModal>` with drop zone → `csvParser.ts` →
    mapping preview → validation summary → commit into state. Build this
    last among teacher features since it depends on the same upsert logic
    as manual add/edit.

11. **Student Dashboard (read-only)** — reuse `<GradesTable>` /
    `<FeedbackTimeline>` in `readOnly` mode, add `<GpaCard>`,
    `<AttendanceRing>`, `<AttendanceHeatmap>`. Verify via Role Switcher
    that each mock student sees only their own data.

12. **Empty states, loading polish, responsive pass** — empty roster/search
    results, mobile collapse of sidebar into a top bar, final spacing/
    typography audit against §1.

13. **Access-guard audit** — final pass confirming `useMyProfile` and
    `useStudents` hard-block cross-role/cross-student access, and that no
    edit affordance renders anywhere in the student role.

---

## 6. Non-Goals (explicitly out of scope for this spec)
- Real authentication/authorization (role switching is a UI simulation only).
- A real backend/database — all persistence is `localStorage`.
- Multi-teacher permissions, classes, or school-level hierarchy.
- Notifications/email delivery for feedback entries.
