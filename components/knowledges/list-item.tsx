import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { useKnowledgesStore } from "@/store/knowledgesStore/useKnowledgesStore";
import { SynapseKnowledge } from "@/lib/interfaces/SynapseKnowledge";
type Props = {
  knowledge: SynapseKnowledge;
};

const ListItem = ({ knowledge }: Props) => {
  const { selectKnowledge } = useKnowledgesStore();
  return (
    <li className="flex justify-start items-center py-5 px-0 hover:bg-gray-100 p-8">
      <Button
        variant="ghost"
        title="Show Details"
        onClick={() => {
          console.log("clicked on agent", knowledge?.name);
          selectKnowledge(knowledge);
        }}
        className="inline-flex items-center justify-start whitespace-nowrap rounded-md w-full"
      >
        <div className="flex min-w-0">
          <div className="min-w-0 flex-auto">
            <p className="text-left	text-sm font-semibold leading-6 text-gray-900">
              {knowledge?.name}
            </p>
            <p className="text-left	mt-1 truncate text-xs leading-5 text-gray-500">
              {knowledge?.description}
            </p>
          </div>
        </div>
      </Button>
    </li>
  );
};

export default ListItem;
