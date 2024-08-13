import create from "zustand";
import { IMessage } from "@/lib/interfaces/iMessage";

interface ChatHistoryState {
  histories: IMessage[];
  addHistory: (newHistory: IMessage) => void;
  removeHistory: (index: number) => void;
}

export const useChatHistoryStore = create((set) => ({
  histories: [],
  addHistory: (newHistory) =>
    set((state) => ({ histories: [...state.histories, newHistory] })),
  removeHistory: (index) =>
    set((state) => ({
      histories: state.histories.filter((_, i) => i !== index),
    })),
}));
