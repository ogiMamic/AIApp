import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Bot, Loader2 } from "lucide-react";
import { SynapseAgent } from "@/lib/interfaces/SynapseAgent";
import { cn } from "@/lib/utils";

interface AgentListProps {
  agents: SynapseAgent[];
  selected: SynapseAgent | null;
  onSelectAgent: (agent: SynapseAgent | null) => void;
}

const groupAgentsByProvider = (agents: SynapseAgent[]) => {
  return agents.reduce((acc, agent) => {
    const provider = agent.model?.includes("gpt")
      ? "OpenAI"
      : agent.model?.includes("claude")
      ? "Anthropic"
      : agent.model?.includes("gemini")
      ? "Google"
      : "Other";

    if (!acc[provider]) {
      acc[provider] = [];
    }
    acc[provider].push(agent);
    return acc;
  }, {} as Record<string, SynapseAgent[]>);
};

export default function AgentList({
  agents,
  selected,
  onSelectAgent,
}: AgentListProps) {
  const groupedAgents = groupAgentsByProvider(agents);

  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Agent List</h3>
          <Button
            onClick={() => onSelectAgent(null)}
            size="sm"
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Add New Agent
          </Button>
        </div>

        <div className="space-y-6">
          {Object.entries(groupedAgents).map(
            ([provider, providerAgents]) =>
              providerAgents.length > 0 && (
                <div key={provider} className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground pl-2">
                    {provider}
                  </h4>
                  <div className="space-y-2">
                    {providerAgents.map((agent) => (
                      <Button
                        key={agent.id}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-2 px-2",
                          selected?.id === agent.id && "bg-muted"
                        )}
                        onClick={() => onSelectAgent(agent)}
                      >
                        <Bot className="h-4 w-4" />
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-medium">
                            {agent.name}
                          </span>
                          {agent.description && (
                            <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                              {agent.description}
                            </span>
                          )}
                        </div>
                        {!agent.isActive && (
                          <span className="ml-auto text-xs bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded">
                            Inactive
                          </span>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              )
          )}

          {agents.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No agents found. Create your first agent by clicking the button
              above.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
