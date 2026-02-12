# Admin Panel - Implementation Checklist

## Phase 2: Frontend UI ✅ COMPLETE

### Core Layout ✅
- [x] Protected admin layout (`app/admin/layout.tsx`)
- [x] Admin sidebar navigation (`components/admin/layout/admin-sidebar.tsx`)
- [x] Admin header with user info (`components/admin/layout/admin-header.tsx`)
- [x] Admin login page (`app/admin/login/page.tsx`)

### Shared Components ✅
- [x] Reusable data table (`components/admin/shared/data-table.tsx`)
  - [x] Sortable columns
  - [x] Custom cell rendering
  - [x] Empty state
  - [x] Row click handling
- [x] Filter bar component (`components/admin/shared/filter-bar.tsx`)
  - [x] Search input
  - [x] Multiple dropdown filters
  - [x] Responsive layout
- [x] Confirmation dialog (`components/admin/shared/confirm-dialog.tsx`)
  - [x] Default and destructive variants
  - [x] Loading states
  - [x] Async action support

### Admin Pages ✅
- [x] Dashboard (`app/admin/dashboard/page.tsx`)
  - [x] Stats cards (users, claims, offers, players)
  - [x] Quick actions
  - [x] Recent activity feed placeholder
- [x] Users management (`app/admin/users/page.tsx`)
  - [x] User list with search/filters
  - [x] Create user page (`app/admin/users/create/page.tsx`)
  - [x] User form component (`components/admin/users/user-form.tsx`)
  - [x] Edit/delete actions
- [x] Players management (`app/admin/players/page.tsx`)
  - [x] Player search with filters
  - [x] Player detail page (`app/admin/players/[id]/page.tsx`)
  - [x] Player form component (`components/admin/players/player-form.tsx`)
  - [x] Tabbed interface (Info, Stats, Offers)
  - [x] Sanity link status
- [x] Player claims (`app/admin/players/claims/page.tsx`)
  - [x] Card-based layout
  - [x] Approve/reject actions
  - [x] Verification details display
- [x] Rosters management (`app/admin/rosters/page.tsx`)
  - [x] List with sport/season filters
  - [x] CRUD action buttons
- [x] Games management (`app/admin/games/page.tsx`)
  - [x] Game list with filters
  - [x] CRUD action buttons
- [x] Schools directory (`app/admin/schools/page.tsx`)
  - [x] School list with search
  - [x] CRUD action buttons
- [x] College offers (`app/admin/offers/page.tsx`)
  - [x] Card-based layout
  - [x] Verify/reject actions
- [x] Stats management (`app/admin/stats/page.tsx`)
  - [x] CSV/JSON import UI
  - [x] Export buttons
  - [x] Format guide
- [x] Audit log (`app/admin/audit/page.tsx`)
  - [x] Log table with filters
  - [x] Action/target filtering

### Design System Compliance ✅
- [x] Dark theme with golden accents
- [x] Mobile-first responsive (NO sm: breakpoint)
- [x] Space Grotesk for headlines
- [x] Inter for body text
- [x] JetBrains Mono for data
- [x] Consistent spacing (4px grid)
- [x] Shadow utilities applied
- [x] Color variables used
- [x] Border radius consistent

### Documentation ✅
- [x] Updated CLAUDE.md with admin panel section
- [x] Created Phase 2 summary document
- [x] Created quick reference guide
- [x] Created implementation checklist

## Phase 3: Backend API Routes ⏳ TODO

### Dashboard API
- [ ] `GET /api/admin/stats` - Dashboard statistics
  - [ ] Total users by role
  - [ ] Pending claims count
  - [ ] Unverified offers count
  - [ ] Total players/games/schools
  - [ ] Recent activity

### User Management API
- [ ] `GET /api/admin/users` - List users
  - [ ] Query params: search, role, verified, limit, offset
  - [ ] Return: users array + total count
- [ ] `POST /api/admin/users` - Create user
  - [ ] Validate email, password, role
  - [ ] Auto-verify admins
  - [ ] Log to audit trail
- [ ] `GET /api/admin/users/[id]` - Get user details
- [ ] `PATCH /api/admin/users/[id]` - Update user
  - [ ] Validate changes
  - [ ] Log to audit trail
