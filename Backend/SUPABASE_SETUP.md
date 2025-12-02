# Supabase Setup Guide

## 🚀 Quick Start

### Step 1: Create Supabase Project

1. Go to [https://app.supabase.com/](https://app.supabase.com/)
2. Click "New Project"
3. Fill in:
   - **Name**: Restaurant IQ (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you
4. Click "Create new project"
5. Wait 2-3 minutes for project to be ready

---

### Step 2: Get Database Connection String

1. In your Supabase project dashboard
2. Go to **Settings** (gear icon) → **Database**
3. Scroll down to **Connection string**
4. Select **Connection pooling** tab
5. Copy the connection string (looks like):
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.co:6543/postgres
   ```
6. **Important**: Replace `[YOUR-PASSWORD]` with your actual database password

---

### Step 3: Update Backend .env File

1. Open `Backend/.env`
2. Replace the `DATABASE_URL` line with your Supabase connection string:

```env
DATABASE_URL="postgresql://postgres.xxxxx:your-actual-password@aws-0-us-west-1.pooler.supabase.co:6543/postgres"
```

**Example**:
```env
DATABASE_URL="postgresql://postgres.abcdefgh:MySecurePass123@aws-0-us-west-1.pooler.supabase.co:6543/postgres"
```

---

### Step 4: Run Prisma Migrations

```bash
cd Backend
npx prisma migrate dev --name init
```

This will:
- Create all tables in your Supabase database
- Generate Prisma Client

---

### Step 5: Seed the Database

```bash
npm run seed
```

This will create:
- Admin user (admin@restaurant.com / admin123)
- Waiter user (waiter@restaurant.com / waiter123)
- 3 floors (Ground Floor, First Floor, Terrace)
- 13 tables across all floors
- 2 sample waiters

---

### Step 6: Start the Backend

```bash
npm run dev
```

You should see:
```
🚀 Server running on port 3000
📍 Health check: http://localhost:3000/health
🔐 Auth endpoint: http://localhost:3000/api/auth/login
🌍 Environment: development
```

---

## ✅ Verify Setup

### Test 1: Check Database in Supabase

1. Go to Supabase Dashboard
2. Click **Table Editor** (left sidebar)
3. You should see all tables:
   - users
   - floors
   - tables
   - customers
   - queue_entries
   - reservations
   - seating_sessions
   - waiters
   - activity_logs

### Test 2: Test Login API

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@restaurant.com","password":"admin123"}'
```

Should return:
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "...",
    "refreshToken": "..."
  }
}
```

### Test 3: Test Frontend Login

1. Go to http://localhost:5173/login
2. Enter:
   - Email: `admin@restaurant.com`
   - Password: `admin123`
3. Click "Sign In"
4. Should redirect to dashboard!

---

## 🔧 Troubleshooting

### Error: "Can't reach database server"

**Solution**: Check your connection string
- Make sure you replaced `[YOUR-PASSWORD]` with actual password
- Verify the connection string format
- Check if your IP is allowed (Supabase allows all by default)

### Error: "Authentication failed"

**Solution**: 
- Double-check your database password
- Try resetting database password in Supabase Settings → Database

### Error: "Connection pool timeout"

**Solution**: Use direct connection instead of pooling
1. In Supabase, go to Settings → Database
2. Copy the **Direct connection** string (port 5432)
3. Update `.env`:
```env
DATABASE_URL="postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres"
```

### Error: "SSL connection required"

**Solution**: Add SSL parameter to connection string:
```env
DATABASE_URL="postgresql://postgres:password@...?sslmode=require"
```

---

## 🔐 Security Best Practices

### 1. Change JWT Secret

In `.env`, replace with a long random string:
```env
JWT_SECRET="your-super-long-random-string-at-least-32-characters-long"
```

Generate one with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Use Environment Variables

Never commit `.env` file to git!

The `.gitignore` already includes `.env`, but double-check:
```bash
cat .gitignore | grep .env
```

### 3. Enable Row Level Security (RLS)

In Supabase:
1. Go to **Authentication** → **Policies**
2. Enable RLS for sensitive tables
3. Create policies for your use case

---

## 📊 Database Management

### View Data in Supabase

1. Go to **Table Editor** in Supabase
2. Click on any table to view/edit data
3. Use SQL Editor for complex queries

### Run Custom SQL

1. Go to **SQL Editor** in Supabase
2. Write your SQL queries
3. Example:
```sql
SELECT * FROM users;
SELECT * FROM tables WHERE status = 'AVAILABLE';
```

### Backup Database

1. Go to **Settings** → **Database**
2. Scroll to **Database Backups**
3. Enable automatic backups (recommended)

---

## 🚀 Production Deployment

### Update Environment Variables

For production, update:

```env
NODE_ENV=production
DATABASE_URL="your-production-supabase-url"
JWT_SECRET="your-production-secret"
CORS_ORIGIN="https://your-frontend-domain.com"
```

### Enable Connection Pooling

For better performance:

```env
DATABASE_URL="postgresql://postgres:password@aws-0-us-west-1.pooler.supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres"
```

Update `schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

## 📝 Connection String Formats

### Connection Pooling (Recommended for Production)
```
postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-west-1.pooler.supabase.co:6543/postgres
```

### Direct Connection (For Migrations)
```
postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

### With SSL (If Required)
```
postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

---

## 🎯 Next Steps

After Supabase is set up:

1. ✅ Test login from frontend
2. ✅ Verify tables page works with real data
3. ✅ Build remaining API endpoints (Tables, Queue, Analytics)
4. ✅ Enable Supabase Realtime for live updates
5. ✅ Deploy to production

---

## 📞 Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Connection Issues**: Check Supabase Status page

---

**Current Status**: Using SQLite for local development
**To Switch**: Follow steps above to migrate to Supabase PostgreSQL
