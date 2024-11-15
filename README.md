# LocalDate

A privacy-focused, decentralized social networking web application that enables direct peer communication and local data storage.

## Features

- **Privacy-First**: All data is stored locally in your browser
- **No Server Required**: Runs entirely on the client side
- **Location-Based Discovery**: Find and connect with people nearby
- **Real-Time Messaging**: Chat directly with other users
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark Mode Support**: Automatic theme detection and switching

## Tech Stack

- **Frontend Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **UI Framework**: Shadcn/ui components with Tailwind CSS
- **Data Storage**: IndexedDB (via `idb` library)
- **State Management**: React Context
- **Peer Communication**: WebRTC (planned)

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sydfernandes/LocalDate.git
cd LocalDate
```

2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Building for Production

```bash
npm run build
# or
yarn build
```

The build output will be in the `dist` directory.

## Project Structure

```
src/
├── components/         # React components
│   ├── auth/          # Authentication components
│   ├── chat/          # Messaging components
│   ├── users/         # User-related components
│   └── ui/            # Reusable UI components
├── contexts/          # React contexts
│   ├── AuthContext    # Authentication state
│   ├── LocationContext# Geolocation management
│   └── MessageContext # Messaging state
├── lib/              # Utilities and services
│   ├── db.ts         # IndexedDB database service
│   └── utils.ts      # Helper functions
├── types/            # TypeScript type definitions
└── App.tsx           # Root component
```

## Features in Detail

### Authentication
- Local, token-based authentication
- Persistent login state using IndexedDB
- No server-side authentication required

### Location Services
- Real-time location tracking
- Privacy-focused location sharing controls
- Nearby user discovery using Haversine formula

### Messaging
- Direct peer-to-peer messaging
- Real-time message updates
- Unread message indicators
- Message timestamps
- Conversation management

### Data Privacy
- All data stored locally in IndexedDB
- No third-party tracking
- Optional location sharing
- User-controlled privacy settings

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
