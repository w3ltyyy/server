# Svag Music API Server

This directory contains the API server for Svag Music, designed to be deployed on Vercel.

## Structure

The server uses Vercel's Serverless Functions architecture:

- `/api/index.js` - Main API entry point
- `/api/tracks.js` - Tracks API endpoint
- `/api/auth/login.js` - Login API endpoint
- `/api/auth/register.js` - Registration API endpoint
- `/api/playlists.js` - Playlists API endpoint

## Deployment to Vercel

### Prerequisites

1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Install Vercel CLI:
   ```
   npm install -g vercel
   ```

### Deploy Steps

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. Deploy to Vercel:
   ```
   vercel
   ```

   This will deploy your project to a preview URL. To deploy to production:
   ```
   vercel --prod
   ```

## API Endpoints

### Base URL

When deployed, your API will be available at `https://your-vercel-project-name.vercel.app/api/`

### Available Endpoints

- `GET /api` - API status and information
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/tracks` - Get all tracks
- `GET /api/tracks/:id` - Get track by ID
- `GET /api/playlists` - Get all playlists
- `GET /api/playlists/:id` - Get playlist by ID

## Development

To run the server locally for development:

```
npm run dev
```

This will start the development server at `http://localhost:3001`.

## Notes

- The API currently uses mock data. In a production environment, you would connect to a database.
- Authentication is simulated with mock tokens. In production, implement proper JWT authentication.
- Consider adding environment variables for sensitive configuration. 