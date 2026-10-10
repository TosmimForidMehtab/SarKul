# 🚀 SarKul — Premium UI/UX Overhaul Master Plan

> **Goal:** Transform SarKul from a basic CRUD app into an industry-level, premium field service management dashboard  
> **Constraint:** Old UI remains untouched. A toggle switch lets users flip between Old UI ↔ New UI  
> **Status:** 🟡 Planning Phase

---

## Table of Contents
1. [Architecture & Foundation](#1-architecture--foundation)
2. [Design System & Theme](#2-design-system--theme)
3. [Backend API Enhancements](#3-backend-api-enhancements)
4. [Module-by-Module Overhaul Plan](#4-module-by-module-overhaul-plan)
5. [Cross-Cutting Concerns](#5-cross-cutting-concerns)
6. [Execution Order & Phases](#6-execution-order--phases)
7. [Progress Tracker](#7-progress-tracker)

---

## 1. Architecture & Foundation

### 1.1 Old/New UI Toggle Strategy
- [ ] Create a `UIVersionContext` with React Context API
- [ ] Store preference in `localStorage` (`ui-version: "classic" | "modern"`)
- [ ] Add a toggle switch in `Navbar` (top-right, pill-style: `Classic ⟷ Modern`)
- [ ] `App.js` conditionally renders old routes vs new routes based on context
- [ ] Old components stay **100% untouched** in their existing folders
- [ ] New components live in `src/components-v2/` (completely separate)

### 1.2 Frontend Architecture Improvements
- [ ] Create `.env` file with `REACT_APP_API_URL` — remove all 20+ hardcoded URLs
- [ ] Create `src/services/api.js` — centralized Axios instance with:
  - Base URL from env
  - Auth token interceptor (auto-attach from sessionStorage)
  - Response error interceptor (auto-handle 401 → logout)
  - Request/response logging in dev
- [ ] Create `src/services/` folder with per-module API service files:
  - `callService.js`, `engineerService.js`, `stockService.js`, `transactionService.js`, `expenseService.js`, `groupService.js`, `myStocksService.js`, `authService.js`
- [ ] Create `src/hooks/` folder with reusable custom hooks:
  - `useApi.js` — generic data fetching with loading/error/data states
  - `useInfiniteScroll.js` — infinite loading hook
  - `useDebounce.js` — debounced search
  - `useAuth.js` — auth context hook
- [ ] Create `src/constants/` — enums, dropdown options, config values
- [ ] Create `src/utils/` — date formatters, excel export helper, validators

### 1.3 Notification & Feedback System
- [ ] Configure `react-toastify` globally (bottom-right, auto-close 3s)
- [ ] Replace ALL `alert()` calls with toast notifications
- [ ] Create reusable `<ConfirmDialog />` component for destructive actions (Close Call, Delete, Scrap, etc.)
- [ ] Create `<EmptyState />` component with illustration + message
- [ ] Create `<ErrorState />` component with retry button
- [ ] Create `<LoadingSkeleton />` components (card skeleton, table skeleton, form skeleton)

---

## 2. Design System & Theme

### 2.1 MUI Theme Setup
- [ ] Create `src/theme.js` with custom MUI theme:
  - **Primary:** `#48CCAC` (brand teal)
  - **Secondary:** `#1a2b4a` (dark navy)
  - **Error:** `#ef4444`
  - **Warning:** `#f59e0b`
  - **Success:** `#22c55e`
  - **Background:** `#f8fafc` (light gray)
  - **Surface/Cards:** `#ffffff`
  - Typography: Inter or Poppins font family
  - Rounded corners (borderRadius: 12px default)
  - Subtle shadows
- [ ] Wrap app in `<ThemeProvider>`

### 2.2 Layout System
- [ ] Create `<DashboardLayout />` — persistent sidebar + top navbar + content area
- [ ] Sidebar: collapsible, icons + labels, active state highlighting, smooth transitions
- [ ] Navbar: company logo, page title breadcrumb, search bar, UI toggle, user avatar + logout
- [ ] Content area: proper padding, max-width container, scroll management

### 2.3 Reusable Component Library (components-v2/shared/)
- [ ] `<PageHeader />` — title, subtitle, action buttons, breadcrumb
- [ ] `<DataCard />` — elevated card with hover effect, status badge
- [ ] `<FilterBar />` — collapsible filter row with chips for active filters
- [ ] `<SearchInput />` — debounced search with icon, clear button
- [ ] `<StatusBadge />` — colored pill badges (pending=amber, completed=green, etc.)
- [ ] `<StatCard />` — summary stat cards with icon (Total Calls, Pending, Closed etc.)
- [ ] `<DataTable />` — sortable columns, pagination footer, row click
- [ ] `<FormField />` — consistent form field wrapper with label, error, helper text
- [ ] `<FileUpload />` — drag-and-drop file upload with preview
- [ ] `<DateRangePicker />` — proper date range selector component
- [ ] `<InfiniteList />` — infinite scroll wrapper with loading sentinel

---

## 3. Backend API Enhancements

### 3.1 Pagination Support
- [ ] Add pagination middleware: accepts `page`, `limit` query params
- [ ] Returns: `{ data: [...], pagination: { page, limit, total, totalPages, hasMore } }`
- [ ] Apply to: `GET /call`, `GET /call/pending`, `GET /call/closed`, `GET /engineer`, `GET /stock`, `GET /transaction`, `GET /expense`
- [ ] Default: `page=1, limit=20`

### 3.2 Search Support
- [ ] `GET /call` — add `search` query param (searches across callId, customerName, customerCode, contactNumber)
- [ ] `GET /engineer` — add `search` query param (searches across employeeName, employeeCode, employeeEmail, employeeContact)
- [ ] `GET /stock` — add `search` query param (searches across stockId, itemName, serialNumber, modelNumber)
- [ ] `GET /transaction` — add `search` query param (searches across callId, engineerName, stockId)
- [ ] Use MongoDB `$regex` with case-insensitive flag for text search

### 3.3 Sorting Support
- [ ] Accept `sortBy` and `sortOrder` query params (`asc` / `desc`)
- [ ] `GET /call` — sortable by: `createdAt`, `customerName`, `status`, `category`
- [ ] `GET /engineer` — sortable by: `employeeName`, `joinDate`, `salary`, `status`
- [ ] `GET /stock` — sortable by: `itemName`, `price`, `condition`, `status`, `createdAt`
- [ ] Default: `sortBy=createdAt, sortOrder=desc`

### 3.4 Enhanced Filters
- [ ] `GET /call` — add filters: `category`, `engineerAssigned`, `itemStatus`
- [ ] `GET /stock` — add filter: `scrap`
- [ ] `GET /transaction` — add filters: `category` (b2e/e2b), `dispatchMode`
- [ ] `GET /expense` — add filters: `engineerName`, `category`, `month`

### 3.5 Dashboard Stats Endpoint (New)
- [ ] `GET /api/v1/dashboard/stats` — returns:
  ```json
  {
    "totalCalls": 150,
    "pendingCalls": 45,
    "closedCalls": 105,
    "totalEngineers": 12,
    "activeEngineers": 10,
    "totalStocks": 200,
    "availableStocks": 150,
    "officeRepairStocks": 8
  }
  ```

### 3.6 Lookup / Autocomplete Endpoints
- [ ] `GET /api/v1/call/lookup?search=abc` — lightweight endpoint returning only `{ callId, customerName }` for autocomplete dropdowns (instead of loading full call objects)
- [ ] `GET /api/v1/engineer/lookup?search=abc` — returns only `{ employeeCode, employeeName }`
- [ ] `GET /api/v1/stock/lookup?search=abc` — returns only `{ stockId, itemName, serialNumber }`

---

## 4. Module-by-Module Overhaul Plan

### 4.1 🔐 Login Page (New)
- [ ] Split-screen layout: left = brand illustration + tagline, right = login form
- [ ] Frosted glass / card effect on form
- [ ] Email + Password fields with MUI TextFields, show/hide password toggle
- [ ] "Signing in..." loading state on button with spinner
- [ ] Error shown as inline message below form (not alert)
- [ ] Company logo on top
- [ ] Subtle gradient or brand-colored background

### 4.2 🏠 Home / Dashboard (New)
- [ ] **Stat cards row:** Total Calls, Pending, Closed Today, Active Engineers, Available Stock
- [ ] **Recent Pending Calls** — mini table/list (last 5)
- [ ] **Quick Actions** — buttons: New Call, New Stock, New Transaction
- [ ] Clean welcome message with user info
- [ ] Uses the new `GET /dashboard/stats` endpoint

### 4.3 📞 Call Master Module (New)

#### Call Logs (Create Call)
- [ ] Clean multi-step or sectioned form with proper grouping
- [ ] Group field: Autocomplete with inline "Add New" (keep existing logic)
- [ ] Category: visual select with icons
- [ ] Proper validation messages inline
- [ ] Success → toast + form reset

#### Call Register (All Calls)
- [ ] **Search bar** at top (debounced, searches via API)
- [ ] **Filter bar:** Status (All/Pending/Completed), Category dropdown, Date Range
- [ ] **Sort:** by Date, Customer Name, Status (clickable column headers or dropdown)
- [ ] **Infinite scroll** instead of loading all at once
- [ ] **Cards redesigned:** status badge, category icon, engineer avatars, hover elevation
- [ ] **Excel download** button retained
- [ ] **Empty state** illustration when no results

#### Pending Calls
- [ ] Same as Register but filtered to pending
- [ ] Inline Call Assign: Autocomplete dropdown for engineer (keep existing)
- [ ] Inline Call Update: expandable section with remarks + part status (keep existing)
- [ ] Call Close: confirmation dialog before closing

#### Closed Calls
- [ ] Same layout, filtered to completed
- [ ] Show closure date, engineer remarks, resolution status

#### Call Update Page
- [ ] Call Number field → **Autocomplete dropdown** (searches pending calls via API)
- [ ] Once selected, shows call detail in a clean card layout
- [ ] Update form below with proper MUI fields
- [ ] Confirmation dialog on "Close Call"

#### Call Details
- [ ] Call Number field → **Autocomplete dropdown** 
- [ ] Beautiful detail view: two-column card, timeline of events, assigned engineers list

#### Call Assign Page
- [ ] Call Number → **Autocomplete dropdown** (pending calls)
- [ ] Engineer → **Autocomplete dropdown** (active engineers)
- [ ] Summary preview before assigning

### 4.4 📦 Stock Management Module (New)

#### Stock Entry
- [ ] Clean sectioned form with proper date pickers
- [ ] Item Name dropdown with search (Autocomplete)
- [ ] Price field with currency indicator
- [ ] Condition visual selector (color-coded chips)
- [ ] Success → toast + option to add another

#### Current Stock / All Stock
- [ ] **Search bar** (debounced)
- [ ] **Filters:** Item Name, Condition, Status, Price Range, AMC dates
- [ ] **Sort:** by name, price, condition, date
- [ ] **Infinite scroll**
- [ ] **Cards redesigned:** condition badge (green=working, red=faulty, yellow=damaged), price tag, AMC indicator
- [ ] Excel download retained

#### Office Repair
- [ ] Clean list with action buttons
- [ ] Scrap → confirmation dialog
- [ ] Repair → modal with amount field (keep existing pattern but styled better)

#### Branch Stock
- [ ] Entry form + list view (clean and simple)

### 4.5 👷 ManPower Module (New)

#### Manpower Entry
- [ ] Multi-section form: Personal Info → Employment Details → Documents → Skills
- [ ] File upload: drag-and-drop with preview
- [ ] Skills: tag-style input (type and press enter to add chips)
- [ ] Date pickers for DOB and Join Date

#### All Employees
- [ ] **Search** by name, code, email
- [ ] **Filters:** Status (active/inactive/resigned), Designation
- [ ] **Sort:** by name, join date, salary
- [ ] **Infinite scroll**
- [ ] **Cards redesigned:** avatar placeholder, status badge, contact info, skills chips

#### Manpower Info
- [ ] Employee Code → **Autocomplete dropdown**
- [ ] Detail view: clean profile card, documents section, assigned calls list

### 4.6 🔄 Part Transaction Module (New)

#### Branch to Engineer (B2E)
- [ ] Call Number → **Autocomplete** (fetches from API)
- [ ] Stock ID → **Autocomplete** (fetches from API)
- [ ] Engineer → **Autocomplete** (active engineers)
- [ ] Clean two-column form layout
- [ ] Preview/summary before submit

#### Engineer to Branch (E2B)
- [ ] Same autocomplete improvements
- [ ] Status 210 modal: styled properly with MUI Dialog

#### Transaction Details
- [ ] **Search** by call number or engineer
- [ ] **Filters:** Category (B2E/E2B), Engineer, Dispatch Mode
- [ ] **Infinite scroll**
- [ ] Cards with direction indicator (→ for B2E, ← for E2B), color coded

### 4.7 💰 Expense Module (New)

#### Expense Entry
- [ ] Formik + Yup (keep existing pattern, better styled)
- [ ] Engineer → Autocomplete
- [ ] Category → Autocomplete
- [ ] Amount with currency indicator

#### Expense List
- [ ] **Search** + **Filters:** Engineer, Category, Month, Period
- [ ] **Sort:** by date, amount, engineer
- [ ] **Infinite scroll**
- [ ] Remove hardcoded "test"/"check" filter, handle properly
- [ ] Excel download retained

---

## 5. Cross-Cutting Concerns

### 5.1 Error Handling
- [ ] Global error boundary wrapping the app
- [ ] 401 responses → auto logout + redirect to login + toast "Session expired"
- [ ] Network errors → toast "Connection lost, please check internet"
- [ ] Validation errors → inline field-level messages
- [ ] Server errors → toast with message from API

### 5.2 Loading States
- [ ] **Skeleton loaders** for lists/cards (not spinning loader replacing content)
- [ ] **Button spinners** for form submissions (button disabled + spinner inside)
- [ ] **Inline loading** for autocomplete dropdowns
- [ ] **Progress indicator** for file uploads

### 5.3 Empty States
- [ ] Custom illustration + message for each module:
  - "No pending calls" with relaxed illustration
  - "No stocks found" with empty box illustration
  - "No employees yet" with people illustration
- [ ] CTA button in empty state (e.g., "Create your first call")

### 5.4 Accessibility
- [ ] Proper `aria-label` on all interactive elements
- [ ] Keyboard navigation support
- [ ] Focus management on modals/dialogs
- [ ] Color contrast compliance

---

## 6. Execution Order & Phases

### Phase 1: Foundation (Do First) 🏗️
1. Create `.env` + centralized API service
2. Set up MUI theme + `ThemeProvider`
3. Create `UIVersionContext` + toggle mechanism
4. Create `DashboardLayout` (sidebar + navbar)
5. Set up toast notification system
6. Create shared components (`ConfirmDialog`, `EmptyState`, `ErrorState`, `LoadingSkeleton`, `SearchInput`, `StatusBadge`, `FilterBar`, `PageHeader`)
7. Create custom hooks (`useApi`, `useInfiniteScroll`, `useDebounce`, `useAuth`)

### Phase 2: Backend Enhancements 🔧
1. Add pagination middleware + apply to all GET list endpoints
2. Add search support to all GET list endpoints  
3. Add sorting support
4. Add enhanced filter params
5. Create dashboard stats endpoint
6. Create lightweight lookup/autocomplete endpoints

### Phase 3: Login + Dashboard + Layout 🎨
1. New Login page
2. New Dashboard/Home page
3. Navbar with toggle, search, breadcrumb
4. Collapsible sidebar with icons

### Phase 4: Call Master Module 📞
1. Call Register (list with search/filter/sort/infinite scroll)
2. Pending Calls + Closed Calls
3. Call Logs (create form)
4. Call Update (with autocomplete)
5. Call Assign (with autocomplete)
6. Call Details (with autocomplete)

### Phase 5: Stock Management Module 📦
1. All Stock / Current Stock (list with search/filter/sort/infinite scroll)
2. Stock Entry (form overhaul)
3. Office Repair
4. Branch Stock Entry + List

### Phase 6: ManPower Module 👷
1. All Employees (list with search/filter/sort/infinite scroll)
2. Manpower Entry (multi-section form)
3. Manpower Info (autocomplete + detail)

### Phase 7: Part Transaction + Expense 🔄💰
1. B2E + E2B forms with autocomplete
2. Transaction Details (list with search/filter)
3. Expense Entry + Expense List

### Phase 8: Polish & QA ✨
1. Edge case handling audit
2. Empty state illustrations
3. Loading skeleton refinement
4. Cross-browser testing
5. Final cleanup

---

## 7. Progress Tracker

| # | Task | Status | Phase |
|---|------|--------|-------|
| 1 | `.env` + API service layer | ✅ Done | P1 |
| 2 | MUI Theme setup | ✅ Done | P1 |
| 3 | UIVersionContext + toggle | ✅ Done | P1 |
| 4 | DashboardLayout (sidebar + navbar) | ✅ Done | P1 |
| 5 | Toast notification system | ✅ Done | P1 |
| 6 | Shared components library | ✅ Done | P1 |
| 7 | Custom hooks | 🔵 In Progress | P1 |
| 8 | BE: Pagination middleware | ✅ Done | P2 |
| 9 | BE: Search support | ✅ Done | P2 |
| 10 | BE: Sorting support | ✅ Done | P2 |
| 11 | BE: Enhanced filters | ✅ Done | P2 |
| 12 | BE: Dashboard stats endpoint | ✅ Done | P2 |
| 13 | BE: Lookup/autocomplete endpoints | ✅ Done | P2 |
| 14 | New Login page | ✅ Done | P3 |
| 15 | New Dashboard/Home | ✅ Done | P3 |
| 16 | New Navbar + Sidebar | ✅ Done | P3 |
| 17 | Call Register (new) | ✅ Done | P4 |
| 18 | Pending + Closed Calls (new) | ✅ Done | P4 |
| 19 | Call Logs / Create Call (new) | ✅ Done | P4 |
| 20 | Call Update (new) | ✅ Done | P4 |
| 21 | Call Assign (new) | ✅ Done | P4 |
| 22 | Call Details (new) | ✅ Done | P4 |
| 23 | All/Current Stock (new) | ✅ Done | P5 |
| 24 | Stock Entry (new) | ✅ Done | P5 |
| 25 | Office Repair (new) | ✅ Done | P5 |
| 26 | Branch Stock (new) | ✅ Done | P5 |
| 27 | All Employees (new) | ✅ Done | P6 |
| 28 | Manpower Entry (new) | ✅ Done | P6 |
| 29 | Manpower Info (new) | ✅ Done | P6 |
| 30 | B2E + E2B forms (new) | ✅ Done | P7 |
| 31 | Transaction Details (new) | ✅ Done | P7 |
| 32 | Expense Entry + List (new) | ✅ Done | P7 |
| 33 | Edge case audit | ⬜ Not Started | P8 |
| 34 | Empty state illustrations | ⬜ Not Started | P8 |
| 35 | Final polish & cleanup | ⬜ Not Started | P8 |

---

> **Legend:**  ⬜ Not Started | 🔵 In Progress | ✅ Done | ⏸️ Blocked

---

*Last Updated: September 27, 2026 — Planning Phase*
