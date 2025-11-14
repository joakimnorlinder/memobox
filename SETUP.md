# MemoBox Setup Guide

Follow these steps to get MemoBox running on your local machine.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

The `.env` file has been pre-configured with a local Prisma Postgres instance. You have two options:

#### Option A: Use Prisma's Local PostgreSQL (Recommended for Quick Start)

The `.env` file is already configured for this. Simply run:

```bash
npx prisma dev
```

This will:
- Start a local PostgreSQL database
- Run migrations automatically
- Generate the Prisma client

#### Option B: Use Your Own PostgreSQL Database

1. Update the `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/memobox?schema=public"
   ```

2. Generate Prisma client and run migrations:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

### 3. Configure OAuth (Required)

You need OAuth credentials to enable sign-in. You can use Google, GitHub, or both.

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "Google+ API"
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy the Client ID and Client Secret to your `.env`:
   ```env
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

#### GitHub OAuth

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Application name: MemoBox (local)
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and generate a Client Secret
5. Add to your `.env`:
   ```env
   GITHUB_CLIENT_ID="your-client-id"
   GITHUB_CLIENT_SECRET="your-client-secret"
   ```

### 4. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy the output and add it to your `.env`:
```env
NEXTAUTH_SECRET="paste-generated-secret-here"
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with your configured OAuth provider!

## Troubleshooting

### "Missing environment variable" Error

Make sure all required variables in `.env` are filled in:
- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXTAUTH_URL` - Should be `http://localhost:3000` for local dev
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- At least one OAuth provider (Google or GitHub)

### Database Connection Issues

If using Prisma Postgres (`npx prisma dev`):
- Make sure no other process is using the ports
- Try stopping and starting: `npx prisma dev --stop` then `npx prisma dev`

If using your own PostgreSQL:
- Ensure PostgreSQL is running
- Verify the connection string is correct
- Check that the database exists

### OAuth Redirect Errors

- Ensure redirect URIs exactly match in your OAuth app settings
- For local dev, use `http://localhost:3000` (not `127.0.0.1`)
- Make sure `NEXTAUTH_URL` in `.env` matches

### Prisma Client Not Found

Run:
```bash
npx prisma generate
```

## Next Steps

Once your app is running:

1. Sign in with your OAuth provider
2. Create your first note
3. Try the rich text editor features
4. Create folders to organize notes
5. Upload images
6. Create todo lists

## Ready to Deploy?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Railway deployment instructions.
