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
- June 14, 2025. Implemented mock authentication system to bypass Supabase email restrictions
  - Users can register with any email (teste@gmail.com works)
  - Data stored in localStorage for immediate functionality
  - Auto-login after registration working
  - Full TypeScript compatibility with balance and user properties
- June 15, 2025. Implemented comprehensive internationalization system
  - Real Supabase authentication replacing mock system
  - Dynamic language switching based on account_mode field
  - Nacional mode = Portuguese, Internacional mode = English
  - Real-time language updates without page reload
  - Complete ProfileModal with Supabase integration
  - Translation system supporting all UI text
  - Updated all modals (Deposit, Withdrawal, Promotion) to use translation system
  - Fixed all Portuguese text in Home page for 100% English in internacional mode
  - Added complete translation dictionaries for all components and error messages
  - Toast notifications and form validation messages now fully internationalized
  - Optimized ProfileModal for mobile responsiveness with centered layout
  - Eliminated scrolling requirement and improved visual hierarchy
  - Completed automatic Supabase transaction storage for PIX payments
  - Every PIX transaction now automatically stored with user linking  
  - Full ZyonPay webhook integration with real PIX codes and status updates
  - Comprehensive transaction history tracking in Supabase database
  - Direct Supabase API integration bypassing intermediate storage layers
  - All PIX transactions stored in transactions table with complete ZyonPay data
  - User linking via metadata with Supabase UUID and email preservation
  - Fixed UUID to integer conversion errors in transaction retrieval system
  - Implemented automatic fallback transaction search by UUID in metadata
  - Confirmed working storage and retrieval of PIX transaction history
- June 16, 2025. Enhanced PIX payment and game loading experience
  - Completely rewritten PIX QR code generation for instant responsiveness
  - Immediate QR code display with temporary code, updates to real code in background
  - Visual indicators showing QR code update status with "Updating..." badges
  - Toast notifications confirming when PIX code is ready for payment
  - Implemented 10-second game loading modal with premium gradient design
  - Added success screen with check icon, pulsing animations, and game-specific messaging
  - Complete internationalization of loading and success states
  - Enhanced user experience with smooth transitions and professional feedback
  - Implemented Instagram-like heart animation for game cards with persistent localStorage state
  - Fixed balance display to show real Supabase database value from users.balance column
  - Enhanced refreshProfile function to reload complete user profile with balance updates
  - Implemented complete withdrawal system with real balance deduction
  - Created withdrawals table in Supabase with comprehensive transaction tracking
  - Fixed Row Level Security (RLS) issues blocking server-side database operations
  - Added withdrawal API with R$ 50 minimum validation and balance verification
  - Withdrawal transactions appear in history with "pending" status for realistic UX
  - Optimized PIX generation system for ultra-fast QR code display
  - Implemented direct ZyonPay API integration bypassing webhook delays
  - Removed temporary/fake QR codes - system now shows only authentic codes
  - Added ultra-fast PIX endpoint `/api/zyonpay/fast-pix` for instant generation
  - Improved deposit modal UX by moving action buttons above instructions section
  - Updated minimum deposit amount back to R$ 35,00 with corresponding quick amount buttons
- June 17, 2025. Critical bug fixes and deposit history resolution
  - Fixed critical currency parsing inconsistency causing incorrect payment amounts
  - Resolved memory leak from polling intervals not being properly cleaned up
  - Fixed hardcoded balance display in header to show real user balance from database
  - Corrected withdrawal amount being sent as formatted string instead of numeric value
  - Moved ZyonPay secret key to environment variables for security compliance
  - Fixed TypeScript compilation errors in server route user object creation
  - RESOLVED deposit history not functioning - fixed transaction storage endpoint
  - Corrected parameter mapping between fast-pix endpoint and store-transaction endpoint
  - Added proper error handling and fallbacks for undefined transaction data
  - Deposit transactions now properly stored in Supabase and appear in user history
  - Enhanced transaction search logic to handle UUID-based user identification
  - All deposit transactions now correctly linked to user accounts via metadata
  - CONFIGURED São Paulo timezone (UTC-3) for all transaction timestamps
  - Fixed timezone display showing correct Brazilian time instead of UTC
  - Corrected transaction storage to save with São Paulo timezone offset
  - FIXED user registration to save phone number in users.phone column
  - Updated signUp function to accept phone parameter and store in database
  - Ensured phone numbers are saved with +55 prefix during registration
  - IMPLEMENTED 100% real balance system based on Supabase data
  - Corrected user registration to start with R$ 0,00 instead of fake R$ 1.000,00
  - Updated existing users to have real balance values from database
  - Created fallback API endpoint /api/users/update-phone for guaranteed phone storage
  - Fixed toast notifications to auto-dismiss after 3 seconds for better UX
  - Restored minimum deposit amount to R$ 35,00 with quick buttons: R$ 35, 50, 100, 200, 500, 1000
  - Fixed PIX generation error with phone number validation and fallback system
  - Implemented automatic phone number generation for invalid test numbers
  - Payment processing system confirmed working with real transactions
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```