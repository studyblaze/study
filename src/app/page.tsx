'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DailyMissionCard, { SUBJECT_CONFIG } from '@/components/DailyMissionCard';
import SnakeLadderBoard from '@/components/SnakeLadderBoard';
import QuestionModal from '@/components/QuestionModal';
import { GamificationProvider, useGamification } from '@/components/GamificationContext';

function SynapticAtmosphere() {
    const [points, setPoints] = useState<{ x: number, y: number, size: number, driftX: number, driftY: number, duration: number }[]>([]);
    
    useEffect(() => {
        const p = Array.from({ length: 40 }).map(() => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: 1 + Math.random() * 2,
            driftX: Math.random() * 10 - 5,
            driftY: Math.random() * 10 - 5,
            duration: 5 + Math.random() * 10,
        }));
        setPoints(p);
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
            {points.map((p, i) => (
                <motion.div
                    key={i}
                    className="absolute bg-white rounded-full blur-[1px]"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
                    animate={{ 
                        opacity: [0.1, 0.5, 0.1],
                        scale: [1, 1.5, 1],
                        x: [0, p.driftX],
                        y: [0, p.driftY]
                    }}
                    transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut" }}
                />
            ))}
        </div>
    );
}

function ExamCommanderDashboard() {
    const { mission, activeSubject, setActiveSubject, theme, toggleTheme, openQuestion } = useGamification();
    const subjects = ['M4', 'WEBX', 'TCS', 'M3'];
    
    const currentStats = useMemo(() => {
        if (mission?.subject_data[activeSubject]) return mission.subject_data[activeSubject];
        return { 
            position: 1, 
            total: SUBJECT_CONFIG[activeSubject]?.target || 120, 
            d_day: '2026-05-12' 
        };
    }, [mission, activeSubject]);

    const [todayDate, setTodayDate] = useState('');

    useEffect(() => {
        setTodayDate(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase());
    }, []);

    const mathIntel = useMemo(() => {
        const dDay = new Date(currentStats.d_day).getTime();
        const now = new Date().getTime();
        const daysLeft = Math.max(1, Math.ceil((dDay - now) / (1000 * 3600 * 24)));
        const questionsLeft = currentStats.total - currentStats.position + 1;
        const velocity = (questionsLeft / daysLeft).toFixed(1);
        return { daysLeft, questionsLeft, velocity };
    }, [currentStats]);

    const statusColor = useMemo(() => {
        switch(activeSubject) {
            case 'M4': return 'text-purple-400';
            case 'WEBX': return 'text-blue-400';
            case 'TCS': return 'text-emerald-400';
            case 'M3': return 'text-amber-400';
            default: return 'text-purple-400';
        }
    }, [activeSubject]);

    return (
        <main className="fixed inset-0 h-screen w-screen bg-[#05050a] text-[#e5e2e1] overflow-hidden selection:bg-purple-500/30">
            
            <SynapticAtmosphere />

            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#e5e2e1 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

            <div className="relative z-10 h-full flex flex-row">
                
                {/* Left: Neural Core Display */}
                <div className="flex-1 flex flex-col h-full overflow-hidden p-6 lg:p-10">
                    <header className="flex items-center justify-between gap-6 mb-6">
                        <div className="space-y-2">
                             <div className="flex items-center gap-4">
                                <div className="px-5 py-1.5 bg-black/40 border border-white/10 rounded-full text-[9px] font-black tracking-[0.6em] text-white/40 font-tactical backdrop-blur-md">
                                   CORTEX_SYNC // V4.2.0
                                </div>
                                <button onClick={toggleTheme} className="p-2 px-4 bg-white/5 border border-white/5 rounded-full hover:bg-white/10 transition-all text-[12px] backdrop-blur-md">
                                    {theme === 'dark' ? '☀️' : '🌙'}
                                </button>
                            </div>
                            <motion.h1 
                                key={activeSubject + 't'}
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-5xl lg:text-7xl font-black tracking-tighter uppercase italic leading-none font-tactical flex items-baseline gap-6"
                            >
                                <span className={statusColor}>
                                    {activeSubject}
                                </span>
                                <span className="text-white text-3xl opacity-20 tracking-[0.5em] font-normal">NEURAL_SYNC</span>
                            </motion.h1>
                            <button
                                onClick={(e) => openQuestion(currentStats.position, { x: e.clientX, y: e.clientY })}
                                className="inline-flex items-center gap-3 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-5 py-3 font-tactical text-[11px] font-black uppercase tracking-[0.35em] text-emerald-200 transition-all hover:border-emerald-300 hover:bg-emerald-400/20 hover:text-white"
                            >
                                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,1)]" />
                                OPEN DAY {currentStats.position}
                            </button>
                        </div>

                        <div className="flex bg-black/40 p-1.5 rounded-full border border-white/10 shadow-2xl backdrop-blur-3xl">
                            {subjects.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setActiveSubject(s)}
                                    className={`px-8 lg:px-10 py-3 rounded-full text-[10px] font-black tracking-[0.4em] uppercase transition-all duration-500 relative font-tactical
                                        ${activeSubject === s ? 'text-black' : 'text-white/40 hover:text-white'}
                                    `}
                                >
                                    {activeSubject === s && (
                                        <motion.div layoutId="sActive_neural" className="absolute inset-0 z-0 bg-white" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                                    )}
                                    <span className="relative z-10">{s}</span>
                                </button>
                            ))}
                        </div>
                    </header>

                    <div className="flex-1 relative rounded-2xl bg-black/20 border border-white/[0.06] shadow-2xl overflow-hidden backdrop-blur-sm group">
                        {/* Corner Accents */}
                        <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-white/20 rounded-tl-2xl pointer-events-none" />
                        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-white/20 rounded-br-2xl pointer-events-none" />

                        <SnakeLadderBoard 
                            currentBox={currentStats.position} 
                            totalBoxes={currentStats.total} 
                            subjectKey={activeSubject}
                        />
                        
                         <button 
                            onClick={(e) => openQuestion(currentStats.position, { x: e.clientX, y: e.clientY })}
                            className="absolute bottom-10 right-10 px-12 py-5 bg-white text-black font-black tracking-[0.6em] uppercase text-[10px] font-tactical transition-all z-50 hover:bg-purple-600 hover:text-white hover:px-14 shadow-[0_0_60px_white] active:scale-95"
                        >
                            ACTIVATE_NODE: {currentStats.position}
                        </button>
                    </div>
                </div>

                {/* Right: Cortex Monitor */}
                <aside className="w-80 lg:w-[450px] h-full flex flex-col gap-6 p-6 lg:p-10 bg-black/20 border-l border-white/10 relative z-20 backdrop-blur-xl">
                    <DailyMissionCard />
                    
                    <div className="flex-1 flex flex-col gap-6 overflow-y-auto scrollbar-hide">
                         <div className="bg-white/[0.02] border border-white/10 p-10 rounded-2xl shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.7em] mb-10 font-tactical border-b border-white/5 pb-4">SYNAPTIC_MONITOR</h3>
                            <div className="space-y-6">
                                <IntelWidget label="REMAINING_DAYS" value={mathIntel.daysLeft} icon="⌛" />
                                <IntelWidget label="CORTEX_VELOCITY" value={`${mathIntel.velocity} Q/P`} icon="⚡" />
                                <div className="pt-8 flex justify-between items-center opacity-30">
                                    <span className="text-[9px] font-mono tracking-[0.4em] uppercase">{todayDate}</span>
                                    <div className="flex gap-1">
                                        {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-white animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            <QuestionModal />
        </main>
    );
}

function IntelWidget({ label, value, icon }: { label: string; value: string | number; icon: string }) {
    return (
        <div className="flex justify-between items-center bg-black/30 p-6 border border-white/[0.05] hover:border-white/20 transition-all rounded-xl group relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-1 bg-white/5 group-hover:bg-white/30 transition-all" />
            <div className="flex items-center gap-6">
                <span className="text-xl opacity-20 group-hover:opacity-100 transition-all group-hover:scale-110 duration-500">{icon}</span>
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] font-tactical group-hover:text-white transition-all">{label}</span>
            </div>
            <div className="text-3xl font-black italic font-tactical text-white group-hover:scale-110 transition-all duration-500">{value}</div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <GamificationProvider>
            <ExamCommanderDashboard />
        </GamificationProvider>
    );
}
