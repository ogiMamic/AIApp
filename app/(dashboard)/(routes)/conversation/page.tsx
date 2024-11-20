"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import * as z from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heading } from "@/components/heading";
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
import { useChatHistoryStore } from "@/store/chatHistory/useChatHistoryStore";
import { IMessage } from "@/lib/interfaces/IMessage";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

const formSchema = z.object({
  prompt: z.string().min(1, { message: "Prompt is required." }),
  knowledge: z.string().optional(),
  agent: z.string().optional(),
});

interface AxiosErrorResponse {
  data?: {
    error?: string;
  };
}

export default function ConversationPage() {
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
  const {
    agents,
    fetchAgents,
    agentsLoading,
    error: agentsError,
  } = useAgentsStore();
  const { knowledges, fetchKnowledges, error } = useKnowledgesStore();
  const [selectedKnowledge, setSelectedKnowledge] = useState<string | null>(
    null
  );
  const [threadId, setThreadId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [openAIFileIds, setOpenAIFileIds] = useState<string[]>([]);
  const [vectorStoreId, setVectorStoreId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [agentError, setAgentError] = useState(false);
  const [knowledgesLoading, setKnowledgesLoading] = useState(false);
  const [knowledgesError, setKnowledgesError] = useState<string | null>(null);
  const [historiesLoading, setHistoriesLoading] = useState(false);
  const [historiesError, setHistoriesError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      knowledge: "",
      agent: "",
    },
  });

  const { handleSubmit, setValue, watch } = methods;
  const watchedAgent = watch("agent");

  const {
    formState: { errors, isSubmitting },
  } = methods;
  const isLoading = isSubmitting;

  const openAIAgents = useMemo(
    () => agents.filter((agent) => agent.id),
    [agents]
  );

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
    const loadData = async () => {
      setKnowledgesLoading(true);
      setHistoriesLoading(true);
      try {
        await Promise.all([fetchKnowledges(), fetchAgents(), fetchHistories()]);
      } catch (error) {
        console.error("Greška pri učitavanju podataka:", error);
        setKnowledgesError("Neuspešno učitavanje znanja");
        setHistoriesError("Neuspešno učitavanje istorije ćaskanja");
      } finally {
        setKnowledgesLoading(false);
        setHistoriesLoading(false);
      }
    };

    loadData();
  }, [fetchKnowledges, fetchAgents, fetchHistories]);

  useEffect(() => {
    console.log("Agenti u komponenti:", agents);
  }, [agents]);

  useEffect(() => {
    console.log("Izabrani agent ažuriran:", selectedAgent);
  }, [selectedAgent]);

  useEffect(() => {
    console.log("OpenAI agenti:", openAIAgents);
  }, [openAIAgents]);

  useEffect(() => {
    console.log("Praćena vrednost agenta:", watchedAgent);
  }, [watchedAgent]);

  useEffect(() => {
    if (selectedChatId) {
      const selectedHistory = histories.find(
        (history) => history.id === selectedChatId
      );
      if (selectedHistory) {
        setMessages(selectedHistory.messages);
        setThreadId(selectedHistory.threadId || null);
      } else {
        setMessages([]);
        setThreadId(null);
      }
    }
  }, [selectedChatId, histories]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      console.log("Selected file:", selectedFile); // Add this log
      if (selectedFile.size > MAX_FILE_SIZE) {
        setUploadError(
          "Veličina fajla prelazi maksimalnu dozvoljenu veličinu od 100 MB"
        );
      } else {
        setFile(selectedFile);
        setUploadError(null);
      }
    } else {
      console.log("No file selected"); // Add this log
    }
  };

  const handleUpload = async () => {
    if (!file) {
      console.log("test1");
      console.log("No file to upload in handleUpload");
      console.log("vectorStoreId:", vectorStoreId); // Add this log
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("Sending file to server:", file.name);
      console.log("test2"); // Add this log
      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        },
      });
      console.log("Upload response:", response.data);
      console.log("Test3"); // Add this log
      setOpenAIFileIds(response.data.openAIFileIds);
      setVectorStoreId(response.data.vectorStoreId);
    } catch (error) {
      console.error("Greška pri otpremanju fajla:", error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<AxiosErrorResponse>;
        setUploadError(
          axiosError.response?.data?.error ||
            "Došlo je do greške tokom otpremanja"
        );
      }
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log("Vrednosti forme pri slanju:", values);
      console.log("Izabrani agent pri slanju:", selectedAgent);

      if (!selectedAgent) {
        console.error("Nije izabran agent");
        setAgentError(true);
        return;
      }

      setAgentError(false);

      if (selectedChatId == null) {
        startNewChat();
      }

      if (selectedChatId) selectChat(selectedChatId);

      if (!threadId) {
        handleNewChat();
      }

      const userMessage: IMessage = {
        role: "user",
        content: values.prompt,
        id: uuidv4(),
        name: "User",
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      addMessageToCurrentChat(userMessage);

      console.log("ID izabranog agenta:", selectedAgent.id);
      if (!selectedAgent.id) {
        console.error("Nedostaje ID agenta ili asistenta");
        return;
      }

      if (file && openAIFileIds.length === 0) {
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
        conversationId: conversationId,
        knowledge_id: selectedKnowledge,
        openAIFileIds: openAIFileIds,
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
        new Notification("Primljena nova poruka", {
          body: "Bot je odgovorio na vašu poruku.",
        });
      }

      methods.reset();
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.log(error);
      setUploadError(
        error.response?.data?.error || "Došlo je do greške tokom razgovora"
      );
    } finally {
      router.refresh();
    }
  };

  const handleNewChat = async () => {
    startNewChat();
    if (selectedChatId) selectChat(selectedChatId);
    setMessages([]);
    setThreadId(null);
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
    alert("Link za ćaskanje je kopiran u clipboard!");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Heading
              title="Razgovor"
              description="Naš najnapredniji model za razgovor."
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
              <span className="sr-only">Prikaži bočnu traku</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex space-x-4">
                  <FormField
                    name="knowledge"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Select onValueChange={setSelectedKnowledge} {...field}>
                          <SelectTrigger>
                            <SelectValue placeholder="Izaberite znanje..." />
                          </SelectTrigger>
                          <SelectContent>
                            {knowledgesLoading ? (
                              <SelectItem value="loading">
                                Učitavanje znanja...
                              </SelectItem>
                            ) : knowledges.length === 0 ? (
                              <SelectItem value="no-knowledge">
                                Nema dostupnih znanja
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
                            console.log(
                              "Select onValueChange pozvana sa:",
                              value
                            );
                            const agent = openAIAgents.find(
                              (a) => a.id === value
                            );
                            console.log("Pronađen agent:", agent);
                            setSelectedAgent(agent || null);
                            setValue("agent", value);
                            field.onChange(value);
                            setAgentError(false);
                          }}
                          value={selectedAgent?.id || ""}
                        >
                          <SelectTrigger
                            className={cn(agentError && "border-red-500")}
                          >
                            <SelectValue placeholder="Izaberite agenta..." />
                          </SelectTrigger>
                          <SelectContent>
                            {agentsLoading ? (
                              <SelectItem value="loading">
                                Učitavanje agenata...
                              </SelectItem>
                            ) : openAIAgents.length === 0 ? (
                              <SelectItem value="no-agent">
                                Nema dostupnih OpenAI agenata
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
                            Molimo izaberite agenta
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
                            placeholder="Unesite vašu poruku ovde..."
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
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Paperclip className="h-4 w-4" />
                    )}
                    <span className="sr-only">Priloži fajl</span>
                  </Button>
                  <Button type="submit" disabled={isSubmitting || uploading}>
                    {isSubmitting ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span className="sr-only">Pošalji poruku</span>
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
              <div className="mt-2 text-sm text-gray-500">
                <p>Izabrani fajl: {file.name}</p>
                {uploading && (
                  <div className="mt-1">
                    <p>Otpremanje: {uploadProgress}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {uploadError && (
              <p className="mt-2 text-sm text-red-500">{uploadError}</p>
            )}
            <div className="space-y-4">
              {isSubmitting && (
                <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
                  <Loader className="h-8 w-8 animate-spin" />
                </div>
              )}
              {messages.length === 0 && !isSubmitting && (
                <Empty label="Razgovor nije započet." />
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
                        {message.role === "user" ? "Vi" : "AI"}
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
          "w-80 bg-white h-full overflow-y-auto",
          "fixed inset-y-0 right-0 z-50 transition-transform duration-200 ease-in-out",
          sidebarOpen ? "translate-x-0" : "translate-x-full",
          "lg:static lg:translate-x-0",
          "shadow-xl border-l border-gray-200"
        )}
      >
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Istorija ćaskanja</h3>
            <Button size="sm" onClick={handleNewChat}>
              Novo ćaskanje
            </Button>
          </div>
          <Input
            placeholder="Pretraži ćaskanja..."
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
            <label htmlFor="showDeleted">Prikaži obrisana</label>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              id="notifications"
              checked={notificationsEnabled}
              onChange={() => setNotificationsEnabled(!notificationsEnabled)}
              className="rounded text-blue-600"
            />
            <label htmlFor="notifications">Omogući obaveštenja</label>
          </div>
          <ul className="space-y-2">
            {filteredHistories.map((history) => (
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
                        "Prazno ćaskanje"}
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
                      <span className="sr-only">
                        {history.favorite
                          ? "Ukloni iz omiljenih"
                          : "Dodaj u omiljene"}
                      </span>
                    </button>
                    {history.deleted ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestore(history.id);
                        }}
                      >
                        <RefreshCw className="w-4 h-4 text-green-500" />
                        <span className="sr-only">Vrati</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeHistory(history.id);
                          }}
                        >
                          <Trash className="w-4 h-4 text-red-500" />
                          <span className="sr-only">Obriši</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(history.id);
                          }}
                        >
                          <Share2 className="w-4 h-4 text-blue-500" />
                          <span className="sr-only">Podeli</span>
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
}

