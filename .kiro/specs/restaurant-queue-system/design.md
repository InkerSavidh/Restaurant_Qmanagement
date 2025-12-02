# Design Document

## Overview

The Restaurant Intelligence Platform Phase 1 is a full-stack web application that manages restaurant queues, reservations, and table operations through WhatsApp integration. The system consists of three main components:

1. **Backend API** - Node.js/Express server using Prisma ORM with Supabase PostgreSQL database
2. **Admin Frontend** - React/Vite application with Tailwind CSS for restaurant staff
3. **WhatsApp Integration** - Messaging service for customer interactions

The architecture follows a modular, service-oriented design with clear separation of concerns. The backend implements the saviCodeBackend pattern with controllers, services, and routes organized by domain. The frontend follows the saviCode pattern with reusable components, context-based state management, and protected routing.

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CUSTOMERS                            │
│                      (WhatsApp Users)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ WhatsApp API
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   WhatsApp Service                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Message    │  │ Conversation │  │   Template   │     │
│  │   Handler    │  │     Flow     │  │   Manager    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ REST API
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    Backend API Server                        │
│                  (Node.js + Express)                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Middleware Layer                         │  │
│  │  • JWT Auth  • Role Check  • Error Handler           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Controller Layer                         │  │
│  │  Auth │ Tables │ Queue │ Seating │ Analytics         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Service Layer                            │  │
│  │  Business Logic & Data Validation                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Prisma ORM                               │  │
│  │  Database Access & Query Builder                      │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ PostgreSQL Protocol
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  Supabase PostgreSQL                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Tables    │  │    Queue     │  │  Analytics   │     │
│  │   & Floors   │  │  & Seating   │  │     Logs     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                     │
                     │ Supabase Realtime / WebSocket
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   Admin Frontend                             │
│                 (React + Vite + Tailwind)                    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Pages Layer                              │  │
│  │  Login │ Dashboard │ Tables │ Queue │ Analytics      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Components Layer                         │  │
│  │  UI Components │ Common Components │ Modules          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              State Management                         │  │
│  │  Auth Context │ Zustand Store │ React Query          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Layer                                │  │
│  │  Axios Instance │ Interceptors │ API Handlers        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                     │
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  RESTAURANT STAFF                            │
│                  (Admin/Waiters)                             │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**
- Node.js (Runtime)
- Express (Web Framework)
- Prisma (ORM)
- Supabase (PostgreSQL Database + Realtime)
- JWT (Authentication)
- WhatsApp Business API (Customer Communication)

**Frontend:**
- React 18 (UI Library)
- Vite (Build Tool)
- TypeScript (Type Safety)
- Tailwind CSS (Styling)
- Axios (HTTP Client)
- Zustand or Context API (State Management)
- React Router (Routing)
- React Toastify (Notifications)
- FontAwesome (Icons)
- Recharts or Chart.js (Analytics Visualization)

### Backend Module Structure

```
backend/
├── src/
│   ├── app.js                    # Express app configuration
│   ├── server.js                 # Server entry point
│   ├── config/
│   │   ├── database.js           # Prisma client initialization
│   │   └── env.js                # Environment variables
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT verification
│   │   ├── role.middleware.js    # Role-based access control
│   │   └── error.middleware.js   # Global error handler
│   ├── common/
│   │   ├── response.js           # Standard API response format
│   │   └── logger.js             # Activity logging utility
│   ├── auth/
│   │   ├── auth.controller.js
│   │   ├── auth.service.js
│   │   └── auth.routes.js
│   ├── tables/
│   │   ├── tables.controller.js
│   │   ├── tables.service.js
│   │   └── tables.routes.js
│   ├── queue/
│   │   ├── queue.controller.js
│   │   ├── queue.service.js
│   │   └── queue.routes.js
│   ├── seating/
│   │   ├── seating.controller.js
│   │   ├── seating.service.js
│   │   └── seating.routes.js
│   ├── analytics/
│   │   ├── analytics.controller.js
│   │   ├── analytics.service.js
│   │   └── analytics.routes.js
│   ├── waiters/
│   │   ├── waiters.controller.js
│   │   ├── waiters.service.js
│   │   └── waiters.routes.js
│   ├── whatsapp/
│   │   ├── whatsapp.service.js   # WhatsApp API integration
│   │   ├── message.templates.js  # Message templates
│   │   └── conversation.flow.js  # Conversation state machine
│   └── activity/
│       └── activity.service.js   # Activity logging
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── seed.js                   # Database seeding
│   └── migrations/               # Migration files
├── .env
├── .gitignore
├── package.json
└── README.md
```

### Frontend Module Structure

