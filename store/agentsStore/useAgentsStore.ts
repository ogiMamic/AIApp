// Import Zustand library

import { SynapseAgent } from "@/lib/interfaces/SynapseAgent";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface State {
  userId: string | null;
  agents: SynapseAgent[];
  selected: SynapseAgent | null;
}

// Define the interface of the actions that can be performed in the Cart
interface Actions {
  addAgent: (item: SynapseAgent) => void;
  removeAgent: (item: SynapseAgent) => void;
  updateAgent: (item: SynapseAgent) => void;
  selectAgent: (item: SynapseAgent) => void;
}

// Define the initial state of the cart store
// Initialize a default state
const initialState: State = {
  userId: null,
  agents: [],
  selected: null,
};

// Create a custom hook to access the cart store
// Create the store with Zustand, combining the status interface and actions
export const useAgentsStore = create<State & Actions>()(
  devtools(
    persist(
      (set, get) => ({
        userId: initialState.userId,
        agents: initialState.agents,
        selected: initialState.selected,
        addAgent: (agent: SynapseAgent) => {
          const collection = get().agents;
          const updatedCollection = [...collection, { ...agent }];

          set((state) => ({
            agents: updatedCollection,
          }));
        },
        removeAgent: (agent: SynapseAgent) => {
          const collection = get().agents;
          const updatedCollection = collection.filter(
            (item) => item.id !== agent.id
          );

          set((state) => ({
            agents: updatedCollection,
          }));
        },
        updateAgent: (agent: SynapseAgent) => {
          const collection = get().agents;
          const updatedCollection = collection.map((item) => {
            if (item.id === agent.id) {
              return agent;
            }
            return item;
          });

          set((state) => ({
            agents: updatedCollection,
          }));
        },
        selectAgent: (agent: SynapseAgent) => {
          console.log("Selecting agent: ", agent); // Dodaj ovu liniju
          set((state) => ({
            selected: agent,
          }));
        },
      }),
      {
        name: "synapse-agents-store",
      }
    )
  )
);
