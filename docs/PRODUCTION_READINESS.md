# Production Readiness Checklist

This document outlines all requirements and checks needed before deploying to production.

## Pre-Deployment Checklist

### Infrastructure

- [ ] Supabase production project created
- [ ] Production database migrations applied
- [ ] Storage bucket `user-files` created in production
- [ ] Redis instance configured (production)
- [ ] Environment variables configured in production
- [ ] SSL certificate configured
- [ ] Custom domain configured (if applicable)
- [ ] CDN configured (if applicable)

### Security

- [ ] All API routes have rate limiting
- [ ] Input validation implemented on all endpoints
- [ ] File name sanitization implemented
- [ ] CSRF protection enabled (if applicable)
- [ ] Security headers configured
- [ ] RLS policies verified on all tables
- [ ] No secrets in code or environment
- [ ] OAuth credentials configured securely
- [ ] API keys stored securely

### Performance

- [ ] Database indexes created and verified
- [ ] Caching strategy implemented
- [ ] Bundle size optimized
- [ ] Images optimized
- [ ] API response times meet targets (< 500ms p95)
- [ ] Page load times meet targets (< 2s)
- [ ] Load testing completed

### Testing

- [ ] All unit tests passing
- [ ] All E2E tests passing
- [ ] Manual testing checklist completed
- [ ] No critical bugs
- [ ] Error handling tested

### Monitoring

- [ ] Health check endpoint working (`/api/health`)
- [ ] Error tracking configured (Sentry or similar)
- [ ] Logging configured
- [ ] Performance monitoring configured
- [ ] Alerting configured

### Documentation

- [ ] User guide created
- [ ] API documentation complete
- [ ] Deployment guide complete
- [ ] Environment variables documented
- [ ] Runbook created

## Deployment Steps

1. **Build Verification**
   ```bash
   pnpm build
   pnpm start
   ```

2. **Database Migration**
   ```bash
   supabase db push
   ```

3. **Environment Setup**
   - Configure all environment variables
   - Verify API keys
   - Test connections

4. **Deploy Application**
   - Deploy to Vercel/production
   - Verify deployment successful

5. **Post-Deployment Verification**
   - Check health endpoint
   - Test critical user flows
   - Monitor error rates
   - Check performance metrics

## Rollback Plan

1. Revert to previous deployment
2. Restore database backup if needed
3. Verify rollback successful
4. Investigate issues

## Success Criteria

- [ ] Zero critical errors in first 24 hours
- [ ] All health checks passing
- [ ] Performance metrics within targets
- [ ] User feedback positive

