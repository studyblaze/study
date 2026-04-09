'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface SubjectStats {
    completed: number;
    target: number;
    total: number;
    position: number;
    color: string;
    d_day: string;
}

export interface MissionState {
    user_id: string;
    subject_data: Record<string, SubjectStats>;
    daily_streak: number;
    total_xp: number;
}

export interface RevisionItem {
    id: string;
    topic_name: string;
    subject: string;
    interval_stage: number;
    next_revision_at: string;
}

export interface QuestionData {
    subject: string;
    question_number: number;
    question_text: string;
    answer_text: string;
    formula_text?: string;
}

interface GamificationContextType {
    revisions: RevisionItem[];
    mission: MissionState | null;
    activeSubject: string;
    setActiveSubject: (s: string) => void;
    theme: 'dark' | 'light';
    toggleTheme: () => void;
    selectedQuestion: QuestionData | null;
    clickOrigin: { x: number, y: number } | null;
    openQuestion: (num: number, origin?: { x: number, y: number }) => Promise<void>;
    closeQuestion: () => void;
    refreshMission: () => Promise<void>;
    isLoading: boolean;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);
type AppWindow = Window & { __USER_ID__?: string };

export function GamificationProvider({ children }: { children: React.ReactNode }) {
    const [revisions, setRevisions] = useState<RevisionItem[]>([]);
    const [mission, setMission] = useState<MissionState | null>(null);
    const [activeSubject, setActiveSubject] = useState('M4');
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [selectedQuestion, setSelectedQuestion] = useState<QuestionData | null>(null);
    const [clickOrigin, setClickOrigin] = useState<{ x: number, y: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('m4-theme') as 'dark' | 'light';
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('m4-theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const openQuestion = async (num: number, origin?: { x: number, y: number }) => {
        setIsLoading(true);
        if (origin) setClickOrigin(origin);
        setSelectedQuestion({
            subject: activeSubject,
            question_number: num,
            question_text: `Loading ${activeSubject} node ${num}...`,
            answer_text: 'Open the answer vault to reveal or write the answer.'
        });
        try {
            const resp = await fetch(`/api/gamification/questions?subject=${activeSubject}&num=${num}`);
            const data = await resp.json();
            if (data.question) {
                setSelectedQuestion(data.question);
            } else {
                // Fallback / Mock
                setSelectedQuestion({
                    subject: activeSubject,
                    question_number: num,
                    question_text: `Placeholder question for ${activeSubject} #${num}. Please add real content to the database.`,
                    answer_text: `This is the placeholder answer for box #${num}.`
                });
            }
        } catch (e) {
            console.error('Failed to fetch question:', e);
        } finally {
            setIsLoading(false);
        }
    };

    const closeQuestion = () => {
        setSelectedQuestion(null);
        setClickOrigin(null);
    };

    const refreshMission = useCallback(async () => {
        setIsLoading(true);
        const userId = (window as AppWindow).__USER_ID__ || 'demo-user';
        try {
            const revResp = await fetch(`/api/gamification/revision?userId=${userId}&subject=${activeSubject}`);
            const revData = await revResp.json();
            setRevisions(revData.revisions || []);

            const missionResp = await fetch(`/api/gamification/mission?userId=${userId}`);
            const missionData = await missionResp.json();
            setMission(missionData.mission);
        } catch (e) {
            console.error('Failed to sync m4 data:', e);
        } finally {
            setIsLoading(false);
        }
    }, [activeSubject]);

    useEffect(() => {
        refreshMission();
    }, [refreshMission]);

    return (
        <GamificationContext.Provider value={{ 
            revisions, mission, activeSubject, setActiveSubject, 
            theme, toggleTheme, selectedQuestion, clickOrigin, openQuestion, closeQuestion, 
            refreshMission, isLoading 
        }}>
            <div className={theme}>
                {children}
            </div>
        </GamificationContext.Provider>
    );
}

export const useGamification = () => {
    const context = useContext(GamificationContext);
    if (!context) throw new Error('useGamification must be used within provider');
    return context;
};
