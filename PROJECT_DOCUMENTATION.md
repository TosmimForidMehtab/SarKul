# SarKul — Complete End-to-End Project Documentation

> **Domain:** Field Service Management, Engineer Management & Inventory Tracking Platform  
> **Stack:** MERN (MongoDB, Express.js, React.js, Node.js)  
> **Company:** Sarkul Technology Private Limited  
> **Frontend Author:** Md Faizan Hashmi  
> **Backend Author:** Tosmim Forid Mehtab

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & Folder Structure](#2-architecture--folder-structure)
3. [Backend — Complete Deep Dive](#3-backend--complete-deep-dive)
   - [3.1 Entry Point & Server Setup](#31-entry-point--server-setup)
   - [3.2 Dependencies](#32-dependencies)
   - [3.3 Database Configuration](#33-database-configuration)
   - [3.4 Database Models (Schemas)](#34-database-models-schemas)
   - [3.5 API Routes Table](#35-api-routes-table)
   - [3.6 Controllers (Business Logic)](#36-controllers-business-logic)
   - [3.7 Middlewares](#37-middlewares)
   - [3.8 Utility Functions](#38-utility-functions)
   - [3.9 Environment Variables](#39-environment-variables)
4. [Frontend — Complete Deep Dive](#4-frontend--complete-deep-dive)
   - [4.1 Entry Point & App Setup](#41-entry-point--app-setup)
   - [4.2 Dependencies](#42-dependencies)
   - [4.3 Routing Table](#43-routing-table)
   - [4.4 Authentication Flow](#44-authentication-flow)
   - [4.5 State Management](#45-state-management)
   - [4.6 UI/UX Patterns & Styling](#46-uiux-patterns--styling)
   - [4.7 Component Deep Dive — Call Master Module](#47-component-deep-dive--call-master-module)
   - [4.8 Component Deep Dive — Stock Management Module](#48-component-deep-dive--stock-management-module)
   - [4.9 Component Deep Dive — ManPower Module](#49-component-deep-dive--manpower-module)
   - [4.10 Component Deep Dive — Part Transaction Module](#410-component-deep-dive--part-transaction-module)
   - [4.11 Component Deep Dive — Expense Module](#411-component-deep-dive--expense-module)
   - [4.12 Sidebar Navigation](#412-sidebar-navigation)
   - [4.13 Helper/Shared Components](#413-helpershared-components)
   - [4.14 Error Handling & Loading States](#414-error-handling--loading-states)
5. [End-to-End Feature Flows](#5-end-to-end-feature-flows)
6. [Data Flow Diagrams](#6-data-flow-diagrams)
7. [Todo / Pending Items](#7-todo--pending-items)

---

## 1. Project Overview

**SarKul** is a full-stack web application built for **Sarkul Technology Private Limited** to manage their day-to-day field service operations. The platform covers five core business domains:

| Module | Purpose |
|--------|---------|
| **Call Master** | Create, assign, track, update, and close customer service calls/tickets |
| **Stock Management** | Track inventory items (printers, laptops, RAM, etc.) with AMC dates, conditions, and pricing |
| **ManPower** | Manage engineer/employee profiles, documents, salaries, and skills |
| **Part Transactions** | Track movement of parts between branch and engineers (B2E / E2B) |
| **Expenses** | Log and categorize operational expenses per engineer |

The system uses **OTP-based email authentication** with **JWT tokens** for session management. Only **ADMIN** users can access the platform.

---

## 2. Architecture & Folder Structure

```
SarKul/
├── .gitignore
├── .todo                          # Feature checklist with status
├── README.md                      # Project intro and team credits
├── oblgvec.*.png                  # Onboarding/login illustration asset
│
├── backend/
│   ├── index.js                   # Express server entry point
│   ├── package.json
│   ├── config/
│   │   └── db.js                  # MongoDB connection via Mongoose
│   ├── controllers/
│   │   ├── auth.controller.js     # OTP, Sign-in, User CRUD
│   │   ├── call.controller.js     # Call CRUD, assign, close
│   │   ├── engineer.controller.js # Engineer CRUD with file uploads
│   │   ├── expense.controller.js  # Expense CRUD
│   │   ├── group.controller.js    # Group CRUD
│   │   ├── mystocks.controller.js # Branch stocks CRUD
│   │   ├── stock.controller.js    # Stock CRUD with filters
│   │   └── tranaction.controller.js # Transaction CRUD (B2E/E2B)
│   ├── middlewares/
│   │   ├── auth.middlewares.js    # JWT verification & admin check
│   │   ├── call.middlewares.js    # Call payload validation
│   │   ├── engineer.middleware.js # Engineer payload validation
│   │   ├── multer.js              # File upload to /public/temp
│   │   ├── stock.middlewares.js   # Stock payload validation
│   │   └── transaction.middlewares.js # Transaction payload validation
│   ├── models/
│   │   ├── call.model.js
│   │   ├── engineer.model.js
│   │   ├── expense.model.js
│   │   ├── group.model.js
│   │   ├── myStocks.js
│   │   ├── stock.model.js
│   │   ├── transaction.model.js
│   │   └── user.model.js
│   ├── routes/
│   │   ├── index.js               # Central route aggregator
│   │   ├── call.routes.js
│   │   ├── engineer.routes.js
│   │   ├── expense.routes.js
│   │   ├── group.routes.js
│   │   ├── mystocks.routes.js
│   │   ├── stock.routes.js
│   │   ├── transaction.routes.js
│   │   └── user.routes.js
│   ├── utils/
│   │   ├── ApiError.js            # Standardized error class
│   │   ├── ApiResponse.js         # Standardized response class
│   │   ├── cloudinary.js          # Upload/delete from Cloudinary
│   │   ├── idGenerator.js         # Crypto-based ID generation
│   │   └── mailer.js              # Nodemailer OTP sender
│   └── public/
│       └── temp/                  # Temporary file upload directory
│
└── frontend/
    └── sarkul-front-end/
        ├── package.json
        ├── public/
        │   ├── index.html
        │   └── favicon.ico
        └── src/
            ├── App.js             # Root component with routing
            ├── App.css
            ├── index.js           # React DOM render entry
            ├── index.css          # Global CSS variables
            ├── test.js
            ├── assets/            # Static images (logos, page headers)
            └── components/
                ├── Button/        # Reusable button component
                ├── CallMaster/    # 7 components for call management
                ├── Expense/       # 3 components for expenses
                ├── Helper/        # Shared detail/card components
                ├── Loader/        # Loading spinner
                ├── Login/         # Authentication screen
                ├── Logout/        # Logout confirmation
                ├── ManPower/      # 3 components for engineer mgmt
                ├── Navbar/        # Top navigation bar
                ├── Pages/         # Page-level wrapper components
                ├── PartTransaction/ # 3 components for part tracking
                ├── Sidebar/       # 6 sidebar variants
                ├── StockManagement/ # 6 components for inventory
                └── WelcomePage/   # Landing welcome component
```

---

## 3. Backend — Complete Deep Dive

### 3.1 Entry Point & Server Setup

**File:** `backend/index.js`

The Express server initializes with the following middleware stack:

```
cors()                              → Cross-origin (all origins allowed by default)
cookieParser()                      → Parses cookies (for JWT token)
express.json()                      → Parses JSON request bodies
express.urlencoded({ extended: true }) → Parses URL-encoded bodies
```

**Route Mountpoints:**

| Prefix | Router |
|--------|--------|
| `/api/v1/user` | User/Auth routes |
| `/api/v1/call` | Call routes |
| `/api/v1/engineer` | Engineer routes |
| `/api/v1/stock` | Stock routes |
| `/api/v1/transaction` | Transaction routes |
| `/api/v1/mystocks` | Branch stock routes |
| `/api/v1/group` | Group routes |
| `/api/v1/expense` | Expense routes |

The server connects to MongoDB via `connectDB()` and listens on `process.env.PORT`.

---

### 3.2 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | 4.18.2 | Web framework |
| `mongoose` | 8.0.4 | MongoDB ODM |
| `bcryptjs` | 2.4.3 | Password hashing |
| `jsonwebtoken` | 9.0.2 | JWT token generation/verification |
| `cookie-parser` | 1.4.6 | Cookie parsing middleware |
| `cors` | 2.8.5 | Cross-origin resource sharing |
| `dotenv` | 16.3.1 | Environment variable loading |
| `cloudinary` | 1.41.3 | Cloud file storage for documents |
| `multer` | 1.4.5-lts.1 | File upload handling |
| `nodemailer` | 6.9.8 | Email sending (OTP) |
| `validator` | 13.11.0 | Data validation (email, phone, password) |

**Scripts:**
- `npm run dev` → `nodemon index.js` (development with hot reload)
- `npm start` → `node index.js` (production)

---

### 3.3 Database Configuration

**File:** `backend/config/db.js`

- Connects to MongoDB using `mongoose.connect(process.env.MONGO_URI)`
- Connection is established before the server starts listening

---

### 3.4 Database Models (Schemas)

#### 3.4.1 User Model (`models/user.model.js`)

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `email` | String | required | — |
| `password` | String | required | Validated via `validator.isStrongPassword` (min 6 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol) |
| `otp` | String | — | Stores JWT-signed OTP |
| `role` | String | enum: `["ADMIN", "USER"]`, default: `"USER"` | — |

**Hooks:**
- `pre("save")`: Hashes password with `bcryptjs` (salt factor 10) if password field is modified

**Instance Methods:**
- `generateAccessToken()`: Signs a JWT with `{ _id, email, role }`, expires in **3 days**
- `isPasswordCorrect(password)`: Compares plain text with hashed password via `bcrypt.compare()`

---

#### 3.4.2 Call Model (`models/call.model.js`)

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `callId` | String | unique, indexed | Auto-generated via crypto |
| `serialNumber` | String | — | Device serial number |
| `customerName` | String | required | — |
| `userName` | String | — | — |
| `customerCode` | String | required | — |
| `contactNumber` | String | required | Validated via `validator.isMobilePhone` |
| `customerEmail` | String | — | Validation commented out |
| `customerAddress` | String | required | — |
| `problemDescription` | String | required | — |
| `itemName` | String | required | — |
| `status` | String | enum: `["pending", "completed"]`, default: `"pending"` | — |
| `category` | String | required, enum: `["desktop", "laptop", "printer", "plotter", "scanner", "server", "UPS", "cctv", "activity"]` | Device type |
| `itemModelNumber` | String | — | — |
| `engineerName` | String | — | — |
| `engineersAssigned` | [ObjectId] | ref: `Engineer` | Array of assigned engineer IDs |
| `closedAt` | Date | — | Set when call is closed |
| `customerRemark` | String | — | — |
| `engineerRemark` | String | — | — |
| `itemStatus` | String | enum: `["required", "pending", "replace", "chargeable", "serviceAndClose", "cancelAndClose", "customerDependence"]` | Resolution status |

**Timestamps:** Enabled (auto `createdAt`, `updatedAt`)

---

#### 3.4.3 Engineer Model (`models/engineer.model.js`)

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `employeeName` | String | required | — |
| `employeeAddress` | String | required | — |
| `employeeDesignation` | String | required | — |
| `employeeCode` | Number | unique | Auto-generated via crypto |
| `employeeDOB` | Date | required | — |
| `joinDate` | Date | required | — |
| `employeeContact` | String | required | Validated via `validator.isMobilePhone` |
| `employeeEmail` | String | required | Validated via `validator.isEmail` |
| `idProof` | String | required | Cloudinary URL |
| `qualification` | String | required | — |
| `certificate` | String | required | Cloudinary URL |
| `reference` | String | — | — |
| `salary` | Number | required | — |
| `status` | String | enum: `["active", "inactive", "resigned"]`, default: `"active"` | — |
| `resignedAt` | Date | — | — |
| `incrementDueDate` | Date | — | — |
| `revisedSalary` | String | — | — |
| `revisedDesignation` | String | — | — |
| `increementAmount` | String | — | — |
| `remarks` | String | — | — |
| `experience` | String | — | — |
| `assignedTo` | [String] | — | Array of assigned call IDs |
| `skills` | [String] | — | — |

**Timestamps:** Enabled

---

#### 3.4.4 Stock Model (`models/stock.model.js`)

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `itemName` | String | required | Large enum: `printer`, `scanner`, `Motherboard`, `RAM`, `HDD`, `SSD`, `Cable`, `Adapter`, `Cartridge`, `Keyboard`, `Mouse`, `Monitor`, `Laptop`, `Desktop`, `UPS`, `Battery`, `Power Supply`, `CCTV`, `DVR`, `NVR`, `Speaker`, etc. |
| `stockId` | String | required | Auto-generated via crypto |
| `itemPart` | String | — | — |
| `serialNumber` | String | — | — |
| `configuration` | String | — | — |
| `modelNumber` | String | required | — |
| `amcStartDate` | Date | — | AMC period start |
| `amcEndDate` | Date | — | AMC period end |
| `price` | Number | — | — |
| `condition` | String | enum: `["faulty", "working", "damaged", "new", "repaired"]`, default: `"working"` | — |
| `status` | String | enum: `["available", "unavailable"]`, default: `"available"` | — |
| `officeRepair` | String | enum: `["yes", "no"]`, default: `"no"` | Flagged when returned from engineer |
| `scrap` | String | enum: `["yes", "no"]`, default: `"no"` | Marked when item is scrapped |

**Timestamps:** Enabled

---

#### 3.4.5 Transaction Model (`models/transaction.model.js`)

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `category` | String | enum: `["e2b", "b2e"]`, default: `"b2e"` | Direction of part movement |
| `callId` | String | required | Associated service call |
| `itemName` | String | enum: same as Stock model | — |
| `dispatchMode` | String | enum: `["RGP", "NRGP", "consumable"]` | Returnable/Non-returnable gate pass |
| `modelNumber` | String | — | — |
| `stockId` | String | — | — |
| `serialNumber` | String | — | — |
| `partName` | String | — | — |
| `engineerName` | String | required | — |
| `partStatus` | String | enum: `["working", "faulty", "damaged"]` | — |

**Timestamps:** Enabled

---

#### 3.4.6 Expense Model (`models/expense.model.js`)

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `engineerName` | String | — | — |
| `category` | String | — | Expense category |
| `month` | String | — | — |
| `period` | String | — | e.g., "1-15", "16-30" |
| `amount` | Number | — | — |
| `remarks` | String | — | — |

**Timestamps:** Enabled

---

#### 3.4.7 Group Model (`models/group.model.js`)

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `groupName` | String | — | Customer group/company name |

**Timestamps:** Enabled

---

#### 3.4.8 MyStocks Model (`models/myStocks.js`)

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `itemName` | String | — | — |
| `serialNumber` | String | — | — |
| `brand` | String | — | — |
| `price` | Number | — | — |
| `warrantyStart` | Date | — | — |
| `warrantyEnd` | Date | — | — |

**Timestamps:** Disabled

---

### 3.5 API Routes Table

#### User / Auth Routes (`/api/v1/user`)

| Method | Path | Middleware | Controller | Purpose |
|--------|------|-----------|------------|---------|
| POST | `/send-otp` | — | `sendOtp` | Send OTP to admin email |
| POST | `/verify-otp` | `verifyOtp` | — | Verify OTP, then proceed |
| POST | `/create` | `verifyToken`, `isAdmin` | `createUser` | Create a new user |
| POST | `/signin` | — | `signIn` | Login with email/password |
| DELETE | `/delete/:id` | `verifyToken`, `isAdmin` | `deleteUser` | Delete a user |

#### Call Routes (`/api/v1/call`)

| Method | Path | Middleware | Controller | Purpose |
|--------|------|-----------|------------|---------|
| POST | `/` | `verifyToken`, `createCallValidation` | `createCall` | Create a service call |
| GET | `/` | `verifyToken` | `getAllCalls` | Get all calls (with filters) |
| GET | `/pending` | `verifyToken` | `getPendingCalls` | Get pending calls only |
| GET | `/closed` | `verifyToken` | `getClosedCalls` | Get completed calls only |
| GET | `/:callId` | `verifyToken` | `getCallById` | Get single call by callId |
| PATCH | `/:callId` | `verifyToken` | `updateCall` | Update call details |
| POST | `/assign` | `verifyToken`, `assignCallValidation` | `assignCallToEngineer` | Assign engineer to call |
| POST | `/close/:callId` | `verifyToken` | `closeCall` | Close/complete a call |

#### Engineer Routes (`/api/v1/engineer`)

| Method | Path | Middleware | Controller | Purpose |
|--------|------|-----------|------------|---------|
| POST | `/` | `verifyToken`, `upload.fields(...)`, `createEngineerValidation` | `createEngineer` | Create engineer (with file uploads) |
| GET | `/` | `verifyToken` | `getAllEngineers` | Get all engineers (with filters) |
| GET | `/:employeeCode` | `verifyToken` | `getEngineerById` | Get single engineer |
| PATCH | `/:employeeCode` | `verifyToken` | `updateEngineer` | Update engineer details |

#### Stock Routes (`/api/v1/stock`)

| Method | Path | Middleware | Controller | Purpose |
|--------|------|-----------|------------|---------|
| POST | `/` | `verifyToken`, `createStockValidation` | `createStock` | Add new stock item |
| GET | `/` | `verifyToken` | `getAllStocks` | Get all stocks (with filters) |
| GET | `/:stockId` | `verifyToken` | `getStockById` | Get single stock |
| PATCH | `/:stockId` | `verifyToken` | `updateStock` | Update stock details |
| DELETE | `/:stockId` | `verifyToken`, `isAdmin` | `deleteStock` | Delete stock (admin only) |

#### Transaction Routes (`/api/v1/transaction`)

| Method | Path | Middleware | Controller | Purpose |
|--------|------|-----------|------------|---------|
| POST | `/` | `verifyToken`, `createTransactionValidation` | `createTransaction` | Create a transaction |
| GET | `/` | `verifyToken` | `getAllTransactions` | Get all transactions (with filters) |
| GET | `/:id` | `verifyToken` | `getTransactionById` | Get single transaction |

#### MyStocks Routes (`/api/v1/mystocks`)

| Method | Path | Middleware | Controller | Purpose |
|--------|------|-----------|------------|---------|
| POST | `/` | `verifyToken` | `createMyStock` | Add branch stock |
| GET | `/` | `verifyToken` | `getAllMyStocks` | Get all branch stocks |

#### Group Routes (`/api/v1/group`)

| Method | Path | Middleware | Controller | Purpose |
|--------|------|-----------|------------|---------|
| POST | `/` | `verifyToken` | `createGroup` | Create a group |
| GET | `/` | `verifyToken` | `getAllGroups` | Get all groups |

#### Expense Routes (`/api/v1/expense`)

| Method | Path | Middleware | Controller | Purpose |
|--------|------|-----------|------------|---------|
| POST | `/` | `verifyToken` | `createExpense` | Create an expense |
| GET | `/` | `verifyToken` | `getAllExpenses` | Get all expenses |
| GET | `/:id` | `verifyToken` | `getExpenseById` | Get single expense |

---

### 3.6 Controllers (Business Logic)

#### 3.6.1 Auth Controller (`controllers/auth.controller.js`)

**`sendOtp`**
1. Reads `ADMIN_EMAIL` from environment
2. Generates a random 6-digit OTP: `Math.floor(100000 + Math.random() * 900000)`
3. Signs the OTP inside a JWT with `OTP_SECRET`, expiring in **10 minutes**
4. Stores the JWT-signed OTP in `user.otp` field
5. Sends the OTP via `mailer()` to the admin email in an HTML-formatted email

**`verifyOtp`**
1. Receives `otp` from request body
2. Finds the user, decodes their stored `otp` JWT
3. Compares the decoded OTP with the submitted OTP
4. If match: clears `user.otp` to null, calls `next()`
5. If mismatch or expired: returns error

**`signIn`**
1. Finds user by `email`
2. Calls `isPasswordCorrect()` to validate password
3. Generates JWT via `generateAccessToken()`
4. Sets cookie: `accessToken`, with options: `httpOnly: true`, `secure: true`, `maxAge: 48 hours`
5. Returns the token in response body as well

**`createUser`**
1. Protected by `verifyToken` + `isAdmin`
2. Creates a new User document with provided email, password, role

**`deleteUser`**
1. Protected by `verifyToken` + `isAdmin`
2. Deletes user by `_id`

---

#### 3.6.2 Call Controller (`controllers/call.controller.js`)

**`createCall`**
1. Generates a unique `callId` using `generateCallId()` (crypto-based hex)
2. Creates a Call document with all provided fields
3. Returns 201 with the created call

**`getAllCalls`**
1. Uses MongoDB **aggregation pipeline**
2. Filters by `startDate`/`endDate` via `$match` on `createdAt`
3. Filters by `status` if provided
4. Performs `$lookup` to populate `engineersAssigned` from the `engineers` collection
5. Uses `$project` to format the `engineersAssigned` array (extracts `employeeName` from each)
6. Sorts by `createdAt` descending
7. Returns array of calls

**`getCallById`**
1. Finds call by `callId` (not MongoDB `_id`)
2. Returns the call document

**`updateCall`**
1. Finds call by `callId` and updates with request body
2. Returns updated document

**`assignCallToEngineer`**
1. Validates both the call (by `callId`) and engineer (by `employeeCode`) exist
2. Checks call is not already completed
3. Pushes engineer's `_id` into call's `engineersAssigned` array
4. Pushes `callId` into engineer's `assignedTo` array
5. Saves both documents

**`closeCall`**
1. Finds call by `callId`
2. Sets `status` to `"completed"` and `closedAt` to `Date.now()`
3. Iterates through all `engineersAssigned`, pulls the `callId` from each engineer's `assignedTo` array
4. Sets `engineerRemark`, `customerRemark`, `itemStatus` from request body

**`getPendingCalls` / `getClosedCalls`**
1. Similar to `getAllCalls` but with hardcoded `status` filter
2. Support `startDate`/`endDate` query params

---

#### 3.6.3 Engineer Controller (`controllers/engineer.controller.js`)

**`createEngineer`**
1. Validates `employeeDOB < joinDate`
2. Gets file paths from `req.files` (idProof, certificate)
3. Uploads both files to **Cloudinary** via `uploadOnCloudinary()`
4. Generates unique `employeeCode` via `generateEngineerId()` (crypto-based integer mod 1000000)
5. Creates Engineer document with all fields + Cloudinary URLs

**`getAllEngineers`**
1. Accepts query params for filtering (`status`, etc.)
2. Returns all matching engineers

**`getEngineerById`**
1. Finds engineer by `employeeCode`

**`updateEngineer`**
1. Finds by `employeeCode` and updates
2. Handles salary revision, designation changes, resignation status

---

#### 3.6.4 Stock Controller (`controllers/stock.controller.js`)

**`createStock`**
1. Generates unique `stockId` via `generateStockId()` (crypto-based integer mod 1000000000)
2. Creates Stock document
3. Returns 201

**`getAllStocks`**
1. Supports query filters: `status`, `condition`, `officeRepair`, `scrap`, `itemName`
2. Supports price range: `minPrice`, `maxPrice`
3. Supports AMC date range: `amcStartDate`, `amcEndDate` (validates start < end)
4. Returns filtered stocks sorted by `createdAt` descending

**`getStockById`**
1. Finds by `stockId`

**`updateStock`**
1. Finds by `stockId` and updates with request body
2. Used for condition changes, office repair flags, scrap marking, price updates

**`deleteStock`**
1. Admin-only endpoint
2. Deletes by `stockId`

---

#### 3.6.5 Transaction Controller (`controllers/tranaction.controller.js`)

**`createTransaction`**
1. If `category === "b2e"` (Branch → Engineer):
   - Validates stock exists by `serialNumber`
   - Creates transaction document
   - Updates Stock `status` to `"unavailable"`
2. If `category === "e2b"` (Engineer → Branch):
   - Checks if stock exists by `stockId`
   - If stock exists: creates transaction, sets stock `officeRepair` to `"yes"`
   - If stock doesn't exist: returns **status 210** (custom code signaling frontend to create a new stock entry for office repair)

**`getAllTransactions`**
1. Supports filtering by `engineerName`, `callId`
2. Returns filtered transactions

---

#### 3.6.6 Other Controllers

**Expense Controller:** Simple CRUD — create, getAll, getById  
**Group Controller:** Simple CRUD — create, getAll  
**MyStocks Controller:** Simple CRUD — create, getAll  

---

### 3.7 Middlewares

#### 3.7.1 Auth Middleware (`middlewares/auth.middlewares.js`)

**`verifyToken`**
1. Searches for JWT token in this order:
   - `req.cookies.accessToken`
   - `req.headers.authorization` (Bearer token)
   - `req.headers["x-access-token"]`
2. Decodes with `ACCESS_TOKEN_SECRET`
3. Finds user by decoded `_id`, attaches to `req.user`
4. Calls `next()`

**`isAdmin`**
1. Checks `req.user.role === "ADMIN"`
2. If not admin, returns 403

---

#### 3.7.2 Validation Middlewares

**`createCallValidation`** — Required fields: `customerName`, `customerCode`, `contactNumber`, `customerAddress`, `problemDescription`, `category`, `itemName`, `itemModelNumber`

**`assignCallValidation`** — Required fields: `callNumber`, `engineerCode`

**`createEngineerValidation`** — Required fields: `employeeName`, `employeeAddress`, `employeeDesignation`, `employeeDOB`, `joinDate`, `employeeContact`, `employeeEmail`, `salary`, `qualification`, `experience`

**`createStockValidation`** — Required fields: `itemName`, `modelNumber`

**`createTransactionValidation`** — Required fields: `callId`, `engineerName`, `itemName`, `category`

---

#### 3.7.3 Multer Middleware (`middlewares/multer.js`)

- Uses `multer.diskStorage` to save files to `./public/temp`
- Filename format: `{Date.now()}-{originalname}`
- Files are temporarily stored here before being uploaded to Cloudinary

---

### 3.8 Utility Functions

#### 3.8.1 ApiError (`utils/ApiError.js`)
```
class ApiError extends Error {
    constructor(statusCode, message, errors = [], stack)
    Properties: statusCode, message, data (null), success (false), errors
}
```

#### 3.8.2 ApiResponse (`utils/ApiResponse.js`)
```
class ApiResponse {
    constructor(statusCode, data, message)
    Properties: statusCode, data, message, success (statusCode < 400)
}
```

#### 3.8.3 Cloudinary (`utils/cloudinary.js`)

**`uploadOnCloudinary(localFilePath)`**
1. Configures Cloudinary with env vars: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
2. Uploads with `resource_type: "raw"`
3. Deletes local file via `fs.unlinkSync()` after upload
4. Returns Cloudinary response (includes URL)

**`deleteFromCloudinary(url)`**
1. Extracts `publicId` from the Cloudinary URL
2. Calls `cloudinary.uploader.destroy()` to remove the file

#### 3.8.4 ID Generator (`utils/idGenerator.js`)

Uses Node.js `crypto.randomBytes(3)` (cryptographically secure):

| Function | Output Format | Range |
|----------|--------------|-------|
| `generateCallId()` | Hex string | 6-char hex (e.g., `"a3f2c1"`) |
| `generateEngineerId()` | Integer | 0 – 999,999 |
| `generateStockId()` | Integer | 0 – 999,999,999 |

#### 3.8.5 Mailer (`utils/mailer.js`)

1. Creates `nodemailer` transport with Gmail service
2. Uses `EMAIL` and `PASS` from environment (Gmail app password)
3. Generates 6-digit OTP: `Math.floor(100000 + Math.random() * 900000)`
4. Sends HTML email with OTP to the specified recipient
5. Returns the generated OTP value

---

### 3.9 Environment Variables

| Variable | Purpose |
|----------|---------|
| `PORT` | Server port |
| `MONGO_URI` | MongoDB connection string |
| `ACCESS_TOKEN_SECRET` | JWT signing secret for auth tokens |
| `OTP_SECRET` | JWT signing secret for OTP tokens |
| `ADMIN_EMAIL` | Admin email address for OTP delivery |
| `EMAIL` | Gmail address for sending emails |
| `PASS` | Gmail app password for SMTP |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

---

## 4. Frontend — Complete Deep Dive

### 4.1 Entry Point & App Setup

**File:** `frontend/sarkul-front-end/src/index.js`
- Renders `<App />` wrapped in `<BrowserRouter>` into the `#root` DOM element

**File:** `frontend/sarkul-front-end/src/App.js`
- **Authentication gate:** Checks `sessionStorage.getItem("accessToken")`
  - If **no token** → renders only `<Login />`
  - If **token exists** → renders `<Navbar />` + `<Routes>` with all protected routes

---

### 4.2 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.2.0 | UI library |
| `react-dom` | ^18.2.0 | DOM rendering |
| `react-router-dom` | ^6.21.2 | Client-side routing |
| `axios` | ^1.6.5 | HTTP client for API calls |
| `@mui/material` | ^5.15.5 | Material UI components |
| `@mui/icons-material` | ^5.15.11 | Material UI icons |
| `@emotion/react` | ^11.11.3 | CSS-in-JS (MUI dependency) |
| `@emotion/styled` | ^11.11.0 | Styled components (MUI dependency) |
| `formik` | ^2.4.5 | Form state management |
| `yup` | ^1.5.0 | Form validation schemas |
| `react-toastify` | ^10.0.4 | Toast notifications |
| `react-icons` | ^5.0.1 | Icon library |
| `exceljs` | ^4.4.0 | Excel file generation |
| `xlsx` | ^0.18.5 | Excel file handling |
| `react-scripts` | 5.0.1 | CRA build toolchain |

---

### 4.3 Routing Table

| Path | Component | Module |
|------|-----------|--------|
| `/` | `Home` | Landing |
| `/callmaster` | `CallMasterPage` | Call Master |
| `/callmaster/call-logs` | `CallLogs` | Call Master |
| `/callmaster/call-assign` | `CallAssign` | Call Master |
| `/callmaster/call-register` | `CallRegister` | Call Master |
| `/callmaster/call-update` | `CallUpdate` | Call Master |
| `/callmaster/call-closed` | `ClosedCall` | Call Master |
| `/callmaster/call-pending` | `PendingCallReports` | Call Master |
| `/callmaster/call-details` | `CallDetailsPage` | Call Master |
| `/callmaster/call-details-specific/:callId` | `CallDetails` | Call Master |
| `/stockmanagement` | `StockManagementPage` | Stock |
| `/stockmanagement/stock-entry` | `StockEntry` | Stock |
| `/stockmanagement/branch-stock-form` | `BranchStockEntry` | Stock |
| `/stockmanagement/current-stock` | `CurrentStock` | Stock |
| `/stockmanagement/all-stock` | `AllStock` | Stock |
| `/stockmanagement/branch-stock-list` | `BranchStockList` | Stock |
| `/stockmanagement/office-repair` | `OfficeRepair` | Stock |
| `/stockmanagement/current-stock-specific/:stockId` | `StockDetail` | Stock |
| `/parttransaction` | `PartTransaction` | Transactions |
| `/parttransaction/branch-to-engineer` | `BranchToEngineer` | Transactions |
| `/parttransaction/engineer-to-branch` | `EngineerToBranch` | Transactions |
| `/parttransaction/part-transaction-detail` | `PartTransactionDetail` | Transactions |
| `/invoice` | `InvoicePage` | Invoice |
| `/manpower` | `ManPower` | ManPower |
| `/manpower/manpower-entry` | `ManpowerEntry` | ManPower |
| `/manpower/manpower-info` | `ManpowerInfo` | ManPower |
| `/manpower/manpower-all` | `AllEmployee` | ManPower |
| `/manpower/manpower-specific/:empId` | `EmployeeDetail` | ManPower |
| `/expense` | `Expense` | Expense |
| `/expense-entry` | `ExpenseEntry` | Expense |
| `/expense-list` | `ExpenseList` | Expense |
| `/logout` | `Logout` | Auth |

---

### 4.4 Authentication Flow

```
┌─────────────────────────────────────────────────────┐
│                    LOGIN FLOW                       │
├─────────────────────────────────────────────────────┤
│ 1. User opens app                                   │
│ 2. App.js checks sessionStorage("accessToken")      │
│ 3. No token → render <Login />                      │
│ 4. User enters Email + Password                     │
│ 5. POST /api/v1/user/signin                         │
│ 6. Server validates, returns JWT                    │
│ 7. Token stored: sessionStorage.setItem()           │
│ 8. window.location.reload(true)                     │
│ 9. App re-mounts, token found → show dashboard     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                   LOGOUT FLOW                       │
├─────────────────────────────────────────────────────┤
│ 1. User clicks logout icon in Navbar                │
│ 2. Navigates to /logout                             │
│ 3. Confirmation: "Are you sure?"                    │
│ 4. Yes → sessionStorage.removeItem("accessToken")   │
│    → navigate('/') → window.location.reload(true)   │
│ 5. No → navigate(-1) (go back)                     │
└─────────────────────────────────────────────────────┘
```

**API Authentication:** Every authenticated request attaches the token from `sessionStorage` as `Authorization: Bearer <token>` header.

**Backend API URL:** Hardcoded across components: `https://sarkultechapi.onrender.com/api/v1/...`

---

### 4.5 State Management

| Aspect | Approach |
|--------|----------|
| **Global Auth State** | `sessionStorage.getItem("accessToken")` — no context/Redux |
| **Local Component State** | `useState` for UI toggles, loading flags, API data |
| **Form State (most forms)** | **Uncontrolled** — `useRef` to read values on submit |
| **Form State (StockEntry, ExpenseEntry)** | **Formik + Yup** for controlled forms with validation |
| **Navigation State** | `useNavigate()`, `useLocation()` from react-router-dom |

---

### 4.6 UI/UX Patterns & Styling

- **CSS Strategy:** Mix of plain CSS files (per component) + Material UI (MUI) components
- **Global CSS Variables** (defined in `index.css`):
  - `--blue`, `--darkblue`, `--white`, and brand teal `#48CCAC`
- **Layout Pattern:** `<Navbar />` (top) + `<Sidebar />` (left) + Content (right)
- **MUI Components Used:** `Stack`, `Button`, `TextField`, `Autocomplete`, `Select`, `MenuItem`
- **Icons:** `react-icons` (`GrLogout`) and `@mui/icons-material`
- **Responsive:** CSS-based responsive design with media queries

---

### 4.7 Component Deep Dive — Call Master Module

#### CallLogs (Create New Call)
- **API Endpoints:**
  - `GET /api/v1/group` — fetches groups for Autocomplete dropdown
  - `POST /api/v1/group` — creates new group inline
  - `POST /api/v1/call` — submits new call
- **Form Fields:** Serial Number, Customer Name, Customer Code, User Name, Contact, Email, Category (Select with 9 device types), Group (Autocomplete with "add new" option), Address, Problem Description, Model Number
- **Special Logic:** Group Autocomplete allows creating new groups on-the-fly

#### CallAssign (Assign Engineer to Call)
- **API Endpoints:**
  - `GET /api/v1/engineer?status=active` — fetches active engineers
  - `POST /api/v1/call/assign` — assigns engineer
- **Form Fields:** Call Number (text), Engineer Name (select dropdown)

#### CallRegister / ClosedCall / PendingCallReports (List Views)
- **API Endpoints:**
  - `GET /api/v1/call` (Register — all calls)
  - `GET /api/v1/call/closed` (Closed calls)
  - `GET /api/v1/call/pending` (Pending calls)
  - All support `?startDate={}&endDate={}` query params
- **Table/Excel Columns:** Date, Call Id, Customer Name, Customer Code, User Name, Contact Number, Customer Email, Problem Description, Engineers Assigned, Serial Number, Customer Address, Status, Category, Group, Item Model Number
- **Special Logic:** Download as Excel using `exceljs` library; renders `<CallCard />` for each call

#### CallUpdate (Update/Close Call)
- **API Endpoints:**
  - `GET /api/v1/call/{callNumber}` — fetch call details
  - `PATCH /api/v1/call/{callNumber}` — update remarks/status
  - `POST /api/v1/call/close/{callNumber}` — close the call
- **Form Fields:** Call Number (search), Customer Remarks (disabled/readonly), Engineer Remarks, Part Status (select)

#### CallDetailsPage
- **Fields:** Search by Call Number → renders `<CallDetails />` helper component

---

### 4.8 Component Deep Dive — Stock Management Module

#### StockEntry (Add New Stock)
- **API Endpoint:** `POST /api/v1/stock`
- **Form Library:** Formik
- **Form Fields:** Item Name (Select), Group, Serial Number, Configuration, Model Number, Warranty Start Date, Warranty End Date, Price, Condition (Select)

#### BranchStockEntry (Add Branch Stock)
- **API Endpoint:** `POST /api/v1/mystocks`
- **Form Fields:** Item Name, Serial Number, Brand, Warranty Start Date, Warranty End Date, Price

#### CurrentStock / AllStock (List Views)
- **API Endpoints:**
  - `GET /api/v1/stock?status=available` (CurrentStock — available only)
  - `GET /api/v1/stock` (AllStock — everything)
- **Excel Columns:** Stock Id, Item Name, Group, Configuration, Condition, Model Number, Serial Number, Price, AMC Start Date, AMC End Date
- **Filters:** By Condition, Item Name, or Scrap status
- **Renders:** `<StockCard />` for each item

#### BranchStockList
- **API Endpoint:** `GET /api/v1/mystocks`
- **Displays:** Cards with Item Name, Brand, Serial Number, Warranty Start, Warranty End, Price

#### OfficeRepair (Manage Returned Items)
- **API Endpoints:**
  - `GET /api/v1/stock?officeRepair=yes` — items flagged for office repair
  - `PATCH /api/v1/stock/{stockId}` — update stock status
- **Actions per item:**
  - **Scrap:** Sets `scrap: 'yes'`, `officeRepair: 'no'`
  - **Repair:** Opens modal for Repair Amount → sets `status: 'available'`, `condition: 'repaired'`, `officeRepair: 'no'`, `price: repairAmount`

---

### 4.9 Component Deep Dive — ManPower Module

#### ManpowerEntry (Add New Engineer)
- **API Endpoint:** `POST /api/v1/engineer` (multipart/form-data)
- **Form Fields:** Name, Address, Designation, Joining Date, Date of Birth, Salary, Experience, Qualification, ID Proof (file upload), Certificate (file upload), Email, Contact, Skill Set (comma-separated), Reference
- **Special Logic:** Constructs `FormData` object for file upload support

#### AllEmployee (List All Engineers)
- **API Endpoint:** `GET /api/v1/engineer`
- **Renders:** `<EmployeeCard />` for each engineer

#### ManpowerInfo (Search Engineer)
- **Fields:** Employee ID (text input)
- **Renders:** `<EmployeeDetail />` when submitted

---

### 4.10 Component Deep Dive — Part Transaction Module

#### BranchToEngineer (B2E Transaction)
- **API Endpoints:**
  - `GET /api/v1/engineer?status=active` — fetch active engineers
  - `POST /api/v1/transaction` — create transaction
- **Form Fields:** Call Number, Item Name (Select), Part Name, Model Number, Stock Id, Serial Number, Dispatch Mode (Select: RGP/NRGP/consumable), Engineer Name (Select)
- **Auto-attached:** `category: 'b2e'`, `status: 'unavailable'`

#### EngineerToBranch (E2B Transaction)
- **API Endpoints:**
  - `GET /api/v1/engineer?status=active`
  - `POST /api/v1/transaction`
  - `POST /api/v1/stock` (conditionally, on status 210)
- **Form Fields:** Call Number, Stock Id, Item Name (Select), Part Name, Part Status (Select: working/faulty/damaged), Engineer Name (Select)
- **Auto-attached:** `category: 'e2b'`
- **Special Logic (Status 210 flow):** When the backend returns status 210, it means the stock item doesn't exist. A modal opens asking for Serial Number and Model Number. The frontend then creates a new stock entry with `officeRepair: 'yes'`.

#### PartTransactionDetail (View Transactions)
- **API Endpoints:**
  - `GET /api/v1/engineer?status=active`
  - `GET /api/v1/transaction` (with filters)
- **Filters:** By Engineer (dropdown) or Call Number (text)
- **Renders:** `<PartDetail />` for each transaction

---

### 4.11 Component Deep Dive — Expense Module

#### ExpenseEntry (Log Expense)
- **API Endpoints:**
  - `GET /api/v1/engineer?status=active`
  - `POST /api/v1/expense`
- **Form Library:** Formik + Yup validation
- **Form Fields:** Name (Autocomplete from engineers list), Category (Autocomplete), Month (Select), Period (Select: `1-15`, `16-30`, `1-30`), Amount, Remarks

#### ExpenseList (View Expenses)
- **API Endpoint:** `GET /api/v1/expense`
- **Special Logic:** Filters OUT expenses where remarks contain `"test"` or `"check"` (dev data cleanup)
- **Excel Columns:** Date, Engineer Name, Category, Month, Period, Amount, Remarks
- **Renders:** `<ExpenseCard />` for each expense

#### ExpenseCard
- Displays: Engineer Name, Category, Month, Period, Amount, Remarks, Date

---

### 4.12 Sidebar Navigation

| Sidebar Component | Links |
|-------------------|-------|
| **SideBarMain** (Home) | Expense, Call Master, ManPower, Part Transaction, Stock Management |
| **SideBar** (Call Master) | Call Logs, Call Assign, Call Update, Pending Calls, Closed Calls, Call Register, Call Details |
| **SideBarExpense** | Expense Entry, Expense List |
| **SideBarMp** (ManPower) | Manpower Entry, All Employees, Manpower Info |
| **SideBarPart** (Part Transaction) | Branch to Engineer, Engineer to Branch, Part Transaction Detail |
| **SideBarStock** (Stock Management) | Stock Entry, Current Stock, All Stock, Office Repair, Branch Stock Form, Branch Stock List |

Each sidebar highlights the active link based on `useLocation().pathname`.

---

### 4.13 Helper/Shared Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `CallCard` | `Helper/CallCard/` | Renders a single call as a card with key details |
| `CallDetails` | `Helper/CallDetail/` | Renders full call details (all fields + assigned engineers) |
| `EmployeeCard` | `Helper/EmployeeCard/` | Renders engineer summary card |
| `EmployeeDetail` | `Helper/EmployeeDetail/` | Renders full engineer profile with documents |
| `PartDetail` | `Helper/PartDetail/` | Renders a single transaction record |
| `StockCard` | `Helper/StockCard/` | Renders stock item summary card |
| `StockDetail` | `Helper/StockDetail/` | Renders full stock item details |
| `Button` | `Button/` | Reusable styled button component |
| `Loader` | `Loader/` | Spinning loader animation |
| `WelcomePage` | `WelcomePage/` | Takes `heading` + `Image` props, renders module welcome screen |
| `Navbar` | `Navbar/` | Company title + logout icon |
| `Login` | `Login/` | Email + Password login form |
| `Logout` | `Logout/` | Confirmation prompt with Yes/No |

---

### 4.14 Error Handling & Loading States

| Pattern | Implementation |
|---------|---------------|
| **Loading** | `isLoading` state → renders `<Loader />` spinner component |
| **API Errors** | `try/catch` blocks → `alert(error.response.data.message)` |
| **Toast Notifications** | `react-toastify` used in some components (e.g., `CallLogs`) |
| **Empty States** | Conditional rendering when data arrays are empty |

---

## 5. End-to-End Feature Flows

### 5.1 Service Call Lifecycle

```
1. CREATION (CallLogs)
   └─ Admin fills form → POST /api/v1/call
   └─ Backend generates crypto callId → saves to DB

2. ASSIGNMENT (CallAssign)
   └─ Admin selects call + engineer → POST /api/v1/call/assign
   └─ Backend pushes engineer to call.engineersAssigned
   └─ Backend pushes callId to engineer.assignedTo

3. TRACKING (CallRegister / PendingCallReports)
   └─ Admin views all/pending calls with date filters
   └─ Can download as Excel spreadsheet

4. UPDATE (CallUpdate)
   └─ Admin searches by callId → views current state
   └─ Updates engineer/customer remarks and part status

5. CLOSURE (CallUpdate → Close)
   └─ POST /api/v1/call/close/{callId}
   └─ Sets status="completed", closedAt=now
   └─ Removes callId from all assigned engineers' assignedTo arrays

6. REVIEW (ClosedCall)
   └─ View all completed calls with date filters
```

### 5.2 Part Transaction Flow (B2E)

```
1. Branch sends part to engineer
2. Admin fills BranchToEngineer form (callId, stockId, engineer, etc.)
3. POST /api/v1/transaction with category="b2e"
4. Backend validates stock serial number exists
5. Creates transaction record
6. Updates stock status → "unavailable"
```

### 5.3 Part Transaction Flow (E2B)

```
1. Engineer returns part to branch
2. Admin fills EngineerToBranch form
3. POST /api/v1/transaction with category="e2b"
4. Backend checks if stock exists by stockId
   ├── YES: Creates transaction, sets officeRepair="yes"
   └── NO: Returns status 210
5. If 210 → Frontend opens modal for serial/model number
   └─ POST /api/v1/stock → creates new stock with officeRepair="yes"
```

### 5.4 Office Repair Flow

```
1. Admin views OfficeRepair page
2. GET /api/v1/stock?officeRepair=yes
3. For each item, admin can:
   ├── SCRAP: PATCH → scrap="yes", officeRepair="no"
   └── REPAIR: Enter repair cost → PATCH → status="available",
       condition="repaired", officeRepair="no", price=repairAmount
```

### 5.5 Engineer Onboarding Flow

```
1. Admin fills ManpowerEntry form (with file uploads)
2. POST /api/v1/engineer (multipart/form-data)
3. Backend:
   - Validates DOB < JoinDate
   - Uploads idProof + certificate to Cloudinary
   - Generates unique employeeCode (crypto)
   - Creates Engineer document
```

---

## 6. Data Flow Diagrams

### 6.1 Authentication Data Flow

```
Frontend (Login)                    Backend (/api/v1/user)
     │                                    │
     ├── POST /signin ──────────────────► │ findUser → checkPassword
     │   {email, password}                │ → generateAccessToken (JWT 3d)
     │                                    │ → set cookie (httpOnly, 48h)
     ◄── {token} ◄────────────────────── │
     │                                    │
     ├── sessionStorage.setItem()         │
     ├── reload()                         │
     │                                    │
     │  [All subsequent requests]         │
     ├── Authorization: Bearer <token> ──►│ verifyToken middleware
     │                                    │ → decode → find user
     │                                    │ → attach to req.user
```

### 6.2 Stock ↔ Transaction Relationship

```
Stock (inventory)                Transaction (movement log)
┌──────────────┐                ┌──────────────┐
│ status:      │    B2E         │ category:    │
│  available ──┼───────────────►│  b2e         │
│  → unavail.  │                │              │
│              │    E2B         │  e2b         │
│  officeRepair│◄───────────────┤              │
│  → "yes"     │                └──────────────┘
│              │
│  Office      │    Scrap/Repair
│  Repair Page │────────────────► status → available
│              │                  OR scrap → "yes"
└──────────────┘
```

---

## 7. Todo / Pending Items

### Backend (All Complete ✔️)
- ✔️ Admin Login (OTP-based, 10-min expiry)
- ✔️ Call CRUD (Create, Register, Closed, Pending, Filter, Update, Close, Assign)
- ✔️ Secure callId generation (crypto, not Math.random)
- ✔️ Engineer CRUD with document uploads
- ✔️ Stock CRUD with filters
- ✔️ Transaction CRUD

### Frontend (Pending Items)
- ⏳ Redesign Login page
- ⏳ Validate button on Login page
- ⏳ Confirmation component background styling
- ⏳ Fix "Salary" spelling typo

### Brand / Theme
- **Primary Color:** `#48CCAC` (Teal/Turquoise)
- **RGB:** `rgb(72, 204, 172)`
- **HSL:** `hsl(178°, 70%, 64%)`

---

> **Generated on:** September 27, 2026  
> **Analyzed by:** Automated deep code analysis — every file read line by line
