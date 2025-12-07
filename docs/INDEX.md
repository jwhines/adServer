# Ad Server Documentation Index

> **Complete documentation for the Family Rewards Ad Platform backend**

## 📚 Documentation Overview

This is the Ad Server backend for the Mumaku family management platform. It handles analytics tracking, reward advertising, and business management separate from the main family backend.

## 🚀 Getting Started

**New to the project?** Start here:

1. **[README.md](../README.md)** - Project overview, quick start, tech stack
2. **[QUICKSTART.md](../QUICKSTART.md)** - Fastest way to get up and running
3. **[ARCHITECTURE.md](../ARCHITECTURE.md)** - System architecture and diagrams

## 📖 Core Documentation

### Backend Development

- **[README.md](../README.md)** - Main project documentation
- **[ARCHITECTURE.md](../ARCHITECTURE.md)** - System architecture, data flow diagrams
- **[PROJECT_STATUS.md](../PROJECT_STATUS.md)** - Current implementation status
- **[IMPLEMENTATION_GUIDE.md](../IMPLEMENTATION_GUIDE.md)** - Step-by-step implementation guide
- **[SCHEMA_NOTES.md](../SCHEMA_NOTES.md)** - GraphQL schema documentation

### Analytics & Tracking

- **[ANALYTICS_TRACKING_GUIDE.md](./ANALYTICS_TRACKING_GUIDE.md)** - **⭐ START HERE** for analytics
  - Complete guide to analytics tracking system
  - Lambda function documentation
  - iOS/tvOS integration examples
  - Troubleshooting common issues
  - Recent fixes and best practices

- **[ANALYTICS_IMPLEMENTATION.md](../ANALYTICS_IMPLEMENTATION.md)** - Analytics infrastructure
  - Database schema for analytics tables
  - Lambda function implementations
  - GraphQL API reference
  - Investor metrics dashboard

- **[FAMILY_APP_ANALYTICS_INTEGRATION.md](../FAMILY_APP_ANALYTICS_INTEGRATION.md)** - iOS/tvOS integration
- **[IMPRESSION_TRACKING.md](../IMPRESSION_TRACKING.md)** - Ad impression tracking

### Deployment & Operations

- **[QUICKSTART.md](../QUICKSTART.md)** - Quick deployment guide
- **[SANDBOX_READY.md](../SANDBOX_READY.md)** - Sandbox environment setup
- **[DEPLOY_AFFILIATE_REWARDS.md](../DEPLOY_AFFILIATE_REWARDS.md)** - Affiliate rewards deployment
- **[TROUBLESHOOTING.md](../TROUBLESHOOTING.md)** - Common issues and solutions

### Feature Guides

- **[HOW_TO_ADD_AFFILIATE_REWARDS.md](../HOW_TO_ADD_AFFILIATE_REWARDS.md)** - Adding affiliate rewards
- **[DEVELOPMENT_CHECKLIST.md](../DEVELOPMENT_CHECKLIST.md)** - Pre-deployment checklist
- **[SESSION_STATE.md](../SESSION_STATE.md)** - Session state management
- **[DELIVERY_SUMMARY.md](../DELIVERY_SUMMARY.md)** - Project delivery summary

## 🎯 Quick Links by Task

### I want to...

#### Understand the System
→ Start with [ARCHITECTURE.md](../ARCHITECTURE.md)
→ Then read [README.md](../README.md)

#### Set Up Analytics Tracking
→ Read [ANALYTICS_TRACKING_GUIDE.md](./ANALYTICS_TRACKING_GUIDE.md)
→ Follow iOS integration examples
→ Check [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) if issues arise

#### Deploy the Backend
→ Follow [QUICKSTART.md](../QUICKSTART.md)
→ Check [SANDBOX_READY.md](../SANDBOX_READY.md)
→ Review [DEPLOYMENT_CHECKLIST.md](../DEVELOPMENT_CHECKLIST.md)

#### Integrate with iOS/tvOS
→ Read [FAMILY_APP_ANALYTICS_INTEGRATION.md](../FAMILY_APP_ANALYTICS_INTEGRATION.md)
→ Reference [ANALYTICS_TRACKING_GUIDE.md](./ANALYTICS_TRACKING_GUIDE.md) for examples
→ Check API reference in [ANALYTICS_IMPLEMENTATION.md](../ANALYTICS_IMPLEMENTATION.md)

#### Add New Features
→ Follow [IMPLEMENTATION_GUIDE.md](../IMPLEMENTATION_GUIDE.md)
→ Check [SCHEMA_NOTES.md](../SCHEMA_NOTES.md) for data models
→ Review [ARCHITECTURE.md](../ARCHITECTURE.md) for patterns

