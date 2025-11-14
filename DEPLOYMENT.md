# MemoBox Deployment Guide

This guide will help you deploy MemoBox to Railway with PostgreSQL.

## Quick Start

### 1. Get OAuth Credentials

Before deploying, you'll need OAuth credentials from Google and/or GitHub.

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add authorized redirect URIs:
   - For local: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://your-app.railway.app/api/auth/callback/google`
7. Save your Client ID and Client Secret

#### GitHub OAuth Setup

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - Application name: MemoBox
   - Homepage URL: `https://your-app.railway.app`
   - Authorization callback URL: `https://your-app.railway.app/api/auth/callback/github`
4. Save your Client ID and generate a Client Secret

### 2. Deploy to Railway

#### Option A: Deploy via Railway Dashboard

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up/in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository
   - Railway will start building automatically

3. **Add PostgreSQL Database**
   - In your project dashboard, click "+ New"
   - Select "Database" → "Add PostgreSQL"
   - Railway automatically sets `DATABASE_URL` environment variable

4. **Configure Environment Variables**
   - Click on your service (memobox)
   - Go to "Variables" tab
   - Add the following variables:

   ```
   NEXTAUTH_URL=https://your-app.railway.app
   NEXTAUTH_SECRET=<generate-with-openssl>
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   GITHUB_CLIENT_ID=<your-github-client-id>
   GITHUB_CLIENT_SECRET=<your-github-client-secret>
   ```

   To generate `NEXTAUTH_SECRET`, run:
   ```bash
   openssl rand -base64 32
   ```

5. **Run Database Migrations**
   - After the first deployment completes
   - Go to your service
   - Click "Deployments"
   - Click on the latest deployment
   - Open the "Deploy Logs"
   - Once build is complete, go to "Settings" → "Deploy"
   - Run this command: `npx prisma migrate deploy`

6. **Update OAuth Redirect URIs**
   - Copy your Railway app URL (e.g., `https://your-app.railway.app`)
   - Update Google OAuth redirect URI: `https://your-app.railway.app/api/auth/callback/google`
   - Update GitHub OAuth callback URL: `https://your-app.railway.app/api/auth/callback/github`

7. **Redeploy**
   - Go to "Deployments"
   - Click "Deploy" to trigger a new deployment
   - Your app should now be live!

#### Option B: Deploy via Railway CLI

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize Project**
   ```bash
   railway init
   ```

4. **Add PostgreSQL**
   ```bash
   railway add --database postgresql
   ```

5. **Set Environment Variables**
   ```bash
   railway variables set NEXTAUTH_URL=https://your-app.railway.app
   railway variables set NEXTAUTH_SECRET=$(openssl rand -base64 32)
   railway variables set GOOGLE_CLIENT_ID=your-google-client-id
   railway variables set GOOGLE_CLIENT_SECRET=your-google-client-secret
   railway variables set GITHUB_CLIENT_ID=your-github-client-id
   railway variables set GITHUB_CLIENT_SECRET=your-github-client-secret
   ```

6. **Deploy**
   ```bash
   railway up
   ```

7. **Run Migrations**
   ```bash
   railway run npx prisma migrate deploy
   ```

### 3. Verify Deployment

1. Visit your Railway app URL
2. You should see the MemoBox sign-in page
3. Try signing in with Google or GitHub
4. Create a test note to verify everything works

## Troubleshooting

### OAuth Redirect Errors

**Problem**: "Redirect URI mismatch" error when signing in

**Solution**:
- Verify your `NEXTAUTH_URL` matches your Railway domain exactly
- Check OAuth provider redirect URIs include your Railway domain
- Make sure there are no typos in the URLs
- Don't include trailing slashes in URLs

### Database Connection Errors

**Problem**: Cannot connect to database

**Solution**:
- Verify PostgreSQL is added to your Railway project
- Check that `DATABASE_URL` is set (Railway sets this automatically)
- Ensure migrations have been run: `npx prisma migrate deploy`

### Build Failures

**Problem**: Build fails during deployment

**Solution**:
- Check the build logs in Railway dashboard
- Ensure all dependencies are in `package.json`
- Verify `prisma generate` runs in the build script
- Try rebuilding: delete deployment and redeploy

### Missing Environment Variables

**Problem**: App crashes with "Missing environment variable" error

**Solution**:
- Check all required variables are set in Railway
- Required variables:
  - `DATABASE_URL` (auto-set by PostgreSQL plugin)
  - `NEXTAUTH_URL`
  - `NEXTAUTH_SECRET`
  - At least one OAuth provider (Google or GitHub)

### Prisma Client Not Generated

**Problem**: "Cannot find module '@prisma/client'" error

**Solution**:
- Ensure `postinstall` script is in `package.json`:
  ```json
  "scripts": {
    "postinstall": "prisma generate"
  }
  ```
- Redeploy the application

## Post-Deployment

### Setting Up a Custom Domain

1. In Railway, go to your service settings
2. Click "Domains"
3. Add your custom domain
4. Update your DNS records as instructed
5. Update `NEXTAUTH_URL` to your custom domain
6. Update OAuth redirect URIs to use custom domain

### Monitoring

Railway provides:
- Real-time logs
- Resource usage metrics
- Deployment history
- Database backups (on paid plans)

Access these in your Railway project dashboard.

### Scaling

Railway automatically handles scaling based on usage. For custom scaling:
1. Go to service "Settings"
2. Adjust resources under "Resources"
3. Configure autoscaling if needed

## Security Recommendations

1. **Rotate Secrets Regularly**
   - Generate new `NEXTAUTH_SECRET` periodically
   - Update OAuth credentials if compromised

2. **Enable HTTPS**
   - Railway provides HTTPS by default
   - Ensure `NEXTAUTH_URL` uses `https://`

3. **Database Backups**
   - Railway Pro includes automatic backups
   - Consider manual backups for critical data

4. **Environment Variables**
   - Never commit `.env` files to Git
   - Keep OAuth secrets secure
   - Use Railway's encrypted variable storage

## Cost Estimation

Railway offers:
- **Hobby Plan**: Free tier with limitations
- **Pro Plan**: $5/month + usage
  - PostgreSQL: ~$5-10/month for small databases
  - Web Service: Based on usage (sleep after inactivity on free tier)

Expected monthly cost for small personal use: $0-15

## Support

For deployment issues:
- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Project Issues: GitHub Issues

## Next Steps

After successful deployment:
1. Create your first note
2. Set up folders for organization
3. Customize the app (colors, branding)
4. Share with others or keep it private
5. Consider setting up a custom domain

Enjoy your new notes app!
