'use client';

import React, { useMemo, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useGamification } from './GamificationContext';

interface SnakeLadderBoardProps {
    currentBox?: number;
    totalBoxes?: number;
    subjectKey?: string;
}

const JUMPS: Record<string, Record<number, number>> = {
    "M4": { 4: 25, 13: 46, 33: 49, 42: 63, 50: 69, 74: 92, 27: 5, 40: 21, 43: 18, 54: 31, 66: 45, 89: 53, 99: 41, 115: 93 },
    "WEBX": { 4: 15, 12: 24, 21: 8, 28: 10 },
    "TCS": { 10: 25, 35: 50, 20: 5, 45: 30, 58: 41 },
    "M3": { 4: 25, 13: 46, 33: 49, 74: 92, 50: 69, 27: 5, 40: 21, 54: 31, 66: 45, 89: 53 }
};

export default function SnakeLadderBoard({ currentBox = 1, totalBoxes = 120, subjectKey = "M4" }: SnakeLadderBoardProps) {
    const { openQuestion } = useGamification();
    const COLS = 12;

    const getNodeCoords = useMemo(() => (num: number) => {
        const index = num - 1;
        const row = Math.floor(index / COLS);
        const col = index % COLS;
        const isReverse = row % 2 !== 0;
        
        const wobble = Math.sin(col * 0.8) * 3.5;
        const y = 92 - (row * 8.5) + wobble; 
        const xBase = isReverse ? (94 - (col * 8)) : (6 + (col * 8));
        const x = xBase + (Math.cos(row * 2) * 2.5);
        
        return { x, y };
    }, [COLS]);

    const boxes = useMemo(() => {
        const arr = [];
        for (let i = 1; i <= totalBoxes; i++) arr.push(i);
        return arr;
    }, [totalBoxes]);

    // Enhanced Synaptic Network
    const backgroundSynapses = useMemo(() => {
        const synapses = [];
        for (let i = 1; i <= totalBoxes; i++) {
            const current = getNodeCoords(i);
            if (i < totalBoxes) {
                 synapses.push({ start: i, end: i + 1, sCoords: current, eCoords: getNodeCoords(i + 1), weight: 1.8, type: 'seq' });
            }
            if (i + COLS <= totalBoxes && i % 7 !== 0) {
                 synapses.push({ start: i, end: i + COLS, sCoords: current, eCoords: getNodeCoords(i + COLS), weight: 0.8, type: 'mesh' });
            }
            if (i + COLS + 1 <= totalBoxes && (i + Math.floor(i / COLS)) % 3 !== 0) {
                 synapses.push({ start: i, end: i + COLS + 1, sCoords: current, eCoords: getNodeCoords(i + COLS + 1), weight: 0.4, type: 'mesh' });
            }
        }
        return synapses;
    }, [totalBoxes, getNodeCoords, COLS]);

    const themeColor = useMemo(() => {
        switch(subjectKey) {
            case 'M4': return '168, 85, 247'; 
            case 'WEBX': return '59, 130, 246';
            case 'TCS': return '16, 185, 129';
            case 'M3': return '245, 158, 11';
            default: return '168, 85, 247';
        }
    }, [subjectKey]);

    // Parallax logic
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { damping: 50, stiffness: 200 });
    const springY = useSpring(mouseY, { damping: 50, stiffness: 200 });
    
    const rotateX = useTransform(springY, [-50, 50], [2, -2]);
    const rotateY = useTransform(springX, [-50, 50], [-2, 2]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 100;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 100;
        mouseX.set(x);
        mouseY.set(y);
    };

    return (
        <div 
            className="relative w-full h-full p-4 flex flex-col bg-[#030308] perspective-1000 overflow-hidden"
            onMouseMove={handleMouseMove}
        >
             {/* Neural Lighting */}
             <motion.div 
                className="absolute inset-0 z-0 pointer-events-none opacity-20"
                style={{ 
                    background: `radial-gradient(circle 800px at ${springX.get() + 50}% ${springY.get() + 50}%, rgba(${themeColor}, 0.2), transparent 70%)`
                }} 
             />

             {/* Dynamic Tech Grid */}
             <motion.div 
                className="absolute inset-0 z-0 opacity-[0.1] pointer-events-none" 
                style={{ 
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', 
                    backgroundSize: '40px 40px',
                    x: useTransform(springX, [-50, 50], [5, -5]),
                    y: useTransform(springY, [-50, 50], [5, -5])
                }} 
             />
             
             <motion.div 
                className="flex-1 relative w-full h-full z-10"
                style={{ rotateX, rotateY }}
             >
                
                {/* 🧠 Synaptic Network SVG */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    
                    {/* Synaptic Paths */}
                    {backgroundSynapses.map((syn, idx) => {
                         const isPassed = syn.end <= currentBox && syn.start <= currentBox;
                         const isFuture = syn.start > currentBox;
                         
                         let opacity = (syn.type === 'seq' ? (isPassed ? 0.4 : isFuture ? 0.1 : 0.8) : (isPassed ? 0.2 : isFuture ? 0.05 : 0.4)) * syn.weight;
                         const strokeColor = isPassed ? `rgba(${themeColor}, ${opacity})` : `rgba(100,120,150, ${opacity})`;

                         return (
                             <line 
                                key={`mesh-${idx}`}
                                x1={syn.sCoords.x} y1={syn.sCoords.y}
                                x2={syn.eCoords.x} y2={syn.eCoords.y}
                                stroke={strokeColor}
                                strokeWidth={syn.weight * 0.2}
                                strokeLinecap="round"
                             />
                         );
                    })}

                    {/* ⚡ High-Activity Synapses (Sequential Jumps) */}
                    <motion.path
                        d={backgroundSynapses.filter(s => s.type === 'seq').map((s, i) => i === 0 ? `M ${s.sCoords.x} ${s.sCoords.y} L ${s.eCoords.x} ${s.eCoords.y}` : `L ${s.eCoords.x} ${s.eCoords.y}`).join(' ')}
                        stroke={`rgba(${themeColor}, 0.5)`}
                        strokeWidth="0.5"
                        fill="none"
                        strokeDasharray="1,15"
                        animate={{ strokeDashoffset: [40, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />

                    {/* 🚀 Hyper-Synapses (Long Distance Cortical Links) */}
                    {Object.entries(JUMPS[subjectKey] || {}).map(([start, end]) => {
                        const sNum = parseInt(start);
                        const eNum = end; // end is already a number from Object.entries value
                        const s = getNodeCoords(sNum);
                        const e = getNodeCoords(eNum);
                        const isLadder = eNum > sNum;
                        const color = isLadder ? '34, 197, 94' : '239, 68, 68'; 
                        
                        const midX = s.x + (e.x - s.x) * 0.5 + (Math.sin(sNum) * 10);
                        const midY = s.y + (e.y - s.y) * 0.5 + (isLadder ? -15 : 15);
                        
                        return (
                            <g key={`jump-${start}-${end}`}>
                                <path
                                    d={`M ${s.x} ${s.y} Q ${midX} ${midY} ${e.x} ${e.y}`}
                                    stroke={`rgba(${color}, 0.15)`}
                                    strokeWidth="1"
                                    fill="none"
                                />
                                <circle r="0.8" fill={`rgb(${color})`}>
                                    <animateMotion dur={isLadder ? "2s" : "3s"} repeatCount="indefinite" path={`M ${s.x} ${s.y} Q ${midX} ${midY} ${e.x} ${e.y}`} />
                                </circle>
                                <motion.circle r="2" fill={`rgba(${color}, 0.2)`} animate={{ scale: [1, 2, 1], opacity: [0.1, 0.4, 0.1] }} transition={{ duration: 2, repeat: Infinity }}>
                                     <animateMotion dur={isLadder ? "2s" : "3s"} repeatCount="indefinite" path={`M ${s.x} ${s.y} Q ${midX} ${midY} ${e.x} ${e.y}`} />
                                </motion.circle>
                            </g>
                        );
                    })}
                </svg>

                {/* 🔮 Neurons */}
                {boxes.map((num) => {
                    const { x, y } = getNodeCoords(num);
                    const isCurrent = num === currentBox;
                    const isPassed = num < currentBox;

                    let scale = isPassed ? 0.7 : 1;
                    let neuronColor = `rgba(180, 180, 220, 0.4)`;

                    if (isCurrent) {
                        scale = 1.4;
                        neuronColor = `rgba(${themeColor}, 1)`;
                    } else if (isPassed) {
                        neuronColor = `rgba(${themeColor}, 0.8)`;
                    }

                    return (
                        <motion.div
                            key={num}
                            onClick={(e) => openQuestion(num, { x: e.clientX, y: e.clientY })}
                            whileHover={{ scale: 2.2, zIndex: 100 }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 group"
                            style={{ left: `${x}%`, top: `${y}%`, zIndex: isCurrent ? 50 : 10 }}
                        >
                            <div 
                                className="relative flex items-center justify-center rounded-full backdrop-blur-xl"
                                style={{
                                    width: `${24 * scale}px`,
                                    height: `${24 * scale}px`,
                                    background: isCurrent ? `radial-gradient(circle at center, #fff, rgba(${themeColor},0.5))` : `rgba(255,255,255,0.03)`,
                                    boxShadow: isCurrent ? `0 0 50px rgba(${themeColor}, 1), 0 0 100px rgba(${themeColor}, 0.3)` : (isPassed ? `0 0 15px rgba(${themeColor}, 0.3)` : 'none'),
                                    border: isCurrent ? `2px solid #fff` : `1px solid rgba(255,255,255,0.1)`
                                }}
                            >
                                {/* Node ID */}
                                <span className={`text-[8px] font-black italic tracking-tighter transition-all ${isCurrent ? 'text-black opacity-100' : 'text-white opacity-20 group-hover:opacity-100 group-hover:scale-125'}`}>
                                    {num}
                                </span>

                                {/* Neural Core */}
                                <div 
                                    className="absolute w-1.5 h-1.5 rounded-full bg-white blur-[0.5px]"
                                    style={{ opacity: isCurrent ? 0.8 : (isPassed ? 0.3 : 0), boxShadow: '0 0 10px #fff' }}
                                />

                                {/* Pulse */}
                                {isCurrent && (
                                    <motion.div 
                                        className="absolute inset-0 rounded-full border-2 border-white"
                                        animate={{ scale: [1, 3], opacity: [0.5, 0] }} 
                                        transition={{ duration: 2, repeat: Infinity }} 
                                    />
                                )}
                            </div>
                        </motion.div>
                    );
                })}

                {/* Markers */}
                <div className="absolute left-[3%] bottom-[5%] flex items-center gap-4 bg-black/40 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md">
                    <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_20px_#f59e0b] animate-bounce"/>
                    <span className="text-white/40 text-[9px] font-black tracking-[0.4em] uppercase font-tactical">NEURAL_INPUT_SEC_01</span>
                </div>
                <div className="absolute right-[3%] top-[5%] flex items-center gap-4 bg-black/40 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md">
                    <span className="text-white/40 text-[9px] font-black tracking-[0.4em] uppercase font-tactical">SYNC_COMPLETE_SEC_120</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_20px_#10b981] animate-bounce"/>
                </div>
            </motion.div>
        </div>
    );
}
