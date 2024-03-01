import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { SynapseAgent } from "@/lib/interfaces/SynapseAgent";
import { useAgentsStore } from "@/store/agentsStore/useAgentsStore";
type Props = {
  agent: SynapseAgent;
};

const ListItem = ({ agent }: Props) => {
  const { selectAgent } = useAgentsStore();
  return (
    <li className="flex justify-between items-center py-5 px-8 hover:bg-gray-100 p-8">
      <Button
        variant="ghost"
        title="Show Details"
        onClick={() => {
          console.log("clicked on agent", agent?.name);
          selectAgent(agent);
        }}
      >
        <div className="flex min-w-0 gap-x-4">
          <div className="min-w-0 flex-auto">
            <p className="text-sm font-semibold leading-6 text-gray-900">
              {agent?.name}
            </p>
            <p className="mt-1 truncate text-xs leading-5 text-gray-500">
              {agent?.description}
            </p>
          </div>
        </div>
      </Button>
    </li>
  );
};

export default ListItem;
