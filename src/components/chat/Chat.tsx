import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';

export function Chat() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] h-[calc(100vh-3.5rem)] divide-x">
      <div className="hidden md:block overflow-y-auto border-r p-4">
        <ChatList />
      </div>
      <div className="h-full">
        <ChatWindow />
      </div>
    </div>
  );
}