//  "use client";

// import React, { useState, useEffect, useRef, useMemo } from "react";
// import { v4 as uuidv4 } from 'uuid';
// import { useRouter } from "next/navigation";
// import axios, { AxiosError } from "axios";
// import * as z from "zod";
// import { useForm, FormProvider } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Heading } from "@/components/heading";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useAgentsStore } from "@/store/agentsStore/useAgentsStore";
// import { BotAvatar } from "@/components/bot-avatar";
// import { Empty } from "@/components/empty";
// import { Button } from "@/components/ui/button";
// import { FormField, FormItem, FormControl } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { UserAvatar } from "@/components/user-avatar";
// import { cn } from "@/lib/utils";
// import {
//   MessageSquare,
//   Loader,
//   Search,
//   Star,
//   Trash,
//   RefreshCw,
//   Share2,
//   Bell,
//   Upload,
//   Menu,
//   Paperclip,
//   Send,
// } from "lucide-react";
// import { useChatHistoryStore } from "@/store/chatHistory/useChatHistoryStore";
// import { IMessage } from "@/lib/interfaces/IMessage";

// const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

// const formSchema = z.object({
//   prompt: z.string().min(1, { message: "Prompt is required." }),
//   agent: z.string().optional(),
// });

// interface AxiosErrorResponse {
//   data?: {
//     error?: string;
//   };
// }

