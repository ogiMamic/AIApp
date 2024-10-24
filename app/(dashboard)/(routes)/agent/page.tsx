"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, UserPlus, Trash2, HelpCircle } from "lucide-react";
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

interface SynapseAgent {
  id: string;
  name: string;
  description: string;
  anweisungen: string;
  knowledgeId?: string;
  model?: string;
  customCommands?: string[];
}

interface Knowledge {
  id: string;
  name: string;
}

export default function AgentPage() {
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
    } else {
      setName("");
      setDescription("");
      setAnweisungen("");
      setSelectedKnowledge(null);
    }
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
        });
        if (response.data.success) {
          toast.success("Agent updated successfully");
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
        model: "gpt-4-turbo-preview", // Add the model here
      });
      if (response.data.success) {
        toast.success("Agent created successfully");
        fetchAgents();
        handleSelectAgent(null);
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
