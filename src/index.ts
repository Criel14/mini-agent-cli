import readline from "node:readline";
import { runAgent } from "./agent/agent.js";
import { MemoryStore } from "./memory/memory-store.js";
import { handlerCommand } from "./commands/command-registry.js";

// 创建控制台监听
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// 创建会话记忆
const memoryStore = new MemoryStore([
    {
        role: "system",
        content: "你是一个简单版本的 claude code 的智能助手，你可以向用户介绍你可以使用的工具"
    }
]);

/**
 * 获取用户输入并处理
 */
const ask = (): void => {
    rl.question("[user]:", handleInput);
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
        }
    )
    if (commandResult) {
        if (commandResult.message) {
            console.log("[system]:", commandResult.message);
        }

        if (commandResult.shouldExit) {
            return;
        }

        // 递归调用，执行下一个问题或命令
        ask();
        return;
    }

    // 执行 agent，打印响应结果
    try {
        memoryStore.appendMessage({
            role: "user",
            content: input
        })
        const result = await runAgent(memoryStore);
        console.log("[llm]:", result);
    } catch (err) {
        console.error("[error]: ", err);
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