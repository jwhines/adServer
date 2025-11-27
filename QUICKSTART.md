# Quick Start Guide

Get the Family Rewards Ad Platform running locally in 5 minutes.

## Prerequisites

- **Node.js 18+** and npm installed
- **AWS Account** with credentials configured
- **AWS CLI** installed and configured (`aws configure`)

## Step 1: Install Dependencies (Required!)

**IMPORTANT**: You must run `npm install` before using `npx ampx sandbox`

```bash
# Install root dependencies (Amplify CLI + backend)
npm install

# Install business portal dependencies
cd business-portal
npm install
cd ..
```

This installs:
- AWS Amplify CLI (`@aws-amplify/backend-cli`)
- Lambda function dependencies
- Vue.js and Tailwind CSS
- TypeScript and build tools

**Note**: If you skip this step, you'll get an error: "could not determine executable to run"

## Step 2: Start Backend Sandbox

Open a terminal and run:

```bash
npx ampx sandbox
```

This will:
- Create local DynamoDB tables
- Deploy Lambda functions
- Start GraphQL API
- Generate `amplify_outputs.json`

**Wait** for the message: `Sandbox is ready! 🚀`

## Step 3: Start Frontend Dev Server

Open a **second terminal** and run:

```bash
cd business-portal
npm run dev
```

Open browser to: `http://localhost:5173`

## Step 4: Create First Business Account

1. Click "Register your business"
2. Fill in business details
3. Verify email (check AWS console for verification code in sandbox mode)
4. Login

## Troubleshooting

### "amplify_outputs.json not found"
- Make sure `npx ampx sandbox` is running and fully initialized
- The file generates automatically after first sandbox start

### "Module not found" errors
```bash
npm install
cd business-portal && npm install
```

### GraphQL errors
- Ensure sandbox is running
- Check CloudWatch logs in AWS console

### Authentication errors
- Check Cognito user pool in AWS console
- Verify email in sandbox mode manually

## What's Working Now

✅ Backend infrastructure (GraphQL API, DynamoDB, S3, Lambda)
✅ Authentication (login/register/logout)
✅ Routing (protected routes)
✅ State management (Pinia stores)
✅ Sample LoginView and Button component

## What's Next

Follow the **IMPLEMENTATION_GUIDE.md** to build:
1. UI components (Input, Select, Modal)
2. Layout (Header, Sidebar)
3. Dashboard view
4. Reward management
5. Analytics

## Useful Commands

```bash
# Backend
npx ampx sandbox              # Start local development
npx ampx sandbox delete       # Clean up sandbox
npx ampx deploy --branch main # Deploy to production

# Frontend
cd business-portal
npm run dev                   # Start dev server
npm run build                 # Build for production
npm run preview               # Preview production build
npm run type-check            # Check TypeScript types
```

## Directory Structure

```
adServer/
├── amplify/               ← Backend (Lambda, GraphQL schema)
├── business-portal/       ← Frontend (Vue.js app)
├── README.md              ← Full documentation
├── IMPLEMENTATION_GUIDE.md ← Component building guide
├── PROJECT_STATUS.md      ← What's done / what's next
└── QUICKSTART.md          ← This file
```

## Need Help?

1. Check **README.md** for full documentation
2. See **IMPLEMENTATION_GUIDE.md** for component examples
3. Read **PROJECT_STATUS.md** for architecture details

## Development Workflow

```bash
# Terminal 1 (Backend)
npx ampx sandbox

# Terminal 2 (Frontend)
cd business-portal && npm run dev

# Terminal 3 (Git, etc)
git status
```

Both backend and frontend have hot-reload enabled!

---

**Happy coding!** 🎉
