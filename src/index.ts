import readline from "node:readline";
import fs from "node:fs/promises";
import { runAgent, runAgentStream } from "./agent/agent.js";
import { MemoryStore } from "./memory/memory-store.js";
import { handlerCommand } from "./commands/command-registry.js";
import { printAssistant, printError, printSystem, printUserPrompt } from "./ui/printer.js";

// 创建控制台监听
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// 读取系统提示词文件
const systemPrompt = await fs.readFile("./src/prompts/system-prompt.md", "utf-8");

// 创建会话记忆
const memoryStore = new MemoryStore([
    {
        role: "system",
        content: systemPrompt
    }
]);

/**
 * 获取用户输入并处理
 */
const ask = (): void => {
    rl.question(printUserPrompt(), handleInput);
};

/**
 * 运行时配置
 * 
 * 默认流式输出
 */
const runtimeConfig = {
    stream: true,
};


/**
 * 处理用户输入
 * 
 * @param input 用户输入的文本
 */
const handleInput = async (input: string): Promise<void> => {
    // 处理斜杠命令
    const commandResult = await handlerCommand(
        input,
        {
            memoryStore,
            close: () => rl.close(),
            runtimeConfig,
        }
    )
    if (commandResult) {
        if (commandResult.message) {
            printSystem(commandResult.message);
        }
        if (commandResult.shouldExit) {
            return;
        }
        // 递归调用，执行下一个问题或命令
        ask();
        return;
    }

    try {
        // 记忆用户输入
        memoryStore.appendMessage({
            role: "user",
            content: input
        })

        // 执行 agent，打印响应结果
        let result;
        if (runtimeConfig.stream) {
            result = await runAgentStream(memoryStore);
        } else {
            result = await runAgent(memoryStore);
            printAssistant(result.content);
        }
        const usage = result.usage;
        printSystem(`本轮对话：总 token = ${usage.total_tokens}, 输入 token = ${usage.prompt_tokens}, 输出 token = ${usage.completion_tokens}`)
    
    } catch (err) {
        printError(err);
    }

    // 递归调用，执行下一个问题或命令
    ask();
    return;
};

/**
 * 程序入口
 */
const main = () => {
    ask();
};

main();