import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader, Paperclip, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  prompt: z.string().min(1, { message: "Prompt is required." }),
  knowledge: z.string().optional(),
  agent: z.string().optional(),
});

interface ConversationFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
  knowledges: any[];
  agents: any[];
  selectedAgent: any;
  setSelectedAgent: (agent: any) => void;
  agentError: boolean;
  setAgentError: (error: boolean) => void;
  isLoading: boolean;
  uploading: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export function ConversationForm({
  onSubmit,
  knowledges,
  agents,
  selectedAgent,
  setSelectedAgent,
  agentError,
  setAgentError,
  isLoading,
  uploading,
  handleFileChange,
  fileInputRef,
}: ConversationFormProps) {
  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      knowledge: "",
      agent: "",
    },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex space-x-4">
          <FormField
            name="knowledge"
            render={({ field }) => (
              <FormItem className="flex-1">
                <Select onValueChange={field.onChange} value={field.value}>
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
                        <SelectItem key={knowledge.id} value={knowledge.id}>
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
                    const selected = agents.find((agent) => agent.id === value);
                    setSelectedAgent(selected);
                    setAgentError(false);
                    field.onChange(value);
                  }}
                  value={field.value}
                >
                  <SelectTrigger className={cn(agentError && "border-red-500")}>
                    <SelectValue
                      placeholder={
                        selectedAgent
                          ? selectedAgent.name
                          : "Select an agent..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.length === 0 ? (
                      <SelectItem value="no-agent">
                        No agents available
                      </SelectItem>
                    ) : (
                      agents.map((agent) => (
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
                  <Input placeholder="Type your message here..." {...field} />
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
            <span className="sr-only">Attach file</span>
          </Button>
          <Button type="submit" disabled={isLoading || uploading}>
            {isLoading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </form>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
    </FormProvider>
  );
}