#### Troubleshoot Issues
→ Start with [TROUBLESHOOTING.md](../TROUBLESHOOTING.md)
→ Check CloudWatch logs (see [ANALYTICS_TRACKING_GUIDE.md](./ANALYTICS_TRACKING_GUIDE.md#troubleshooting))
→ Review [ANALYTICS_TRACKING_GUIDE.md](./ANALYTICS_TRACKING_GUIDE.md#recent-fixes) for recent fixes

## 📊 Documentation by Category

### Architecture & Design
- [ARCHITECTURE.md](../ARCHITECTURE.md) - System design
- [SCHEMA_NOTES.md](../SCHEMA_NOTES.md) - Data models

### Implementation
- [IMPLEMENTATION_GUIDE.md](../IMPLEMENTATION_GUIDE.md) - How to build features
- [ANALYTICS_IMPLEMENTATION.md](../ANALYTICS_IMPLEMENTATION.md) - Analytics infrastructure
- [ANALYTICS_TRACKING_GUIDE.md](./ANALYTICS_TRACKING_GUIDE.md) - Analytics tracking

### Integration
- [FAMILY_APP_ANALYTICS_INTEGRATION.md](../FAMILY_APP_ANALYTICS_INTEGRATION.md) - iOS/tvOS
- [IMPRESSION_TRACKING.md](../IMPRESSION_TRACKING.md) - Ad tracking
- [HOW_TO_ADD_AFFILIATE_REWARDS.md](../HOW_TO_ADD_AFFILIATE_REWARDS.md) - Affiliate rewards

### Operations
- [QUICKSTART.md](../QUICKSTART.md) - Quick start
- [SANDBOX_READY.md](../SANDBOX_READY.md) - Sandbox setup
- [DEPLOY_AFFILIATE_REWARDS.md](../DEPLOY_AFFILIATE_REWARDS.md) - Deployment
- [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) - Problem solving

### Project Management
- [PROJECT_STATUS.md](../PROJECT_STATUS.md) - Current status
- [DELIVERY_SUMMARY.md](../DELIVERY_SUMMARY.md) - Delivery summary
- [DEVELOPMENT_CHECKLIST.md](../DEVELOPMENT_CHECKLIST.md) - Checklist
- [SESSION_STATE.md](../SESSION_STATE.md) - State management

## 🆕 Recent Updates

### December 5, 2025
- ✅ **Fixed Analytics Tracking** - Resolved "Could not discover required DynamoDB tables" error
  - Updated Lambda functions to use environment variables
  - Granted proper IAM permissions
  - See [ANALYTICS_TRACKING_GUIDE.md](./ANALYTICS_TRACKING_GUIDE.md#recent-fixes)

- ✅ **Created Comprehensive Analytics Guide**
  - Complete tracking flow documentation
  - iOS/tvOS integration examples
  - Troubleshooting guide
  - Best practices

## 📝 Documentation Standards

### File Organization
```
adServer/
├── README.md                 # Main entry point
├── *.md                      # Root-level docs (overview, status, guides)
└── docs/
    ├── INDEX.md             # This file
    ├── ANALYTICS_TRACKING_GUIDE.md  # Detailed analytics guide
    └── [future docs]        # Additional detailed documentation
```

### Document Types

1. **Overview Docs** (Root level)
   - README.md, ARCHITECTURE.md, PROJECT_STATUS.md
   - High-level information, quick reference

2. **Implementation Guides** (Root level)
   - IMPLEMENTATION_GUIDE.md, QUICKSTART.md
   - Step-by-step instructions

3. **Detailed Guides** (docs/ folder)
   - ANALYTICS_TRACKING_GUIDE.md
   - Deep dives, troubleshooting, best practices

4. **Reference Docs** (Root level)
   - SCHEMA_NOTES.md, TROUBLESHOOTING.md
   - Quick lookups, problem solving

## 🔍 Search Tips

### Finding Information

**By Topic**:
- Analytics → [ANALYTICS_TRACKING_GUIDE.md](./ANALYTICS_TRACKING_GUIDE.md)
- Architecture → [ARCHITECTURE.md](../ARCHITECTURE.md)
- Deployment → [QUICKSTART.md](../QUICKSTART.md)
- Troubleshooting → [TROUBLESHOOTING.md](../TROUBLESHOOTING.md)

**By Role**:
- **Backend Developer** → Start with [ARCHITECTURE.md](../ARCHITECTURE.md), then [IMPLEMENTATION_GUIDE.md](../IMPLEMENTATION_GUIDE.md)
- **iOS Developer** → [ANALYTICS_TRACKING_GUIDE.md](./ANALYTICS_TRACKING_GUIDE.md) + [FAMILY_APP_ANALYTICS_INTEGRATION.md](../FAMILY_APP_ANALYTICS_INTEGRATION.md)
- **DevOps** → [QUICKSTART.md](../QUICKSTART.md) + [TROUBLESHOOTING.md](../TROUBLESHOOTING.md)
- **Product Manager** → [PROJECT_STATUS.md](../PROJECT_STATUS.md) + [ARCHITECTURE.md](../ARCHITECTURE.md)

## 🤝 Contributing to Documentation

When adding new documentation:

1. **Update this index** with the new document
2. **Choose the right location**:
   - Overview/quick reference → Root level
   - Detailed guide → `docs/` folder
3. **Follow naming conventions**:
   - Use UPPERCASE_WITH_UNDERSCORES.md
   - Be descriptive: `ANALYTICS_TRACKING_GUIDE.md` not `TRACKING.md`
4. **Include**:
   - Table of contents for long docs
   - Code examples
   - Last updated date
   - Links to related docs

## 📞 Support

- **Technical Issues**: See [TROUBLESHOOTING.md](../TROUBLESHOOTING.md)
- **Questions**: Contact justin@plysee.com
- **GitHub Issues**: [Create an issue](https://github.com/your-org/ad-server/issues)

## 📄 License

Proprietary - All rights reserved
