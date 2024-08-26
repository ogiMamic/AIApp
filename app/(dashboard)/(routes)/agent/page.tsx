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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useAgentsStore } from "@/store/agentsStore/useAgentsStore";
import { useCustomStore } from "@/store/customStore/useCustomStore";
import { useKnowledgesStore } from "@/store/knowledgesStore/useKnowledgesStore";
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
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

const AgentPage = () => {
  const [creating, setCreating] = useState(false);

  const { selected, addAgent } = useAgentsStore();
  const { selectedItems, clearSelectedItems } = useCustomStore();
  const { knowledges } = useKnowledgesStore();
  const [selectedKnowledge, setSelectedKnowledge] = useState(null);

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

      if (selected) {
        const response = await axios.post("/api/agent", {
          name: selected.name,
          description: selected.description,
          instructions: selected.anweisungen,
        });

        setMessages((current) => [...current, userMessage, response.data]);
      } else {
        console.error("Selected data is null, cannot post data");
      }
      form.reset();
    } catch (error) {
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

  const handleCreateAgent = async () => {
    setCreating(true);
    try {
      const response = await axios.post("/api/agent", {
        name,
        instructions: anweisungen,
        tools: [{ type: "file_search" }],
        tool_resources: {
          file_search: {
            vector_store_ids: ["vs_123"], // Update with your vector store ID
          },
        },
        model: "gpt-4o",
      });

      if (response.data.success) {
        console.log("Assistant created:", response.data.assistant);
        addAgent({
          id: response.data.assistant.id,
          name,
          description,
          anweisungen,
          openai_assistant_id: response.data.assistant.id,
        });

        setName("");
        setDescription("");
        setAnweisungen("");
        router.refresh();
      } else {
        console.error("Failed to create agent with OpenAI assistant.");
      }
    } catch (error) {
      console.error("Error creating agent:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mt-0 w-full grid grid-cols-1 lg:grid-cols-12 gap-y-4 lg:gap-0 divide-gray-200 flex-col divide-y lg:divide-x lg:divide-y-0">
      <div className="lg:col-span-3">
        <ListAgents />
      </div>
      <div className="pt-8 flex-col lg:col-span-9 bg-gray-0 p-0 rounded-lg">
        <Heading
          title="Create Agent"
          description="Create Agent and create actions for Agent´s knowledge."
          icon={UserPlus}
          iconColor="text-blue-700"
          bgColor="bg-blue-700/10"
        />
        <div className="px-4 lg:px-8">
          <h5 className="text-lg font-semibold">{selected?.name}</h5>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-6 rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-2"
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
        <div className="mt-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-y-8 lg:gap-x-16 flex-col">
          <div className="flex-col lg:col-span-6">
            <label
              htmlFor="agentName"
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
            <label
              htmlFor="agentAnweisungen"
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
            <div className="mt-4 flex-col lg:col-span-6">
              <label
                htmlFor="knowledgeSelect"
                className="block text-sm font-medium text-gray-700"
              >
                Wähle eine Wissensdatenbank
              </label>
              <Select onValueChange={setSelectedKnowledge}>
                <SelectTrigger id="knowledgeSelect" className="mt-1 w-full">
                  <SelectValue placeholder="Select a knowledge..." />
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
          </div>

          <div className="flex flex-col lg:col-span-6 bg-blue-50 p-6 rounded-xl">
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
              Diese Vorschau eignet sich gut zum Testen. Teste hier deinen Agent
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
                  {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
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
  );
};

export default AgentPage;
