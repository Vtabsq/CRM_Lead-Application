# Frontend - React Application

## Overview

Modern React application with TailwindCSS for the CRM Lead Form.

## Features

- Paginated form (10 fields per page)
- Responsive design
- Real-time validation
- Progress indicator
- Success/error notifications
- Auto-detected input types

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Opens at http://localhost:3000

## Build

```bash
npm run build
```

Output in `dist/` folder

## Configuration

Edit `src/App.jsx`:
```javascript
const API_BASE_URL = 'http://localhost:8000';  // Backend URL
const FIELDS_PER_PAGE = 10;                     // Fields per page
```

## Project Structure

```
src/
├── App.jsx       # Main application component
├── main.jsx      # React entry point
└── index.css     # TailwindCSS styles
```

## Technologies

- **React 18** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons

## Customization

### Change Fields Per Page

In `App.jsx`:
```javascript
const FIELDS_PER_PAGE = 15;  // Show 15 fields per page
```

### Change Theme Colors

In `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
    }
  }
}
```

### Modify Form Layout

Edit the form rendering in `App.jsx` - look for the `renderField` function.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Port Already in Use

Change port in `vite.config.js`:
```javascript
server: {
  port: 3001,  // Use different port
}
```

### Backend Connection Issues

1. Verify backend is running
2. Check `API_BASE_URL` in `App.jsx`
3. Check browser console for CORS errors
