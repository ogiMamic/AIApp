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
import AgentForm from "@/components/AgentForm";
import { SUPPORTED_NATIVE_MODULES } from "next/dist/build/webpack/plugins/middleware-plugin";
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
  const frameworks = [
    {
      value: "datei1",
      label: "Datei 1",
    },
    {
      value: "datei2",
      label: "Datei 2",
    },
    {
      value: "datei3",
      label: "Datei 3",
    },
    {
      value: "datei4",
      label: "Datei 4",
    },
    {
      value: "datei5",
      label: "Datei 5",
    },
  ];

  const { selectedItems, clearSelectedItems } = useCustomStore();
  const { selected, updateAgent } = useAgentsStore();

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
      // TODO: Open Pro Modal
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
              description="Create Agent and create actions for Agent´s knowladge."
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
                    className="
                    mt-6 rounded-lg
                    border
                    w-full
                    p-4
                    px-3
                    md:px-6
                    focus-within:shadow-sm
                    grid
                    grid-cols-12
                    gap-2
                    "
                  >
                    <FormField
                      name="prompt"
                      render={({ field }) => (
                        <FormItem className="col-span-12 lg:col-span-10">
                          <FormControl className="m-0 p-0">
                            <Input
                              defaultValue={selected?.name}
                              className="border-0 outline-none
                                        focus-visible:ring-0
                                        focus-visible:ring-transparent"
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
                  <div className="flex-col ">
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
                      // Stellen Sie sicher, dass Sie value und onChange hinzufügen, um den State zu verwalten
                      // value={agentInfo.description}
                      // onChange={handleAgentInfoChange}
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
                      // Stellen Sie sicher, dass Sie value und onChange hinzufügen, um den State zu verwalten
                      // value={agentInfo.description}
                      // onChange={handleAgentInfoChange}
                    />
                  </div>
                  <div className="mt-4 flex-col ">
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
                      className="mt-1 w-full h-25 "
                      placeholder="Was macht dieser Customer Agent? Wie verhält er sich? Was sollte er vermeiden zu tun?"
                      // Stellen Sie sicher, dass Sie value und onChange hinzufügen, um den State zu verwalten
                      // value={agentInfo.description}
                      // onChange={handleAgentInfoChange}
                    />
                    <div className="mt-4 col-span-full ">
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
                    {/* <label
                      htmlFor="agentDescription"
                      className="mt-8 block text-sm font-medium text-gray-700"
                    >
                      Vorschläge für Aufforderungen
                    </label>
                    <Input
                      id="agentDescription"
                      name="description"
                      className="mt-1 w-full"
                      placeholder="Welche Fragen würdest du dem Benutzer vorschlagen, an den Agent zu stellen?"
                      // Stellen Sie sicher, dass Sie value und onChange hinzufügen, um den State zu verwalten
                      // value={agentInfo.description}
                      // onChange={handleAgentInfoChange}
                    /> */}
                    {/*        <label
                      htmlFor="wissenName"
                      className="mt-8 block text-lg font-semibold text-gray-700"
                    >
                      Wissen
                    </label>
                    <label
                      htmlFor="wissenDescription"
                      className=" mt-1 mb-6 block text-sm font-medium text-gray-700"
                    >
                      Durch Hochladen von Dateien nutzt der Assistent diese
                      Inhalte für bessere Antworten.
                    </label>
                    */}

                    <label
                      htmlFor="agentDescription"
                      className="mt-8 mb-2 block text-sm font-medium text-gray-700"
                    >
                      Aktionen
                    </label>

                    <Dialog>
                      <DialogTrigger>
                        <button
                          type="button"
                          onClick={toggleDialog}
                          className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                          Neue Aktion erstellen
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Datenquelle auswählen</DialogTitle>
                          <DialogDescription>
                            Wahl der Datenquelle: SQL-Server oder MinIO-Buckets
                          </DialogDescription>
                        </DialogHeader>
                        <Tabs defaultValue="Synapse DB" className="w-[400px]">
                          <TabsList>
                            <TabsTrigger value="Synapse DB">
                              GO Synapse Database
                            </TabsTrigger>
                            <TabsTrigger value="minIO">minIO</TabsTrigger>
                          </TabsList>
                          <TabsContent className="pt-4" value="Synapse DB">
                            <label className="ml-1">Wähle eine Tabelle</label>
                            <br></br>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={open}
                                  className="w-[200px] justify-between mt-2"
                                >
                                  {value
                                    ? frameworks.find(
                                        (framework) => framework.value === value
                                      )?.label
                                    : "Tabelle auswählen..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[200px] p-0">
                                <Command>
                                  <CommandInput placeholder="Tabelle suchen..." />
                                  <CommandEmpty>No Backet found.</CommandEmpty>
                                  <CommandGroup>
                                    {frameworks.map((framework) => (
                                      <CommandItem
                                        key={framework.value}
                                        value={framework.value}
                                        onSelect={(currentValue) => {
                                          setValue(
                                            currentValue === value
                                              ? ""
                                              : currentValue
                                          );
                                          setOpen(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            value === framework.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {framework.label}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </Command>
                              </PopoverContent>
                            </Popover>{" "}
                          </TabsContent>
                          <TabsContent className="pt-4" value="minIO">
                            <label className="ml-1">Wähle eine Datei</label>{" "}
                            <br></br>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={open}
                                  className="w-[200px] justify-between mt-2"
                                >
                                  {value
                                    ? frameworks.find(
                                        (framework) => framework.value === value
                                      )?.label
                                    : "Datei auswählen..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[200px] p-0">
                                <Command>
                                  <CommandInput placeholder="Datei suchen..." />
                                  <CommandEmpty>No Backet found.</CommandEmpty>
                                  <CommandGroup>
                                    {frameworks.map((framework) => (
                                      <CommandItem
                                        key={framework.value}
                                        value={framework.value}
                                        onSelect={(currentValue) => {
                                          setValue(
                                            currentValue === value
                                              ? ""
                                              : currentValue
                                          );
                                          setOpen(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            value === framework.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {framework.label}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </TabsContent>
                        </Tabs>
                        <DialogFooter className="sm:justify-end">
                          <DialogClose asChild>
                            <Button type="button" variant="ghost">
                              Abbrechen
                            </Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button
                              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                              type="button"
                              variant="default"
                              onClick={handleCreateAction}
                            >
                              Aktion erstellen
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <ul
                      role="list"
                      className="mb-6 divide-y divide-gray-100 rounded-md border border-gray-200 mt-3"
                    >
                      {selectedItems.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6"
                        >
                          <div className="flex w-0 flex-1 items-center">
                            <svg
                              className="h-5 w-5 flex-shrink-0 text-gray-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fill-rule="evenodd"
                                d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243h.001l.497-.5a.75.75 0 011.064 1.057l-.498.501-.002.002a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.368 6.36l-3.455 3.553A2.625 2.625 0 119.52 9.52l3.45-3.451a.75.75 0 111.061 1.06l-3.45 3.451a1.125 1.125 0 001.587 1.595l3.454-3.553a3 3 0 000-4.242z"
                                clip-rule="evenodd"
                              />
                            </svg>
                            <div className="ml-4 flex min-w-0 flex-1 gap-2">
                              <span className="truncate font-medium">
                                {item.label}{" "}
                              </span>
                              <span className="flex-shrink-0 text-gray-400">
                                2.4mb
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <a
                              href="#"
                              className="font-medium text-blue-600 hover:text-blue-500"
                            >
                              Löschen
                            </a>
                          </div>
                        </li>
                      ))}
                      {/* <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                        <div className="flex w-0 flex-1 items-center">
                          <svg
                            className="h-5 w-5 flex-shrink-0 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243h.001l.497-.5a.75.75 0 011.064 1.057l-.498.501-.002.002a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.368 6.36l-3.455 3.553A2.625 2.625 0 119.52 9.52l3.45-3.451a.75.75 0 111.061 1.06l-3.45 3.451a1.125 1.125 0 001.587 1.595l3.454-3.553a3 3 0 000-4.242z"
                              clip-rule="evenodd"
                            />
                          </svg>
                          <div className="ml-4 flex min-w-0 flex-1 gap-2">
                            <span className="truncate font-medium">
                              Bilanzen 2022.pdf
                            </span>
                            <span className="flex-shrink-0 text-gray-400">
                              4.5mb
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <a
                            href="#"
                            className="font-medium text-blue-600 hover:text-blue-500"
                          >
                            Herunterladen
                          </a>
                        </div>
                      </li> */}
                    </ul>

                    {/* <div className="mb-8 lx afm aft avd">
                      <button
                        type="button"
                        className="font-medium text-blue-600 hover:text-blue-500"
                      >
                        <span aria-hidden="true">+ </span>
                        Füge eine weitere Datei hinzu
                      </button>
                    </div>  */}

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

                <div className="mt-4 lg:col-span-6 bg-blue-50 p-6 rounded-xl">
                  <label
                    htmlFor="PreviewName"
                    className="block text-lg font-semibold text-gray-700"
                  >
                    Vorschau
                  </label>
                  <label
                    htmlFor="agentDescription"
                    className="mb-8 block text-sm font-medium text-gray-700"
                  >
                    Diese Vorschau eignet sich gut zum Testen. Teste hier deinen
                    Agent
                  </label>
                  {isLoading && (
                    <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
                      <Loader />
                    </div>
                  )}
                  {messages.length === 0 && !isLoading && (
                    <Empty label="No conversation started." />
                  )}
                  <div className="mt-1 flex flex-col-reverse gap-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.content}
                        className={cn(
                          "p-8 w-full flex items-start gap-x-8 rounded-lg",
                          message.role === "user"
                            ? "bg-white border border-black/10"
                            : "bg-muted"
                        )}
                      >
                        {message.role === "user" ? (
                          <UserAvatar />
                        ) : (
                          <BotAvatar />
                        )}
                        <ReactMarkdown
                          components={{
                            pre: ({ node, ...props }) => (
                              <div className="overflow-auto w-full my-2 bg-black/10 p-2 rounded-lg">
                                <pre {...props} />
                              </div>
                            ),
                            code: ({ node, ...props }) => (
                              <code
                                className="bg-black/10 rounded-lg p-1"
                                {...props}
                              />
                            ),
                          }}
                          className="text-sm overflow-hidden leading-7"
                        >
                          {message.content || ""}
                        </ReactMarkdown>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default AgentPage;
