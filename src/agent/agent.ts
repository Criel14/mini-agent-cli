/**
 * Agent 执行主要逻辑
 */
import type { DeepSeekChatCompletionResponse, DeepSeekToolCall, DeepSeekUsage } from "../llm/llm-response-types.js";
import { callLLM, callLLMStream } from "../llm/llm.js";
import type { MemoryStore } from "../memory/memory-store.js";
import { toolMap } from "../tools/tool-registry.js";
import { printAssistantDelta, printAssistantStreamEnd, printAssistantStreamStart, printError, printSystem } from "../ui/printer.js";
import type { AgentAction, AgentResult } from "./agent-types.js";

// agent 循环的最大步数（限制一次对话能调用几次工具）
const MAX_STEPS = 30;

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
    const call = msg.tool_calls?.[0]; // TODO 可能要处理多个函数调用的情况
    if (call) {
        return {
            type: "tool",
            toolName: call.function.name,
            toolArgs: JSON.parse(call.function.arguments), // 格式化请求参数
            toolCallId: call.id,
            assistantMessage: msg,
            usage: resp.usage,
        };
    }

    // 最终回答
    return {
        type: "final",
        content: msg.content ?? "", // "??"运算表示：如果前面是 null 或 undefined，就用后面
        assistantMessage: msg,
        usage: resp.usage,
    };
}

/**
 * 执行 Agent
 * 阻塞输出
 * 
 * @returns 异步的响应结果
 */
export const runAgent = async (memoryStore: MemoryStore): Promise<AgentResult> => {
    let step = 0;

    // Agent 调用循环
    while (true) {
        // 调用 LLM
        const response = await callLLM(memoryStore);
        const action = parseDeepSeekResponse(response);

        // 工具调用
        if (action.type === "tool") {
            // 写入会话记忆
            memoryStore.appendMessage(action.assistantMessage);

            // 获取工具
            const tool = toolMap.get(action.toolName);
            if (!tool) {
                throw new Error(`未知工具: ${action.toolName}`);
            }

            // 打印信息
            printSystem(`触发工具调用：${tool.name}`)

            // 调用工具
            try {
                const toolResult = await tool.impl(action.toolArgs)
                // 工具结果写入会话记忆
                memoryStore.appendMessage({
                    role: "tool",
                    content: toolResult,
                    reasoning_content: action.assistantMessage.reasoning_content ?? null,
                    tool_call_id: action.toolCallId,
                });
            } catch (err) {
                printError(err);
                // 错误信息写入会话记忆
                memoryStore.appendMessage({
                    role: "tool",
                    content: `${err}`, // 这里比较随意，就先这样
                    tool_call_id: action.toolCallId,
                });
            }

            // 工具调用时额外打印一次 token 统计
            // const usage = action.usage;
            // printSystem(`本轮对话：总 token = ${usage.total_tokens}, 输入 token = ${usage.prompt_tokens}, 输出 token = ${usage.completion_tokens}`)

            // 限制循环的最大次数
            step++;
            if (step > MAX_STEPS) {
                throw new Error("Agent Loop 达到循环上限")
            }

            continue;
        }

        // 最终回复
        if (action.type === "final") {
            // 写入会话记忆
            memoryStore.appendMessage(action.assistantMessage);

            return {
                content: action.content,
                usage: action.usage,
            }
        }
    }
}

/**
 * 执行 Agent 
 * 流式输出
 * 
 * @param memoryStore 
 */
