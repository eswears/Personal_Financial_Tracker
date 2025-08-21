# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This repository contains multiple collaborative coding projects, primarily focused on real-time multiplayer code editors. The main projects are:

1. **multiplay_coding2** - Active React-based multiplayer code editor with Supabase integration
2. **archive/multiplayer_coding0/MultiPlayer_Coding** - TypeScript-based multiplayer editor with Vite and advanced features
3. **financial_plan** - Personal finance tracker project specification

## Development Commands

### For multiplay_coding2 (Main Project)
```bash
# Install dependencies
npm install

# Development (runs both server and client)
npm run dev

# Run server only
npm run server

# Run client only  
npm run client

# Build client
npm run build

# Start production server
npm start
```

### For archive/multiplayer_coding0/MultiPlayer_Coding (TypeScript Version)
```bash
# Install all dependencies
npm run install-all

# Development (concurrent server and client)
npm run dev

# Build both client and server
npm run build

# Run tests
npm test

# Linting
npm run lint        # In server directory
npm run lint        # In client directory
```

## Architecture Overview

### Real-time Collaboration Stack
- **Frontend**: React 18/19 with Monaco Editor (VS Code editor component)
- **Backend**: Node.js + Express + Socket.io for WebSocket communication
- **Database**: Supabase (PostgreSQL with real-time subscriptions)
- **Authentication**: Supabase Auth with guest mode support
- **Conflict Resolution**: Operational Transform algorithm for concurrent editing

### Key Services and Patterns

#### Client-Side Architecture
- **SocketService**: Manages WebSocket connections and real-time events
- **AuthService**: Handles Supabase authentication and guest users
- **SessionService**: Manages user sessions with persistence and reconnection
- **CursorService**: Tracks and displays user cursors and selections

#### Server-Side Architecture  
- **DocumentManager**: Manages document state and operational transforms
- **SocketHandler**: Handles Socket.io connections and event routing
- **DatabaseService**: Supabase integration for persistence
- **Rate Limiting**: Built-in rate limiting with rate-limiter-flexible

### Project Structure
```
multiplay_coding2/
├── client/           # React frontend (Create React App)
├── server/           # Express backend
└── database/         # SQL setup scripts

archive/multiplayer_coding0/MultiPlayer_Coding/
├── client/           # React + TypeScript + Vite frontend
├── server/           # TypeScript Express backend  
├── shared/           # Shared types and utilities
└── implementation_strategy/  # Detailed planning docs
```

## Important Implementation Details

### Real-time Synchronization
- Uses Socket.io for bidirectional communication
- Implements Operational Transform for conflict-free concurrent editing
- Automatic reconnection with exponential backoff
- Session persistence across disconnections

### Authentication Flow
1. Check for existing session restoration
2. Fall back to guest user if available
3. Show auth modal for new users
4. Support both Supabase auth and guest mode

### Environment Variables
Required for production:
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Public anonymous key
- `SUPABASE_SERVICE_KEY` - Service role key (server only)
- `CORS_ORIGIN` - Frontend URL for CORS
- `PORT` - Server port (default: 3001)

## Testing Approach

The TypeScript version (archive/multiplayer_coding0) has comprehensive test setup:
- Unit tests with Jest
- Integration tests for API endpoints
- E2E tests planned
- Run with `npm test` in respective directories

## Key Files to Review

When making changes, pay attention to:
- `client/src/App.tsx` or `App.js` - Main application component
- `server/src/index.ts` or `server/index.js` - Express server setup
- `client/src/components/CollaborativeEditor` - Core editor component
- `shared/operational-transform.ts` - OT algorithm implementation
- Socket event handlers in both client and server

## Common Development Tasks

### Adding a New Socket Event
1. Define the event type in shared types
2. Add handler in server's SocketHandler
3. Add client-side listener in SocketService
4. Update relevant UI components

### Modifying Editor Behavior
1. Check CollaborativeEditor component
2. Review Monaco Editor configuration
3. Update cursor/selection tracking if needed
4. Test with multiple concurrent users

### Database Schema Changes
1. Update `database/setup.sql`
2. Modify DatabaseService accordingly
3. Update relevant TypeScript interfaces
4. Test data persistence and retrieval