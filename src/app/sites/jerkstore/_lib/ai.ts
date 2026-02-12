import { deepseek } from '@ai-sdk/deepseek';

// DeepSeek V3 is accessed via 'deepseek-chat'
export const deepseekV3 = deepseek('deepseek-chat');

// DeepSeek R1 is accessed via 'deepseek-reasoner'
export const deepseekR1 = deepseek('deepseek-reasoner');

// Default export for backward compatibility if needed, but we'll use specific ones now
export const insultModel = deepseekV3;
