import type { SlashCommand } from "../command-types.js";

/**
 * 新建会话
 */
export const newCommand: SlashCommand = {
    name: "new",
    description: "新建会话",

    async execute(args, context) {
        const memoryStore = context.memoryStore;
        const currentId = memoryStore.create();

        return {
            message: `已新建会话: ${currentId}`,
        };
    },
}