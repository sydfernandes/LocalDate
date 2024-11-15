import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/contexts/MessageContext';
import { getUser } from '@/lib/db';
import type { User } from '@/types/user';
import { cn } from '@/lib/utils';

interface ChatPreview {
  user: User;
  lastMessage: string;
  unreadCount: number;
  timestamp: number;
}

export function ChatList() {
  const { user } = useAuth();
  const { messages, activeChat, setActiveChat } = useMessages();
  const [chatPreviews, setChatPreviews] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChatPreviews = async () => {
      if (!user) return;

      // Get unique user IDs from messages
      const userIds = new Set(
        messages
          .map(msg => [msg.senderId, msg.receiverId])
          .flat()
          .filter(id => id !== user.id)
      );

      const previews: ChatPreview[] = [];

      for (const userId of userIds) {
        const otherUser = await getUser(userId);
        if (!otherUser) continue;

        const userMessages = messages.filter(
          msg => msg.senderId === userId || msg.receiverId === userId
        );

        const lastMessage = userMessages[userMessages.length - 1];
        const unreadCount = userMessages.filter(
          msg => msg.senderId === userId && !msg.read
        ).length;

        previews.push({
          user: otherUser,
          lastMessage: lastMessage?.content ?? '',
          unreadCount,
          timestamp: lastMessage?.timestamp ?? 0,
        });
      }

      // Sort by timestamp, most recent first
      previews.sort((a, b) => b.timestamp - a.timestamp);
      setChatPreviews(previews);
      setLoading(false);
    };

    loadChatPreviews();
  }, [user, messages]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-16 bg-muted animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (chatPreviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No messages yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chatPreviews.map(preview => (
        <button
          key={preview.user.id}
          onClick={() => setActiveChat(preview.user.id)}
          className={cn(
            'w-full p-3 flex items-center gap-3 rounded-lg hover:bg-accent transition-colors',
            activeChat === preview.user.id && 'bg-accent'
          )}
        >
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            {preview.user.profilePic ? (
              <img
                src={preview.user.profilePic}
                alt={preview.user.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-lg font-semibold text-muted-foreground">
                {preview.user.username[0].toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center justify-between">
              <span className="font-medium">{preview.user.username}</span>
              {preview.unreadCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                  {preview.unreadCount}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {preview.lastMessage}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
