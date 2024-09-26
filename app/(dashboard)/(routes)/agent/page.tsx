"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import * as z from "zod";
import {
  Loader2,
  UserPlus,
  AlertCircle,
  Check,
  ChevronsUpDown,
  HelpCircle,
} from "lucide-react";
import { Heading } from "@/components/heading";
import { useForm } from "react-hook-form";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CreateChatCompletionRequestMessage } from "openai/resources/chat";
import ReactMarkdown from "react-markdown";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
import { BotAvatar } from "@/components/bot-avatar";
import { Textarea } from "@/components/ui/textarea";
import ListAgents from "@/components/agents/list-agents";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useAgentsStore } from "@/store/agentsStore/useAgentsStore";
import { useCustomStore } from "@/store/customStore/useCustomStore";
import { useKnowledgesStore } from "@/store/knowledgesStore/useKnowledgesStore";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Card, CardFooter } from "@/components/ui/card";

const AgentPage = () => {
  const [selectedKnowledge, setSelectedKnowledge] = useState<string | null>(
    null
  );
  const { knowledges, setKnowledges } = useKnowledgesStore();
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const frameworks = [
    { value: "datei1", label: "Datei 1" },
    { value: "datei2", label: "Datei 2" },
    { value: "datei3", label: "Datei 3" },
    { value: "datei4", label: "Datei 4" },
    { value: "datei5", label: "Datei 5" },
  ];

  const { selectedItems, clearSelectedItems } = useCustomStore();
  const { selected, addAgent, updateAgent, setAgents } = useAgentsStore();

  const [isDialogOpen, setDialogOpen] = useState(false);
  const toggleDialog = () => setDialogOpen(!isDialogOpen);

  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [anweisungen, setAnweisungen] = useState("");
  const [interactionHistory, setInteractionHistory] = useState<
    Array<{ question: string; answer: string }>
  >([]);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [customCommand, setCustomCommand] = useState("");

  const [testMessage, setTestMessage] = useState("");
  const [testResponse, setTestResponse] = useState("");

  const [messages, setMessages] = useState<
    CreateChatCompletionRequestMessage[]
  >([]);

  const [file, setFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ id: string; name: string }>
  >([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await axios.post("/api/agent", { action: "list" });
      if (response.data.success) {
        setAgents(response.data.assistants);
      } else {
        setError("Failed to fetch agents");
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
      setError("An error occurred while fetching agents");
    }
  };

  const UploadedFilesList = () => {
    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Uploaded Files</h3>
        {uploadedFiles.length === 0 ? (
          <p className="text-gray-500">No files uploaded yet.</p>
        ) : (
          <ul className="bg-white rounded-lg border border-gray-200 w-full text-gray-900">
            {uploadedFiles.map((file) => (
              <li
                key={file.id}
                className="px-6 py-2 border-b border-gray-200 w-full rounded-t-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{file.name}</span>
                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  const handleRemoveFile = async (fileId: string) => {
    try {
      await axios.delete(`/api/knowledge`, { data: { id: fileId } });
      setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
    } catch (error) {
      console.error("Error removing file:", error);
      setError("An error occurred while removing the file. Please try again.");
    }
  };

  useEffect(() => {
    const fetchKnowledges = async () => {
      try {
        const response = await axios.get("/api/knowledge");
        if (Array.isArray(response.data)) {
          setKnowledges(response.data);
        }
      } catch (error) {
        console.error("Error fetching knowledges:", error);
        setError("Failed to fetch knowledges. Please refresh the page.");
      }
    };

    fetchKnowledges();
  }, [setKnowledges]);

  useEffect(() => {
    const loadAgentData = async () => {
      setIsLoading(true);
      if (selected) {
        setName(selected.name);
        setDescription(selected.description);
        setAnweisungen(selected.anweisungen);
      }
      setIsLoading(false);
    };

    loadAgentData();
  }, [selected]);

  useEffect(() => {
    if (selected) {
      setName(selected.name);
      setDescription(selected.description);
      setAnweisungen(selected.anweisungen);
      setSelectedKnowledge(selected.knowledgeId);
    }
  }, [selected]);

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCustomCommand = () => {
    if (customCommand && selected) {
      updateAgent({
        ...selected,
        customCommands: [...(selected.customCommands || []), customCommand],
      });
      setCustomCommand("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const uploadFile = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", file.name);
    formData.append("description", description);
    formData.append("anweisungen", anweisungen);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result as string;
      formData.append("base64", base64);

      try {
        const response = await axios.post("/api/knowledge", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data.id) {
          setUploadedFileUrl(response.data.id);
          setUploadedFiles((prev) => [
            ...prev,
            { id: response.data.id, name: file.name },
          ]);
        } else {
          setError("Failed to upload file. Please try again.");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        setError(
          "An error occurred while uploading the file. Please try again."
        );
      }
    };
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setError(null);
      const userMessage: CreateChatCompletionRequestMessage = {
        role: "user",
        content: values.prompt,
      };

      if (selected) {
        const response = await axios.post("/api/agent", {
          action: "generate",
          agentId: selected.id,
          name: selected.name,
          description: selected.description,
          instructions: selected.anweisungen,
          message: values.prompt,
          model: selected.model || "gpt-4-turbo-preview",
          knowledgeId: selected.knowledgeId,
        });

        if (response.data.success) {
          setTestResponse(response.data.response);
          setMessages((current) => [
            ...current,
            userMessage,
            { role: "assistant", content: response.data.response },
          ]);
          setInteractionHistory((prev) => [
            ...prev,
            { question: values.prompt, answer: response.data.response },
          ]);
        } else {
          setError(
            response.data.error ||
              "An error occurred while generating the response."
          );
        }
      } else {
        setError(
          "No agent selected. Please select an agent before generating."
        );
      }
      form.reset();
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setError(
        "An error occurred while processing your request. Please try again."
      );
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  const handleCreateAction = () => {
    if (!selected || selectedItems.length === 0) {
      setError("No agent selected or no items selected");
      return;
    }

    const actionToAdd = selectedItems[0].label;
    const updatedActions = selected.actions
      ? [...selected.actions, actionToAdd]
      : [actionToAdd];

    updateAgent({
      ...selected,
      actions: updatedActions,
    });

    clearSelectedItems();
  };

  const handleSave = async () => {
    if (selected) {
      try {
        const response = await axios.post("/api/agent", {
          action: "update",
          agentId: selected.id,
          name,
          description,
          instructions: anweisungen,
          model: selected.model || "gpt-4-turbo-preview",
          knowledgeId: selectedKnowledge,
        });
        if (response.data.success) {
          updateAgent({
            ...selected,
            name,
            description,
            anweisungen,
            knowledgeId: selectedKnowledge,
          });
          router.refresh();
        } else {
          setError("Failed to update agent. Please try again.");
        }
      } catch (error) {
        console.error("Error saving agent:", error);
        setError("An error occurred while saving the agent. Please try again.");
      }
    } else {
      setError("No agent selected. Please select an agent before saving.");
    }
  };

  const handleCreateAgent = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await axios.post("/api/agent", {
        action: "create",
        name,
        description,
        instructions: anweisungen,
        model: "gpt-4-turbo-preview",
        knowledgeId: selectedKnowledge,
      });

      if (response.data.success) {
        const newAgent = {
          id: response.data.assistant.id,
          name,
          description,
          anweisungen,
          knowledgeId: selectedKnowledge,
          model: "gpt-4-turbo-preview",
          openai_assistant_id: response.data.assistant.id,
        };
        addAgent(newAgent);
        setName("");
        setDescription("");
        setAnweisungen("");
        setSelectedKnowledge(null);
        fetchAgents(); // Refresh the list of agents
      } else {
        setError("Failed to create agent.");
      }
    } catch (error) {
      console.error("Error creating agent:", error);
      setError("An error occurred while creating the agent. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mt-0 w-full grid grid-cols-1 lg:grid-cols-12 gap-y-4 lg:gap-0 divide-gray-200 flex-col divide-y lg:divide-x lg:divide-y-0">
        <div className="lg:col-span-3">
          <ListAgents />
        </div>
        <div className="pt-8 flex-col lg:col-span-9 bg-gray-0 p-0 rounded-lg">
          <div>
            <Heading
              title="Create Agent"
              description="Create Agent and create actions for Agent´s knowladge."
              icon={UserPlus}
              iconColor="text-blue-700"
              bgColor="bg-blue-700/10"
            />
            <div className="px-4 lg:px-8">
              <div className="flex items-center">
                <h5 className="text-lg font-semibold">{selected?.name}</h5>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                  onClick={() => setIsHelpDialogOpen(true)}
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </div>

              <Dialog
                open={isHelpDialogOpen}
                onOpenChange={setIsHelpDialogOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>What is an Agent?</DialogTitle>
                  </DialogHeader>
                  <DialogDescription>
                    An agent is an AI-powered entity designed to perform
                    specific tasks or provide information based on its training
                    and knowledge base. In this context, agents are created to
                    assist with various processes and answer questions related
                    to their specialized domain.
                    <br />
                    <br />
                    The process of creating an agent involves:
                    <ol className="list-decimal list-inside mt-2">
                      <li>Defining the agent's name and description</li>
                      <li>Providing instructions for the agent's behavior</li>
                      <li>Selecting or uploading a knowledge base</li>
                      <li>Creating custom actions for the agent</li>
                      <li>Testing the agent's responses</li>
                    </ol>
                    These processes help in creating a tailored AI assistant
                    that can efficiently handle specific tasks or provide
                    accurate information in its designated area of expertise.
                  </DialogDescription>
                  <DialogFooter>
                    <Button onClick={() => setIsHelpDialogOpen(false)}>
                      Close
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <div className="mt-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-y-8 lg:gap-x-16 flex-col">
                <div className="flex-col lg:col-span-6">
                  <div className="flex-col">
                    <label
                      htmlFor="agentName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Name
                    </label>
                    <Input
                      id="agentName"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full"
                      placeholder="Wie soll sich dieser Agent nennen?"
                    />
                    <label
                      htmlFor="agentDescription"
                      className="mt-8 block text-sm font-medium text-gray-700"
                    >
                      Beschreibung
                    </label>
                    <Input
                      id="agentDescription"
                      name="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1 w-full"
                      placeholder="Füge eine kurze Beschreibung hinzu, was dieser Agent macht."
                    />
                  </div>
                  <div className="mt-4 flex-col">
                    <label
                      htmlFor="agentAnweisungen"
                      className="mt-8 block text-sm font-medium text-gray-700"
                    >
                      Anweisungen
                    </label>
                    <Textarea
                      id="agentAnweisungen"
                      name="anweisungen"
                      value={anweisungen}
                      onChange={(e) => setAnweisungen(e.target.value)}
                      className="mt-1 w-full h-25"
                      placeholder="Was macht dieser Customer Agent? Wie verhält er sich? Was sollte er vermeiden zu tun?"
                    />
                    <div className="mt-4 col-span-full">
                      <label
                        htmlFor="photo"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Avatar
                      </label>
                      <div className="mt-2 flex items-center gap-x-3">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt="Agent Avatar"
                            className="h-12 w-12 rounded-full"
                          />
                        ) : (
                          <svg
                            className="h-12 w-12 text-gray-300"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                          id="avatar-upload"
                        />
                        <label
                          htmlFor="avatar-upload"
                          className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 cursor-pointer"
                        >
                          Change
                        </label>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="customCommand">Add Custom Command</Label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <Input
                          type="text"
                          name="customCommand"
                          id="customCommand"
                          className="rounded-l-md"
                          placeholder="Enter custom command"
                          value={customCommand}
                          onChange={(e) => setCustomCommand(e.target.value)}
                        />
                        <Button
                          type="button"
                          onClick={handleAddCustomCommand}
                          className="rounded-l-none"
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    {selected && selected.customCommands && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700">
                          Custom Commands
                        </h4>
                        <ul className="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200">
                          {selected.customCommands.map((command, index) => (
                            <li
                              key={index}
                              className="flex items-center justify-between py-3"
                            >
                              <span className="text-sm">{command}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedCommands =
                                    selected.customCommands.filter(
                                      (_, i) => i !== index
                                    );
                                  updateAgent({
                                    ...selected,
                                    customCommands: updatedCommands,
                                  });
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="mt-4 flex-col lg:col-span-6">
                      <label
                        htmlFor="knowledgeSelect"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Wähle eine Wissensdatenbank
                      </label>
                      <Select
                        value={selectedKnowledge || undefined}
                        onValueChange={setSelectedKnowledge}
                      >
                        <SelectTrigger
                          id="knowledgeSelect"
                          className="mt-1 w-full"
                        >
                          <SelectValue placeholder="Select a knowledge..." />
                        </SelectTrigger>
                        <SelectContent>
                          {knowledges.map((knowledge) => (
                            <SelectItem key={knowledge.id} value={knowledge.id}>
                              {knowledge.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="fileUpload"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Upload Document
                      </label>
                      <div className="mt-1 flex items-center">
                        <input
                          id="fileUpload"
                          type="file"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                        <label
                          htmlFor="fileUpload"
                          className="cursor-pointer rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                          Choose file
                        </label>
                        <span className="ml-3 text-sm text-gray-500">
                          {file ? file.name : "No file chosen"}
                        </span>
                      </div>
                      <Button
                        onClick={uploadFile}
                        disabled={!file}
                        className="mt-2"
                      >
                        Upload
                      </Button>
                    </div>

                    <UploadedFilesList />

                    <label
                      htmlFor="agentActions"
                      className="mt-8 mb-2 block text-sm font-medium text-gray-700"
                    >
                      Aktionen
                    </label>

                    <Dialog>
                      <DialogTrigger>
                        <button
                          type="button"
                          onClick={toggleDialog}
                          className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                          Neue Aktion erstellen
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Datenquelle auswählen</DialogTitle>
                          <DialogDescription>
                            Wahl der Datenquelle: SQL-Server oder MinIO-Buckets
                          </DialogDescription>
                        </DialogHeader>
                        <Tabs defaultValue="Synapse DB" className="w-[400px]">
                          <TabsList>
                            <TabsTrigger value="Synapse DB">
                              Synapse DB
                            </TabsTrigger>
                            <TabsTrigger value="MinIO">MinIO</TabsTrigger>
                          </TabsList>
                          <TabsContent value="Synapse DB">
                            <Card>
                              <CardFooter>
                                <Popover open={open} onOpenChange={setOpen}>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      aria-expanded={open}
                                      className="w-[200px] justify-between"
                                    >
                                      {value
                                        ? frameworks.find(
                                            (framework) =>
                                              framework.value === value
                                          )?.label
                                        : "Select framework..."}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[200px] p-0">
                                    <Command>
                                      <CommandInput placeholder="Search framework..." />
                                      <CommandEmpty>
                                        No framework found.
                                      </CommandEmpty>
                                      <CommandGroup>
                                        {frameworks.map((framework) => (
                                          <CommandItem
                                            key={framework.value}
                                            value={framework.value}
                                            onSelect={(currentValue) => {
                                              setValue(
                                                currentValue === value
                                                  ? ""
                                                  : currentValue
                                              );
                                              setOpen(false);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                value === framework.value
                                                  ? "opacity-100"
                                                  : "opacity-0"
                                              )}
                                            />
                                            {framework.label}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                              </CardFooter>
                            </Card>
                          </TabsContent>
                          <TabsContent value="MinIO">
                            Change your password here.
                          </TabsContent>
                        </Tabs>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button" onClick={handleCreateAction}>
                              Aktion erstellen
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {selected && selected.actions && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700">
                          Aktionen
                        </h4>
                        <ul className="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200">
                          {selected.actions.map((action, index) => (
                            <li
                              key={index}
                              className="flex items-center justify-between py-3"
                            >
                              <span className="text-sm">{action}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedActions =
                                    selected.actions.filter(
                                      (_, i) => i !== index
                                    );
                                  updateAgent({
                                    ...selected,
                                    actions: updatedActions,
                                  });
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-col lg:col-span-6">
                  <div className="flex-col">
                    <label
                      htmlFor="agentTest"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Test Agent
                    </label>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
                      >
                        <FormField
                          name="prompt"
                          render={({ field }) => (
                            <FormItem className="col-span-12 lg:col-span-10">
                              <FormControl className="m-0 p-0">
                                <Input
                                  className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                                  disabled={isLoading}
                                  placeholder="How do I calculate the radius of a circle?"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Button
                          className="col-span-12 lg:col-span-2 w-full"
                          type="submit"
                          disabled={isLoading}
                          size="icon"
                        >
                          Generate
                        </Button>
                      </form>
                    </Form>
                    {isLoading && (
                      <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
                        <Loader />
                      </div>
                    )}
                    {messages.length === 0 && !isLoading && (
                      <Empty label="No conversation started." />
                    )}
                    <div className="flex flex-col-reverse gap-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.content}
                          className={cn(
                            "p-8 w-full flex items-start gap-x-8 rounded-lg",
                            message.role === "user"
                              ? "bg-white border border-black/10"
                              : "bg-muted"
                          )}
                        >
                          {message.role === "user" ? (
                            <UserAvatar />
                          ) : (
                            <BotAvatar />
                          )}
                          <ReactMarkdown
                            components={{
                              pre: ({ node, ...props }) => (
                                <div className="overflow-auto w-full my-2 bg-black/10 p-2 rounded-lg">
                                  <pre {...props} />
                                </div>
                              ),
                              code: ({ node, ...props }) => (
                                <code
                                  className="bg-black/10 rounded-lg p-1"
                                  {...props}
                                />
                              ),
                            }}
                            className="text-sm overflow-hidden leading-7"
                          >
                            {message.content || ""}
                          </ReactMarkdown>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end space-x-4">
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
                <Button onClick={handleCreateAgent} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Agent"
                  )}
                </Button>
              </div>
              {error && (
                <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AgentPage;
