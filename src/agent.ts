import type { OpenAIResponse } from "./agent-types.js";
import { callLLM } from "./llm.js";
import { toolMap } from "./tool-registry.js";
/**
 * Agent 执行主要逻辑
 */

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
        // 获取 LLM 响应信息
        try {
            const response = await callLLM(currentInput);

            // 处理大模型的响应数据：大模型每次响应的是一个数组，这里要遍历
            for (const item of response.output) {
                // 普通消息
                if (item.type === "message") {
                    // 返回大模型的响应消息
                    return item.content
                        .filter((block) => block.type === "output_text")
                        .map((block) => block.text)
                        .join("\n");
                }
                // 工具调用
                else if (item.type === "function_call") {
                    // 根据工具名称获取工具
                    const tool = toolMap.get(item.name);
                    if (!tool) {
                        throw new Error(`未知工具: ${item.name}`);
                    }

                    // 格式化参数
                    const args = JSON.parse(item.arguments) as Record<string, unknown>;
                    // 调用工具并向大模型返回结果
                    try {
                        const result = await tool.handler(args);
                        // 模拟将工具调用结果返回给大模型
                        console.log("[tool]:", result);
                        currentInput = result.content;
                    } catch (err) {
                        console.log("[tool]:", err); // 模拟将工具调用的错误信息返回给大模型
                        currentInput = "==占位==";
                    }
                }
            }
        } catch (err) {
            console.error("[error]: ", err);
        }

        // 限制循环的最大次数
        step++;
        if (step > MAX_STEPS) {
            throw new Error("Agent Loop 达到循环上限")
        }
    }
}