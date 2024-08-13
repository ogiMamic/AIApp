import create from "zustand";
import { IMessage } from "@/lib/interfaces/IMessage"; // corrected import casing

interface ChatHistoryState {
  histories: { id: string; messages: IMessage[] }[]; // Each history item has an id and an array of messages
  currentChatId: string | null; // Track the current chat ID
  selectedChatId: string | null; // Track the selected chat ID
  startNewChat: () => void;
  addMessageToCurrentChat: (newMessage: IMessage) => void;
  selectChat: (id: string) => void;
  removeHistory: (id: string) => void;
}

export const useChatHistoryStore = create<ChatHistoryState>((set) => ({
  histories: [],
  currentChatId: null,
  selectedChatId: null,
  startNewChat: () =>
    set((state) => {
      const newChatId = `${new Date().getTime()}`; // Generate a new ID for the chat
      return {
        currentChatId: newChatId,
        histories: [...state.histories, { id: newChatId, messages: [] }],
      };
    }),
  addMessageToCurrentChat: (newMessage) =>
    set((state) => ({
      histories: state.histories.map((history) =>
        history.id === state.currentChatId
          ? { ...history, messages: [...history.messages, newMessage] }
          : history
      ),
    })),
  selectChat: (id) =>
    set({
      selectedChatId: id,
    }),
  removeHistory: (id) =>
    set((state) => ({
      histories: state.histories.filter((history) => history.id !== id),
    })),
}));
