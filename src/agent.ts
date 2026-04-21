/**
 * 执行 Agent
 * 
 * @param input 用户输入
 * @returns 异步的响应结果
 */
export const runAgent = async (input: string): Promise<string> => {
    const response = "checked: " + input;
    return response;
}