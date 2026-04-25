/**
 * Agent 执行主要逻辑
 */
import type { DeepSeekChatCompletionResponse } from "../llm/llm-response-types.js";
import { callLLM } from "../llm/llm.js";
import { toolMap } from "../tools/tool-registry.js";
import type { AgentAction } from "./agent-types.js";


/**
 * 将模型响应结果封装为 agent 层的抽象
 * @param resp 模型的响应
 * @returns 返回 agent 层的抽象
 */
export function parseDeepSeekResponse(
    resp: DeepSeekChatCompletionResponse
): AgentAction {
    // 拿到 choice
    const choice = resp.choices[0];
    if (!choice) throw new Error("llm 响应结果中 choices 为空");

    // 拿到消息
    const msg = choice.message;

    // 判断是否函数调用，关于这里的"?."运算符：如果前面的值是 null 或 undefined，就直接返回 undefined，不会报错
    const call = msg.tool_calls?.[0];
    if (call) {
        return {
            type: "tool",
            toolName: call.function.name,
            toolArgs: JSON.parse(call.function.arguments), // 格式化请求参数
            toolCallId: call.id,
        };
    }

    // 最终回答
    return {
        type: "final",
        content: msg.content ?? "", // "??"运算表示：如果前面是 null 或 undefined，就用后面
    };
}

/**
 * 执行 Agent
 * 
 * @param input 用户输入
 * @returns 异步的响应结果
 */
export const runAgent = async (input: string): Promise<string> => {
    const MAX_STEPS = 30; // 循环的最大次数
    let step = 0;
    let currentInput = input;

    // Agent 调用循环
    while (true) {
        // 调用 LLM
        const response = await callLLM(currentInput);
        const action = parseDeepSeekResponse(response);

        if (action.type === "tool") { // // 工具调用
            // 获取工具
            const tool = toolMap.get(action.toolName);
            if (!tool) {
                throw new Error(`未知工具: ${action.toolName}`);
            }

            // 调用工具
            const toolResult = tool.impl(action.toolArgs)

            // TODO 封装结果
        } else if (action.type === "final") { // 最终回复
            return action.content;
        }

        // 限制循环的最大次数
        step++;
        if (step > MAX_STEPS) {
            throw new Error("Agent Loop 达到循环上限")
        }
    }
}