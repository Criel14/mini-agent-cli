import type { DeepSeekChatCompletionResponse } from "./llm-response-types.js"

/**
 * 调用 LLM
 * 
 * @param input 用户输入
 * @returns 
 */
export const callLLM = async (input: string): Promise<DeepSeekChatCompletionResponse> => {
    // 模拟响应结果
    return {
        "id": "test-001",
        "object": "chat.completion",
        "created": 1234567890,
        "model": "deepseek-v4-flash",
        "choices": [
            {
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": "我是 deepseek-v4-flash",
                },
                "finish_reason": "stop"
            }
        ],
        "usage": {
            "prompt_tokens": 1,
            "completion_tokens": 0,
            "total_tokens": 1
        }
    }
}