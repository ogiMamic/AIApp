import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Send } from "lucide-react";
import { BotAvatar } from "@/components/bot-avatar";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import { SynapseAgent, IMessage } from "@/lib/interfaces/SynapseAgent";

interface TestAgentProps {
  selected: SynapseAgent | null;
  testQuestion: string;
  setTestQuestion: (question: string) => void;
  handleTestAgent: () => void;
  isTestingAgent: boolean;
  messages: IMessage[];
  file: File | null;
  setFile: (file: File | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  uploadError: string | null;
}

const TestAgent: React.FC<TestAgentProps> = ({
  selected,
  testQuestion,
  setTestQuestion,
  handleTestAgent,
  isTestingAgent,
  messages,
  file,
  setFile,
  fileInputRef,
  uploadError,
}) => {
  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2">Test Agent</h3>
        {selected ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="testQuestion">Ask a question</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="testQuestion"
                  value={testQuestion}
                  onChange={(e) => setTestQuestion(e.target.value)}
                  placeholder="Enter your question here"
                />
                <Button
                  onClick={handleTestAgent}
                  disabled={isTestingAgent || !testQuestion.trim()}
                >
                  {isTestingAgent ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="fileUpload">Upload File (optional)</Label>
              <Input
                id="fileUpload"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                ref={fileInputRef}
              />
            </div>
            <div className="space-y-4 mt-4">
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
            </div>
            {uploadError && (
              <p className="text-red-500 text-sm mt-2">{uploadError}</p>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">Select an agent to test</p>
        )}
      </CardContent>
    </Card>
  );
};

export default TestAgent;
