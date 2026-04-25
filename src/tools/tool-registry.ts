import type { DeepSeekToolDefinition } from "../llm/llm-request-types.js";
import { readFileTool } from "./read-file.js";
import type { DeepSeekTool } from "./tool-types.js";
/**
 * 统一导出工具列表
 */

/**
 * 工具列表
 */
export const toolList: DeepSeekTool[] = [readFileTool];

/**
 * Map<工具名，工具定义>，用于快速查找工具
 */
export const toolMap = new Map(
    toolList.map((tool) => [tool.name, tool]),
);

/**
 * List<工具的 schema>，用于将工具列表发送给LLM
 */
export const toolSchemas: DeepSeekToolDefinition[] = toolList.map((tool) => tool.schema);