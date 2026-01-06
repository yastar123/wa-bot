# WhatsApp Bot Dashboard

## Overview

A WhatsApp Bot Dashboard web application that enables users to connect their WhatsApp account via QR code scanning, view and manage chats in real-time, and configure auto-reply functionality. The application mimics the WhatsApp Web experience with a modern SaaS dashboard design.

Key features:
- QR code-based WhatsApp authentication (using Baileys library)
- Real-time chat synchronization via WebSockets
- Manual message replies and auto-reply configuration
- Chat history storage and display
- WhatsApp Web-like UI experience

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Real-time Updates**: Socket.IO client for WebSocket communication
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite with React plugin

The frontend follows a page-based structure with reusable components. The main pages are Login (QR code display) and Dashboard (chat interface). Custom hooks abstract data fetching and WebSocket state management.

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **WhatsApp Integration**: @whiskeysockets/baileys for WhatsApp Web API
- **Real-time Communication**: Socket.IO server
- **API Pattern**: RESTful endpoints defined in shared routes

The server handles WhatsApp session management, message relay, and provides API endpoints for settings and chat operations. WebSocket events push real-time updates (QR codes, connection status, new messages) to connected clients.

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts`
- **Tables**: settings, chats, messages
- **Fallback**: In-memory storage when database is unavailable (for development)

The storage layer uses a repository pattern (`server/storage.ts`) that abstracts database operations with fallback to in-memory storage for resilience.

### Project Structure
```
├── client/           # React frontend
│   └── src/
│       ├── components/   # UI components
│       ├── hooks/        # Custom React hooks
│       ├── pages/        # Page components
│       └── lib/          # Utilities
├── server/           # Express backend
│   ├── baileys.ts    # WhatsApp connection logic
│   ├── routes.ts     # API route handlers
│   └── storage.ts    # Data access layer
├── shared/           # Shared code between client/server
│   ├── schema.ts     # Database schema definitions
│   └── routes.ts     # API route definitions with Zod validation
└── migrations/       # Drizzle database migrations
```

### Key Design Decisions

1. **Monorepo Structure**: Frontend and backend share TypeScript types and route definitions, ensuring type safety across the stack.

2. **Baileys over Cloud API**: Uses Baileys library for direct WhatsApp Web protocol instead of Meta's Cloud API, enabling QR code authentication without business verification.

3. **Socket.IO for Real-time**: Provides bidirectional communication for instant QR code updates, connection status, and incoming messages.

4. **Shared Route Definitions**: API contracts defined with Zod schemas in `shared/routes.ts` ensure consistent validation between client and server.

## External Dependencies

### WhatsApp Integration
- **@whiskeysockets/baileys**: Unofficial WhatsApp Web API library for session management, QR generation, and message handling

### Database
- **PostgreSQL**: Primary database (requires DATABASE_URL environment variable)
- **Drizzle ORM**: Type-safe database queries and migrations
- **connect-pg-simple**: PostgreSQL session store (if sessions are enabled)

### Real-time Communication
- **Socket.IO**: WebSocket server and client for real-time updates

### UI Components
- **shadcn/ui**: Pre-built accessible components using Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library for smooth transitions
- **Lucide React**: Icon library

### Development
- **Vite**: Frontend build tool with HMR
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development