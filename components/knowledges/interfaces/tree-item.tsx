export interface TreeItem {
    id: string;
    name: string;
    children?: TreeItem[];
    content?: any; // can be folder or SynapseKnowledge
  }