```
frontend/
├── src/
│   ├── main.tsx                  # Application entry point
│   ├── App.tsx                   # Root component
│   ├── api/
│   │   ├── axiosInstance.ts      # Configured axios instance
│   │   ├── auth.api.ts           # Auth API calls
│   │   ├── tables.api.ts         # Tables API calls
│   │   ├── queue.api.ts          # Queue API calls
│   │   ├── analytics.api.ts      # Analytics API calls
│   │   ├── history.api.ts        # Customer history API calls
│   │   ├── waiters.api.ts        # Waiters management API calls
│   │   └── activity.api.ts       # Activity log API calls
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Loader.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Toggle.tsx
│   │   └── common/
│   │       ├── Sidebar.tsx
│   │       ├── Header.tsx
│   │       ├── ProtectedRoute.tsx
│   │       └── Layout.tsx
│   ├── context/
│   │   └── AuthContext.tsx       # Authentication context
│   ├── store/                    # Alternative: Zustand store
│   │   └── authStore.ts
│   ├── layouts/
│   │   ├── AdminLayout.tsx
│   │   └── AuthLayout.tsx
│   ├── modules/
│   │   ├── dashboard/
│   │   │   ├── DashboardStats.tsx
│   │   │   ├── NextUpToBeSeated.tsx
│   │   │   └── SeatedPartiesChart.tsx
│   │   ├── tables/
│   │   │   ├── TableGrid.tsx
│   │   │   ├── TableCard.tsx
│   │   │   ├── FloorSelector.tsx
│   │   │   └── EditLayoutModal.tsx
│   │   ├── queue/
│   │   │   ├── QueueList.tsx
│   │   │   ├── QueueEntry.tsx
│   │   │   ├── AddCustomerForm.tsx
│   │   │   ├── SeatManuallyForm.tsx
│   │   │   └── AutoAllocatorToggle.tsx
│   │   ├── occupied/
│   │   │   └── OccupiedTablesList.tsx
│   │   ├── history/
│   │   │   ├── CustomerHistoryTable.tsx
│   │   │   └── HistoryFilters.tsx
│   │   ├── waiters/
│   │   │   ├── AddWaiterForm.tsx
│   │   │   └── WaitersList.tsx
│   │   ├── activity/
│   │   │   ├── ActivityLogTable.tsx
│   │   │   ├── ActivityFilters.tsx
│   │   │   └── ActionBadge.tsx
│   │   └── analytics/
│   │       ├── WaitTimeChart.tsx
│   │       ├── PeakHoursChart.tsx
│   │       └── MetricsCard.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Tables.tsx
│   │   ├── OccupiedTables.tsx
│   │   ├── Queue.tsx
│   │   ├── CustomerHistory.tsx
│   │   ├── ManageWaiters.tsx
│   │   ├── ActivityLog.tsx
│   │   └── Analytics.tsx
│   ├── router/
│   │   └── AppRouter.tsx
│   ├── utils/
│   │   ├── formatters.ts
│   │   └── validators.ts
│   └── types/
│       └── index.ts              # TypeScript type definitions
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## Components and Interfaces

### Backend Components

#### 1. Authentication Module
**Responsibility:** User registration, login, JWT token management

**Key Functions:**
- `register(userData)` - Create new user account
- `login(credentials)` - Authenticate user and return JWT
- `refreshToken(token)` - Generate new access token
- `verifyToken(token)` - Validate JWT token

**API Endpoints:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`

#### 2. Tables Module
**Responsibility:** Table and floor management

**Key Functions:**
- `createTable(tableData)` - Add new table
- `updateTableStatus(tableId, status)` - Change table status
- `updateTableCapacity(tableId, capacity)` - Modify table capacity
- `getTablesByFloor(floorId)` - Retrieve tables for specific floor
- `getAllTables()` - Get all tables with current status

**API Endpoints:**
- `POST /api/tables`
- `GET /api/tables`
- `GET /api/tables/floor/:floorId`
- `PUT /api/tables/:id/status`
- `PUT /api/tables/:id/capacity`

#### 3. Queue Module
**Responsibility:** Waitlist management and customer queue operations

**Key Functions:**
- `addToQueue(customerData)` - Add customer to waitlist
- `getQueueList()` - Retrieve current queue
- `updateQueueStatus(queueId, status)` - Modify queue entry status
- `removeFromQueue(queueId)` - Remove customer from queue
- `calculateWaitTime(partySize)` - Estimate wait time
- `updateQueuePositions()` - Recalculate all queue positions

**API Endpoints:**
- `POST /api/queue`
- `GET /api/queue`
- `PUT /api/queue/:id/status`
- `DELETE /api/queue/:id`
- `GET /api/queue/wait-time/:partySize`

#### 4. Seating Module
**Responsibility:** Seating session management and table assignment

**Key Functions:**
- `seatCustomer(queueId, tableId)` - Assign customer to table
- `endSeatingSession(sessionId)` - Mark table as available
- `getActiveSeating()` - Get all occupied tables
- `markNoShow(queueId)` - Handle customer no-show

**API Endpoints:**
- `POST /api/seating/seat`
- `POST /api/seating/end/:sessionId`
- `GET /api/seating/active`
- `POST /api/seating/no-show/:queueId`

#### 5. Analytics Module
**Responsibility:** Data aggregation and reporting

**Key Functions:**
- `getAverageWaitTime(dateRange)` - Calculate avg wait time
- `getPeakHours(dateRange)` - Identify busy periods
- `getTableTurnover(dateRange)` - Calculate turnover rate
- `getNoShowRate(dateRange)` - Calculate no-show percentage
- `getCurrentQueueLength()` - Get live queue count

**API Endpoints:**
- `GET /api/analytics/wait-time`
- `GET /api/analytics/peak-hours`
- `GET /api/analytics/turnover`
- `GET /api/analytics/no-show-rate`
- `GET /api/analytics/queue-length`

#### 6. WhatsApp Service
**Responsibility:** Customer communication via WhatsApp

**Key Functions:**
- `sendMessage(phoneNumber, message)` - Send WhatsApp message
- `sendTemplate(phoneNumber, templateName, params)` - Send template message
- `handleIncomingMessage(message)` - Process customer messages
- `sendQueueConfirmation(queueEntry)` - Confirm queue addition
- `sendStatusUpdate(queueEntry)` - Notify position change
- `sendReminder(reservation)` - Send reservation reminder

