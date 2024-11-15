import { useEffect, useState } from 'react';
import { getNearbyUsers } from '@/lib/db';
import type { User } from '@/types/user';

interface UserGridProps {
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
}

export function UserGrid({ currentLocation }: UserGridProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      if (!currentLocation) {
        setLoading(false);
        return;
      }

      try {
        const nearbyUsers = await getNearbyUsers(
          currentLocation.latitude,
          currentLocation.longitude
        );
        setUsers(nearbyUsers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [currentLocation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 dark:text-red-400 p-4">
        {error}
      </div>
    );
  }

  if (!currentLocation) {
    return (
      <div className="text-center text-muted-foreground p-4">
        Enable location sharing to see users nearby
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4">
        No users found nearby
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex flex-col items-center p-4 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-3">
            {user.profilePic ? (
              <img
                src={user.profilePic}
                alt={user.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">
                {user.username[0].toUpperCase()}
              </span>
            )}
          </div>
          <h3 className="font-medium text-lg">{user.username}</h3>
          {user.description && (
            <p className="text-sm text-muted-foreground text-center mt-1">
              {user.description}
            </p>
          )}
          <button className="mt-3 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
            Message
          </button>
        </div>
      ))}
    </div>
  );
}
