# Implementation Plan

- [ ] 1. Backend Foundation Setup
- [-] 1.1 Initialize Prisma with Supabase connection

  - Create prisma/schema.prisma with all models (User, Floor, Table, Customer, QueueEntry, Reservation, SeatingSession, Waiter, ActivityLog)
  - Configure Supabase DATABASE_URL in .env
  - Generate Prisma Client
  - _Requirements: 9.1, 9.4, 9.5_

- [ ] 1.2 Create backend base structure and utilities
  - Create src/config/database.js for Prisma client initialization
  - Create src/common/response.js for standard API response format
  - Create src/common/logger.js for activity logging utility
  - Create src/middleware/error.middleware.js for global error handling
  - _Requirements: 9.2, 12.1, 12.2_

- [ ] 1.3 Implement JWT authentication middleware
  - Create src/middleware/auth.middleware.js for JWT verification
  - Create src/middleware/role.middleware.js for role-based access control
  - Add JWT helper functions (sign, verify, refresh)
  - _Requirements: 9.5_

- [ ] 1.4 Write property test for API response format
  - **Property 36: API Response Format Consistency**
  - **Validates: Requirements 9.2**

- [ ] 2. Authentication Module
- [ ] 2.1 Implement auth service layer
  - Create src/auth/auth.service.js with register, login, refreshToken functions
  - Implement password hashing with bcrypt
  - Implement JWT token generation and validation
  - _Requirements: 9.3_

- [ ] 2.2 Implement auth controller and routes
  - Create src/auth/auth.controller.js
  - Create src/auth/auth.routes.js with POST /register, POST /login, POST /refresh, GET /me
  - Add input validation for auth endpoints
  - _Requirements: 9.2_

- [ ] 2.3 Write property test for error response format
  - **Property 37: Error Response Format**
  - **Validates: Requirements 12.1**

- [ ] 2.4 Write property test for validation error detail
  - **Property 40: Validation Error Detail**
  - **Validates: Requirements 12.5**

- [ ] 3. Tables Module
- [ ] 3.1 Implement tables service layer
  - Create src/tables/tables.service.js
  - Implement createTable, updateTableStatus, updateTableCapacity, getTablesByFloor, getAllTables
  - Add table availability calculation logic
  - _Requirements: 5.1, 5.2, 5.3_


- [ ] 3.2 Implement tables controller and routes
  - Create src/tables/tables.controller.js
  - Create src/tables/tables.routes.js with POST /tables, GET /tables, GET /tables/floor/:floorId, PUT /tables/:id/status, PUT /tables/:id/capacity
  - Add authentication and role middleware
  - _Requirements: 5.1, 5.2_

- [ ] 3.3 Write property test for table capacity matching
  - **Property 4: Table Capacity Matching**
  - **Validates: Requirements 1.5**

- [ ] 3.4 Write property test for cleaning status capacity exclusion
  - **Property 21: Cleaning Status Capacity Exclusion**
  - **Validates: Requirements 5.3**

- [ ] 4. Queue Module
- [ ] 4.1 Implement wait time calculation utility
  - Create src/queue/waitTime.util.js
  - Implement calculateWaitTime considering queue length, party sizes, and turnover
  - Implement default turnover fallback logic
  - Implement 5-minute rounding logic
  - _Requirements: 13.1, 13.2, 13.3_

- [ ] 4.2 Write property test for wait time calculation factors
  - **Property 41: Wait Time Calculation Factors**
  - **Validates: Requirements 13.1**

- [ ] 4.3 Write property test for wait time rounding
  - **Property 43: Wait Time Rounding**
  - **Validates: Requirements 13.3**

- [ ] 4.4 Write property test for default turnover fallback
  - **Property 42: Default Turnover Fallback**
  - **Validates: Requirements 13.2**

- [ ] 4.5 Implement queue position management utility
  - Create src/queue/position.util.js
  - Implement updateQueuePositions function to recalculate positions after changes
  - Ensure sequential positions with no gaps
  - _Requirements: 3.3_

