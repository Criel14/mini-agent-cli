import type { DeepSeekTool } from "./tool-types.js";
import fs from "node:fs/promises";
/**
 * 工具函数：读取文件
 */


/**
 * 此工具函数的参数
 */
export type ReadFileArgs = {
    // 文件路径
    path: string;
    // 编码（可选）
    encoding?: BufferEncoding;
}

/**
 * 工具实现
 */
const readFileHandler = async (
    args: ReadFileArgs,
): Promise<string> => {
    // 参数
    const { path, encoding = "utf8" } = args;

    try {
        // 使用 Node.js 的 fs.readFile 读取文件（不阻塞线程）
        const content = await fs.readFile(path, { encoding });
        return content;
    } catch (err: any) {
        return `读取文件失败: ${err.message}`;
    }
};

/**
 * 工具定义
 */
export const readFileTool: DeepSeekTool = {
    name: "read_file",
    schema: {
        type: "function",
        function: {
            name: "read_file",
            description: "读取指定路径的文件内容",
            parameters: {
                type: "object",
                properties: {
                    // 文件路径
                    path: {
                        type: "string",
                        description: "要读取的文件路径",
                    },
                    // 编码（可选）
                    encoding: {
                        type: "string",
                        description: "文件编码，默认为 utf8",
                    },
                },
                required: ["path"],
                additionalProperties: false,
            },
        },
    },
    impl: readFileHandler,
};