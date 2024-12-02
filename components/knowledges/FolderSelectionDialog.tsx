import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronRight, Folder } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

interface TreeItem {
  id: string;
  name: string;
  children?: TreeItem[];
}

interface FolderSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (folderId: string) => void;
  items: TreeItem[];
}

function FolderSelector({ items, onSelect, selectedFolderId }: { items: TreeItem[], onSelect: (folderId: string) => void, selectedFolderId: string | null }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          <Collapsible>
            <CollapsibleTrigger className="flex items-center w-full text-left">
              <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200" />
              <Button 
                variant="ghost" 
                className={`flex-grow justify-start ${selectedFolderId === item.id ? 'bg-gray-200' : ''}`} 
                onClick={() => onSelect(item.id)}
              >
                <Folder className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            </CollapsibleTrigger>
            {item.children && item.children.length > 0 && (
              <CollapsibleContent className="pl-6 mt-1">
                <FolderSelector items={item.children} onSelect={onSelect} selectedFolderId={selectedFolderId} />
              </CollapsibleContent>
            )}
          </Collapsible>
        </li>
      ))}
    </ul>
  );
}

export function FolderSelectionDialog({ isOpen, onClose, onSelect, items }: FolderSelectionDialogProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const handleSelect = (folderId: string) => {
    setSelectedFolderId(folderId);
  };

  const handleMove = () => {
    if (selectedFolderId) {
      onSelect(selectedFolderId);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select destination folder</DialogTitle>
        </DialogHeader>
        <div className="max-h-[300px] overflow-y-auto">
          <FolderSelector items={items} onSelect={handleSelect} selectedFolderId={selectedFolderId} />
        </div>
        <DialogFooter>
          <Button onClick={handleMove} disabled={!selectedFolderId}>
            Move Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
