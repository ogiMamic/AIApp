import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Trash2, HelpCircle } from "lucide-react";
import { SynapseAgent } from "@/lib/interfaces/SynapseAgent";

interface AgentFormProps {
  selected: SynapseAgent | null;
  onAgentCreated: () => void;
  onAgentUpdated: () => void;
}

export default function AgentForm({
  selected,
  onAgentCreated,
  onAgentUpdated,
}: AgentFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [model, setModel] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selected) {
      setName(selected.name || "");
      setDescription(selected.description || "");
      setInstructions(selected.instructions || "");
      setModel(selected.model || "");
      setIsActive(selected.isActive || false);
    } else {
      setName("");
      setDescription("");
      setInstructions("");
      setModel("");
      setIsActive(false);
    }
  }, [selected]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: selected ? "update" : "create",
          agentId: selected?.id,
          name,
          description,
          instructions,
          model,
          isActive,
        }),
      });

      if (response.ok) {
        if (selected) {
          onAgentUpdated();
        } else {
          onAgentCreated();
        }
      } else {
        throw new Error("Failed to save agent");
      }
    } catch (error) {
      console.error("Error saving agent:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "delete",
          agentId: selected.id,
        }),
      });

      if (response.ok) {
        onAgentUpdated();
      } else {
        throw new Error("Failed to delete agent");
      }
    } catch (error) {
      console.error("Error deleting agent:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {selected ? `Edit Agent: ${selected.name}` : "Create New Agent"}
          </h2>
          {selected && (
            <Button
              variant="destructive"
              size="icon"
              onClick={handleDelete}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter agent name"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this agent does"
            />
          </div>
          <div>
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Provide instructions for the agent"
            />
          </div>
          <div>
            <Label htmlFor="modelSelect">Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger id="modelSelect">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="claude-v1">Claude v1</SelectItem>
                <SelectItem value="claude-instant-v1">
                  Claude Instant v1
                </SelectItem>
                <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="agent-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="agent-active">Active</Label>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : selected ? (
            "Save Changes"
          ) : (
            "Create Agent"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
