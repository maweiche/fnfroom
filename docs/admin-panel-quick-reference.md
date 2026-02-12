# Admin Panel - Quick Reference Guide

## Access

**URL**: `/admin/*`
**Login**: `/admin/login`
**Role Required**: `ADMIN`

## Navigation Structure

```
Dashboard (/admin/dashboard)
├── Users (/admin/users)
│   └── Create User (/admin/users/create)
├── Player Claims (/admin/players/claims)
├── Players (/admin/players)
│   └── Player Detail (/admin/players/[id])
├── Rosters (/admin/rosters)
├── Games (/admin/games)
├── Stats (/admin/stats)
├── Schools (/admin/schools)
├── College Offers (/admin/offers)
└── Audit Log (/admin/audit)
```

## Component Locations

### Layout
- `app/admin/layout.tsx` - Protected layout wrapper
- `components/admin/layout/admin-sidebar.tsx` - Navigation sidebar
- `components/admin/layout/admin-header.tsx` - Top header with user info

### Shared Components
- `components/admin/shared/data-table.tsx` - Reusable table
- `components/admin/shared/filter-bar.tsx` - Search + filters
- `components/admin/shared/confirm-dialog.tsx` - Confirmation modal

### Forms
- `components/admin/users/user-form.tsx` - Create/edit user
- `components/admin/players/player-form.tsx` - Edit player profile

## Common Patterns

### Protected Route Check
```typescript
const user = await getUserFromToken(token);
if (!user || user.role !== "ADMIN") {
  redirect("/");
}
```

### Data Table Usage
```typescript
import { DataTable, type Column } from "@/components/admin/shared/data-table";

const columns: Column<YourType>[] = [
  {
    key: "name",
    label: "Name",
    sortable: true,
    render: (value) => <span>{value}</span>,
  },
];

<DataTable data={items} columns={columns} />
```

### Filter Bar Usage
```typescript
import { FilterBar } from "@/components/admin/shared/filter-bar";

<FilterBar
  searchValue={query}
  onSearchChange={setQuery}
  searchPlaceholder="Search..."
  filters={[
    {
      label: "Status",
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: "all", label: "All" },
        { value: "active", label: "Active" },
      ],
    },
  ]}
/>
```

### Confirm Dialog Usage
```typescript
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";

<ConfirmDialog
  open={showDialog}
  onOpenChange={setShowDialog}
  title="Delete User"
  description="This action cannot be undone."
  confirmLabel="Delete"
  variant="destructive"
  onConfirm={async () => {
    await deleteUser(userId);
  }}
/>
```

## Design System Rules

### Colors
```typescript
// Admin-specific colors
--sidebar-bg: #1a1d29 (dark navy)
--accent: #E6BC6A (golden spotlight)
--background: #1D1A10 (dark warm charcoal)
--card: #242118 (dark warm charcoal)
```

### Typography
```typescript
// Headlines
className="font-display font-bold text-3xl"

// Body text
className="font-sans text-sm"

// Data/numbers
className="font-mono tabular-nums"
```

### Spacing (CRITICAL)
```typescript
// NEVER use sm: breakpoint
// ❌ BAD
className="p-8 sm:p-4"

// ✅ GOOD
className="p-4 md:p-6 lg:p-8"
```

### Cards
```typescript
className="bg-card rounded-lg border border-border p-6 shadow-card hover:shadow-card-hover"
```

### Form Inputs
```typescript
className="w-full h-10 px-4 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
```

### Status Badges
```typescript
// Success
className="bg-success/20 text-success"

// Warning
className="bg-warning/20 text-warning"

// Error
className="bg-destructive/20 text-destructive"

// Primary
className="bg-primary/20 text-primary"
```

## API Integration Pattern

Replace placeholder data with actual API calls:

```typescript
// Current (placeholder)
const mockUsers: User[] = [];

// Future implementation
async function getUsers(filters?: UserFilters) {
  const response = await fetch('/api/admin/users', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
}
```

## State Management Pattern

```typescript
"use client";

import { useState } from "react";

export default function AdminPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredData = data.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || item.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    // UI
  );
}
```

## Authentication Flow

1. User visits `/admin/login`
2. Submits email/password
3. API validates and returns JWT token
4. Token stored in cookie: `auth_token`
5. Layout checks token + role on each page load
6. Redirects if invalid or not admin

## Common Tasks

### Add a new admin page
1. Create file: `app/admin/yourpage/page.tsx`
2. Add route to sidebar: `components/admin/layout/admin-sidebar.tsx`
3. Create API route: `app/api/admin/yourpage/route.ts`
4. Follow existing page patterns

### Add a new filter
```typescript
filters={[
  ...existingFilters,
  {
    label: "Your Filter",
    value: yourFilter,
    onChange: setYourFilter,
    options: [
      { value: "all", label: "All" },
      { value: "option1", label: "Option 1" },
    ],
  },
]}
```

### Add a new table column
```typescript
{
  key: "yourField",
  label: "Your Field",
  sortable: true,
  render: (value, row) => {
    // Custom rendering
    return <span>{value}</span>;
  },
}
```

## Debugging

### Check auth
```typescript
console.log('User:', user);
console.log('Role:', user?.role);
console.log('Is Admin:', user?.role === 'ADMIN');
```

### Check filters
```typescript
console.log('Search:', searchQuery);
console.log('Filters:', { sportFilter, statusFilter });
console.log('Filtered Results:', filteredData.length);
```

### Check API calls
```typescript
console.log('Calling API:', '/api/admin/users');
console.log('Response:', data);
console.log('Error:', error);
```

## Testing

### Manual testing checklist
- [ ] Login as admin
- [ ] Navigate to each page
- [ ] Test search functionality
- [ ] Test filters
- [ ] Test sorting
- [ ] Test forms (create/edit)
- [ ] Test confirmations
- [ ] Test responsive layout
- [ ] Test sign out

### Browser testing
- Chrome/Edge (primary)
- Firefox
- Safari
- Mobile browsers

## Performance Tips

1. Use server components by default
2. Add "use client" only when needed
3. Implement pagination for large lists
4. Use skeleton loaders during data fetch
5. Optimize images (use Next.js Image component)
6. Lazy load modals and dialogs

## Security Checklist

- [x] Protected routes (layout checks auth)
- [x] Role-based access control
- [x] JWT token validation
- [ ] API route protection (implement in Phase 3)
- [ ] Input validation (implement in Phase 3)
- [ ] SQL injection prevention (Prisma handles)
- [ ] XSS prevention (React handles)
- [ ] CSRF tokens (implement if needed)

## Troubleshooting

### "Unauthorized" error
- Check if logged in as admin
- Verify token in cookies
- Check token expiration (7 days)

### Styles not applying
- Check design system variables in `app/globals.css`
- Verify Tailwind classes are correct
- Check for conflicting styles

### Components not rendering
- Check "use client" directive if interactive
- Verify imports are correct
- Check for TypeScript errors

### Responsive issues
- Never use `sm:` breakpoint
- Only use `md:` and `lg:`
- Test on actual devices

## Resources

- Design System: `.design-system/system.md`
- Database Schema: `prisma/schema.prisma`
- Auth Utilities: `lib/auth.ts`
- Project Docs: `CLAUDE.md`

## Support

For questions or issues:
1. Check existing components for patterns
2. Review design system documentation
3. Check CLAUDE.md for architecture details
4. Test with mock data first
5. Implement API integration last