**Message Templates:**
- Queue confirmation
- Position update
- Table ready notification
- Reservation confirmation
- Reservation reminder
- Cancellation confirmation

#### 7. Activity Logger
**Responsibility:** System activity tracking

**Key Functions:**
- `logAction(userId, action, details)` - Record user action
- `logQueueEvent(queueId, event)` - Log queue changes
- `logTableEvent(tableId, event)` - Log table status changes
- `getActivityLogs(filters)` - Retrieve filtered activity logs

**API Endpoints:**
- `GET /api/activity` - Get activity logs with filters (userType, userName, table, startDate, endDate)

#### 8. Customer History Module
**Responsibility:** Track and display customer dining history

**Key Functions:**
- `getCustomerHistory(filters)` - Retrieve customer history with filters
- `recordArrival(queueEntryId)` - Record customer arrival time
- `recordDeparture(sessionId)` - Record customer departure and calculate dine time
- `calculateWaitTime(entry)` - Calculate total wait time (seated - arrival)
- `calculateDineTime(session)` - Calculate dine time (departed - seated)

**API Endpoints:**
- `GET /api/history` - Get customer history with filters (startDate, endDate, customerName, tableNumber)
- `POST /api/history/departure/:sessionId` - Record customer departure

#### 9. Waiters Management Module
**Responsibility:** Manage waiter accounts

**Key Functions:**
- `createWaiter(waiterData)` - Add new waiter with username/password
- `getWaiters()` - List all waiters
- `updateWaiter(waiterId, data)` - Update waiter details
- `deleteWaiter(waiterId)` - Remove waiter account

**API Endpoints:**
- `POST /api/waiters` - Create new waiter
- `GET /api/waiters` - List all waiters
- `PUT /api/waiters/:id` - Update waiter
- `DELETE /api/waiters/:id` - Delete waiter

#### 10. Auto-Allocator Module
**Responsibility:** Automatic table assignment for queued customers

**Key Functions:**
- `runAllocator()` - Attempt to seat next eligible customer
- `findBestTable(partySize)` - Find optimal table for party size
- `toggleAutoAllocator(enabled)` - Enable/disable auto-allocation
- `getAutoAllocatorStatus()` - Get current auto-allocator state

**API Endpoints:**
- `POST /api/allocator/run` - Run allocator manually
- `GET /api/allocator/status` - Get auto-allocator status
- `PUT /api/allocator/toggle` - Toggle auto-allocator on/off

### Frontend Components

#### 1. Authentication Components
- **Login Page** - User login form with validation
- **AuthContext/Store** - Global authentication state
- **ProtectedRoute** - Route guard for authenticated users

#### 2. Layout Components
- **AdminLayout** - Main layout with sidebar and header
- **Sidebar** - Navigation menu with active state
- **Header** - Top bar with user info and logout

#### 3. Dashboard Components
- **DashboardStats** - Key metrics cards
- **QuickActions** - Common action buttons

#### 4. Tables Components
- **FloorSelector** - Switch between floors
- **TableGrid** - Grid display of all tables
- **TableCard** - Individual table with status indicator

#### 5. Queue Components
- **QueueList** - List of customers in queue
- **QueueEntry** - Individual queue item with actions
- **AddCustomerModal** - Form to add customer to queue

#### 6. Analytics Components
- **WaitTimeChart** - Line chart showing wait times
- **PeakHoursChart** - Bar chart of busy hours
- **MetricsCard** - Individual metric display
- **TurnoverStats** - Table turnover visualization

#### 7. UI Components
- **Button** - Reusable button with variants
- **Input** - Form input with validation
- **Card** - Container with shadow and padding
- **Modal** - Overlay dialog
- **Loader** - Loading spinner
- **Select** - Dropdown select component
- **DatePicker** - Date input with calendar
- **Badge** - Status badge with color variants (Cleared, Blocked, Made Available)
- **Toggle** - On/off toggle switch

#### 8. Occupied Tables Components
- **OccupiedTablesList** - Table showing currently seated parties with TABLE, CUSTOMER NAME, PARTY SIZE, PHONE, SEATED AT columns

#### 9. Customer History Components
- **CustomerHistoryTable** - Table with NAME, PHONE, PARTY SIZE, TABLE SEATED, ARRIVAL TIME, SEATED TIME, DEPARTED TIME, TOTAL WAIT, DINE TIME
- **HistoryFilters** - Filter form with date range, customer name, table number

#### 10. Waiters Management Components
- **AddWaiterForm** - Form with Username and Password fields
- **WaitersList** - List of existing waiters with Edit/Delete actions

#### 11. Activity Log Components
- **ActivityLogTable** - Table with TIMESTAMP, USER, ACTION BADGE, ACTION DETAILS
- **ActivityFilters** - Filter form with User Type, User Name, Table, Date Range
- **ActionBadge** - Color-coded badge (green=Cleared, red=Blocked, blue=Made Available)

#### 12. Queue Management Components (Extended)
- **AddCustomerForm** - Inline form with Name, Party Size, Phone fields
- **SeatManuallyForm** - Customer dropdown and table selection
- **AutoAllocatorToggle** - Toggle switch with "Run Allocator Now" button

## Data Models

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User model for authentication
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password      String
  name          String
  role          UserRole @default(WAITER)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?
  
  activityLogs  ActivityLog[]
  seatingAssignments SeatingSession[] @relation("AssignedBy")
  
  @@index([email])
  @@index([role])
  @@map("users")
}

enum UserRole {
  ADMIN
  WAITER
}

