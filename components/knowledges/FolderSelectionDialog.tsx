import React, { useState, useEffect, useCallback } from 'react';
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
  // Filter function to get only folders (items with children property)
  const getFolders = (items: TreeItem[]): TreeItem[] => {
    return items.filter(item => Array.isArray(item.children) && item.children.length > 0);
  };
  
  const hasSubfolders = (item: TreeItem): boolean => {
    return item.children?.some(child => child.children !== undefined) || false;
  };

  const folders = getFolders(items);

  return (
    <ul className="space-y-2">
      {folders.map((item) => {
        const hasChildren = hasSubfolders(item);
        
        return (
          <li key={item.id}>
            <Collapsible className="[&[data-state=open]>div>button:first-child>svg.transition-transform:first-child]:rotate-90">
              <div className="flex items-center justify-start w-full">
                {hasChildren && (
                  <CollapsibleTrigger className="flex items-center text-left">
                    <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200" />
                  </CollapsibleTrigger>
                )}
                <Button 
                  variant="ghost" 
                  className={`flex-1 justify-start ${selectedFolderId === item.id ? 'bg-gray-200' : ''} ${!hasChildren ? 'ml-4' : ''}`}
                  onClick={() => onSelect(item.id)}
                >
                  <Folder className="mr-2 h-4 w-4" />
                  {item.name}
                </Button>
              </div>
              {hasChildren && item.children && (
                <CollapsibleContent className="pl-6 mt-1">
                  <FolderSelector 
                    items={item.children} 
                    onSelect={onSelect} 
                    selectedFolderId={selectedFolderId} 
                  />
                </CollapsibleContent>
              )}
            </Collapsible>
          </li>
        );
      })}
    </ul>
  );
}

export function FolderSelectionDialog({ isOpen, onClose, onSelect, items }: FolderSelectionDialogProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(isOpen);

  const handlePointerEvents = useCallback((shouldDisable: boolean) => {
    if (shouldDisable) {
      document.body.style.setProperty('pointer-events', 'none', 'important');
    } else {
      document.body.style.removeProperty('pointer-events');
    }
  }, []);

  useEffect(() => {
    setModalOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (modalOpen) {
      handlePointerEvents(true);
    } else {
      const timer = setTimeout(() => {
        handlePointerEvents(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [modalOpen, handlePointerEvents]);

  const handleSelect = (folderId: string) => {
    setSelectedFolderId(folderId);
  };

  const handleMove = () => {
    if (selectedFolderId) {
      onSelect(selectedFolderId);
      onClose();
    }
  };

  const handleOpenChange = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={modalOpen} onOpenChange={handleOpenChange}>
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