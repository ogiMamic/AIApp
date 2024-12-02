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
import Tree from "./knowledges-tree";
import SearchInput from "./SearchInput";

let data = {
  tree: [
    {
      id: "1",
      name: "Knowledges",
      children: [],
    },
    {
      id: "5",
      name: "Folder 2",
      children: [
        {
          id: "2",
          name: "Folder 1",
          children: [
            { id: "3", name: "Subfolder 1" },
            { id: "4", name: "Subfolder 2" },
          ],
        },
      ],
    },
  ],
};

const transformToTreeStructure = (
  items: SynapseKnowledge[]
): (string | any[])[] => {
  const buildTree = (parentId: string | undefined): (string | any[])[] => {
    const children = items.filter((item) => item.parentId === parentId);
    if (children.length === 0) return [];

    return children.map((child) => {
      const subItems: (string | any[])[] = buildTree(child.id);
      return [child.name, ...subItems];
    });
  };

  return buildTree(undefined);
};

function moveItem(
  tree: TreeItem[],
  itemId: string,
  newFolderId: string
): { success: boolean; updatedTree: TreeItem[] } {
  let itemToMove: TreeItem | null = null;
  let itemRemoved = false;

  // Helper function to remove item from its current location
  function removeItem(items: TreeItem[]): TreeItem[] {
    return items.filter((item) => {
      if (item.id === itemId) {
        itemToMove = {
          ...item,
          children: item.children ? [...item.children] : undefined,
        };
        return false;
      }
      if (item.children) {
        item.children = removeItem(item.children);
        if (item.children.length === 0) {
          delete item.children;
        }
      }
      return true;
    });
  }

  // Helper function to add item to new folder
  function addItem(items: TreeItem[]): boolean {
    for (let item of items) {
      if (item.id === newFolderId) {
        if (!item.children) {
          item.children = [];
        }
        item.children.push(itemToMove!);
        return true;
      }
      if (item.children && addItem(item.children)) {
        return true;
      }
    }
    return false;
  }

  // Create a deep copy of the tree to avoid mutating the original
  let updatedTree = JSON.parse(JSON.stringify(tree));

  // Remove the item from its current location
  updatedTree = removeItem(updatedTree);
  itemRemoved = itemToMove !== null;

  // If item was found and removed, try to add it to the new folder
  if (itemRemoved && itemToMove) {
    if (!addItem(updatedTree)) {
      // If new folder wasn't found, add the item back to its original location
      updatedTree.push(itemToMove);
      return { success: false, updatedTree: tree }; // Return original tree if move failed
    }
    return { success: true, updatedTree };
  }

  return { success: false, updatedTree: tree }; // Return original tree if item wasn't found
}

const ListKnowledges = ({
  onSelectAction,
}: {
  onSelectAction: (
    action: string,
    file?: File,
    parentFolderId?: string
  ) => void;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] =
    useState(false);
  const [folderName, setFolderName] = useState("");
  const [parentFolderId, setParentFolderId] = useState<string | undefined>();
  const { knowledges, addKnowledge } = useKnowledgesStore();
  const [items, setItems] = useState<any[]>(data.tree);

  const handleCreateFolder = () => {
    if (folderName.trim()) {
      const newFolder: SynapseKnowledge = {
        id: `${Math.random()}`,
        name: folderName,
        description: "",
        anweisungen: "",
        parentId: parentFolderId || undefined,
        agents: [],
      };
      const folder = { name: folderName, children: [] };
      setItems((prevItems) => {
        const updatedItems = [...prevItems];
        const parent = updatedItems.find(
          (item: any) => item.id === parentFolderId
        );
        if (parent) {
          parent.children.push(folder);
        } else {
          updatedItems.push(folder);
        }
        return updatedItems;
      });
      addKnowledge(newFolder);
      setFolderName("");
      setParentFolderId(undefined);
      setIsDialogOpen(false);
      setIsCreateFolderDialogOpen(false);
      toast.success("Folder created successfully!");
    } else {
      toast.error("Folder name cannot be empty!");
    }
  };

  const treeStructure = transformToTreeStructure(
    knowledges as SynapseKnowledge[]
  );

  useEffect(() => {
    axios.get("/api/knowledge").then((response) => {
      const knowledges = response.data.map((o: any) => {
        return {
          name: `Knowledge ${o.id}`,
          id: o.id,
          content: o,
        };
      });

      var knowledgesFolder = data.tree.find(
        (item: any) => item.name === "Knowledges"
      );

      if (knowledgesFolder) {
        knowledgesFolder.children = knowledges;
      }

      setItems(data.tree);
    });
  }, []);

  const onCreateFolder = (parentId: string) => {
    console.log("parentId", parentId);
  };

  const onMove = (folderId: string, itemId: string) => {
    console.log("onMove => folderId", folderId);
    console.log("onMove => itemId", itemId);
    const { success, updatedTree } = moveItem(items, itemId, folderId);
    setItems(updatedTree);
  };

  return (
    <div className="pt-6 pb-4 px-4 flex-col lg:col-span-3 bg-gray-50 h-full overflow-auto">
      <div className="pl-6 pr-6 pb-4">
        <Button className="w-full mb-4" onClick={() => setIsDialogOpen(true)}>
          + Create new Knowledge
        </Button>
      </div>
      <div>
        <div className="mb-4">
          <SearchInput
            items={items}
            onSelect={(item) => {
              // Handle the selected item here
              console.log("Selected item:", item);
              // You might want to expand the folder or navigate to the file
              // depending on the item type
            }}
          />
        </div>
      </div>
      <div>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Files</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item, index) => (
                  <Tree
                    key={index}
                    item={item}
                    data={data}
                    onCreateFolder={onCreateFolder}
                    onSelect={onSelectAction}
                    onMove={onMove}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white p-8 rounded shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Create New Folder</h2>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <div className="flex justify-end">
              <Button onClick={handleCreateFolder}>Create</Button>
              <Button onClick={() => setIsDialogOpen(false)} className="ml-2">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      {isCreateFolderDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white p-8 rounded shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Create New Folder</h2>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <div className="flex justify-end">
              <Button onClick={handleCreateFolder}>Create</Button>
              <Button
                onClick={() => setIsCreateFolderDialogOpen(false)}
                className="ml-2"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListKnowledges;