- [ ] 4.6 Write property test for queue position recalculation
  - **Property 12: Queue Position Recalculation**
  - **Validates: Requirements 3.3**

- [ ] 4.7 Implement queue service layer
  - Create src/queue/queue.service.js
  - Implement addToQueue, getQueueList, updateQueueStatus, removeFromQueue
  - Integrate wait time calculation
  - Integrate position management
  - _Requirements: 1.2, 1.3, 3.1, 3.3, 4.1_

- [ ] 4.8 Write property test for queue entry creation completeness
  - **Property 1: Queue Entry Creation Completeness**
  - **Validates: Requirements 1.2**

- [ ] 4.9 Implement queue controller and routes
  - Create src/queue/queue.controller.js
  - Create src/queue/queue.routes.js with POST /queue, GET /queue, PUT /queue/:id/status, DELETE /queue/:id, GET /queue/wait-time/:partySize
  - Add authentication middleware
  - _Requirements: 1.2, 3.1, 4.1_

- [ ] 4.10 Write property test for queue display sorting
  - **Property 15: Queue Display Sorting**
  - **Validates: Requirements 4.1**

- [ ] 5. Seating Module
- [ ] 5.1 Implement seating service layer
  - Create src/seating/seating.service.js
  - Implement seatCustomer, endSeatingSession, getActiveSeating, markNoShow
  - Update queue positions when customer is seated
  - Update table status when seating starts/ends
  - _Requirements: 4.4, 5.4_

- [ ] 5.2 Write property test for seating action completeness
  - **Property 18: Seating Action Completeness**
  - **Validates: Requirements 4.4**

- [ ] 5.3 Write property test for no-show handling completeness
  - **Property 22: No-Show Handling Completeness**
  - **Validates: Requirements 5.4**

- [ ] 5.4 Implement seating controller and routes
  - Create src/seating/seating.controller.js
  - Create src/seating/seating.routes.js with POST /seating/seat, POST /seating/end/:sessionId, GET /seating/active, POST /seating/no-show/:queueId
  - Add authentication and role middleware
  - _Requirements: 4.4, 5.4_

- [ ] 6. Reservation Module (Basic)
- [ ] 6.1 Implement reservation service layer
  - Create src/reservations/reservations.service.js
  - Implement createReservation, getAvailableSlots, modifyReservation, cancelReservation
  - Implement operating hours validation
  - Implement buffer time enforcement
  - _Requirements: 2.1, 2.2, 2.5, 3.1, 14.2, 14.3_

- [ ] 6.2 Write property test for reservation availability accuracy
  - **Property 5: Reservation Availability Accuracy**
  - **Validates: Requirements 2.1**

- [ ] 6.3 Write property test for operating hours validation
  - **Property 45: Operating Hours Validation**
  - **Validates: Requirements 14.2**

- [ ] 6.4 Write property test for reservation buffer enforcement
  - **Property 46: Reservation Buffer Enforcement**
  - **Validates: Requirements 14.3**

- [ ] 6.4 Implement reservation controller and routes
  - Create src/reservations/reservations.controller.js
  - Create src/reservations/reservations.routes.js with POST /reservations, GET /reservations/available, PUT /reservations/:id, DELETE /reservations/:id
  - Add authentication middleware
  - _Requirements: 2.1, 2.2, 2.5, 3.1_

- [ ] 6.5 Write property test for late cancellation logging
  - **Property 14: Late Cancellation Logging**
  - **Validates: Requirements 3.5**

- [ ] 7. Activity Logging Module
- [ ] 7.1 Implement activity logging service
  - Create src/activity/activity.service.js
  - Implement logAction, logQueueEvent, logTableEvent functions
  - Ensure all logs include required fields (userId, action, entityType, entityId, details, timestamp)
  - _Requirements: 7.1, 7.2, 7.3, 7.5_

- [ ] 7.2 Write property test for log entry completeness
  - **Property 31: Log Entry Completeness**
  - **Validates: Requirements 7.5**

