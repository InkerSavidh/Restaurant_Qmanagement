# Requirements Document

## Introduction

The Restaurant Intelligence Platform Phase 1 is a comprehensive queue and reservation management system that enables restaurants to manage customer waitlists and reservations through WhatsApp integration. The system provides real-time table availability tracking, automated customer notifications, and analytics for restaurant operations. This phase establishes the foundation for customer interaction, queue management, and basic operational analytics.

## Glossary

- **Queue System**: The digital waitlist management component that tracks customers waiting for tables
- **Reservation System**: The booking component that allows customers to reserve tables in advance
- **WhatsApp Service**: The messaging integration layer that handles customer communication via WhatsApp
- **Admin Panel**: The web-based interface for restaurant staff to manage queues, tables, and reservations
- **Table Status**: The current state of a table (available, occupied, reserved, cleaning)
- **Queue Entry**: A record representing a customer's position in the waitlist
- **Wait Time**: The estimated duration before a table becomes available for a customer
- **No-Show**: A reservation where the customer fails to arrive at the scheduled time
- **Table Turnover**: The rate at which tables become available after being occupied
- **Supabase**: The PostgreSQL database hosting platform with real-time capabilities
- **Prisma**: The ORM (Object-Relational Mapping) tool for database access
- **saviCode**: The frontend coding style using React, Tailwind CSS, and modular components
- **saviCodeBackend**: The backend coding style using Node.js, Express, and MVC structure

## Requirements

### Requirement 1

**User Story:** As a restaurant customer, I want to join the waitlist via WhatsApp, so that I can secure my place in line without physically waiting at the restaurant.

#### Acceptance Criteria

1. WHEN a customer sends a message to the restaurant WhatsApp number THEN the Queue System SHALL respond with available table options and current wait times
2. WHEN a customer requests to join the waitlist THEN the Queue System SHALL create a Queue Entry with customer details and estimated wait time
3. WHEN a Queue Entry is created THEN the Queue System SHALL send a confirmation message with queue position and wait estimate
4. WHEN a customer's queue position changes THEN the Queue System SHALL send an updated status notification via WhatsApp
5. WHERE a customer provides party size THEN the Queue System SHALL match them with appropriate table capacity

### Requirement 2

**User Story:** As a restaurant customer, I want to make a reservation via WhatsApp, so that I can guarantee a table at my preferred time.

#### Acceptance Criteria

1. WHEN a customer requests reservation availability THEN the Reservation System SHALL display available time slots for the requested date
2. WHEN a customer selects a time slot THEN the Reservation System SHALL create a reservation record with customer details and party size
3. WHEN a reservation is confirmed THEN the Reservation System SHALL send a confirmation message with reservation details
4. WHEN a reservation time approaches (30 minutes before) THEN the Reservation System SHALL send a reminder notification to the customer
5. WHEN a customer requests to modify a reservation THEN the Reservation System SHALL allow changes to time, date, or party size if availability permits

### Requirement 3

**User Story:** As a restaurant customer, I want to cancel my reservation or queue entry via WhatsApp, so that I can manage my plans flexibly.

#### Acceptance Criteria

1. WHEN a customer requests cancellation THEN the Queue System SHALL remove the Queue Entry or Reservation and update table availability
2. WHEN a cancellation is processed THEN the Queue System SHALL send a cancellation confirmation message
3. WHEN a Queue Entry is cancelled THEN the Queue System SHALL update positions for all subsequent customers in the queue
4. WHEN a reservation is cancelled THEN the Reservation System SHALL mark the time slot as available
5. IF a cancellation occurs within 2 hours of reservation time THEN the Reservation System SHALL log it as a late cancellation for analytics

### Requirement 4

**User Story:** As a restaurant staff member, I want to monitor the live queue through the Admin Panel, so that I can efficiently manage customer seating.

#### Acceptance Criteria

1. WHEN the Admin Panel loads THEN the Admin Panel SHALL display all active Queue Entries sorted by entry time
2. WHEN a table becomes available THEN the Admin Panel SHALL highlight the next customer in queue for that table size
3. WHEN staff marks a table as ready THEN the Admin Panel SHALL update the Table Status and notify the next customer via WhatsApp
4. WHEN staff seats a customer THEN the Admin Panel SHALL remove the Queue Entry and update table occupancy
5. WHILE the Admin Panel is open THEN the Admin Panel SHALL refresh queue data automatically every 10 seconds using Supabase Realtime or WebSockets

