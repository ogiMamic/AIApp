"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import * as z from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heading } from "@/components/headling";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useKnowledgesStore } from "@/store/knowledgesStore/useKnowledgesStore"; // Import Knowledges Store
import { useAgentsStore } from "@/store/agentsStore/useAgentsStore";
import { BotAvatar } from "@/components/bot-avatar";
import { Empty } from "@/components/empty";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import { MessageSquare, Loader } from "lucide-react";
import { formSchema } from "./constants";
import { supabase } from "@/lib/supabaseClient"; // Importovanje Supabase klijenta
import { useChatHistoryStore } from "@/store/chatHistory/useChatHistoryStore";

interface IMessage {
  role: "user" | "bot";
  content: string;
}

const ConversationPage = () => {
  const {
    histories,
    selectedChatId,
    startNewChat,
    addMessageToCurrentChat,
    selectChat,
    removeHistory,
  } = useChatHistoryStore();

  const router = useRouter();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null); // Pohranjujemo cijeli objekt agenta
  const { agents, addAgent } = useAgentsStore();
  const { knowledges, addKnowledge } = useKnowledgesStore(); // Use Knowledges Store
  const [selectedKnowledge, setSelectedKnowledge] = useState<string | null>(
    null
  );

  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;
  const isLoading = isSubmitting;

  useEffect(() => {
    const loadAgents = async () => {
      const { data: agents, error } = await supabase.from("agents").select("*");

      if (error) {
        console.error("Error fetching agents from Supabase:", error.message);
      } else {
        console.log("Loaded agents from Supabase: ", agents);
        agents.forEach((agent) => addAgent(agent));
      }
    };

    const loadKnowledges = async () => {
      const { data: knowledges, error } = await supabase
        .from("knowledges")
        .select("*");

      if (error) {
        console.error(
          "Error fetching knowledges from Supabase:",
          error.message
        );
      } else {
        console.log("Loaded knowledges from Supabase: ", knowledges);
        knowledges.forEach((knowledge) => addKnowledge(knowledge));
      }
    };

    loadAgents(); // Učitavanje agenata prilikom mount-a komponente
    loadKnowledges(); // Učitavanje "knowledges" prilikom mount-a komponente
  }, [addAgent, addKnowledge]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Form submitted!"); // Provjera da li funkcija uopće radi
    try {
      const userMessage: IMessage = {
        role: "user",
        content: values.prompt,
      };

      const newMessages = [...messages, userMessage];

      // Provjera da li je niz 'agents' inicijaliziran i sadrži elemente
      if (!agents || agents.length === 0) {
        console.error("Agents array is empty or undefined.");
        return;
      } else {
        console.log("Agents array: ", agents); // Logovanje agenata
      }

      // Provjera da li je 'selectedAgent' ispravno definisan
      console.log("Selected Agent: ", selectedAgent); // Provjerite vrijednost selectedAgent

      if (!selectedAgent || !selectedAgent.openai_assistant_id) {
        console.error("Agent or Assistant ID is missing");
        return;
      }

      console.log("Starting API request with data: ", {
        messages: newMessages,
        agent: {
          id: selectedAgent.id,
          name: selectedAgent.name,
          description: selectedAgent.description,
          instructions: selectedAgent.instructions,
          openai_assistant_id: selectedAgent.openai_assistant_id,
        },
        knowledge_id: selectedKnowledge,
      });

      // API poziv s podacima
      const response = await axios.post("/api/conversation", {
        messages: newMessages,
        agent: {
          id: selectedAgent.id,
          name: selectedAgent.name,
          description: selectedAgent.description,
          instructions: selectedAgent.instructions,
          openai_assistant_id: selectedAgent.openai_assistant_id, // Korištenje ispravnog Assistant ID-a
        },
        knowledge_id: selectedKnowledge, // Dodavanje ID-a izabranog znanja
      });

      console.log("Response from API: ", response.data); // Provjerite odgovor API-ja

      const botMessage: IMessage = response.data;
      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);

      addMessageToCurrentChat(userMessage); // Spremanje u povijest
      addMessageToCurrentChat(botMessage); // Spremanje u povijest

      methods.reset();
    } catch (error: any) {
      console.log(error);
    } finally {
      router.refresh();
    }
  };

  console.log("Form errors:", errors);

  const handleNewChat = () => {
    startNewChat();
    const newChatId = `${new Date().getTime()}`;
    selectChat(newChatId);
    setMessages([]);
  };

  return (
    <div className="flex">
      <div className="flex-grow">
        <Heading
          title="Conversation"
          description="Our most advanced conversation model."
          icon={MessageSquare}
          iconColor="text-violet-500"
          bgColor="bg-violet-500/10"
        />
        <div className="px-4 lg:px-8">
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
            >
              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem className="col-span-12 lg:col-span-10">
                    <FormControl className="m-0 p-0">
                      <Input
                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                        disabled={isLoading}
                        placeholder="Enter your question here..."
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="col-span-12 lg:col-span-10 flex space-x-2 items-end">
                <FormField
                  name="knowledge"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl className="m-0 p-0">
                        <Select onValueChange={setSelectedKnowledge} {...field}>
                          <SelectTrigger className="mt-1 w-full">
                            <SelectValue placeholder="Select knowledge..." />
                          </SelectTrigger>
                          <SelectContent>
                            {knowledges.map((knowledge) => (
                              <SelectItem
                                key={knowledge.id}
                                value={knowledge.id}
                              >
                                {knowledge.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  name="agent"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl className="m-0 p-0">
                        <Select
                          onValueChange={(value) =>
                            setSelectedAgent(
                              agents.find((agent) => agent.id === value)
                            )
                          }
                          {...field}
                        >
                          <SelectTrigger className="mt-1 w-full">
                            <SelectValue placeholder="Select an agent..." />
                          </SelectTrigger>
                          <SelectContent>
                            {agents.map((agent) => (
                              <SelectItem key={agent.id} value={agent.id}>
                                {agent.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="flex-none text-[#0F3443] bg-[#38ef7d] hover:bg-[#06b348]"
                  disabled={isLoading}
                >
                  Generate
                </Button>
              </div>
            </form>
          </FormProvider>
          <div className="space-y-4 mt-4">
            {isLoading && (
              <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
                <Loader />
              </div>
            )}
            {messages.length === 0 && !isLoading && (
              <Empty label="No conversation started." />
            )}
            <div className="flex flex-col-reverse gap-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-8 w-full flex items-start gap-x-8 rounded-lg",
                    message.role === "user"
                      ? "bg-white border border-black/10"
                      : "bg-[#d8ffe6]"
                  )}
                >
                  {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                  <p className="text-sm">{message.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="w-96 border-l p-4">
        <h3 className="text-lg p-2 flex justify-between items-center">
          <span>Chat History</span>
          <Button
            size="sm"
            className="text-[#0F3443] bg-[#38ef7d] hover:bg-[#06b348]"
            onClick={handleNewChat}
          >
            New Chat
          </Button>
        </h3>
        <ul className="overflow-auto h-full">
          {histories.map((history, index) => (
            <li
              key={index}
              className={cn(
                "p-2 cursor-pointer hover:bg-gray-100 rounded-md",
                selectedChatId === history.id ? "bg-[#d8ffe6]" : ""
              )}
              onClick={() => selectChat(history.id)}
            >
              <div>{`Chat on ${new Date(
                parseInt(history.id)
              ).toLocaleDateString()} #${index + 1}`}</div>
              <button
                className="text-red-500 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  removeHistory(history.id);
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ConversationPage;
