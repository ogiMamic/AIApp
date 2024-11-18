import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
import { BotAvatar } from "@/components/bot-avatar";
import { IMessage } from "@/lib/interfaces/IMessage";
import { Loader } from "lucide-react";
import { Empty } from "@/components/empty";

interface MessageListProps {
  messages: IMessage[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  return (
    <div className="space-y-4">
      {isLoading && (
        <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      )}
      {messages.length === 0 && !isLoading && (
        <Empty label="No conversation started." />
      )}
      <div className="space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "p-4 rounded-lg flex items-start space-x-4",
              message.role === "user" ? "bg-blue-50" : "bg-green-50"
            )}
          >
            {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">
                {message.role === "user" ? "You" : "AI"}
              </p>
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
