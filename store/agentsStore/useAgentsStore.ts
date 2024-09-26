// Import Zustand library

import { SynapseAgent } from "@/lib/interfaces/SynapseAgent";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface State {
  userId: string | null;
  agents: SynapseAgent[];
  selected: SynapseAgent | null;
  isLoading: boolean;
  error: string | null;
}

// Define the interface of the actions that can be performed in the Cart
interface Actions {
  addAgent: (item: SynapseAgent) => void;
  removeAgent: (item: SynapseAgent) => void;
  updateAgent: (item: SynapseAgent) => void;
  selectAgent: (item: SynapseAgent) => void;
  fetchAgents: () => Promise<void>;
  setAgents: (agents: SynapseAgent[]) => void;
}

// Define the initial state of the cart store
// Initialize a default state
const initialState: State = {
  userId: null,
  agents: [],
  selected: null,
  isLoading: false,
  error: null,
};

// Create a custom hook to access the cart store
// Create the store with Zustand, combining the status interface and actions
export const useAgentsStore = create<State & Actions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        addAgent: (agent: SynapseAgent) => {
          set((state) => ({
            agents: [...state.agents, agent],
          }));
        },
        removeAgent: (agent: SynapseAgent) => {
          set((state) => ({
            agents: state.agents.filter((item) => item.id !== agent.id),
          }));
        },
        updateAgent: (agent: SynapseAgent) => {
          set((state) => ({
            agents: state.agents.map((item) =>
              item.id === agent.id ? agent : item
            ),
          }));
        },
        selectAgent: (agent: SynapseAgent) => {
          console.log("Selecting agent: ", agent);
          set({ selected: agent });
        },
        setAgents: (agents: SynapseAgent[]) => {
          set({ agents });
        },
        fetchAgents: async () => {
          set({ isLoading: true, error: null });
          try {
            // Replace this with your actual API call
            const response = await fetch("/api/agents");
            if (!response.ok) {
              throw new Error("Failed to fetch agents");
            }
            const agents: SynapseAgent[] = await response.json();
            set({ agents, isLoading: false });
          } catch (error) {
            set({ error: error.message, isLoading: false });
          }
        },
      }),
      {
        name: "synapse-agents-store",
      }
    )
  )
);
