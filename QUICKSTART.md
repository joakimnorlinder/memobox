# MemoBox Quick Start Checklist

## Local Development Setup

- [ ] **Install dependencies**
  ```bash
  cd memobox
  npm install
  ```

- [ ] **Set up database**
  ```bash
  # Option 1: Use Prisma's local PostgreSQL (easiest)
  npx prisma dev

  # Option 2: Use your own PostgreSQL
  # Update DATABASE_URL in .env, then:
  npx prisma generate
  npx prisma migrate dev
  ```

- [ ] **Configure OAuth** (at least one required)
  - [ ] Google OAuth
    - Get credentials from [Google Cloud Console](https://console.cloud.google.com/)
    - Add redirect URI: `http://localhost:3000/api/auth/callback/google`
    - Add to `.env`: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

  - [ ] GitHub OAuth
    - Get credentials from [GitHub OAuth Apps](https://github.com/settings/developers)
    - Add callback URL: `http://localhost:3000/api/auth/callback/github`
    - Add to `.env`: `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`

- [ ] **Generate NextAuth secret**
  ```bash
  openssl rand -base64 32
  # Add output to .env as NEXTAUTH_SECRET
  ```

- [ ] **Start development server**
  ```bash
  npm run dev
  ```

- [ ] **Test the app**
  - Open http://localhost:3000
  - Sign in with OAuth provider
  - Create a test note
  - Try the rich text editor features

## Railway Deployment

- [ ] **Prepare OAuth for production**
  - Update redirect URIs to include your Railway domain
  - Google: `https://your-app.railway.app/api/auth/callback/google`
  - GitHub: `https://your-app.railway.app/api/auth/callback/github`

- [ ] **Deploy to Railway**
  - [ ] Create Railway account at [railway.app](https://railway.app)
  - [ ] Create new project from GitHub repo
  - [ ] Add PostgreSQL database (Railway plugin)
  - [ ] Configure environment variables:
    ```
    NEXTAUTH_URL=https://your-app.railway.app
    NEXTAUTH_SECRET=<generate-new-secret>
    GOOGLE_CLIENT_ID=<your-id>
    GOOGLE_CLIENT_SECRET=<your-secret>
    GITHUB_CLIENT_ID=<your-id>
    GITHUB_CLIENT_SECRET=<your-secret>
    ```
  - [ ] Wait for deployment to complete
  - [ ] Run migrations: `npx prisma migrate deploy` in Railway terminal
  - [ ] Test production app

## Features to Try

- [ ] Create notes with rich text formatting
- [ ] Upload and embed images
- [ ] Create todo/checklist items
- [ ] Pin important notes
- [ ] Create folders for organization
- [ ] Search across notes
- [ ] Test mobile responsiveness

## Customization Ideas

- [ ] Change theme colors in `app/globals.css`
- [ ] Add more OAuth providers (Twitter, Discord, etc.)
- [ ] Customize folder colors and icons
- [ ] Add note templates
- [ ] Implement note sharing
- [ ] Add export functionality (PDF, Markdown)

## Need Help?

- See [SETUP.md](./SETUP.md) for detailed setup instructions
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment guide
- See [README.md](./README.md) for feature documentation
