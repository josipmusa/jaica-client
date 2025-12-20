# AI Coding Assistant - Frontend

A clean and professional chat interface for your local AI coding assistant.

## Features

- 💬 Real-time chat interface with message history
- 🎨 Clean, professional UI built with Tailwind CSS
- 🔄 HTTP-based communication with backend
- 📝 Support for optional project context
- 🎯 Intent display for assistant responses
- ⌨️ Keyboard shortcuts (Enter to send, Shift+Enter for new line)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure the API endpoint (optional):
```bash
cp .env.example .env
```
Then edit `.env` and set `VITE_API_URL` to your backend URL (default: `http://localhost:8000`)

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## API Integration

The frontend expects your backend to have a POST endpoint at `/chat` that:

**Request:**
```json
{
  "prompt": "Your message here",
  "project_name": "optional-project-name"
}
```

**Response:**
```json
{
  "answer": "Assistant's response",
  "intent": "The detected intent"
}
```

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- UUID for message identification

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