// export default function ConversationPage() {
//   const router = useRouter();
//   const {
//     histories,
//     selectedChatId,
//     startNewChat,
//     addMessageToCurrentChat,
//     selectChat,
//     removeHistory,
//     fetchHistories,
//     updateHistory,
//   } = useChatHistoryStore();

//   const [messages, setMessages] = useState<IMessage[]>([]);
//   const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
//   const { agents, fetchAgents, agentsLoading, error } = useAgentsStore();
//   const [threadId, setThreadId] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showDeleted, setShowDeleted] = useState(false);
//   const [notificationsEnabled, setNotificationsEnabled] = useState(false);
//   const [openAIFileIds, setOpenAIFileIds] = useState<string[]>([]);
//   const [vectorStoreId, setVectorStoreId] = useState<string | null>(null);
//   const [file, setFile] = useState<File | null>(null);
//   const [uploading, setUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [uploadError, setUploadError] = useState<string | null>(null);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [agentError, setAgentError] = useState(false);
//   const [historiesLoading, setHistoriesLoading] = useState(false);
//   const [historiesError, setHistoriesError] = useState<string | null>(null);

//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   const methods = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       prompt: "",
//       agent: "",
//     },
//   });

//   const { handleSubmit, setValue, watch } = methods;
//   const watchedAgent = watch("agent");