// Floor model for restaurant layout
model Floor {
  id          String   @id @default(uuid())
  name        String
  displayOrder Int
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  tables      Table[]
  
  @@map("floors")
}

// Table model
model Table {
  id          String      @id @default(uuid())
  tableNumber String
  capacity    Int
  floorId     String
  status      TableStatus @default(AVAILABLE)
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  floor       Floor       @relation(fields: [floorId], references: [id])
  seatingSessions SeatingSession[]
  
  @@unique([tableNumber, floorId])
  @@index([floorId])
  @@index([status])
  @@map("tables")
}

enum TableStatus {
  AVAILABLE
  OCCUPIED
  RESERVED
  CLEANING
  UNAVAILABLE
}

// Customer model
model Customer {
  id          String   @id @default(uuid())
  name        String
  phoneNumber String
  email       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  queueEntries QueueEntry[]
  reservations Reservation[]
  
  @@index([phoneNumber])
  @@map("customers")
}

// Queue entry model
model QueueEntry {
  id              String           @id @default(uuid())
  customerId      String
  partySize       Int
  status          QueueStatus      @default(WAITING)
  position        Int
  estimatedWaitMinutes Int
  notes           String?
  entryTime       DateTime         @default(now())
  notifiedAt      DateTime?
  seatedAt        DateTime?
  cancelledAt     DateTime?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  
  customer        Customer         @relation(fields: [customerId], references: [id])
  seatingSession  SeatingSession?
  
  @@index([customerId])
  @@index([status])
  @@index([entryTime])
  @@map("queue_entries")
}

enum QueueStatus {
  WAITING
  NOTIFIED
  SEATED
  CANCELLED
  NO_SHOW
}

// Reservation model
model Reservation {
  id              String            @id @default(uuid())
  customerId      String
  partySize       Int
  reservationTime DateTime
  status          ReservationStatus @default(CONFIRMED)
  notes           String?
  reminderSentAt  DateTime?
  arrivedAt       DateTime?
  cancelledAt     DateTime?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  
  customer        Customer          @relation(fields: [customerId], references: [id])
  seatingSession  SeatingSession?
  
  @@index([customerId])
  @@index([reservationTime])
  @@index([status])
  @@map("reservations")
}

enum ReservationStatus {
  CONFIRMED
  REMINDED
  ARRIVED
  SEATED
  CANCELLED
  NO_SHOW
}

// Seating session model
model SeatingSession {
  id              String    @id @default(uuid())
  tableId         String
  queueEntryId    String?   @unique
  reservationId   String?   @unique
  partySize       Int
  seatedAt        DateTime  @default(now())
  endedAt         DateTime?
  assignedById    String
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  table           Table         @relation(fields: [tableId], references: [id])
  queueEntry      QueueEntry?   @relation(fields: [queueEntryId], references: [id])
  reservation     Reservation?  @relation(fields: [reservationId], references: [id])
  assignedBy      User          @relation("AssignedBy", fields: [assignedById], references: [id])
  
  @@index([tableId])
  @@index([seatedAt])
  @@map("seating_sessions")
}

// Waiter model
model Waiter {
  id          String   @id @default(uuid())
  name        String
  phoneNumber String
  email       String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([isActive])
  @@map("waiters")
}

