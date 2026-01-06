# WhatsApp Bot Dashboard - Design Guidelines

## Design Approach
**Selected Approach:** Design System + Reference-Based Hybrid
- **Primary Inspiration:** Linear's dashboard clarity + Vercel's modern aesthetic + WhatsApp's friendly professionalism
- **System Foundation:** Modern SaaS dashboard principles with utility-first focus
- **Key Principles:** Information clarity, efficient workflows, professional sophistication

## Typography System
- **Primary Font:** Inter or SF Pro Display (via Google Fonts CDN)
- **Hierarchy:**
  - Page Titles: 2xl-3xl, semibold (600)
  - Section Headers: xl, medium (500)
  - Body Text: base, regular (400)
  - Labels/Meta: sm, medium (500)
  - Dashboard Stats: 3xl-4xl, bold (700)
- **Line Height:** Relaxed (1.6) for readability

## Layout System
**Spacing Units:** Tailwind units of 2, 4, 6, 8, 12, 16, 24
- Container: max-w-7xl with px-6 lg:px-8
- Section padding: py-8 to py-16
- Component spacing: gap-4 to gap-8
- Card padding: p-6

## Core Components

### 1. Login Page
**Layout:** Full-viewport split-screen design
- **Left Panel (50%):** Hero image showing WhatsApp bot interface mockup - modern chat interface visualization with blur overlay for depth
- **Right Panel (50%):** Centered login form (max-w-md)
  - Company logo at top
  - Welcome headline + subtext
  - Email/password inputs with generous spacing (mb-4)
  - Primary CTA button (full-width, py-3)
  - "Forgot password?" link below
  - Footer text: "Don't have an account? Sign up"

**Mobile:** Stack vertically, hero image 40vh at top, form below

### 2. Dashboard Layout
**Structure:** Fixed sidebar + scrollable main content

**Sidebar (w-64, fixed left):**
- Logo/brand at top (p-6)
- Navigation menu items (py-3, px-4) with icons from Heroicons
  - Overview/Dashboard
  - Conversations
  - Bot Settings
  - Analytics
  - Templates
  - Integrations
  - Settings
- User profile section at bottom with avatar + name + dropdown indicator

**Main Content Area:**
- **Header Bar:** Sticky top, h-16
  - Page title (left)
  - Search bar (center, max-w-md)
  - Notifications icon + profile avatar (right)
- **Content:** pl-64 (to offset sidebar), p-8

### 3. Dashboard Overview Page
**Stats Cards Grid:** (grid-cols-1 md:grid-cols-2 lg:grid-cols-4, gap-6)
- Total Conversations
- Active Bots
- Response Rate
- Messages Today
Each card: rounded-xl, p-6, with large number display + percentage change indicator

**Recent Activity Section:** (mt-12)
- Table component with hover states
- Columns: Conversation, Status, Time, Actions
- Row height: py-4

**Quick Actions Cards:** (grid-cols-1 md:grid-cols-2, gap-6, mt-8)
- "Create New Bot" card with illustration placeholder
- "View Analytics" card with mini chart placeholder

### 4. Conversations View
**Two-Column Layout:**
- **Left:** Conversation list (w-96, border-right)
  - Search input at top
  - List items with avatar + name + last message preview + timestamp
  - Unread indicator badge
- **Right:** Message thread (flex-1)
  - Contact header with avatar + name + status
  - Messages area (flex-1, scrollable)
  - Message input with attachment button + send button (sticky bottom)

## Component Library

### Buttons
- Primary: py-3 px-6, rounded-lg, semibold
- Secondary: same padding, outline style
- Icon buttons: square (h-10 w-10), rounded-lg
- Buttons on images: backdrop-blur-md with semi-transparent background

### Form Inputs
- Height: h-12
- Border radius: rounded-lg
- Padding: px-4
- Focus: ring offset for clarity
- Labels: mb-2, text-sm, medium weight

### Cards
- Border radius: rounded-xl
- Shadow: subtle elevation (shadow-sm default, shadow-md on hover)
- Padding: p-6
- Border: 1px subtle border

### Tables
- Header row: sticky top, medium weight
- Cell padding: py-4 px-6
- Row separators: 1px border-bottom
- Hover: subtle background change

### Navigation
- Active state: medium weight + left accent border (w-1)
- Hover: subtle background overlay
- Icon size: h-5 w-5, mr-3

## Icons
**Library:** Heroicons (outline style for navigation, solid for actions)
- Common icons: ChartBarIcon, ChatBubbleLeftRightIcon, CogIcon, BellIcon, UserCircleIcon

## Images

### Login Page Hero Image
**Description:** Modern WhatsApp chat interface mockup showcasing bot conversation with automated responses, typing indicators, and rich media messages. Clean, professional aesthetic with device frame.
**Placement:** Left 50% of login screen, full height
**Treatment:** Subtle blur overlay (backdrop-blur-sm) where button/content overlays appear

### Dashboard Empty States
**Description:** Friendly illustrations for empty conversation lists, no analytics data yet
**Placement:** Center of respective empty sections
**Style:** Simple, modern line illustrations

### Profile Avatars
**Description:** Circular avatars throughout (user profile, conversation lists)
**Treatment:** rounded-full, consistent sizing (h-10 w-10 for lists, h-8 w-8 for compact views)

## Animations
**Minimal Motion:**
- Sidebar navigation: smooth background transitions (duration-200)
- Card hover: elevation increase (duration-150)
- Modal/dropdown: fade + scale entrance
- Page transitions: none (instant for productivity)

## Responsive Breakpoints
- **Mobile (<768px):** Sidebar collapses to overlay drawer, stack cards vertically
- **Tablet (768-1024px):** 2-column grids, condensed sidebar
- **Desktop (>1024px):** Full layout as described

**Critical:** No floating elements, proper vertical rhythm with py-8 to py-16 section spacing, multi-column grids only for stats cards and quick actions.