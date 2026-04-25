import type { Memory } from "../memory/memory.js"
import { toolSchemas } from "../tools/tool-registry.js";
import type { DeepSeekChatCompletionResponse } from "./llm-response-types.js"
import type { DeepSeekMessage } from "./llm-types.js";

/**
 * 调用 LLM
 * 
 * @param memory 会话记忆
 * @returns 
 */
export const callLLM = async (
    memory: Memory
): Promise<DeepSeekChatCompletionResponse> => {
    // 获取历史消息
    const messages: DeepSeekMessage[] = memory.getAll();

    // 读取配置
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const baseUrl = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
    const model = process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash";

    if (!apiKey) {
        throw new Error("缺少 DEEPSEEK_API_KEY");
    }
    // 发起请求
    const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages,
            temperature: 0.7, // TODO 后续可配置
            max_tokens: 8192, // TODO 后续可配置
            tools: toolSchemas,
            tool_choice: "auto",
            extra_body: {
                enable_search: false // TODO 后续可配置
            }
        }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`LLM 请求失败: ${text}`);
    }

    // 返回响应结果
    const data = await response.json();
    return data as DeepSeekChatCompletionResponse;
};