- [ ] `DELETE /api/admin/users/[id]` - Soft delete user
  - [ ] Set deletedAt timestamp
  - [ ] Log to audit trail

### Player Management API
- [ ] `GET /api/admin/players` - List players
  - [ ] Query params: search, sport, school, sanityLinked, limit, offset
  - [ ] Return: players array + total count
- [ ] `GET /api/admin/players/[id]` - Get player details
  - [ ] Include stats and offers
- [ ] `PATCH /api/admin/players/[id]` - Update player
  - [ ] Validate editable fields
  - [ ] Protect MaxPreps fields
  - [ ] Log to audit trail
- [ ] `POST /api/admin/players/[id]/link-sanity` - Link to Sanity
  - [ ] Update sanityProfileId
  - [ ] Log to audit trail
- [ ] `DELETE /api/admin/players/[id]` - Delete player
  - [ ] Cascade delete stats/offers
  - [ ] Log to audit trail

### Player Claims API
- [ ] `GET /api/admin/claims` - List pending claims
  - [ ] Filter by status
  - [ ] Include player details
- [ ] `POST /api/admin/claims/[id]/approve` - Approve claim
  - [ ] Create user account
  - [ ] Link to player
  - [ ] Send credentials email
  - [ ] Update claim status
  - [ ] Log to audit trail
- [ ] `POST /api/admin/claims/[id]/reject` - Reject claim
  - [ ] Update status to REJECTED
  - [ ] Save rejection reason
  - [ ] Log to audit trail

### College Offers API
- [ ] `GET /api/admin/offers` - List unverified offers
  - [ ] Filter by sport, verified
  - [ ] Include player details
- [ ] `POST /api/admin/offers/[id]/verify` - Verify offer
  - [ ] Set verified = true
  - [ ] Set verifiedBy + verifiedAt
  - [ ] Log to audit trail
- [ ] `DELETE /api/admin/offers/[id]` - Delete offer
  - [ ] Permanent delete
  - [ ] Log to audit trail

### Roster Management API
- [ ] `GET /api/admin/rosters` - List roster entries
  - [ ] Query params: school, sport, season, limit, offset
  - [ ] Include player and school details
- [ ] `POST /api/admin/rosters` - Create roster entry
  - [ ] Validate unique constraint
  - [ ] Log to audit trail
- [ ] `PATCH /api/admin/rosters/[id]` - Update roster entry
  - [ ] Log to audit trail
- [ ] `DELETE /api/admin/rosters/[id]` - Delete roster entry
  - [ ] Log to audit trail

### Game Management API
- [ ] `GET /api/admin/games` - List games
  - [ ] Query params: sport, date range, school, status, limit, offset
  - [ ] Include school details
- [ ] `POST /api/admin/games` - Create game
  - [ ] Validate school IDs
  - [ ] Log to audit trail
- [ ] `PATCH /api/admin/games/[id]` - Update game
  - [ ] Log to audit trail
- [ ] `DELETE /api/admin/games/[id]` - Soft delete game
  - [ ] Set deletedAt
  - [ ] Log to audit trail

### School Management API
- [ ] `GET /api/admin/schools` - List schools
  - [ ] Query params: search, classification, conference, limit, offset
- [ ] `POST /api/admin/schools` - Create school
  - [ ] Validate unique key
  - [ ] Log to audit trail
- [ ] `PATCH /api/admin/schools/[id]` - Update school
  - [ ] Log to audit trail
- [ ] `DELETE /api/admin/schools/[id]` - Delete school
  - [ ] Check for dependencies
  - [ ] Log to audit trail

### Stats Management API
- [ ] `POST /api/admin/stats/import` - Bulk import
  - [ ] Accept CSV/JSON
  - [ ] Validate format
  - [ ] Parse and insert
  - [ ] Return success/error report
  - [ ] Log to audit trail
- [ ] `GET /api/admin/stats/export` - Export data
  - [ ] Query params: sport, season, format (csv/json)
  - [ ] Generate file
  - [ ] Return download

