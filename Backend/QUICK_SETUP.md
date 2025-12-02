# ⚡ Quick Supabase Setup (5 Minutes)

## 1️⃣ Create Supabase Project
- Go to https://app.supabase.com/
- Click "New Project"
- Set password (save it!)
- Wait 2-3 minutes

## 2️⃣ Get Connection String
- Settings → Database
- Copy "Connection pooling" string
- Replace `[YOUR-PASSWORD]` with your password

## 3️⃣ Update .env
```env
DATABASE_URL="postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-us-west-1.pooler.supabase.co:6543/postgres"
```

## 4️⃣ Update schema.prisma
Change line 7 from:
```prisma
provider = "sqlite"
```
To:
```prisma
provider = "postgresql"
```

## 5️⃣ Run Commands
```bash
cd Backend
npx prisma migrate dev --name init
npm run seed
npm run dev
```

## ✅ Done!
Test login at: http://localhost:5173/login
- Email: admin@restaurant.com
- Password: admin123

---

## 🔄 Switch Back to SQLite (If Needed)

1. In `.env`:
```env
DATABASE_URL="file:./dev.db"
```

2. In `schema.prisma`:
```prisma
provider = "sqlite"
```

3. Run:
```bash
npx prisma migrate dev --name init
npm run seed
```

---

## 📚 Full Guide
See `SUPABASE_SETUP.md` for detailed instructions and troubleshooting.
