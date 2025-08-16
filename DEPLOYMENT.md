# Render Deployment Guide

## Overview
This is a full-stack chat application with React frontend and Express backend, configured for Render deployment.

## Pre-deployment Checklist
- [x] `render.yaml` configuration created
- [x] Server configured to bind to `0.0.0.0`
- [x] Build scripts configured in `package.json`
- [x] Environment variables documented
- [x] Health check endpoint configured

## Deployment Methods

### Method 1: Using render.yaml (Recommended)
1. Push your code to GitHub
2. Connect your GitHub repo to Render
3. Render will automatically detect `render.yaml` and configure deployment

### Method 2: Manual Setup
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Use these settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free` (or paid plan for production)

## Environment Variables
Set these in your Render dashboard:

- `NODE_ENV=production`
- `SESSION_SECRET=your_secure_random_string` (or let Render auto-generate)

## Project Structure
```
├── client/             # React frontend
├── server/             # Express backend with Socket.IO
├── shared/             # Shared types and schemas
├── dist/public/        # Built frontend (generated)
├── render.yaml         # Render configuration
└── package.json        # Dependencies and scripts
```

## Features
- Real-time chat with Socket.IO
- Public and private rooms
- In-memory storage (consider upgrading to persistent storage for production)
- Responsive UI with Tailwind CSS

## Notes
- Server binds to `0.0.0.0` for Render compatibility
- Socket.IO works seamlessly with Render's infrastructure
- The app uses in-memory storage - consider upgrading to a database for production
- Health check endpoint: `/api/rooms/public`
- Render provides automatic HTTPS and custom domains
