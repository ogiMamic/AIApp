"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SynapseAgent } from "@/lib/interfaces/SynapseAgent";
import { useAgentsStore } from "@/store/agentsStore/useAgentsStore";
import { toast } from "sonner";
import axios from "axios";
import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";

interface ListAgentsProps {
  onSelectAgent: (agent: SynapseAgent | null) => void;
}

const ListAgents: React.FC<ListAgentsProps> = ({ onSelectAgent }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingAgent, setIsDeletingAgent] = useState(false);
  const { agents, setAgents, selected, removeAgent, addAgent } =
    useAgentsStore();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/agent", {
        action: "list",
      });
      if (response.data.success) {
        const newAgents = response.data.assistants.map((assistant: any) => ({
          id: assistant.id,
          name: assistant.name,
          description: assistant.description,
          openai_assistant_id: assistant.id,
        }));
        setAgents(newAgents);
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

  const deleteAgent = async (agentId: string) => {
    setIsDeletingAgent(true);
    try {
      const response = await axios.post("/api/agent", {
        action: "delete",
        agentId: agentId,
      });
      if (response.data.success) {
        removeAgent(agentId);
        if (selected && selected.id === agentId) {
          onSelectAgent(null);
        }
        toast.success("Agent deleted successfully");
        // Fetch agents immediately after successful deletion
        await fetchAgents();
      } else {
        throw new Error(response.data.error || "Failed to delete agent");
      }
    } catch (error: any) {
      console.error("Error deleting agent:", error);
      toast.error(`Failed to delete agent: ${error.message}`);
    } finally {
      setIsDeletingAgent(false);
    }
  };

  const createAgent = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/agent", {
        action: "create",
        name: `New Agent ${Date.now()}`,
        description: "AI Assistant",
        instructions: "You are a helpful AI assistant.",
        model: "gpt-4-turbo-preview",
      });

      if (response.data.success) {
        const newAgent: SynapseAgent = {
          id: response.data.assistant.id,
          name: response.data.assistant.name,
          description: response.data.assistant.description,
          openai_assistant_id: response.data.assistant.id,
        };
        addAgent(newAgent);
        onSelectAgent(newAgent);
        toast.success("Agent Created", {
          description: "You have successfully created the agent",
        });
        // Fetch agents immediately after successful creation
        await fetchAgents();
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

  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <h2 className="text-xl font-bold mb-4">Agents</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading agents...</span>
          </div>
        ) : (
          <ul className="space-y-2">
            {agents.map((agent) => (
              <li
                key={agent.id}
                className="flex items-center justify-between p-2 hover:bg-gray-100 rounded transition-colors duration-200"
              >
                <span
                  className="font-medium cursor-pointer"
                  onClick={() => onSelectAgent(agent)}
                >
                  {agent.name || "Unnamed Agent"}
                </span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the agent from both our system and the OpenAI
                        dashboard.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteAgent(agent.id)}
                        disabled={isDeletingAgent}
                      >
                        {isDeletingAgent ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Delete"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </li>
            ))}
          </ul>
        )}
        {agents.length === 0 && !isLoading && (
          <p className="text-center py-4 text-gray-500">No agents found</p>
        )}
        <Button
          className="w-full mt-4 bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white font-semibold"
          onClick={createAgent}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "+ Create new Agent"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ListAgents;
