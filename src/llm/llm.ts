import type { MemoryStore } from "../memory/memory-store.js";
import { toolSchemas } from "../tools/tool-registry.js";
import { llmConfig } from "./llm-config.js";
import type { DeepSeekChatCompletionResponse } from "./llm-response-types.js"

/**
 * 调用 LLM
 * 
 * @param memory 会话记忆
 * @returns 
 */
export const callLLM = async (
    memoryStore: MemoryStore
): Promise<DeepSeekChatCompletionResponse> => {
    // 获取历史消息
    const messages = memoryStore.getCurrentMemory().getAll();

    if (!llmConfig.apiKey) {
        throw new Error("缺少 DEEPSEEK_API_KEY");
    }

    // 发起请求
    const response = await fetch(`${llmConfig.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${llmConfig.apiKey}`,
        },
        body: JSON.stringify({
            model: llmConfig.model,
            messages,
            temperature: llmConfig.temperature,
            max_tokens: llmConfig.maxTokens,
            tools: toolSchemas,
            tool_choice: "auto",
            stream: false, // TODO 后续可配置
            "thinking": {
                "type": "enabled" // TODO 后续可配置
            },
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