// Activity log model
model ActivityLog {
  id          String   @id @default(uuid())
  userId      String?
  action      String
  entityType  String
  entityId    String?
  details     Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())
  
  user        User?    @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([action])
  @@index([createdAt])
  @@map("activity_logs")
}
```

### Data Model Relationships

1. **User → ActivityLog**: One-to-Many (User performs many actions)
2. **User → SeatingSession**: One-to-Many (User assigns many seating sessions)
3. **Floor → Table**: One-to-Many (Floor contains many tables)
4. **Table → SeatingSession**: One-to-Many (Table has many seating sessions)
5. **Customer → QueueEntry**: One-to-Many (Customer can join queue multiple times)
6. **Customer → Reservation**: One-to-Many (Customer can make multiple reservations)
7. **QueueEntry → SeatingSession**: One-to-One (Queue entry results in one seating)
8. **Reservation → SeatingSession**: One-to-One (Reservation results in one seating)

### Key Indexes

- **User**: email, role (for authentication and authorization queries)
- **Table**: floorId, status (for filtering tables by floor and availability)
- **QueueEntry**: customerId, status, entryTime (for queue management)
- **Reservation**: customerId, reservationTime, status (for booking management)
- **ActivityLog**: userId, action, createdAt (for audit trails)

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Queue Entry Creation Completeness
*For any* valid customer data and party size, when a queue entry is created, the entry SHALL contain customer details, party size, estimated wait time, position, and entry timestamp.
**Validates: Requirements 1.2**

### Property 2: Queue Confirmation Messaging
*For any* queue entry created, a confirmation message SHALL be sent containing the queue position and estimated wait time.
**Validates: Requirements 1.3**

### Property 3: Position Update Notifications
*For any* queue entry whose position changes, a status notification SHALL be sent via WhatsApp with the updated position.
**Validates: Requirements 1.4**

### Property 4: Table Capacity Matching
*For any* party size provided by a customer, the system SHALL only suggest or assign tables with capacity greater than or equal to the party size.
**Validates: Requirements 1.5**

### Property 5: Reservation Availability Accuracy
*For any* date and time requested for reservation, the system SHALL return only time slots that are not already reserved and fall within operating hours.
**Validates: Requirements 2.1**

### Property 6: Reservation Record Completeness
*For any* valid time slot selection, a reservation record SHALL be created containing customer details, party size, reservation time, and status.
**Validates: Requirements 2.2**

### Property 7: Reservation Confirmation Messaging
*For any* reservation created with CONFIRMED status, a confirmation message SHALL be sent containing all reservation details.
**Validates: Requirements 2.3**

### Property 8: Reservation Reminder Timing
*For any* reservation with a future reservation time, a reminder notification SHALL be sent exactly 30 minutes before the reservation time.
**Validates: Requirements 2.4**

### Property 9: Reservation Modification Validation
*For any* reservation modification request, the system SHALL allow the modification only if the new time slot is available and within operating hours.
**Validates: Requirements 2.5**

### Property 10: Cancellation Completeness
*For any* cancellation request (queue or reservation), the system SHALL remove the entry from active status and update table availability calculations.
**Validates: Requirements 3.1**

### Property 11: Cancellation Confirmation Messaging
*For any* processed cancellation, a confirmation message SHALL be sent to the customer.
**Validates: Requirements 3.2**

### Property 12: Queue Position Recalculation
*For any* queue entry cancellation, all queue entries with higher position numbers SHALL have their positions decremented by one.
**Validates: Requirements 3.3**

### Property 13: Time Slot Availability Update
*For any* reservation cancellation, the previously reserved time slot SHALL be marked as available for new bookings.
**Validates: Requirements 3.4**

### Property 14: Late Cancellation Logging
*For any* reservation cancellation occurring within 2 hours of the reservation time, an analytics log entry SHALL be created with late_cancellation flag.
**Validates: Requirements 3.5**

### Property 15: Queue Display Sorting
*For any* admin panel queue view request, the returned queue entries SHALL be sorted in ascending order by entry time.
**Validates: Requirements 4.1**

### Property 16: Next Customer Highlighting Logic
*For any* table that becomes available, the system SHALL identify the queue entry with the lowest position number whose party size fits the table capacity.
**Validates: Requirements 4.2**

### Property 17: Table Ready Action Completeness
*For any* table marked as ready by staff, both the table status update in the database and WhatsApp notification to the next customer SHALL occur.
**Validates: Requirements 4.3**

### Property 18: Seating Action Completeness
*For any* customer seated action, the queue entry SHALL be removed from active queue and the table status SHALL be updated to OCCUPIED.
**Validates: Requirements 4.4**

### Property 19: Table Display Completeness
*For any* table management screen view, all active tables SHALL be displayed with current status and occupancy duration.
**Validates: Requirements 5.1**

### Property 20: Status Change Side Effects
*For any* table status change, both the database update and queue wait time recalculation SHALL occur.
**Validates: Requirements 5.2**

### Property 21: Cleaning Status Capacity Exclusion
*For any* table marked with CLEANING status, the table SHALL not be included in available capacity calculations.
**Validates: Requirements 5.3**

### Property 22: No-Show Handling Completeness
*For any* customer marked as no-show, both an analytics log entry SHALL be created and the associated table SHALL be released to AVAILABLE status.
**Validates: Requirements 5.4**

### Property 23: Wait Time Recalculation Trigger
*For any* table status change to AVAILABLE, wait time estimates SHALL be recalculated for all active queue entries.
**Validates: Requirements 5.5**

### Property 24: Average Wait Time Calculation
*For any* analytics request for average wait time, the calculation SHALL use the difference between entry time and seated time for all completed queue entries in the specified date range.
**Validates: Requirements 6.1**

### Property 25: Peak Hours Identification
*For any* analytics request for peak hours, the system SHALL group queue entries by hour and identify hours with the highest entry counts.
**Validates: Requirements 6.2**

### Property 26: Table Turnover Calculation
*For any* analytics request for table turnover, the calculation SHALL use the average duration between seatedAt and endedAt for all completed seating sessions in the specified date range.
**Validates: Requirements 6.3**

### Property 27: No-Show Rate Calculation
*For any* analytics request for no-show rate, the calculation SHALL be (count of NO_SHOW reservations / total reservations) * 100 for the specified date range.
**Validates: Requirements 6.4**

### Property 28: WhatsApp Interaction Logging
*For any* customer interaction via WhatsApp, an AnalyticsLog entry SHALL be created containing message type, timestamp, and customer identifier.
**Validates: Requirements 7.1**

### Property 29: Queue Event Logging
*For any* queue entry creation or modification, an activity log SHALL be created containing customer details, action type, and wait time.
**Validates: Requirements 7.2**

### Property 30: Reservation Event Logging
*For any* reservation creation or cancellation, an activity log SHALL be created containing all reservation details and action type.
**Validates: Requirements 7.3**

### Property 31: Log Entry Completeness
*For any* log entry stored in the system, the entry SHALL contain customer ID, action type, timestamp, and metadata fields.
**Validates: Requirements 7.5**

### Property 32: Message Template Usage
*For any* WhatsApp message sent by the system, the message SHALL match one of the predefined template structures.
**Validates: Requirements 8.1**

### Property 33: Message Intent Routing
*For any* incoming WhatsApp message, the system SHALL parse the intent and route to the appropriate service handler based on message content.
**Validates: Requirements 8.3**

### Property 34: WhatsApp Error Handling
*For any* error occurring during WhatsApp communication, both an error log SHALL be created and a fallback message SHALL be sent to the customer.
**Validates: Requirements 8.4**

### Property 35: Template Variable Interpolation
*For any* message template containing variables, all variables SHALL be replaced with actual values before sending.
**Validates: Requirements 8.5**

### Property 36: API Response Format Consistency
*For any* API endpoint response, the response SHALL contain status field ("success" or "failed"), message field, and optional data field.
**Validates: Requirements 9.2**

### Property 37: Error Response Format
*For any* API error condition, the response SHALL include appropriate HTTP status code (4xx or 5xx) and descriptive error message.
**Validates: Requirements 12.1**

### Property 38: Database Error Handling
*For any* database operation failure, both an error log with stack trace SHALL be created and a user-friendly error message SHALL be returned.
**Validates: Requirements 12.2**

### Property 39: WhatsApp Retry Logic
*For any* failed WhatsApp API call, the system SHALL retry with exponentially increasing delays (1s, 2s, 4s, 8s) and log all failures.
**Validates: Requirements 12.3**

### Property 40: Validation Error Detail
*For any* request validation failure, the response SHALL contain detailed error messages for each invalid field.
**Validates: Requirements 12.5**

### Property 41: Wait Time Calculation Factors
*For any* wait time calculation, the algorithm SHALL consider current queue length, party sizes of queued customers, and average table turnover rate.
**Validates: Requirements 13.1**

### Property 42: Default Turnover Fallback
*For any* wait time calculation when insufficient historical turnover data exists, the system SHALL use configurable default turnover times based on table size.
**Validates: Requirements 13.2**

### Property 43: Wait Time Rounding
*For any* calculated wait time displayed to customers, the time SHALL be rounded to the nearest 5-minute increment.
**Validates: Requirements 13.3**

### Property 44: Wait Time Update on Position Change
*For any* queue entry position advancement, the estimated wait time SHALL be recalculated based on current queue state.
**Validates: Requirements 13.4**

### Property 45: Operating Hours Validation
*For any* reservation request, the system SHALL reject requests for times outside the configured operating hours.
**Validates: Requirements 14.2**

### Property 46: Reservation Buffer Enforcement
*For any* two reservations for the same table, the time difference SHALL be at least the configured buffer time.
**Validates: Requirements 14.3**

### Property 47: Reminder Timing Configuration
*For any* reminder sent by the system, the reminder SHALL be sent at the interval specified in the configuration.
**Validates: Requirements 14.4**

### Property 48: Capacity Limit Enforcement
*For any* booking attempt (queue or reservation), the system SHALL reject the request if accepting it would exceed the configured maximum capacity.
**Validates: Requirements 14.5**

### Property 49: Customer History Record Completeness
*For any* completed seating session, the history record SHALL contain NAME, PHONE, PARTY SIZE, TABLE SEATED, ARRIVAL TIME, SEATED TIME, DEPARTED TIME, TOTAL WAIT (MIN), and DINE TIME (MIN).
**Validates: Requirements 15.1**

### Property 50: Customer History Date Filter Accuracy
*For any* date range filter applied to customer history, all returned records SHALL have arrival times within the specified start and end dates.
**Validates: Requirements 15.2**

### Property 51: Customer History Name Filter Accuracy
*For any* customer name filter applied to customer history, all returned records SHALL contain the search query in the customer name field.
**Validates: Requirements 15.3**

### Property 52: Wait Time and Dine Time Calculation
*For any* completed seating session, TOTAL WAIT SHALL equal (seated time - arrival time) in minutes, and DINE TIME SHALL equal (departed time - seated time) in minutes.
**Validates: Requirements 15.6**

### Property 53: Auto-Allocator Party Size Matching
*For any* auto-allocation attempt, the assigned table capacity SHALL be greater than or equal to the customer's party size with minimal wasted seats.
**Validates: Requirements 16.3**

### Property 54: Auto-Allocator Queue and Table Update
*For any* successful auto-allocation, the customer SHALL be removed from the queue and the table status SHALL be updated to OCCUPIED.
**Validates: Requirements 16.5**

### Property 55: Occupied Tables Display Completeness
*For any* occupied table, the display SHALL show TABLE, CUSTOMER NAME, PARTY SIZE, PHONE, and SEATED AT columns.
**Validates: Requirements 17.1**

### Property 56: Occupied Tables Real-time Update
*For any* table status change to OCCUPIED or AVAILABLE, the Occupied Tables view SHALL update within 2 seconds via real-time subscription.
**Validates: Requirements 17.4**

### Property 57: Waiter Account Creation
*For any* new waiter added, a user account SHALL be created with WAITER role and the provided username and password.
**Validates: Requirements 18.2**

### Property 58: Activity Log Entry Completeness
*For any* activity log entry, the record SHALL contain TIMESTAMP, USER, ACTION BADGE, and ACTION DETAILS.
**Validates: Requirements 19.1**

### Property 59: Activity Log Filter Accuracy
*For any* filter combination applied to activity logs, all returned records SHALL match all specified filter criteria.
**Validates: Requirements 19.2, 19.3, 19.4, 19.5**

### Property 60: Activity Log Action Badge Mapping
*For any* table status change, the action badge SHALL be "Cleared" for AVAILABLE, "Blocked" for UNAVAILABLE, and "Made Available" for status changes to AVAILABLE.
**Validates: Requirements 19.6**

### Property 61: Manual Seating Capacity Validation
*For any* manual seating attempt, the system SHALL validate that the selected table(s) combined capacity meets or exceeds the party size.
**Validates: Requirements 21.2**

### Property 62: Manual Seating Completeness
*For any* successful manual seating, the customer SHALL be removed from queue and the table(s) SHALL be marked as OCCUPIED.
**Validates: Requirements 21.3**

## Error Handling

### Backend Error Handling Strategy

1. **Validation Errors (400 Bad Request)**
   - Invalid input data
   - Missing required fields
   - Format violations
   - Return detailed field-level error messages

2. **Authentication Errors (401 Unauthorized)**
   - Invalid or expired JWT token
   - Missing authentication credentials
   - Return generic authentication failure message

3. **Authorization Errors (403 Forbidden)**
   - Insufficient permissions for requested action
   - Role-based access denial
   - Return permission denied message

4. **Not Found Errors (404 Not Found)**
   - Resource does not exist
   - Invalid ID references
   - Return resource not found message

5. **Conflict Errors (409 Conflict)**
   - Duplicate entries
   - Concurrent modification conflicts
   - Reservation time slot conflicts
   - Return conflict description

6. **Server Errors (500 Internal Server Error)**
   - Database connection failures
   - Unexpected exceptions
   - Third-party API failures
   - Log full error with stack trace
   - Return generic error message to client

### Error Response Format

```javascript
{
  status: "failed",
  message: "Human-readable error description",
  errors: [  // Optional: for validation errors
    {
      field: "email",
      message: "Invalid email format"
    }
  ],
  code: "ERROR_CODE"  // Optional: machine-readable error code
}
```

### Frontend Error Handling Strategy

1. **Network Errors**
   - Display toast notification with retry option
   - Show offline indicator if connection lost
   - Queue failed requests for retry

2. **Validation Errors**
   - Display inline error messages on form fields
   - Highlight invalid fields
   - Prevent form submission until resolved

3. **Authentication Errors**
   - Clear stored tokens
   - Redirect to login page
   - Display session expired message

4. **Server Errors**
   - Display toast notification with error message
   - Log error details to console
   - Provide user-friendly error description

### WhatsApp Integration Error Handling

1. **Message Send Failures**
   - Retry with exponential backoff (1s, 2s, 4s, 8s, 16s)
   - Log all retry attempts
   - After max retries, log failure and alert admin
   - Store failed messages for manual review

2. **Webhook Processing Errors**
   - Log incoming message
   - Send fallback "We're experiencing issues" message
   - Queue message for manual processing
   - Alert admin of processing failure

3. **Template Errors**
   - Validate template variables before sending
   - Use fallback plain text if template fails
   - Log template rendering errors

## Testing Strategy

### Unit Testing

**Backend Unit Tests:**
- Service layer business logic
- Utility functions (wait time calculation, position recalculation)
- Validation functions
- Message template rendering
- Error handling middleware

**Frontend Unit Tests:**
- Component rendering
- Form validation logic
- Utility functions (formatters, validators)
- API response handling
- State management logic

**Testing Framework:** Jest for both backend and frontend

**Coverage Target:** 80% code coverage for service layer and utility functions

### Property-Based Testing

**Property-Based Testing Library:** fast-check (JavaScript/TypeScript)

**Configuration:** Each property-based test SHALL run a minimum of 100 iterations

**Test Tagging Format:** Each property-based test MUST include a comment with the format:
```javascript
// **Feature: restaurant-queue-system, Property {number}: {property_text}**
```

**Key Properties to Test:**

1. **Queue Position Recalculation (Property 12)**
   - Generate random queue states
   - Remove random entries
   - Verify all positions are sequential with no gaps

2. **Table Capacity Matching (Property 4)**
   - Generate random party sizes
   - Generate random table configurations
   - Verify suggested tables always have sufficient capacity

3. **Wait Time Calculation (Property 41)**
   - Generate random queue states and turnover rates
   - Verify wait time increases with queue length
   - Verify wait time decreases with faster turnover

4. **Reservation Buffer Enforcement (Property 46)**
   - Generate random reservation pairs
   - Verify time difference meets buffer requirement

5. **API Response Format (Property 36)**
   - Generate random API responses
   - Verify all responses have required fields (status, message)

6. **Wait Time Rounding (Property 43)**
   - Generate random wait times
   - Verify all rounded times are multiples of 5

7. **Operating Hours Validation (Property 45)**
   - Generate random reservation times
   - Verify rejections for times outside operating hours

8. **No-Show Rate Calculation (Property 27)**
   - Generate random reservation datasets
   - Verify calculation formula: (no-shows / total) * 100

9. **Template Variable Interpolation (Property 35)**
   - Generate random template strings with variables
   - Generate random data objects
   - Verify all variables are replaced

10. **Capacity Limit Enforcement (Property 48)**
    - Generate random booking scenarios
    - Verify system rejects bookings exceeding capacity

### Integration Testing

**Integration Test Scenarios:**
- Complete queue flow: join → notify → seat → complete
- Complete reservation flow: book → remind → arrive → seat
- Cancellation flow: cancel → update positions → notify
- Real-time updates: database change → WebSocket → UI update
- WhatsApp flow: receive message → process → send response
- Authentication flow: login → token → protected route access

**Testing Tools:**
- Supertest (API endpoint testing)
- React Testing Library (Component integration)
- Prisma Test Environment (Database testing)

### End-to-End Testing

**E2E Test Scenarios:**
- Staff adds customer to queue via admin panel
- Customer receives WhatsApp confirmation
- Staff seats customer
- Table status updates in real-time
- Analytics reflect completed seating

**Testing Framework:** Playwright or Cypress

**Note:** E2E tests are optional for Phase 1 but recommended for production deployment

### Manual Testing Checklist

- [ ] WhatsApp message templates display correctly
- [ ] Real-time updates appear without refresh
- [ ] Toast notifications show for all user actions
- [ ] Mobile responsive design works on various screen sizes
- [ ] Table status colors are clearly distinguishable
- [ ] Queue position updates are immediate
- [ ] Analytics charts render correctly with data
- [ ] Error messages are user-friendly
- [ ] Loading states appear during API calls
- [ ] Protected routes redirect unauthenticated users

## Deployment Strategy

### Backend Deployment (Render/Fly.io)

**Environment Variables:**
```
DATABASE_URL=postgresql://...  # Supabase connection string
JWT_SECRET=...
JWT_EXPIRES_IN=24h
WHATSAPP_API_KEY=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_BUSINESS_ACCOUNT_ID=...
NODE_ENV=production
PORT=3000
```

**Deployment Steps:**
1. Push code to GitHub repository
2. Connect repository to Render/Fly.io
3. Configure environment variables
4. Run Prisma migrations: `npx prisma migrate deploy`
5. Seed initial data: `npm run seed`
6. Deploy application
7. Verify health check endpoint

**Database Migrations:**
```bash
# Generate migration
npx prisma migrate dev --name init

