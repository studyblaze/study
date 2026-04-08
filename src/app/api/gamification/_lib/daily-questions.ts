export const DAILY_QUESTION_QUOTA = {
    M4: 4,
    M3: 3,
    TCS: 2,
    WEBX: 1,
} as const;

export type DailySubject = keyof typeof DAILY_QUESTION_QUOTA;

export interface DailyQuestionItem {
    id?: string;
    subject: string;
    question_number: number;
    question_text: string;
    answer_text?: string;
}

export function sampleQuestions<T>(items: T[], count: number) {
    const pool = [...items];

    for (let i = pool.length - 1; i > 0; i -= 1) {
        const swapIndex = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[swapIndex]] = [pool[swapIndex], pool[i]];
    }

    return pool.slice(0, count);
}

export function stripHtml(value: string) {
    return value
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/\s+/g, ' ')
        .trim();
}

export function truncateText(value: string, maxLength = 220) {
    if (value.length <= maxLength) return value;
    return `${value.slice(0, maxLength - 3).trimEnd()}...`;
}
