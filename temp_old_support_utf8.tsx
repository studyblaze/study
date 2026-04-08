'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HelpCircle, MessageCircle, Book, Shield, Zap, Clock, Search, ChevronRight, X, Play, Lock, Bookmark, Users, CreditCard, Star, Video, Mic, Wifi, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ΓöÇΓöÇΓöÇ Full Article Content ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const articles: Record<string, { title: string; icon: any; color: string; guides: { title: string; content: string }[] }> = {
    'Getting Started': {
        title: 'Getting Started',
        icon: Book,
        color: '#8b5cf6',
        guides: [
            {
                title: 'How to Create Your Account',
                content: `**Step 1: Sign Up**
Go to grouptutors.com and click "Get Started". Enter your name, email, and a strong password. Verify your email to activate your account.

**Step 2: Complete Your Profile**
Navigate to Settings ΓåÆ Profile. Add your photo, first and last name. A complete profile helps tutors personalise sessions for you.

**Step 3: Set Up Your Wallet**
Go to Settings ΓåÆ Subscription & Credits. Add funds using Razorpay with any UPI, card, or net banking. Your balance is always available for instant booking.

**Step 4: Find Your First Tutor**
Click "Find Tutors" in the navbar. Filter by subject, price range, or language. Click any tutor card to see their profile, ratings, and available slots.

**Step 5: Book a Session**
On a tutor's profile, click "Book Session". Choose a time slot, select group or 1-on-1, and confirm payment. You'll receive an email confirmation instantly.`
            },
            {
                title: 'Navigating Your Student Dashboard',
                content: `Your dashboard is your command center. Here's what each section does:

**Dashboard (Home)** ΓÇö See upcoming lessons, your wallet balance, hours learned, and AI-powered study suggestions.

**Messages** ΓÇö Direct messaging with tutors. All booking confirmations also appear here.

**My Lessons** ΓÇö Full history of past and upcoming sessions. Download recordings (available for 90 days) from here.

**AI Tutor** ΓÇö Chat with our AI powered by LLaMA for instant doubt-solving, explanations, and homework help.

**Study Planner** ΓÇö Generate a personalised AI roadmap based on your exam date and subject.

**Community** ΓÇö The Global Student Forum. Ask questions, share tips, and connect with students worldwide.

**Wallet** ΓÇö Top up your balance, view transaction history, and request refunds.

**Support** ΓÇö This page! Raise issues, browse articles, or start a live chat.`
            },
            {
                title: 'Booking Your First Demo Lesson',
                content: `Every student gets **3 free demo lessons per month**. Here's how to use them:

**Finding a Demo Session**
When browsing tutors, look for the "Demo" badge on their profile cards. These are shorter 20ΓÇô30 minute intro sessions.

**Booking Process**
1. Click on a tutor with the Demo badge
2. Select "Book Demo" 
3. Choose an available time slot
4. The session is free ΓÇö no wallet deduction

**What to Expect**
Demo sessions are a great way to test chemistry with a tutor before committing to a full plan. The tutor will cover 1ΓÇô2 sample topics from your chosen subject.

**Refund Policy**
If you're not satisfied with a demo lesson, 100% of any credits used are refunded within 24 hours. Just contact support.`
            }
        ]
    },
    'Live Classrooms': {
        title: 'Live Classrooms',
        icon: Video,
        color: '#3b82f6',
        guides: [
            {
                title: 'Joining a Live Classroom',
                content: `**Before You Join**
- Ensure you have a stable internet connection (minimum 5 Mbps)
- Use Chrome or Firefox for best performance ΓÇö Safari may have audio issues
- Test your camera and mic at least 5 minutes before the class

**Joining the Session**
1. Go to Dashboard ΓåÆ My Lessons
2. Your upcoming session will show a "Join Now" button 5 minutes before start time
3. Click "Join Now" ΓÇö the classroom opens in the same tab
4. Allow camera and microphone access when prompted

**Classroom Controls**
- ≡ƒÄñ Mute/unmute yourself at any time
- ≡ƒô╖ Turn camera on/off
- Γ£ï Raise hand to ask a question
- ≡ƒÆ¼ Use the chat to type questions
- ≡ƒô║ View the tutor's shared screen
- ≡ƒô¥ Access the collaborative whiteboard`
            },
            {
                title: 'Fixing Camera & Microphone Issues',
                content: `**If your camera isn't working:**

1. Check that you allowed camera access when the browser asked
2. Go to your browser settings ΓåÆ Privacy ΓåÆ Camera ΓåÆ ensure GroupTutors is allowed
3. Close other apps that might be using the camera (Zoom, Teams, etc.)
4. Try unplugging and replugging your camera
5. Restart your browser

**If your microphone isn't working:**

1. Check browser microphone permissions (same as above)
2. Ensure the correct microphone is selected in the classroom audio settings
3. Check your system volume and that the mic isn't muted in Windows Sound settings
4. Use headphones with a built-in mic for best quality

**If you have echo or feedback:**
- Use headphones ΓÇö this eliminates echo completely
- Reduce speaker volume
- Mute yourself when not speaking`
            },
            {
                title: 'Poor Internet & Connection Issues',
                content: `**Quick Fixes for Slow Connection**

1. **Move closer to your Wi-Fi router** ΓÇö distance reduces speed significantly
2. **Disconnect other devices** from the same Wi-Fi during class
3. **Turn off video** ΓÇö audio-only uses 10x less bandwidth
4. **Close all background tabs and apps** ΓÇö especially YouTube, Spotify
5. **Use Ethernet cable** instead of Wi-Fi if possible

**Minimum Requirements**
- Video call: 3 Mbps upload + 3 Mbps download
- Audio only: 100 kbps

**If You Get Disconnected**
Don't worry ΓÇö the session continues without you. You can rejoin by clicking "Join Now" on your lesson card. Your attendance and recording are preserved.

**Session Recordings**
All live sessions are automatically recorded and available in My Lessons for 90 days after the class.`
            }
        ]
    },
    'Security & Safety': {
        title: 'Security & Safety',
        icon: Shield,
        color: '#22c55e',
        guides: [
            {
                title: 'How We Protect Your Data',
                content: `GroupTutors takes your privacy very seriously. Here's exactly how we protect you:

**Data Encryption**
All data transmitted between your browser and our servers is encrypted using TLS 1.3 ΓÇö the same standard used by banks. Your passwords are never stored in plain text; they're hashed using bcrypt.

**Payment Security**
We never store your card or bank details. All payments are processed by **Razorpay**, a PCI-DSS Level 1 certified payment gateway trusted by 8 million+ businesses in India.

**Database Security**
Your personal data is stored in Supabase with Row-Level Security (RLS) enabled ΓÇö meaning your data is only ever accessible to you, never to other students or tutors.

**Your Data Rights**
You can request a full export or deletion of your data at any time by emailing privacy@grouptutors.com.`
            },
            {
                title: 'Setting Up Two-Factor Authentication (2FA)',
                content: `**Why Enable 2FA?**
Two-factor authentication adds an extra layer of security. Even if someone knows your password, they can't access your account without your phone.

**How to Set Up 2FA**
1. Go to Settings ΓåÆ Security
2. Under "Two-Factor Authentication", click "Set Up 2FA"
3. A QR code will appear ΓÇö scan it with Google Authenticator or Authy
4. Enter the 6-digit code shown in your authenticator app
5. Click "Activate 2FA"

From now on, every login requires both your password AND the 6-digit code from your app.

**Recommended Apps**
- Google Authenticator (Android / iOS)
- Authy (more features, backup support)
- Microsoft Authenticator

**Lost Your Phone?**
Contact support immediately at support@grouptutors.com. Our team will verify your identity and disable 2FA on your account.`
            },
            {
                title: 'Reporting Unsafe Content or Behaviour',
                content: `GroupTutors is committed to maintaining a safe learning environment.

**What to Report**
- Inappropriate language or behaviour by a tutor or student
- Sharing of personal contact information outside the platform
- Any content that makes you feel unsafe or uncomfortable
- Spam, scam attempts, or fake profiles

**How to Report**
1. In any classroom or message, click the Γï« menu ΓåÆ "Report"
2. Select the reason and add details
3. Our team reviews all reports within 24 hours

**Zero Tolerance Policy**
Any confirmed violation of our community standards results in immediate account suspension. Tutors face permanent bans for serious violations.

**Emergency Contact**
If you feel immediately unsafe, contact support via Live Chat. We respond within 5 minutes during business hours (9 AM ΓÇô 9 PM IST).`
            }
        ]
    }
};