//   const {
//         formState: { errors, isSubmitting },
//       } = methods;
//       const isLoading = isSubmitting;

//   const openAIAgents = useMemo(() => agents.filter((agent) => agent.id), [agents]);

//   const filteredHistories = useMemo(() => {
//     return histories
//       .filter((history) => !history.archived)
//       .filter((history) => (showDeleted ? history.deleted : !history.deleted))
//       .filter((history) =>
//         history.messages.some((message) =>
//           message.content.toLowerCase().includes(searchTerm.toLowerCase())
//         )
//       )
//       .sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));
//   }, [histories, showDeleted, searchTerm]);

//   useEffect(() => {
//     const loadData = async () => {
//       setHistoriesLoading(true);
//       try {
//         await Promise.all([fetchAgents(), fetchHistories()]);
//       } catch (error) {
//         console.error("Greška pri učitavanju podataka:", error);
//         setHistoriesError("Neuspešno učitavanje istorije ćaskanja");
//       } finally {
//         setHistoriesLoading(false);
//       }
//     };

//     loadData();
//   }, [fetchAgents, fetchHistories]);

//   useEffect(() => {
//     console.log("Agenti u komponenti:", agents);
//   }, [agents]);

//   useEffect(() => {
//     console.log("Izabrani agent ažuriran:", selectedAgent);
//   }, [selectedAgent]);

//   useEffect(() => {
//     console.log("OpenAI agenti:", openAIAgents);
//   }, [openAIAgents]);

//   useEffect(() => {
//     console.log("Praćena vrednost agenta:", watchedAgent);
//   }, [watchedAgent]);

//   useEffect(() => {
//     if (selectedChatId) {
//       const selectedHistory = histories.find((history) => history.id === selectedChatId);
//       if (selectedHistory) {
//         setMessages(selectedHistory.messages);
//         setThreadId(selectedChatId);
//       } else {
//         setMessages([]);
//       }
//     }
//   }, [selectedChatId, histories]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   useEffect(() => {
//     const handleFocus = () => {
//       fetchAgents();
//     };

//     window.addEventListener("focus", handleFocus);

//     return () => {
//       window.removeEventListener("focus", handleFocus);
//     };
//   }, [fetchAgents]);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const selectedFile = e.target.files[0];
//       if (selectedFile.size > MAX_FILE_SIZE) {
//         setUploadError("Veličina fajla prelazi maksimalnu dozvoljenu veličinu od 100 MB");
//       } else {
//         setFile(selectedFile);
//         setUploadError(null);
//       }
//     }
//   };

//   const handleUpload = async () => {
//     if (!file) return;

