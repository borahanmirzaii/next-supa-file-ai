# Deployment Checklist

Use this checklist before deploying to production.

## Pre-Deployment

### Code Quality
- [ ] All tests passing (`pnpm test:all`)
- [ ] No linting errors (`pnpm lint`)
- [ ] Code reviewed and approved
- [ ] No console.log statements in production code
- [ ] Error handling implemented

### Security
- [ ] Rate limiting implemented on all API routes
- [ ] Input validation on all user inputs
- [ ] File name sanitization implemented
- [ ] Security headers configured
- [ ] RLS policies verified
- [ ] No secrets in code
- [ ] Environment variables documented

### Database
- [ ] All migrations tested
- [ ] Migrations are idempotent
- [ ] Indexes created for performance
- [ ] RLS policies tested
- [ ] Backup strategy in place

### Infrastructure
- [ ] Supabase production project ready
- [ ] Redis instance configured
- [ ] Storage bucket created
- [ ] Environment variables configured
- [ ] Domain configured (if applicable)
- [ ] SSL certificate configured

## Deployment

### Build
- [ ] Production build succeeds (`pnpm build`)
- [ ] No build errors or warnings
- [ ] Bundle size acceptable
- [ ] Static assets generated correctly

### Deploy
- [ ] Deployed to staging first
- [ ] Staging tests passed
- [ ] Deployed to production
- [ ] Deployment successful

### Post-Deployment

#### Verification
- [ ] Health check endpoint working (`/api/health`)
- [ ] Homepage loads correctly
- [ ] Login page accessible
- [ ] Can sign up new users
- [ ] Can upload files
- [ ] AI analysis works
- [ ] Knowledge base works
- [ ] Integrations work

#### Monitoring
- [ ] Error tracking configured
- [ ] Logging working
- [ ] Performance monitoring active
- [ ] Alerts configured
- [ ] Dashboard accessible

#### Testing
- [ ] Critical user flows tested
- [ ] No critical errors in logs
- [ ] Performance metrics acceptable
- [ ] User feedback positive

## Rollback Plan

- [ ] Rollback procedure documented
- [ ] Previous deployment tagged
- [ ] Database backup available
- [ ] Rollback tested in staging

## Sign-off

- **Deployed by**: ________________
- **Date**: ________________
- **Version**: ________________
- **Status**: ☐ Success ☐ Issues Found
- **Notes**: ________________

