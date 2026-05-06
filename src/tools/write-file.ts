import fs from "node:fs/promises";
import path from "node:path";
import type { DeepSeekTool } from "./tool-types.js";

/**
 * 此工具函数的参数
 */
export type WriteFileArgs = {
    // 文件路径
    path: string;
    // 要写入的文件内容
    content: string;
    // 编码（可选）
    encoding?: BufferEncoding;
    // 是否追加写入，默认为 false（覆盖写入）
    append?: boolean;
    // 是否自动创建父目录，默认为 true
    createDirs?: boolean;
}

/**
 * 工具实现
 */
const writeFileHandler = async (
    args: WriteFileArgs,
): Promise<string> => {
    const {
        path: filePath,
        content,
        encoding = "utf8",
        append = false,
        createDirs = true,
    } = args;

    try {
        if (createDirs) {
            const dir = path.dirname(filePath);
            if (dir && dir !== ".") {
                await fs.mkdir(dir, { recursive: true });
            }
        }

        if (append) {
            await fs.appendFile(filePath, content, { encoding });
            return `追加写入文件成功: ${filePath}`;
        }

        await fs.writeFile(filePath, content, { encoding });
        return `写入文件成功: ${filePath}`;
    } catch (err: any) {
        return `写入文件失败: ${err.message}`;
    }
};

/**
 * 工具定义
 */
export const writeFileTool: DeepSeekTool = {
    name: "write_file",
    schema: {
        type: "function",
        function: {
            name: "write_file",
            description: "向指定路径写入文件内容，默认覆盖原文件并自动创建父目录",
            parameters: {
                type: "object",
                properties: {
                    path: {
                        type: "string",
                        description: "要写入的文件路径",
                    },
                    content: {
                        type: "string",
                        description: "要写入文件的内容",
                    },
                    encoding: {
                        type: "string",
                        description: "文件编码，默认为 utf8",
                    },
                    append: {
                        type: "boolean",
                        description: "是否追加写入，默认为 false（覆盖写入）",
                    },
                    createDirs: {
                        type: "boolean",
                        description: "是否自动创建父目录，默认为 true",
                    },
                },
                required: ["path", "content"],
                additionalProperties: false,
            },
        },
    },
    impl: writeFileHandler,
};