- [ ] 7.3 Integrate activity logging into all modules
  - Add logging calls to queue service (addToQueue, removeFromQueue, updateStatus)
  - Add logging calls to seating service (seatCustomer, endSession, markNoShow)
  - Add logging calls to tables service (updateStatus, updateCapacity)
  - Add logging calls to reservations service (create, modify, cancel)
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 7.4 Write property test for queue event logging
  - **Property 29: Queue Event Logging**
  - **Validates: Requirements 7.2**

- [ ] 7.5 Write property test for reservation event logging
  - **Property 30: Reservation Event Logging**
  - **Validates: Requirements 7.3**

- [ ] 8. Analytics Module
- [ ] 8.1 Implement analytics service layer
  - Create src/analytics/analytics.service.js
  - Implement getAverageWaitTime using Prisma aggregations
  - Implement getPeakHours by grouping queue entries by hour
  - Implement getTableTurnover calculating average session duration
  - Implement getNoShowRate as percentage calculation
  - Implement getCurrentQueueLength
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 8.2 Write property test for average wait time calculation
  - **Property 24: Average Wait Time Calculation**
  - **Validates: Requirements 6.1**

- [ ] 8.3 Write property test for table turnover calculation
  - **Property 26: Table Turnover Calculation**
  - **Validates: Requirements 6.3**

- [ ] 8.4 Write property test for no-show rate calculation
  - **Property 27: No-Show Rate Calculation**
  - **Validates: Requirements 6.4**

- [ ] 8.5 Implement analytics controller and routes
  - Create src/analytics/analytics.controller.js
  - Create src/analytics/analytics.routes.js with GET /analytics/wait-time, GET /analytics/peak-hours, GET /analytics/turnover, GET /analytics/no-show-rate, GET /analytics/queue-length
  - Add authentication and role middleware
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 9. WhatsApp Integration Module
- [ ] 9.1 Create WhatsApp message templates
  - Create src/whatsapp/message.templates.js
  - Define templates for: queue confirmation, position update, table ready, reservation confirmation, reservation reminder, cancellation confirmation
  - Implement variable interpolation function
  - _Requirements: 8.1, 8.5_

- [ ] 9.2 Write property test for message template usage
  - **Property 32: Message Template Usage**
  - **Validates: Requirements 8.1**

- [ ] 9.3 Write property test for template variable interpolation
  - **Property 35: Template Variable Interpolation**
  - **Validates: Requirements 8.5**

- [ ] 9.4 Implement WhatsApp service layer
  - Create src/whatsapp/whatsapp.service.js
  - Implement sendMessage, sendTemplate functions using WhatsApp Business API
  - Implement retry logic with exponential backoff
  - Implement error logging for failed messages
  - _Requirements: 1.3, 1.4, 2.3, 2.4, 3.2, 8.4, 12.3_

- [ ] 9.5 Write property test for WhatsApp retry logic
  - **Property 39: WhatsApp Retry Logic**
  - **Validates: Requirements 12.3**

- [ ] 9.6 Write property test for WhatsApp error handling
  - **Property 34: WhatsApp Error Handling**
  - **Validates: Requirements 8.4**

- [ ] 9.7 Implement WhatsApp webhook handler
  - Create src/whatsapp/webhook.controller.js
  - Implement webhook verification for Meta
  - Implement incoming message handler
  - Parse message intent and route to appropriate service
  - _Requirements: 8.3_

- [ ] 9.8 Write property test for message intent routing
  - **Property 33: Message Intent Routing**
  - **Validates: Requirements 8.3**

- [ ] 9.9 Integrate WhatsApp notifications into services
  - Add sendQueueConfirmation call in queue.service.js addToQueue
  - Add sendStatusUpdate call in queue.service.js when position changes
  - Add sendTableReady call in seating.service.js
  - Add sendReservationConfirmation call in reservations.service.js
  - Add sendCancellationConfirmation call in queue/reservation cancel functions
  - _Requirements: 1.3, 1.4, 2.3, 3.2, 4.3_

- [ ] 9.10 Write property test for queue confirmation messaging
  - **Property 2: Queue Confirmation Messaging**
  - **Validates: Requirements 1.3**