# Deploy to production
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### Frontend Deployment (Vercel)

**Environment Variables:**
```
VITE_API_BASE_URL=https://api.yourapp.com
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

**Deployment Steps:**
1. Push code to GitHub repository
2. Import project in Vercel
3. Configure environment variables
4. Set build command: `npm run build`
5. Set output directory: `dist`
6. Deploy application
7. Configure custom domain (optional)

### Supabase Configuration

**Setup Steps:**
1. Create new Supabase project
2. Copy connection string to backend .env
3. Enable Realtime for required tables:
   - queue_entries
   - tables
   - seating_sessions
4. Configure Row Level Security (RLS) policies if needed
5. Set up database backups
6. Configure connection pooling for production

**Realtime Configuration:**
```sql
-- Enable realtime for queue_entries table
ALTER PUBLICATION supabase_realtime ADD TABLE queue_entries;

-- Enable realtime for tables table
ALTER PUBLICATION supabase_realtime ADD TABLE tables;

-- Enable realtime for seating_sessions table
ALTER PUBLICATION supabase_realtime ADD TABLE seating_sessions;
```

### WhatsApp Business API Setup

**Prerequisites:**
- Facebook Business Account
- WhatsApp Business Account
- Verified phone number
- Meta Developer App

**Configuration Steps:**
1. Create Meta Developer App
2. Add WhatsApp product
3. Configure webhook URL: `https://api.yourapp.com/api/whatsapp/webhook`
4. Subscribe to message events
5. Generate access token
6. Add phone number
7. Test message sending

