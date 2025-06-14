# replit.md

## Overview

ThunderBet is a comprehensive Brazilian online betting platform built as a full-stack TypeScript application using React and Express. The application features a mobile-first design with casino games, real-time transaction processing via PIX, and complete user management. The system supports multiple users with individual profiles, game sessions, bonuses, and financial tracking. Real data is stored in Supabase PostgreSQL database with full CRUD operations for users, games, transactions, and system analytics.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom ThunderBet color scheme
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **State Management**: React Context API for global state (user, language)
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack Query for server state management
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Development**: tsx for TypeScript execution
- **Production**: esbuild for bundling

### Mobile-First Design
- Responsive layout optimized for mobile devices
- Touch-friendly interactions with drag/swipe functionality
- Bottom navigation for easy thumb navigation
- Modal-based interface for key actions

## Key Components

### Frontend Components
- **Layout System**: Centered mobile container with bottom navigation
- **Modals**: Deposit, Withdrawal, Profile, Game Loading, and Insufficient Balance modals
- **Game Interface**: Grid layout with search, categories, and game cards
- **Banner System**: Auto-rotating promotional banners
- **Winner Display**: Real-time winner notifications

### Backend Services
- **Storage Layer**: In-memory storage with interface for future database integration
- **API Routes**: RESTful endpoints for user management and transactions
- **Mock Data**: Game data and winner information for demonstration

### Database Schema (Drizzle ORM)
- **Users**: Authentication, profile information, balance, account mode
- **Games**: Game catalog with provider information and status
- **Transactions**: Deposit/withdrawal tracking with PIX integration

## Data Flow

### User Authentication Flow
1. User data managed through AppContext
2. Profile updates through dedicated API endpoints
3. Balance management for game access control

### Game Access Flow
1. User selects game from lobby
2. Balance validation before game loading
3. Loading modal with progress simulation
4. Error handling for insufficient balance

### Transaction Flow
1. Modal-based deposit/withdrawal interface
2. PIX integration for Brazilian payment system
3. Transaction status tracking and history

## External Dependencies

### Core Dependencies
- **UI Framework**: React ecosystem with hooks and context
- **Database**: Drizzle ORM with PostgreSQL support
- **Styling**: Tailwind CSS with PostCSS
- **HTTP Client**: Fetch API with TanStack Query wrapper
- **Date Management**: date-fns for date formatting
- **Icons**: Lucide React for consistent iconography

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **Vite**: Fast development server with HMR
- **ESBuild**: Production bundling for backend
- **Replit Integration**: Development environment optimization

## Deployment Strategy

### Development Environment
- Vite development server on port 5000
- Express backend serving API routes
- Hot module replacement for rapid development
- Replit-specific configurations for cloud development

### Production Build
1. Frontend: Vite builds to `dist/public`
2. Backend: ESBuild bundles server to `dist/index.js`
3. Static file serving from Express
4. Environment variable configuration for database

### Database Configuration
- PostgreSQL via Neon Database (serverless)
- Connection pooling for production scalability
- Migration support through Drizzle Kit
- Environment-based configuration

## Changelog

```
Changelog:
- June 13, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```