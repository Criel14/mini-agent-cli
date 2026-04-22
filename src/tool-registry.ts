import { readFileTool } from "./tools/read-file.js";
/**
 * 统一导出工具列表
 */

/**
 * 工具列表
 */
export const toolList = [readFileTool];

/**
 * Map<工具名，工具定义>，用于快速查找工具
 */
export const toolMap = new Map(
    toolList.map((tool) => [tool.schema.name, tool]),
);

/**
 * List<工具的 schema>，用于将工具列表发送给LLM
 */
export const ToolSchemas = toolList.map((tool) => tool.schema);