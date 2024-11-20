import { SynapseKnowledge } from "@/lib/interfaces/SynapseKnowledge";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { supabase } from "@/lib/supabaseClient";
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
  knowledgesLoading: boolean;
  error: string | null;
  addKnowledge: (knowledge: Knowledge) => void;
  removeKnowledge: (id: string) => void;
  updateKnowledge: (knowledge: Knowledge) => void;
  selectKnowledge: (knowledge: Knowledge) => void;
  setKnowledges: (knowledges: Knowledge[]) => void;
  fetchKnowledges: () => Promise<void>;
}

export const useKnowledgesStore = create<KnowledgesStore>((set) => ({
  knowledges: [],
  selected: null,
  knowledgesLoading: false,
  error: null,
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
    set({ knowledgesLoading: true, error: null });
    try {
      console.log("Počinje dohvatanje znanja...");
      const { data, error } = await supabase.from("knowledges").select("*");

      console.log("Odgovor od Supabase-a:", { data, error });

      if (error) {
        console.error("Greška pri dohvatanju znanja:", error);
        set({ error: error.message, knowledges: [] });
      } else {
        console.log("Uspešno dohvaćena znanja:", data);
        set({ knowledges: data || [] });
      }
    } catch (error) {
      console.error("Neočekivana greška u fetchKnowledges:", error);
      set({ error: "Došlo je do neočekivane greške", knowledges: [] });
    } finally {
      set({ knowledgesLoading: false });
    }
  },
}));
