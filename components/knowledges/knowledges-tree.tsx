"use client";
import React, { useEffect, useState } from "react";
import { ChevronRight, File, Folder, FolderInput, MoreVertical, Plus, TrashIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarRail,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SynapseKnowledge } from "@/lib/interfaces/SynapseKnowledge";
import { useKnowledgesStore } from "@/store/knowledgesStore/useKnowledgesStore";
import axios from "axios";
import { TreeItem } from "./interfaces/tree-item";
import { FolderSelectionDialog } from "./FolderSelectionDialog";

type TreeItemProps = {
  item: TreeItem;
  data: any;
  onCreateFolder: (parentId: string) => void;
  onSelect: (folderId: string) => void;
  onMove: (folderId: string, itemId: string) => void;
};

export default function Tree({
  item,
  onCreateFolder,
  data,
  onSelect,
  onMove,
}: TreeItemProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] =
    useState(false);
  const [parentFolderId, setParentFolderId] = useState<string | undefined>();
  const [folderName, setFolderName] = useState("");

  const [itemToMove, setItemToMove] = useState<string | null>(null);

  const hasChildren = item.children && item.children.length > 0;

  const handleSelectFolder = (folderId: string) => {
    setSelectedFolderId(folderId);
  };

  const handleMove = (folderId: string) => {
    console.log("handleMove => itemToMove", item);
    console.log("handleMove => folderId", folderId);

    if (folderId) {
      console.log(`Moving item ${item.name} to folder ${folderId}`);
      setIsDialogOpen(false);
      setSelectedFolderId(null);
      toast.success(`Moved ${item.name} successfully!`);
      onMove(folderId, item.id);
    }
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setSelectedFolderId(null);
  };

  if (!hasChildren) {
    return (
      <>
        <div className="flex items-center justify-between w-full">
          <SidebarMenuButton
            isActive={item.name === "button.tsx"}
            className="data-[active=true]:bg-transparent flex-grow"
          >
            <File />
            {item.name}
          </SidebarMenuButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="[&>div]:cursor-pointer">
              <DropdownMenuItem
                onSelect={() => {
                  setIsDialogOpen(true);
                  setItemToMove(item.id);
                  console.log("itemToMove", item);
                }}
                className="hover:bg-gray-100"
              >
                <FolderInput size="16"  />
                <span>Move</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-100">
                <TrashIcon size="16" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <FolderSelectionDialog
          isOpen={isDialogOpen}
          onClose={handleClose}
          onSelect={handleMove}
          items={data.tree}
        />
      </>
    );
  }

  return (
    <SidebarMenuItem>
      <Collapsible
        className="group/collapsible [&[data-state=open]>div>button:first-child>svg.transition-transform:first-child]:rotate-90"
        defaultOpen={item.name === "components" || item.name === "ui"}
      >
        <div className="flex items-center">
          <CollapsibleTrigger asChild className="w-auto p-2">
            <SidebarMenuButton>
              <ChevronRight className="transition-transform" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <Button variant="ghost" className="flex items-center gap-2 flex-1 justify-start px-2">
            <Folder />
            {item.name}
          </Button>
        </div>

        <CollapsibleContent>
          <SidebarMenuSub className="pr-0 mr-0">
            {item.children?.map((subItem) => (
              <Tree
                data={data}
                key={subItem.id}
                item={subItem}
                onCreateFolder={onCreateFolder}
                onSelect={onSelect}
                onMove={onMove}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}
