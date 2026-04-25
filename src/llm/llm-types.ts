import type { DeepSeekToolCall } from "./llm-response-types.js";

/**
 * 单条消息
 */
export type DeepSeekMessage = {
  role: "system" | "user" | "assistant" | "tool"; // 角色
  content: string | null; // system 或 user 或 assistant 的内容
  tool_calls?: DeepSeekToolCall[]; // 工具调用，assistant 角色返回需要调用的工具
  tool_call_id?: string; // 工具调用 ID，tool 角色需要使用
};