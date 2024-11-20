// Import Zustand library

import { SynapseAgent } from "@/lib/interfaces/SynapseAgent";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface State {
  userId: string | null;
  agents: SynapseAgent[];
  selected: SynapseAgent | null;
  agentsLoading: boolean;
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
  agentsLoading: false,
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
          set({ agentsLoading: true, error: null });
          try {
            console.log("Fetching agents...");
            const response = await fetch("/api/agent", {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            });
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Fetched agents data:", data);
            if (data.success) {
              set({ agents: data.agents, agentsLoading: false, error: null });
            } else {
              throw new Error(data.error || "Failed to fetch agents");
            }
          } catch (error) {
            console.error("Error fetching agents:", error);
            set({
              error:
                error instanceof Error
                  ? error.message
                  : "An unknown error occurred",
              agentsLoading: false,
            });
          }
        },
      }),
      {
        name: "synapse-agents-store",
      }
    )
  )
);
