"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Loader2,
  UserPlus,
  Trash2,
  HelpCircle,
  Send,
  Paperclip,
} from "lucide-react";
import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BotAvatar } from "@/components/bot-avatar";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface SynapseAgent {
  id: string;
  name: string;
  description: string;
  anweisungen: string;
  knowledgeId?: string;
  model?: string;
  customCommands?: string[];
  openai_assistant_id?: string;
}

interface Knowledge {
  id: string;
  name: string;
}

interface IMessage {
  role: "user" | "assistant";
  content: string;
}

export default function AgentPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<SynapseAgent[]>([]);
  const [knowledges, setKnowledges] = useState<Knowledge[]>([]);
  const [selected, setSelected] = useState<SynapseAgent | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [anweisungen, setAnweisungen] = useState("");
  const [selectedKnowledge, setSelectedKnowledge] = useState<string | null>(
    null
  );
  const [customCommand, setCustomCommand] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const [testQuestion, setTestQuestion] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTestingAgent, setIsTestingAgent] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [openAIFileIds, setOpenAIFileIds] = useState<string[]>([]);
  const [vectorStoreId, setVectorStoreId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAgents();
    fetchKnowledges();
  }, []);

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/agent", { action: "list" });
      if (response.data.success) {
        setAgents(response.data.assistants);
      } else {
        toast.error("Failed to fetch agents");
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
      toast.error("An error occurred while fetching agents");
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSelectAgent = (agent: SynapseAgent | null) => {
    setSelected(agent);
    if (agent) {
      setName(agent.name);
      setDescription(agent.description || "");
      setAnweisungen(agent.anweisungen || "");
      setSelectedKnowledge(agent.knowledgeId || null);
      // Ensure openai_assistant_id is set
      if (!agent.openai_assistant_id) {
        toast.error(
          "This agent doesn't have an Assistant ID. Please save it first."
        );
      }
    } else {
      setName("");
      setDescription("");
      setAnweisungen("");
      setSelectedKnowledge(null);
    }
    setTestQuestion("");
    setMessages([]);
    setThreadId(null);
  };

  const handleSave = async () => {
    if (selected) {
      try {
        setIsLoading(true);
        const response = await axios.post("/api/agent", {
          action: "update",
          agentId: selected.id,
          name,
          description,
          instructions: anweisungen,
          knowledgeId: selectedKnowledge,
          model: selected.model || "gpt-4-turbo-preview",
        });
        if (response.data.success) {
          toast.success("Agent updated successfully");
          setSelected({
            ...selected,
            name,
            description,
            anweisungen,
            knowledgeId: selectedKnowledge,
            openai_assistant_id: response.data.assistant.id,
          });
          fetchAgents();
        } else {
          toast.error("Failed to update agent");
        }
      } catch (error) {
        console.error("Error saving agent:", error);
        toast.error("An error occurred while saving the agent");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCreate = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/agent", {
        action: "create",
        name,
        description,
        instructions: anweisungen,
        knowledgeId: selectedKnowledge,
        model: "gpt-4-turbo-preview",
      });
      if (response.data.success) {
        toast.success("Agent created successfully");
        setSelected(response.data.assistant);
        fetchAgents();
      } else {
        toast.error("Failed to create agent");
      }
    } catch (error) {
      console.error("Error creating agent:", error);
      toast.error("An error occurred while creating the agent");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (selected) {
      try {
        setIsLoading(true);
        const response = await axios.post("/api/agent", {
          action: "delete",
          agentId: selected.id,
        });
        if (response.data.success) {
          toast.success("Agent deleted successfully");
          fetchAgents();
          handleSelectAgent(null);
        } else {
          toast.error("Failed to delete agent");
        }
      } catch (error) {
        console.error("Error deleting agent:", error);
        toast.error("An error occurred while deleting the agent");
      } finally {
        setIsLoading(false);
        setIsConfirmDeleteOpen(false);
      }
    }
  };

  const handleAddCustomCommand = () => {
    if (customCommand && selected) {
      const updatedAgent = {
        ...selected,
        customCommands: [...(selected.customCommands || []), customCommand],
      };
      setSelected(updatedAgent);
      setCustomCommand("");
      toast.success("Custom command added successfully");
    }
  };

  const handleNewChat = () => {
    setThreadId(null);
    setMessages([]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("/api/upload", formData);
      if (response.data.success) {
        setOpenAIFileIds([...openAIFileIds, response.data.fileId]);
        setVectorStoreId(response.data.vectorStoreId);
        toast.success("File uploaded successfully");
      } else {
        setUploadError("Failed to upload file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadError("An error occurred while uploading the file");
    }
  };

  const handleTestAgent = async () => {
    if (!selected || !testQuestion) return;

    setIsTestingAgent(true);
    try {
      if (!threadId) {
        handleNewChat();
      }

      const userMessage: IMessage = {
        role: "user",
        content: testQuestion,
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);

      if (!selected.openai_assistant_id) {
        toast.error(
          "Agent or Assistant ID is missing. Please save the agent first."
        );
        return;
      }

      if (file && openAIFileIds.length === 0) {
        await handleUpload();
      }

      const response = await axios.post("/api/conversation", {
        messages: newMessages,
        agent: {
          id: selected.id,
          name: name, // Use current state value
          description: description, // Use current state value
          instructions: anweisungen, // Use current state value
          openai_assistant_id: selected.openai_assistant_id,
        },
        threadId: threadId,
        knowledge_id: selectedKnowledge,
        openAIFileIds: openAIFileIds,
        vectorStoreId: vectorStoreId,
        fileAnalysis: file ? true : false,
      });

      if (response.data.threadId) {
        setThreadId(response.data.threadId);
      }

      const botMessage: IMessage =
        response.data.conversation[response.data.conversation.length - 1];
      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);

      setTestQuestion("");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Error testing agent:", error);
      setUploadError(
        error.response?.data?.error ||
          "An error occurred during the conversation"
      );
    } finally {
      setIsTestingAgent(false);
      router.refresh();
    }
  };

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
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2">Agent List</h3>
              {agents.map((agent) => (
                <Button
                  key={agent.id}
                  variant={selected?.id === agent.id ? "secondary" : "ghost"}
                  className="w-full justify-start mb-1"
                  onClick={() => handleSelectAgent(agent)}
                >
                  {agent.name}
                </Button>
              ))}
              <Button
                className="w-full mt-4 bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white"
                onClick={() => handleSelectAgent(null)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Agent
              </Button>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-1 lg:col-span-6">
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
                              onClick={() => {
                                const updatedCommands =
                                  selected.customCommands?.filter(
                                    (_, i) => i !== index
                                  );
                                setSelected({
                                  ...selected,
                                  customCommands: updatedCommands,
                                });
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
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
                <Button onClick={handleCreate} disabled={isLoading}>
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

        <div className="col-span-1 lg:col-span-3">
          <Card className="h-full">
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2">Test Agent</h3>
              {selected ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="testQuestion">Ask a question</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="testQuestion"
                        value={testQuestion}
                        onChange={(e) => setTestQuestion(e.target.value)}
                        placeholder="Enter your question here"
                      />
                      <Button
                        onClick={handleTestAgent}
                        disabled={isTestingAgent || !testQuestion.trim()}
                      >
                        {isTestingAgent ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="fileUpload">Upload File (optional)</Label>
                    <Input
                      id="fileUpload"
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      ref={fileInputRef}
                    />
                  </div>
                  <div className="space-y-4 mt-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={cn(
                          "p-4 rounded-lg flex items-start space-x-4",
                          message.role === "user" ? "bg-blue-50" : "bg-green-50"
                        )}
                      >
                        {message.role === "user" ? (
                          <UserAvatar />
                        ) : (
                          <BotAvatar />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1">
                            {message.role === "user" ? "You" : "AI"}
                          </p>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {uploadError && (
                    <p className="text-red-500 text-sm mt-2">{uploadError}</p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Select an agent to test</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
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
              <li>Selecting a knowledge base</li>
              <li>Creating custom commands for the agent</li>
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
              onClick={handleDelete}
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