### Requirement 5

**User Story:** As a restaurant staff member, I want to manage table statuses in the Admin Panel, so that I can accurately track table availability.

#### Acceptance Criteria

1. WHEN staff views the table management screen THEN the Admin Panel SHALL display all tables with current status and occupancy time
2. WHEN staff changes a Table Status THEN the Admin Panel SHALL update the database and trigger queue recalculation
3. WHEN a table is marked as cleaning THEN the Admin Panel SHALL temporarily remove it from available capacity
4. WHEN a customer is marked as no-show THEN the Admin Panel SHALL log the event and release the table
5. WHEN a table becomes available THEN the Admin Panel SHALL automatically calculate updated wait times for queued customers

### Requirement 6

**User Story:** As a restaurant manager, I want to view analytics on queue and reservation performance, so that I can optimize operations and staffing.

#### Acceptance Criteria

1. WHEN the analytics dashboard loads THEN the Admin Panel SHALL display average wait time for the current day and week
2. WHEN analytics are calculated THEN the Admin Panel SHALL show peak hours based on queue entry timestamps
3. WHEN table turnover is computed THEN the Admin Panel SHALL display average time between table occupancy changes
4. WHEN no-show metrics are requested THEN the Admin Panel SHALL show no-show rate as a percentage of total reservations
5. WHEN live metrics are displayed THEN the Admin Panel SHALL show current queue length updated in real-time

### Requirement 7

**User Story:** As a system administrator, I want all customer interactions logged to the database, so that we can analyze patterns and improve service.

#### Acceptance Criteria

1. WHEN a customer interacts via WhatsApp THEN the WhatsApp Service SHALL create an AnalyticsLog entry with message type and timestamp
2. WHEN a Queue Entry is created or modified THEN the Queue System SHALL log the event with customer details and wait time
3. WHEN a reservation is made or cancelled THEN the Reservation System SHALL log the transaction with all relevant details
4. WHEN analytics queries are executed THEN the Admin Panel SHALL retrieve data from AnalyticsLog using Prisma queries
5. WHEN logs are stored THEN the Queue System SHALL include customer ID, action type, timestamp, and metadata fields

### Requirement 8

**User Story:** As a developer, I want the WhatsApp integration to be modular and maintainable, so that message flows can be easily updated.

#### Acceptance Criteria

1. WHEN WhatsApp messages are sent THEN the WhatsApp Service SHALL use predefined message templates from a centralized configuration
2. WHEN conversation flows are processed THEN the WhatsApp Service SHALL follow a state machine pattern for multi-step interactions
3. WHEN a message is received THEN the WhatsApp Service SHALL parse intent and route to appropriate service handlers
4. WHEN errors occur in WhatsApp communication THEN the WhatsApp Service SHALL log errors and send fallback messages to customers
5. WHERE message templates require customization THEN the WhatsApp Service SHALL support variable interpolation for dynamic content

### Requirement 9

**User Story:** As a developer, I want the backend to follow saviCodeBackend patterns with Prisma and Supabase, so that the codebase is consistent and scalable.

#### Acceptance Criteria

1. WHEN database operations are performed THEN the backend SHALL use Prisma Client exclusively for all queries
2. WHEN API endpoints are called THEN the backend SHALL return responses in the format: {status: "success" | "failed", message: "...", data: {...}}
3. WHEN business logic is executed THEN the backend SHALL implement logic in service layer classes, not controllers
4. WHEN database schema changes are needed THEN the backend SHALL use Prisma migrations to update the Supabase database
5. WHEN the backend is organized THEN the backend SHALL follow modular structure: src/auth/, src/tables/, src/queue/, src/seating/, src/history/, src/analytics/, src/waiters/, src/activity/, src/common/, prisma/

### Requirement 10

**User Story:** As a developer, I want the frontend to follow saviCode patterns, so that the UI is consistent, responsive, and maintainable.

#### Acceptance Criteria