export const runAgentStream = async (memoryStore: MemoryStore): Promise<AgentResult> => {
    let step = 0;

    while (true) {
        let content = "";
        let reasoningContent = "";
        let usage: DeepSeekUsage | undefined | null;
        let hasPrintedAssistant = false; // 标记是否打印了 "[assisatent]" 这个输出标记
        const toolCalls: DeepSeekToolCall[] = []; // 处理多个工具调用快
        let isToolCall = false; // 标记本次流式输出是否为工具调用

        // 处理一次流式输出
        for await (const chunk of callLLMStream(memoryStore)) {
            // 最后一块会包含 token 使用信息
            if (chunk.usage) {
                usage = chunk.usage;
            }

            // choice 可能为空
            const choice = chunk.choices[0];
            if (!choice) {
                continue;
            }
            const delta = choice.delta;

            // 思考内容
            if (delta.reasoning_content) {
                reasoningContent += delta.reasoning_content;
            }

            // 文本回复
            if (delta.content) {
                if (!hasPrintedAssistant) {
                    printAssistantStreamStart();
                    hasPrintedAssistant = true;
                }

                content += delta.content;
                printAssistantDelta(delta.content);
            }

            // 拼接工具调用
            if (delta.tool_calls) {
                for (const toolCallDelta of delta.tool_calls) {
                    const index = toolCallDelta.index ?? 0;

                    // 放入一个空的项，后续赋值
                    if (!toolCalls[index]) {
                        toolCalls[index] = {
                            id: "",
                            type: "function",
                            function: {
                                name: "",
                                arguments: "",
                            },
                        };
                    }

                    const current = toolCalls[index];

                    if (toolCallDelta.id) {
                        current.id = toolCallDelta.id;
                    }
                    if (toolCallDelta.type) {
                        current.type = toolCallDelta.type;
                    }
                    if (toolCallDelta.function?.name) {
                        current.function.name += toolCallDelta.function.name;
                    }
                    if (toolCallDelta.function?.arguments) {
                        current.function.arguments += toolCallDelta.function.arguments;
                    }
                }
            }

            // 执行工具调用
            if (choice.finish_reason === "tool_calls") {
                const toolCall = toolCalls[0]; // 这里只处理第一个

                if (!toolCall) {
                    throw new Error("模型返回 tool_calls 结束原因，但没有收集到工具调用数据");
                }

                // 保存会话记忆
                memoryStore.appendMessage({
                    role: "assistant",
                    content: null,
                    reasoning_content: reasoningContent,
                    tool_calls: [toolCall],
                });

                const tool = toolMap.get(toolCall.function.name);
                if (!tool) {
                    throw new Error(`未知工具: ${toolCall.function.name}`);
                }
                // 这里因为要输出系统提示，所以要结束模型输出打印
                if (hasPrintedAssistant) {
                    printAssistantStreamEnd();
                }
                printSystem(`触发工具调用：${tool.name}`);

                try {
                    const toolArgs = JSON.parse(toolCall.function.arguments);
                    const toolResult = await tool.impl(toolArgs);

                    memoryStore.appendMessage({
                        role: "tool",
                        content: toolResult,
                        tool_call_id: toolCall.id,
                    });
                } catch (err) {
                    printError(err);

                    memoryStore.appendMessage({
                        role: "tool",
                        content: `${err}`,
                        tool_call_id: toolCall.id,
                    });
                }

                isToolCall = true;
            }
        }

        // 保存会话记忆
        if (content) {
            memoryStore.appendMessage({
                role: "assistant",
                content,
                reasoning_content: reasoningContent,
            });
        }

        // 工具调用处理后继续循环
        if (isToolCall) {
            // 工具调用时额外打印一次 token 统计
            // if (usage) {
            //     printSystem(`本轮对话：总 token = ${usage.total_tokens}, 输入 token = ${usage.prompt_tokens}, 输出 token = ${usage.completion_tokens}`)
            // }

            step++;
            if (step > MAX_STEPS) {
                throw new Error("Agent Loop 达到循环上限");
            }
            continue;
        }

        // 打印对话结束分隔（打印工具调用信息前已经打印过一次了，所以这里要放在上面的 continue 后面）
        if (hasPrintedAssistant) {
            printAssistantStreamEnd();
        }

        return {
            content,
            usage: usage ?? {
                prompt_tokens: 0,
                completion_tokens: 0,
                total_tokens: 0,
            },
        };
    }
}
