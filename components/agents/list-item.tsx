import React from "react";
import { Button } from "../ui/button";
import { SynapseAgent } from "@/lib/interfaces/SynapseAgent";
import { useAgentsStore } from "@/store/agentsStore/useAgentsStore";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  agent: SynapseAgent;
};

const ListItem = ({ agent }: Props) => {
  const { selectAgent, removeAgent, selected } = useAgentsStore();

  console.log("Selected Agent: ", selected); // Dodaj ovu liniju

  const handleSelect = () => {
    selectAgent(agent);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Sprečava selektovanje agenta prilikom klika na delete dugme
    if (confirm(`Are you sure you want to delete agent "${agent.name}"?`)) {
      removeAgent(agent); // Koristimo removeAgent funkciju iz store-a
      toast.success("Agent Deleted", {
        description: `Agent "${agent.name}" was successfully deleted.`,
      });
    }
  };

  return (
    <li
      className={cn(
        "flex justify-between items-center py-3 px-3 hover:bg-gray-100 w-full rounded-md cursor-pointer",
        selected?.id === agent.id
          ? "bg-[#38ef7d] text-[#0F3443]"
          : "bg-white text-gray-900"
      )}
      onClick={handleSelect} // Promenjena linija da koristi handleSelect funkciju
    >
      <div className="flex min-w-0 gap-x-4 items-center w-full">
        <div className="min-w-0 flex-auto">
          <p className="text-left text-sm font-semibold leading-6">
            {agent.name}
          </p>
          <p className="text-left mt-1 truncate text-xs leading-5 text-gray-500">
            {agent.description}
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={handleDelete}
        className="ml-4 text-red-600 flex-shrink-0"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </li>
  );
};

export default ListItem;
