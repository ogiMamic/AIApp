"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import * as z from "zod";
import { DatabaseZap } from "lucide-react";
import { Heading } from "@/components/headling";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CreateChatCompletionRequestMessage } from "openai/resources/chat";
import ListKnowledge from "@/components/knowledges/list-knowledges";
import { useKnowledgesStore } from "@/store/knowledgesStore/useKnowledgesStore";
import { useCustomStore } from "@/store/customStore/useCustomStore";
import { DataTable } from "../documents/data-table";

type KnowledgeDocument = {
  id: string;
  name: string;
  description: string;
  anweisungen: string;
  parentId?: string;
};

export const formSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
});

const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    // Assuming handleDropdownSelect handles the file upload action
    handleDropdownSelect("uploadDocument", file);
  }
};

const KnowledgePage = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const { selectedItems, clearSelectedItems } = useCustomStore();
  const { knowledges, selected, updateKnowledge, addKnowledge, setKnowledges } =
    useKnowledgesStore();

  const [isDialogOpen, setDialogOpen] = useState(false);
  const toggleDialog = () => setDialogOpen(!isDialogOpen);

  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [anweisungen, setAnweisungen] = useState("");
  const [messages, setMessages] = useState<
    CreateChatCompletionRequestMessage[]
  >([]);
  const [tableData, setTableData] = useState<KnowledgeDocument[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userMessage: CreateChatCompletionRequestMessage = {
        role: "user",
        content: values.prompt,
      };
      const newMessages = [...messages, userMessage];

      const response = await axios.post("/api/code", {
        messages: newMessages,
      });

      setMessages((current) => [...current, userMessage, response.data]);
      form.reset();
    } catch (error: any) {
      console.log(error);
    } finally {
      router.refresh();
    }
  };

  useEffect(() => {
    if (selected) {
      setName(selected.name);
      setDescription(selected.description);
      setAnweisungen(selected.anweisungen);
    }
  }, [selected]);

  useEffect(() => {
    setTableData(knowledges);
  }, [knowledges]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    axios.get("/api/knowledge").then((response) => {
      const documents = response.data.map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        description: doc.description,
        anweisungen: doc.anweisungen,
      }));
      setTableData(documents);
    });
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get("/api/knowledge");
      const documents = response.data.map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        description: doc.description,
        anweisungen: doc.anweisungen,
      }));
      setTableData(documents);
      setKnowledges(documents);
    } catch (error) {
      console.error("Failed to fetch documents", error);
    }
  };

  const handleCreateAction = () => {
    if (!selected || selectedItems.length === 0) {
      console.log("No agent selected or no items selected");
      return;
    }

    const actionToAdd = selectedItems[0].label;
    const updatedActions = selected.actions
      ? [...selected.actions, actionToAdd]
      : [actionToAdd];

    updateKnowledge({
      ...selected,
      actions: updatedActions,
    });

    clearSelectedItems();
  };

  const handleSave = () => {
    if (selected) {
      updateKnowledge({
        ...selected,
        name,
        description,
        anweisungen,
      });
    }
  };

  const handleDropdownSelect = (
    action: string,
    file?: File,
    parentFolderId?: string
  ) => {
    if (action === "newDocument") {
      const newDocument: KnowledgeDocument = {
        id: `new-${Date.now()}`,
        name: "New Document",
        description: "",
        anweisungen: "",
        parentId: parentFolderId,
      };

      setTableData((prevData) => [...prevData, newDocument]);
    } else if (action === "uploadDocument" && file) {
      handleUploadDocument(file);
    }
  };

  const handleUploadDocument = (file: File) => {
    if (!file) {
      console.error("No file provided");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", file.name);
    formData.append("description", description);
    formData.append("anweisungen", anweisungen);

    console.log("Sending formData:", file);

    // Convert file to base64
    getBase64(file, (base64) => {
      formData.append("base64", base64);

      try {
        axios
          .post("/api/knowledge", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((response) => {
            const savedDocument = response.data;
            setTableData((prevData) => [...prevData, savedDocument]);
            addKnowledge(savedDocument);
          })
          .catch((error) => {
            console.error("Failed to upload document", error);
          });
      } catch (error) {
        console.error("Error during upload:", error);
      }
    });
  };

  const getBase64 = (file: File, callback: (base64: string) => void) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => callback(reader.result as string);
    reader.onerror = (error) => console.error("Error reading file:", error);
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const response = await axios.delete(`/api/knowledge`, {
        data: { id },
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        setTableData((prevData) => prevData.filter((doc) => doc.id !== id));
        console.log("Document deleted successfully");
        fetchDocuments();
      } else {
        console.error("Failed to delete document", response.data);
      }
    } catch (error: any) {
      console.error("Failed to delete document", error);

      if (error.response) {
        console.error("Server Response:", error.response.data);
      } else if (error.request) {
        console.error("Request made but no response received", error.request);
      } else {
        console.error("Error setting up request", error.message);
      }
    }
  };

  const columnsWithActions = [
    {
      id: "select",
      header: ({ table }: { table: any }) => (
        <input
          type="checkbox"
          {...{
            checked: table.getIsAllPageRowsSelected(),
            indeterminate: table.getIsSomePageRowsSelected() ? true : undefined,
            onChange: table.getToggleAllPageRowsSelectedHandler(),
          }}
        />
      ),
      cell: ({ row }: { row: any }) => (
        <div className="px-1">
          <input
            type="checkbox"
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              onChange: row.getToggleSelectedHandler(),
              indeterminate: row.getIsSomeSelected() ? true : undefined,
            }}
          />
        </div>
      ),
    },
    { id: "name", header: "Name", accessorKey: "name" },
    { id: "description", header: "Description", accessorKey: "description" },
    { id: "anweisungen", header: "Anweisungen", accessorKey: "anweisungen" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const document = row.original;
        return (
          <button onClick={() => handleDeleteDocument(document.id)}>
            Delete
          </button>
        );
      },
    },
  ];

  return (
    <>
      <div className="mt-0 w-full grid grid-cols-1 lg:grid-cols-12 gap- divide-gray-200">
        <div className="col-span-12 lg:col-span-3">
          <ListKnowledge onSelectAction={handleDropdownSelect} />
        </div>

        <div className="col-span-12 lg:col-span-9 bg-gray-0 p-4 rounded-lg">
          <Heading
            title="Create Knowledge"
            description="Create Knowledge and create actions for Knowledge´s knowledge."
            icon={DatabaseZap}
            iconColor="text-green-700"
            bgColor="bg-green-700/10"
          />
          <div className="mt-4 px-4 lg:px-8">
            <h5 className="text-lg font-semibold">{selected?.name}</h5>
            <div className="mt-4 grid grid-cols-1 gap-4">
              <DataTable
                className={`w-full`}
                columns={columnsWithActions}
                data={tableData}
              />
              <div className="mt-4 flex flex-col lg:flex-row items-end lg:items-center justify-end gap-4">
                <button
                  type="button"
                  className="text-sm font-semibold text-gray-900"
                >
                  Löschen
                </button>
                <button
                  type="button"
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSave}
                  type="submit"
                  className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Speichern
                </button>
              </div>
              <div className="mt-4">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-blue-600 underline"
                >
                  Upload Document
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default KnowledgePage;
