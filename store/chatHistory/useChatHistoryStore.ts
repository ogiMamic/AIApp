import create from "zustand";
import { supabase } from "@/lib/supabaseClient"; // Import Supabase client
import { IMessage } from "@/lib/interfaces/IMessage"; // corrected import casing

interface ChatHistoryState {
  histories: { id: string; messages: IMessage[] }[];
  currentChatId: string | null;
  selectedChatId: string | null;
  startNewChat: () => void;
  addMessageToCurrentChat: (newMessage: IMessage) => void;
  selectChat: (id: string) => void;
  removeHistory: (id: string) => void;
  fetchHistories: () => Promise<void>; // Dodaj ovu liniju
}

export const useChatHistoryStore = create<ChatHistoryState>((set) => ({
  histories: [],
  currentChatId: null,
  selectedChatId: null,

  startNewChat: () =>
    set((state) => {
      const newChatId = `${new Date().getTime()}`;
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

  fetchHistories: async () => {
    const { data: histories, error } = await supabase
      .from("threads")
      .select("*");
    if (error) {
      console.error("Error fetching histories from Supabase:", error.message);
    } else {
      set((state) => ({
        histories: histories.map((history) => ({
          id: history.id,
          messages: history.messages || [],
        })),
      }));
    }
  },
}));
