"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import ListItem from "./list-item";
import { SynapseKnowledge } from "@/lib/interfaces/SynapseKnowledge";
import { useKnowledgesStore } from "@/store/knowledgesStore/useKnowledgesStore";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ListKnowledges = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [coll, setColl] = useState<SynapseKnowledge[]>([]);
  const { addKnowledge, knowledges } = useKnowledgesStore();

  const createKnowledge = async () => {
    setIsLoading(true);
    //TODO: Implement create knowledge
    const id = Math.random().toString(36).substr(2, 9);
    const knowledge: SynapseKnowledge = {
      id: id,
      name: "Knowledge´s Name " + id,
      description: "Vertriebsmitarbeiter",
    };

    addKnowledge(knowledge);
    toast.success("Knowledge Created", {
      description: "You have successfully created the knowledge",
    });
    // setColl([...coll, knowledge]);
    setIsLoading(false);
  };

  return (
    <div className="pt-12 flex-col lg:col-span-3 bg-gray-50 p-0">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button
            className="p-6 w-full"
            disabled={isLoading}
            onClick={DropdownMenu}
          >
            + Create new Knowledge
          </Button>
          Open
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem>Team</DropdownMenuItem>
          <DropdownMenuItem>Subscription</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="p-4 mt-auto"></div>
      <ul role="list" className="divide-y divide-gray-100">
        {knowledges.map((knowledge) => (
          <ListItem key={knowledge.id} knowledge={knowledge} />
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
    </div>
  );
};

export default ListKnowledges;
