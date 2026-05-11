import type { MemoryStore } from "../memory/memory-store.js";

/**
 * CLI 运行时配置
 */
export type RuntimeConfig = {
    stream: boolean; // 是否使用流式输出
};


/**
 * 命令的上下文信息
 */
export type CommandContext = {
    memoryStore: MemoryStore; // 会话记忆存储
    close: () => void; // 需要传递 readline 的关闭函数
    runtimeConfig: RuntimeConfig; // 运行时配置
}

/**
 * 命令的结果
 */
export type CommandResult = {
    message?: string; // 返回的结果信息
    shouldExit?: boolean; // 是否退出，用于 exit 命令
}

/**
 * 一个命令
 */
export type SlashCommand = {
    name: string; // 名称，用户输入的斜杠后紧跟着的字符串
    description: string;
    execute: (args: string[], context: CommandContext) => Promise<CommandResult>;
};