import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KnowledgeTree } from './knowledge-tree';
import { SelectedKnowledgeList } from './selected-knowledge-list';

export interface KnowledgeItem {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'site';
  children?: KnowledgeItem[];
}

interface KnowledgeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (selectedItems: string[]) => void;
  knowledges: { id: string; name: string }[];
  initialSelected?: string | null;
}

export const KnowledgeDialog: React.FC<KnowledgeDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  knowledges,
  initialSelected,
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>(
    initialSelected ? [initialSelected] : []
  );
  const [activeTab, setActiveTab] = useState('all');

  const handleSave = () => {
    onSave(selectedItems);
    onOpenChange(false);
  };

  const handleToggleItem = (id: string) => {
    setSelectedItems(prev => {
      const exists = prev.includes(id);
      if (exists) {
        return prev.filter(itemId => itemId !== id);
      }
      return [...prev, id];
    });
  };

  const handleRemoveItem = (id: string) => {
    setSelectedItems(prev => prev.filter(itemId => itemId !== id));
  };

  const selectedKnowledges = knowledges.filter(k => selectedItems.includes(k.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Knowledge Base</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList>
            <TabsTrigger value="all" className="flex-1">All Knowledges</TabsTrigger>
            <TabsTrigger value="selected" className="flex-1">Selected Knowledges</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="flex-1 overflow-auto border rounded-md p-4 mt-4">
            <KnowledgeTree
              items={knowledges}
              selectedItems={selectedItems}
              onToggleItem={handleToggleItem}
            />
          </TabsContent>
          
          <TabsContent value="selected" className="flex-1 overflow-auto border rounded-md p-4 mt-4">
            <SelectedKnowledgeList
              items={selectedKnowledges}
              onRemoveItem={handleRemoveItem}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};