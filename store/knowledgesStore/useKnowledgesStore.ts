import { SynapseKnowledge } from "@/lib/interfaces/SynapseKnowledge";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface State {
  userId: string | null;
  knowledges: SynapseKnowledge[];
  selected: SynapseKnowledge | null;
}

interface Knowledge {
  id: string;
  name: string;
  description: string;
  anweisungen: string;
  parentId?: string;
}

interface KnowledgesStore {
  knowledges: Knowledge[];
  selected: Knowledge | null;

  addKnowledge: (knowledge: Knowledge) => void;
  removeKnowledge: (id: string) => void;
  updateKnowledge: (knowledge: Knowledge) => void;
  selectKnowledge: (knowledge: Knowledge) => void;
  setKnowledges: (knowledges: Knowledge[]) => void;
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

export const useKnowledgesStore = create<KnowledgesStore>((set) => ({
  knowledges: [],
  selected: null,
  addKnowledge: (knowledge) =>
    set((state) => ({
      knowledges: [...state.knowledges, knowledge],
    })),
  removeKnowledge: (id) =>
    set((state) => ({
      knowledges: state.knowledges.filter((knowledge) => knowledge.id !== id),
    })),
  selectKnowledge: (knowledge) => set({ selected: knowledge }),
  updateKnowledge: (updatedKnowledge) =>
    set((state) => ({
      knowledges: state.knowledges.map((knowledge) =>
        knowledge.id === updatedKnowledge.id ? updatedKnowledge : knowledge
      ),
    })),
  setKnowledges: (knowledges) => set({ knowledges }),
}));
