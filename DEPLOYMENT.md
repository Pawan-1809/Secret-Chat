# Vercel Deployment Guide

## Overview
This is a full-stack chat application with React frontend and Express backend, configured for Vercel deployment.

## Pre-deployment Checklist
- [x] `vercel.json` configuration created
- [x] API routes moved to `/api` directory
- [x] Build scripts configured in `package.json`
- [x] Environment variables documented
- [x] `.vercelignore` file created

## Deployment Steps

### 1. Install Vercel CLI (if not already installed)
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy to Vercel
```bash
vercel --prod
```

## Environment Variables
Set these in your Vercel dashboard under Project Settings > Environment Variables:

- `NODE_ENV=production`
- `SESSION_SECRET=your_secure_random_string`
- Any database URLs if using external storage

## Project Structure
```
├── api/                 # Vercel serverless functions
│   └── index.ts        # Main API handler
├── client/             # React frontend
├── server/             # Original server code (used by API)
├── dist/public/        # Built frontend (generated)
└── vercel.json         # Vercel configuration
```

## Features
- Real-time chat with Socket.IO
- Public and private rooms
- In-memory storage (consider upgrading to persistent storage for production)
- Responsive UI with Tailwind CSS

## Notes
- Socket.IO works with Vercel's serverless functions
- The app uses in-memory storage - consider upgrading to a database for production
- All API routes are prefixed with `/api`
- Frontend is served as static files from `/dist/public`
