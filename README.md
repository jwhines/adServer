# Family Rewards Ad Platform

AWS Amplify Gen 2 backend + Vue.js business portal for a direct-sold local advertising platform where Durham, NC businesses create reward offers that families can redeem with earned points.

## 🏗️ Project Structure

```
adServer/
├── amplify/                      # AWS Amplify Gen 2 Backend
│   ├── auth/                     # Cognito authentication
│   ├── data/                     # GraphQL API schema
│   ├── storage/                  # S3 storage configuration
│   ├── functions/                # Lambda functions
│   │   ├── get-rewards-for-family/
│   │   ├── redeem-reward/
│   │   ├── upload-reward-image/
│   │   ├── get-business-analytics/
│   │   └── track-ad-event/
│   └── backend.ts                # Backend configuration
├── business-portal/              # Vue.js Business Portal
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   ├── views/                # Page components
│   │   ├── stores/               # Pinia state management
│   │   ├── router/               # Vue Router
│   │   ├── types/                # TypeScript definitions
│   │   └── main.ts
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **AWS Account** with appropriate permissions
- **AWS CLI** configured with credentials
- **Git** for version control

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install business portal dependencies
cd business-portal
npm install
cd ..
```

### 2. Deploy Backend

```bash
# Start Amplify sandbox (development)
npx ampx sandbox

# Or deploy to production
npx ampx deploy --branch main
```

The deployment will:
- Create DynamoDB tables for Business, Reward, RewardRedemption, BusinessAnalytics
- Set up Cognito user pool for authentication
- Deploy Lambda functions
- Create S3 bucket for image storage
- Generate GraphQL API with AppSync
- Output `amplify_outputs.json` with connection details

### 3. Start Business Portal

```bash
cd business-portal
npm run dev
```

The portal will be available at `http://localhost:5173`

## 📊 Data Models

### Business
Local Durham businesses offering rewards to families.

**Key Fields:**
- Name, description, business type
- Location (address, lat/long, service radius)
- Contact info (phone, email, website)
- Verification status (pending, approved, rejected)
- Billing configuration (CPM, CPC, monthly retainer)

### Reward
Reward campaigns created by businesses.

**Key Fields:**
- Title, description, terms & conditions
- Point cost and retail value
- Targeting (age range, family size, radius)
- Inventory limits (total available, daily limit)
- Schedule (start/end dates, days of week)
- Analytics (impressions, clicks, redemptions)

### RewardRedemption
Records when families redeem rewards.

**Key Fields:**
- Family and child IDs
- Points spent
- Redemption code and status
- Expiration date
- Business revenue tracking

### BusinessAnalytics
Aggregated analytics by business and date.

**Key Fields:**
- Daily metrics (impressions, clicks, redemptions)
- Revenue and spend tracking
- Demographics (average child age)
- Top performing rewards

## 🔐 Authentication & Authorization

### User Roles

1. **PLATFORM_ADMIN**
   - Approve/reject business registrations
   - Curate reward catalog
   - View platform-wide analytics
   - Manage billing

2. **BUSINESS_OWNER**
   - Create and manage business profile
   - Create reward campaigns
   - Upload images
   - View analytics dashboard
   - Manage redemptions

### Email/Password Authentication

- Business owners register with email verification
- Admins are manually assigned by platform owner
- Password reset flow included

## 🎨 Business Portal Features

### Dashboard
- Real-time metrics cards (impressions, redemptions, ROI)
- Quick actions (create reward, view campaigns)
- Recent activity feed

### Reward Management
- Create/edit rewards with image upload
- Targeting options (age, family size, radius)
- Inventory and schedule management
- Performance analytics

### Analytics
- Interactive charts (Chart.js + vue-chartjs)
- Date range filtering
- Top performing rewards
- Export to CSV

### Redemptions
- View all redemptions with status
- Mark as fulfilled
- Generate QR codes
- Filter and search

### Business Profile
- Edit business information
- Upload logo
- Configure billing settings
- Set service radius

### Admin Portal
- Business approval queue
- Reward moderation
- Platform-wide analytics
- Revenue reporting

## 🛠️ Technology Stack

### Backend
- **AWS Amplify Gen 2** - Backend infrastructure
- **AWS AppSync** - GraphQL API
- **DynamoDB** - NoSQL database
- **S3** - Image storage with CloudFront CDN
- **Cognito** - User authentication
- **Lambda** - Serverless functions (TypeScript)
- **Location Service** - Geo-targeting

### Frontend
- **Vue 3** - Composition API with `<script setup>`
- **Vite** - Fast build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Chart.js** - Data visualization
- **Lucide Icons** - Icon library

## 📱 Mobile App Integration

The iOS and tvOS apps (built separately in Xcode) will:
1. Query `getRewardsForFamily` with family location
2. Display rewards filtered by proximity and child age
3. Call `redeemReward` mutation when child redeems points
4. Track impressions/clicks via `trackAdEvent`

## 🔧 Development Workflow

### Local Development

```bash
# Terminal 1: Run backend sandbox
npx ampx sandbox

# Terminal 2: Run business portal
cd business-portal
npm run dev
```

### Adding New Lambda Functions

1. Create function directory in `amplify/functions/`
2. Add `resource.ts` and `handler.ts`
3. Add `package.json` with dependencies
4. Import and configure in `amplify/backend.ts`
5. Grant necessary permissions

### Modifying GraphQL Schema

1. Edit `amplify/data/resource.ts`
2. Amplify sandbox will auto-regenerate types
3. Update frontend types in `business-portal/src/types/`

### Deploying to Production

```bash
# Deploy backend
npx ampx deploy --branch main

# Build and deploy frontend
cd business-portal
npm run build
# Upload dist/ to S3 or Amplify Hosting
```

## 🧪 Testing

```bash
# Run type checking
cd business-portal
npm run type-check

# Run unit tests (add later)
npm run test

# Run e2e tests (add later)
npm run test:e2e
```

## 📦 Environment Variables

The backend automatically configures environment variables for Lambda functions:
- `API_ENDPOINT` - GraphQL API URL
- `STORAGE_BUCKET_NAME` - S3 bucket name

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Amplify Gen 2 backend infrastructure
- ✅ Business portal (Vue.js + Tailwind)
- ✅ Core reward management
- ✅ Analytics dashboard
- 🚧 Seed data for development
- 🚧 Complete all Vue components
- 🚧 Admin portal views

### Phase 2 (Future)
- Stripe payment integration
- Advanced analytics (cohort analysis, A/B testing)
- Email notifications (SES)
- SMS notifications (SNS)
- Multi-location business support
- Reward templates
- Bulk import/export

### Phase 3 (Future)
- Machine learning for reward recommendations
- Fraud detection
- Mobile app SDK
- Partner API for third-party integrations

## 🤝 Contributing

This is a proprietary platform. For bugs or feature requests, contact the platform owner.

## 📄 License

Proprietary - All Rights Reserved

## 🙋 Support

For business inquiries: [Your contact email]
For technical support: [Support email]

## 🎯 Success Metrics

- **Business KPIs**: Active businesses, total rewards, redemption rate
- **Technical KPIs**: API response time < 500ms, 99.9% uptime
- **User KPIs**: Dashboard load time < 2s, mobile responsiveness

## 🔒 Security

- All API calls require valid Cognito JWT tokens
- Business owners can only access their own data
- Input validation on backend and frontend
- Image upload size limits and type checking
- HTTPS only
- CORS properly configured
- Rate limiting on API endpoints

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📞 Contact

Platform Owner: [Your Name]
Email: [Your Email]
Website: [Your Website]

---

Built with ❤️ in Durham, NC
