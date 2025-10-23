# README.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based frontend application for managing electrical infrastructure (transformers and circuit breakers/interruptors) at Universidad del Valle. The application handles device monitoring, measurements, alerts, and reporting.

## Development Commands

### Running the Application
- `npm start` - Start development server on http://localhost:3000
- `npm run build` - Build production bundle

### Testing
- `npm test` - Run Jest unit tests in watch mode
- `npm run cypress:open` - Open Cypress interactive test runner
- `npm run test:e2e` - Run Cypress e2e tests headlessly

### Linting
- `npm run lint` - Run ESLint on the entire codebase

## Architecture

### Backend API Connection
The application communicates with a Django REST API running at `http://127.0.0.1:8000` (some services use `http://localhost:8000`). All API requests require Bearer token authentication, stored in localStorage after login.

### Authentication Flow
1. User logs in via `/signin` endpoint
2. JWT tokens (access + refresh) stored in localStorage as `loggedAppUser`
3. `UserContext` (in `src/hooks/userContext.js`) provides global auth state using React Context + useReducer
4. Protected routes redirect to `/signin` if user is not authenticated (see `src/components/router/index.routes.js`)
5. Token refresh logic in `src/hooks/useRefreshToken.js`

### State Management
- **Global State**: `UserContext` manages authentication state throughout the app
- **Local State**: Component-level useState for forms, modals, and UI state
- **No Redux**: Despite redux being in dependencies, the codebase uses Context API

### Component Structure

```
components/
├── pages/         - Full page components (dashboard, login, transformer list, etc.)
├── forms/         - Form components (newTransfo, newInterru, newRequest, etc.)
├── list/          - Table/list display components (TransformadoresTable, InterruptoresTable, AlertasInterruptoresTable)
├── modals/        - Modal dialogs (cancelAceptModal, modalProvider, EditTransformadorModal, etc.)
├── sections/      - Page sections (reportInformation, reportEvaluation, userInformation, etc.)
├── bodys/         - Layout body wrappers (bodyContent, mainContent, reportContent)
├── side/          - Sidebar navigation for different roles (sideUser, sideAdmin)
├── tools/         - Reusable utilities (spinner, dropZone, checkBoxGroup, styleContent, requiredLabel)
└── router/        - Routing configuration (index.routes.js)
```

### Service Layer Pattern
All API calls are abstracted into service modules in `src/services/`:
- `transformer.services.js` - CRUD operations for transformers
- `interruptor.services.js` - CRUD + alerts for circuit breakers
- `mediciones.services.js` - Measurement data
- `report.services.js` - Report generation
- `provider.services.js` - Provider management
- `request.services.js` - Service requests
- `signin.js` - Authentication
- `user.js` - User operations

Each service follows the pattern:
```javascript
const config = {
    headers: { authorization: 'Bearer ' + token }
}
const { data } = await axios.get(url, config)
return data
```

### Role-Based Access
The application has two main roles checked in `user.rol`:
- **"Técnico"** - Technical user with limited access (see `SideUser` component)
- **"Administrador"** - Admin user with full access (see `SideAdmin` component)

Navigation sidebar dynamically renders based on role.

### File Handling
- `useBase64` hook converts files to base64 for upload
- `dropZone` component handles drag-and-drop file uploads
- `xlsx` and `jszip` libraries used for CSV/Excel processing
- Files are often uploaded as part of measurement data with fault current calculations

### Key Data Entities
1. **Transformadores** (Transformers) - Electrical transformers with measurements and alerts
2. **Interruptores** (Circuit Breakers) - Circuit breakers with measurements and alerts
3. **Mediciones** (Measurements) - Time-series measurement data for devices
4. **Reportes** (Reports) - Generated reports with images and evaluations
5. **Proveedores** (Providers) - Service providers
6. **Solicitudes** (Requests) - Service requests with actions and status tracking

## Important Patterns

### Modal Pattern
Forms typically use `CancelAceptModal` for confirmation dialogs with:
- `show` state to control visibility
- `title`, `subTitle`, `message` for content
- `handleCloseModal` and `handleAccept` callbacks

### Spinner Pattern
Components use `<Spinner />` with `showSpinner` state during async operations (API calls, file processing).

### Alert Pattern
Bootstrap `Alert` component with `showAlert` state for success/error messages.

### Styled Components
Custom styled components in `src/components/tools/styleContent.js` provide consistent styling (StyledLink, StyledForm, InputForm, PButton, SButton, etc.).

### Logout Flow
Two logout hooks exist:
- `useLogout.js` - Basic logout
- `useLogout2.js` - Alternative logout implementation
Both clear localStorage and reset UserContext.

## Testing
- Unit tests in `src/test/` (limited coverage)
- E2E tests in `cypress/e2e/integrations/`
- Fixtures in `cypress/fixtures/` (users.json, profile.json)

## Important Notes
- API URLs are hardcoded (no environment variables)
- Token stored in localStorage (key: `loggedAppUser`)
- Application expects specific user object shape with `Nombres` and `rol` fields
- D3.js library included for data visualization (likely for charts/graphs)
- Bootstrap + React-Bootstrap for UI components
- react-router-dom v6 for routing