- [ ] 9.11 Write property test for position update notifications
  - **Property 3: Position Update Notifications**
  - **Validates: Requirements 1.4**

- [ ] 9.12 Write property test for cancellation confirmation messaging
  - **Property 11: Cancellation Confirmation Messaging**
  - **Validates: Requirements 3.2**

- [ ] 10. Waiters Module
- [ ] 10.1 Implement waiters service and routes
  - Create src/waiters/waiters.service.js with addWaiter, listWaiters functions
  - Create src/waiters/waiters.controller.js
  - Create src/waiters/waiters.routes.js with POST /waiters, GET /waiters
  - Add authentication and admin role middleware
  - _Requirements: 9.5_

- [ ] 11. Database Seeding and Migrations
- [ ] 11.1 Create Prisma migration
  - Run npx prisma migrate dev --name init
  - Verify all tables created in Supabase
  - _Requirements: 9.4_

- [ ] 11.2 Create database seed script
  - Create prisma/seed.js
  - Seed default admin user
  - Seed sample floors and tables
  - Seed sample waiters
  - _Requirements: 9.4_

- [ ] 12. Backend Integration and Testing
- [ ] 12.1 Create main Express app
  - Create src/app.js with all middleware (cors, json, error handler)
  - Mount all route modules
  - Add health check endpoint
  - _Requirements: 9.5_

- [ ] 12.2 Create server entry point
  - Create src/server.js
  - Initialize Prisma connection
  - Start Express server
  - Add graceful shutdown handling
  - _Requirements: 9.5_

- [ ] 12.3 Checkpoint - Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Frontend Foundation Setup
- [ ] 13.1 Create Axios instance with interceptors
  - Create src/api/axiosInstance.ts
  - Add request interceptor to attach JWT token
  - Add response interceptor for error handling and token refresh
  - _Requirements: 10.3_

- [ ] 13.2 Create authentication context/store
  - Create src/context/AuthContext.tsx OR src/store/authStore.ts
  - Implement login, logout, refreshToken, getUser functions
  - Store JWT token in localStorage or secure storage
  - _Requirements: 10.5_

- [ ] 13.3 Create protected route component
  - Create src/components/common/ProtectedRoute.tsx
  - Check authentication status
  - Redirect to login if not authenticated
  - _Requirements: 10.1_

- [ ] 13.4 Create base UI components
  - Create src/components/ui/Button.tsx with variants (primary, secondary, danger)
  - Create src/components/ui/Input.tsx with validation states
  - Create src/components/ui/Card.tsx
  - Create src/components/ui/Modal.tsx
  - Create src/components/ui/Loader.tsx
  - Style all components with Tailwind CSS
  - _Requirements: 10.1, 10.2_

- [ ] 13.5 Create layout components
  - Create src/components/common/Sidebar.tsx with navigation links:
    - RestroFlow logo with collapse button
    - Dashboard (home icon)
    - Table Status (grid icon)
    - Occupied Tables (person icon)
    - Queue Management (clock icon)
    - Customer History (history icon)
    - Manage Waiters (people icon)
    - Activity Log (document icon)
    - Logout (logout icon)
  - Create src/components/common/Header.tsx with user info and logout
  - Create src/layouts/AdminLayout.tsx combining Sidebar and Header
  - Create src/layouts/AuthLayout.tsx for login page
  - _Requirements: 10.2, 10.5_

- [ ] 14. Authentication Pages
- [ ] 14.1 Create login page
  - Create src/pages/Login.tsx
  - Add email and password input fields
  - Add form validation
  - Integrate with auth API (src/api/auth.api.ts)
  - Show toast notifications for success/error
  - Redirect to dashboard on successful login
  - _Requirements: 10.1, 10.3, 10.4_

- [ ] 14.2 Create auth API module
  - Create src/api/auth.api.ts
  - Implement login, register, refreshToken, getMe functions using axiosInstance
  - _Requirements: 10.3_

