# AI Coding Assistant - Frontend

A clean and professional chat interface for your local AI coding assistant with interactive dependency graph visualization.

## Features

- 💬 Real-time chat interface with message history
- 🎨 Clean, professional dark-mode UI built with Tailwind CSS
- 🔄 HTTP-based communication with backend
- 📝 Support for optional project context
- 🎯 Intent display for assistant responses
- 📁 Side panel for retrieved files and context
- 🔀 Interactive dependency graph visualization using React Flow
- 📱 Responsive design with mobile support
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
  "intent": "The detected intent",
  "retrieved_files": [
    {
      "path": "src/example.ts",
      "content": "file content here",
      "relevance": 0.95
    }
  ],
  "dependency_graph": {
    "nodes": ["module1", "module2", "module3"],
    "edges": [
      { "from": "module1", "to": "module2" },
      { "from": "module2", "to": "module3" }
    ],
    "description": "Optional description of the graph"
  }
}
```

Note: `retrieved_files` and `dependency_graph` are optional and will only show in the UI when present.

## Dependency Graph Visualization

The application uses React Flow to create interactive dependency graphs. Features include:

- **Interactive nodes**: Drag nodes to rearrange the graph
- **Zoom & Pan**: Navigate large graphs easily
- **Minimap**: Overview of the entire graph structure
- **Animated edges**: Visual flow indicators
- **Radial layout**: Automatically positions nodes in a circular pattern

The graph opens automatically in the side panel when dependency data is included in the response.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Flow (for dependency graphs)
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