// ΓöÇΓöÇΓöÇ Article Modal ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function ArticleModal({ category, onClose }: { category: string; onClose: () => void }) {
    const [activeGuide, setActiveGuide] = useState(0);
    const data = articles[category];
    if (!data) return null;

    const guide = data.guides[activeGuide];

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, backdropFilter: 'blur(6px)', padding: 24 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                style={{ background: 'var(--bg-elevated)', borderRadius: 28, width: '100%', maxWidth: 760, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 64px rgba(0,0,0,0.4)' }}>

                {/* Header */}
                <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `${data.color}12` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${data.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: data.color }}>
                            <data.icon size={22} />
                        </div>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: data.color, textTransform: 'uppercase', letterSpacing: 1 }}>Help Center</div>
                            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{data.title}</h2>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><X size={22} /></button>
                </div>

                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    {/* Sidebar */}
                    <div style={{ width: 220, borderRight: '1px solid var(--border)', padding: '16px 0', overflowY: 'auto', flexShrink: 0 }}>
                        {data.guides.map((g, i) => (
                            <button key={i} onClick={() => setActiveGuide(i)} style={{ width: '100%', textAlign: 'left', padding: '12px 20px', background: activeGuide === i ? `${data.color}12` : 'none', border: 'none', borderLeft: activeGuide === i ? `3px solid ${data.color}` : '3px solid transparent', cursor: 'pointer', fontSize: 13, fontWeight: activeGuide === i ? 700 : 500, color: activeGuide === i ? 'var(--text)' : 'var(--text-muted)', lineHeight: 1.4, transition: 'all 0.15s' }}>
                                {g.title}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, padding: 28, overflowY: 'auto' }}>
                        <h3 style={{ fontSize: 19, fontWeight: 800, color: 'var(--text)', marginBottom: 20 }}>{guide.title}</h3>
                        <div style={{ lineHeight: 1.9, color: 'var(--text-muted)', fontSize: 14 }}>
                            {guide.content.split('\n').map((line, i) => {
                                if (line.startsWith('**') && line.endsWith('**') && !line.includes(' ')) return null;
                                if (line.startsWith('**')) {
                                    const parts = line.split('**').filter(Boolean);
                                    return <p key={i} style={{ margin: 0 }}>{parts.map((p, j) => j % 2 === 0 ? <span key={j}>{p}</span> : <strong key={j} style={{ color: 'var(--text)', fontWeight: 700 }}>{p}</strong>)}</p>;
                                }
                                if (line.startsWith('- ')) return <li key={i} style={{ margin: '4px 0', paddingLeft: 4 }}>{line.slice(2)}</li>;
                                if (!line.trim()) return <div key={i} style={{ height: 12 }} />;
                                return <p key={i} style={{ margin: 0 }}>{line}</p>;
                            })}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// ΓöÇΓöÇΓöÇ Main Support Page ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export default function SupportPage() {
    const router = useRouter();
    const [openCategory, setOpenCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const faqs = [
        { q: 'How do I book a lesson?', a: 'Go to "Find Tutors", choose a tutor, and click "Book Session" to see their available slots. Select a time, confirm payment, and you\'re done!' },
        { q: 'How do I join my live classroom?', a: 'Your upcoming lessons are on Dashboard ΓåÆ My Lessons. A "Join Now" button appears 5 minutes before start time. Click it and allow camera/mic access.' },
        { q: 'Can I get a refund for a session?', a: 'Yes! Cancel at least 24 hours in advance for a full refund to your wallet. Demo lessons are always 100% refundable.' },
        { q: 'How does the AI Study Planner work?', a: 'Enter your exam date and subject. Our AI (LLaMA 3.3 70B) builds a personalised week-by-week roadmap with tasks, tips, and session recommendations.' },
        { q: 'What is the commission structure?', a: 'Demo lessons: 100% to GroupTutors. Lessons 2ΓÇô50: 40% GroupTutors / 60% Tutor. Lessons 51ΓÇô100: 30%/70%. From lesson 101+: flat 20% to GroupTutors forever.' },
        { q: 'How do I set up 2FA?', a: 'Go to Settings ΓåÆ Security ΓåÆ "Set Up 2FA". Scan the QR code with Google Authenticator or Authy, enter the 6-digit code, and activate. Done!' },
        { q: 'Are sessions recorded?', a: 'Yes, all live sessions are automatically recorded. Recordings are available in My Lessons for 90 days after the session.' },
        { q: 'How do I add money to my wallet?', a: 'Go to Settings ΓåÆ Subscription & Credits ΓåÆ "Add Funds". Choose Γé╣500, Γé╣1,000, Γé╣2,000, or Γé╣5,000. Pay securely via Razorpay (UPI, card, net banking).' },
    ];

    const filteredFaqs = faqs.filter(f =>
        f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.a.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const categories = [
        { icon: Book, title: 'Getting Started', desc: 'Account setup, booking, and navigating your dashboard.', articles: 3 },
        { icon: Video, title: 'Live Classrooms', desc: 'Camera/mic setup, joining sessions, and connection issues.', articles: 3 },
        { icon: Shield, title: 'Security & Safety', desc: 'Data protection, 2FA, and reporting unsafe content.', articles: 3 },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--dashboard-bg-alt)', padding: '40px 24px' }}>
            <AnimatePresence>
                {openCategory && <ArticleModal category={openCategory} onClose={() => setOpenCategory(null)} />}
            </AnimatePresence>

            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                {/* Hero */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 56 }}>
                    <h1 style={{ fontSize: 40, fontWeight: 900, color: 'var(--text)', marginBottom: 16, letterSpacing: '-1.5px' }}>How can we help you today?</h1>
                    <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 32 }}>Search our help centre or start a live chat for immediate assistance.</p>

                    <div style={{ position: 'relative', maxWidth: 560, margin: '0 auto' }}>
                        <Search size={20} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input type="text" placeholder="Search for articles, guides..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '18px 24px 18px 56px', borderRadius: 20, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 15, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, marginBottom: 56 }}>
                    {/* Categories */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {categories.map((cat, i) => (
                            <motion.button key={cat.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}
                                onClick={() => setOpenCategory(cat.title)} whileHover={{ x: 4 }}
                                style={{ padding: 24, borderRadius: 20, background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 18, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', width: '100%' }}>
                                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                                    <cat.icon size={24} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{cat.title}</div>
                                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{cat.desc}</div>
                                    <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 6, fontWeight: 600 }}>{cat.articles} guides ΓåÆ</div>
                                </div>
                                <ChevronRight size={20} color="var(--text-muted)" />
                            </motion.button>
                        ))}
                    </div>

                    {/* Live Chat Card */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                        style={{ padding: 32, borderRadius: 24, background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 20, height: 'fit-content' }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--accent)10', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MessageCircle size={28} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Live Chat Support</h3>
                            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>Chat directly with our human support team for help with bookings, technical issues, or platform questions.</p>
                        </div>
                        <button
                            onClick={() => router.push('/messages?support=true')}
                            className="btn-primary"
                            style={{ padding: '14px', borderRadius: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                            Start Chat Now <ChevronRight size={18} />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#22c55e', fontWeight: 600 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                            Average response time: &lt; 5 mins
                        </div>
                    </motion.div>
                </div>

                {/* FAQ Section */}
                <div style={{ background: 'var(--bg)', borderRadius: 28, padding: 40, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                        <HelpCircle size={28} color="var(--accent)" />
                        <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text)' }}>Frequently Asked Questions</h2>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginLeft: 'auto' }}>{filteredFaqs.length} results</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {filteredFaqs.map((faq, i) => (
                            <div key={i}>
                                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    style={{ width: '100%', textAlign: 'left', padding: '16px 20px', borderRadius: 12, border: 'none', background: openFaq === i ? 'var(--bg-subtle)' : 'transparent', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                                    <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{faq.q}</span>
                                    <ChevronRight size={18} color="var(--text-muted)" style={{ transform: openFaq === i ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
                                </button>
                                <AnimatePresence>
                                    {openFaq === i && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                            <p style={{ padding: '4px 20px 20px', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
