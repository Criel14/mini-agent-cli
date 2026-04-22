import type { OpenAIResponse } from "./agent-types.js";

/**
 * 调用 LLM
 * 
 * @param input 用户输入
 * @returns 
 */
export const callLLM = async (input: string): Promise<OpenAIResponse> => {
    // 模拟响应结果
    if (input.includes("读文件")) {
        return {
            id: "1",
            output: [{
                id: "1",
                call_id: "1",
                type: "function_call",
                name: "read_file",
                arguments: "{\"path\": \"test.txt\"}"
            }]
        }
    }
    return {
        id: "1",
        output: [{
            type: "message",
            role: "assistant",
            content: [{
                type: "output_text",
                text: `已阅读：${input}`
            }]
        }]
    }
}