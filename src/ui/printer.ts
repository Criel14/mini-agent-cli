/**
 * 打印输出内容
 */

/**
 * ANSI 颜色控制码
 *
 */
const color = {
    reset: "\x1b[0m",
    dim: "\x1b[2m",
    gray: "\x1b[90m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    magenta: "\x1b[35m",
};

/**
 * 给文本包上一段颜色控制码
 *
 * @param text 原始文本
 * @param ansiColor ANSI 颜色控制码
 * @returns 带颜色的终端文本
 */
function withColor(text: string, ansiColor: string): string {
    return `${ansiColor}${text}${color.reset}`;
}

/**
 * 按块打印内容，前后各留一个空行
 * 输出结构大概是：
 *
 * label
 * message
 *
 */
function printBlock(label: string, message: string, labelColor: string): void {
    console.log(withColor(label, labelColor));
    console.log(message);
}

/**
 * 打印系统消息，例如命令执行结果
 */
export function printSystem(message: string): void {
    printBlock("[system]", message, color.cyan);
}

/**
 * 打印模型回复
 */
export function printAssistant(message: string): void {
    printBlock("[assistant]", message, color.green);
}

/**
 * 打印工具消息
 *
 * @param toolName 工具名称，例如 read_file、write_file、run_cmd
 * @param message 工具相关的信息，例如触发工具、执行成功、执行失败等
 */
export function printTool(toolName: string, message: string): void {
    printBlock(`[tool:${toolName}]`, message, color.magenta);
}


/**
 * 返回用户输入提示符
 * readline.question 需要一个字符串作为提示，所以这里不直接 console.log
 */
export function printUserPrompt(): string {
    return `${withColor("[user]\n>", color.blue)} `;
}

/**
 * 打印错误信息
 */
export function printError(err: unknown): void {
    console.error();
    console.error(withColor("error", color.red));

    if (err instanceof Error) {
        console.error(err.message);
    } else {
        console.error(err);
    }

    console.error();
}

/**
 * 打印警告消息
 */
export function printWarning(message: string): void {
    printBlock("warning", message, color.yellow);
}

/**
 * 打印普通提示消息
 */
export function printInfo(message: string): void {
    printBlock("info", message, color.gray);
}

/**
 * 开始打印 assistant 流式回复
 */
export function printAssistantStreamStart(): void {
    console.log(withColor("[assistant]", color.green));
}

/**
 * 打印 assistant 的一个增量片段
 */
export function printAssistantDelta(text: string): void {
    process.stdout.write(text); // 不会自动换行
}

/**
 * 结束 assistant 流式输出打印
 */
export function printAssistantStreamEnd(): void {
    console.log();
}