1. WHEN frontend components are created THEN the Admin Panel SHALL use React functional components with hooks
2. WHEN styling is applied THEN the Admin Panel SHALL use Tailwind CSS classes exclusively for all styling
3. WHEN API calls are made THEN the Admin Panel SHALL use Axios with a configured instance and interceptors for all HTTP requests
4. WHEN user feedback is needed THEN the Admin Panel SHALL use React Toastify for success and error notifications
5. WHEN components are organized THEN the frontend SHALL follow modular folder structure: components/common/, components/ui/, modules/{moduleName}/, pages/

### Requirement 11

**User Story:** As a restaurant staff member, I want real-time updates in the Admin Panel, so that I always see the current queue and table status.

#### Acceptance Criteria

1. WHEN queue data changes in the database THEN the Admin Panel SHALL receive updates via Supabase Realtime or WebSockets
2. WHEN a new Queue Entry is added THEN the Admin Panel SHALL display the new entry without manual refresh
3. WHEN a Table Status changes THEN the Admin Panel SHALL update the table display immediately
4. WHEN multiple staff members use the Admin Panel THEN all instances SHALL show synchronized data
5. WHEN real-time connection is lost THEN the Admin Panel SHALL display a warning and attempt reconnection

### Requirement 12

**User Story:** As a system operator, I want proper error handling throughout the system, so that failures are logged and users receive helpful messages.

#### Acceptance Criteria

1. WHEN API errors occur THEN the backend SHALL return appropriate HTTP status codes with descriptive error messages
2. WHEN database operations fail THEN the backend SHALL log errors with stack traces and return user-friendly messages
3. WHEN WhatsApp API calls fail THEN the WhatsApp Service SHALL retry with exponential backoff and log failures
4. WHEN frontend API calls fail THEN the Admin Panel SHALL display toast notifications with error details
5. WHEN validation fails THEN the backend SHALL return detailed validation error messages in the response

### Requirement 13

**User Story:** As a customer, I want accurate wait time estimates, so that I can plan my arrival appropriately.

#### Acceptance Criteria

1. WHEN a wait time is calculated THEN the Queue System SHALL consider current queue length, party sizes, and average table turnover
2. WHEN table turnover data is insufficient THEN the Queue System SHALL use configurable default turnover times per table size
3. WHEN wait times are displayed THEN the Queue System SHALL round to nearest 5-minute increment
4. WHEN queue position advances THEN the Queue System SHALL recalculate and update wait time estimates
5. WHEN a customer requests wait time THEN the Queue System SHALL provide estimate within 2 seconds

### Requirement 14

**User Story:** As a restaurant manager, I want to configure system parameters, so that the system adapts to our restaurant's specific operations.

#### Acceptance Criteria

1. WHERE table configurations are defined THEN the Admin Panel SHALL allow setting table numbers, capacities, and types
2. WHERE operating hours are specified THEN the Reservation System SHALL only allow bookings within configured hours
3. WHERE buffer times are set THEN the Reservation System SHALL enforce minimum time between reservations
4. WHERE notification timing is configured THEN the Queue System SHALL send reminders based on configured intervals
5. WHERE capacity limits are defined THEN the Queue System SHALL prevent overbooking based on maximum capacity settings

### Requirement 15

**User Story:** As a restaurant staff member, I want to view customer history and analytics, so that I can track dining patterns and service quality.

#### Acceptance Criteria

1. WHEN the Customer History page loads THEN the Admin Panel SHALL display a table with NAME, PHONE, PARTY SIZE, TABLE SEATED, ARRIVAL TIME, SEATED TIME, DEPARTED TIME, TOTAL WAIT (MIN), and DINE TIME (MIN)
2. WHEN staff filters by date range THEN the Admin Panel SHALL show only records within the specified start and end dates
3. WHEN staff filters by customer name THEN the Admin Panel SHALL show records matching the search query
4. WHEN staff filters by table number THEN the Admin Panel SHALL show records for the specified table
5. WHEN a customer is seated THEN the Queue System SHALL record the arrival time and seated time for history tracking
6. WHEN a customer departs THEN the Admin Panel SHALL record the departed time and calculate total wait and dine time

### Requirement 16

**User Story:** As a restaurant staff member, I want an auto-allocator feature, so that customers can be automatically assigned to available tables.

#### Acceptance Criteria