**Webhook Verification:**
```javascript
// Backend webhook endpoint must verify Meta's challenge
app.get('/api/whatsapp/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});
```

### Monitoring and Logging

**Backend Monitoring:**
- Use Winston or Pino for structured logging
- Log all API requests and responses
- Log all database errors
- Log all WhatsApp API interactions
- Set up error alerting (email/Slack)

**Frontend Monitoring:**
- Use Sentry for error tracking
- Track user interactions
- Monitor API response times
- Track failed API calls

**Database Monitoring:**
- Monitor Supabase dashboard for query performance
- Set up alerts for connection pool exhaustion
- Monitor disk usage
- Track slow queries

### Security Considerations

1. **Authentication:**
   - Use strong JWT secrets (minimum 32 characters)
   - Implement token refresh mechanism
   - Set appropriate token expiration times
   - Store tokens securely in httpOnly cookies or secure storage

2. **Authorization:**
   - Implement role-based access control
   - Validate user permissions on every request
   - Use middleware for consistent authorization checks

3. **Data Validation:**
   - Validate all input data on backend
   - Sanitize user inputs to prevent injection attacks
   - Use Prisma's parameterized queries

4. **API Security:**
   - Implement rate limiting
   - Use CORS with specific origins
   - Validate WhatsApp webhook signatures
   - Use HTTPS for all communications

