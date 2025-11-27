# Troubleshooting Guide

Common issues and solutions for the Family Rewards Ad Platform.

## Installation Issues

### ❌ "npm ERR! could not determine executable to run"

**Problem**: Running `npx ampx sandbox` before installing dependencies.

**Solution**:
```bash
# Install root dependencies first
npm install

# Then try sandbox again
npx ampx sandbox
```

### ❌ "Cannot find module '@aws-amplify/backend'"

**Problem**: Dependencies not installed.

**Solution**:
```bash
# Root directory
npm install

# Business portal
cd business-portal
npm install
cd ..
```

### ❌ TypeScript errors in IDE

**Problem**: VSCode showing errors before npm install.

**Solution**: These are expected before installation. After running `npm install`, the errors will disappear. Reload VSCode window if needed:
- Cmd/Ctrl + Shift + P
- "Developer: Reload Window"

## AWS / Amplify Issues

### ❌ "No credentials found"

**Problem**: AWS CLI not configured.

**Solution**:
```bash
# Configure AWS credentials
aws configure

# You'll need:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (e.g., us-east-1)
```

### ❌ "amplify_outputs.json not found"

**Problem**: Sandbox hasn't finished initialization.

**Solution**: Wait for the sandbox to complete startup. You'll see:
```
✅ Sandbox is ready!
amplify_outputs.json has been generated
```

This can take 2-5 minutes on first run.

### ❌ Sandbox stuck on "Deploying..."

**Problem**: CloudFormation deployment taking time or stuck.

**Solution**:
```bash
# Cancel with Ctrl+C and try again
npx ampx sandbox delete
npx ampx sandbox
```

### ❌ "Stack rollback failed"

**Problem**: AWS resources in bad state.

**Solution**:
```bash
# Delete sandbox and start fresh
npx ampx sandbox delete

# If that fails, manually delete from AWS Console:
# 1. Go to CloudFormation console
# 2. Find stacks starting with "amplify-"
# 3. Delete them
# 4. Try sandbox again
```

### ❌ "Resource already exists"

**Problem**: Previous sandbox wasn't cleaned up properly.

**Solution**:
```bash
# Delete with explicit identifier
npx ampx sandbox delete --identifier $(whoami)

# Or delete all sandbox resources from AWS Console:
# - CloudFormation: Delete stacks
# - DynamoDB: Delete tables starting with "amplify-"
# - S3: Delete buckets starting with "amplify-"
# - Cognito: Delete user pools starting with "amplify-"
```

## Frontend Issues

### ❌ "Cannot find module 'vue'"

**Problem**: Business portal dependencies not installed.

**Solution**:
```bash
cd business-portal
npm install
```

### ❌ Port 5173 already in use

**Problem**: Another Vite dev server is running.

**Solution**:
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use a different port
cd business-portal
npm run dev -- --port 3000
```

### ❌ Blank page / white screen

**Problem**: JavaScript errors in browser console.

**Solution**:
1. Open browser DevTools (F12)
2. Check Console for errors
3. Common causes:
   - `amplify_outputs.json` missing → Run `npx ampx sandbox`
   - Module not found → Run `npm install`
   - Syntax error → Check recent changes

### ❌ "Failed to fetch" errors

**Problem**: GraphQL API not accessible.

**Solution**:
1. Ensure sandbox is running
2. Check `amplify_outputs.json` exists in root directory
3. Check browser console for CORS errors
4. Try restarting sandbox

## Authentication Issues

### ❌ "User does not exist"

**Problem**: Trying to login before registering.

**Solution**: Click "Register your business" first.

### ❌ "User is not confirmed"

**Problem**: Email not verified.

**Solution**:
1. Check email for verification code (in sandbox, check AWS Console)
2. Or get code from Cognito console:
   - AWS Console → Cognito → User Pools
   - Find your user pool
   - Users tab → Find your user
   - Check "Email verified" status

### ❌ "Incorrect username or password"

**Problem**: Wrong credentials or user doesn't exist.

**Solution**:
1. Verify you've registered
2. Check email address is correct
3. Try password reset flow
4. In sandbox, you can verify users manually in Cognito console

### ❌ "Access token expired"

**Problem**: Token expired after 1 hour.

**Solution**: Refresh the page or logout and login again. Automatic token refresh is not yet implemented.

## GraphQL / API Issues

### ❌ "Network error"

**Problem**: Can't connect to GraphQL API.

**Solution**:
1. Check sandbox is running
2. Check `amplify_outputs.json` has correct endpoint
3. Check internet connection
4. Check AWS credentials are valid

### ❌ "Unauthorized"

**Problem**: Not logged in or token expired.

**Solution**: Login again.

### ❌ "GraphQL error: ..."

**Problem**: Query/mutation failed.

**Solution**:
1. Check browser console for full error
2. Check CloudWatch logs in AWS Console
3. Common causes:
   - Missing required fields
   - Validation errors
   - Permission denied (trying to access another business's data)

## Lambda Function Issues

### ❌ Lambda timeout

**Problem**: Function taking too long (> 30s).

**Solution**:
1. Check CloudWatch logs for the function
2. Look for slow database queries
3. Increase timeout in `resource.ts`:
   ```typescript
   defineFunction({
     timeoutSeconds: 60, // Increase from 30
   })
   ```

### ❌ Lambda out of memory

**Problem**: Function using more than allocated memory.

**Solution**:
1. Check CloudWatch logs for "out of memory"
2. Increase memory in `resource.ts`:
   ```typescript
   defineFunction({
     memoryMB: 1024, // Increase from 512
   })
   ```

## Development Workflow Issues

### ❌ Changes not reflected

**Problem**: Code changes not showing up.

**Solution**:

**Backend changes**:
- Sandbox auto-detects changes
- If not, restart sandbox:
  ```bash
  Ctrl+C
  npx ampx sandbox
  ```

**Frontend changes**:
- Vite has hot reload
- If not working, refresh browser
- Or restart dev server:
  ```bash
  Ctrl+C
  npm run dev
  ```

### ❌ TypeScript errors in terminal

**Problem**: Type checking failing.

**Solution**:
```bash
cd business-portal
npm run type-check