1. WHEN the Auto-Allocator toggle is enabled THEN the Queue System SHALL automatically assign customers to available tables based on party size
2. WHEN staff clicks "Run Allocator Now" THEN the Queue System SHALL immediately attempt to seat the next eligible customer from the queue
3. WHEN auto-allocation runs THEN the Queue System SHALL match party size to table capacity with minimal wasted seats
4. WHEN no suitable table is available THEN the Queue System SHALL keep the customer in queue and notify staff
5. WHEN a customer is auto-allocated THEN the Admin Panel SHALL update the queue list and table status in real-time

### Requirement 17

**User Story:** As a restaurant staff member, I want to view currently occupied tables, so that I can monitor active seating and manage table turnover.

#### Acceptance Criteria

1. WHEN the Occupied Tables page loads THEN the Admin Panel SHALL display a table with TABLE, CUSTOMER NAME, PARTY SIZE, PHONE, and SEATED AT columns
2. WHEN a customer is seated THEN the Admin Panel SHALL add a new row to the Occupied Tables view
3. WHEN a table is cleared THEN the Admin Panel SHALL remove the row from Occupied Tables and update table status
4. WHEN viewing occupied tables THEN the Admin Panel SHALL show real-time updates via Supabase Realtime
5. WHEN no parties are seated THEN the Admin Panel SHALL display "No parties are currently seated." message

### Requirement 18

**User Story:** As a restaurant manager, I want to manage waiters through the Admin Panel, so that I can control staff access to the system.

#### Acceptance Criteria

1. WHEN the Manage Waiters page loads THEN the Admin Panel SHALL display a form to add new waiters with Username and Password fields
2. WHEN a new waiter is added THEN the Admin Panel SHALL create a user account with waiter role
3. WHEN viewing existing waiters THEN the Admin Panel SHALL display a list with USERNAME and ACTION columns (Edit, Delete)
4. WHEN staff clicks Edit on a waiter THEN the Admin Panel SHALL allow updating the waiter's username and password
5. WHEN staff clicks Delete on a waiter THEN the Admin Panel SHALL remove the waiter account after confirmation

### Requirement 19

**User Story:** As a restaurant manager, I want to view activity logs, so that I can audit staff actions and table status changes.

#### Acceptance Criteria

1. WHEN the Activity Log page loads THEN the Admin Panel SHALL display logs with TIMESTAMP, USER, ACTION BADGE, and ACTION DETAILS columns
2. WHEN staff filters by User Type THEN the Admin Panel SHALL show logs for the selected user type (All Users, Admin, Waiter)
3. WHEN staff filters by User Name THEN the Admin Panel SHALL show logs for the selected user
4. WHEN staff filters by Table THEN the Admin Panel SHALL show logs for the selected table
5. WHEN staff filters by date range THEN the Admin Panel SHALL show logs within the specified start and end dates
6. WHEN a table status changes THEN the Activity Log SHALL record the action with appropriate badge (Cleared, Blocked, Made Available)
7. WHEN displaying action details THEN the Activity Log SHALL show descriptive text like "Table T4 marked free (previously occupied by Vineeth Wilson)."

### Requirement 20

**User Story:** As a restaurant manager, I want to edit table layouts, so that I can configure the restaurant floor plan.

#### Acceptance Criteria

1. WHEN staff clicks "Edit Layout" on the Table Status page THEN the Admin Panel SHALL enable table editing mode
2. WHEN in edit mode THEN the Admin Panel SHALL allow adding new tables with table number and capacity
3. WHEN in edit mode THEN the Admin Panel SHALL allow removing existing tables
4. WHEN in edit mode THEN the Admin Panel SHALL allow modifying table capacity
5. WHEN changes are saved THEN the Admin Panel SHALL update the database and refresh the table grid

### Requirement 21

**User Story:** As a restaurant staff member, I want to manually seat customers from the queue, so that I can handle special requests and override auto-allocation.

#### Acceptance Criteria

1. WHEN staff selects a customer from the queue dropdown THEN the Admin Panel SHALL display the customer's party size
2. WHEN staff selects table(s) for seating THEN the Admin Panel SHALL validate that combined capacity meets party size
3. WHEN staff clicks "Seat Customer" THEN the Queue System SHALL remove the customer from queue and mark table(s) as occupied
4. WHEN manual seating is completed THEN the Admin Panel SHALL update queue positions and table status in real-time
5. WHEN no customer is selected THEN the Admin Panel SHALL display "Please select a customer first." in the table selection area
