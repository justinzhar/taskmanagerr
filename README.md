# SimpleTasks

A simple task management web application that allows users to create an account and manage their personal tasks. Built as a full-stack college Engineering Design assignment demonstrating cloud database integration, user authentication, PostgreSQL Row-Level Security (RLS), and CRUD operations using Supabase.

---

## 🔗 Links

- **Deployed Application URL:** [https://your-project.vercel.app](https://your-project.vercel.app) *(Update after deployment)*
- **YouTube Demo URL:** [https://www.youtube.com/watch?v=your-demo-id](https://www.youtube.com/watch?v=your-demo-id) *(Update with your 3–5 min video)*

---

## 📖 About

**SimpleTasks** is a lightweight, clean, and full-stack web application. It addresses personal task tracking by providing authenticated user access, persistent cloud database storage, and complete isolation of each user's data using PostgreSQL Row Level Security (RLS) policies in Supabase.

---

## ✨ Features

- **User Authentication (Supabase Auth):**
  - Secure email & password registration
  - Secure email & password login
  - User session persistence and logout
  - Protected task dashboard (unauthenticated visitors cannot access tasks)
- **Database & Data Isolation (Supabase PostgreSQL + RLS):**
  - All tasks stored in a relational PostgreSQL table hosted on Supabase
  - Strict RLS policies ensure users can **only view, create, edit, and delete their own tasks**
- **Task Management (Full CRUD Operations):**
  - **Create:** Add new tasks with title, description, and due date
  - **Read:** View a list of personal tasks with visual status badges
  - **Update:** Edit task details (title, description, due date, status) and quick toggle completion
  - **Delete:** Delete a task with user confirmation
- **Clean & Responsive UI:**
  - Fast, responsive, centered layout
  - Clear feedback: error messages, loading indicators, and confirmation dialogs

---

## 🛠 Technologies Used

- **Frontend & Framework:** [Next.js](https://nextjs.org/) (App Router, React 19)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL Database & Supabase Auth)
- **Deployment:** [Vercel](https://vercel.com/) (Recommended for Next.js)

---

## 📁 Project Structure

```text
taskmanager/
├── src/
│   ├── app/
│   │   ├── globals.css         # Clean global styles & Tailwind configuration
│   │   ├── layout.tsx          # Root layout and metadata configuration
│   │   └── page.tsx            # Main page: switches between Auth and Dashboard
│   ├── components/
│   │   ├── AuthForm.tsx        # Login & registration forms with validation & feedback
│   │   ├── TaskCard.tsx        # Individual task card (edit, delete, mark complete)
│   │   ├── TaskDashboard.tsx   # Dashboard header, task counter/filter, and CRUD operations
│   │   └── TaskModal.tsx       # Reusable modal dialog for creating and editing tasks
│   ├── lib/
│   │   └── supabase.ts         # Supabase client setup with env validation
│   └── types/
│       └── task.ts             # TypeScript interfaces for Task models and forms
├── supabase/
│   └── schema.sql              # SQL script to create tasks table, enable RLS, and add policies
├── .env.example                # Template for environment variables
├── package.json                # Project dependencies and npm scripts
└── README.md                   # Project documentation and setup guide
```

---

## 🗄 Supabase Setup

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and log in or create an account.
2. Click **"New Project"**.
3. Choose your organization, set a project name (e.g., `SimpleTasks`), set a database password, and select a region close to you.
4. Click **"Create new project"** and wait for database provisioning to finish (~1 minute).

### 2. Run the SQL Script
1. In the Supabase project dashboard, navigate to the **SQL Editor** (icon with `>_` on the left sidebar).
2. Click **"New Query"**.
3. Copy and paste the contents of `supabase/schema.sql`:

```sql
-- 1. Create the tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist (for clean re-runs)
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

-- 4. Create RLS Policies
-- SELECT policy
CREATE POLICY "Users can view their own tasks"
    ON public.tasks
    FOR SELECT
    USING (auth.uid() = user_id);

-- INSERT policy
CREATE POLICY "Users can create their own tasks"
    ON public.tasks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- UPDATE policy
CREATE POLICY "Users can update their own tasks"
    ON public.tasks
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- DELETE policy
CREATE POLICY "Users can delete their own tasks"
    ON public.tasks
    FOR DELETE
    USING (auth.uid() = user_id);
```
4. Click **"Run"**. You will see `Success. No rows returned`.

### 3. Disable Email Confirmation (Recommended for Testing & Demos)
1. In the Supabase dashboard, go to **Authentication** > **Providers** > **Email**.
2. Toggle **Confirm email** to **OFF** (or leave it on if you prefer to confirm via email inbox).
3. Click **Save**.

---

## 🔑 Environment Variables

The application requires two environment variables to communicate with your Supabase backend.

Create a `.env.local` file in the root of the project:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-public-key
```

> **Note:** Where to find these in Supabase:
> 1. In your Supabase Dashboard, click **Project Settings** (gear icon) > **API**.
> 2. Under **Project URL**, copy the `URL`.
> 3. Under **Project API keys**, copy the `anon` / `public` key.

An example template is provided in [.env.example](.env.example). Never commit `.env.local` to GitHub.

---

## 💻 Running Locally

### 1. Clone the repository
```bash
git clone https://github.com/your-username/taskmanager.git
cd taskmanager
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Then paste your Supabase URL and anon key into `.env.local`.

### 4. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Deployment (Vercel)

Vercel is created by the team behind Next.js and provides instant, free 1-click deployment with official Supabase support:

1. Push your code to your GitHub repository (see instructions below).
2. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
3. Click **"Add New..."** > **"Project"**.
4. Import your `taskmanager` repository.
5. In the **Environment Variables** section, add your two Supabase keys:
   - `NEXT_PUBLIC_SUPABASE_URL` = *(Your Supabase project URL)*
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = *(Your Supabase project anon key)*
6. Click **"Deploy"**.
7. In ~1 minute, your app will be live with a URL like `https://taskmanager-xyz.vercel.app`.

---

## 📹 Demo Video

- **Video URL:** Simple Task, Full Stack Task Management App - Watch Video

<div>
    <a href="https://www.loom.com/share/07bf9ef801ca4f8bab1298c1bf689911">
      <p>Simple Task, Full Stack Task Management App - Watch Video</p>
    </a>
    <a href="https://www.loom.com/share/07bf9ef801ca4f8bab1298c1bf689911">
      <img style="max-width:300px;" src="https://www.loom.com/v1/videos/07bf9ef801ca4f8bab1298c1bf689911/thumbnail.gif">
    </a>
  </div>
