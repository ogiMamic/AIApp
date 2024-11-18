import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Star, Trash, RefreshCw, Share2 } from "lucide-react";

interface SidebarProps {
  sidebarOpen: boolean;
  handleNewChat: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showDeleted: boolean;
  setShowDeleted: (show: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  filteredHistories: any[];
  selectedChatId: string | null;
  selectChat: (id: string) => void;
  toggleFavorite: (id: string) => void;
  handleRestore: (id: string) => void;
  removeHistory: (id: string) => void;
  handleShare: (id: string) => void;
}

export function Sidebar({
  sidebarOpen,
  handleNewChat,
  searchTerm,
  setSearchTerm,
  showDeleted,
  setShowDeleted,
  notificationsEnabled,
  setNotificationsEnabled,
  filteredHistories,
  selectedChatId,
  selectChat,
  toggleFavorite,
  handleRestore,
  removeHistory,
  handleShare,
}: SidebarProps) {
  return (
    <div
      className={cn(
        "w-80 bg-white h-full overflow-y-auto",
        "fixed inset-y-0 right-0 z-50 transition-transform duration-200 ease-in-out",
        sidebarOpen ? "translate-x-0" : "translate-x-full",
        "lg:static lg:translate-x-0",
        "shadow-xl border-l border-gray-200"
      )}
    >
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Chat History</h3>
          <Button size="sm" onClick={handleNewChat}>
            New Chat
          </Button>
        </div>
        <Input
          placeholder="Search chats..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
          icon={Search}
        />
        <div className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            id="showDeleted"
            checked={showDeleted}
            onChange={() => setShowDeleted(!showDeleted)}
            className="rounded text-blue-600"
          />
          <label htmlFor="showDeleted">Show deleted</label>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            id="notifications"
            checked={notificationsEnabled}
            onChange={() => setNotificationsEnabled(!notificationsEnabled)}
            className="rounded text-blue-600"
          />
          <label htmlFor="notifications">Enable notifications</label>
        </div>
        <ul className="space-y-2">
          {filteredHistories.map((history) => (
            <li
              key={history.id}
              className={cn(
                "p-2 rounded-md cursor-pointer hover:bg-gray-100",
                selectedChatId === history.id ? "bg-blue-100" : ""
              )}
              onClick={() => {
                if (!history.deleted) {
                  selectChat(history.id);
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-2">
                  <p className="text-sm font-medium truncate">
                    {history.messages[0]?.content.slice(0, 30) || "Empty chat"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(parseInt(history.id)).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(history.id);
                    }}
                  >
                    <Star
                      className={cn(
                        "w-4 h-4",
                        history.favorite
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-500"
                      )}
                    />
                    <span className="sr-only">
                      {history.favorite ? "Unfavorite" : "Favorite"}
                    </span>
                  </button>
                  {history.deleted ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestore(history.id);
                      }}
                    >
                      <RefreshCw className="w-4 h-4 text-green-500" />
                      <span className="sr-only">Restore</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeHistory(history.id);
                        }}
                      >
                        <Trash className="w-4 h-4 text-red-500" />
                        <span className="sr-only">Delete</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(history.id);
                        }}
                      >
                        <Share2 className="w-4 h-4 text-blue-500" />
                        <span className="sr-only">Share</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
