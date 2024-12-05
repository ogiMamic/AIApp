"use client";

import React, { use, useEffect, useState } from "react";
import axios from "axios";
import { DatabaseZap } from "lucide-react";
import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import ListKnowledge from "@/components/knowledges/list-knowledges";
import { useKnowledgesStore } from "@/store/knowledgesStore/useKnowledgesStore";
import { DataTable } from "./_components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { create } from "domain";
import ActionButtons from "./_components/action-buttons";

type KnowledgeDocument = {
  id: string;
  content: string;
  metadata: any;
  userId: string;
  created_at: string;
};

const KnowledgePage = () => {
  const { knowledges, selected, updateKnowledge, addKnowledge, setKnowledges } =
    useKnowledgesStore();
  // Remove or comment out these lines
  // const [name, setName] = useState("");
  // const [description, setDescription] = useState("");
  // const [anweisungen, setAnweisungen] = useState("");
  const [tableData, setTableData] = useState<KnowledgeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/knowledge");
      const documents = response.data.map((doc: any) => ({
        id: doc.id,
        content: doc.content,
        metadata: doc.metadata,
        userId: doc.userId,
        created_at: doc.created_at,
      }));
      setTableData(documents);
      setKnowledges(documents);
    } catch (error) {
      console.error("Failed to fetch documents", error);
      setError("Failed to fetch documents. Please try again.");
      toast.error("Failed to fetch documents. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    // if (selected) {
    //   setName(selected.name);
    //   setDescription(selected.description);
    //   setAnweisungen(selected.anweisungen);
    // }
  }, [selected]);

  const handleSave = async () => {
    if (selected) {
      try {
        const response = await axios.post("/api/knowledge", {
          id: selected.id,
          //content: selected.content,
          parentId: selected.parentId,
          name: selected.name,
          description: selected.description,
          anweisungen: selected.anweisungen,
        });
        if (response.data) {
          updateKnowledge({
            ...selected,
            name: response.data.name,
            description: response.data.description,
            anweisungen: response.data.anweisungen,
            parentId: response.data.parentId,
          });
          fetchDocuments(); // Refresh the table data
        }
      } catch (error) {
        console.error("Failed to update knowledge", error);
        toast.error("Failed to update knowledge");
      }
    }
  };

  const handleDropdownSelect = async (
    action: string,
    file?: File,
    parentFolderId?: string
  ) => {
    if (action === "newDocument") {
      try {
        const response = await axios.post("/api/knowledge", {
          name: "New Document",
          description: "",
          anweisungen: "",
          parentId: parentFolderId,
        });
        const newDocument = response.data;
        addKnowledge(newDocument);
        fetchDocuments();
        toast.success("New document created successfully");
      } catch (error) {
        console.error("Failed to create new document", error);
        toast.error("Failed to create new document");
      }
    } else if (action === "uploadDocument" && file) {
      handleUploadDocument(file, parentFolderId);
    }
  };

  const handleUploadDocument = async (file: File, parentFolderId?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", file.name);
    formData.append("description", "");
    formData.append("anweisungen", "");
    if (parentFolderId) {
      formData.append("parentId", parentFolderId);
    }

    try {
      const response = await axios.post("/api/knowledge", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const savedDocument = response.data;
      addKnowledge(savedDocument);
      fetchDocuments();
      toast.success("Document uploaded successfully");
    } catch (error) {
      console.error("Failed to upload document", error);
      toast.error("Failed to upload document");
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await axios.delete(`/api/knowledge`, { data: { id } });
      setTableData((prevData) => prevData.filter((doc) => doc.id !== id));
      fetchDocuments();
      toast.success("Document deleted successfully");
    } catch (error) {
      console.error("Failed to delete document", error);
      toast.error("Failed to delete document");
    }
  };

  const columnsWithActions: ColumnDef<KnowledgeDocument>[] = [
    {
      id: "select",
      header: ({ table }: { table: any }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      ),
      cell: ({ row }: { row: any }) => (
        <div className="px-1">
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
          />
        </div>
      ),
    },
    { id: "name", header: "Name", accessorKey: "name" },
    { id: "owner", header: "Owner", accessorKey: "owner" },
    // { id: "content", header: "Content", accessorKey: "content" },
    { id: "size", header: "Size", accessorKey: "size" },
    // { id: "created_at", header: "Created At", accessorKey: "created_at" },
    { id: "last_edited", header: "Last edited", accessorKey: "last_edited" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const document = row.original;
        return (
          <Button
            onClick={() => handleDeleteDocument(document.id)}
            variant="destructive"
            size="sm"
          >
            Delete
          </Button>
        );
      },
    },
  ];

  return (
    <div className="mt-0 w-full grid grid-cols-1 lg:grid-cols-12 gap-4 divide-y lg:divide-y-0 divide-gray-200">
      <div className="col-span-12 md:col-span-4 lg:col-span-3 rounded-lg">
        <ListKnowledge onSelectAction={handleDropdownSelect} />
      </div>

      <div className="col-span-12 md:col-span-8 lg:col-span-9 bg-gray-0 p-4 rounded-lg">
        <Heading
          title="Knowledge Management"
          description="Manage your knowledge documents and folders."
          icon={DatabaseZap}
          iconColor="text-green-700"
          bgColor="bg-green-700/10"
        />
        <div className="mt-4 px-4 lg:px-8">
          <h5 className="text-lg font-semibold">
            {selected?.name || "No document selected"}
          </h5>
          <ActionButtons />
          {isLoading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4">
              <DataTable columns={columnsWithActions} data={tableData} />
              {selected && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label
                      htmlFor="content"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Content
                    </label>
                    <textarea
                      id="content"
                      value={selected.name}
                      onChange={(e) =>
                        updateKnowledge({
                          ...selected,
                          name: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>
                  {/* <div>
                    <label
                      htmlFor="metadata"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Metadata
                    </label>
                    <textarea
                      id="metadata"
                      value={JSON.stringify(selected.metadata, null, 2)}
                      onChange={(e) =>
                        updateKnowledge({
                          ...selected,
                          metadata: JSON.parse(e.target.value),
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div> */}
                  <div className="flex justify-end space-x-2">
                    <Button
                      onClick={() => handleDeleteDocument(selected.id)}
                      variant="destructive"
                    >
                      Delete
                    </Button>
                    <Button onClick={handleSave} variant="default">
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgePage;
