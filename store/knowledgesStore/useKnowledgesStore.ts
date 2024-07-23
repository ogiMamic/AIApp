import { SynapseKnowledge } from "@/lib/interfaces/SynapseKnowledge";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface State {
  userId: string | null;
  knowledges: SynapseKnowledge[];
  selected: SynapseKnowledge | null;
}

interface Actions {
  addKnowledge: (knowledge: SynapseKnowledge) => void;
  removeKnowledge: (id: string) => void; // Changed to accept id directly
  updateKnowledge: (knowledge: SynapseKnowledge) => void;
  selectKnowledge: (knowledge: SynapseKnowledge) => void;
}

const initialState: State = {
  userId: null,
  knowledges: [],
  selected: null,
};

export const useKnowledgesStore = create<State & Actions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        addKnowledge: (knowledge: SynapseKnowledge) => {
          const updatedCollection = [...get().knowledges, knowledge];
          set({ knowledges: updatedCollection });
        },
        removeKnowledge: (id: string) => {
          const updatedCollection = get().knowledges.filter(
            (item) => item.id !== id
          );
          set({ knowledges: updatedCollection });
        },
        updateKnowledge: (knowledge: SynapseKnowledge) => {
          const updatedCollection = get().knowledges.map((item) =>
            item.id === knowledge.id ? knowledge : item
          );
          set({ knowledges: updatedCollection });
        },
        selectKnowledge: (knowledge: SynapseKnowledge) => {
          set({ selected: knowledge });
        },
      }),
      {
        name: "synapse-knowledge-store",
      }
    )
  )
);
