import readline from "node:readline";
import { runAgent } from "./agent.js";

// 创建控制台监听
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

/**
 * 获取用户输入并处理
 */
const ask = (): void => {
    rl.question("> ", handleInput);
};

/**
 * 处理用户输入
 * 
 * @param input 用户输入的文本
 */
const handleInput = async (input: string): Promise<void> => {
    // 执行 agent，打印响应结果
    const result = await runAgent(input);
    console.log("llm:", result);

    // 递归调用，执行下一个问题
    ask();
};

/**
 * 程序入口
 */
const main = () => {
    ask();
};

main();