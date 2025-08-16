# Overview

Code Bhej is a real-time anonymous chat application built with modern web technologies. It provides instant chat capabilities without requiring user registration or authentication. The application supports both public chat rooms (accessible to everyone) and private chat rooms (accessible via unique room IDs with optional password protection). Users can send text messages, images, and files in real-time through WebSocket connections.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Styling**: TailwindCSS with shadcn/ui component library for consistent UI components
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **Real-time Communication**: Socket.IO client for WebSocket connections
- **Form Handling**: React Hook Form with Zod validation schemas

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Real-time Communication**: Socket.IO server for WebSocket handling
- **Database**: In-memory storage using Maps for development/demo purposes
- **Schema Validation**: Zod for runtime type checking and validation
- **Session Management**: No traditional sessions - anonymous users with auto-generated usernames

## Data Storage Strategy
- **Primary Storage**: In-memory storage using JavaScript Maps for rooms, messages, and participants
- **Database Schema**: Drizzle ORM configured for PostgreSQL (available for future persistence)
- **Temporary Data**: Messages and room data exist only in memory and are cleaned up when rooms become inactive
- **File Handling**: Support for image and file uploads (implementation pending)

## Real-time Features
- **WebSocket Events**: Room joining/leaving, message broadcasting, typing indicators, user count updates
- **Message Types**: Text, images, files, and system messages
- **Auto-cleanup**: Inactive rooms and disconnected users are automatically removed
- **Anonymous Users**: Auto-generated usernames for all participants

## Security & Privacy
- **No Persistence**: Messages are not stored permanently - only kept in memory during active sessions
- **Anonymous Access**: No user registration or authentication required
- **Optional Room Protection**: Private rooms can be password-protected
- **Cross-Origin Support**: CORS configured for WebSocket connections

## UI/UX Design
- **Responsive Design**: Mobile-first approach with TailwindCSS breakpoints
- **Component System**: Modular shadcn/ui components with consistent styling
- **Theme Support**: CSS variables for easy theming and dark mode support
- **Accessibility**: Proper ARIA labels and keyboard navigation support

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form, TanStack Query
- **TypeScript**: Full TypeScript support with strict type checking
- **Build Tools**: Vite for development and production builds, esbuild for server bundling

## UI and Styling
- **TailwindCSS**: Utility-first CSS framework with PostCSS processing
- **Radix UI**: Unstyled, accessible UI components as foundation for shadcn/ui
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe CSS class composition

## Real-time Communication
- **Socket.IO**: WebSocket library for both client and server real-time communication
- **CORS Support**: Cross-origin resource sharing for WebSocket connections

## Data Management
- **Drizzle ORM**: Type-safe ORM configured for PostgreSQL (ready for database integration)
- **Zod**: Schema validation and type inference library
- **Date-fns**: Date manipulation and formatting utilities

## Development Tools
- **Replit Integration**: Cartographer plugin and runtime error overlay for Replit environment
- **ESLint/Prettier**: Code quality and formatting tools (configuration pending)
- **Hot Module Replacement**: Vite HMR for fast development iterations

## Database Options
- **Current**: In-memory storage using JavaScript Maps
- **Future**: PostgreSQL with Neon Database serverless driver (@neondatabase/serverless)
- **Session Store**: connect-pg-simple for PostgreSQL session storage when persistence is added