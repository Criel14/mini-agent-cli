import type { ToolDefinition, ToolHandler, ToolResult } from "../tool-types.js";
/**
 * 工具函数：读取文件
 */

/**
 * 此工具函数的参数
 */
export type ReadFileArgs = {
    path: string;
};

/**
 * 执行操作的工具函数
 */
const readFileHandler = async (
    args: Record<string, unknown>,
): Promise<ToolResult> => {
    // 获取参数
    const path = args["path"];

    // 简单校验
    if (typeof path !== "string") {
        throw new Error("read_file 的 path 参数必须是字符串");
    }

    // 模拟读取文件
    return {
        content: `${path}文件的内容为：test`,
    };
};

/**
 * 工具定义
 */
export const readFileTool: ToolDefinition = {
    schema: {
        type: "function",
        name: "read_file",
        description: "读取指定路径的文件内容",
        parameters: {
            type: "object",
            properties: {
                path: {
                    type: "string",
                    description: "要读取的文件路径",
                },
            },
            required: ["path"],
            additionalProperties: false,
        },
        strict: true,
    },
    handler: readFileHandler,
};