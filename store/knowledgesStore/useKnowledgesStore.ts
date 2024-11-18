import { SynapseKnowledge } from "@/lib/interfaces/SynapseKnowledge";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { supabase } from "@/lib/supabaseClient";
import { SynapseAgent } from "@/lib/interfaces/SynapseAgent";

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
  agents: SynapseAgent[];
}

interface KnowledgesStore {
  knowledges: Knowledge[];
  selected: Knowledge | null;
  addKnowledge: (knowledge: Knowledge) => void;
  removeKnowledge: (id: string) => void;
  updateKnowledge: (knowledge: Knowledge) => void;
  selectKnowledge: (knowledge: Knowledge) => void;
  setKnowledges: (knowledges: Knowledge[]) => void;
  fetchKnowledges: () => Promise<void>;
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
  fetchKnowledges: async () => {
    try {
      const { data, error } = await supabase.from("knowledges").select("*");
      if (error) {
        console.error("Error fetching knowledges:", error);
      } else {
        set({ knowledges: data });
      }
    } catch (error) {
      console.error("Error in fetchKnowledges:", error);
    }
  },
}));
