import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { Message } from '@/types/user';
import { getMessages, sendMessage, markMessageAsRead } from '@/lib/db';

interface MessageContextType {
  messages: Message[];
  activeChat: string | null;
  isLoading: boolean;
  error: string | null;
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  setActiveChat: (userId: string | null) => void;
  markAsRead: (messageId: string) => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !activeChat) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const chatMessages = await getMessages(user.id, activeChat);
        setMessages(chatMessages);
        
        // Mark unread messages as read
        const unreadMessages = chatMessages.filter(
          msg => !msg.read && msg.senderId === activeChat
        );
        
        for (const msg of unreadMessages) {
          await markMessageAsRead(msg.id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();

    // Set up message polling
    const pollInterval = setInterval(loadMessages, 5000);
    return () => clearInterval(pollInterval);
  }, [user?.id, activeChat]);

  const handleSendMessage = async (receiverId: string, content: string) => {
    if (!user) throw new Error('Must be logged in to send messages');

    try {
      const newMessage = await sendMessage({
        senderId: user.id,
        receiverId,
        content,
      });
      setMessages(prev => [...prev, newMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await markMessageAsRead(messageId);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, read: true } : msg
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark message as read');
      throw err;
    }
  };

  return (
    <MessageContext.Provider
      value={{
        messages,
        activeChat,
        isLoading,
        error,
        sendMessage: handleSendMessage,
        setActiveChat,
        markAsRead: handleMarkAsRead,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
}
