"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import * as z from "zod";
import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
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

interface IMessage {
  role: "user" | "bot";
  content: string;
}

const ConversationPage = () => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>("");
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

  const { handleSubmit, reset, getValues, formState } = methods;
  const isLoading = formState.isSubmitting;

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (data) => {
    const formData = new FormData();
    formData.append("prompt", data.prompt);

    if (file) {
      formData.append("attachment", file);
    }

    try {
      const response = await axios.post("/api/conversation", formData);

      if (response.status !== 200) {
        throw new Error("Fehler beim Hochladen der Datei.");
      }

      const responseData = response.data;
      reset();
      setFile(null);
    } catch (error) {
      console.error(error);
      setUploadError("Fehler beim Hochladen der Datei.");
    }
  };

  return (
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
            encType="multipart/form-data"
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
            <div className="col-span-12 lg:col-span-10 flex space-x-2 items-end">
              <FormField
                name="attachment"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl className="m-0 p-0">
                      <Input
                        type="file"
                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                        disabled={isLoading}
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

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
                            <SelectItem key={knowledge.id} value={knowledge.id}>
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

              <Button className="flex-none" disabled={isLoading}>
                Generieren
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
  );
};

export default ConversationPage;
