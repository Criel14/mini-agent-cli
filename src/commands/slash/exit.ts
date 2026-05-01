import type { SlashCommand } from "../command-types.js";

/**
 * 退出应用
 */
export const exitCommand: SlashCommand = {
    name: "exit",
    description: "退出 cli 程序",

    async execute(args, context) {
        // 关闭 readline
        context.close();

        return {
            message: "已退出程序",
            shouldExit: true,
        }
    },
}