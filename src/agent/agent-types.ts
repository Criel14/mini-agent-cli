import type { DeepSeekAssistantMessage, DeepSeekUsage } from "../llm/llm-response-types.js";

/**
 * Agent 行为（统一抽象）
 *
 */
export type AgentAction =
    | {
        type: "tool"; // 行为：调用工具
        toolName: string; // 工具名称
        toolArgs: any; // 工具参数（已经 JSON.parse 后）
        toolCallId: string; // tool_call_id（用于回传给模型）
        assistantMessage: DeepSeekAssistantMessage; // 原始消息
        usage: DeepSeekUsage; // token 使用统计
    }
    | {
        type: "final"; // 最终回答
        content: string; // 返回给用户的内容
        assistantMessage: DeepSeekAssistantMessage; // 原始消息
        usage: DeepSeekUsage; // token 使用统计
    };

/**
 * Agent 响应的内容和 token 统计
 */
export type AgentResult = {
    content: string;
    usage: DeepSeekUsage;
}