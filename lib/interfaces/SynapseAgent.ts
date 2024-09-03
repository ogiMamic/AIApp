export interface SynapseAgent {
  id: string;
  name: string;
  description: string;
  anweisungen: string;
  openai_assistant_id: string;
  instructions: string;
  customCommands?: string[];
  actions?: string[];
  model?: string;
  knowledgeId?: string;
}