- [ ] 15. Dashboard Page
- [ ] 15.1 Create dashboard stats component
  - Create src/modules/dashboard/DashboardStats.tsx
  - Display 6 metric cards with icons:
    - Customers in Queue (blue people icon)
    - Occupied Tables (red grid icon)
    - Free Tables (green door icon)
    - Avg. Wait Time (yellow clock icon)
    - Longest Wait (gray clock icon)
    - Parties Seated Today (gray people icon)
  - Fetch data from analytics API
  - _Requirements: 6.5_

- [ ] 15.2 Create next up to be seated component
  - Create src/modules/dashboard/NextUpToBeSeated.tsx
  - Display next customer in queue to be seated
  - Show "Waiting queue is empty." when no customers
  - _Requirements: 4.2_

- [ ] 15.3 Create seated parties per hour chart
  - Create src/modules/dashboard/SeatedPartiesChart.tsx
  - Use Recharts for line/bar chart
  - Display parties seated per hour for current day
  - _Requirements: 6.2_

- [ ] 15.4 Create dashboard page
  - Create src/pages/Dashboard.tsx
  - Use AdminLayout
  - Left section: DashboardStats cards (2 rows), NextUpToBeSeated section
  - Right section: SeatedPartiesChart
  - _Requirements: 10.5_

- [ ] 16. Tables Management Page
- [ ] 16.1 Create tables API module
  - Create src/api/tables.api.ts
  - Implement getTables, getTablesByFloor, updateTableStatus, updateTableCapacity functions
  - Implement createTable, deleteTable functions for layout editing
  - _Requirements: 10.3, 20.2, 20.3_

- [ ] 16.2 Create floor selector component
  - Create src/modules/tables/FloorSelector.tsx
  - Display floor tabs/buttons (Floor 1, Floor 2 style)
  - Active floor has purple background, inactive has white
  - Handle floor selection
  - _Requirements: 10.1, 10.2_

- [ ] 16.3 Create table card component
  - Create src/modules/tables/TableCard.tsx
  - Display table number (T1, T2, etc.), capacity (Cap: 4), status (FREE/UNAVAILABLE)
  - Green background for FREE tables, gray for UNAVAILABLE
  - Show "Make Available" or "Unavailable" button based on status
  - _Requirements: 5.1, 10.2_

- [ ] 16.4 Create table grid component
  - Create src/modules/tables/TableGrid.tsx
  - Display responsive grid of TableCard components (10 columns on large screens)
  - Handle table status updates
  - Show loading state
  - _Requirements: 5.1, 10.1_

- [ ] 16.5 Create edit layout modal
  - Create src/modules/tables/EditLayoutModal.tsx
  - Allow adding new tables with table number and capacity
  - Allow removing existing tables
  - Allow modifying table capacity
  - Save changes to database
  - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_

- [ ] 16.6 Create tables page
  - Create src/pages/Tables.tsx
  - Use AdminLayout
  - Display FloorSelector at top with "Edit Layout" button on right
  - Display TableGrid below
  - Integrate with tables API
  - Show toast notifications for actions
  - _Requirements: 5.1, 5.2, 10.4, 20.1_

- [ ] 17. Queue Management Page
- [ ] 17.1 Create queue API module
  - Create src/api/queue.api.ts
  - Implement getQueue, addToQueue, updateQueueStatus, removeFromQueue functions
  - Implement runAllocator, getAutoAllocatorStatus, toggleAutoAllocator functions
  - _Requirements: 10.3, 16.1, 16.2_

- [ ] 17.2 Create add customer form component
  - Create src/modules/queue/AddCustomerForm.tsx
  - Add inline form fields (Name, Party Size, Phone with +91 prefix)
  - Add "Add to Queue" button
  - Add form validation
  - Handle form submission
  - _Requirements: 1.2, 10.1, 10.2_

- [ ] 17.3 Create seat manually form component
  - Create src/modules/queue/SeatManuallyForm.tsx
  - Add Customer dropdown (select from queue)
  - Add "Assign to Table(s)" multi-select
  - Show "Please select a customer first." when no customer selected
  - Add "Seat Customer" button
  - _Requirements: 21.1, 21.2, 21.3_

