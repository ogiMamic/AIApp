"use client";
import React, { useEffect, useState } from "react";
import { ChevronRight, File, Folder, MoreVertical, Plus } from "lucide-react";
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
import { FolderSelector } from "./FolderSelector";
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
            <DropdownMenuContent>
            <DropdownMenuItem onSelect={()=>{
                setIsDialogOpen(true);
                setItemToMove(item.id);
                console.log("itemToMove", item);
            }}>Move</DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
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
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
        defaultOpen={item.name === "components" || item.name === "ui"}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            <ChevronRight className="transition-transform" />
            <Folder />
            {item.name}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
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
