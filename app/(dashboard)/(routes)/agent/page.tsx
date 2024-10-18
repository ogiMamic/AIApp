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
  Trash2,
  Plus,
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
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { SynapseAgent } from "@/lib/interfaces/SynapseAgent";
import { toast } from "sonner";

export default function AgentPage() {
  const [selectedKnowledge, setSelectedKnowledge] = useState<string | null>(
    null
  );
  const { knowledges, setKnowledges } = useKnowledgesStore();
  const [error, setError] = useState<string | null>(null);
  const [isClientSide, setIsClientSide] = useState(false);

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
  const {
    agents,
    selected,
    addAgent,
    updateAgent,
    removeAgent,
    setAgents,
    setSelected,
  } = useAgentsStore();

  const [isDialogOpen, setDialogOpen] = useState(false);
  const toggleDialog = () => setDialogOpen(!isDialogOpen);

  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [anweisungen, setAnweisungen] = useState("");
  const [customCommand, setCustomCommand] = useState("");
  const [messages, setMessages] = useState<
    CreateChatCompletionRequestMessage[]
  >([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  useEffect(() => {
    setIsClientSide(true);
    fetchKnowledges();
    fetchAgents();
  }, []);

  useEffect(() => {
    if (selected) {
      setName(selected.name);
      setDescription(selected.description || "");
      setAnweisungen(selected.anweisungen || "");
      setSelectedKnowledge(selected.knowledgeId || null);
      setUploadedFiles(selected.files || []);
    } else {
      setName("");
      setDescription("");
      setAnweisungen("");
      setSelectedKnowledge(null);
      setUploadedFiles([]);
    }
  }, [selected]);

  const fetchKnowledges = async () => {
    try {
      const response = await axios.get("/api/knowledge");
      if (Array.isArray(response.data)) {
        setKnowledges(response.data);
      }
    } catch (error) {
      console.error("Error fetching knowledges:", error);
      toast.error("Failed to fetch knowledges. Please refresh the page.");
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await axios.get("/api/agent");
      if (Array.isArray(response.data)) {
        setAgents(response.data);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
      toast.error("Failed to fetch agents. Please refresh the page.");
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

    try {
      setIsLoading(true);
      const response = await axios.post("/api/knowledge", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.id) {
        const newFile = { id: response.data.id, name: file.name };
        setUploadedFiles((prev) => [...prev, newFile]);
        setFile(null);
        if (selected) {
          updateAgent({
            ...selected,
            files: [...(selected.files || []), newFile],
          });
        }
        toast.success("File uploaded successfully");
      } else {
        toast.error("Failed to upload file. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(
        "An error occurred while uploading the file. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFile = async (fileId: string) => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/knowledge`, { data: { id: fileId } });
      setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
      if (selected) {
        updateAgent({
          ...selected,
          files: (selected.files || []).filter((file) => file.id !== fileId),
        });
      }
      toast.success("File removed successfully");
    } catch (error) {
      console.error("Error removing file:", error);
      toast.error(
        "An error occurred while removing the file. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCustomCommand = () => {
    if (customCommand && selected) {
      updateAgent({
        ...selected,
        customCommands: [...(selected.customCommands || []), customCommand],
      });
      setCustomCommand("");
      toast.success("Custom command added successfully");
    }
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
          setMessages((current) => [
            ...current,
            userMessage,
            { role: "assistant", content: response.data.response },
          ]);
        } else {
          toast.error(
            response.data.error ||
              "An error occurred while generating the response."
          );
        }
      } else {
        toast.error(
          "No agent selected. Please select an agent before generating."
        );
      }
      form.reset();
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(
        "An error occurred while processing your request. Please try again."
      );
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  const handleSave = async () => {
    if (selected) {
      try {
        setIsLoading(true);
        const response = await axios.put(`/api/agent/${selected.id}`, {
          name,
          description,
          instructions: anweisungen,
          model: selected.model || "gpt-4-turbo-preview",
          knowledgeId: selectedKnowledge,
        });
        if (response.data) {
          const updatedAgent = {
            ...selected,
            name,
            description,
            anweisungen,
            knowledgeId: selectedKnowledge,
          };
          updateAgent(updatedAgent);
          setSelected(updatedAgent);
          toast.success("Agent updated successfully");
          router.refresh();
        } else {
          toast.error("Failed to update agent. Please try again.");
        }
      } catch (error) {
        console.error("Error saving agent:", error);
        toast.error(
          "An error occurred while saving the agent. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error("No agent selected. Please select an agent before saving.");
    }
  };

  const handleSelectAgent = (agent: SynapseAgent | null) => {
    setSelected(agent);
    if (agent) {
      setName(agent.name);
      setDescription(agent.description || "");
      setAnweisungen(agent.anweisungen || "");
      setSelectedKnowledge(agent.knowledgeId || null);
      setUploadedFiles(agent.files || []);
    } else {
      setName("");
      setDescription("");
      setAnweisungen("");
      setSelectedKnowledge(null);
      setUploadedFiles([]);
    }
    setMessages([]);
  };

  const handleDeleteAgent = async () => {
    if (selected) {
      try {
        setIsLoading(true);
        const response = await axios.delete(`/api/agent/${selected.id}`);
        if (response.status === 200) {
          removeAgent(selected.id);
          setSelected(null);
          fetchAgents(); // Refresh the list after deletion
          toast.success("Agent deleted successfully");
        } else {
          toast.error("Failed to delete agent. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting agent:", error);
        toast.error(
          "An error occurred while deleting the agent. Please try again."
        );
      } finally {
        setIsLoading(false);
        setIsConfirmDeleteOpen(false);
      }
    }
  };

  const handleCreateAgent = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await axios.post("/api/agent", {
        name,
        instructions: anweisungen,
        tools: [], // Add tools if needed
        tool_resources: [], // Add tool resources if needed
        model: "gpt-4-turbo-preview",
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
        setSelected(newAgent);
        fetchAgents(); // Refresh the list after creation
        toast.success("Agent created successfully");
      } else {
        toast.error("Failed to create agent.");
      }
    } catch (error) {
      console.error("Error creating agent:", error);
      toast.error(
        "An error occurred while creating the agent. Please try again."
      );
    } finally {
      setIsLoading(false);
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

  if (!isClientSide) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <Heading
        title="Agents"
        description="Manage your AI agents"
        icon={UserPlus}
        iconColor="text-blue-700"
        bgColor="bg-blue-700/10"
      />
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="col-span-1 lg:col-span-3">
          <ListAgents agents={agents} onSelectAgent={handleSelectAgent} />
        </div>
        <div className="col-span-1 lg:col-span-9">
          <Card className="h-full">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {selected
                    ? `Edit Agent: ${selected.name}`
                    : "Create New Agent"}
                </h2>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsHelpDialogOpen(true)}
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                  {selected && (
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => setIsConfirmDeleteOpen(true)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="agentName">Name</Label>
                  <Input
                    id="agentName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter agent name"
                  />
                </div>
                <div>
                  <Label htmlFor="agentDescription">Description</Label>
                  <Textarea
                    id="agentDescription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what this agent does"
                  />
                </div>
                <div>
                  <Label htmlFor="agentInstructions">Instructions</Label>
                  <Textarea
                    id="agentInstructions"
                    value={anweisungen}
                    onChange={(e) => setAnweisungen(e.target.value)}
                    placeholder="Provide instructions for the agent"
                    className="h-32"
                  />
                </div>
                <div>
                  <Label htmlFor="knowledgeSelect">Knowledge Base</Label>
                  <Select
                    value={selectedKnowledge || undefined}
                    onValueChange={setSelectedKnowledge}
                  >
                    <SelectTrigger id="knowledgeSelect">
                      <SelectValue placeholder="Select a knowledge base" />
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
                <div>
                  <Label htmlFor="fileUpload">Upload Document</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="fileUpload"
                      type="file"
                      onChange={handleFileChange}
                    />
                    <Button onClick={uploadFile} disabled={!file || isLoading}>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Upload"
                      )}
                    </Button>
                  </div>
                </div>
                {uploadedFiles.length > 0 && (
                  <div>
                    <Label>Uploaded Files</Label>
                    <ul className="mt-2 space-y-2">
                      {uploadedFiles.map((file) => (
                        <li
                          key={file.id}
                          className="flex items-center justify-between"
                        >
                          <span>{file.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(file.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <Label htmlFor="customCommand">Add Custom Command</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="customCommand"
                      value={customCommand}
                      onChange={(e) => setCustomCommand(e.target.value)}
                      placeholder="Enter custom command"
                    />
                    <Button
                      onClick={handleAddCustomCommand}
                      disabled={!customCommand || !selected}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
                {selected &&
                  selected.customCommands &&
                  selected.customCommands.length > 0 && (
                    <div>
                      <Label>Custom Commands</Label>
                      <ul className="mt-2 space-y-2">
                        {selected.customCommands.map((command, index) => (
                          <li
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <span>{command}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                updateAgent({
                                  ...selected,
                                  customCommands:
                                    selected.customCommands.filter(
                                      (_, i) => i !== index
                                    ),
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                <div>
                  <Label htmlFor="avatar">Avatar</Label>
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
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              {selected ? (
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              ) : (
                <Button onClick={handleCreateAgent} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Create Agent"
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
      <Card className="mt-4">
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-4">Test Agent</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        disabled={isLoading || !selected}
                        placeholder={
                          selected
                            ? "Ask your agent a question..."
                            : "Select an agent to test"
                        }
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isLoading || !selected}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Generate"
                )}
              </Button>
            </form>
          </Form>
          {isLoading && (
            <div className="p-4 rounded-lg w-full flex items-center justify-center bg-muted">
              <Loader />
            </div>
          )}
          {messages.length === 0 && !isLoading && (
            <Empty
              label={
                selected
                  ? "No conversation started."
                  : "Select an agent to start testing."
              }
            />
          )}
          <div className="space-y-4 mt-4 max-h-[calc(100vh-400px)] overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "p-4 w-full flex items-start gap-x-4 rounded-lg",
                  message.role === "user"
                    ? "bg-white border border-black/10"
                    : "bg-muted"
                )}
              >
                {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                <ReactMarkdown className="text-sm overflow-hidden leading-7">
                  {message.content || ""}
                </ReactMarkdown>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Dialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>What is an Agent?</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            An agent is an AI-powered entity designed to perform specific tasks
            or provide information based on its training and knowledge base. In
            this context, agents are created to assist with various processes
            and answer questions related to their specialized domain.
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
            These processes help in creating a tailored AI assistant that can
            efficiently handle specific tasks or provide accurate information in
            its designated area of expertise.
          </DialogDescription>
          <DialogFooter>
            <Button onClick={() => setIsHelpDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this agent? This action cannot be
            undone.
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAgent}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
