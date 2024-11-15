import { useState } from 'react'
import { Button } from "./components/ui/button"
import { AuthProvider } from "./contexts/AuthContext"
import { LocationProvider } from "./contexts/LocationContext"
import { MessageProvider } from "./contexts/MessageContext"
import { LoginForm } from "./components/auth/LoginForm"
import { UserGrid } from "./components/users/UserGrid"
import { Chat } from "./components/chat/Chat"
import { useAuth } from "./contexts/AuthContext"
import { useLocation } from "./contexts/LocationContext"
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function MainContent() {
  const { user, logout } = useAuth();
  const { location, error: locationError, enableLocationSharing, disableLocationSharing } = useLocation();
  const [view, setView] = useState<'grid' | 'chat'>('grid');

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <span className="font-bold sm:inline-block">
                LocalDate
              </span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-2">
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setView('grid')}
                    className={view === 'grid' ? 'bg-accent' : ''}
                  >
                    Discover
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setView('chat')}
                    className={view === 'chat' ? 'bg-accent' : ''}
                  >
                    Messages
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Welcome, {user.username}
                  </span>
                  <Button
                    variant="outline"
                    onClick={user.settings.locationSharing ? disableLocationSharing : enableLocationSharing}
                  >
                    {user.settings.locationSharing ? 'Disable Location' : 'Enable Location'}
                  </Button>
                  <Button variant="ghost" onClick={logout}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button>Get Started</Button>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-6">
        {!user ? (
          <LoginForm />
        ) : view === 'grid' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-4xl font-bold tracking-tight">Welcome to LocalDate</h1>
            </div>
            {locationError && (
              <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
                {locationError}
              </div>
            )}
            <UserGrid currentLocation={location} />
          </div>
        ) : (
          <Chat />
        )}
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <MessageProvider>
          <MainContent />
        </MessageProvider>
      </LocationProvider>
    </AuthProvider>
  )
}

export default App
