# 🔧 Get Correct Supabase Connection String

## The authentication is failing. Let's get the correct connection string:

### Step 1: Go to Supabase Dashboard
1. Open: https://app.supabase.com/
2. Select your project: **fqpyxnhbqsswqbknuhpo**

### Step 2: Get Connection String
1. Click **Settings** (gear icon) in the left sidebar
2. Click **Database**
3. Scroll to **Connection string** section

### Step 3: Try Both Options

#### Option A: Session Mode (Recommended for Prisma)
1. Click the **"Session mode"** tab
2. Copy the connection string
3. It should look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.fqpyxnhbqsswqbknuhpo.supabase.co:5432/postgres
   ```
4. Replace `[YOUR-PASSWORD]` with: `Inker@savidh`

**Final string should be:**
```
postgresql://postgres:Inker@savidh@db.fqpyxnhbqsswqbknuhpo.supabase.co:5432/postgres
```

#### Option B: Connection Pooling
1. Click the **"Connection pooling"** tab
2. Make sure **"Transaction"** mode is selected (not "Session")
3. Copy the connection string
4. Replace `[YOUR-PASSWORD]` with: `Inker@savidh`

### Step 4: Verify Password
Double-check your database password in Supabase:
1. Settings → Database
2. Look for **"Database password"** section
3. If you forgot it, you can reset it there

### Step 5: Check if Database is Paused
1. In Supabase dashboard, check if your project shows "Paused"
2. If paused, click "Restore" to wake it up
3. Wait a minute for it to start

---

## 🔍 Current Issue

The connection is failing with authentication error. This could be because:

1. **Password is incorrect** - Double-check in Supabase
2. **Special characters in password** - The `@` symbol needs encoding
3. **Database is paused** - Check if project is active
4. **Wrong connection string format** - Try Session mode instead of Pooling

---

## ✅ What to Do Next

**Please provide me with:**

1. The **Session mode** connection string from Supabase (Settings → Database → Connection string → Session mode tab)
2. Confirm your database password is: `Inker@savidh`
3. Confirm your project is not paused (should show "Active" in dashboard)

**Or, if easier:**

Take a screenshot of the "Connection string" section in Supabase Settings → Database, and I'll help you format it correctly.
