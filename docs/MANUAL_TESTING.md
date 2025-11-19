# Manual Testing Checklist

This document provides a comprehensive manual testing checklist for verifying all application features before production release.

## Prerequisites

- [ ] Supabase local stack running (`supabase start`)
- [ ] Redis running (`docker-compose up redis-local`)
- [ ] Next.js dev server running (`pnpm dev`)
- [ ] Storage bucket `user-files` created in Supabase Studio
- [ ] Test email access (Mailpit: http://127.0.0.1:54324)

## Test Environment

- **Application URL**: http://localhost:3000
- **Supabase Studio**: http://127.0.0.1:54323
- **Mailpit**: http://127.0.0.1:54324

---

## 1. Authentication Flow

### 1.1 Sign Up
- [ ] Navigate to http://localhost:3000/login
- [ ] Enter valid email address
- [ ] Enter password (min 8 characters)
- [ ] Click "Sign Up" button
- [ ] Verify redirect to email verification page or dashboard
- [ ] Check Mailpit (http://127.0.0.1:54324) for verification email
- [ ] Click verification link in email
- [ ] Verify redirect to dashboard after verification

### 1.2 Login
- [ ] Navigate to http://localhost:3000/login
- [ ] Enter registered email
- [ ] Enter correct password
- [ ] Click "Login" button
- [ ] Verify redirect to dashboard
- [ ] Verify user session persists on page refresh

### 1.3 Logout
- [ ] While logged in, click logout button
- [ ] Verify redirect to login page
- [ ] Verify cannot access protected routes

### 1.4 Protected Routes
- [ ] While logged out, try to access /dashboard
- [ ] Verify redirect to /login
- [ ] While logged out, try to access /files
- [ ] Verify redirect to /login
- [ ] After login, verify can access all protected routes

### 1.5 Session Persistence
- [ ] Login to application
- [ ] Close browser tab
- [ ] Reopen browser and navigate to http://localhost:3000
- [ ] Verify still logged in
- [ ] Verify session persists across browser restarts

---

## 2. File Upload & Management

### 2.1 Single File Upload
- [ ] Navigate to http://localhost:3000/files
- [ ] Upload a PDF file (< 50MB)
- [ ] Verify file appears in upload progress list
- [ ] Verify progress bar shows upload progress
- [ ] Verify file appears in file list after upload completes
- [ ] Verify file metadata (name, size, type, date) is displayed correctly

### 2.2 Multiple File Types
- [ ] Upload a DOCX file
- [ ] Upload a TXT file
- [ ] Upload a PNG/JPG image
- [ ] Upload an Excel file (XLSX)
- [ ] Upload a CSV file
- [ ] Verify all file types are accepted and displayed correctly

### 2.3 Drag & Drop
- [ ] Drag a file from file explorer onto dropzone
- [ ] Verify file is accepted
- [ ] Verify upload starts automatically
- [ ] Drag multiple files onto dropzone
- [ ] Verify all files are queued for upload

### 2.4 File Size Limits
- [ ] Attempt to upload file > 50MB
- [ ] Verify error message appears
- [ ] Verify file is not uploaded
- [ ] Upload file exactly 50MB
- [ ] Verify upload succeeds

### 2.5 Invalid File Types
- [ ] Attempt to upload .exe file
- [ ] Verify error message appears
- [ ] Attempt to upload .zip file
- [ ] Verify error message appears (if not supported)

### 2.6 File List Display
- [ ] Upload multiple files
- [ ] Verify all files appear in list
- [ ] Verify files are sorted by date (newest first)
- [ ] Verify file status is displayed (pending, processing, completed, failed)
- [ ] Verify file actions are available (view, download, delete)

### 2.7 File Download
- [ ] Click download button on uploaded file
- [ ] Verify file downloads correctly
- [ ] Verify downloaded file matches original

### 2.8 File Deletion
- [ ] Click delete button on a file
- [ ] Verify confirmation dialog appears (if implemented)
- [ ] Confirm deletion
- [ ] Verify file is removed from list
- [ ] Verify file is removed from Supabase Storage
- [ ] Verify file record is removed from database

### 2.9 Upload Progress
- [ ] Upload a large file (> 10MB)
- [ ] Verify progress bar updates in real-time
- [ ] Verify percentage or progress indicator updates
- [ ] Verify upload completes successfully

### 2.10 Error Handling
- [ ] Disconnect internet during upload
- [ ] Verify error message appears
- [ ] Verify upload can be retried
- [ ] Reconnect internet and retry upload
- [ ] Verify upload completes successfully

---

## 3. AI Analysis

### 3.1 Trigger Analysis
- [ ] Upload a PDF file
- [ ] Click "View Analysis" or navigate to file analysis page
- [ ] Verify analysis starts automatically
- [ ] Verify loading/processing indicator appears

### 3.2 Streaming Progress
- [ ] While analysis is running, verify progress updates appear
- [ ] Verify status messages update (e.g., "Analyzing document...", "Extracting insights...")
- [ ] Verify analysis completes successfully

### 3.3 Analysis Results Display
- [ ] Verify analysis results are displayed after completion
- [ ] Verify summary section appears
- [ ] Verify key points section appears
- [ ] Verify insights section appears
- [ ] Verify metadata (agent type, timestamp) is displayed

### 3.4 Document Agent
- [ ] Upload a PDF document
- [ ] Trigger analysis
- [ ] Verify document-specific analysis appears
- [ ] Verify text extraction is accurate
- [ ] Verify insights are relevant to document content

### 3.5 Image Agent
- [ ] Upload an image file (PNG, JPG)
- [ ] Trigger analysis
- [ ] Verify image analysis appears
- [ ] Verify image description is generated
- [ ] Verify visual insights are provided

### 3.6 Code Agent
- [ ] Upload a code file (.js, .ts, .py, etc.)
- [ ] Trigger analysis
- [ ] Verify code analysis appears
- [ ] Verify language detection works
- [ ] Verify code structure insights are provided

### 3.7 Data Agent
- [ ] Upload an Excel or CSV file
- [ ] Trigger analysis
- [ ] Verify data analysis appears
- [ ] Verify data structure summary is provided
- [ ] Verify key findings from data are extracted

### 3.8 Analysis Errors
- [ ] Upload a corrupted file
- [ ] Trigger analysis
- [ ] Verify error message appears
- [ ] Verify error is handled gracefully
- [ ] Verify user can retry analysis

### 3.9 Analysis Persistence
- [ ] Complete an analysis
- [ ] Navigate away from analysis page
- [ ] Return to analysis page
- [ ] Verify analysis results are still displayed
- [ ] Verify analysis is saved in database

---

## 4. Knowledge Base

### 4.1 Knowledge Base Creation
- [ ] Upload and analyze multiple files
- [ ] Verify knowledge base is built automatically
- [ ] Navigate to http://localhost:3000/knowledge-base
- [ ] Verify knowledge base statistics are displayed
- [ ] Verify file count matches uploaded files

### 4.2 RAG Chat Interface
- [ ] Navigate to knowledge base page
- [ ] Switch to "AI Chat" tab
- [ ] Enter a question about uploaded files
- [ ] Click "Send" button
- [ ] Verify AI response appears
- [ ] Verify response is relevant to uploaded files
- [ ] Verify response includes citations [1], [2], etc.

### 4.3 Source Citations
- [ ] Ask a question in chat
- [ ] Verify citations appear in response
- [ ] Click on a citation number
- [ ] Verify source information is displayed
- [ ] Verify source file name is shown
- [ ] Verify source snippet is displayed

### 4.4 Semantic Search
- [ ] Switch to "Search" tab
- [ ] Enter a search query
- [ ] Click "Search" button
- [ ] Verify search results appear
- [ ] Verify results are ranked by relevance
- [ ] Verify similarity scores are displayed
- [ ] Verify file names are shown for each result

### 4.5 File Filtering
- [ ] In knowledge base, select a file from filter dropdown
- [ ] Verify chat/search results are filtered to selected file
- [ ] Select "All Files"
- [ ] Verify all files are included in results

### 4.6 Multiple File Queries
- [ ] Upload files on different topics
- [ ] Ask questions that span multiple files
- [ ] Verify responses include information from multiple files
- [ ] Verify citations reference multiple files

### 4.7 Empty Knowledge Base
- [ ] With no files uploaded, navigate to knowledge base
- [ ] Verify empty state message appears
- [ ] Verify prompt to upload files is shown

### 4.8 Knowledge Base Statistics
- [ ] Verify total files count is displayed
- [ ] Verify total chunks count is displayed
- [ ] Verify statistics update after new file upload

---

## 5. MCP Integrations

### 5.1 Platform Display
- [ ] Navigate to http://localhost:3000/integrations
- [ ] Verify all available platforms are displayed (Google, Notion, Jira, GitHub)
- [ ] Verify platform status is shown (connected/disconnected)
- [ ] Verify platform icons/logos are displayed

### 5.2 OAuth Flow Initiation
- [ ] Click "Connect" button for Google platform
- [ ] Verify redirect to Google OAuth page
- [ ] Verify OAuth consent screen appears
- [ ] Verify correct scopes are requested
- [ ] Cancel OAuth flow
- [ ] Verify redirect back to integrations page

### 5.3 OAuth Completion
- [ ] Click "Connect" for a platform
- [ ] Complete OAuth flow
- [ ] Verify redirect back to integrations page
- [ ] Verify platform status changes to "Connected"
- [ ] Verify success message appears

### 5.4 Tool Discovery
- [ ] After connecting a platform, verify tools are discovered
- [ ] Verify tools are displayed in tool browser
- [ ] Verify tool descriptions are shown
- [ ] Verify tool categories are displayed

### 5.5 Tool Execution
- [ ] Select a tool from tool browser
- [ ] Click "Execute" button
- [ ] Verify tool input form appears
- [ ] Fill in required fields
- [ ] Click "Run" or "Execute"
- [ ] Verify tool execution starts
- [ ] Verify execution results are displayed
- [ ] Verify success/error status is shown

### 5.6 Tool Execution Errors
- [ ] Execute a tool with invalid inputs
- [ ] Verify error message appears
- [ ] Verify error is handled gracefully
- [ ] Verify user can retry execution

### 5.7 Platform Disconnection
- [ ] Click "Disconnect" button for connected platform
- [ ] Verify confirmation dialog appears (if implemented)
- [ ] Confirm disconnection
- [ ] Verify platform status changes to "Disconnected"
- [ ] Verify tools are no longer available

### 5.8 Tool Search
- [ ] Enter search query in tool search box
- [ ] Verify tools filter by search query
- [ ] Clear search
- [ ] Verify all tools are displayed again

### 5.9 Tool Filtering
- [ ] Filter tools by platform
- [ ] Verify only tools from selected platform are shown
- [ ] Filter by category
- [ ] Verify tools are filtered correctly

---

## 6. Error Scenarios

### 6.1 Network Failures
- [ ] Disconnect internet
- [ ] Attempt to upload file
- [ ] Verify error message appears
- [ ] Reconnect internet
- [ ] Verify retry works

### 6.2 API Errors
- [ ] Simulate API error (modify API route temporarily)
- [ ] Attempt operation that calls API
- [ ] Verify error message appears
- [ ] Verify error is user-friendly
- [ ] Restore API route
- [ ] Verify operation works normally

### 6.3 Invalid Inputs
- [ ] Enter invalid email format
- [ ] Verify validation error appears
- [ ] Enter password too short
- [ ] Verify validation error appears
- [ ] Upload invalid file type
- [ ] Verify error message appears

### 6.4 Timeout Handling
- [ ] Upload very large file
- [ ] Verify timeout is handled gracefully
- [ ] Verify user can retry

---

## 7. Performance

### 7.1 Page Load Times
- [ ] Measure homepage load time (< 2s target)
- [ ] Measure dashboard load time (< 2s target)
- [ ] Measure files page load time (< 2s target)
- [ ] Measure knowledge base load time (< 2s target)

### 7.2 API Response Times
- [ ] Measure file upload API response time
- [ ] Measure analysis API response time
- [ ] Measure chat API response time (< 1s target)
- [ ] Measure search API response time (< 1s target)

### 7.3 Large File Handling
- [ ] Upload 50MB file
- [ ] Verify upload completes successfully
- [ ] Verify no timeout errors
- [ ] Verify progress updates smoothly

### 7.4 Multiple Concurrent Operations
- [ ] Upload multiple files simultaneously
- [ ] Verify all uploads complete successfully
- [ ] Verify no performance degradation

---

## 8. UI/UX

### 8.1 Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] Verify layout adapts correctly
- [ ] Verify all features are accessible

### 8.2 Accessibility
- [ ] Navigate using keyboard only
- [ ] Verify all interactive elements are focusable
- [ ] Verify screen reader compatibility
- [ ] Verify color contrast meets WCAG standards

### 8.3 Loading States
- [ ] Verify loading indicators appear during operations
- [ ] Verify loading states are clear and informative
- [ ] Verify no blank screens during loading

### 8.4 Error Messages
- [ ] Verify error messages are clear and actionable
- [ ] Verify error messages are user-friendly
- [ ] Verify error messages provide next steps

---

## 9. Database Verification

### 9.1 File Records
- [ ] Upload a file
- [ ] Verify file record appears in Supabase Studio (files table)
- [ ] Verify all fields are populated correctly
- [ ] Delete file
- [ ] Verify file record is removed from database

### 9.2 Analysis Records
- [ ] Complete an analysis
- [ ] Verify analysis record appears in Supabase Studio (analysis table)
- [ ] Verify analysis result is stored correctly
- [ ] Verify insights are stored correctly

### 9.3 Knowledge Base Records
- [ ] Upload and analyze files
- [ ] Verify knowledge_base records are created in Supabase Studio
- [ ] Verify embeddings are stored correctly
- [ ] Verify chunks are created correctly

### 9.4 Integration Records
- [ ] Connect a platform
- [ ] Verify integration record appears in Supabase Studio (integrations table)
- [ ] Verify credentials are stored securely
- [ ] Verify status is updated correctly

---

## 10. Security

### 10.1 Authentication
- [ ] Verify unauthenticated users cannot access protected routes
- [ ] Verify session tokens are secure
- [ ] Verify logout invalidates session

### 10.2 File Access
- [ ] Upload a file as User A
- [ ] Login as User B
- [ ] Verify User B cannot access User A's files
- [ ] Verify RLS policies are working

### 10.3 Input Validation
- [ ] Attempt SQL injection in file name
- [ ] Verify input is sanitized
- [ ] Attempt XSS in file name
- [ ] Verify input is sanitized

### 10.4 Rate Limiting
- [ ] Make rapid API requests
- [ ] Verify rate limiting is enforced
- [ ] Verify rate limit error message appears

---

## Test Results Summary

After completing all tests, document:

- **Total Tests**: ___
- **Passed**: ___
- **Failed**: ___
- **Blocked**: ___
- **Critical Issues**: ___
- **Non-Critical Issues**: ___

## Sign-off

- **Tester Name**: ________________
- **Date**: ________________
- **Status**: ☐ Ready for Production ☐ Needs Fixes
- **Notes**: ________________

