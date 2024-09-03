"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
import {
  MessageSquare,
  Loader,
  Search,
  Star,
  Trash,
  RefreshCw,
  Share2,
  Bell,
  Upload,
  Menu,
  Paperclip,
  Send,
} from "lucide-react";
import { formSchema } from "./constants";
import { useChatHistoryStore } from "@/store/chatHistory/useChatHistoryStore";
import { IMessage } from "@/lib/interfaces/IMessage";

const ConversationPage = () => {
  const router = useRouter();
  const {
    histories,
    selectedChatId,
    startNewChat,
    addMessageToCurrentChat,
    selectChat,
    removeHistory,
    fetchHistories,
    updateHistory,
  } = useChatHistoryStore();

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
  const { agents, fetchAgents } = useAgentsStore();
  const { knowledges, fetchKnowledges } = useKnowledgesStore();
  const [selectedKnowledge, setSelectedKnowledge] = useState<string | null>(
    null
  );
  const [threadId, setThreadId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [vectorStoreId, setVectorStoreId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [agentError, setAgentError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;
  const isLoading = isSubmitting;

  const filteredHistories = useMemo(() => {
    return histories
      .filter((history) => !history.archived)
      .filter((history) => (showDeleted ? history.deleted : !history.deleted))
      .filter((history) =>
        history.messages.some((message) =>
          message.content.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      .sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));
  }, [histories, showDeleted, searchTerm]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([fetchKnowledges(), fetchAgents(), fetchHistories()]);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, [fetchKnowledges, fetchAgents, fetchHistories]);

  useEffect(() => {
    const handleFocus = () => {
      fetchKnowledges();
      fetchAgents();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchKnowledges, fetchAgents]);

  useEffect(() => {
    console.log("Current knowledges:", knowledges);
  }, [knowledges]);

  useEffect(() => {
    if (selectedChatId) {
      const selectedHistory = histories.find(
        (history) => history.id === selectedChatId
      );
      if (selectedHistory) {
        setMessages(selectedHistory.messages);
        setThreadId(selectedChatId);
      } else {
        setMessages([]);
      }
    }
  }, [selectedChatId, histories]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setVectorStoreId(response.data.vectorStoreId);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!selectedAgent) {
        setAgentError(true);
        return;
      }

      setAgentError(false);

      if (!threadId) {
        handleNewChat();
      }

      const userMessage: IMessage = {
        role: "user",
        content: values.prompt,
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      addMessageToCurrentChat(userMessage);

      if (!selectedAgent.openai_assistant_id) {
        console.error("Agent or Assistant ID is missing");
        return;
      }

      if (file) {
        await handleUpload();
      }

      const response = await axios.post("/api/conversation", {
        messages: newMessages,
        agent: {
          id: selectedAgent.id,
          name: selectedAgent.name,
          description: selectedAgent.description,
          instructions: selectedAgent.instructions,
          openai_assistant_id: selectedAgent.openai_assistant_id,
        },
        threadId: threadId,
        knowledge_id: selectedKnowledge,
        vectorStoreId: vectorStoreId,
        fileAnalysis: file ? true : false,
      });

      if (response.data.threadId) {
        setThreadId(response.data.threadId);
      }

      const botMessage: IMessage =
        response.data.conversation[response.data.conversation.length - 1];
      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);
      addMessageToCurrentChat(botMessage);

      if (notificationsEnabled) {
        new Notification("New message received", {
          body: "The bot has responded to your message.",
        });
      }

      methods.reset();
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.log(error);
    } finally {
      router.refresh();
    }
  };

  const handleNewChat = () => {
    startNewChat();
    const newChatId = `${new Date().getTime()}`;
    selectChat(newChatId);
    setMessages([]);
    setThreadId(null);
    setVectorStoreId(null);
  };

  const toggleFavorite = async (id: string) => {
    const history = histories.find((h) => h.id === id);
    if (history) {
      await updateHistory(id, { favorite: !history.favorite });
    }
  };

  const handleRestore = async (id: string) => {
    await updateHistory(id, { deleted: false });
  };

  const handleShare = (id: string) => {
    const shareUrl = `${window.location.origin}/chat/${id}`;
    navigator.clipboard.writeText(shareUrl);
    alert("Chat link copied to clipboard!");
  };

  const openAIAgents = agents.filter((agent) => agent.openai_assistant_id);

  return (
    <div className="flex">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Heading
              title="Conversation"
              description="Our most advanced conversation model."
              icon={MessageSquare}
              iconColor="text-violet-500"
              bgColor="bg-violet-500/10"
            />
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </header>

        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-8 py-0 space-y-4">
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex space-x-4">
                  <FormField
                    name="knowledge"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Select onValueChange={setSelectedKnowledge} {...field}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select knowledge..." />
                          </SelectTrigger>
                          <SelectContent>
                            {knowledges.length === 0 ? (
                              <SelectItem value="no-knowledge">
                                No knowledges available
                              </SelectItem>
                            ) : (
                              knowledges.map((knowledge) => (
                                <SelectItem
                                  key={knowledge.id}
                                  value={knowledge.id}
                                >
                                  {knowledge.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="agent"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Select
                          onValueChange={(value) => {
                            setSelectedAgent(
                              openAIAgents.find((agent) => agent.id === value)
                            );
                            setAgentError(false);
                          }}
                          {...field}
                        >
                          <SelectTrigger
                            className={cn(agentError && "border-red-500")}
                          >
                            <SelectValue placeholder="Select an agent..." />
                          </SelectTrigger>
                          <SelectContent>
                            {openAIAgents.length === 0 ? (
                              <SelectItem value="no-agent">
                                No OpenAI agents available
                              </SelectItem>
                            ) : (
                              openAIAgents.map((agent) => (
                                <SelectItem key={agent.id} value={agent.id}>
                                  {agent.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {agentError && (
                          <p className="text-red-500 text-sm mt-1">
                            Please select an agent
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <FormField
                    name="prompt"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            placeholder="Type your message here..."
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </form>
            </FormProvider>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
            {file && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Paperclip className="h-4 w-4" />
                <span>{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="space-y-4">
              {isLoading && (
                <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
                  <Loader />
                </div>
              )}
              {messages.length === 0 && !isLoading && (
                <Empty label="No conversation started." />
              )}
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-4 rounded-lg flex items-start space-x-4",
                      message.role === "user" ? "bg-blue-50" : "bg-green-50"
                    )}
                  >
                    {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">
                        {message.role === "user" ? "You" : "AI"}
                      </p>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        </main>
      </div>

      <div
        className={cn(
          "w-80 bg-white h-full",
          "fixed inset-y-0 right-0 z-50 transition-transform duration-200 ease-in-out",
          sidebarOpen ? "translate-x-0" : "translate-x-full",
          "lg:static lg:translate-x-0",
          "shadow-xl mr-4 border border-gray-200 rounded-xl"
        )}
      >
        <div className="p-4 space-y-4 flex flex-col">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Chat History</h3>
            <Button size="sm" onClick={handleNewChat}>
              New Chat
            </Button>
          </div>
          <Input
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            icon={Search}
          />
          <div className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              id="showDeleted"
              checked={showDeleted}
              onChange={() => setShowDeleted(!showDeleted)}
              className="rounded text-blue-600"
            />
            <label htmlFor="showDeleted">Show deleted</label>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              id="notifications"
              checked={notificationsEnabled}
              onChange={() => setNotificationsEnabled(!notificationsEnabled)}
              className="rounded text-blue-600"
            />
            <label htmlFor="notifications">Enable notifications</label>
          </div>
          <ul className="space-y-2 flex-grow">
            {filteredHistories.map((history, index) => (
              <li
                key={history.id}
                className={cn(
                  "p-2 rounded-md cursor-pointer hover:bg-gray-100",
                  selectedChatId === history.id ? "bg-blue-100" : ""
                )}
                onClick={() => {
                  if (!history.deleted) {
                    selectChat(history.id);
                    setSidebarOpen(false);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-2">
                    <p className="text-sm font-medium truncate">
                      {history.messages[0]?.content.slice(0, 30) ||
                        `Chat ${index + 1}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(parseInt(history.id)).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(history.id);
                      }}
                    >
                      <Star
                        className={cn(
                          "w-4 h-4",
                          history.favorite
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-500"
                        )}
                      />
                    </button>
                    {history.deleted ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestore(history.id);
                        }}
                      >
                        <RefreshCw className="w-4 h-4 text-green-500" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeHistory(history.id);
                          }}
                        >
                          <Trash className="w-4 text-red-500" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(history.id);
                          }}
                        >
                          <Share2 className="w-4 h-4 text-blue-500" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;
