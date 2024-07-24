"use client";
import axios from "axios";
import * as z from "zod";
import { UserPlus } from "lucide-react";
import { Heading } from "@/components/headling";
import { useForm } from "react-hook-form";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown } from "lucide-react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CreateChatCompletionRequestMessage } from "openai/resources/chat";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
import { BotAvatar } from "@/components/bot-avatar";
import { Textarea } from "@/components/ui/textarea";
import ListAgents from "@/components/agents/list-agents";
import { useAgentsStore } from "@/store/agentsStore/useAgentsStore";
import { useCustomStore } from "@/store/customStore/useCustomStore";
import { useKnowledgesStore } from "@/store/knowledgesStore/useKnowledgesStore"; // Import the knowledge store
import AgentForm from "@/components/AgentForm";
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
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import React from "react";

const AgentPage = () => {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const { selectedItems, clearSelectedItems } = useCustomStore();
  const { selected, updateAgent } = useAgentsStore();
  const { knowledges } = useKnowledgesStore(); // Get knowledges from the store

  const [isDialogOpen, setDialogOpen] = useState(false);
  const toggleDialog = () => setDialogOpen(!isDialogOpen);

  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [anweisungen, setAnweisungen] = useState("");

  const [messages, setMessages] = useState<
    CreateChatCompletionRequestMessage[]
  >([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userMessage: CreateChatCompletionRequestMessage = {
        role: "user",
        content: values.prompt,
      };
      const newMessages = [...messages, userMessage];

      const response = await axios.post("/api/code", {
        messages: newMessages,
      });

      setMessages((current) => [...current, userMessage, response.data]);
      form.reset();
    } catch (error: any) {
      console.log(error);
    } finally {
      router.refresh();
    }
  };

  useEffect(() => {
    if (selected) {
      setName(selected.name);
      setDescription(selected.description);
      setAnweisungen(selected.anweisungen);
    }
  }, [selected]);

  const handleCreateAction = () => {
    if (!selected || selectedItems.length === 0) {
      console.log("No agent selected or no items selected");
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

  const handleSave = () => {
    if (selected) {
      updateAgent({
        ...selected,
        name,
        description,
        anweisungen,
      });
    }
  };

  return (
    <>
      <div className="mt-0 w-full grid grid-cols-12 divide-gray-200 flex-col divide-x divide-y">
        <ListAgents />
        <div className="pt-12 flex-col lg:col-span-9 bg-gray-0 p-2 rounded-lg">
          <div>
            <Heading
              title="Create Agent"
              description="Create Agent and create actions for Agent´s knowledge."
              icon={UserPlus}
              iconColor="text-blue-700"
              bgColor="bg-blue-700/10"
            />
            <div className="px-4 lg:px-8">
              <h5>{selected?.name}</h5>
              <div>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="mt-6 rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
                  >
                    <FormField
                      name="prompt"
                      render={({ field }) => (
                        <FormItem className="col-span-12 lg:col-span-10">
                          <FormControl className="m-0 p-0">
                            <Input
                              defaultValue={selected?.name}
                              className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                              disabled={isLoading}
                              placeholder="Simple toggle button using react hooks."
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      className="col-span-12 lg:col-span-2 w-full"
                      disabled={isLoading}
                    >
                      Generate
                    </Button>
                  </form>
                </Form>
              </div>
              <div className="mt-8 w-full grid grid-cols-12 divide-gray-200 gap-16 flex-col">
                <div className="mt-4 flex-col lg:col-span-6">
                  <div className="flex-col">
                    <label
                      htmlFor="agentDescription"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Name
                    </label>
                    <Input
                      id="agentName"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full"
                      placeholder="Wie soll sich dieser Agent nennen?"
                    />
                    <label
                      htmlFor="agentDescription"
                      className="mt-8 block text-sm font-medium text-gray-700"
                    >
                      Beschreibung
                    </label>
                    <Input
                      id="agentDescription"
                      name="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1 w-full"
                      placeholder="Füge eine kurze Beschreibung hinzu, was dieser Agent macht."
                    />
                  </div>
                  <div className="mt-4 flex-col">
                    <label
                      htmlFor="agentDescription"
                      className="mt-8 block text-sm font-medium text-gray-700"
                    >
                      Anweisungen
                    </label>
                    <Textarea
                      id="agentAnweisungen"
                      name="anweisungen"
                      value={anweisungen}
                      onChange={(e) => setAnweisungen(e.target.value)}
                      className="mt-1 w-full h-25"
                      placeholder="Was macht dieser Customer Agent? Wie verhält er sich? Was sollte er vermeiden zu tun?"
                    />
                    <div className="mt-4 col-span-full">
                      <label
                        htmlFor="photo"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Foto
                      </label>
                      <div className="mt-2 flex items-center gap-x-3">
                        <svg
                          className="h-12 w-12 text-gray-300"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                            clip-rule="evenodd"
                          />
                        </svg>
                        <button
                          type="button"
                          className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                          Change
                        </button>
                      </div>
                    </div>

                    <label
                      htmlFor="agentDescription"
                      className="mt-8 mb-2 block text-sm font-medium text-gray-700"
                    >
                      Wissen
                    </label>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-[200px] justify-between mt-2"
                        >
                          {value
                            ? knowledges.find(
                                (knowledge) => knowledge.id === value
                              )?.name
                            : "Knowledge auswählen..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder="Knowledge suchen..." />
                          <CommandEmpty>No Knowledge found.</CommandEmpty>
                          <CommandGroup>
                            {knowledges.map((knowledge) => (
                              <CommandItem
                                key={knowledge.id}
                                value={knowledge.id}
                                onSelect={(currentValue) => {
                                  setValue(currentValue);
                                }}
                              >
                                {knowledge.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              <div className="mt-6 mb-8 flex items-center justify-end gap-x-6">
                <button
                  type="button"
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  Löschen
                </button>
                <button
                  type="button"
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSave}
                  type="submit"
                  className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Speichern
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AgentPage;
