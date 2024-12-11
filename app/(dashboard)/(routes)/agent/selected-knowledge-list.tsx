import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, X } from 'lucide-react';

interface SelectedKnowledgeListProps {
  items: { id: string; name: string }[];
  onRemoveItem: (id: string) => void;
}

export const SelectedKnowledgeList: React.FC<SelectedKnowledgeListProps> = ({
  items,
  onRemoveItem,
}) => {
  return (
    <div className="space-y-2">
      {items.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">
          No items selected
        </p>
      ) : (
        items.map(item => (
          <div
            key={item.id}
            className="flex items-center justify-between p-2 rounded-md hover:bg-accent group"
          >
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm">{item.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100"
              onClick={() => onRemoveItem(item.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))
      )}
    </div>
  );
};