import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';

interface KnowledgeTreeProps {
  items: { id: string; name: string }[];
  selectedItems: string[];
  onToggleItem: (id: string) => void;
}

export const KnowledgeTree: React.FC<KnowledgeTreeProps> = ({
  items,
  selectedItems,
  onToggleItem,
}) => {
  return (
    <div className="space-y-1">
      {items.map(item => (
        <div
          key={item.id}
          className="flex items-center space-x-2 py-1 px-2 rounded-md hover:bg-accent"
        >
          <Checkbox 
            checked={selectedItems.includes(item.id)} 
            onCheckedChange={() => onToggleItem(item.id)}
          />
          <FileText className="h-4 w-4" />
          <span className="text-sm">{item.name}</span>
        </div>
      ))}
    </div>
  );
};