import type { DeepSeekToolDefinition } from "../llm/llm-request-types.js";

/**
 * 一个工具，包含定义和实现
 */
export type DeepSeekTool<T = any> = {
    name: string; // 工具名称
    schema: DeepSeekToolDefinition; // 工具定义（提供给模型）
    impl: (args: T) => Promise<string>; // 工具函数的具体实现
};