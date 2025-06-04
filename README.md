# TanStack E-commerce Client

A modern, fully-featured e-commerce web application built with React, TanStack Router, and Supabase.

> 🚧 **WORK IN PROGRESS** - This project is currently under active development.

## Features

- 🛒 Complete shopping cart functionality
- 💳 Stripe payment integration
- 👤 User authentication with Supabase
- 📦 Order tracking and management
- 📱 Responsive design using Tailwind CSS
- 🔍 Product search and filtering
- 🛍️ Category navigation
- 🔐 Address management

## Tech Stack

- **Frontend Framework**: TanStack Start
- **Routing**: TanStack Router
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Form Management**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with shadcn/ui components
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Payment Processing**: Stripe
- **Build Tool**: Vite via Vinxi

## Prerequisites

- Node.js 18+ (recommended 20+)
- pnpm
- Supabase account
- Stripe account

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# API (if using a separate Express backend)
VITE_EXPRESS_API_URL=http://localhost
VITE_EXPRESS_API_PORT=3001
```

## Getting Started

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/tanstack-ecommerce-client.git
   cd tanstack-ecommerce-client
   ```

2. Install dependencies

   ```bash
   pnpm install
   ```

3. Start the development server

   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Setup

The project uses Supabase as its database provider. The schema is defined in `schema.sql` file.

1. Create a new Supabase project
2. Execute the SQL in `schema.sql` in the Supabase SQL editor
3. Configure Row Level Security (RLS) policies as specified in the schema file
4. Update your `.env` file with the Supabase URL and anon key

## Stripe Integration

This project uses Stripe for payment processing:

1. Create a Stripe account
2. Get your publishable key from the Stripe dashboard
3. Add the key to your `.env` file as `VITE_STRIPE_PUBLISHABLE_KEY`

## Project Structure

- `/src/components` - React components
- `/src/routes` - TanStack Router route components
- `/src/hooks` - Custom React hooks
- `/src/utils` - Utility functions
- `/src/types` - TypeScript type definitions
- `/src/stores` - Zustand state stores
- `/src/lib` - Shared libraries and API clients

## Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build the application for production
- `pnpm start` - Serve the production build

## Deployment

1. Build the application: `pnpm build`
2. Deploy the `/dist` directory to your hosting provider

## License

MIT
