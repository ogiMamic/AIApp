// Na vrhu datoteke dodajte 'use client' direktivu
"use client";

// Nastavite s uvozom vaših modula i biblioteka
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema } from "./constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { MessageSquare } from "lucide-react";
import { Heading } from "@/components/headling";
import { CreateChatCompletionRequestMessage } from "openai/resources/chat";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
import { BotAvatar } from "@/components/bot-avatar";

const ConversationPage = () => {
    const router = useRouter();
        const [messages, setMessages] = useState<CreateChatCompletionRequestMessage[]>([]);
        
    const [file, setFile] = useState<File | null>(null); // Initialwert zu null geändert
    const [uploadError, setUploadError] = useState(""); // Initialwert zu null geändert
    const [fileName, setFileName] = useState(""); // Initialwert zu null geändert
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prompt: ""
        }
    });

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const formData = new FormData();
            formData.append("prompt", values.prompt);

            if (file) {
                formData.append("attachment", file);
                setFileName(file.name);
            }

            const userMessage: CreateChatCompletionRequestMessage = {
                role: "user",
                content: values.prompt,
            };
            setMessages((current) => [...current, userMessage]);

            const response = await axios.post("/api/conversation", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setMessages((current) => [...current, response.data]);
            form.reset();
            setFile(null); // Dateiauswahl zurücksetzen
            setFileName(""); // Dateinamen zurücksetzen
            setUploadError(""); // Dateiauswahl zurücksetzen
        } catch (error) {
            console.error(error);
            setUploadError("Fehler beim Hochladen der Datei.");
        } finally {
            if (typeof window !== "undefined") {
                router.replace(router.asPath);
            }
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
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} encType="multipart/form-data"
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
                        <FormField 
                        name="attachment"
                        render={({ field }) => (
                            <FormItem className="col-span-12 lg:col-span-10">
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
                        <Button className="col-span-12 lg:col-span-2 w-full" disabled={isLoading}>
                            Generieren
                        </Button>
                    </form>
                </Form>
                <div className="space-y-4 mt-4">
                    {isLoading && (
                        <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
                            <Loader />
                        </div>
                    )}
                    {messages.length === 0 && !isLoading && (
                        <Empty label="Kein Gespräch begonnen."/>
                    )}
                    <div className="flex flex-col-reverse gap-y-4">
                        {messages.map((message, index) => (
                            <div 
                            key={index}
                            className={cn(
                                "p-8 w-full flex items-start gap-x-8 rounded-lg",
                                message.role === "user" ? "bg-white border border-black/10" : "bg-muted"
                            )}
                            >
                                {message.role === "user" ? <UserAvatar /> : <BotAvatar />}    
                                <p className="text-sm">
                                    {message.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConversationPage;