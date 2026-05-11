import type { SlashCommand } from "../command-types.js";

/**
 * 切换流式输出
 *
 * 用法：
 * /stream on
 * /stream off
 * /stream
 */
export const streamCommand: SlashCommand = {
    name: "stream",
    description: "切换输出模式(流式/阻塞)",

    async execute(args, context) {
        const value = args[0];

        if (!value) {
            return {
                message: `当前流式输出: ${context.runtimeConfig.stream ? "开启" : "关闭"}`,
            };
        }

        if (value === "on") {
            context.runtimeConfig.stream = true;

            return {
                message: "已开启流式输出",
            };
        }

        if (value === "off") {
            context.runtimeConfig.stream = false;

            return {
                message: "已关闭流式输出",
            };
        }

        return {
            message: "命令格式有误，应为: /stream on 或 /stream off",
        };
    },
};
