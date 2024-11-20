import OpenAI from "openai";
import { ChatCompletionRequestMessage } from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the API clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

type Message = {
  role: string;
  content: string;
};

export async function getCompletion(model: string, messages: Message[]) {
  try {
    switch (model) {
      case "gpt-3.5-turbo":
      case "gpt-4":
        const completion = await openai.chat.completions.create({
          model: model,
          messages: messages as ChatCompletionRequestMessage[],
        });
        return completion.choices[0].message.content || "";

      case "claude-v1":
      case "claude-instant-v1":
        const lastMessage = messages[messages.length - 1];
        const claudeResponse = await anthropic.messages.create({
          model: "claude-2",
          max_tokens: 1024,
          messages: [{ role: lastMessage.role, content: lastMessage.content }],
        });
        return claudeResponse.content[0].text;

      case "gemini-pro":
        const geminiModel = gemini.getGenerativeModel({ model: "gemini-pro" });
        const prompt = messages.map((msg) => msg.content).join("\n");
        const geminiResponse = await geminiModel.generateContent(prompt);
        const geminiText = await geminiResponse.response.text();
        return geminiText;

      default:
        throw new Error(`Unsupported model: ${model}`);
    }
  } catch (error) {
    console.error("Error in getCompletion:", error);
    throw error;
  }
}