5. **Database Security:**
   - Use Supabase RLS policies
   - Limit database user permissions
   - Encrypt sensitive data at rest
   - Regular security audits

### Performance Optimization

1. **Backend:**
   - Implement database query optimization
   - Use Prisma's select to fetch only needed fields
   - Implement caching for frequently accessed data (Redis)
   - Use database indexes on frequently queried fields
   - Implement pagination for large datasets

2. **Frontend:**
   - Code splitting with React.lazy
   - Optimize images and assets
   - Implement virtual scrolling for long lists
   - Use React.memo for expensive components
   - Debounce search and filter inputs

3. **Real-time:**
   - Use Supabase Realtime filters to reduce data transfer
   - Implement connection pooling
   - Batch multiple updates when possible
   - Implement reconnection logic with exponential backoff

## Phase 1 Scope Summary

**Included in Phase 1:**
- Complete backend API with all core modules
- Admin frontend with queue, tables, and analytics
- WhatsApp integration for customer communication
- Real-time updates via Supabase Realtime
- Basic analytics dashboard
- Authentication and authorization
- Database schema with Prisma
- Error handling and logging
- Deployment configuration

**Deferred to Phase 2:**
- Advanced analytics and reporting
- Customer mobile app
- Multi-location support
- Advanced reservation features (recurring, group bookings)
- Staff scheduling integration
- Payment integration
- Customer loyalty program
- Email notifications
- SMS fallback for WhatsApp
- Advanced table management (merging, splitting)

**Deferred to Phase 3:**
- AI-powered wait time prediction
- Predictive analytics
- Customer preference learning
- Automated table optimization
- Integration with POS systems
- Kitchen display system integration
- Inventory management
- Menu management
