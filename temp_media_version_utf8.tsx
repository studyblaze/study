'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useTutorContext } from '@/components/TutorContext';
import { supabase } from '@/lib/supabaseClient';
import {
    ShieldCheck, Video, FileText, CheckCircle2, ArrowRight, X,
    Image as ImageIcon, File as FileIcon, HelpCircle, GraduationCap,
    Clock, Sparkles, UserPlus, Mail, Zap, Target, ArrowLeft,
    ChevronRight, Upload, BookOpen, Globe, User, Shield,
    Users, Info, Check, Award, Camera, Mic, Sun
} from 'lucide-react';
import { ALL_COUNTRIES } from '@/config/countries';
import { getFlagEmoji, countryToISO } from '@/lib/flags';
import CountrySelect from '@/components/CountrySelect';
import { pricingConfig } from '@/lib/pricingConfig';
import { usePricing } from '@/hooks/usePricing';
import { usePostHog } from 'posthog-js/react';

import LiveProfilePreview from '@/components/LiveProfilePreview';
import FullProfilePreview from '@/components/FullProfilePreview';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import { useTheme } from '@/components/ThemeProvider';

type Step = 1 | 2 | 3 | 4;

const SUBJECTS = [
    'Mathematics', 'Calculus', 'Algebra', 'Geometry', 'Trigonometry',
    'Statistics', 'Discrete Mathematics', 'Business Math', 'Financial Math',
    'Arithmetic', 'Number Theory', 'Probability', 'Logic'
];

const LANGUAGES = [
    'Albanian', 'Arabic', 'Armenian', 'Azerbaijani', 'Bengali', 'Bosnian',
    'Bulgarian', 'Catalan', 'Chinese', 'Croatian', 'Czech', 'Danish',
    'Dutch', 'English', 'Estonian', 'Finnish', 'French', 'Georgian',
    'German', 'Greek', 'Gujarati', 'Hebrew', 'Hindi', 'Hungarian',
    'Icelandic', 'Indonesian', 'Irish', 'Italian', 'Japanese', 'Kazakh',
    'Korean', 'Latvian', 'Lithuanian', 'Macedonian', 'Malay', 'Malayalam',
    'Maltese', 'Marathi', 'Mongolian', 'Norwegian', 'Persian', 'Polish',
    'Portuguese', 'Punjabi', 'Romanian', 'Russian', 'Serbian', 'Slovak',
    'Slovenian', 'Spanish', 'Swahili', 'Swedish', 'Tamil', 'Telugu',
    'Thai', 'Turkish', 'Ukrainian', 'Urdu', 'Uzbek', 'Vietnamese', 'Welsh'
];

const LANGUAGE_LEVELS = [
    { code: 'A1', label: 'A1 (Beginner)', description: 'Can understand/use basic phrases' },
    { code: 'A2', label: 'A2 (Elementary)', description: 'Can communicate in simple tasks' },
    { code: 'B1', label: 'B1 (Intermediate)', description: 'Can deal with most situations' },
    { code: 'B2', label: 'B2 (Upper Intermediate)', description: 'Can interact with degree of fluency' },
    { code: 'C1', label: 'C1 (Advanced)', description: 'Can express ideas fluently' },
    { code: 'C2', label: 'C2 (Proficient/Native)', description: 'Can understand/express with ease' }
];

