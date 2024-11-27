"use client";
import React, { useEffect, useState } from "react";
import { ChevronRight, File, Folder, MoreVertical } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SynapseKnowledge } from "@/lib/interfaces/SynapseKnowledge";
import { useKnowledgesStore } from "@/store/knowledgesStore/useKnowledgesStore";
import axios from "axios";

const data = {
  tree: [
    {
      name: "knowledges",
      children: [],
    },
  ],
};

// Helper function to transform the data into a nested tree structure
const transformToTreeStructure = (
  items: SynapseKnowledge[]
): (string | any[])[] => {
  const buildTree = (parentId: string | undefined): (string | any[])[] => {
    const children = items.filter((item) => item.parentId === parentId);
    if (children.length === 0) return [];

    return children.map((child) => {
      // Recursively find children and build the tree structure
      const subItems: (string | any[])[] = buildTree(child.id);
      return [child.name, ...subItems];
    });
  };

  return buildTree(undefined); // Start from root (no parent)
};

// Tree component to render collapsible folder structure
interface TreeItem {
  name: string;
  children?: TreeItem[];
}

function Tree({ item }: { item: TreeItem }) {
  const hasChildren = item.children;

  if (!hasChildren) {
    return (
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
            <DropdownMenuItem>Add to folder</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
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
            {item.children!.length > 0 ? (
              item.children!.map((subItem, index) => (
                <Tree key={index} item={subItem} />
              ))
            ) : (
              <SidebarMenuButton className="pl-4 text-muted-foreground">
                (Empty folder)
              </SidebarMenuButton>
            )}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
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
      setItems((prevItems) => [...prevItems, folder]);
      addKnowledge(newFolder);
      setFolderName("");
      setParentFolderId(undefined);
      setIsDialogOpen(false);
      toast.success("Folder created successfully!");
    } else {
      toast.error("Folder name cannot be empty!");
    }
  };

  // Convert knowledge items into tree structure
  const treeStructure = transformToTreeStructure(knowledges);

  useEffect(() => {
    axios.get("/api/knowledge").then((response) => {
      const knowledges = response.data.map((o:any) => {
        return {
          name: `Knowledge ${o.id}`,
          // Include other properties if needed
          id: o.id,
        };
      });
      console.log("knowledges", knowledges);
      const newData = data.tree.map((o:any) => {
        return {
          name: o.name,
          children: knowledges,
        };
      });
      setItems(newData);
    });
  }, []);

  // useEffect(() => {
  //   if (knowledges.length > 0 && !selected) {
  //     selectKnowledge(knowledges[0]);
  //   }
  // }, [knowledges, selectKnowledge, selected]);

  return (
    <div className="pt-6 pb-4 px-4 flex-col lg:col-span-3 bg-gray-50 h-full overflow-auto">
      <div className="pl-6 pr-6 pb-4">
        <Button className="w-full mb-4" onClick={() => setIsDialogOpen(true)}>
          + Create new Knowledge
        </Button>
      </div>

      <div>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Files</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item, index) => (
                  <Tree key={index} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </div>

      {/* Dialog for creating a new folder */}
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
    </div>
  );
};

export default ListKnowledges;
