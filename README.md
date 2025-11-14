# MemoBox

A beautiful, intuitive notes app with embedded images, todo lists, and smart folder organization. Built with Next.js, TipTap, and PostgreSQL.

## Features

- **Rich Text Editor**: TipTap-powered editor with support for:
  - Text formatting (bold, italic, strikethrough, code)
  - Headings (H1, H2, H3)
  - Lists (bullet, numbered, todo/checklist)
  - Images (embedded as base64)
  - Blockquotes
- **Smart Organization**: Nested folders with drag-and-drop support
- **Search & Filter**: Full-text search across all your notes
- **Mobile-First Design**: Beautiful, responsive UI that works on all devices
- **OAuth Authentication**: Sign in with Google or GitHub
- **Auto-Save**: Notes automatically save as you type
- **Pin Notes**: Keep important notes at the top

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 with OAuth providers
- **UI**: shadcn/ui + Tailwind CSS
- **Editor**: TipTap
- **State Management**: React Query
- **Drag & Drop**: @dnd-kit

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud)

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**

   Copy `.env.example` to `.env.local` and fill in your values:

   Required environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Your app URL (http://localhost:3000 for local)
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: From [Google Cloud Console](https://console.cloud.google.com/)
   - `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`: From [GitHub OAuth Apps](https://github.com/settings/developers)

3. **Set up the database**

   For local development with Prisma Postgres:
   ```bash
   npx prisma dev
   ```

   Or migrate an existing database:
   ```bash
   npx prisma migrate dev
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploying to Railway

Railway makes deployment incredibly simple with automatic PostgreSQL provisioning.

### Step 1: Create a Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account and select this repository

### Step 2: Add PostgreSQL

1. In your Railway project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create a PostgreSQL database and set the `DATABASE_URL` environment variable

### Step 3: Configure Environment Variables

In your Railway project settings, add these environment variables:

```
NEXTAUTH_URL=https://your-app.railway.app
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GITHUB_CLIENT_ID=<your-github-client-id>
GITHUB_CLIENT_SECRET=<your-github-client-secret>
```

### Step 4: Update OAuth Redirect URIs

For Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your OAuth credentials
3. Add `https://your-app.railway.app/api/auth/callback/google` to authorized redirect URIs

For GitHub OAuth:
1. Go to [GitHub OAuth Apps](https://github.com/settings/developers)
2. Update the Authorization callback URL to `https://your-app.railway.app/api/auth/callback/github`

### Step 5: Deploy

1. Railway will automatically deploy your app
2. After first deployment, run migrations in Railway's terminal:
   ```bash
   npx prisma migrate deploy
   ```

Your app should now be live!

## Project Structure

```
memobox/
├── app/
│   ├── (app)/                 # Authenticated app routes
│   │   ├── layout.tsx         # App layout with sidebar
│   │   ├── page.tsx           # Notes list page
│   │   └── note/[id]/         # Individual note editor
│   ├── api/                   # API routes
│   │   ├── auth/              # NextAuth.js
│   │   ├── folders/           # Folder CRUD
│   │   └── notes/             # Note CRUD
│   └── auth/signin/           # Sign-in page
├── components/
│   ├── app-sidebar.tsx        # App navigation sidebar
│   ├── editor/                # TipTap editor components
│   ├── providers.tsx          # React providers
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── auth.ts                # NextAuth.js config
│   └── prisma.ts              # Prisma client
├── prisma/
│   └── schema.prisma          # Database schema
└── hooks/                     # Custom React hooks
```

## License

MIT License - feel free to use this project for your own purposes.