export default function ApplyTutorPage() {
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setMounted(true);
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const clampValue = (min: number, max: number) => isMobile ? min : max;

    // Helper: Extract Video ID
    const getVideoId = (url: string) => {
        if (!url) return { id: null, type: null };
        
        // YouTube
        const ytReg = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const ytMatch = url.match(ytReg);
        if (ytMatch) return { id: ytMatch[1], type: 'youtube' };

        // Loom
        const loomReg = /loom\.com\/(?:share|embed)\/([a-f0-9]{32})/i;
        const loomMatch = url.match(loomReg);
        if (loomMatch) return { id: loomMatch[1], type: 'loom' };

        return { id: null, type: null };
    };

    // Video Preview Component
    const VideoPreview = ({ url }: { url: string }) => {
        const { id, type } = getVideoId(url);
        if (!id) return null;

        const embedUrl = type === 'youtube' 
            ? `https://www.youtube.com/embed/${id}?autoplay=1&mute=1`
            : `https://www.loom.com/embed/${id}?autoplay=1&muted=1`;

        return (
            <div style={{ width: '100%', height: '100%', background: '#000' }}>
                <iframe
                    src={embedUrl}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        );
    };

    const { user, loading: authLoading, refreshUser } = useAuth();
    const { theme } = useTheme();
    const { tutors, addTutor, updateTutor, loading: tutorsLoading } = useTutorContext();
    const { convertPrice, pricing, setPricingByCountry } = usePricing();
    const posthog = usePostHog();
    const router = useRouter();
    const { addToast } = useToast();
    const isInitialMount = useRef(true);
    const existingTutor = useMemo(() => tutors.find(t => t.profile_id === user?.id), [tutors, user?.id]);

    useEffect(() => {
        if (posthog) {
            posthog.capture('tutor_application_started', {
                user_id: user?.id,
                email: user?.email
            });
        }
    }, [posthog, user]);


    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form data
    const [formData, setFormData] = useState({
        subjects: ['Mathematics'],
        specialties: '',
        bio: '',
        experience: '',
        languages: [{ name: 'English', level: 'C2' }] as { name: string, level: string }[],
        birthCountry: '',
        livingCountry: '',
        city: '',
        whyHire: '',
        methodology: '',
        fitForPlatform: '',
        videoType: 'upload' as 'upload' | 'link',
        videoThumbnail: null as File | null,
        hourlyRate: 0,
        fullName: '',
        videoLink: '',
        education: '',
        degreeName: '',
        duration: '',
        wants_1to5: false,
        wants_1to10: false,
        price_5: 0,
        price_10: 0,
        referralSource: '',
    });

    const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [cvPreview, setCvPreview] = useState<string | null>(null);
    const [certPreview, setCertPreview] = useState<string | null>(null);
    const [idPreview, setIdPreview] = useState<string | null>(null);
    const [introVideoPreview, setIntroVideoPreview] = useState<string | null>(null);
    const isRestorationComplete = useRef(false);
    const isServerHydrated = useRef(false);
    const syncLocked = useRef(true); // Lock sync initially

    const [isUploadingThumb, setIsUploadingThumb] = useState(false);
    const [isUploadingProfile, setIsUploadingProfile] = useState(false);
    const [isUploadingCV, setIsUploadingCV] = useState(false);
    const [isUploadingCert, setIsUploadingCert] = useState(false);
    const [isUploadingID, setIsUploadingID] = useState(false);
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);
    const [uniResults, setUniResults] = useState<any[]>([]);
    const [isSearchingUni, setIsSearchingUni] = useState(false);
    const uniDebounce = useRef<any>(null);

    const searchUniversities = (query: string) => {
        if (uniDebounce.current) clearTimeout(uniDebounce.current);
        if (!query || query.length < 2) {
            setUniResults([]);
            return;
        }
        setIsSearchingUni(true);
        uniDebounce.current = setTimeout(async () => {
            try {
                const res = await fetch(`http://universities.hipolabs.com/search?name=${encodeURIComponent(query)}`);
                const data = await res.json();
                setUniResults(data.slice(0, 15).map((u: any) => ({ name: u.name, country: u.country })));
            } catch (err) {
                console.error("Failed to fetch universities", err);
            } finally {
                setIsSearchingUni(false);
            }
        }, 300);
    };

    // File states
    const [files, setFiles] = useState({
        profilePic: null as File | null,
        cvResume: null as File | null,
        certificate: null as File | null,
        identity: null as File | null,
        videoFile: null as File | null,
        videoThumbnail: null as File | null,
    });

    // For drag and drop visual feedback
    const [isDragging, setIsDragging] = useState<string | null>(null);

    // Enlarged preview state
    const [enlargedPreview, setEnlargedPreview] = useState<{ url: string, type: 'image' | 'video' | 'pdf' } | null>(null);
    const [isFullPreviewOpen, setIsFullPreviewOpen] = useState(false);

    useEffect(() => {
        if (formData.livingCountry) {
            setPricingByCountry(formData.livingCountry);
        }
    }, [formData.livingCountry, setPricingByCountry]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?role=tutor&next=/apply-tutor');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!authLoading && user && !isServerHydrated.current) {
            const existing = tutors.find(t => t.profile_id === user.id);
            if (existing) {
                isServerHydrated.current = true; // Mark as hydrated IMMEDIATELY to prevent re-runs
                if (existing.verificationStatus === 'verified') {
                    router.push('/tutor-dashboard');
                } else if (existing.verificationStatus === 'pending') {
                    setSubmitted(true);
                } else if (existing.verificationStatus === 'returned') {
                    setError(`Your application requires updates: ${existing.rejection_reason || 'Please review your details.'}`);
                }

                // Populate form data from existing record
                setFormData(prev => {
                    // Check if we have a MORE RECENT local draft already applied
                    // Otherwise, fill from server
                    return {
                        ...prev,
                        fullName: existing.name || '',
                        bio: existing.bio || '',
                        subjects: existing.subjects && existing.subjects.length > 0 ? existing.subjects : prev.subjects,

                        languages: existing.languages && existing.languages.length > 0
                            ? (typeof existing.languages[0] === 'string'
                                ? existing.languages.map((l: string) => ({ name: l, level: 'C2' }))
                                : existing.languages)
                            : prev.languages,
                        livingCountry: existing.country || prev.livingCountry,
                        hourlyRate: existing.price || prev.hourlyRate,
                        ...(existing.applicationData || {})
                    };
                });
                // 2. Resolve URLs for previews (Server Data is source of truth for persistent files)
                const avatarToServer = existing.avatar || existing.applicationData?.profilePicUrl;
                if (avatarToServer && avatarToServer.startsWith('http') && !avatarToServer.startsWith('blob:')) {
                    setProfilePicPreview(avatarToServer);
                }
                
                const thumbToServer = existing.video_thumbnail_url || existing.applicationData?.videoThumbnailUrl || (existing.applicationData as any)?.videoThumbnail;
                console.log('[TutorApp] Hydrating Thumbnail:', { fromExisting: existing.video_thumbnail_url, fromApp: existing.applicationData?.videoThumbnailUrl, thumbToServer, isHttp: thumbToServer?.startsWith('http') });
                if (thumbToServer && thumbToServer.startsWith('http') && !thumbToServer.startsWith('blob:')) {
                    setThumbnailPreview(thumbToServer);
                }

                const videoToServer = existing.intro_video_url || existing.applicationData?.introVideoUrl || (existing.applicationData as any)?.introVideo;
                if (videoToServer && videoToServer.startsWith('http') && !videoToServer.startsWith('blob:')) {
                    setIntroVideoPreview(videoToServer);
                }
                
                const cvToServer = existing.cv_url || existing.applicationData?.cvUrl;
                if (cvToServer && cvToServer.startsWith('http') && !cvToServer.startsWith('blob:')) {
                    setCvPreview(cvToServer);
                }
                
                const certToServer = existing.certificationsUrl || existing.applicationData?.certUrl;
                if (certToServer && certToServer.startsWith('http') && !certToServer.startsWith('blob:')) {
                    setCertPreview(certToServer);
                }
                
                const idToServer = existing.identityDocsUrl || existing.applicationData?.identityUrl;
                if (idToServer && idToServer.startsWith('http') && !idToServer.startsWith('blob:')) {
                    setIdPreview(idToServer);
                }
                
                // 3. Mark restoration as complete only after we have the server data
                isRestorationComplete.current = true;
                setTimeout(() => { syncLocked.current = false; }, 1000); // 1s grace period before allowing sync
            } else {
                // Also complete for new applicants
                console.log('[TutorApp] Restoration complete, unlocking sync.');
                isRestorationComplete.current = true;
                setTimeout(() => { syncLocked.current = false; }, 1000); // 1s grace period before allowing sync
                if (user.name && !formData.fullName) {
                    setFormData(prev => ({ ...prev, fullName: user.name }));
                }
            }
        }
    }, [tutorsLoading, authLoading, user, tutors, router]);

    // 1. Load Draft from LocalStorage on mount
    useEffect(() => {
        const savedDraft = localStorage.getItem('tutor_app_draft');
        if (savedDraft) {
            try {
                const { 
                    formData: savedData, 
                    currentStep: savedStep, 
                    profilePicPreview: savedAvatar, 
                    thumbnailPreview: savedThumb,
                    introVideoPreview: savedIntro,
                    cvPreview: savedCV,
                    certPreview: savedCert,
                    idPreview: savedID
                } = JSON.parse(savedDraft);
                if (savedData && Object.keys(savedData).length > 0) {
                    setFormData(prev => ({ ...prev, ...savedData }));
                    if (savedStep) setCurrentStep(savedStep as Step);
                    // Restore previews from localStorage (only if they are persistent URLs)
                    if (savedAvatar && savedAvatar.startsWith('http')) setProfilePicPreview(savedAvatar);
                    if (savedThumb && savedThumb.startsWith('http')) setThumbnailPreview(savedThumb);
                    if (savedIntro && savedIntro.startsWith('http')) setIntroVideoPreview(savedIntro);
                    if (savedCV && savedCV.startsWith('http')) setCvPreview(savedCV);
                    if (savedCert && savedCert.startsWith('http')) setCertPreview(savedCert);
                    if (savedID && savedID.startsWith('http')) setIdPreview(savedID);
                    
                    if (isInitialMount.current) {
                        addToast('Draft application restored', 'info');
                    }
                }

            } catch (e) {
                console.error('Failed to parse tutor application draft', e);
            }
        }
        
        // Wait for both auth and tutors to finish loading before considering initial mount complete
        const checkDone = setInterval(() => {
            if (!authLoading && !tutorsLoading && isRestorationComplete.current) {
                isInitialMount.current = false;
                clearInterval(checkDone);
            }
        }, 500);
        
        return () => clearInterval(checkDone);
    }, [authLoading, tutorsLoading]);


    // 2. Persistent Draft (Save to localStorage with sticky URLs to prevent "death spiral" wipes)
    useEffect(() => {
        if (isInitialMount.current || authLoading || tutorsLoading) return;

        // Get existing draft to preserve persistent URLs if current state is null
        const savedDraftRaw = localStorage.getItem('tutor_app_draft');
        let oldDraft: any = null;
        try { oldDraft = JSON.parse(savedDraftRaw || '{}'); } catch(e) {}

        const draft = {
            formData,
            currentStep,
            profilePicPreview: (profilePicPreview?.startsWith('http') && !profilePicPreview.startsWith('blob:')) 
                ? profilePicPreview 
                : null,
            thumbnailPreview: (thumbnailPreview?.startsWith('http') && !thumbnailPreview.startsWith('blob:')) 
                ? thumbnailPreview 
                : null,
            cvPreview: (cvPreview?.startsWith('http') && !cvPreview.startsWith('blob:')) 
                ? cvPreview 
                : null,
            certPreview: (certPreview?.startsWith('http') && !certPreview.startsWith('blob:')) 
                ? certPreview 
                : null,
            idPreview: (idPreview?.startsWith('http') && !idPreview.startsWith('blob:')) 
                ? idPreview 
                : null,
            introVideoPreview: (introVideoPreview?.startsWith('http') && !introVideoPreview.startsWith('blob:')) 
                ? introVideoPreview 
                : null,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem('tutor_app_draft', JSON.stringify(draft));
        window.dispatchEvent(new CustomEvent('tutor_app_update', { detail: draft }));
    }, [formData, currentStep, profilePicPreview, thumbnailPreview, cvPreview, certPreview, idPreview, introVideoPreview]);

    // 3. Extracted reusable server sync function
    const syncDraftToServer = async () => {
        if (!user || authLoading || tutorsLoading || isInitialMount.current || syncLocked.current) {
            if (syncLocked.current) console.log('[TutorApp] Sync skipped: Locked during restoration.');
            return;
        }
        
        // Sanity check: Avoid syncing if the form is completely empty (names, subjects, bio)
        // unless they are explicitly on Step 1 and just started
        if (currentStep > 1 && !formData.fullName && !formData.bio && !profilePicPreview) {
            console.warn('[TutorApp] Skipping sync: Form data appears uninitialized.');
            return;
        }

        console.log('[TutorApp] Syncing draft to server...');
        const existingTutor = tutors.find(t => t.profile_id === user.id);
        
        // Only sync if they haven't submitted yet or if it's currently incomplete/returned
        if (existingTutor && existingTutor.verificationStatus !== 'incomplete' && existingTutor.verificationStatus !== 'returned') {
            return;
        }

        const draftPayload = {
            profile_id: user.id,
            name: formData.fullName || user.name,
            subjects: formData.subjects || [],
            bio: formData.bio || '',
            hourly_rate: parseFloat(formData.hourlyRate as any) || 0,

            currency: pricing.currency,
            country: formData.livingCountry || existingTutor?.country,
            // Strictly preserve persistent URLs - NEVER overwrite with null during auto-sync UNLESS explicitly cleared
            video_thumbnail_url: thumbnailPreview === null ? null : (thumbnailPreview.startsWith('blob:') ? (existingTutor?.video_thumbnail_url || null) : thumbnailPreview),
            intro_video_url: introVideoPreview === null ? null : (introVideoPreview.startsWith('blob:') ? (existingTutor?.intro_video_url || null) : introVideoPreview),
            avatar: profilePicPreview === null ? null : (profilePicPreview.startsWith('blob:') ? (existingTutor?.avatar || null) : profilePicPreview),
            cv_url: cvPreview === null ? null : (cvPreview.startsWith('blob:') ? (existingTutor?.cv_url || null) : cvPreview),
            certificationsUrl: certPreview === null ? null : (certPreview.startsWith('blob:') ? (existingTutor?.certificationsUrl || null) : certPreview),
            identityDocsUrl: idPreview === null ? null : (idPreview.startsWith('blob:') ? (existingTutor?.identityDocsUrl || null) : idPreview),
            verificationStatus: existingTutor?.verificationStatus || 'incomplete',
            applicationData: {
                ...(existingTutor?.applicationData || {}),
                ...formData,
                videoThumbnailUrl: thumbnailPreview === null ? null : (thumbnailPreview.startsWith('blob:') ? (existingTutor?.applicationData?.videoThumbnailUrl || null) : thumbnailPreview),
                introVideoUrl: introVideoPreview === null ? null : (introVideoPreview.startsWith('blob:') ? (existingTutor?.applicationData?.introVideoUrl || null) : introVideoPreview),
                profilePic: profilePicPreview === null ? null : (profilePicPreview.startsWith('blob:') ? (existingTutor?.applicationData?.profilePic || null) : profilePicPreview),
                cvUrl: cvPreview === null ? null : (cvPreview.startsWith('blob:') ? (existingTutor?.applicationData?.cvUrl || null) : cvPreview),
                certUrl: certPreview === null ? null : (certPreview.startsWith('blob:') ? (existingTutor?.applicationData?.certUrl || null) : certPreview),
                identityUrl: idPreview === null ? null : (idPreview.startsWith('blob:') ? (existingTutor?.applicationData?.identityUrl || null) : idPreview),
                draftUpdatedAt: new Date().toISOString(),

                lastDraftStep: currentStep
            }
        };

        try {
            if (existingTutor) {
                await updateTutor(existingTutor.id, draftPayload as any);
            } else {
                await addTutor(draftPayload);
            }
            console.log('[TutorApp] Draft synced to server successfully.');
        } catch (err) {
            console.warn('[TutorApp] Draft sync failed (non-critical):', err);
        }
    };

    // Auto-sync to server on every change (1.5s debounce to avoid hammering)
    useEffect(() => {
        if (isInitialMount.current || !user || authLoading || tutorsLoading) return;
        const timer = setTimeout(syncDraftToServer, 1500);
        return () => clearTimeout(timer);
    }, [formData, currentStep, user, profilePicPreview, thumbnailPreview, cvPreview, certPreview, idPreview, authLoading, tutorsLoading]);

    // Force-save draft when user leaves the page (tab close / navigate away)
    useEffect(() => {
        const handleBeforeUnload = () => {
            // Only save if initialization is complete
            if (isInitialMount.current || authLoading || tutorsLoading) return;

            // Save to localStorage synchronously (guaranteed)
            const draft = {
                formData,
                currentStep,
                profilePicPreview: profilePicPreview?.startsWith('http') ? profilePicPreview : null,
                thumbnailPreview: thumbnailPreview?.startsWith('http') ? thumbnailPreview : null,
                cvPreview: cvPreview?.startsWith('http') ? cvPreview : null,
                certPreview: certPreview?.startsWith('http') ? certPreview : null,
                idPreview: idPreview?.startsWith('http') ? idPreview : null,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem('tutor_app_draft', JSON.stringify(draft));
            // Fire-and-forget server sync (best effort)
            syncDraftToServer();
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [formData, currentStep, profilePicPreview, thumbnailPreview, cvPreview, certPreview, idPreview]);

    const sendAdminErrorAlert = async (errorMessage: string, context: string) => {
        try {
            await fetch('/api/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: 'contact@grouptutors.com',
                    subject: `System Alert: RLS/Database Error from ${user?.email || 'Unknown User'}`,
                    type: 'admin_alert',
                    ctaLink: '/admin/tutors',
                    ctaText: 'Check Admin Panel',
                    body: `
                        <div style="text-align: center;">
                            <h2 style="color: #ef4444; margin-top: 0; margin-bottom: 20px;">System Error Detected</h2>
                            <div style="background: #fff5f5; border: 1.5px dashed #f87171; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: left;">
                                <p style="color: #b91c1c; font-family: monospace; font-size: 14px; margin: 0;"><strong>Error:</strong> ${errorMessage}</p>
                                <p style="color: #b91c1c; font-family: monospace; font-size: 13px; margin: 8px 0 0 0;"><strong>Context:</strong> ${context}</p>
                            </div>
                            <div style="text-align: left; font-size: 14px; color: #4b5563;">
                                <p style="margin: 4px 0;"><strong>User:</strong> ${user?.name || 'Unknown'} (${user?.email || 'N/A'})</p>
                                <p style="margin: 4px 0;"><strong>User ID:</strong> ${user?.id || 'N/A'}</p>
                                <p style="margin: 4px 0;"><strong>Role:</strong> ${user?.role}</p>
                            </div>
                        </div>
                    `
                })
            });
        } catch (e) {
            console.error('Failed to send admin alert:', e);
        }
    };

    const sendAdminSuccessAlert = async (type: 'Standard' | 'Bypass', data: any) => {
        try {
            await fetch('/api/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: 'contact@grouptutors.com',
                    subject: `New Tutor Submission (${type}): ${user?.email}`,
                    type: 'admin_notification',
                    ctaLink: '/admin/tutors',
                    ctaText: 'Review in Admin Panel',
                    body: `
                        <div style="text-align: center;">
                            <h2 style="color: #4a0404; margin-top: 0; margin-bottom: 20px;">Tutor Application Received</h2>
                            <div style="background: #fdfcf8; border: 1px solid #eeebe3; border-radius: 12px; padding: 24px; text-align: left; margin-bottom: 16px;">
                                <p style="margin: 0 0 12px 0; color: #1e293b;"><strong>Name:</strong> ${formData.fullName || user?.name}</p>
                                <p style="margin: 0 0 12px 0; color: #1e293b;"><strong>Email:</strong> ${user?.email}</p>
                                <p style="margin: 0 0 12px 0; color: #1e293b;"><strong>Submission:</strong> ${type}</p>
                                <p style="margin: 0; color: #1e293b;"><strong>Subjects:</strong> ${data.subjects?.join(', ')}</p>
                            </div>
                            <p style="font-size: 14px; color: #64748b;">Review this application in the admin panel to proceed.</p>
                        </div>
                    `
                })
            });
        } catch (e) {
            console.error('Failed to send success alert:', e);
        }
    };

    const sendTutorSuccessAlert = async () => {
        if (!user?.email) return;
        try {
            await fetch('/api/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: user.email,
                    subject: 'Application Received! Your GroupTutors journey begins',
                    type: 'tutor_application_received',
                    ctaLink: '/dashboard',
                    ctaText: 'Go to Dashboard',
                    body: `
                        <div style="text-align: center;">
                            <h2 style="color: #4a0404; margin-top: 0; margin-bottom: 20px;">We've received your application!</h2>
                            <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin-bottom: 24px;">
                                Hi ${formData.fullName || user.name || 'Tutor'}, thank you for submitting your professional profile to GroupTutors. 
                                Our academic team is now reviewing your application, including your introductory video and background.
                            </p>
                            <div style="background: #fdfcf8; border: 1.5px dashed #4a0404; border-radius: 16px; padding: 20px; text-align: left; margin-bottom: 24px;">
                                <p style="margin: 0 0 10px 0;"><strong>What's Next?</strong></p>
                                <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px;">
                                    <li style="margin-bottom: 8px;">Our team will review your profile within <strong>24-48 hours</strong>.</li>
                                    <li style="margin-bottom: 8px;">Check your email or dashboard for a "Verified" status or feedback.</li>
                                    <li>Once verified, you'll be able to set your schedule and start accepting students.</li>
                                </ul>
                            </div>
                            <p style="font-size: 14px; color: #64748b; margin-bottom: 0;">In the meantime, feel free to explore your dashboard and get familiar with our classroom tools.</p>
                        </div>
                    `
                })
            });
        } catch (e) {
            console.error('Failed to send tutor success email:', e);
        }
    };

    // --- File Size Limits ---
    const MAX_FILE_SIZES = {
        image: 5 * 1024 * 1024,    // 5 MB for images (profile pic, thumbnails)
        document: 10 * 1024 * 1024, // 10 MB for docs (CV, cert, ID)
        video: 50 * 1024 * 1024,    // 50 MB for videos
    };

    const compressImage = async (file: File, maxSizeMB: number = 2): Promise<File> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const reader = new FileReader();
            reader.onload = (e) => {
                img.onload = () => {
                    // Scale down if larger than 1920px
                    let { width, height } = img;
                    const MAX_DIM = 1920;
                    if (width > MAX_DIM || height > MAX_DIM) {
                        const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
                        width = Math.round(width * ratio);
                        height = Math.round(height * ratio);
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d')!;
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) return reject(new Error('Image compression failed'));
                            const compressed = new File([blob], file.name, { type: 'image/jpeg' });
                            console.log(`[Compress] ${(file.size / 1024 / 1024).toFixed(1)}MB ΓåÆ ${(compressed.size / 1024 / 1024).toFixed(1)}MB`);
                            resolve(compressed);
                        },
                        'image/jpeg',
                        0.8 // Quality
                    );
                };
                img.src = e.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleFileUpload = async (file: File, bucket: string, folder: string) => {
        // Determine file category and max size
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const maxSize = isVideo ? MAX_FILE_SIZES.video : isImage ? MAX_FILE_SIZES.image : MAX_FILE_SIZES.document;
        const limitLabel = isVideo ? '50MB' : isImage ? '5MB' : '10MB';

        let fileToUpload = file;

        // Auto-compress images if over limit
        if (isImage && file.size > maxSize) {
            console.log(`[Upload] Image ${file.name} is ${(file.size / 1024 / 1024).toFixed(1)}MB, compressing...`);
            try {
                fileToUpload = await compressImage(file);
                if (fileToUpload.size > maxSize) {
                    throw new Error(`Your image "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Even after compression it's ${(fileToUpload.size / 1024 / 1024).toFixed(1)}MB. Please use an image under ${limitLabel}.`);
                }
            } catch (compErr: any) {
                if (compErr.message.includes('too large')) throw compErr;
                console.warn('[Upload] Compression failed, trying original:', compErr);
            }
        } else if (file.size > maxSize) {
            throw new Error(`Your file "${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)}MB which exceeds the ${limitLabel} limit. Please use a smaller file.`);
        }

        const ext = fileToUpload.name.split('.').pop();
        const fileName = `${user?.id}_${Date.now()}.${ext}`;
        const filePath = `${folder}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, fileToUpload, { cacheControl: '3600', upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return publicUrl;
    };

    /**
     * Enhanced handleSubmit with granular error handling and connectivity checks.
     * This addresses the "Fail to fetch" issue by pinpointing where it happens.
     */
    const handleSubmit = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        console.log('[TutorApp] Starting submission sequence...');

        try {
            // 0. Connectivity Check
            const { error: pingError } = await supabase.from('site_settings').select('id').limit(1);
            if (pingError) {
                console.error('[TutorApp] Connectivity failed:', pingError);
                if (posthog) posthog.capture('supabase_connection_lost', { error: pingError.message, user_id: user?.id });
                throw new Error(`Connection to database failed: ${pingError.message}. Please check your internet.`);
            }


            // 0.5. Comprehensive Validation Check
            for (let s = 1; s <= 4; s++) {
                const { isValid, errors: stepErrors } = validateStep(s as Step);
                if (!isValid) {
                    addToast(`Incomplete Step ${s}: ${stepErrors.join(', ')}`, 'error');
                    setCurrentStep(s as Step); // Take them back to the broken step
                    setLoading(false);
                    return;
                }
            }
            const existingTutor = tutors.find(t => t.profile_id === user.id);
            const urls = { 
                profilePic: (profilePicPreview && !profilePicPreview.startsWith('blob:')) ? profilePicPreview : (profilePicPreview === null ? '' : (existingTutor?.avatar || '')), 
                cv: (cvPreview && !cvPreview.startsWith('blob:')) ? cvPreview : (cvPreview === null ? '' : (existingTutor?.applicationData?.cvUrl || '')), 
                cert: (certPreview && !certPreview.startsWith('blob:')) ? certPreview : (certPreview === null ? '' : (existingTutor?.applicationData?.certUrl || '')), 
                id: (idPreview && !idPreview.startsWith('blob:')) ? idPreview : (idPreview === null ? '' : (existingTutor?.identityDocsUrl || '')), 
                video: (introVideoPreview && !introVideoPreview.startsWith('blob:')) ? introVideoPreview : (introVideoPreview === null ? '' : (existingTutor?.intro_video_url || '')), 
                thumb: (thumbnailPreview && !thumbnailPreview.startsWith('blob:')) ? thumbnailPreview : (thumbnailPreview === null ? '' : (existingTutor?.video_thumbnail_url || existingTutor?.applicationData?.videoThumbnailUrl || (existingTutor?.applicationData as any)?.videoThumbnail || '')) 
            };

            
            try {
                // 1. Profile Pic
                if (files.profilePic) {
                    console.log('[TutorApp] Uploading profile pic to avatars bucket...');
                    urls.profilePic = await handleFileUpload(files.profilePic, 'avatars', 'profiles');
                }

                if (files.cvResume && (!urls.cv || urls.cv.startsWith('blob:'))) {
                    console.log('[TutorApp] Uploading CV...');
                    urls.cv = await handleFileUpload(files.cvResume, 'tutor-docs', 'cv');
                }
                if (files.certificate && (!urls.cert || urls.cert.startsWith('blob:'))) {
                    console.log('[TutorApp] Uploading certificate...');
                    urls.cert = await handleFileUpload(files.certificate, 'tutor-docs', 'certificates');
                }
                if (files.identity && (!urls.id || urls.id.startsWith('blob:'))) {
                    console.log('[TutorApp] Uploading ID...');
                    urls.id = await handleFileUpload(files.identity, 'tutor-docs', 'identity');
                }
                if (files.videoFile) {
                    console.log('[TutorApp] Uploading intro video...');
                    urls.video = await handleFileUpload(files.videoFile, 'intro-videos', 'intro');
                }
                if (files.videoThumbnail && (!urls.thumb || urls.thumb.startsWith('blob:'))) {
                    console.log('[TutorApp] Uploading video thumbnail...');
                    urls.thumb = await handleFileUpload(files.videoThumbnail, 'intro-videos', 'thumbnails');
                }
            } catch (uploadErr: any) {
                console.error('[TutorApp] File upload failed:', uploadErr);
                if (posthog) posthog.capture('tutor_application_upload_failed', { error: uploadErr.message || 'Unknown upload error', user_id: user?.id });
                throw new Error(`File upload failed: ${uploadErr.message || 'Check file size and connection.'}`);
            }


            // 2. Database Insertion Stage
            const payload = {
                profile_id: user.id,
                fullName: formData.fullName || user.name,
                subjects: formData.subjects,
                languages: formData.languages, // FIXED: Send languages at top level
                bio: formData.bio,
                hourly_rate: parseFloat(formData.hourlyRate as any) || 0,
                price_5: 0,
                price_10: 0,
                verificationStatus: 'pending',
                rating: 0,
                is_verified: false,
                is_visible: false,
                is_active: true,
                cv_url: urls.cv,
                identityDocsUrl: urls.id,
                certificationsUrl: urls.cert,
                country: formData.livingCountry,
                intro_video_url: urls.video,
                video_thumbnail_url: urls.thumb, // Use the sanitized URL from urls object
                avatar: urls.profilePic,
                applicationData: {
                    ...formData,
                    location: {
                        birthCountry: formData.birthCountry,
                        livingCountry: formData.livingCountry,
                        city: formData.city
                    },
                    cvUrl: urls.cv,
                    certUrl: urls.cert,
                    identityUrl: urls.id,
                    videoUrl: urls.video,
                    videoThumbnail: urls.thumb,
                    appliedDate: new Date().toISOString(),
                }
            };

            console.log('[TutorApp] Inserting/Updating tutor record...');
            const { error: submitError } = existingTutor
                ? await updateTutor(existingTutor.id, { ...payload, verificationStatus: 'pending' } as any)
                : await addTutor({ ...payload, verificationStatus: 'pending' } as any);

            if (submitError) {
                console.error('[TutorApp] Database error:', submitError);
                if (posthog) posthog.capture('tutor_application_db_failed', { error: submitError.message, user_id: user?.id });
                throw new Error(`Database submission failed: ${submitError.message}`);
            }


            // 3. Notification Stage (Non-blocking)
            console.log('[TutorApp] Sending success alerts...');
            sendAdminSuccessAlert('Standard', payload).catch(e => console.error('[TutorApp] Admin alert failed:', e));
            sendTutorSuccessAlert().catch(e => console.error('[TutorApp] Tutor confirmation email failed:', e));

            if (posthog) posthog.capture('tutor_application_submitted', { user_id: user?.id, email: user?.email });
            
            // Clear draft on successful submission
            localStorage.removeItem('tutor_app_draft');
            
            setSubmitted(true);
        } catch (err: any) {
            console.error('[TutorApp] Final Catch:', err);
            
            let message = err.message || 'Submission failed. Please try again.';
            
            // Special handling for common network/connectivity errors
            if (message === 'Failed to fetch' || message.toLowerCase().includes('fetch')) {
                message = 'Network Error: Unable to reach the database. This usually happens if the Supabase project is paused, your internet is unstable, or a firewall is blocking the request. Please check if your connection to grouptutors.com is stable.';
            } else if (message.toLowerCase().includes('exceeded') || message.toLowerCase().includes('maximum allowed size')) {
                message = `File Too Large: One of your uploaded files exceeds the allowed size limit. Please reduce file sizes ΓÇö Images: max 5MB, Documents (CV/ID/Cert): max 10MB, Video: max 50MB. Try compressing your files before uploading.`;
            } else if (message.toLowerCase().includes('bucket') || message.toLowerCase().includes('storage')) {
                message = `Storage Error: ${message}. The upload failed. Please try a smaller file or a different format.`;
            }

            setError(message);
            if (posthog) posthog.capture('tutor_application_failed', { error: message, context: 'Final Catch', user_id: user?.id });
            
            // Log to admin via API if possible (skip for expected user-side file size errors)
            const isFileSizeError = message.toLowerCase().includes('file too large') || message.toLowerCase().includes('exceeds the');
            if (message.toLowerCase().includes('fetch') || message.toLowerCase().includes('connection')) {
                sendAdminErrorAlert(message, 'Tutor Application - Connectivity/Fetch Issue').catch(() => {});
            } else if (!isFileSizeError) {
                sendAdminErrorAlert(message, 'Tutor Application - Logic/DB Error').catch(() => {});
            }
        } finally {


            setLoading(false);
        }
    };
    
    const validateStep = (step: Step) => {
        const errors: string[] = [];
        const existingTutor = tutors.find(t => t.profile_id === user?.id);

        const isProfileUploaded = (profilePicPreview && !profilePicPreview.startsWith('blob:')) || !!existingTutor?.avatar;
        const isCVUploaded = (cvPreview && !cvPreview.startsWith('blob:')) || !!existingTutor?.applicationData?.cvUrl || !!existingTutor?.cv_url;
        const isVideoUploaded = (introVideoPreview && !introVideoPreview.startsWith('blob:')) || !!existingTutor?.intro_video_url;
        const isThumbUploaded = (thumbnailPreview && !thumbnailPreview.startsWith('blob:')) || !!existingTutor?.video_thumbnail_url;

        switch (step) {
            case 1:
                if (formData.fullName.trim().length < 3) errors.push('Full Name');
                if (isUploadingProfile) errors.push('Profile Photo Uploading...');
                else if (!isProfileUploaded && !files.profilePic) errors.push('Profile Photo Required');
                else if (!isProfileUploaded && files.profilePic) errors.push('Wait for Photo Upload');
                
                if (formData.bio.trim().length < 50) errors.push('Bio (min 50 chars)');
                if (formData.birthCountry.trim() === '') errors.push('Birth Country');
                if (formData.livingCountry.trim() === '') errors.push('Residence Country');
                if (formData.city.trim() === '') errors.push('City');
                if (formData.languages.length === 0) errors.push('Languages');
                break;
            case 2:
                if (formData.subjects.length === 0) errors.push('Subjects');
                if (formData.experience.trim().length < 50) errors.push('Experience (min 50 chars)');
                if (formData.methodology.trim().length < 50) errors.push('Methodology (min 50 chars)');
                if (formData.hourlyRate <= 0) errors.push('Hourly Rate');
                break;
            case 3:
                if (formData.videoType === 'link') {
                    if (formData.videoLink.trim() === '') errors.push('Video Link');
                } else {
                    if (isUploadingVideo) errors.push('Video Uploading...');
                    else if (!isVideoUploaded && !files.videoFile) errors.push('Intro Video Required');
                    else if (!isVideoUploaded && files.videoFile) errors.push('Wait for Video Upload');
                }

                // Mandatory Thumbnail for BOTH upload and link types
                if (isUploadingThumb) errors.push('Thumbnail Uploading...');
                else if (!isThumbUploaded && !files.videoThumbnail) errors.push('Thumbnail Required (YouTube/Landscape 16:9)');
                else if (!isThumbUploaded && files.videoThumbnail) errors.push('Wait for Thumbnail Upload');
                break;
            case 4:
                if (isUploadingCV) errors.push('CV Uploading...');
                else if (!isCVUploaded && !files.cvResume) errors.push('CV/Resume Required');
                else if (!isCVUploaded && files.cvResume) errors.push('Wait for CV Upload');

                if (formData.fitForPlatform.trim().length < 50) errors.push('Fit Description');
                if (formData.whyHire.trim().length < 50) errors.push('Why Hire Section');
                if (formData.education.trim().length < 3) errors.push('Education');
                if (formData.degreeName.trim().length < 2) errors.push('Degree');
                if (formData.referralSource.trim() === '') errors.push('Referral Source');
                break;
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    };

    const nextStep = () => {
        const { isValid, errors } = validateStep(currentStep);
        if (isValid) {
            setCurrentStep(p => Math.min(4, p + 1) as Step);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // Immediate server sync on step change
            syncDraftToServer();
        } else {
            addToast(`Please complete: ${errors.join(', ')}`, 'error');
        }
    };
    const prevStep = () => {
        setCurrentStep(p => Math.max(1, p - 1) as Step);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Immediate server sync on step change
        syncDraftToServer();
    };

    const handleDrag = (e: React.DragEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragover') setIsDragging(id);
        else setIsDragging(null);
    };

    const handleDrop = async (e: React.DragEvent, id: keyof typeof files) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(null);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            setFiles(prev => ({ ...prev, [id]: file }));
            
            // Handle Profile Pic
            if (id === 'profilePic') {
                setProfilePicPreview(URL.createObjectURL(file));
                try {
                    const permanentUrl = await handleFileUpload(file, 'tutor-docs', 'profiles');
                    setProfilePicPreview(permanentUrl);
                    addToast('Profile photo uploaded successfully', 'success');
                } catch (err: any) {
                    addToast('Photo upload failed: ' + err.message, 'error');
                }
            }
            
            // Handle CV
            if (id === 'cvResume') {
                setIsUploadingCV(true);
                setCvPreview(URL.createObjectURL(file));
                try {
                    const url = await handleFileUpload(file, 'tutor-docs', 'cv');
                    setCvPreview(url);
                    addToast('CV uploaded successfully', 'success');
                } catch (err: any) {
                    addToast('CV upload failed: ' + err.message, 'error');
                } finally {
                    setIsUploadingCV(false);
                }
            }
            
            // Handle Identity
            if (id === 'identity') {
                setIsUploadingID(true);
                setIdPreview(URL.createObjectURL(file));
                try {
                    const url = await handleFileUpload(file, 'tutor-docs', 'identity');
                    setIdPreview(url);
                    addToast('ID/Passport uploaded successfully', 'success');
                } catch (err: any) {
                    addToast('ID upload failed: ' + err.message, 'error');
                } finally {
                    setIsUploadingID(false);
                }
            }
            
            // Handle Certificate
            if (id === 'certificate') {
                setIsUploadingCert(true);
                setCertPreview(URL.createObjectURL(file));
                try {
                    const url = await handleFileUpload(file, 'tutor-docs', 'certificates');
                    setCertPreview(url);
                    addToast('Certificate uploaded successfully', 'success');
                } catch (err: any) {
                    addToast('Certificate upload failed: ' + err.message, 'error');
                } finally {
                    setIsUploadingCert(false);
                }
            }

            // Handle Video File
            if (id === 'videoFile') {
                setIsUploadingVideo(true);
                try {
                    const url = await handleFileUpload(file, 'intro-videos', 'videos');
                    setIntroVideoPreview(url);
                    addToast('Intro video uploaded successfully', 'success');
                    
                    if (existingTutor) {
                        updateTutor(existingTutor.id, { 
                            intro_video_url: url,
                            applicationData: { ...(existingTutor.applicationData || {}), introVideoUrl: url }
                        });
                    }
                } catch (err: any) {
                    addToast('Video upload failed: ' + err.message, 'error');
                } finally {
                    setIsUploadingVideo(false);
                }
            }

            // Handle Video Thumbnail
            if (id === 'videoThumbnail') {
                setIsUploadingThumb(true);
                try {
                    const url = await handleFileUpload(file, 'intro-videos', 'thumbnails');
                    setThumbnailPreview(url);
                    addToast('Video thumbnail uploaded successfully', 'success');
                    
                    if (existingTutor) {
                        updateTutor(existingTutor.id, { 
                            video_thumbnail_url: url,
                            applicationData: { ...(existingTutor.applicationData || {}), videoThumbnailUrl: url }
                        } as any);
                    }
                } catch (err: any) {
                    addToast('Thumbnail upload failed: ' + err.message, 'error');
                } finally {
                    setIsUploadingThumb(false);
                }
            }
        }
    };

    const ProgressIndicator = () => (
        <div style={{ marginBottom: 48 }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                position: 'relative', 
                marginBottom: 16,
                maxWidth: 600,
                margin: '0 auto 16px'
            }}>
                <div style={{ position: 'absolute', top: '50%', left: 20, right: 20, height: 4, background: 'var(--border)', zIndex: 0, transform: 'translateY(-50%)', borderRadius: 2 }} />
                <div
                    style={{
                        position: 'absolute', top: '50%', left: 20,
                        width: `${((currentStep - 1) / 3) * 85}%`, // Adjusted for padding
                        height: 4, background: 'var(--accent)', zIndex: 1,
                        transform: 'translateY(-50%)', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        borderRadius: 2, boxShadow: '0 0 10px var(--accent)'
                    }}
                />
                {[1, 2, 3, 4].map((s) => (
                    <div
                        key={s}
                        style={{
                            width: 44, height: 44, borderRadius: '16px',
                            background: currentStep >= s ? 'var(--accent)' : 'var(--bg-elevated)',
                            color: currentStep >= s ? '#fff' : 'var(--text-muted)',
                            border: `2px solid ${currentStep >= s ? 'var(--accent)' : 'var(--border)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 900, fontSize: 16, position: 'relative', zIndex: 2,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: currentStep === s ? 'scale(1.15)' : 'scale(1)',
                            boxShadow: currentStep === s ? '0 10px 20px -5px var(--accent)' : 'none'
                        }}
                    >
                        {currentStep > s ? <CheckCircle2 size={24} /> : s}
                    </div>
                ))}
            </div>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '0 4px',
                maxWidth: 600,
                margin: '0 auto'
            }}>
                {['General', 'Expertise', 'Media', 'Verify'].map((label, i) => (
                    <span key={i} style={{
                        fontSize: 10, fontWeight: 800,
                        color: currentStep > i ? 'var(--text)' : 'var(--text-muted)',
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                        transition: 'color 0.3s',
                        width: 60,
                        textAlign: 'center'
                    }}>
                        {label}
                    </span>
                ))}
            </div>
        </div>
    );

    if (submitted) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg)' }}>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ maxWidth: 520, width: '100%', textAlign: 'center', background: 'var(--bg-elevated)', padding: 48, borderRadius: 32, border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)', position: 'relative' }}>
                    <div style={{ width: 120, height: 120, borderRadius: 60, overflow: 'hidden', border: '4px solid #22c55e', margin: '0 auto 32px', background: 'var(--bg)', boxShadow: '0 10px 30px -10px rgba(34,197,94,0.5)' }}>
                        <img src="/guide-celebrating.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h1 style={{ fontSize: 32, fontWeight: 950, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.03em' }}>Application Received</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 40, lineHeight: 1.7, fontSize: 16 }}>
                        Excellent! Your tutor application is now being processed. Our team of educators will review your portfolio within <strong>24-48 hours</strong>. Check your dashboard for updates.
                    </p>
                    <Link href="/dashboard" className="btn-primary" style={{ width: '100%', display: 'flex', textDecoration: 'none', textAlign: 'center', padding: '18px', borderRadius: 16, justifyContent: 'center', fontSize: 16, fontWeight: 800 }}>
                        Go to Dashboard
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (!authLoading && !user) {
        return (
            <div style={{ minHeight: '100vh', padding: '140px 24px 80px', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '40%', height: '40%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255, 75, 130, 0.1) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0 }} />
                <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '50%', height: '50%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(26, 115, 232, 0.08) 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 0 }} />

                <div style={{ maxWidth: 1000, position: 'relative', zIndex: 1 }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <h1 style={{ fontSize: 'clamp(40px, 10vw, 84px)', fontWeight: 950, color: 'var(--text)', marginBottom: 28, letterSpacing: '-0.05em', lineHeight: 0.9, position: 'relative' }}>
                            Experience the future of <br />
                            <span style={{
                                background: 'linear-gradient(90deg, #ff4b82, #1a73e8)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                position: 'relative'
                            }}>Professional Tutoring</span>
                        </h1>
                    </motion.div>

                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ fontSize: 20, color: 'var(--text-muted)', maxWidth: 700, margin: '0 auto 56px', lineHeight: 1.6, fontWeight: 500 }}>
                        Join the world's most elite educators. Set your own rates, teach on your schedule, and inspire a global classroom.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mobile-grid-1"
                        style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) minmax(280px, 380px)', gap: 32, maxWidth: 800, margin: '0 auto', alignItems: 'stretch', justifyContent: 'center' }}
                    >
                        {/* Login Card */}
                        <Link href="/login?role=tutor&next=/apply-tutor" style={{
                            padding: '40px 32px', borderRadius: 32, textAlign: 'left', textDecoration: 'none',
                            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', display: 'flex', flexDirection: 'column', gap: 20,
                            boxShadow: 'var(--shadow-md)', position: 'relative', overflow: 'hidden'
                        }} className="hover-lift">
                            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(var(--text-rgb), 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={32} color="var(--text)" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.02em' }}>Existing Tutor</h3>
                                <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.5 }}>Sign in to continue your journey or view your student portfolio.</p>
                            </div>
                            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, color: 'var(--text)', fontSize: 14 }}>
                                Log In <ArrowRight size={18} />
                            </div>
                        </Link>

                        {/* Signup Card - More attractive */}
                        <Link href="/signup?role=tutor&next=/apply-tutor" style={{
                            padding: '44px 36px', borderRadius: 36, textAlign: 'left', textDecoration: 'none',
                            background: '#ff4b82', // Vibrant red/pink
                            color: '#fff', boxShadow: '0 25px 50px -12px rgba(255, 75, 130, 0.4)',
                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', display: 'flex', flexDirection: 'column', gap: 24,
                            position: 'relative', overflow: 'hidden'
                        }} className="hover-lift">
                            <div style={{ position: 'absolute', right: -20, bottom: -20, width: 140, height: 140, opacity: 0.8, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' }}>
                                <img src="/guide-pointing.png" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                            </div>
                            <div style={{ width: 72, height: 72, borderRadius: 24, background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Sparkles size={36} color="#fff" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: 32, fontWeight: 950, letterSpacing: '-0.04em', marginBottom: 12, lineHeight: 1 }}>Join as a <br />Professional Tutor</h3>
                                <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: 600, lineHeight: 1.4 }}>Create your verified account and start teaching in minutes.</p>
                            </div>
                            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 10, fontWeight: 900, fontSize: 18, color: '#fff' }}>
                                Sign Up Now <Zap size={22} fill="currentColor" />
                            </div>
                        </Link>
                    </motion.div>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} style={{ marginTop: 64, display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {[
                            { icon: <ShieldCheck size={20} />, text: 'Identity Verified' },
                            { icon: <Target size={20} />, text: 'Quality Guaranteed' },
                            { icon: <Globe size={20} />, text: 'Global Reach' }
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: 14, fontWeight: 700 }}>
                                {item.icon} {item.text}
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ 
            minHeight: '100vh', 
            padding: 'clamp(80px, 10vh, 120px) clamp(16px, 5vw, 24px) 100px', 
            background: 'var(--bg)', 
            position: 'relative', 
            overflow: 'hidden' 
        }}>
            {/* Sarah Guide Left - Ironclad Client-Side Transparency Fix */}
            {mounted && (
                <div className="mobile-hide" style={{
                    position: 'fixed', left: -20, bottom: 0, width: 420, height: 650, zIndex: 1,
                    pointerEvents: 'none',
                    opacity: 0.95,
                    // Use multiply for light mode (on white bg) and screen for dark mode
                    mixBlendMode: (theme === 'dark' || theme === 'dark-night') ? 'screen' : 'multiply',
                    // Soften edges to ensure no sharp boxes
                    WebkitMaskImage: 'radial-gradient(circle at center, black 70%, transparent 100%)',
                    maskImage: 'radial-gradient(circle at center, black 70%, transparent 100%)'
                }}>
                    <img 
                        src={(theme === 'dark' || theme === 'dark-night') ? "/sarah-guide-left.png?v=3" : "/tutor-v3-left.png?v=3"} 
                        alt="Tutor" 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                    />
                </div>
            )}

            {/* Sarah Guide Right - Ironclad Client-Side Transparency Fix */}
            {mounted && (
                <div className="mobile-hide" style={{
                    position: 'fixed', right: -20, bottom: 0, width: 420, height: 650, zIndex: 1,
                    pointerEvents: 'none',
                    opacity: 0.95, transform: 'scaleX(-1)', 
                    // Use multiply for light mode (on white bg) and screen for dark mode
                    mixBlendMode: (theme === 'dark' || theme === 'dark-night') ? 'screen' : 'multiply',
                    WebkitMaskImage: 'radial-gradient(circle at center, black 70%, transparent 100%)',
                    maskImage: 'radial-gradient(circle at center, black 70%, transparent 100%)'
                }}>
                    <img 
                        src={(theme === 'dark' || theme === 'dark-night') ? "/sarah-guide-right.png?v=3" : "/tutor-v3-right.png?v=3"} 
                        alt="Tutor" 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                    />
                </div>
            )}
 streams.

            <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 10 }}>
                <div style={{ textAlign: 'center', marginBottom: clampValue(40, 64) }}>
                    <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 950, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.04em' }}>Tutor Onboarding</motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: 'clamp(14px, 2vw, 17px)' }}>Complete your professional profile to join our elite circle.</motion.p>
                    
                    {/* Admin Bypass Button */}
                    {(user?.email?.toLowerCase().includes('aeraxiagroup') || 
                      user?.email?.toLowerCase().includes('grouptutornew') || 
                      user?.role === 'admin' ||
                      user?.name?.toLowerCase().includes('aeraxiagroup') || 
                      user?.name?.toLowerCase().includes('grouptutornew')) && (
                        <div style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button 
                                onClick={() => {
                                    const dummyBio = 'I am a highly experienced Mathematics tutor with over 10 years of teaching experience. I specialize in Calculus, Trigonometry, and Algebra, helping students achieve their academic goals with personalized learning plans.';
                                    const dummyText = 'This is professional application content designed to meet all platform requirements for verification. I use active learning and interactive whiteboards to engage students in every session.';
                                    setFormData(prev => ({
                                        ...prev,
                                        fullName: 'Professional Tutor',
                                        bio: dummyBio,
                                        experience: 'Senior Mathematics Teacher at International Academy (2015-present)',
                                        subjects: ['Mathematics', 'Calculus', 'Physics'],
                                        specialties: 'High School & Advanced STEM',
                                        languages: [{ name: 'English', level: 'C2' }],
                                        livingCountry: 'United Kingdom',
                                        city: 'London',
                                        whyHire: dummyText,
                                        methodology: 'Socratic method combined with project-based learning for maximum student engagement.',
                                        fitForPlatform: 'My pedagogical approach aligns perfectly with the interactive group learning model of GroupTutors.',
                                        hourlyRate: 35,
                                        videoType: 'link',
                                        videoLink: 'https://youtube.com/watch?v=dQw4w9WgXcQ'
                                    }));
                                    setProfilePicPreview('https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&fit=crop');
                                }}
                                style={{
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    border: '1px solid #10b981',
                                    color: '#10b981',
                                    padding: '10px 20px',
                                    borderRadius: 14,
                                    fontSize: 13,
                                    fontWeight: 800,
                                    cursor: 'pointer'
                                }}
                            >
                                Γ£¿ ADMIN: Autofill (No Skip)
                            </button>

                            <button 
                                onClick={() => {
                                    const dummyText = 'This is professional application content designed to meet all platform requirements for verification. I use active learning and interactive whiteboards to engage students in every session.';
                                    setFormData(prev => ({
                                        ...prev,
                                        fullName: prev.fullName || user?.name || 'Admin Tester',
                                        bio: prev.bio.length < 50 ? dummyText : prev.bio,
                                        experience: prev.experience.length < 50 ? dummyText : prev.experience,
                                        methodology: prev.methodology.length < 50 ? dummyText : prev.methodology,
                                        fitForPlatform: prev.fitForPlatform.length < 50 ? dummyText : prev.fitForPlatform,
                                        whyHire: prev.whyHire.length < 50 ? dummyText : prev.whyHire,
                                        city: prev.city || 'London',
                                        subjects: prev.subjects.length > 0 ? prev.subjects : ['Mathematics'],
                                        videoType: 'link',
                                        videoLink: 'https://youtube.com/watch?v=dQw4w9WgXcQ'
                                    }));
                                    setProfilePicPreview('https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&fit=crop');
                                    setCurrentStep(4); // Jump straight to the end
                                }}
                                style={{
                                    background: 'rgba(255, 75, 130, 0.05)',
                                    border: '1px solid #ff4b82',
                                    color: '#ff4b82',
                                    padding: '10px 20px',
                                    borderRadius: 14,
                                    fontSize: 13,
                                    fontWeight: 800,
                                    cursor: 'pointer'
                                }}
                            >
                                ΓÜí ADMIN: Fill & Jump
                            </button>
                            
                            <button 
                                onClick={async () => {
                                    // Instant Submit logic
                                    const dummyText = 'This is a test content that satisfies the minimum requirement of fifty characters for professional verification purposes.';
                                    const newFormData = {
                                        ...formData,
                                        fullName: formData.fullName || user?.name || 'Admin Instant Tester',
                                        bio: formData.bio.length < 50 ? dummyText : formData.bio,
                                        experience: formData.experience.length < 50 ? dummyText : formData.experience,
                                        methodology: formData.methodology.length < 50 ? dummyText : formData.methodology,
                                        fitForPlatform: formData.fitForPlatform.length < 50 ? dummyText : formData.fitForPlatform,
                                        whyHire: formData.whyHire.length < 50 ? dummyText : formData.whyHire,
                                        city: formData.city || 'AdminCity',
                                        videoType: 'link' as const,
                                        videoLink: formData.videoLink || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
                                    };
                                    
                                    setFormData(newFormData);
                                    
                                    if (existingTutor) {
                                        const finalAppData = {
                                            ...existingTutor.applicationData,
                                            ...newFormData,
                                            profilePic: profilePicPreview || existingTutor.avatar,
                                            videoThumbnailUrl: thumbnailPreview || existingTutor.video_thumbnail_url,
                                            introVideoUrl: introVideoPreview || existingTutor.intro_video_url
                                        };
                                        
                                        await updateTutor(existingTutor.id, {
                                            applicationData: finalAppData,
                                            name: newFormData.fullName,
                                            bio: newFormData.bio,
                                            experience: newFormData.experience,
                                            subjects: newFormData.subjects,
                                            hourly_rate: parseFloat(newFormData.hourlyRate as any) || 20,
                                            verificationStatus: 'verified'
                                        });
                                        
                                        addToast('Admin instant submit complete!', 'success');
                                        router.replace('/tutor-dashboard');
                                    }
                                }}
                                style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--accent)',
                                    color: 'var(--accent)',
                                    padding: '10px 20px',
                                    borderRadius: 14,
                                    fontSize: 13,
                                    fontWeight: 800,
                                    cursor: 'pointer'
                                }}
                            >
                                ≡ƒÜÇ INSTANT SUBMIT
                            </button>
                        </div>
                    )}

                    {user && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginTop: 20, padding: '14px 24px', background: 'rgba(236,72,153,0.06)', border: '1px solid rgba(236,72,153,0.15)', borderRadius: 20, display: 'inline-flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Sparkles size={18} color="var(--accent)" />
                                <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>
                                    Become a Tutor! Share your expertise and join our elite circle.
                                </span>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginLeft: 28, opacity: 0.8 }}>
                                Join Sara and thousands of educators worldwide.
                            </span>
                        </motion.div>
                    )}

                </div>

                <ProgressIndicator />

                <div className="mobile-grid-1" style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) 380px',
                    gap: 40,
                    alignItems: 'start',
                    marginTop: 40
                }}>
                    <div style={{
                        background: 'var(--bg-elevated)',
                        padding: 'clamp(20px, 5vw, 48px)',
                        borderRadius: 40,
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-2xl)',
                        position: 'relative',
                        overflow: 'visible'
                    }}>
                        {/* Sara Mascot Bubble */}
                        {!submitted && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={`mascot-step-${currentStep}`}
                                style={{
                                    position: 'absolute', top: -30, right: -40, zIndex: 50,
                                    display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12,
                                    pointerEvents: 'none'
                                }}
                                className="mascot-guide"
                            >
                                <div style={{
                                    background: 'var(--bg)', padding: '12px 20px', borderRadius: '24px 24px 4px 24px',
                                    border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', maxWidth: 220,
                                    position: 'relative'
                                }}>
                                    <p style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.4, color: 'var(--text)' }}>
                                        {currentStep === 1 && "Hi! I'm Sara. A strong bio increases your search visibility by 60%!"}
                                        {currentStep === 2 && "Expertise matters! Detailed specialties help us match you with the right students."}
                                        {currentStep === 3 && "Looking good! High-quality media is the #1 factor for student conversions."}
                                        {currentStep === 4 && "Almost there! Verified tutors get 4x more profile views."}
                                    </p>
                                </div>
                                <div style={{
                                    width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
                                    border: '4px solid var(--bg-elevated)', boxShadow: 'var(--shadow-xl)',
                                    background: 'var(--accent)', flexShrink: 0, pointerEvents: 'auto'
                                }}>
                                    <img
                                        src={currentStep === 2 ? "/guide-laptop.png" : "/guide-pointing.png"}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                            </motion.div>
                        )}

                        <AnimatePresence mode="wait">
                            {/* STEP 1: PERSONAL INFORMATION */}
                            {currentStep === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
                                        <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(26, 115, 232, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={26} color="var(--accent)" />
                                        </div>
                                        <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em' }}>Personal Identity</h2>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                                        {/* Name and Portrait Identity */}
                                        <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', background: 'rgba(26, 115, 232, 0.03)', padding: 32, borderRadius: 24, border: '1px solid var(--border)' }}>
                                            <div style={{ flexShrink: 0 }}>
                                                <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase' }}>Profile Portrait <span style={{ color: '#ff4b82' }}>*</span></label>
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    onClick={() => {
                                                        if (profilePicPreview) {
                                                            setEnlargedPreview({ url: profilePicPreview, type: 'image' });
                                                        } else {
                                                            document.getElementById('pic-up')?.click();
                                                        }
                                                    }}
                                                    onDragOver={e => handleDrag(e, 'profilePic')}
                                                    onDragLeave={e => handleDrag(e, 'profilePic')}
                                                    onDrop={e => handleDrop(e, 'profilePic')}
                                                    style={{
                                                        width: 140, height: 140, borderRadius: 40,
                                                        background: isDragging === 'profilePic' ? 'rgba(26, 115, 232, 0.1)' : 'var(--bg)',
                                                        border: `3px dashed ${isDragging === 'profilePic' ? 'var(--accent)' : 'var(--border)'}`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isUploadingProfile ? 'wait' : 'pointer', overflow: 'hidden',
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        boxShadow: 'var(--shadow-lg)',
                                                        position: 'relative'
                                                    }}
                                                >
                                                    {isUploadingProfile ? (
                                                        <div style={{ textAlign: 'center' }}>
                                                            <div className="animate-spin" style={{ width: 32, height: 32, border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 8px' }} />
                                                            <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase' }}>Uploading...</p>
                                                        </div>
                                                    ) : profilePicPreview ? (
                                                        <>
                                                            <img src={profilePicPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.2s' }} className="hover-overlay-expand">
                                                                <Target size={24} color="#fff" />
                                                            </div>
                                                        </>
                                                    ) : <ImageIcon size={40} color="var(--text-muted)" />}
                                                </motion.div>
                                                <input
                                                    id="pic-up"
                                                    type="file"
                                                    accept="image/*"
                                                    hidden
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0] || null;
                                                        if (file) {
                                                            setFiles({ ...files, profilePic: file });
                                                            // Show instant preview with blob URL
                                                            setProfilePicPreview(URL.createObjectURL(file));
                                                            setIsUploadingProfile(true);
                                                            // BUT ALSO: Upload immediately to get a permanent HTTP URL
                                                            try {
                                                                const permanentUrl = await handleFileUpload(file, 'avatars', 'profiles');
                                                                console.log('[TutorApp] Profile pic uploaded immediately:', permanentUrl);
                                                                setProfilePicPreview(permanentUrl);
                                                                addToast('Profile photo uploaded successfully', 'success');
                                                                
                                                                // Immediate Persistence
                                                                const existing = tutors.find(t => t.profile_id === user?.id);
                                                                if (existing) {
                                                                    updateTutor(existing.id, { 
                                                                        avatar: permanentUrl,
                                                                        applicationData: { ...(existing.applicationData || {}), profilePicUrl: permanentUrl }
                                                                    });
                                                                }
                                                            } catch (uploadErr: any) {
                                                                console.error('[TutorApp] Immediate profile pic upload failed:', uploadErr);
                                                                addToast('Photo upload failed: ' + (uploadErr.message || 'Try again'), 'error');
                                                                // CRITICAL: Clear preview if upload failed so user knows it's not saved
                                                                setProfilePicPreview(null);
                                                                setFiles({ ...files, profilePic: null });
                                                            } finally {
                                                                setIsUploadingProfile(false);
                                                            }
                                                        } else {
                                                            setProfilePicPreview(null);
                                                            setFiles({ ...files, profilePic: null });
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ marginBottom: 24 }}>
                                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>Full Professional Name <span style={{ color: '#ff4b82' }}>*</span></label>
                                                    <input
                                                        value={formData.fullName}
                                                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                                        className="input-field"
                                                        placeholder="e.g. Dr. Sara Jenkins"
                                                        style={{ height: 56, borderRadius: 16, padding: '0 20px', fontSize: 16, fontWeight: 700 }}
                                                    />
                                                </div>
                                                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                                    This is how students will see you. We suggest using your full name or professional title.
                                                </p>
                                                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                                                    <button onClick={() => document.getElementById('pic-up')?.click()} className="btn-secondary" style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13 }}>{files.profilePic ? 'Change Photo' : 'Upload Photo'}</button>
                                                    {(files.profilePic || profilePicPreview) && <button onClick={() => { setFiles({ ...files, profilePic: null }); setProfilePicPreview(null); }} className="btn-ghost" style={{ color: '#ff4b82', fontSize: 13 }}>Remove</button>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* What your photo needs section */}
                                        <div style={{ padding: 32, background: 'rgba(26, 115, 232, 0.02)', borderRadius: 24, border: '1px solid var(--border)' }}>
                                            <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 24, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <Target size={20} color="var(--accent)" /> What your photo needs
                                            </h3>
                                            <div style={{ display: 'flex', gap: 16, marginBottom: 32, overflowX: 'auto', paddingBottom: 8 }}>
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <div key={i} style={{ width: 80, height: 80, borderRadius: 16, background: 'var(--bg)', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
                                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=tutor${i + 10}`} alt="Example" />
                                                    </div>
                                                ))}
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                                                {[
                                                    'You should be facing forward',
                                                    'Frame your head and shoulders',
                                                    'You should be centered and upright',
                                                    'Your face and eyes should be visible (except for religious reasons)',
                                                    'You should be the only person in the photo'
                                                ].map(text => (
                                                    <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                            <CheckCircle2 size={14} color="#10b981" />
                                                        </div>
                                                        {text}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                <span>Professional Biography <span style={{ color: '#ff4b82' }}>*</span></span>
                                                <span style={{ fontSize: 11, color: formData.bio.length < 50 ? '#ff4b82' : 'var(--accent-green)' }}>
                                                    {formData.bio.length}/50 min characters
                                                </span>
                                            </label>
                                            <textarea
                                                rows={5}
                                                placeholder="Introduce your teaching philosophy. Highlight your background and what makes your classes unique..."
                                                value={formData.bio}
                                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                                className="input-field"
                                                style={{
                                                    height: 'auto',
                                                    borderRadius: 20,
                                                    padding: 20,
                                                    fontSize: 16,
                                                    lineHeight: 1.6,
                                                    borderColor: formData.bio.length > 0 && formData.bio.length < 50 ? '#ff4b82' : 'var(--border)',
                                                    background: formData.bio.length > 0 && formData.bio.length < 50 ? 'rgba(255, 75, 130, 0.03)' : 'var(--bg)'
                                                }}
                                            />
                                        </div>

                                        <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                                            <div>
                                                <CountrySelect
                                                    value={formData.livingCountry}
                                                    onChange={val => setFormData({ ...formData, livingCountry: val })}
                                                    label="Country of Residence"
                                                />
                                            </div>
                                            <div>
                                                <CountrySelect
                                                    value={formData.birthCountry}
                                                    onChange={val => setFormData({ ...formData, birthCountry: val })}
                                                    label="Country of Birth"
                                                />
                                            </div>
                                        </div>
                                        <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>City <span style={{ color: '#ff4b82' }}>*</span></label>
                                                <input
                                                    value={formData.city}
                                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                                    className="input-field"
                                                    placeholder="e.g. London"
                                                    style={{ height: 56, borderRadius: 16, padding: '0 16px', fontSize: 15 }}
                                                />
                                            </div>
                                            <div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>Language <span style={{ color: '#ff4b82' }}>*</span></label>
                                                        <div style={{ position: 'relative' }}>
                                                            <select
                                                                id="lang-select"
                                                                className="input-field"
                                                                style={{ height: 56, borderRadius: 16, padding: '0 16px', fontSize: 15 }}
                                                                defaultValue=""
                                                            >
                                                                <option value="" disabled>Select Language...</option>
                                                                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                                                            </select>
                                                            <div className="hover-overlay-expand" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                                                                <Globe size={18} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div style={{ width: 180 }}>
                                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>Level <span style={{ color: '#ff4b82' }}>*</span></label>
                                                        <select
                                                            id="level-select"
                                                            className="input-field"
                                                            style={{ height: 56, borderRadius: 16, padding: '0 16px', fontSize: 15 }}
                                                            defaultValue="B2"
                                                        >
                                                            {LANGUAGE_LEVELS.map(l => (
                                                                <option key={l.code} value={l.code}>{l.code} - {l.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const lang = (document.getElementById('lang-select') as HTMLSelectElement).value;
                                                            const level = (document.getElementById('level-select') as HTMLSelectElement).value;
                                                            if (lang && !formData.languages.some(l => l.name === lang)) {
                                                                setFormData({ ...formData, languages: [...formData.languages, { name: lang, level }] });
                                                            }
                                                        }}
                                                        className="btn-primary"
                                                        style={{ height: 56, width: 56, borderRadius: 16, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    >
                                                        <UserPlus size={24} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {formData.languages.length > 0 && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                                {formData.languages.map(lang => (
                                                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} key={lang.name} style={{ padding: '8px 16px', background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 700 }}>
                                                        <span style={{ color: 'var(--text)' }}>{lang.name}</span>
                                                        <span style={{ padding: '2px 6px', background: 'rgba(26, 115, 232, 0.1)', color: 'var(--accent)', borderRadius: 6, fontSize: 11, fontWeight: 900 }}>{lang.level}</span>
                                                        <X size={16} style={{ cursor: 'pointer', color: '#ff4b82', marginLeft: 4 }} onClick={() => setFormData({ ...formData, languages: formData.languages.filter(l => l.name !== lang.name) })} />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 2: EXPERTISE & EXPERIENCE */}
                            {currentStep === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
                                        <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(26, 115, 232, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <BookOpen size={26} color="var(--accent)" />
                                        </div>
                                        <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em' }}>Subject Expertise</h2>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>Subjects you Command <span style={{ color: '#ff4b82' }}>*</span></label>
                                            <select
                                                className="input-field"
                                                style={{ height: 56, borderRadius: 16, padding: '0 16px', fontSize: 15, marginBottom: 16 }}
                                                onChange={e => e.target.value && !formData.subjects.includes(e.target.value) && setFormData({ ...formData, subjects: [...formData.subjects, e.target.value] })}
                                            >
                                                <option value="">Select subject...</option>
                                                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                                {formData.subjects.map(s => (
                                                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} key={s} style={{ padding: '8px 16px', background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 700 }}>
                                                        {s} <X size={16} style={{ cursor: 'pointer', color: '#ff4b82' }} onClick={() => setFormData({ ...formData, subjects: formData.subjects.length > 1 ? formData.subjects.filter(sub => sub !== s) : formData.subjects })} />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>Specialties & Niches</label>
                                            <input
                                                placeholder="e.g. AP Calculus, IELTS Prep, Python Data Science..."
                                                value={formData.specialties}
                                                onChange={e => setFormData({ ...formData, specialties: e.target.value })}
                                                className="input-field"
                                                style={{ height: 56, borderRadius: 16, padding: '0 20px', fontSize: 16 }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>
                                                <span>Teaching Experience <span style={{ color: '#ff4b82' }}>*</span></span>
                                                <span style={{ fontSize: 11, color: formData.experience.length < 50 ? '#ff4b82' : 'var(--accent-green)' }}>
                                                    {formData.experience.length}/50 min characters
                                                </span>
                                            </label>
                                            <textarea
                                                rows={5}
                                                placeholder="Tell us about your professional background, certifications, and previous teaching roles..."
                                                value={formData.experience}
                                                onChange={e => setFormData({ ...formData, experience: e.target.value })}
                                                className="input-field"
                                                style={{
                                                    height: 'auto',
                                                    borderRadius: 20,
                                                    padding: 20,
                                                    fontSize: 16,
                                                    lineHeight: 1.6,
                                                    borderColor: formData.experience.length > 0 && formData.experience.length < 50 ? '#ff4b82' : 'var(--border)',
                                                    background: formData.experience.length > 0 && formData.experience.length < 50 ? 'rgba(255, 75, 130, 0.03)' : 'var(--bg)'
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>
                                                <span>Teaching Methodology <span style={{ color: '#ff4b82' }}>*</span></span>
                                                <span style={{ fontSize: 11, color: formData.methodology.length < 50 ? '#ff4b82' : 'var(--accent-green)' }}>
                                                    {formData.methodology.length}/50 min characters
                                                </span>
                                            </label>
                                            <textarea
                                                rows={4}
                                                placeholder="Explain your approach to teaching. Do you use active learning, Socratic method, or project-based learning?"
                                                value={formData.methodology}
                                                onChange={e => setFormData({ ...formData, methodology: e.target.value })}
                                                className="input-field"
                                                style={{
                                                    height: 'auto',
                                                    borderRadius: 20,
                                                    padding: 20,
                                                    fontSize: 16,
                                                    lineHeight: 1.6,
                                                    borderColor: formData.methodology.length > 0 && formData.methodology.length < 50 ? '#ff4b82' : 'var(--border)',
                                                    background: formData.methodology.length > 0 && formData.methodology.length < 50 ? 'rgba(255, 75, 130, 0.03)' : 'var(--bg)'
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>
                                                Expected Hourly Rate ({pricing.currency}) <span style={{ color: '#ff4b82' }}>*</span>
                                            </label>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type="number"
                                                    placeholder={`e.g. ${pricing.currency === 'INR' ? '500' : (pricing.symbol + '20')}`}
                                                    value={formData.hourlyRate || ''}
                                                    onChange={e => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) || 0 })}
                                                    className="input-field"
                                                    style={{ height: 56, borderRadius: 16, padding: '0 50px 0 20px', fontSize: 16, fontWeight: 700 }}
                                                />
                                                <div style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--text-muted)', fontSize: 14 }}>
                                                    / hr
                                                </div>
                                            </div>
                                            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
                                                Set your own professional rate. You can update this later in your dashboard.
                                            </p>
                                        </div>

                                        {/* Group Class Interest Section */}
                                        <div style={{ background: 'rgba(26, 115, 232, 0.03)', padding: 32, borderRadius: 24, border: '1px solid var(--border)' }}>
                                            <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 24, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <Users size={20} color="var(--accent)" /> Group Class Interest
                                            </h3>
                                            <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                                <div 
                                                    onClick={() => setFormData({ ...formData, wants_1to5: !formData.wants_1to5 })}
                                                    style={{ 
                                                        padding: 24, 
                                                        background: formData.wants_1to5 ? 'rgba(26, 115, 232, 0.08)' : 'var(--bg)', 
                                                        borderRadius: 20, 
                                                        border: '2px solid',
                                                        borderColor: formData.wants_1to5 ? 'var(--accent)' : 'var(--border)',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                                        <div style={{ 
                                                            width: 20, height: 20, borderRadius: 6, 
                                                            border: '2px solid', 
                                                            borderColor: formData.wants_1to5 ? 'var(--accent)' : 'var(--text-muted)',
                                                            background: formData.wants_1to5 ? 'var(--accent)' : 'transparent',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                        }}>
                                                            {formData.wants_1to5 && <Check size={14} color="#fff" strokeWidth={4} />}
                                                        </div>
                                                        <label style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', cursor: 'pointer' }}>1 to 5 Students</label>
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                                        Interested in teaching small group classes.
                                                    </p>
                                                </div>
                                                <div 
                                                    onClick={() => setFormData({ ...formData, wants_1to10: !formData.wants_1to10 })}
                                                    style={{ 
                                                        padding: 24, 
                                                        background: formData.wants_1to10 ? 'rgba(26, 115, 232, 0.08)' : 'var(--bg)', 
                                                        borderRadius: 20, 
                                                        border: '2px solid',
                                                        borderColor: formData.wants_1to10 ? 'var(--accent)' : 'var(--border)',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                                        <div style={{ 
                                                            width: 20, height: 20, borderRadius: 6, 
                                                            border: '2px solid', 
                                                            borderColor: formData.wants_1to10 ? 'var(--accent)' : 'var(--text-muted)',
                                                            background: formData.wants_1to10 ? 'var(--accent)' : 'transparent',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                        }}>
                                                            {formData.wants_1to10 && <Check size={14} color="#fff" strokeWidth={4} />}
                                                        </div>
                                                        <label style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', cursor: 'pointer' }}>1 to 10 Students</label>
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                                        Interested in teaching dynamic larger groups.
                                                    </p>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'start', gap: 12, marginTop: 24, padding: 20, background: 'rgba(26, 115, 232, 0.08)', borderRadius: 16 }}>
                                                <Info size={18} color="var(--accent)" style={{ marginTop: 2 }} />
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5, margin: 0, fontWeight: 700 }}>
                                                        Admin-Determined Pricing
                                                    </p>
                                                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, margin: '4px 0 0 0' }}>
                                                        By expressing interest, you agree that group class pricing for these sizes will be set by administrators.
                                                    </p>
                                                    <div style={{ marginTop: 20 }}>
                                                        <h4 style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>≡ƒöÑ High-Demand Group Exams:</h4>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                            {['SAT / ACT', 'JEE Main', 'GRE / GMAT', 'A-Level', 'IB Math', 'AP Calculus', 'IGCSE', 'AMC 8/10', '11+ Entrance', 'Math Olympiad'].map(exam => {
                                                                const isSelected = formData.subjects.includes(exam);
                                                                return (
                                                                    <span
                                                                        key={exam}
                                                                        onClick={() => {
                                                                            if (isSelected) {
                                                                                if (formData.subjects.length > 1) {
                                                                                    setFormData({ ...formData, subjects: formData.subjects.filter(s => s !== exam) });
                                                                                }
                                                                            } else {
                                                                                setFormData({ ...formData, subjects: [...formData.subjects, exam] });
                                                                            }
                                                                        }}
                                                                        style={{
                                                                            padding: '6px 12px',
                                                                            background: isSelected ? 'rgba(26, 115, 232, 0.1)' : 'var(--bg)',
                                                                            border: isSelected ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                                                                            borderRadius: 10,
                                                                            fontSize: 11,
                                                                            fontWeight: 800,
                                                                            color: isSelected ? 'var(--accent)' : 'var(--text)',
                                                                            cursor: 'pointer',
                                                                            transition: '0.2s',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: 4
                                                                        }}
                                                                    >
                                                                        {exam} {isSelected && <CheckCircle2 size={12} />}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 3: MEDIA & PRESENCE */}
                            {currentStep === 3 && (
                                <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
                                        <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(26, 115, 232, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Video size={26} color="var(--accent)" />
                                        </div>
                                        <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em' }}>Visual Portfolio</h2>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                                        {/* Video Intro */}
                                        <div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) 280px', gap: 32 }} className="mobile-grid-1">
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student-Facing Introduction Video</label>
                                                        <div style={{ background: 'rgba(255, 75, 130, 0.1)', color: '#ff4b82', padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}>Audience: Future Students</div>
                                                    </div>

                                                    <div style={{ background: 'rgba(26, 115, 232, 0.05)', border: '1px solid rgba(26, 115, 232, 0.1)', padding: '16px 20px', borderRadius: 16, marginBottom: 24 }}>
                                                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <Target size={16} /> IMPORTANT: Talk to your students!
                                                        </p>
                                                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.5 }}>
                                                            This video is the first thing students see on your profile. Imagine you are in your first lesson. <span style={{ color: 'var(--accent)', fontWeight: 800 }}>Do NOT</span> address administrators or ask for a job. Pitch yourself to your future students!
                                                        </p>
                                                    </div>
                                                    
                                                    <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                                                        <button
                                                            onClick={() => setFormData({ ...formData, videoType: 'upload' })}
                                                            style={{
                                                                flex: 1, padding: '12px', borderRadius: 12, border: '1px solid var(--border)',
                                                                background: formData.videoType === 'upload' ? 'var(--accent)' : 'var(--bg)',
                                                                color: formData.videoType === 'upload' ? '#fff' : 'var(--text)',
                                                                fontWeight: 800, fontSize: 13, cursor: 'pointer', transition: '0.3s'
                                                            }}
                                                        >File Upload</button>
                                                        <button
                                                            onClick={() => setFormData({ ...formData, videoType: 'link' })}
                                                            style={{
                                                                flex: 1, padding: '12px', borderRadius: 12, border: '1px solid var(--border)',
                                                                background: formData.videoType === 'link' ? 'var(--accent)' : 'var(--bg)',
                                                                color: formData.videoType === 'link' ? '#fff' : 'var(--text)',
                                                                fontWeight: 800, fontSize: 13, cursor: 'pointer', transition: '0.3s'
                                                            }}
                                                        >YouTube/Loom</button>
                                                    </div>

                                                    <div
                                                        onDragOver={e => handleDrag(e, 'videoFile')}
                                                        onDragLeave={e => handleDrag(e, 'videoFile')}
                                                        onDrop={e => handleDrop(e, 'videoFile')}
                                                        onClick={() => formData.videoType === 'upload' && !files.videoFile && document.getElementById('vid-up')?.click()}
                                                        style={{
                                                            background: '#000', borderRadius: 24, overflow: 'hidden', aspectRatio: '16/9',
                                                            border: `3px dashed ${isDragging === 'videoFile' ? 'var(--accent)' : 'transparent'}`,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            cursor: formData.videoType === 'upload' ? 'pointer' : 'default', position: 'relative',
                                                            boxShadow: 'var(--shadow-xl)'
                                                        }}
                                                    >
                                                        {formData.videoType === 'upload' ? (
                                                            <>
                                                                <input id="vid-up" type="file" accept="video/*" hidden onChange={async e => {
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        setIsUploadingVideo(true);
                                                                        setIntroVideoPreview(URL.createObjectURL(file));
                                                                        
                                                                        try {
                                                                            const url = await handleFileUpload(file, 'intro-videos', 'videos');
                                                                            setIntroVideoPreview(url);
                                                                            
                                                                            const existing = tutors.find(t => t.profile_id === user?.id);
                                                                            if (existing) {
                                                                                updateTutor(existing.id, { 
                                                                                    intro_video_url: url,
                                                                                    applicationData: { ...(existing.applicationData || {}), introVideoUrl: url }
                                                                                });
                                                                            }
                                                                            setFiles(prev => ({ ...prev, videoFile: file }));
                                                                            addToast('Video uploaded successfully', 'success');
                                                                        } catch (err: any) {
                                                                            console.error('[TutorApp] Video upload failed:', err);
                                                                            addToast(err.message || 'Video upload failed', 'error');
                                                                            setIntroVideoPreview(null);
                                                                            setFiles(prev => ({ ...prev, videoFile: null }));
                                                                        } finally {
                                                                            setIsUploadingVideo(false);
                                                                        }
                                                                    }
                                                                }} />
                                                                {isUploadingVideo ? (
                                                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                                                                        <div className="spinner-small" style={{ margin: '0 auto 16px', borderColor: '#fff' }} />
                                                                        <p style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>Uploading Video...</p>
                                                                    </div>
                                                                ) : null}
                                                                {files.videoFile || introVideoPreview ? (
                                                                    <>
                                                                        <video src={files.videoFile ? URL.createObjectURL(files.videoFile) : introVideoPreview as string} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                        <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 10 }}>
                                                                            <button onClick={(e) => { 
                                                                                e.stopPropagation(); 
                                                                                setFiles({ ...files, videoFile: null }); 
                                                                                setIntroVideoPreview(null);
                                                                                const existingTutor = tutors.find(t => t.profile_id === user?.id);
                                                                                if (existingTutor) {
                                                                                    updateTutor(existingTutor.id, { 
                                                                                        intro_video_url: null as any,
                                                                                        applicationData: { ...(existingTutor.applicationData || {}), introVideoUrl: null as any }
                                                                                    });
                                                                                }
                                                                            }} style={{ background: 'rgba(255, 75, 130, 0.9)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>Remove</button>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div style={{ textAlign: 'center', color: '#fff' }}>
                                                                        {isUploadingVideo ? (
                                                                            <>
                                                                                <div className="spinner-small" style={{ margin: '0 auto 16px', borderColor: '#fff' }} />
                                                                                <p style={{ fontWeight: 800, fontSize: 16 }}>Uploading Video...</p>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                                                                    <Upload size={32} />
                                                                                </div>
                                                                                <p style={{ fontWeight: 800, fontSize: 16 }}>Click or Drag Video Here</p>
                                                                                <p style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>MP4/MOV, Max 50MB</p>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                                                {formData.videoLink && getVideoId(formData.videoLink).id ? (
                                                                    <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                                                                        <VideoPreview url={formData.videoLink} />
                                                                        <button 
                                                                            onClick={() => setFormData({ ...formData, videoLink: '' })}
                                                                            style={{
                                                                                position: 'absolute', top: 16, right: 16,
                                                                                background: 'rgba(0,0,0,0.5)', color: '#fff',
                                                                                border: '1px solid rgba(255,255,255,0.2)',
                                                                                width: 36, height: 36, borderRadius: 12,
                                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                                cursor: 'pointer', backdropFilter: 'blur(10px)'
                                                                            }}
                                                                        >
                                                                            <X size={18} />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 }}>
                                                                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>
                                                                            <Video size={32} />
                                                                        </div>
                                                                        <input
                                                                            placeholder="Paste YouTube or Loom URL..."
                                                                            value={formData.videoLink}
                                                                            onChange={e => setFormData({ ...formData, videoLink: e.target.value })}
                                                                            style={{ 
                                                                                width: '100%', maxWidth: 400,
                                                                                background: 'rgba(255,255,255,0.1)', 
                                                                                border: '1px solid rgba(255,255,255,0.2)', 
                                                                                borderRadius: 16, padding: '16px 24px', 
                                                                                color: '#fff', fontSize: 16, fontWeight: 600, 
                                                                                outline: 'none', textAlign: 'center'
                                                                            }}
                                                                        />
                                                                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Preview will appear automatically</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignSelf: 'end' }}>
                                                    {/* Video Success Guide */}
                                                    <div style={{ background: 'var(--bg)', padding: '24px', borderRadius: 24, border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
                                                        <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 20, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                                                            <ShieldCheck size={20} color="var(--accent)" /> Video Success Guide
                                                        </h3>
                                                        
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="mobile-grid-1">
                                                            <div>
                                                                <h4 style={{ fontSize: 11, fontWeight: 900, color: 'var(--accent-green)', textTransform: 'uppercase', marginBottom: 16, letterSpacing: '0.05em' }}>Γ£à Video Script Guide (4 Steps)</h4>
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                                                    {[
                                                                        { title: '1. Introduce Yourself', desc: 'Greeting, Name, and professional background.' },
                                                                        { title: '2. Explain Your Subjects', desc: 'Clearly state what exactly you teach.' },
                                                                        { title: '3. Share Your Style', desc: 'How do you help students succeed?' },
                                                                        { title: '4. Student Focus', desc: 'Keep the tone engaging and warm.' }
                                                                    ].map((item, i) => (
                                                                        <div key={i} style={{ display: 'flex', gap: 12 }}>
                                                                            <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(52, 199, 89, 0.1)', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, fontWeight: 900 }}>
                                                                                {i + 1}
                                                                            </div>
                                                                            <div>
                                                                                <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>{item.title}</p>
                                                                                <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, lineHeight: 1.4 }}>{item.desc}</p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 style={{ fontSize: 11, fontWeight: 900, color: '#ff4b82', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em' }}>What to Avoid</h4>
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                                    {[
                                                                        'Thank you for hiring me',
                                                                        'Background noise/Poor light',
                                                                        'Mentioning platform admins',
                                                                        'Low-energy presentation'
                                                                    ].map(t => (
                                                                        <div key={t} style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                                                                            <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#ff4b82' }} /> {t}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div style={{ marginTop: 24, padding: '16px', background: 'rgba(26, 115, 232, 0.05)', borderRadius: 16, border: '1px solid rgba(26, 115, 232, 0.1)' }}>
                                                            <div style={{ display: 'flex', gap: 12 }}>
                                                                <Zap size={18} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                                                                <div>
                                                                    <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>Expert Tip: The Professional Style</p>
                                                                    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4, fontWeight: 600 }}>
                                                                        Top tutors talk directly to the camera as if they are already teaching. Keep it between 1-2 minutes and show your personality!
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div style={{ background: 'var(--bg-elevated)', padding: '20px', borderRadius: 20, border: '1px solid var(--border)' }}>
                                                        <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, color: 'var(--text)' }}>Technical Specs (16:9 Landscape)</h3>
                                                        <div style={{ display: 'flex', gap: 16 }}>
                                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                                                                <Camera size={14} /> YouTube Ratio
                                                            </div>
                                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                                                                <Mic size={14} /> Clear Audio
                                                            </div>
                                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                                                                <Sun size={14} /> High Quality
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Thumbnail Section */}
                                            {(formData.videoType === 'upload' || formData.videoType === 'link') && (
                                                <div style={{ marginTop: 32 }}>
                                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase' }}>Video Thumbnail <span style={{ color: '#ff4b82' }}>*</span></label>
                                                    <div
                                                        onDragOver={e => handleDrag(e, 'videoThumbnail')}
                                                        onDragLeave={e => handleDrag(e, 'videoThumbnail')}
                                                        onDrop={e => handleDrop(e, 'videoThumbnail')}
                                                        style={{
                                                            display: 'flex', gap: 24, alignItems: 'center',
                                                            background: 'var(--bg)', padding: 20, borderRadius: 20,
                                                            border: `2px dashed ${isDragging === 'videoThumbnail' ? 'var(--accent)' : 'var(--border)'}`,
                                                            width: '100%'
                                                        }}
                                                    >
                                                        <div
                                                            onClick={() => document.getElementById('thumb-up')?.click()}
                                                            style={{ 
                                                                width: 140, 
                                                                aspectRatio: '16/9', 
                                                                borderRadius: 12, 
                                                                background: 'var(--bg-elevated)', 
                                                                border: '1px solid var(--border)', 
                                                                overflow: 'hidden', 
                                                                cursor: 'pointer', 
                                                                display: 'flex', 
                                                                alignItems: 'center', 
                                                                justifyContent: 'center',
                                                                boxShadow: 'var(--shadow-md)'
                                                            }}
                                                        >
                                                            {/* Show preview if file is selected OR if we have a persistent URL */}
                                                            {files.videoThumbnail ? (
                                                                <img src={URL.createObjectURL(files.videoThumbnail)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            ) : thumbnailPreview ? (
                                                                <img src={thumbnailPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            ) : <ImageIcon size={20} color="var(--text-muted)" />}
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <input id="thumb-up" type="file" accept="image/*" hidden onChange={async e => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    setIsUploadingThumb(true);
                                                                    // Temporary preview
                                                                    setThumbnailPreview(URL.createObjectURL(file));
                                                                    try {
                                                                        const url = await handleFileUpload(file, 'intro-videos', 'thumbnails');
                                                                        setThumbnailPreview(url);
                                                                        
                                                                        // Immediate Persistence
                                                                        const existing = tutors.find(t => t.profile_id === user?.id);
                                                                        if (existing) {
                                                                            updateTutor(existing.id, { 
                                                                                video_thumbnail_url: url,
                                                                                applicationData: { ...(existing.applicationData || {}), videoThumbnailUrl: url }
                                                                            } as any);
                                                                        }
                                                                        
                                                                        setFiles(prev => ({ ...prev, videoThumbnail: file }));
                                                                        addToast('Thumbnail uploaded', 'success');
                                                                    } catch (err: any) {
                                                                        console.error('[TutorApp] Thumbnail upload failed:', err);
                                                                        addToast(err.message || 'Upload failed', 'error');
                                                                        // Clear on failure
                                                                        setThumbnailPreview(null);
                                                                        setFiles(prev => ({ ...prev, videoThumbnail: null }));
                                                                    } finally {
                                                                        setIsUploadingThumb(false);
                                                                    }
                                                                }
                                                            }} />
                                                            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Upload a poster image.</p>
                                                            <div style={{ display: 'flex', gap: 8 }}>
                                                                {isUploadingThumb ? (
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent)', fontSize: 12, fontWeight: 700 }}>
                                                                        <div className="spinner-small" /> Uploading...
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <button onClick={() => document.getElementById('thumb-up')?.click()} className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12, borderRadius: 8 }}>
                                                                            {(files.videoThumbnail || (thumbnailPreview && !thumbnailPreview.startsWith('blob:')) || existingTutor?.video_thumbnail_url || existingTutor?.applicationData?.videoThumbnailUrl || (existingTutor?.applicationData as any)?.videoThumbnail) ? 'Change' : 'Select'}
                                                                        </button>
                                                                        {(files.videoThumbnail || (thumbnailPreview && !thumbnailPreview.startsWith('blob:')) || existingTutor?.video_thumbnail_url || existingTutor?.applicationData?.videoThumbnailUrl || (existingTutor?.applicationData as any)?.videoThumbnail) && (
                                                                            <button 
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setFiles({ ...files, videoThumbnail: null });
                                                                                    setThumbnailPreview(null);
                                                                                    // Also update server to clear it
                                                                                    if (existingTutor) {
                                                                                        updateTutor(existingTutor.id, { 
                                                                                            video_thumbnail_url: null as any,
                                                                                            applicationData: { ...(existingTutor.applicationData || {}), videoThumbnailUrl: null as any }
                                                                                        } as any);
                                                                                    }
                                                                                }}
                                                                                className="btn-secondary" 
                                                                                style={{ padding: '6px 12px', fontSize: 12, borderRadius: 8, color: '#ff4b82', borderColor: '#ff4b82', background: 'rgba(255, 75, 130, 0.05)' }}
                                                                            >
                                                                                Remove
                                                                            </button>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 4: VERIFICATION & DOCUMENTS */}
                            {currentStep === 4 && (
                                <motion.div key="step4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
                                        <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(26, 115, 232, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <ShieldCheck size={26} color="var(--accent)" />
                                        </div>
                                        <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em' }}>Credential Verification</h2>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                                        <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                                            {/* CV Upload */}
                                            <div
                                                onDragOver={e => handleDrag(e, 'cvResume')}
                                                onDragLeave={e => handleDrag(e, 'cvResume')}
                                                onDrop={e => handleDrop(e, 'cvResume')}
                                                style={{
                                                    background: isDragging === 'cvResume' ? 'rgba(26, 115, 232, 0.05)' : 'var(--bg)',
                                                    padding: 32, borderRadius: 24, border: `2px dashed ${isDragging === 'cvResume' ? 'var(--accent)' : 'var(--border)'}`,
                                                    textAlign: 'center'
                                                }}
                                            >
                                                <label style={{ display: 'block', fontSize: 12, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 20, textTransform: 'uppercase' }}>CV / Portfolio <span style={{ color: '#ff4b82' }}>*</span></label>
                                                <input 
                                                    type="file" 
                                                    hidden 
                                                    id="cv-up" 
                                                    onChange={async e => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setIsUploadingCV(true);
                                                            // Temporary preview
                                                            setCvPreview(URL.createObjectURL(file));
                                                            try {
                                                                const url = await handleFileUpload(file, 'tutor-docs', 'cv');
                                                                setCvPreview(url);
                                                                addToast('CV uploaded successfully', 'success');
                                                                setFiles(prev => ({ ...prev, cvResume: file }));
                                                            } catch (err: any) {
                                                                console.error('[TutorApp] CV upload failed:', err);
                                                                addToast('CV upload failed: ' + err.message, 'error');
                                                                // Clear on failure
                                                                setCvPreview(null);
                                                                setFiles(prev => ({ ...prev, cvResume: null }));
                                                            } finally {
                                                                setIsUploadingCV(false);
                                                            }
                                                        }
                                                    }} 
                                                />
                                                {isUploadingCV && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, justifyContent: 'center' }}>
                                                        <div className="animate-spin" style={{ width: 18, height: 18, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                                                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>Uploading...</span>
                                                    </div>
                                                )}
                                                {(files.cvResume || cvPreview) ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                                                        {((files.cvResume?.type.startsWith('image/')) || (cvPreview && !cvPreview.includes('.pdf') && !cvPreview.startsWith('blob:application/pdf'))) ? (
                                                            <div
                                                                onClick={() => setEnlargedPreview({ url: cvPreview || URL.createObjectURL(files.cvResume!), type: 'image' })}
                                                                style={{ width: 80, height: 80, borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
                                                            >
                                                                <img src={cvPreview || (files.cvResume ? URL.createObjectURL(files.cvResume) : '')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.2s' }} className="hover-overlay-expand">
                                                                    <Target size={18} color="#fff" />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div 
                                                                onClick={() => {
                                                                    const url = cvPreview || (files.cvResume ? URL.createObjectURL(files.cvResume) : null);
                                                                    if (url) {
                                                                        if (url.includes('.pdf') || (files.cvResume?.type === 'application/pdf')) {
                                                                            setEnlargedPreview({ url, type: 'pdf' });
                                                                        } else {
                                                                            window.open(url, '_blank');
                                                                        }
                                                                    }
                                                                }}
                                                                style={{ width: 56, height: 56, borderRadius: 12, background: 'rgba(26, 115, 232, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
                                                            >
                                                                <FileText size={28} color="var(--accent)" />
                                                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(26, 115, 232, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.2s', borderRadius: 12 }} className="hover-overlay-expand">
                                                                    <Target size={18} color="var(--accent)" />
                                                                </div>
                                                            </div>
                                                        )}
                                                        <span style={{ fontSize: 13, fontWeight: 800, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{files.cvResume?.name || 'CV / Portfolio'}</span>
                                                        <button onClick={(e) => { 
                                                            e.stopPropagation();
                                                            setFiles({ ...files, cvResume: null }); 
                                                            setCvPreview(null);
                                                            setTimeout(syncDraftToServer, 100);
                                                        }} style={{ color: '#ff4b82', background: 'none', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Remove</button>
                                                    </div>
                                                ) : (
                                                    <div onClick={() => document.getElementById('cv-up')?.click()} style={{ cursor: 'pointer' }}>
                                                        <FileText size={32} color="var(--text-muted)" style={{ marginBottom: 12 }} />
                                                        <p style={{ fontWeight: 800, fontSize: 14 }}>Upload CV</p>
                                                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>PDF, DOCX supported</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Education field */}
                                            <div style={{
                                                background: 'var(--bg)',
                                                padding: 32, borderRadius: 24, border: '1px solid var(--border)',
                                                display: 'flex', flexDirection: 'column', gap: 24
                                            }}>
                                                <div style={{ position: 'relative' }}>
                                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>University / School <span style={{ color: '#ff4b82' }}>*</span></label>
                                                    <input
                                                        type="text"
                                                        placeholder="Search university (e.g. Oxford, Stanford...)"
                                                        value={formData.education}
                                                        onChange={e => {
                                                            setFormData({ ...formData, education: e.target.value });
                                                            searchUniversities(e.target.value);
                                                        }}
                                                        className="input-field"
                                                        style={{ height: 56, borderRadius: 16, padding: '0 20px', fontSize: 16, fontWeight: 700 }}
                                                    />
                                                    {isSearchingUni && (
                                                        <div style={{ position: 'absolute', right: 16, top: 48 }}>
                                                            <div className="animate-spin" style={{ width: 20, height: 20, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                                                        </div>
                                                    )}
                                                    {uniResults.length > 0 && (
                                                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 20, marginTop: 8, zIndex: 100, boxShadow: '0 10px 40px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                                                            {uniResults.map((u, i) => (
                                                                <div 
                                                                    key={i} 
                                                                    onClick={() => {
                                                                        setFormData({ ...formData, education: u.name });
                                                                        setUniResults([]);
                                                                    }}
                                                                    style={{ padding: '16px 20px', cursor: 'pointer', borderBottom: i < uniResults.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 15, fontWeight: 700, color: 'var(--text)', transition: '0.2s' }}
                                                                    onMouseOver={e => (e.currentTarget.style.background = 'rgba(26, 115, 232, 0.05)')}
                                                                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                                                                >
                                                                    {u.name} <span style={{ fontSize: 12, opacity: 0.6, fontWeight: 500, marginLeft: 8 }}>({u.country})</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
                                                     <div style={{ position: 'relative', minWidth: 200 }}>
                                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>Degree Name <span style={{ color: '#ff4b82' }}>*</span></label>
                                                        <input
                                                            type="text"
                                                            list="degree-options"
                                                            placeholder="e.g. B.Sc. Computer Science"
                                                            value={formData.degreeName}
                                                            onChange={e => setFormData({ ...formData, degreeName: e.target.value })}
                                                            className="input-field"
                                                            style={{ height: 56, borderRadius: 16, padding: '0 20px', fontSize: 15, fontWeight: 600 }}
                                                        />
                                                        <datalist id="degree-options">
                                                            {/* Associate */}
                                                            <option value="Associate of Arts (A.A.)" />
                                                            <option value="Associate of Science (A.S.)" />
                                                            {/* Bachelor's */}
                                                            <option value="B.A. English Literature" />
                                                            <option value="B.A. History" />
                                                            <option value="B.A. Psychology" />
                                                            <option value="B.A. Sociology" />
                                                            <option value="B.A. Political Science" />
                                                            <option value="B.A. Philosophy" />
                                                            <option value="B.A. Economics" />
                                                            <option value="B.A. Fine Arts" />
                                                            <option value="B.A. Communications" />
                                                            <option value="B.A. Education" />
                                                            <option value="B.Sc. Computer Science" />
                                                            <option value="B.Sc. Mathematics" />
                                                            <option value="B.Sc. Physics" />
                                                            <option value="B.Sc. Chemistry" />
                                                            <option value="B.Sc. Biology" />
                                                            <option value="B.Sc. Environmental Science" />
                                                            <option value="B.Sc. Nursing" />
                                                            <option value="B.Sc. Data Science" />
                                                            <option value="B.Sc. Information Technology" />
                                                            <option value="B.Eng. Mechanical Engineering" />
                                                            <option value="B.Eng. Civil Engineering" />
                                                            <option value="B.Eng. Electrical Engineering" />
                                                            <option value="B.Eng. Chemical Engineering" />
                                                            <option value="B.Eng. Software Engineering" />
                                                            <option value="B.Tech. Computer Science" />
                                                            <option value="B.Tech. Electronics" />
                                                            <option value="BBA Business Administration" />
                                                            <option value="B.Com. Commerce" />
                                                            <option value="B.Arch. Architecture" />
                                                            <option value="BFA Fine Arts" />
                                                            <option value="B.Ed. Education" />
                                                            <option value="LLB Law" />
                                                            {/* Master's */}
                                                            <option value="M.A. English" />
                                                            <option value="M.A. Economics" />
                                                            <option value="M.A. Psychology" />
                                                            <option value="M.A. History" />
                                                            <option value="M.A. Education" />
                                                            <option value="M.Sc. Mathematics" />
                                                            <option value="M.Sc. Computer Science" />
                                                            <option value="M.Sc. Physics" />
                                                            <option value="M.Sc. Chemistry" />
                                                            <option value="M.Sc. Data Science" />
                                                            <option value="M.Eng. Engineering" />
                                                            <option value="M.Tech. Computer Science" />
                                                            <option value="MBA Business Administration" />
                                                            <option value="MFA Fine Arts" />
                                                            <option value="M.Ed. Education" />
                                                            <option value="LLM Law" />
                                                            <option value="MPH Public Health" />
                                                            <option value="MSW Social Work" />
                                                            {/* Doctorate / Professional */}
                                                            <option value="Ph.D. Physics" />
                                                            <option value="Ph.D. Mathematics" />
                                                            <option value="Ph.D. Computer Science" />
                                                            <option value="Ph.D. Chemistry" />
                                                            <option value="Ph.D. Biology" />
                                                            <option value="Ph.D. Education" />
                                                            <option value="Ph.D. Economics" />
                                                            <option value="Ph.D. Psychology" />
                                                            <option value="MBBS Medicine" />
                                                            <option value="MD Medicine" />
                                                            <option value="BDS Dental Surgery" />
                                                            <option value="PharmD Pharmacy" />
                                                            <option value="JD Juris Doctor" />
                                                            <option value="DBA Business Administration" />
                                                            {/* Diploma / Certificate */}
                                                            <option value="Diploma in Education" />
                                                            <option value="Diploma in Nursing" />
                                                            <option value="Diploma in Business" />
                                                            <option value="PGCE Teaching" />
                                                            <option value="CELTA English Teaching" />
                                                            <option value="TEFL Certificate" />
                                                            <option value="TESOL Certificate" />
                                                            {/* Other */}
                                                            <option value="Other" />
                                                        </datalist>
                                                        
                                                        {formData.degreeName === 'Other' && (
                                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 12 }}>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Enter your degree name manually..."
                                                                    onChange={e => setFormData({ ...formData, degreeName: e.target.value })}
                                                                    className="input-field"
                                                                    style={{ height: 50, borderRadius: 12, padding: '0 16px', fontSize: 14, border: '1.5px solid var(--accent)' }}
                                                                />
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                    <div style={{ minWidth: 180 }}>
                                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>Duration <span style={{ color: 'var(--accent-green)', marginLeft: 8 }}>(Optional)</span></label>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <select
                                                                value={formData.duration.split(' - ')[0] || ''}
                                                                onChange={e => {
                                                                    const end = formData.duration.split(' - ')[1] || '';
                                                                    setFormData({ ...formData, duration: `${e.target.value}${end ? ` - ${end}` : ''}` });
                                                                }}
                                                                className="input-field"
                                                                style={{ flex: 1, height: 56, borderRadius: 16, padding: '12px 10px', fontSize: 13.5, fontWeight: 600, minWidth: 80 }}
                                                            >
                                                                <option value="">Start Year</option>
                                                                {Array.from({ length: 51 }, (_, i) => 2030 - i).map(year => (
                                                                    <option key={year} value={year.toString()}>{year}</option>
                                                                ))}
                                                            </select>
                                                            <span style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: 13 }}>to</span>
                                                            <select
                                                                value={formData.duration.split(' - ')[1] || ''}
                                                                onChange={e => {
                                                                    const start = formData.duration.split(' - ')[0] || '';
                                                                    setFormData({ ...formData, duration: `${start ? `${start} - ` : ''}${e.target.value}` });
                                                                }}
                                                                className="input-field"
                                                                style={{ flex: 1, height: 56, borderRadius: 16, padding: '12px 10px', fontSize: 13.5, fontWeight: 600, minWidth: 80 }}
                                                            >
                                                                <option value="">End Year</option>
                                                                <option value="Present">Present</option>
                                                                {Array.from({ length: 51 }, (_, i) => 2030 - i).map(year => (
                                                                    <option key={year} value={year.toString()}>{year}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 0 }}>Enter your primary university or highest qualification details.</p>
                                                                                    {/* ID Upload */}
                                            <div
                                                onDragOver={e => handleDrag(e, 'identity')}
                                                onDragLeave={e => handleDrag(e, 'identity')}
                                                onDrop={e => handleDrop(e, 'identity')}
                                                style={{
                                                    background: isDragging === 'identity' ? 'rgba(26, 115, 232, 0.05)' : 'var(--bg)',
                                                    padding: 32, borderRadius: 24, border: `2px dashed ${isDragging === 'identity' ? 'var(--accent)' : 'var(--border)'}`,
                                                    textAlign: 'center'
                                                }}
                                            >
                                                <label style={{ display: 'block', fontSize: 12, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 20, textTransform: 'uppercase' }}>ID / Passport <span style={{ color: 'var(--accent-green)', marginLeft: 8 }}>(Optional)</span></label>
                                                <input 
                                                    type="file" 
                                                    hidden 
                                                    id="id-up" 
                                                    onChange={async e => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setIsUploadingID(true);
                                                            // Temporary preview
                                                            setIdPreview(URL.createObjectURL(file));
                                                            try {
                                                                const url = await handleFileUpload(file, 'tutor-docs', 'identity');
                                                                setIdPreview(url);
                                                                addToast('ID uploaded successfully', 'success');
                                                                setFiles(prev => ({ ...prev, identity: file }));
                                                            } catch (err: any) {
                                                                console.error('[TutorApp] ID upload failed:', err);
                                                                addToast('ID upload failed: ' + err.message, 'error');
                                                                // Clear on failure
                                                                setIdPreview(null);
                                                                setFiles(prev => ({ ...prev, identity: null }));
                                                            } finally {
                                                                setIsUploadingID(false);
                                                            }
                                                        }
                                                    }} 
                                                />
                                                {isUploadingID && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, justifyContent: 'center' }}>
                                                        <div className="animate-spin" style={{ width: 18, height: 18, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                                                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>Uploading...</span>
                                                    </div>
                                                )}
                                                {(files.identity || idPreview) ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                                                        {((files.identity?.type.startsWith('image/')) || (idPreview && !idPreview.includes('.pdf') && !idPreview.startsWith('blob:application/pdf'))) ? (
                                                            <div
                                                                onClick={() => setEnlargedPreview({ url: idPreview || URL.createObjectURL(files.identity!), type: 'image' })}
                                                                style={{ width: 80, height: 80, borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
                                                            >
                                                                 <img src={idPreview || (files.identity ? URL.createObjectURL(files.identity) : '')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                 <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.2s' }} className="hover-overlay-expand">
                                                                     <Target size={18} color="#fff" />
                                                                 </div>
                                                            </div>
                                                        ) : (
                                                            <div 
                                                                onClick={() => {
                                                                    const url = idPreview || (files.identity ? URL.createObjectURL(files.identity) : null);
                                                                    if (url) {
                                                                        if (url.includes('.pdf') || (files.identity?.type === 'application/pdf')) {
                                                                            setEnlargedPreview({ url, type: 'pdf' });
                                                                        } else {
                                                                            window.open(url, '_blank');
                                                                        }
                                                                    }
                                                                }}
                                                                style={{ width: 56, height: 56, borderRadius: 12, background: 'rgba(26, 115, 232, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
                                                            >
                                                                <Shield size={28} color="var(--accent)" />
                                                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(26, 115, 232, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.2s', borderRadius: 12 }} className="hover-overlay-expand">
                                                                    <Target size={18} color="var(--accent)" />
                                                                </div>
                                                            </div>
                                                        )}
                                                        <span style={{ fontSize: 13, fontWeight: 800, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{files.identity?.name || 'Identity Document'}</span>
                                                        <button onClick={(e) => { 
                                                            e.stopPropagation();
                                                            setFiles({ ...files, identity: null }); 
                                                            setIdPreview(null);
                                                            setTimeout(syncDraftToServer, 100);
                                                        }} style={{ color: '#ff4b82', background: 'none', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Remove</button>
                                                    </div>
                                                ) : (
                                                    <div onClick={() => document.getElementById('id-up')?.click()} style={{ cursor: 'pointer' }}>
                                                        <Shield size={32} color="var(--text-muted)" style={{ marginBottom: 12 }} />
                                                        <p style={{ fontWeight: 800, fontSize: 14 }}>Upload Proof</p>
                                                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>For verification & payouts</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Certificate Upload */}
                                            <div
                                                onDragOver={e => handleDrag(e, 'certificate')}
                                                onDragLeave={e => handleDrag(e, 'certificate')}
                                                onDrop={e => handleDrop(e, 'certificate')}
                                                style={{
                                                    background: isDragging === 'certificate' ? 'rgba(26, 115, 232, 0.05)' : 'var(--bg)',
                                                    padding: 32, borderRadius: 24, border: `2px dashed ${isDragging === 'certificate' ? 'var(--accent)' : 'var(--border)'}`,
                                                    textAlign: 'center'
                                                }}
                                            >
                                                <label style={{ display: 'block', fontSize: 12, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 20, textTransform: 'uppercase' }}>Certificate / Award <span style={{ color: 'var(--accent-green)', marginLeft: 8 }}>(Optional)</span></label>
                                                <input 
                                                    type="file" 
                                                    hidden 
                                                    id="cert-up" 
                                                    onChange={async e => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setIsUploadingCert(true);
                                                            // Temporary preview
                                                            setCertPreview(URL.createObjectURL(file));
                                                            try {
                                                                const url = await handleFileUpload(file, 'tutor-docs', 'certificates');
                                                                setCertPreview(url);
                                                                addToast('Certificate uploaded successfully', 'success');
                                                                setFiles(prev => ({ ...prev, certificate: file }));
                                                            } catch (err: any) {
                                                                console.error('[TutorApp] Certificate upload failed:', err);
                                                                addToast('Certificate upload failed: ' + err.message, 'error');
                                                                // Clear on failure
                                                                setCertPreview(null);
                                                                setFiles(prev => ({ ...prev, certificate: null }));
                                                            } finally {
                                                                setIsUploadingCert(false);
                                                            }
                                                        }
                                                    }} 
                                                />
                                                {isUploadingCert && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, justifyContent: 'center' }}>
                                                        <div className="animate-spin" style={{ width: 18, height: 18, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                                                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>Uploading...</span>
                                                    </div>
                                                )}
                                                {(files.certificate || certPreview) ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                                                        {((files.certificate?.type.startsWith('image/')) || (certPreview && !certPreview.includes('.pdf') && !certPreview.startsWith('blob:application/pdf'))) ? (
                                                            <div
                                                                onClick={() => setEnlargedPreview({ url: certPreview || URL.createObjectURL(files.certificate!), type: 'image' })}
                                                                style={{ width: 80, height: 80, borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
                                                            >
                                                                 <img src={certPreview || (files.certificate ? URL.createObjectURL(files.certificate) : '')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                 <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.2s' }} className="hover-overlay-expand">
                                                                     <Target size={18} color="#fff" />
                                                                 </div>
                                                            </div>
                                                        ) : (
                                                            <div 
                                                                onClick={() => {
                                                                    const url = certPreview || (files.certificate ? URL.createObjectURL(files.certificate) : null);
                                                                    if (url) {
                                                                        if (url.includes('.pdf') || (files.certificate?.type === 'application/pdf')) {
                                                                            setEnlargedPreview({ url, type: 'pdf' });
                                                                        } else {
                                                                            window.open(url, '_blank');
                                                                        }
                                                                    }
                                                                }}
                                                                style={{ width: 56, height: 56, borderRadius: 12, background: 'rgba(26, 115, 232, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
                                                            >
                                                                <Award size={28} color="var(--accent)" />
                                                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(26, 115, 232, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.2s', borderRadius: 12 }} className="hover-overlay-expand">
                                                                    <Target size={18} color="var(--accent)" />
                                                                </div>
                                                            </div>
                                                        )}
                                                        <span style={{ fontSize: 13, fontWeight: 800, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{files.certificate?.name || 'Academic Certificate'}</span>
                                                        <button onClick={(e) => { 
                                                            e.stopPropagation();
                                                            setFiles({ ...files, certificate: null }); 
                                                            setCertPreview(null);
                                                            setTimeout(syncDraftToServer, 100);
                                                        }} style={{ color: '#ff4b82', background: 'none', border: 'none', fontWeight: 800, cursor: 'pointer' }}>Remove</button>
                                                    </div>
                                                ) : (
                                                    <div onClick={() => document.getElementById('cert-up')?.click()} style={{ cursor: 'pointer' }}>
                                                        <Award size={32} color="var(--text-muted)" style={{ marginBottom: 12 }} />
                                                        <p style={{ fontWeight: 800, fontSize: 14 }}>Upload Award</p>
                                                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Diplomas, Certificates, etc.</p>
                                                    </div>
                                                )}
                                            </div>
      </div>
                                        </div>

                                        <div>
                                            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>
                                                <span>Professional Pitch (Why Study with You?) <span style={{ color: '#ff4b82' }}>*</span></span>
                                                <span style={{ fontSize: 11, color: formData.whyHire.length < 50 ? '#ff4b82' : 'var(--accent-green)' }}>
                                                    {formData.whyHire.length}/50 min characters
                                                </span>
                                            </label>
                                            <textarea
                                                rows={4}
                                                placeholder="Sum up your unique selling point for students. Why should they choose you over other tutors?"
                                                value={formData.whyHire}
                                                onChange={e => setFormData({ ...formData, whyHire: e.target.value })}
                                                className="input-field"
                                                style={{
                                                    height: 'auto',
                                                    borderRadius: 20,
                                                    padding: 20,
                                                    fontSize: 16,
                                                    lineHeight: 1.6,
                                                    borderColor: formData.whyHire.length > 0 && formData.whyHire.length < 50 ? '#ff4b82' : 'var(--border)',
                                                    background: formData.whyHire.length > 0 && formData.whyHire.length < 50 ? 'rgba(255, 75, 130, 0.03)' : 'var(--bg)'
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>
                                                <span>Fit for Platform (Internal Assessment) <span style={{ color: '#ff4b82' }}>*</span></span>
                                                <span style={{ fontSize: 11, color: formData.fitForPlatform.length < 50 ? '#ff4b82' : 'var(--accent-green)' }}>
                                                    {formData.fitForPlatform.length}/50 min characters
                                                </span>
                                            </label>
                                            <textarea
                                                rows={4}
                                                placeholder="GroupTutors focuses on collaborative learning. What unique value do you bring to a group classroom setting?"
                                                value={formData.fitForPlatform}
                                                onChange={e => setFormData({ ...formData, fitForPlatform: e.target.value })}
                                                className="input-field"
                                                style={{
                                                    height: 'auto',
                                                    borderRadius: 20,
                                                    padding: 20,
                                                    fontSize: 16,
                                                    lineHeight: 1.6,
                                                    borderColor: formData.fitForPlatform.length > 0 && formData.fitForPlatform.length < 50 ? '#ff4b82' : 'var(--border)',
                                                    background: formData.fitForPlatform.length > 0 && formData.fitForPlatform.length < 50 ? 'rgba(255, 75, 130, 0.03)' : 'var(--bg)'
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: 13, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>How did you hear about us? <span style={{ color: '#ff4b82' }}>*</span></label>
                                            <select
                                                value={formData.referralSource}
                                                onChange={e => setFormData({ ...formData, referralSource: e.target.value })}
                                                className="input-field"
                                                style={{ height: 56, borderRadius: 16, padding: '0 16px', fontSize: 15, fontWeight: 700 }}
                                            >
                                                <option value="" disabled>Select Source...</option>
                                                <option value="Google / Search">Google / Search Engine</option>
                                                <option value="Social Media">Social Media (Instagram, FB, LinkedIn)</option>
                                                <option value="Word of Mouth">Word of Mouth / Friend</option>
                                                <option value="Online Ad">Online Advertisement</option>
                                                <option value="University">University / School</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ACTIONS */}
                        <div style={{ marginTop: 56, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button
                                onClick={prevStep}
                                disabled={currentStep === 1 || loading}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)',
                                    padding: '14px 28px', borderRadius: 16,
                                    fontWeight: 800, cursor: 'pointer', visibility: currentStep === 1 ? 'hidden' : 'visible',
                                    transition: '0.2s'
                                }}
                            >
                                <ArrowLeft size={20} /> Back
                            </button>

                            {currentStep < 4 ? (
                                <button
                                    onClick={nextStep}
                                    disabled={!validateStep(currentStep)}
                                    className="btn-primary"
                                    style={{
                                        padding: '16px 48px', borderRadius: 18, display: 'flex',
                                        alignItems: 'center', gap: 12, fontSize: 16,
                                        opacity: validateStep(currentStep) ? 1 : 0.4,
                                        boxShadow: validateStep(currentStep) ? '0 15px 30px -10px var(--accent)' : 'none'
                                    }}
                                >
                                    Next Step <ChevronRight size={22} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !validateStep(currentStep)}
                                    className="btn-primary"
                                    style={{
                                        padding: '16px 56px', borderRadius: 18, display: 'flex',
                                        alignItems: 'center', gap: 12, fontSize: 17, minWidth: 240, justifyContent: 'center',
                                        opacity: validateStep(currentStep) ? 1 : 0.4,
                                        boxShadow: validateStep(currentStep) ? '0 15px 30px -10px var(--accent)' : 'none'
                                    }}
                                >
                                    {loading ? 'Finalizing Portfolio...' : 'Submit Application'} <Zap size={22} fill="currentColor" />
                                </button>
                            )}
                        </div>

                        {error && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 32, padding: 20, background: 'rgba(239, 68, 68, 0.08)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 16, fontSize: 15, fontWeight: 700, textAlign: 'center' }}>
                                {error}
                            </motion.div>
                        )}
                    </div>

                    {/* Live Preview Sidebar */}
                    <div className="mobile-hide" style={{ position: 'sticky', top: 120 }}>
                        <LiveProfilePreview
                            data={formData}
                            avatarUrl={profilePicPreview}
                            onViewFull={() => setIsFullPreviewOpen(true)}
                        />
                    </div>
                </div>

                <p style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>
                    Need help? Reach out to <span style={{ color: 'var(--accent)' }}>contact@grouptutors.com</span>
                </p>

                {/* Enlarged Preview Modal */}
                <AnimatePresence>
                    {enlargedPreview && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setEnlargedPreview(null)}
                            style={{
                                position: 'fixed', inset: 0, zIndex: 9999,
                                background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(10px)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40,
                                cursor: 'zoom-out'
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                onClick={e => e.stopPropagation()}
                                style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%', borderRadius: 24, overflow: 'hidden', cursor: 'default', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.5)' }}
                            >
                                <button
                                    onClick={() => setEnlargedPreview(null)}
                                    style={{ position: 'absolute', top: 20, right: 20, width: 44, height: 44, borderRadius: 15, background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, backdropFilter: 'blur(10px)' }}
                                >
                                    <X size={24} />
                                </button>

                                {enlargedPreview.type === 'image' ? (
                                    <img src={enlargedPreview.url} style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', display: 'block' }} />
                                ) : enlargedPreview.type === 'pdf' ? (
                                    <iframe src={enlargedPreview.url} style={{ width: '80vw', height: '85vh', border: 'none', background: '#fff', borderRadius: 12 }} />
                                ) : (
                                    <video src={enlargedPreview.url} controls autoPlay style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 12 }} />
                                )}

                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Full Profile Preview Modal */}
                <FullProfilePreview
                    isOpen={isFullPreviewOpen}
                    onClose={() => setIsFullPreviewOpen(false)}
                    data={{
                        ...formData,
                        introVideoUrl: introVideoPreview,
                        videoThumbnailUrl: thumbnailPreview,
                        cvUrl: cvPreview,
                        identityUrl: idPreview,
                        certUrl: certPreview,
                        wants_1to5: formData.wants_1to5,
                        wants_1to10: formData.wants_1to10,
                        price_5: formData.price_5,
                        price_10: formData.price_10
                    }}
                    avatarUrl={profilePicPreview}
                    name={formData.fullName || user?.name || 'Your Name'}
                />

                <style jsx global>{`
                .hover-overlay-expand {
                    pointer-events: none;
                }
                div:hover > .hover-overlay-expand, 
                motion.div:hover > .hover-overlay-expand {
                    opacity: 1 !important;
                }
                @media (max-width: 1200px) {
                    .onboarding-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
                @media (max-width: 992px) {
                    .mascot-guide {
                        display: none !important;
                    }
                }
                @media (max-width: 768px) {
                    .mobile-p {
                        padding: 20px !important;
                    }
                    .mobile-grid-1 {
                        gap: 16px !important;
                    }
                    h1 {
                        font-size: 24px !important;
                    }
                    h2 {
                        font-size: 20px !important;
                    }
                    .btn-primary, .btn-secondary {
                        width: 100% !important;
                        justify-content: center !important;
                    }
                }
            `}</style>
            </div >
            <WhatsAppFloat />
        </div>
    );
}
