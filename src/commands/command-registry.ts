import type { CommandContext, CommandResult } from "./command-types.js";
import { exitCommand } from "./slash/exit.js";
import { newCommand } from "./slash/new.js";

/**
 * 获取所有命令
 */
const commandList = [exitCommand, newCommand];

/**
 * 构造 Map<命令名称，命令>
 */
export const commandMap = new Map(
    commandList.map((command) => [command.name, command]),
);

/**
 * 执行命令
 */
export const handlerCommand = async (
    input: string,
    context: CommandContext,
): Promise<CommandResult | undefined> => {
    if (!input.startsWith("/")) {
        return undefined;
    }

    // 获取命令名称 和 命令参数
    const [commandName = "", ...args] = input.slice(1).trim().split(/\s+/);

    if (!commandName) {
        return {
            message: "命令格式有误，应为: /命令名称 参数1 参数2",
        };
    }
    
    const command = commandMap.get(commandName);

    if (!command) {
        return {
            message: `未知命令: /${commandName}`,
        };
    }

    return command.execute(args, context);
};