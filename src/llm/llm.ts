import type { MemoryStore } from "../memory/memory-store.js";
import { toolSchemas } from "../tools/tool-registry.js";
import { llmConfig } from "./llm-config.js";
import type { DeepSeekChatCompletionResponse, DeepSeekStreamChunk } from "./llm-response-types.js"

/**
 * 调用 LLM
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
            stream: false,
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

/**
 * 流式调用 LLM
 * 
 * async function* 表示：这是一个“异步生成器”
 * 可以多次 yield 数据，而不是一次 return 一个最终结果
 */
export async function* callLLMStream(
    memoryStore: MemoryStore
): AsyncGenerator<DeepSeekStreamChunk> {
    const messages = memoryStore.getCurrentMemory().getAll();

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
            stream: true,  // 开启流式输出

            stream_options: {
                include_usage: true, // 让最后一个 chunk 带 usage
            },

            thinking: {
                type: "enabled", // TODO 后续可配置
            },

            extra_body: {
                enable_search: false, // TODO 后续可配置
            },
        }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`LLM 请求失败: ${text}`);
    }

    if (!response.body) {
        throw new Error("LLM 流式响应 body 为空");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = ""; // buffer 用来保存 还没凑完整的一段 SSE 文本

    while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        // stream: true 表示这不是最后一次解码，TextDecoder 会正确处理半个中文字符这种情况
        buffer += decoder.decode(value, { stream: true });

        // SSE 用 \n\n 分割 data
        const parts = buffer.split("\n\n");

        // 最后一段可能还没完整，先留在 buffer 里，下次继续拼
        buffer = parts.pop() ?? "";

        // 处理每一个 data
        for (const part of parts) {
            const line = part
                .split("\n")
                .find((item) => item.startsWith("data:"));

            if (!line) continue;

            const data = line.slice("data:".length).trim();

            if (data === "[DONE]") return;

            yield JSON.parse(data) as DeepSeekStreamChunk;
        }
    }
}