### Audit Log API
- [ ] `GET /api/admin/audit` - List audit logs
  - [ ] Query params: admin, action, targetType, date range, limit, offset
  - [ ] Include admin user details
- [ ] Auto-logging utility
  - [ ] Create log function
  - [ ] Call from all admin actions
  - [ ] Include changes JSON

### Authentication
- [ ] All routes check admin role
- [ ] Extract user from JWT
- [ ] Return 401 if not authenticated
- [ ] Return 403 if not admin

### Error Handling
- [ ] Consistent error response format
- [ ] Validation error messages
- [ ] Database error handling
- [ ] Log errors appropriately

### Testing
- [ ] Unit tests for API routes
- [ ] Integration tests for workflows
- [ ] Test admin authorization
- [ ] Test validation logic
- [ ] Test audit logging

## Phase 4: Polish & Testing ⏳ TODO

### Performance Optimization
- [ ] Implement pagination on large lists
- [ ] Add loading skeletons
- [ ] Optimize database queries
- [ ] Cache frequently accessed data
- [ ] Add request throttling

### User Experience
- [ ] Add success toast notifications
- [ ] Add error toast notifications
- [ ] Implement optimistic UI updates
- [ ] Add keyboard shortcuts
- [ ] Add bulk actions

### Additional Features
- [ ] Export audit log to CSV
- [ ] Batch user operations
- [ ] Advanced player search (fuzzy)
- [ ] Dashboard charts/graphs
- [ ] Email notifications for claims

### Security Hardening
- [ ] Rate limiting on API routes
- [ ] Input sanitization
- [ ] SQL injection prevention (Prisma handles)
- [ ] XSS prevention (React handles)
- [ ] CSRF tokens if needed
- [ ] Audit log tampering prevention

### Testing
- [ ] Manual testing all workflows
- [ ] Browser compatibility testing
- [ ] Mobile responsive testing
- [ ] Accessibility audit
- [ ] Performance testing
- [ ] Security audit

### Documentation
- [ ] API documentation
- [ ] User guide for admins
- [ ] Video tutorials
- [ ] Troubleshooting guide
- [ ] Deployment guide

## Current Status

**✅ COMPLETE: Phase 2 - Frontend UI Structure**
- All admin pages created
- All shared components built
- Design system compliant
- Fully responsive
- Ready for API integration

**⏳ IN PROGRESS: Phase 3 - Backend API Routes**
- Database schema complete (Prisma models defined)
- Authentication system exists (JWT + roles)
- API routes need to be implemented
- Audit logging system needs implementation

**📋 PLANNED: Phase 4 - Polish & Testing**
- Performance optimizations
- Enhanced UX features
- Security hardening
- Comprehensive testing

## File Count Summary

### Admin Pages: 14 files
- layout.tsx (1)
- login/page.tsx (1)
- dashboard/page.tsx (1)
- users/page.tsx + create/page.tsx (2)
- players/page.tsx + [id]/page.tsx + claims/page.tsx (3)
- rosters/page.tsx (1)
- games/page.tsx (1)
- stats/page.tsx (1)
- schools/page.tsx (1)
- offers/page.tsx (1)
- audit/page.tsx (1)

### Admin Components: 7 files
- Layout: admin-sidebar.tsx, admin-header.tsx (2)
- Shared: data-table.tsx, filter-bar.tsx, confirm-dialog.tsx (3)
- Forms: user-form.tsx, player-form.tsx (2)

### Documentation: 4 files
- CLAUDE.md (updated)
- admin-panel-phase2-summary.md
- admin-panel-quick-reference.md
- admin-panel-implementation-checklist.md

**Total: 25+ files created/updated for Phase 2**

## Next Actions

1. **Immediate**: Start Phase 3 backend API implementation
2. **Priority order**:
   - Dashboard stats API (quick wins)
   - User management API (foundational)
   - Player claims API (high impact)
   - Other APIs as needed
3. **Testing**: Test each API as you build it
4. **Integration**: Connect frontend to backend progressively

## Notes

- All placeholder data follows TypeScript interfaces
- Mock data structures match expected API responses
- Error handling patterns are established
- Loading state patterns are demonstrated
- Ready for drop-in API integration
