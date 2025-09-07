# Sijil Accounting Frontend

A modern React TypeScript frontend for the Sijil Accounting System.

## Features

- 🔐 **Authentication**: Secure login with JWT tokens
- 📊 **Dashboard**: Interactive charts and statistics
- 👥 **Customer Management**: Full CRUD operations
- 🛒 **Sales Management**: Comprehensive sales tracking
- 👤 **User Management**: User administration
- 📱 **Responsive Design**: Works on all devices
- 🎨 **Modern UI**: Material-UI components

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install additional required dependency:
```bash
npm install date-fns
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Configuration

### API Configuration

The frontend connects to the backend API. Update the API URL in `src/services/api.ts` if needed:

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
```

### Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:3000/api
```

## Project Structure

```
src/
├── components/
│   └── Layout/
│       └── AppLayout.tsx          # Main layout with navigation
├── contexts/
│   └── AuthContext.tsx            # Authentication state management
├── pages/
│   ├── Login.tsx                  # Login page
│   ├── Dashboard.tsx              # Dashboard with charts
│   ├── Customers.tsx              # Customer management
│   ├── Sales.tsx                  # Sales management
│   └── Users.tsx                  # User management
├── services/
│   └── api.ts                     # API service layer
├── types/
│   └── index.ts                   # TypeScript interfaces
└── App.tsx                        # Main app with routing
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Dependencies

### Core
- React 18
- TypeScript
- React Router DOM

### UI Components
- Material-UI (MUI)
- MUI Data Grid
- MUI Date Pickers
- Recharts (for charts)

### Utilities
- Axios (HTTP client)
- date-fns (date utilities)

## Authentication

The frontend uses JWT tokens for authentication:

1. Login with email/password
2. Token is stored in localStorage
3. Automatic token refresh
4. Protected routes redirect to login

## API Integration

The frontend communicates with your backend API endpoints:

- `/api/auth/*` - Authentication
- `/api/customers/*` - Customer management
- `/api/sales/*` - Sales management
- `/api/users/*` - User management

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend has CORS enabled
2. **API Connection**: Verify backend is running and accessible
3. **Missing Dependencies**: Run `npm install` to install missing packages

### Development Tips

- Use React Developer Tools for debugging
- Check browser console for errors
- Verify API responses in Network tab

## Building for Production

```bash
npm run build
```

This creates a `build` folder with optimized production files.

## Contributing

1. Follow TypeScript best practices
2. Use Material-UI components consistently
3. Add proper error handling
4. Test all CRUD operations

## License

This project is part of the Sijil Accounting System.
