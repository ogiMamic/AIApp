// Import Zustand library

import { SynapseKnowledge } from "@/lib/interfaces/SynapseKnowledge";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface State {
  userId: string | null;
  agents: SynapseKnowledge[];
  selected: SynapseKnowledge | null;
}

// Define the interface of the actions that can be performed in the Cart
interface Actions {
  addKnowledge: (item: SynapseKnowledge) => void;
  removeKnowledge: (item: SynapseKnowledge) => void;
  updateKnowledge: (item: SynapseKnowledge) => void;
  selectKnowledge: (item: SynapseKnowledge) => void;
}

// Define the initial state of the cart store
// Initialize a default state
const initialState: State = {
  userId: null,
  knowledges: [],
  selected: null,
};

// Create a custom hook to access the cart store
// Create the store with Zustand, combining the status interface and actions
export const useKnowledgesStore = create<State & Actions>()(
  devtools(
    persist(
      (set, get) => ({
        userId: initialState.userId,
        knowledges: initialState.agents,
        selected: initialState.selected,
        addKnowledge: (knowledge: SynapseKnowledge) => {
          const collection = get().knowledges;
          const updatedCollection = [...collection, { ...knowledge }];

          set((state) => ({
            knowledges: updatedCollection,
          }));
        },
        removeKnowledge: (knowledge: SynapseKnowledge) => {
          const collection = get().knowledges;
          const updatedCollection = collection.filter(
            (item) => item.id !== knowledge.id
          );

          set((state) => ({
            knowledges: updatedCollection,
          }));
        },
        updateKnowledge: (knowledge: SynapseKnowledge) => {
          const collection = get().knowledges;
          const updatedCollection = collection.map((item) => {
            if (item.id === knowledge.id) {
              return knowledge;
            }
            return item;
          });

          set((state) => ({
            knowledge: updatedCollection,
          }));
        },
        selectKnowledge: (knowledge: SynapseKnowledge) => {
          set((state) => ({
            selected: knowledge,
          }));
        },
      }),
      {
        name: "synapse-knowledge-store",
      }
    )
  )
);
