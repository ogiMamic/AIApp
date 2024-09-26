"use client";
import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import ListItem from "./list-item";
import { SynapseAgent } from "@/lib/interfaces/SynapseAgent";
import { useAgentsStore } from "@/store/agentsStore/useAgentsStore";
import { toast } from "sonner";
import axios from "axios";

const ListAgents = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { addAgent, agents, setAgents } = useAgentsStore();

  const openAIAgents = agents.filter((agent) => agent.openai_assistant_id);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/agent", { action: "list" });
      if (response.data.success) {
        setAgents(
          response.data.assistants.map((assistant: any) => ({
            id: assistant.id,
            name: assistant.name,
            description: assistant.description,
            openai_assistant_id: assistant.id,
          }))
        );
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
        toast.success("Agent Created", {
          description: "You have successfully created the agent",
        });
        fetchAgents(); // Refresh the list of agents
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
    <div className="pt-6 pl-4 pr-4 flex-col lg:col-span-3 bg-gray-50 p-0">
      <h2 className="text-1xl font-bold pl-3 divide-y pb-4">Agents</h2>

      {isLoading ? (
        <div className="text-center py-4">Loading agents...</div>
      ) : (
        <ul role="list" className="divide-y divide-gray-100">
          {openAIAgents.map((agent) => (
            <ListItem key={agent.id} agent={agent} />
          ))}
          {openAIAgents.length === 0 && (
            <li className="text-center py-4 text-gray-500">No agents found</li>
          )}
        </ul>
      )}

      <div className="p-0 mt-4">
        <Button
          className="p-4 w-full text-[#0F3443] bg-[#38ef7d] hover:bg-[#06b348]"
          disabled={isLoading}
          onClick={createAgent}
        >
          {isLoading ? "Creating..." : "+ Create new Agent"}
        </Button>
      </div>
    </div>
  );
};

export default ListAgents;
