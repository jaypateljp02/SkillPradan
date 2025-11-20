# Skill प्रदान - Peer-to-Peer Learning Platform

## Overview

Skill प्रदान is a peer-to-peer learning platform that enables users to exchange skills with each other. The platform facilitates skill matching, session scheduling, group collaboration, and gamification through points and badges. Users can teach skills they know in exchange for learning skills they want to acquire.

**Core Purpose**: Connect learners and teachers in a skill-barter system where users exchange knowledge through scheduled video sessions, collaborative whiteboards, and group study environments.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Library**: Radix UI components with shadcn/ui design system
- Custom theming system using HSL color variables
- Tailwind CSS for styling with custom color palette (indigo primary theme)
- Responsive design with mobile breakpoints at 768px

**State Management**:
- TanStack React Query (v5) for server state management and caching
- React Context API for authentication state
- Local state management with React hooks

**Routing**: Wouter for client-side routing
- Protected routes for authenticated pages
- Admin-specific routes with role-based access control

**Key Design Decisions**:
- Component-based architecture with reusable UI components in `/client/src/components`
- Path aliases configured (`@/` for client src, `@shared/` for shared types)
- Form validation using react-hook-form with zod schemas
- Toast notifications for user feedback

### Backend Architecture

**Framework**: Express.js with TypeScript (ESM modules)

**API Design**: RESTful API with JSON responses
- Token-based authentication using Bearer tokens stored in localStorage
- Session management using express-session with in-memory store (MemoryStore)
- CORS enabled for cross-origin requests

**Authentication Strategy**:
- Primary: Token-based authentication (custom implementation)
- Token storage: localStorage on client, Map-based storage on server
- Password hashing: SHA-256 with salt
- Admin access control through isAdmin flag on user records

**WebSocket Integration**:
- WebSocket server for real-time features (video sessions, whiteboard collaboration, chat)
- Connection at `/ws` endpoint
- Session-based room management for collaborative features

**Key Design Decisions**:
- Modular route organization with separate router files
- Middleware-based authentication and authorization
- In-memory storage layer abstraction for future database migration
- Centralized error handling and request logging

### Data Storage

**Database**: PostgreSQL (via Neon serverless)
- ORM: Drizzle ORM for type-safe database queries
- Schema location: `/shared/schema.ts` (shared between client and server)
- Migrations: Stored in `/migrations` directory

**Database Schema Structure**:

**Core Entities**:
- `users`: User accounts with points, levels, and admin flags
- `skills`: Skills that users can teach or learn (linked to users)
- `exchanges`: Skill exchange agreements between two users
- `sessions`: Individual learning sessions within exchanges
- `reviews`: User ratings and feedback after exchanges

**Gamification**:
- `badges`: Achievement definitions
- `user_badges`: Badges earned by users
- `challenges`: Time-bound challenges for users
- `user_challenges`: User progress on challenges
- `activities`: Activity feed/history for users

**Social Features**:
- `groups`: Study groups and team projects
- `group_members`: Membership in groups with roles
- `group_messages`: Chat messages within groups
- `group_events`: Scheduled group events
- `group_files`: File sharing within groups
- `posts`: Social feed posts
- `direct_messages`: One-to-one messaging between users

**Session Management**:
- Express sessions stored in PostgreSQL via connect-pg-simple
- Session data includes authentication state

**Storage Pattern**: Repository pattern with in-memory implementation
- Interface defined in `server/storage.ts`
- Allows for future migration to different storage backends
- CRUD operations abstracted through storage interface

### External Dependencies

**Third-Party Services**:

**Neon Database**:
- Serverless PostgreSQL database
- Connection via `@neondatabase/serverless` driver
- Configuration through `DATABASE_URL` environment variable

**Firebase** (Partially Configured):
- Firebase Authentication SDK initialized but not actively used
- Token verification logic present but token-based auth is primary
- Configuration in `client/src/lib/firebase-config.ts`
- Note: Firebase is initialized but the platform primarily uses custom token authentication

**Avatar Generation**:
- DiceBear API for generating user avatars
- Avatars created with seed based on username

**Development Tools**:
- Vite for development server and hot module replacement
- ESBuild for production builds
- Replit integration for deployment

**Key Libraries**:
- `ws`: WebSocket implementation for real-time features
- `date-fns`: Date manipulation and formatting
- `zod`: Schema validation for forms and API requests
- `react-hook-form`: Form state management
- `@tanstack/react-query`: Server state and caching

**Environment Variables Required**:
- `DATABASE_URL`: PostgreSQL connection string (Neon)
- `SESSION_SECRET`: Express session secret key
- `NODE_ENV`: Environment identifier (production/development)
- Firebase configuration (optional, for Firebase auth features):
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`

**Notable Implementation Details**:
- Video calling feature is currently a placeholder (being upgraded for browser compatibility)
- Collaborative whiteboard feature is currently a placeholder
- WebSocket connections support real-time chat, video signaling, and whiteboard synchronization
- Admin dashboard provides user and skill management capabilities
- Points system rewards users for completing exchanges, verifications, and challenges