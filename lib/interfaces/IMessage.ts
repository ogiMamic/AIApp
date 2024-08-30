export interface IMessage {
  role: "user" | "bot";
  content: string;
  id: string;
  name: string;
}
