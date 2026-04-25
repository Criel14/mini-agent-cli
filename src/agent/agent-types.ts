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
    }
    | {
        type: "final"; // 最终回答
        content: string; // 返回给用户的内容
    };