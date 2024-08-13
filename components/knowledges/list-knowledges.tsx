"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SynapseKnowledge } from "@/lib/interfaces/SynapseKnowledge";
import { useKnowledgesStore } from "@/store/knowledgesStore/useKnowledgesStore";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Trash,
  ChevronRight,
  ChevronDown,
  Folder,
  FileText,
} from "lucide-react";
import axios from "axios";

const ListKnowledges = ({
  onSelectAction,
}: {
  onSelectAction: (
    action: string,
    file?: File,
    parentFolderId?: string
  ) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [fileInputId, setFileInputId] = useState<string | null>(null);
  const {
    addKnowledge,
    knowledges,
    selectKnowledge,
    selected,
    removeKnowledge,
    setKnowledges,
  } = useKnowledgesStore();
  const [parentFolderId, setParentFolderId] = useState<string | undefined>(
    undefined
  );
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    axios.get("/api/knowledge").then((response) => {
      setKnowledges(response.data);
    });
  }, [setKnowledges]);

  useEffect(() => {
    if (knowledges.length > 0 && !selected) {
      selectKnowledge(knowledges[0]);
    }
  }, [knowledges, selectKnowledge, selected]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const createKnowledge = async (name: string, parentId?: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/knowledge", {
        name,
        description: parentId ? "" : "Vertriebsmitarbeiter",
        anweisungen: "",
        parentId: parentId || undefined,
      });
      const knowledge = response.data;
      addKnowledge(knowledge);
      toast.success("Knowledge Created", {
        description: "You have successfully created the knowledge",
      });
    } catch (error) {
      console.error("Failed to create knowledge", error);
      toast.error("Failed to create knowledge");
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
      setFolderName("");
      setParentFolderId(undefined);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    parentId?: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name);
      formData.append("description", "");
      formData.append("anweisungen", "");
      formData.append("parentId", parentId || "");

      // Convert file to base64 and await upload to supabase storage
      var base64 = await getBase64(file);
      formData.append("base64", base64 as string);

      try {
        const response = await axios.post("/api/knowledge", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        const savedDocument = response.data;
        addKnowledge(savedDocument);
        toast.success("Document Uploaded", {
          description: "You have successfully uploaded the document",
        });
      } catch (error) {
        console.error("Failed to upload document", error);
        toast.error("Failed to upload document");
      }
    }
  };

  const getBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleCreateFolder = () => {
    if (folderName.trim()) {
      createKnowledge(folderName, parentFolderId);
      setIsDialogOpen(false);
      setFolderName("");
      setParentFolderId(undefined);
    } else {
      toast.error("Folder name cannot be empty");
    }
  };

  const openCreateFolderDialog = (parentId?: string) => {
    setIsDialogOpen(true);
    setParentFolderId(parentId);
  };

  const handleDeleteFolder = async (id: string) => {
    try {
      await axios.delete(`/api/knowledge`, { data: { id } });
      removeKnowledge(id);
      toast.success("Folder Deleted", {
        description: "You have successfully deleted the folder",
      });
    } catch (error) {
      console.error("Failed to delete folder", error);
      toast.error("Failed to delete folder");
    }
  };

  const handleSelectItem = (knowledge: SynapseKnowledge) => {
    selectKnowledge(knowledge);
  };

  const renderFolderTree = (items: SynapseKnowledge[], parentId?: string) => {
    return items
      .filter((item) => item.parentId === parentId)
      .map((item) => {
        const isFolder = items.some((subItem) => subItem.parentId === item.id);
        return (
          <li key={item.id}>
            <div
              className={`flex justify-between items-center pl-4 pr-4 pt-1 pb-1 cursor-pointer ${
                selected?.id === item.id ? "bg-gray-200 rounded-lg" : ""
              } hover:bg-gray-100`}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectItem(item);
              }}
            >
              <div className="flex items-center">
                {isFolder && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mr-2 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFolder(item.id);
                    }}
                  >
                    {expandedFolders.has(item.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                )}
                {isFolder ? (
                  <Folder className="h-4 w-4 mr-2" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                <span className="text-sm font-semibold leading-6 text-gray-900">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center">
                {isFolder && (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-2 p-0 bg-transparent text-gray-600 hover:text-gray-800 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onSelect={() => openCreateFolderDialog(item.id)}
                        >
                          New Subfolder
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onSelect={() =>
                            document
                              .getElementById(`file-upload-${item.id}`)
                              ?.click()
                          }
                        >
                          New document
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2 p-0 bg-transparent text-red-500 hover:text-red-700 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(item.id);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            {expandedFolders.has(item.id) && (
              <ul className="pl-4">{renderFolderTree(items, item.id)}</ul>
            )}
            <input
              type="file"
              id={`file-upload-${item.id}`}
              className="hidden"
              onChange={(e) => handleFileUpload(e, item.id)}
            />
          </li>
        );
      });
  };

  return (
    <div className="pt-6 pb-4 pl-4 pr-4 flex-col lg:col-span-3 bg-gray-50 p-0 h-full ">
      <DropdownMenu>
        <div className="pl-6 pr-6 pb-4">
          <DropdownMenuTrigger asChild>
            <Button className="p-6 w-full mb-4">+ Create new Knowledge</Button>
          </DropdownMenuTrigger>
        </div>
        <DropdownMenuContent>
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => openCreateFolderDialog()}
          >
            New Folder
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() =>
              onSelectAction("newDocument", undefined, parentFolderId)
            }
          >
            New document
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => document.getElementById("file-upload")?.click()}
          >
            Upload document
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => console.log("Team Selected")}
          >
            Import website
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => console.log("Subscription Selected")}
          >
            Import from SharePoint
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={(e) => handleFileUpload(e)}
      />

      <ul role="list" className="divide-y divide-gray-100">
        {renderFolderTree(knowledges)}
      </ul>

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
              <Button onClick={handleCreateFolder} disabled={isLoading}>
                {isLoading ? "Creating..." : "Create"}
              </Button>
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
