'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamification } from './GamificationContext';

export const SUBJECT_CONFIG: Record<string, { label: string; color: string; target: number }> = {
    M4: { label: 'M4_CALCULUS', color: '#ddb7ff', target: 120 },
    WEBX: { label: 'WEBX_FULLSTACK', color: '#adc6ff', target: 30 },
    TCS: { label: 'TCS_APTITUDE', color: '#4edea3', target: 60 },
    M3: { label: 'M3_INTEGRALS', color: '#f59e0b', target: 120 },
};

export default function DailyMissionCard() {
    const { revisions, mission, activeSubject, refreshMission, theme } = useGamification();
    const [isExpanded, setIsExpanded] = useState(true);
    const [solvingId, setSolvingId] = useState<string | null>(null);

    const subjectData = mission?.subject_data || {};

    const dDayCountdown = useMemo(() => {
        if (!subjectData[activeSubject]?.d_day) return null;
        const diff = new Date(subjectData[activeSubject].d_day).getTime() - new Date().getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
    }, [subjectData, activeSubject]);

    const handleSolveRevision = async (topicName: string) => {
        const userId = (window as any).__USER_ID__ || 'demo-user';
        setSolvingId(topicName);
        try {
            const resp = await fetch('/api/gamification/mission', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, type: 'revision', topicName, subject: activeSubject })
            });
            const data = await resp.json();
            if (data.success) {
                await refreshMission();
            }
        } catch (e) {
            console.error('Failed to solve revision:', e);
        } finally {
            setSolvingId(null);
        }
    };

    return (
        <motion.div
            className={`w-full bg-white/[0.03] border border-white/10 rounded-2xl p-10 text-white relative overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-all group`}
        >
            <div className="absolute top-0 right-0 p-8">
                 <div className="flex gap-1.5">
                    {[1, 0.6, 0.3].map((opacity, i) => (
                        <motion.div 
                            key={i}
                            animate={{ opacity: [opacity, 0.1, opacity] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                            className="w-1.5 h-1.5 rounded-full bg-white"
                        />
                    ))}
                </div>
            </div>

            <div className="flex justify-between items-start mb-14">
                <div className="space-y-4">
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase font-tactical flex items-center gap-3">
                         <span className="text-white">CORTEX</span>
                         <span className="text-white/20">CONTROL</span>
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_20px_rgba(16,185,129,1)]" />
                        <span className="text-[10px] font-black tracking-[0.5em] text-emerald-500 uppercase font-tactical">
                           {dDayCountdown}_DAYS_UNTIL_SYNC
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-12">
                {Object.entries(SUBJECT_CONFIG).map(([key, config]) => {
                    const data = subjectData[key] || { completed: 0, target: config.target };
                    const isSelected = activeSubject === key;
                    const progress = Math.min((data.completed / data.target) * 100, 100);
                    
                    return (
                        <div key={key} className={`transition-all duration-1000 ${isSelected ? 'opacity-100 scale-100' : 'opacity-20 scale-95 origin-left'}`}>
                            <div className="flex justify-between items-end mb-5 font-tactical">
                                <span className={`text-[12px] font-black tracking-[0.5em] ${isSelected ? 'text-white' : 'text-white/40'}`}>
                                    {config.label}
                                </span>
                                <span className="text-[16px] font-black flex items-baseline gap-2">
                                    {data.completed}
                                    <span className="opacity-10 text-[10px]">/ {data.target}</span>
                                </span>
                            </div>
                            <div className="h-3 bg-black/40 rounded-full relative overflow-hidden border border-white/10 p-[2px]">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="h-full rounded-full relative"
                                    style={{ 
                                        backgroundColor: config.color,
                                        boxShadow: isSelected ? `0 0 30px ${config.color}` : 'none' 
                                    }}
                                >
                                    {isSelected && (
                                        <motion.div 
                                            animate={{ x: ['-100%', '200%'] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent w-full"
                                        />
                                    )}
                                </motion.div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-20 pt-10 border-t border-white/5">
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between group py-5 px-8 bg-white/5 hover:bg-white/10 border border-white/5 transition-all rounded-xl font-tactical"
                >
                    <span className="text-[11px] font-black tracking-[0.6em] text-white/40 group-hover:text-white transition-all uppercase flex items-center gap-4">
                        <div className="w-1 h-3 bg-purple-500 rounded-full" />
                        SYNAPTIC_PATHWAYS ({revisions.length})
                    </span>
                    <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} className="text-xs opacity-30 group-hover:opacity-100 transition-all">▼</motion.span>
                </button>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-8 space-y-5 overflow-hidden pr-2"
                        >
                            {revisions.length > 0 ? (
                                revisions.map((rev) => (
                                    <div key={rev.id} className="bg-black/20 border border-white/5 p-8 flex justify-between items-center group relative hover:border-purple-500/50 transition-all rounded-xl overflow-hidden hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                                        <div className="absolute inset-y-0 left-0 w-1 bg-white/5 group-hover:bg-purple-500 transition-all" />
                                        <div className="space-y-2">
                                            <span className="text-[16px] font-bold italic text-white font-tactical tracking-tight block">{rev.topic_name}</span>
                                            <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.5em] font-tactical group-hover:text-purple-500/50 transition-all">NEURAL_STAGE_{rev.interval_stage}</span>
                                        </div>
                                        <button 
                                            onClick={() => handleSolveRevision(rev.topic_name)}
                                            disabled={solvingId === rev.topic_name}
                                            className={`px-10 py-4 text-[11px] font-black font-tactical tracking-widest transition-all rounded-lg active:scale-90
                                                ${theme === 'dark' ? 'bg-white text-black hover:bg-purple-500 hover:text-white' : 'bg-black text-white hover:bg-purple-600'}
                                            `}
                                        >
                                            {solvingId === rev.topic_name ? 'SYNCING...' : 'RE-ACTIVATE'}
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl opacity-20 group-hover:opacity-40 transition-all">
                                    <p className="text-[12px] font-black tracking-[1em] font-tactical uppercase">NEURAL_STASIS_PENDING</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
