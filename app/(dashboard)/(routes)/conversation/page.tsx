"use client";
import { useEffect } from "react";
import { use, useState } from "react";
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
import { useKnowledgesStore } from "@/store/knowledgesStore/useKnowledgesStore";
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
import { useChatHistoryStore } from "@/store/chatHistory/useChatHistoryStore";
import { start } from "repl";

interface IMessage {
  role: "user" | "bot";
  content: string;
}

const ConversationPage = () => {
  const {
    histories,
    currentChatId,
    selectedChatId,
    startNewChat,
    addMessageToCurrentChat,
    selectChat,
    removeHistory,
  } = useChatHistoryStore();
  const router = useRouter();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [selectedKnowledge, setSelectedKnowledge] = useState<string | null>(
    null
  );
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const { knowledges } = useKnowledgesStore();
  const { agents } = useAgentsStore();

  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { handleSubmit, formState } = methods;
  const isLoading = formState.isSubmitting;

  useEffect(() => {
    // Start a new chat when the component mounts
    startNewChat();
  }, [startNewChat]);

  useEffect(() => {
    if (selectedChatId) {
      const selectedChat = histories.find(
        (history) => history.id === selectedChatId
      );
      setMessages(selectedChat ? selectedChat.messages : []);
    }
  }, [selectedChatId, histories]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userMessage: IMessage = {
        role: "user",
        content: values.prompt,
      };
      const newMessages = [...messages, userMessage];

      const response = await axios.post("/api/conversation", {
        messages: newMessages,
      });

      const botMessage: IMessage = response.data;
      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);
      addMessageToCurrentChat(userMessage); // Save to history when a chat completion happens
      addMessageToCurrentChat(botMessage); // Save to history when a chat completion happens

      methods.reset();
    } catch (error: any) {
      console.log(error);
    } finally {
      router.refresh();
    }
  };

  return (
    <>
      <div>
        <Heading
          title="Gespräch"
          description="Unser fortschrittlichstes Konversationsmodell."
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
                        placeholder="Wie berechne ich den Radius eines Kreises?"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="col-span-12 lg:col-span-2 flex space-x-2">
                <Button className="h-full" disabled={isLoading}>
                  Senden
                </Button>
              </div>
              <div className="col-span-12 lg:col-span-6">
                <p className="text-sm font-semibold mb-1">
                  Wählen Sie ein Wissen:
                </p>
                <FormField
                  name="knowledge"
                  render={({ field }) => (
                    <FormItem className="col-span-12 lg:col-span-6">
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
              </div>

              <div className="col-span-12 lg:col-span-6">
                <p className="text-sm font-semibold mb-1">
                  Wählen Sie einen Agenten:
                </p>
                <FormField
                  name="agent"
                  render={({ field }) => (
                    <FormItem className="col-span-12 lg:col-span-6">
                      <FormControl className="m-0 p-0">
                        <Select onValueChange={setSelectedAgent} {...field}>
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
              <Empty label="Kein Gespräch begonnen." />
            )}
            <div className="flex flex-col-reverse gap-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-8 w-full flex items-start gap-x-8 rounded-lg",
                    message.role === "user"
                      ? "bg-white border border-black/10"
                      : "bg-muted"
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
      <div className="flex">
        <div className="flex-grow">
          {/* Main chat interface */}
          {/* Existing JSX */}
        </div>
        <div className="w-96 border-l">
          <h3 className="text-lg p-2">Chat History</h3>
          <ul className="overflow-auto h-full">
            {histories.map((history, index) => (
              <li
                key={index}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => selectChat(history.id)}
              >
                <div>{`Chat on ${new Date(
                  parseInt(history.id)
                ).toLocaleDateString()} #${index + 1}`}</div>
                <button
                  className="text-red-500 text-xs"
                  onClick={() => removeHistory(history.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default ConversationPage;
