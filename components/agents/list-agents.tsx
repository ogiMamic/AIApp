"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import ListItem from "./list-item";
import { SynapseAgent } from "@/lib/interfaces/SynapseAgent";
import { useAgentsStore } from "@/store/agentsStore/useAgentsStore";
import { toast } from "sonner";

const ListAgents = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [coll, setColl] = useState<SynapseAgent[]>([]);
  const { addAgent, agents } = useAgentsStore();

  const createAgent = async () => {
    setIsLoading(true);
    //TODO: Implement create agent
    const id = Math.random().toString(36).substr(2, 9);
    const agent: SynapseAgent = {
      id: id,
      name: "Agent´s Name " + id,
      description: "Vertriebsmitarbeiter",
    };

    addAgent(agent);
    toast.success("Agent Created", {
      description: "You have successfully created the agent",
    });
    // setColl([...coll, agent]);
    setIsLoading(false);
  };

  return (
    <div className="pt-12 flex-col lg:col-span-3 bg-gray-50 p-0">
      <ul role="list" className="divide-y divide-gray-100">
        {agents.map((agent) => (
          <ListItem key={agent.id} agent={agent} />
        ))}

        {/* <li className="flex justify-between gap-x-6 py-5 hover:bg-gray-100 p-8">
          <div className="flex min-w-0 gap-x-4">
            <div className="min-w-0 flex-auto">
              <p className="text-sm font-semibold leading-6 text-gray-900">
                Umsatz
              </p>
              <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                Einnahmen aus Verkauf
              </p>
            </div>
          </div>
        </li> */}
        {/* <li className="flex justify-between gap-x-6 py-5 hover:bg-gray-100 p-8">
          <div className="flex min-w-0 gap-x-4">
            <div className="min-w-0 flex-auto">
              <p className="text-sm font-semibold leading-6 text-gray-900">
                Kosten
              </p>
              <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                Ausgaben des Unternehmens
              </p>
            </div>
          </div>
        </li>
        <li className="flex justify-between gap-x-6 py-5 hover:bg-gray-100 p-8">
          <div className="flex min-w-0 gap-x-4">
            <div className="min-w-0 flex-auto">
              <p className="text-sm font-semibold leading-6 text-gray-900">
                G&V
              </p>
              <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                Finanzbericht über Gewinn und Verlust
              </p>
            </div>
          </div>
        </li>
        <li className="flex justify-between gap-x-6 py-5 hover:bg-gray-100 cursor:pointer p-8">
          <div className="flex min-w-0 gap-x-4">
            <div className="min-w-0 flex-auto">
              <p className="text-sm font-semibold leading-6 text-gray-900">
                Auftragseingang
              </p>
              <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                Volumen der Kundenbestellungen
              </p>
            </div>
          </div>
        </li> */}
      </ul>
      <div className="p-4 mt-auto">
        <Button
          className="p-6 w-full"
          disabled={isLoading}
          onClick={createAgent}
        >
          + Create new Agent
        </Button>
      </div>
    </div>
  );
};

export default ListAgents;