- [ ] 17.4 Create auto-allocator toggle component
  - Create src/modules/queue/AutoAllocatorToggle.tsx
  - Add "Run Allocator Now" button
  - Add "Auto-Allocator" toggle switch
  - Handle toggle state and run allocator action
  - _Requirements: 16.1, 16.2_

- [ ] 17.5 Create queue entry component
  - Create src/modules/queue/QueueEntry.tsx
  - Display NAME, # PEOPLE, WAIT TIME, PHONE, ACTION columns
  - Add action buttons (seat, cancel)
  - _Requirements: 4.1, 10.2_

- [ ] 17.6 Create queue list component
  - Create src/modules/queue/QueueList.tsx
  - Display table with queue entries
  - Add Prev/Next pagination buttons
  - Show "The waiting queue is empty." when no queue
  - _Requirements: 4.1, 10.1_

- [ ] 17.7 Create queue page
  - Create src/pages/Queue.tsx
  - Use AdminLayout with two-column layout
  - Left side: Waiting Queue table with pagination
  - Right side: Add Customer form, Seat Manually form
  - Top right: Auto-Allocator toggle and Run Allocator button
  - Integrate with queue API
  - Show toast notifications for actions
  - _Requirements: 1.2, 3.1, 4.1, 10.4, 16.1, 21.1_

- [ ]* 17.8 Write property test for auto-allocator party size matching
  - **Property 53: Auto-Allocator Party Size Matching**
  - **Validates: Requirements 16.3**

- [ ]* 17.9 Write property test for manual seating capacity validation
  - **Property 61: Manual Seating Capacity Validation**
  - **Validates: Requirements 21.2**

- [ ] 18. Occupied Tables Page
- [ ] 18.1 Create occupied tables API module
  - Create src/api/occupied.api.ts
  - Implement getOccupiedTables function
  - _Requirements: 17.1_

- [ ] 18.2 Create occupied tables list component
  - Create src/modules/occupied/OccupiedTablesList.tsx
  - Display table with TABLE, CUSTOMER NAME, PARTY SIZE, PHONE, SEATED AT columns
  - Show "No parties are currently seated." when empty
  - _Requirements: 17.1, 17.5_

- [ ] 18.3 Create occupied tables page
  - Create src/pages/OccupiedTables.tsx
  - Use AdminLayout
  - Display OccupiedTablesList component
  - Add real-time updates via Supabase
  - _Requirements: 17.1, 17.4_

- [ ] 19. Customer History Page
- [ ] 19.1 Create history API module
  - Create src/api/history.api.ts
  - Implement getCustomerHistory with filters (startDate, endDate, customerName, tableNumber)
  - Implement recordDeparture function
  - _Requirements: 15.1, 15.2, 15.3, 15.4_

- [ ] 19.2 Create history filters component
  - Create src/modules/history/HistoryFilters.tsx
  - Add Start Date, End Date date pickers
  - Add Customer Name search input
  - Add Table Number input
  - Add Apply Filter and Clear buttons
  - _Requirements: 15.2, 15.3, 15.4_

- [ ] 19.3 Create customer history table component
  - Create src/modules/history/CustomerHistoryTable.tsx
  - Display columns: NAME, PHONE, PARTY SIZE, TABLE SEATED, ARRIVAL TIME, SEATED TIME, DEPARTED TIME, TOTAL WAIT (MIN), DINE TIME (MIN)
  - Calculate and display wait time and dine time
  - _Requirements: 15.1, 15.5, 15.6_

- [ ] 19.4 Create customer history page
  - Create src/pages/CustomerHistory.tsx
  - Use AdminLayout
  - Display HistoryFilters and CustomerHistoryTable
  - Integrate with history API
  - _Requirements: 15.1_

- [ ]* 19.5 Write property test for customer history completeness
  - **Property 49: Customer History Record Completeness**
  - **Validates: Requirements 15.1**

- [ ]* 19.6 Write property test for wait time and dine time calculation
  - **Property 52: Wait Time and Dine Time Calculation**
  - **Validates: Requirements 15.6**

