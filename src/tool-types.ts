import type { OpenAIFunctionTool } from "./agent-types.js";
/**
 * 工具类型定义
 */

/**
 * 工具执行时的上下文信息
 *
 * 例如：当前工作目录、当前用户信息、运行环境配置...
 */
export type ToolContext = {
    cwd?: string; // 当前工作目录
    // 可拓展
};

/**
 * 工具执行后的统一返回结果
 */
export type ToolResult = {
    content: string; // 工具执行后的返回结果
};

/**
 * 一个函数，即真正执行操作的工具函数
 */
export type ToolHandler = (
    args: Record<string, unknown>, // 模型生成的工具参数
    context?: ToolContext, // 工具执行时的上下文信息（可选）
) => Promise<ToolResult>; // 表示工具返回一个异步结果

/**
 * 完整的工具定义
 */
export type ToolDefinition = {
    schema: OpenAIFunctionTool; // 给模型看的工具描述
    handler: ToolHandler; // 真正执行操作的工具函数
};