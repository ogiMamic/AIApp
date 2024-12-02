export interface SynapseKnowledge {
  id: string;
  name: string;
  description: string;
  anweisungen: string;
  actions?: string[];
  parentId?: string;
  agents: string[];
}