- [ ] 20. Manage Waiters Page
- [ ] 20.1 Create waiters API module
  - Create src/api/waiters.api.ts
  - Implement createWaiter, getWaiters, updateWaiter, deleteWaiter functions
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

- [ ] 20.2 Create add waiter form component
  - Create src/modules/waiters/AddWaiterForm.tsx
  - Add Username and Password input fields
  - Add "Add Waiter" button
  - Handle form validation and submission
  - _Requirements: 18.1, 18.2_

- [ ] 20.3 Create waiters list component
  - Create src/modules/waiters/WaitersList.tsx
  - Display table with USERNAME and ACTION columns
  - Add Edit and Delete buttons for each waiter
  - Handle edit and delete actions
  - _Requirements: 18.3, 18.4, 18.5_

- [ ] 20.4 Create manage waiters page
  - Create src/pages/ManageWaiters.tsx
  - Use AdminLayout
  - Display AddWaiterForm and WaitersList
  - Integrate with waiters API
  - Show toast notifications for actions
  - _Requirements: 18.1, 18.2, 18.3_

- [ ]* 20.5 Write property test for waiter account creation
  - **Property 57: Waiter Account Creation**
  - **Validates: Requirements 18.2**

- [ ] 21. Activity Log Page
- [ ] 21.1 Create activity API module
  - Create src/api/activity.api.ts
  - Implement getActivityLogs with filters (userType, userName, table, startDate, endDate)
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_

- [ ] 21.2 Create activity filters component
  - Create src/modules/activity/ActivityFilters.tsx
  - Add User Type dropdown (All Users, Admin, Waiter)
  - Add User Name dropdown
  - Add Table dropdown
  - Add Start Date and End Date pickers
  - Add Filter and Clear buttons
  - _Requirements: 19.2, 19.3, 19.4, 19.5_

- [ ] 21.3 Create action badge component
  - Create src/modules/activity/ActionBadge.tsx
  - Display color-coded badges: green=Cleared, red=Blocked, blue=Made Available
  - _Requirements: 19.6_

- [ ] 21.4 Create activity log table component
  - Create src/modules/activity/ActivityLogTable.tsx
  - Display columns: TIMESTAMP, USER, ACTION BADGE, ACTION DETAILS
  - Format timestamp as "21 Nov 2025, 10:49 am"
  - Display descriptive action details
  - _Requirements: 19.1, 19.7_

- [ ] 21.5 Create activity log page
  - Create src/pages/ActivityLog.tsx
  - Use AdminLayout
  - Display ActivityFilters and ActivityLogTable
  - Integrate with activity API
  - _Requirements: 19.1_

- [ ]* 21.6 Write property test for activity log entry completeness
  - **Property 58: Activity Log Entry Completeness**
  - **Validates: Requirements 19.1**

- [ ]* 21.7 Write property test for activity log action badge mapping
  - **Property 60: Activity Log Action Badge Mapping**
  - **Validates: Requirements 19.6**

- [ ] 22. Analytics Dashboard Page
- [ ] 22.1 Create analytics API module
  - Create src/api/analytics.api.ts
  - Implement getWaitTime, getPeakHours, getTurnover, getNoShowRate, getQueueLength functions
  - _Requirements: 10.3_

- [ ] 22.2 Create metrics card component
  - Create src/modules/analytics/MetricsCard.tsx
  - Display metric title, value, and optional trend
  - Style with Tailwind
  - _Requirements: 10.1, 10.2_

- [ ] 22.3 Create wait time chart component
  - Create src/modules/analytics/WaitTimeChart.tsx
  - Use Recharts or Chart.js for line chart
  - Display average wait time over time
  - _Requirements: 6.1, 10.1_

- [ ] 22.4 Create peak hours chart component
  - Create src/modules/analytics/PeakHoursChart.tsx
  - Use Recharts or Chart.js for bar chart
  - Display queue entries by hour
  - _Requirements: 6.2, 10.1_

- [ ] 22.5 Create analytics page
  - Create src/pages/Analytics.tsx
  - Use AdminLayout
  - Display MetricsCard components for key metrics
  - Display WaitTimeChart and PeakHoursChart
  - Integrate with analytics API
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 10.5_

