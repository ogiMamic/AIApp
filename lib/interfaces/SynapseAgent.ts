export interface SynapseAgent {
  id: string;
  name: string;
  description: string;
  anweisungen: string;
  instructions: string;
  openai_assistant_id: string;
  actions?: string[];
}
