import { SynapseAgent } from "./SynapseAgent";

export interface SynapseKnowledge {
  id: string;
  name: string;
  description: string;
  anweisungen: string;
  actions?: string[];
  parentId?: string; // Optional property to indicate the parent folder
  agents: SynapseAgent[];
}