# Fix errors, then try again
```

## Deployment Issues

### ❌ "ampx deploy" fails

**Problem**: Production deployment error.

**Solution**:
1. Ensure all files are committed to git
2. Check AWS credentials have proper permissions
3. Try with verbose logging:
   ```bash
   npx ampx deploy --branch main --debug
   ```

### ❌ Production build fails

**Problem**: `npm run build` fails.

**Solution**:
```bash
cd business-portal

# Check for TypeScript errors
npm run type-check

# Fix errors, then build
npm run build
```

## Common Questions

### Q: How do I reset everything?

**A**: Complete reset:
```bash
# Delete sandbox
npx ampx sandbox delete

# Delete node_modules
rm -rf node_modules business-portal/node_modules

# Delete package-lock files
rm package-lock.json business-portal/package-lock.json

# Reinstall
npm install
cd business-portal && npm install && cd ..

# Start fresh
npx ampx sandbox
```

### Q: How do I see logs?

**A**: CloudWatch logs:
1. AWS Console → CloudWatch → Log groups
2. Find `/aws/lambda/amplify-*`
3. View latest log streams

Or use CLI:
```bash
aws logs tail /aws/lambda/amplify-getRewardsForFamily --follow
```

### Q: How do I test GraphQL queries?

**A**: Use the AWS AppSync console:
1. AWS Console → AppSync
2. Select your API
3. Click "Queries" tab
4. Write and test queries

### Q: How do I add an admin user?

**A**: Manually in Cognito console:
1. AWS Console → Cognito → User Pools
2. Select your user pool
3. Find your user
4. Groups tab → Add to group "PLATFORM_ADMIN"

### Q: Where are my images stored?

**A**: S3 bucket created by Amplify:
1. AWS Console → S3
2. Find bucket starting with "amplify-"
3. Look in `rewards/` and `businesses/` folders

### Q: How much is this costing me?

**A**: Check AWS Cost Explorer:
1. AWS Console → Cost Management → Cost Explorer
2. Filter by service
3. In sandbox: ~$0.10-0.50/day
4. In production: ~$2-3/day (1000 businesses)

### Q: Can I use a different AWS region?

**A**: Yes, set in AWS config:
```bash
aws configure
# Enter region like: us-west-2
```

Then delete and recreate sandbox.

## Getting More Help

### Documentation
- `README.md` - Project overview
- `QUICKSTART.md` - Setup guide
- `IMPLEMENTATION_GUIDE.md` - Component specs
- `ARCHITECTURE.md` - System design

### External Resources
- [AWS Amplify Docs](https://docs.amplify.aws/gen2/)
- [Vue 3 Docs](https://vuejs.org/)
- [Tailwind CSS Docs](https://tailwindcss.com/)

### Debugging Commands

```bash
# Check AWS CLI configured
aws sts get-caller-identity

# Check Node version (need 18+)
node --version

# Check npm version
npm --version

# List all Amplify resources
npx ampx sandbox list

# View sandbox status
npx ampx sandbox status

# Stream Lambda logs
npx ampx sandbox --stream-function-logs

# Deploy with debug output
npx ampx sandbox --debug
```

---

**Still stuck?** Check the error message carefully and search the AWS Amplify documentation or Stack Overflow.