- [ ] Checkpoint - Ensure frontend pages render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 23. Real-time Updates Integration (Optional for MVP)
- [ ]* 23.1 Set up Supabase Realtime client
  - Install @supabase/supabase-js
  - Create src/config/supabase.ts with Supabase client
  - Configure realtime subscriptions
  - _Requirements: 11.1_

- [ ]* 23.2 Add real-time updates to queue page
  - Subscribe to queue_entries table changes
  - Update queue list when new entries added or removed
  - Update queue positions when changed
  - _Requirements: 11.2_

- [ ]* 23.3 Add real-time updates to tables page
  - Subscribe to tables table changes
  - Update table status when changed
  - Update table grid display
  - _Requirements: 11.3_

- [ ]* 23.4 Add connection status indicator
  - Create connection status component
  - Show warning when realtime connection lost
  - Implement reconnection logic
  - _Requirements: 11.5_

- [ ] 23. Router and Navigation Setup
- [ ] 23.1 Create app router
  - Create src/router/AppRouter.tsx
  - Define routes for:
    - /login - Login page
    - / - Dashboard (protected)
    - /tables - Table Status (protected)
    - /occupied - Occupied Tables (protected)
    - /queue - Queue Management (protected)
    - /history - Customer History (protected)
    - /waiters - Manage Waiters (protected, admin only)
    - /activity - Activity Log (protected)
  - Wrap protected routes with ProtectedRoute component
  - _Requirements: 10.5_

- [ ] 23.2 Update App.tsx
  - Import and render AppRouter
  - Add ToastContainer from react-toastify
  - Add global styles
  - _Requirements: 10.1, 10.4_

- [ ] 24. Frontend Polish and Error Handling
- [ ] 24.1 Add loading states to all pages
  - Show Loader component while fetching data
  - Disable buttons during API calls
  - _Requirements: 10.1_

- [ ] 24.2 Add error handling to all API calls
  - Display toast notifications for errors
  - Show user-friendly error messages
  - Log errors to console
  - _Requirements: 10.4, 12.4_

- [ ] 24.3 Add form validation to all forms
  - Validate required fields
  - Validate email format
  - Validate phone number format
  - Display inline error messages
  - _Requirements: 10.1_

- [ ] 25. Final Integration and Testing
- [ ] 25.1 Test complete queue flow
  - Add customer to queue via admin panel
  - Verify queue position and wait time calculation
  - Seat customer and verify table status update
  - Verify queue positions recalculated
  - _Requirements: 1.2, 1.3, 4.1, 4.4_

- [ ] 25.2 Test complete reservation flow
  - Create reservation via API
  - Verify reservation confirmation
  - Modify reservation
  - Cancel reservation
  - _Requirements: 2.1, 2.2, 2.5, 3.1_

- [ ] 25.3 Test real-time updates
  - Open admin panel in two browser windows
  - Make changes in one window
  - Verify updates appear in other window
  - _Requirements: 11.2, 11.3, 11.4_

- [ ] 25.4 Test analytics calculations
  - Generate test data (queue entries, seating sessions, reservations)
  - Verify average wait time calculation
  - Verify peak hours identification
  - Verify table turnover calculation
  - Verify no-show rate calculation
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 25.5 Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 26. Deployment Preparation
- [ ] 26.1 Configure environment variables
  - Create .env.example files for backend and frontend
  - Document all required environment variables
  - _Requirements: Deployment_

- [ ] 26.2 Create deployment documentation
  - Document backend deployment steps for Render/Fly.io
  - Document frontend deployment steps for Vercel
  - Document Supabase configuration steps
  - Document WhatsApp Business API setup steps
  - _Requirements: Deployment_

- [ ] 26.3 Set up Prisma migrations for production
  - Test migration deployment process
  - Create seed script for production data
  - _Requirements: 9.4_

- [ ] 26.4 Configure CORS and security settings
  - Set allowed origins for CORS
  - Configure rate limiting
  - Set secure JWT settings
  - _Requirements: Security_
