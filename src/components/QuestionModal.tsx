'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingCanvasEditor from './FloatingCanvasEditor';
import { useGamification } from './GamificationContext';

type AppWindow = Window & { __USER_ID__?: string };
type ClickVars = React.CSSProperties & { '--click-x': string; '--click-y': string };
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface DraftPayload {
    question: string;
    answer: string;
    updatedAt: number;
}

function escapeHtml(value: string) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function formatCanvasContent(value: string) {
    if (!value) return '';

    const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(value);
    if (hasHtmlTags) return value;

    return value
        .split('\n')
        .map((line) => `<p>${line.trim() ? escapeHtml(line) : '<br>'}</p>`)
        .join('');
}

function getDraftKey(subject: string, questionNumber: number) {
    return `m4-draft:${subject}:${questionNumber}`;
}

export default function QuestionModal() {
    const { selectedQuestion, clickOrigin, closeQuestion, refreshMission, activeSubject } = useGamification();
    const [isSolving, setIsSolving] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [editData, setEditData] = useState({ question: '', answer: '' });
    const [saveState, setSaveState] = useState<SaveState>('idle');
    const [saveMessage, setSaveMessage] = useState('Auto-save ready');
    const hydratedDraftRef = useRef(false);
    const saveTimerRef = useRef<number | null>(null);
    const statusTimerRef = useRef<number | null>(null);
    const latestSavedRef = useRef({ question: '', answer: '' });

    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    useEffect(() => {
        return () => {
            if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
            if (statusTimerRef.current) window.clearTimeout(statusTimerRef.current);
        };
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        const previousOverflow = document.body.style.overflow;
        const previousTouchAction = document.body.style.touchAction;

        if (selectedQuestion) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.overflow = previousOverflow;
            document.body.style.touchAction = previousTouchAction;
        }

        return () => {
            document.body.style.overflow = previousOverflow;
            document.body.style.touchAction = previousTouchAction;
        };
    }, [isMounted, selectedQuestion]);

    useEffect(() => {
        if (selectedQuestion) {
            hydratedDraftRef.current = false;
            setEditData({
                question: selectedQuestion.question_text || '',
                answer: selectedQuestion.answer_text || '',
            });
            latestSavedRef.current = {
                question: selectedQuestion.question_text || '',
                answer: selectedQuestion.answer_text || '',
            };
            setSaveState('idle');
            setSaveMessage('Auto-save ready');
        }
    }, [selectedQuestion]);

    useEffect(() => {
        if (!selectedQuestion || !isMounted || hydratedDraftRef.current) return;

        const draftKey = getDraftKey(activeSubject, selectedQuestion.question_number);
        const draftRaw = window.localStorage.getItem(draftKey);
        hydratedDraftRef.current = true;

        if (!draftRaw) return;

        try {
            const parsed = JSON.parse(draftRaw) as DraftPayload;
            if (!parsed.question && !parsed.answer) return;

            setEditData({
                question: parsed.question || selectedQuestion.question_text || '',
                answer: parsed.answer || selectedQuestion.answer_text || '',
            });
            setSaveState('saved');
            setSaveMessage('Draft restored from this device');
        } catch {
            window.localStorage.removeItem(draftKey);
        }
    }, [activeSubject, isMounted, selectedQuestion]);

    const persistDraftLocally = (payload: DraftPayload) => {
        if (!selectedQuestion || !isMounted) return;
        const draftKey = getDraftKey(activeSubject, selectedQuestion.question_number);
        window.localStorage.setItem(draftKey, JSON.stringify(payload));
    };

    const clearSavedDraft = () => {
        if (!selectedQuestion || !isMounted) return;
        const draftKey = getDraftKey(activeSubject, selectedQuestion.question_number);
        window.localStorage.removeItem(draftKey);
    };

    const queueStatusReset = () => {
        if (statusTimerRef.current) window.clearTimeout(statusTimerRef.current);
        statusTimerRef.current = window.setTimeout(() => {
            setSaveState('idle');
            setSaveMessage('Auto-save ready');
        }, 2200);
    };

    const saveQuestionData = async (source: 'manual' | 'auto') => {
        if (!selectedQuestion) return false;

        setSaveState('saving');
        setSaveMessage(source === 'manual' ? 'Saving now...' : 'Auto-saving draft...');

        const payload = {
            subject: activeSubject,
            questionNumber: selectedQuestion.question_number,
            questionText: editData.question,
            answerText: editData.answer,
        };

        try {
            const resp = await fetch('/api/gamification/questions/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await resp.json();

            if (!resp.ok || !data.success) {
                throw new Error(data.error || 'Save failed');
            }

            await refreshMission();
            selectedQuestion.question_text = editData.question;
            selectedQuestion.answer_text = editData.answer;
            latestSavedRef.current = {
                question: editData.question,
                answer: editData.answer,
            };
            clearSavedDraft();
            setSaveState('saved');
            setSaveMessage(source === 'manual' ? 'Saved to database' : 'Auto-saved to database');
            queueStatusReset();
            return true;
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Save failed';
            persistDraftLocally({
                question: editData.question,
                answer: editData.answer,
                updatedAt: Date.now(),
            });
            setSaveState('error');
            setSaveMessage(`Saved locally only: ${message}`);
            return false;
        }
    };

    useEffect(() => {
        if (!selectedQuestion || !hydratedDraftRef.current) return;

        persistDraftLocally({
            question: editData.question,
            answer: editData.answer,
            updatedAt: Date.now(),
        });

        const unchanged =
            editData.question === latestSavedRef.current.question &&
            editData.answer === latestSavedRef.current.answer;

        if (unchanged) return;

        setSaveState('idle');
        setSaveMessage('Draft saved locally');

        if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = window.setTimeout(() => {
            void saveQuestionData('auto');
        }, 1400);
    }, [editData, selectedQuestion]);

    const themeColors = useMemo(() => {
        switch (activeSubject) {
            case 'M4':
                return { main: 'rgb(74, 222, 128)' };
            case 'WEBX':
                return { main: 'rgb(59, 130, 246)' };
            case 'TCS':
                return { main: 'rgb(16, 185, 129)' };
            case 'M3':
                return { main: 'rgb(245, 158, 11)' };
            default:
                return { main: 'rgb(74, 222, 128)' };
        }
    }, [activeSubject]);

    if (!selectedQuestion || !isMounted) return null;

    const handleSave = async () => {
        if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
        await saveQuestionData('manual');
    };

    const handleSolve = async () => {
        setIsSolving(true);
        const userId = (window as AppWindow).__USER_ID__ || 'demo-user';
        try {
            const resp = await fetch('/api/gamification/mission', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    type: 'revision',
                    topicName: `Node ${selectedQuestion.question_number}`,
                    subject: activeSubject,
                }),
            });
            const data = await resp.json();
            if (data.success) {
                await refreshMission();
                closeQuestion();
            }
        } catch (e) {
            console.error('Failed to solve question:', e);
        } finally {
            setIsSolving(false);
        }
    };

    return createPortal(
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[99999] flex h-dvh w-screen flex-col overflow-y-auto overflow-x-hidden bg-black/95 text-white"
                style={{
                    '--click-x': `${clickOrigin?.x || 50}px`,
                    '--click-y': `${clickOrigin?.y || 50}px`,
                } as ClickVars}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="absolute left-0 top-0 z-0 h-[220vmax] w-[220vmax] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                    style={{
                        left: 'var(--click-x)',
                        top: 'var(--click-y)',
                        background:
                            'radial-gradient(circle at center, rgba(241,255,246,1) 0%, rgba(132,255,185,0.98) 7%, rgba(74,222,128,0.92) 13%, rgba(17,77,40,0.95) 27%, rgba(3,17,9,0.98) 49%, rgba(0,0,0,1) 72%)',
                        boxShadow:
                            '0 0 80px rgba(110,255,173,0.95), inset 0 0 120px rgba(110,255,173,0.35)',
                    }}
                    initial={{ scale: 0.01, opacity: 1 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.01, opacity: 0 }}
                    transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
                />

                <motion.div
                    className="absolute inset-0 z-[1] pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.25, duration: 0.45 }}
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--click-x)_var(--click-y),rgba(235,255,242,1)_0%,rgba(166,255,204,0.98)_3%,rgba(74,222,128,0.55)_9%,rgba(74,222,128,0.18)_16%,transparent_26%)]" />
                    <div className="omnitrix-rings absolute inset-0" />
                    <div className="omnitrix-scanlines absolute inset-0 opacity-80" />
                    <div className="omnitrix-core absolute left-1/2 top-1/2 h-[82vmin] w-[82vmin] -translate-x-1/2 -translate-y-1/2 rounded-full" />
                </motion.div>

                <svg className="absolute inset-0 z-[2] h-full w-full pointer-events-none opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path
                        className="suit-mesh"
                        d="M 0 0 L 100 100 M 0 100 L 100 0 M 50 0 L 50 100 M 0 50 L 100 50"
                        stroke={themeColors.main}
                        strokeWidth="0.05"
                        fill="none"
                    />
                    {Array.from({ length: 18 }).map((_, i) => (
                        <circle key={i} cx={(i * 17) % 100} cy={(i * 29) % 100} r="0.12" fill={themeColors.main} className="animate-pulse" />
                    ))}
                </svg>

                <div className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-56 bg-gradient-to-b from-emerald-300/18 via-emerald-400/6 to-transparent" />

                <motion.div
                    className="relative z-10 flex min-h-dvh flex-col p-3 pt-4 sm:p-6 lg:p-10"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: 0.72, duration: 0.35, ease: 'easeOut' }}
                >
                    <header className="mb-6 flex flex-col gap-4 pr-14 sm:pr-16 lg:mb-8 lg:flex-row lg:items-start lg:justify-between lg:pr-0">
                        <div className="space-y-4">
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-wrap items-center gap-4"
                            >
                                <span className="font-tactical text-[10px] font-black uppercase tracking-[0.8em] text-white/40">
                                    NODE_ACTIVE // {selectedQuestion.question_number}
                                </span>
                                <div className="h-px w-16 bg-white/10" />
                                <span className="font-tactical text-[10px] font-black tracking-[0.8em]" style={{ color: themeColors.main }}>
                                    {activeSubject}_CORE
                                </span>
                            </motion.div>
                            <motion.h1
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="glitch-text font-tactical text-4xl font-black italic uppercase leading-none tracking-tighter sm:text-5xl lg:text-7xl"
                            >
                                OMNITRIX MODE
                            </motion.h1>
                            <p className="max-w-2xl text-xs uppercase tracking-[0.35em] text-emerald-200/40 sm:text-sm">
                                Full screen question chamber. Add your question and answer inside this screen.
                            </p>
                            <div className="font-tactical text-[10px] uppercase tracking-[0.3em] text-emerald-100/70">
                                {saveState === 'saving' ? 'SYNC STATUS // SAVING' : `SYNC STATUS // ${saveMessage}`}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 self-end lg:self-auto">
                            <button
                                onClick={handleSave}
                                disabled={isSolving}
                                className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 font-tactical text-[9px] font-black tracking-[0.22em] transition-all hover:border-emerald-300 hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60 sm:px-6 sm:text-[10px] lg:px-8 lg:text-[11px]"
                            >
                                {isSolving ? 'SAVING...' : 'SAVE QA'}
                            </button>
                            <button
                                onClick={closeQuestion}
                                type="button"
                                aria-label="Exit question modal"
                                className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-2xl backdrop-blur-md transition-all hover:border-red-500 hover:bg-red-500/20 sm:h-12 sm:w-12 lg:h-14 lg:w-14"
                            >
                                <span className="text-white/30 transition-all duration-500 group-hover:rotate-90 group-hover:text-red-500">x</span>
                            </button>
                        </div>
                    </header>

                    <div className="flex min-h-0 flex-1 flex-col gap-6 xl:flex-row">
                        <motion.div
                            initial={{ scale: 0.96, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.35 }}
                            className="relative flex min-h-[44rem] min-w-0 flex-1 flex-col overflow-hidden rounded-[2rem] border border-emerald-300/25 bg-black/35 p-6 shadow-[0_0_120px_rgba(34,197,94,0.14)] backdrop-blur-xl sm:p-8 lg:min-h-[48rem] lg:p-10"
                        >
                            <div
                                className="absolute inset-0 pointer-events-none opacity-[0.05]"
                                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)', backgroundSize: '15px 15px' }}
                            />
                            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(74,222,128,0.12),transparent_30%)]" />

                            <div className="relative z-10 flex items-center justify-between gap-4">
                                <span className="font-tactical text-[10px] font-black uppercase tracking-[0.6em] text-white/35">QUESTION CORE</span>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(74,222,128,1)]" />
                                    <span className="font-tactical text-[10px] uppercase tracking-[0.4em] text-emerald-300/60">LIVE</span>
                                </div>
                            </div>

                            <div className="relative z-10 mt-8 min-h-0 flex-1">
                                <FloatingCanvasEditor
                                    label="QUESTION CLOUD"
                                    value={editData.question}
                                    onChange={(question) => setEditData({ ...editData, question })}
                                    placeholder="Type your question here and paste screenshots, formulas, or notes..."
                                    autoFocus
                                />
                            </div>

                            <div className="relative z-10 mt-8 grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                    <div className="font-tactical text-[10px] uppercase tracking-[0.45em] text-white/30">NODE</div>
                                    <div className="mt-2 text-2xl font-black text-emerald-300">{selectedQuestion.question_number}</div>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                    <div className="font-tactical text-[10px] uppercase tracking-[0.45em] text-white/30">SUBJECT</div>
                                    <div className="mt-2 text-2xl font-black text-white">{activeSubject}</div>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                    <div className="font-tactical text-[10px] uppercase tracking-[0.45em] text-white/30">MODE</div>
                                    <div className="mt-2 text-2xl font-black text-white">EDIT</div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="flex w-full min-w-0 flex-col gap-6 xl:w-[34rem] xl:max-w-[34rem]">
                            <motion.div
                                initial={{ x: 24, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.45 }}
                                className="relative flex min-h-[34rem] flex-1 flex-col justify-between overflow-hidden rounded-[2rem] border border-emerald-300/20 bg-black/35 p-6 backdrop-blur-xl sm:p-8"
                            >
                                <div className="space-y-6">
                                    <span className="font-tactical text-[10px] font-black uppercase tracking-[0.5em] text-white/20">ANSWER VAULT</span>
                                    <FloatingCanvasEditor
                                        label="ANSWER CLOUD"
                                        value={editData.answer}
                                        onChange={(answer) => setEditData({ ...editData, answer })}
                                        placeholder="Type the answer and paste any supporting image..."
                                        accentClassName="text-lime-600"
                                    />
                                </div>

                                <button
                                    onClick={handleSave}
                                    className="mt-8 w-full rounded-xl bg-white py-5 font-tactical text-[11px] font-black uppercase tracking-[0.5em] text-black shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all hover:bg-emerald-400"
                                >
                                    {isSolving ? 'SAVING...' : 'SAVE QUESTION + ANSWER'}
                                </button>
                            </motion.div>

                            <motion.div
                                initial={{ y: 24, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.55 }}
                                className="flex flex-col gap-6 rounded-[2rem] border border-emerald-200/60 bg-gradient-to-br from-emerald-300 via-lime-200 to-emerald-100 p-6 text-black shadow-[0_40px_100px_rgba(0,0,0,1)] sm:p-8"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-tactical text-[10px] font-black uppercase tracking-[0.4em] opacity-50">MARK COMPLETE</span>
                                    <div className="h-3 w-3 animate-pulse rounded-full bg-emerald-500" />
                                </div>
                                <button
                                    onClick={handleSolve}
                                    disabled={isSolving}
                                    className={`w-full py-6 font-tactical text-[13px] font-black uppercase tracking-[0.6em] transition-all ${
                                        !isSolving ? 'bg-black text-white hover:bg-emerald-950' : 'cursor-not-allowed bg-black/30 text-white/60'
                                    }`}
                                >
                                    {isSolving ? 'PROCESSING...' : 'DONE FOR TODAY'}
                                </button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
        ,
        document.body
    );
}
