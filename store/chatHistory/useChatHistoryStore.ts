import { PrismaClient } from "@prisma/client";
import create from "zustand";
import { supabase } from "@/lib/supabaseClient";
import { IMessage } from "@/lib/interfaces/IMessage";
import { auth, getAuth } from "@clerk/nextjs/server";
import { useAuth } from "@clerk/nextjs";

const prisma = new PrismaClient();

interface ChatHistory {
  id: string;
  messages: IMessage[];
  favorite: boolean;
  archived: boolean;
  deleted: boolean;
}

interface ChatHistoryState {
  histories: ChatHistory[];
  selectedChatId: string | null;
  fetchHistories: () => Promise<void>;
  startNewChat: () => void;
  addMessageToCurrentChat: (newMessage: IMessage) => void;
  selectChat: (id: string) => void;
  removeHistory: (id: string) => Promise<void>;
  updateHistory: (id: string, updates: Partial<ChatHistory>) => Promise<void>;
}

export const useChatHistoryStore = create<ChatHistoryState>((set, get) => ({
  histories: [],
  selectedChatId: null,

  fetchHistories: async () => {
    const { data, error } = await supabase
      .from("chat_histories")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Error fetching chat histories:", error);
    } else {
      set({ histories: data || [] });
    }
  },

  startNewChat: async () => {
    const newChatId = `${new Date().getTime()}`;
    const newConversation = await prisma.conversations.create({
      data: {
        Id: newChatId,
        Name: "New Chat",
        CreatedAt: new Date(),
        UserId: useAuth(),
      },
    });
    set((state) => ({
      selectedChatId: newChatId,
      histories: [
        {
          id: newChatId,
          messages: [],
          favorite: false,
          archived: false,
          deleted: false,
        },
        ...state.histories,
      ],
    }));
    return newChatId;
  },

  addMessageToCurrentChat: (newMessage) => {
    set((state) => ({
      histories: state.histories.map((history) =>
        history.id === state.selectedChatId
          ? { ...history, messages: [...history.messages, newMessage] }
          : history
      ),
    }));
  },

  selectChat: (id) => set({ selectedChatId: id }),

  removeHistory: async (id) => {
    await supabase
      .from("chat_histories")
      .update({ deleted: true })
      .eq("id", id);

    set((state) => ({
      histories: state.histories.map((history) =>
        history.id === id ? { ...history, deleted: true } : history
      ),
    }));
  },

  updateHistory: async (id, updates) => {
    await supabase.from("chat_histories").update(updates).eq("id", id);

    set((state) => ({
      histories: state.histories.map((history) =>
        history.id === id ? { ...history, ...updates } : history
      ),
    }));
  },
}));