//     setUploading(true);
//     setUploadProgress(0);
//     setUploadError(null);

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const response = await axios.post("/api/upload", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//         onUploadProgress: (progressEvent) => {
//           if (progressEvent.total) {
//             const percentCompleted = Math.round(
//               (progressEvent.loaded * 100) / progressEvent.total
//             );
//             setUploadProgress(percentCompleted);
//           }
//         }
//       });
//       setOpenAIFileIds(response.data.openAIFileIds);
//       setVectorStoreId(response.data.vectorStoreId);
//     } catch (error) {
//       console.error("Greška pri otpremanju fajla:", error);
//       if(axios.isAxiosError(error)) {
//         const axiosError = error as AxiosError<AxiosErrorResponse>;
//         setUploadError(
//           axiosError.response?.data?.error || "Došlo je do greške tokom otpremanja"
//         );
//       }
//     } finally {
//       setUploading(false);
//     }
//   };

//   const onSubmit = async (values: z.infer<typeof formSchema>) =>{
//     try {
//       console.log("Vrednosti forme pri slanju:", values);
//       console.log("Izabrani agent pri slanju:", selectedAgent);

//       if (!selectedAgent) {
//         console.error("Nije izabran agent");
//         setAgentError(true);
//         return;
//       }

//       setAgentError(false);

//       if (!threadId) {
//         handleNewChat();
//       }

//       const userMessage: IMessage = {
//         role: "user",
//         content: values.prompt,
//         id: uuidv4(),
//         name: "User"
//       };

//       const newMessages = [...messages, userMessage];
//       setMessages(newMessages);
//       addMessageToCurrentChat(userMessage);

//       console.log("ID izabranog agenta:", selectedAgent.id);
//       if (!selectedAgent.id) {
//         console.error("Nedostaje ID agenta ili asistenta");
//         return;
//       }

//       if (file && openAIFileIds.length === 0) {
//         await handleUpload();
//       }

//       const response = await axios.post("/api/conversation", {
//         messages: newMessages,
//         agent: {
//           id: selectedAgent.id,
//           name: selectedAgent.name,
//           description: selectedAgent.description,
//           instructions: selectedAgent.instructions,
//           openai_assistant_id: selectedAgent.openai_assistant_id,
//         },
//         threadId: threadId,
//         openAIFileIds: openAIFileIds,
//         vectorStoreId: vectorStoreId,
//         fileAnalysis: file ? true : false,
//       });

//       if (response.data.threadId) {
//         setThreadId(response.data.threadId);
//       }

//       const botMessage: IMessage =
//         response.data.conversation[response.data.conversation.length - 1];
//       const updatedMessages = [...newMessages, botMessage];
//       setMessages(updatedMessages);
//       addMessageToCurrentChat(botMessage);

//       if (notificationsEnabled) {
//         new Notification("Primljena nova poruka", {
//           body: "Bot je odgovorio na vašu poruku.",
//         });
//       }

//       methods.reset();
//       setFile(null);
//       if (fileInputRef.current) {
//         fileInputRef.current.value = "";
//       }
//     } catch (error: any) {
//       console.log(error);
//       setUploadError(
//         error.response?.data?.error ||
//           "Došlo je do greške tokom razgovora"
//       );
//     } finally {
//       router.refresh();
//     }
//   };

//   const handleNewChat = () => {
//     startNewChat();
//     const newChatId = `${new Date().getTime()}`;
//     selectChat(newChatId);
//     setMessages([]);
//     setThreadId(null);
//     setVectorStoreId(null);
//     setOpenAIFileIds([]);
//   };

//   const toggleFavorite = async (id: string) => {
//     const history = histories.find((h) => h.id === id);
//     if (history) {
//       await updateHistory(id, { favorite: !history.favorite });
//     }
//   };

//   const handleRestore = async (id: string) => {
//     await updateHistory(id, { deleted: false });
//   };

//   const handleShare = (id: string) => {
//     const shareUrl = `${window.location.origin}/chat/${id}`;
//     navigator.clipboard.writeText(shareUrl);
//     alert("Link za ćaskanje je kopiran u clipboard!");
//   };

//   return (
//     <div className="flex h-screen overflow-hidden">
//       <div className="flex-1 flex flex-col overflow-hidden">
//         <header className="bg-white border-b border-gray-200 p-4">
//           <div className="max-w-4xl mx-auto flex items-center justify-between">
//             <Heading
//               title="Razgovor"
//               description="Naš najnapredniji model za razgovor."
//               icon={MessageSquare}
//               iconColor="text-violet-500"
//               bgColor="bg-violet-500/10"
//             />
//             <Button
//               variant="ghost"
//               size="icon"
//               className="lg:hidden"
//               onClick={() => setSidebarOpen(!sidebarOpen)}
//             >
//               <Menu className="h-6 w-6" />
//               <span className="sr-only">Prikaži bočnu traku</span>
//             </Button>
//           </div>
//         </header>

//         <main className="flex-1 overflow-auto">
//           <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
//             <FormProvider {...methods}>
//               <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//                 <div className="flex space-x-4">
//                   <FormField
//                     name="agent"
//                     render={({ field }) => (
//                       <FormItem className="flex-1">
//                         <Select
//                           onValueChange={(value) => {
//                             console.log("Select onValueChange pozvana sa:", value);
//                             const agent = openAIAgents.find(a => a.id === value);
//                             console.log("Pronađen agent:", agent);
//                             setSelectedAgent(agent || null);
//                             setValue('agent', value);
//                             field.onChange(value);
//                             setAgentError(false);
//                           }}
//                           value={selectedAgent?.id || ''}
//                         >
//                           <SelectTrigger
//                             className={cn(agentError && "border-red-500")}
//                           >
//                             <SelectValue placeholder="Izaberite agenta..." />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {agentsLoading ? (
//                               <SelectItem value="loading">Učitavanje agenata...</SelectItem>
//                             ) : openAIAgents.length === 0 ? (
//                               <SelectItem value="no-agent">
//                                 Nema dostupnih OpenAI agenata
//                               </SelectItem>
//                             ) : (
//                               openAIAgents.map((agent) => (
//                                 <SelectItem key={agent.id} value={agent.id}>
//                                   {agent.name}
//                                 </SelectItem>
//                               ))
//                             )}
//                           </SelectContent>
//                         </Select>
//                         {agentError && (
//                           <p className="text-red-500 text-sm mt-1">
//                             Molimo izaberite agenta
//                           </p>
//                         )}
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <FormField
//                     name="prompt"
//                     render={({ field }) => (
//                       <FormItem className="flex-1">
//                         <FormControl>
//                           <Input
//                             placeholder="Unesite vašu poruku ovde..."
//                             {...field}
//                           />
//                         </FormControl>
//                       </FormItem>
//                     )}
//                   />
//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="icon"
//                     onClick={() => fileInputRef.current?.click()}
//                     disabled={uploading}
//                   >
//                     {uploading ? (
//                       <Loader className="h-4 w-4 animate-spin" />
//                     ) : (
//                       <Paperclip className="h-4 w-4" />
//                     )}
//                     <span className="sr-only">Priloži fajl</span>
//                   </Button>
//                   <Button type="submit" disabled={isSubmitting || uploading}>
//                     {isSubmitting ? (
//                       <Loader className="h-4 w-4 animate-spin" />
//                     ) : (
//                       <Send className="h-4 w-4" />
//                     )}
//                     <span className="sr-only">Pošalji poruku</span>
//                   </Button>
//                 </div>
//               </form>
//             </FormProvider>
//             <input
//               type="file"
//               ref={fileInputRef}
//               className="hidden"
//               onChange={handleFileChange}
//             />
//             {file && (
//               <div className="mt-2 text-sm text-gray-500">
//                 <p>Izabrani fajl: {file.name}</p>
//                 {uploading && (
//                   <div className="mt-1">
//                     <p>Otpremanje: {uploadProgress}%</p>
//                     <div className="w-full bg-gray-200 rounded-full h-2.5">
//                       <div
//                         className="bg-blue-600 h-2.5 rounded-full"
//                         style={{ width: `${uploadProgress}%` }}
//                       ></div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//             {uploadError && (
//               <p className="mt-2 text-sm text-red-500">{uploadError}</p>
//             )}
//             <div className="space-y-4">
//               {isSubmitting && (
//                 <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
//                   <Loader className="h-8 w-8 animate-spin" />
//                 </div>
//               )}
//               {messages.length === 0 && !isSubmitting && (
//                 <Empty label="Razgovor nije započet." />
//               )}
//               <div className="space-y-4">
//                 {messages.map((message, index) => (
//                   <div
//                     key={index}
//                     className={cn(
//                       "p-4 rounded-lg flex items-start space-x-4",
//                       message.role === "user" ? "bg-blue-50" : "bg-green-50"
//                     )}
//                   >
//                     {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
//                     <div className="flex-1">
//                       <p className="text-sm font-medium mb-1">
//                         {message.role === "user" ? "Vi" : "AI"}
//                       </p>
//                       <p className="text-sm">{message.content}</p>
//                     </div>
//                   </div>
//                 ))}
//                 <div ref={messagesEndRef} />
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>

//       <div
//         className={cn(
//           "w-80 bg-white h-full overflow-y-auto",
//           "fixed inset-y-0 right-0 z-50 transition-transform duration-200 ease-in-out",
//           sidebarOpen ? "translate-x-0" : "translate-x-full",
//           "lg:static lg:translate-x-0",
//           "shadow-xl border-l border-gray-200"
//         )}
//       >
//         <div className="p-4 space-y-4">
//           <div className="flex justify-between items-center">
//             <h3 className="text-lg font-semibold">Istorija ćaskanja</h3>
//             <Button size="sm" onClick={handleNewChat}>
//               Novo ćaskanje
//             </Button>
//           </div>
//           <Input
//             placeholder="Pretraži ćaskanja..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full"
//             icon={Search}
//           />
//           <div className="flex items-center space-x-2 text-sm">
//             <input
//               type="checkbox"
//               id="showDeleted"
//               checked={showDeleted}
//               onChange={() => setShowDeleted(!showDeleted)}
//               className="rounded text-blue-600"
//             />
//             <label htmlFor="showDeleted">Prikaži obrisana</label>
//           </div>
//           <div className="flex items-center space-x-2 text-sm">
//             <input
//               type="checkbox"
//               id="notifications"
//               checked={notificationsEnabled}
//               onChange={() => setNotificationsEnabled(!notificationsEnabled)}
//               className="rounded text-blue-600"
//             />
//             <label htmlFor="notifications">Omogući obaveštenja</label>
//           </div>
//           <ul className="space-y-2">
//             {filteredHistories.map((history) => (
//               <li
//                 key={history.id}
//                 className={cn(
//                   "p-2 rounded-md cursor-pointer hover:bg-gray-100",
//                   selectedChatId === history.id ? "bg-blue-100" : ""
//                 )}
//                 onClick={() => {
//                   if (!history.deleted) {
//                     selectChat(history.id);
//                     setSidebarOpen(false);
//                   }
//                 }}
//               >
//                 <div className="flex items-center justify-between">
//                   <div className="flex-1 mr-2">
//                     <p className="text-sm font-medium truncate">
//                       {history.messages[0]?.content.slice(0, 30) ||
//                         "Prazno ćaskanje"}
//                     </p>
//                     <p className="text-xs text-gray-500">
//                       {new Date(parseInt(history.id)).toLocaleDateString()}
//                     </p>
//                   </div>
//                   <div className="flex items-center space-x-1">
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         toggleFavorite(history.id);
//                       }}
//                     >
//                       <Star
//                         className={cn(
//                           "w-4 h-4",
//                           history.favorite
//                             ? "text-yellow-500 fill-yellow-500"
//                             : "text-gray-500"
//                         )}
//                       />
//                       <span className="sr-only">
//                         {history.favorite ? "Ukloni iz omiljenih" : "Dodaj u omiljene"}
//                       </span>
//                     </button>
//                     {history.deleted ? (
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleRestore(history.id);
//                         }}
//                       >
//                         <RefreshCw className="w-4 h-4 text-green-500" />
//                         <span className="sr-only">Vrati</span>
//                       </button>
//                     ) : (
//                       <>
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             removeHistory(history.id);
//                           }}
//                         >
//                           <Trash className="w-4 h-4 text-red-500" />
//                           <span className="sr-only">Obriši</span>
//                         </button>
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleShare(history.id);
//                           }}
//                         >
//                           <Share2 className="w-4 h-4 text-blue-500" />
//                           <span className="sr-only">Podeli</span>
//                         </button>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// }
