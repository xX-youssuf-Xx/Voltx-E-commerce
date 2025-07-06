# VoltX E-commerce Frontend

This repository contains three separate React applications for the VoltX E-commerce platform:

## Applications

### 1. Main Store (voltx-store.com) - Port 3000
- **Location**: `./main/`
- **Description**: Main customer-facing e-commerce website
- **Features**: Product catalog, shopping cart, checkout process
- **Status**: Placeholder page with navigation to other panels

### 2. Admin Panel (admin.voltx-store.com) - Port 3001
- **Location**: `./admin/`
- **Description**: Complete admin interface for store management
- **Features**: 
  - Authentication system
  - Dashboard with analytics
  - Product management
  - Order management
  - Categories & brands management
  - Discount management
  - Homepage management
  - Shopping cart monitoring
  - Activity logs
- **Status**: Fully implemented with authentication and all features

### 3. Cashier Panel (cashier.voltx-store.com) - Port 3002
- **Location**: `./cashier/`
- **Description**: Point-of-sale system for in-store operations
- **Features**: Quick checkout, order management, payment processing
- **Status**: Placeholder page with feature overview

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Package Manager**: Bun
- **Routing**: React Router DOM
- **HTTP Client**: Axios (admin panel)

## Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- Git

## Installation & Setup

### 1. Install Dependencies

Navigate to each application directory and install dependencies:

```bash
# Main Store
cd frontend/main
bun install

# Admin Panel
cd ../admin
bun install

# Cashier Panel
cd ../cashier
bun install
```

### 2. Development Servers

Run each application on its designated port:

```bash
# Terminal 1 - Main Store (Port 3000)
cd frontend/main
bun run dev

# Terminal 2 - Admin Panel (Port 3001)
cd frontend/admin
bun run dev

# Terminal 3 - Cashier Panel (Port 3002)
cd frontend/cashier
bun run dev
```

### 3. Access Applications

- **Main Store**: http://localhost:3000
- **Admin Panel**: http://localhost:3001
- **Cashier Panel**: http://localhost:3002

## Project Structure

```
frontend/
├── main/                    # Main store application
│   ├── src/
│   │   ├── pages/
│   │   │   └── HomePage.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── admin/                   # Admin panel application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.tsx
│   │   │   └── Navbar.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/
│   │   │   └── useApi.ts
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   └── DashboardPage.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
└── cashier/                 # Cashier panel application
    ├── src/
    │   ├── pages/
    │   │   └── CashierPage.tsx
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── tsconfig.json
```

## Admin Panel Features

### Authentication
- Login/logout functionality
- Token-based authentication
- Protected routes
- Auto-redirect for unauthenticated users

### Dashboard
- Overview statistics (products, orders, revenue, customers)
- Recent orders list
- Quick action buttons
- Responsive design

### Navigation
- Collapsible sidebar with 8 menu items
- Active route highlighting
- Responsive navigation

### API Integration
- Centralized API utility hook
- Automatic token handling
- Error handling and loading states

## Development Commands

### Build Applications
```bash
# Build for production
bun run build

# Preview production build
bun run preview
```

### Code Quality
```bash
# Type checking
bun run type-check

# Linting
bun run lint
```

## Environment Configuration

### Backend API
The admin panel is configured to connect to the backend API at `http://localhost:3000/api`. Update the API base URL in `admin/src/hooks/useApi.ts` if needed.

### Environment Variables
Create `.env` files in each application directory for environment-specific configuration:

```bash
# .env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=VoltX Store
```

## Deployment

### Production Build
```bash
# Build all applications
cd frontend/main && bun run build
cd ../admin && bun run build
cd ../cashier && bun run build
```

### Docker Support
Each application includes Dockerfile configurations for containerized deployment.

## Contributing

1. Create a feature branch
2. Make your changes
3. Test all three applications
4. Submit a pull request

## License

This project is part of the VoltX E-commerce platform. 