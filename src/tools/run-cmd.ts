import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { DeepSeekTool } from "./tool-types.js";
import { printSystem } from "../ui/printer.js";

/**
 * 将 Node.js 回调风格的 execFile 转成 Promise 风格。
 *
 * - execFile 原本使用 callback。
 * - promisify(execFile) 可以把它包装成 async/await 可以使用的函数。
 */
const execFileAsync = promisify(execFile);

/**
 * 工具参数
 */
export type RunCmdArgs = {
    // 要执行的命令
    command: string;
    // 命令执行的目录（可选）
    cwd?: string;
    // 超时时间，单位毫秒（可选）
    timeoutMs?: number;
};

/**
 * 命令过滤（预留）
 */
const isAllowedCommand = (command: string): boolean => {
    const trimmed = command.trim();
    return true;
};

/**
 * 工具实现：通过 cmd.exe 执行命令。
 */
const runCmdHandler = async (
    args: RunCmdArgs,
): Promise<string> => {
    const {
        command,
        cwd = process.cwd(),
        timeoutMs = 10_000,
    } = args;

    if (!isAllowedCommand(command)) {
        return `命令被拒绝执行: ${command}`;
    }

    try {
        /**
         * 使用 cmd.exe 执行命令
         *
         * 参数说明：
         * - /d: 不执行 AutoRun 脚本，减少环境干扰
         * - /s: 调整引号解析规则
         * - /c: 执行后退出
         */
        const result = await execFileAsync(
            "cmd.exe",
            ["/d", "/s", "/c", command],
            {
                cwd,
                timeout: timeoutMs,
                windowsHide: true,
                maxBuffer: 1024 * 1024,
            },
        );

        const stdout = result.stdout?.toString() ?? "";
        const stderr = result.stderr?.toString() ?? "";

        // 打印日志
        printSystem(`【run_cmd】执行了命令: ${command}`)

        return [
            `命令执行成功: ${command}`,
            stdout ? `stdout:\n${stdout}` : "",
            stderr ? `stderr:\n${stderr}` : "",
        ].filter(Boolean).join("\n\n");
    } catch (err: any) {

        // 打印日志
        printSystem(`【run_cmd】执行命令 ${command} 失败`)

        return [
            `命令执行失败: ${command}`,
            err.stdout ? `stdout:\n${err.stdout}` : "",
            err.stderr ? `stderr:\n${err.stderr}` : "",
            err.message ? `错误信息:\n${err.message}` : "",
        ].filter(Boolean).join("\n\n");
    }
};

/**
 * 工具定义
 */
export const runCmdTool: DeepSeekTool<RunCmdArgs> = {
    name: "run_cmd",
    schema: {
        type: "function",
        function: {
            name: "run_cmd",
            description: "在 Windows cmd.exe 中执行命令，请注意命令的安全性",
            parameters: {
                type: "object",
                properties: {
                    command: {
                        type: "string",
                        description: "要执行的命令，例如 npm run typecheck、npm run build、node -v",
                    },
                    cwd: {
                        type: "string",
                        description: "命令执行目录，默认是当前项目目录",
                    },
                    timeoutMs: {
                        type: "number",
                        description: "命令超时时间，单位毫秒，默认 10000",
                    },
                },
                required: ["command"],
                additionalProperties: false,
            },
        },
    },
    impl: runCmdHandler,
};
