import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { getImageUrl } from '../config';

// Custom hook for scroll animation
const useScrollAnimation = () => {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []);

    return [ref, isVisible];
};

// Animated wrapper component
const FadeInUp = ({ children, delay = 0, className = '' }) => {
    const [ref, isVisible] = useScrollAnimation();

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`
            }}
        >
            {children}
        </div>
    );
};

const Landing = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved !== null ? JSON.parse(saved) : true; // Default to dark mode
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [darkMode]);

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events/public');
            setEvents(response.data.slice(0, 6));
        } catch (err) {
            console.log('No events available');
        } finally {
            setLoading(false);
        }
    };

    // Theme colors
    const theme = {
        bg: darkMode ? '#0f0f0f' : '#faf9f7',
        bgSecondary: darkMode ? '#1a1a1a' : '#ffffff',
        bgTertiary: darkMode ? '#252525' : '#f5f5f5',
        text: darkMode ? '#ffffff' : '#111827',
        textSecondary: darkMode ? '#9ca3af' : '#6b7280',
        textMuted: darkMode ? '#6b7280' : '#9ca3af',
        border: darkMode ? '#333333' : '#e5e7eb',
        cardBg: darkMode ? '#1a1a1a' : '#ffffff',
        navBg: darkMode ? 'rgba(15,15,15,0.8)' : 'rgba(250,249,247,0.8)',
        btnPrimary: darkMode ? '#ffffff' : '#111827',
        btnPrimaryText: darkMode ? '#111827' : '#ffffff',
        ctaBg: darkMode ? '#ffffff' : '#111827',
        ctaText: darkMode ? '#111827' : '#ffffff',
    };

    return (
        <div
            className="min-h-screen transition-colors duration-300"
            style={{ backgroundColor: theme.bg, fontFamily: "'Inter', sans-serif" }}
        >
            {/* Navigation */}
            <nav
                className="fixed top-0 w-full z-50 backdrop-blur-sm border-b transition-colors duration-300"
                style={{ backgroundColor: theme.navBg, borderColor: theme.border }}
            >
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="text-xl font-semibold" style={{ color: theme.text }}>
                        Hitayu
                    </Link>
                    <div className="flex items-center gap-4">
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-2 rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                            style={{ color: theme.textSecondary }}
                            title={darkMode ? 'Light mode' : 'Dark mode'}
                        >
                            {darkMode ? (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                </svg>
                            )}
                        </button>
                        <Link
                            to="/login"
                            className="text-sm transition-colors"
                            style={{ color: theme.textSecondary }}
                        >
                            Login
                        </Link>
                        <Link
                            to="/login"
                            className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:scale-105"
                            style={{ backgroundColor: theme.btnPrimary, color: theme.btnPrimaryText }}
                        >
                            Sign up
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-24 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <FadeInUp>
                        <h1 className="text-5xl md:text-6xl font-semibold mb-6 leading-tight tracking-tight" style={{ color: theme.text }}>
                            New simple<br />
                            <span style={{ color: theme.textMuted }}>community</span> events
                        </h1>
                    </FadeInUp>

                    <FadeInUp delay={0.1}>
                        <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: theme.textSecondary }}>
                            With Hitayu your events never fail. Built for simplicity and powered by community.
                        </p>
                    </FadeInUp>

                    <FadeInUp delay={0.2}>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                            <Link
                                to="/login"
                                className="px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 hover:shadow-lg"
                                style={{ backgroundColor: theme.btnPrimary, color: theme.btnPrimaryText }}
                            >
                                Get Started
                            </Link>
                            <span className="text-sm" style={{ color: theme.textMuted }}>Free forever</span>
                        </div>
                    </FadeInUp>

                    <FadeInUp delay={0.3}>
                        <div className="flex justify-center gap-4 mt-4 text-xs" style={{ color: theme.textMuted }}>
                            <span>✓ Volunteer Management</span>
                            <span>✓ Real-time Chat</span>
                        </div>
                    </FadeInUp>
                </div>
            </section>

            {/* Feature Cards */}
            <section className="py-16 px-6">
                <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
                    {[
                        { icon: '🎯', title: 'Intuitive', desc: 'No more chaos. With Hitayu, your volunteers are exactly where you need them, all the time.' },
                        { icon: '💬', title: 'Smart', desc: 'No more tool-hopping. Hitayu brings coordination and communication into one workspace.' },
                        { icon: '🛡️', title: 'Reliable', desc: 'Your events, your rules. Hitayu gives you complete control over tasks and volunteer assignments.' }
                    ].map((card, i) => (
                        <FadeInUp key={card.title} delay={i * 0.1}>
                            <div
                                className="rounded-2xl p-8 border shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 h-full"
                                style={{ backgroundColor: theme.cardBg, borderColor: theme.border }}
                            >
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-5"
                                    style={{ backgroundColor: theme.bgTertiary }}
                                >
                                    <span className="text-lg">{card.icon}</span>
                                </div>
                                <h3 className="text-lg font-semibold mb-2" style={{ color: theme.text }}>{card.title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: theme.textSecondary }}>
                                    {card.desc}
                                </p>
                                <Link to="/login" className="inline-block mt-4 text-sm font-medium hover:underline" style={{ color: theme.text }}>
                                    Get Started →
                                </Link>
                            </div>
                        </FadeInUp>
                    ))}
                </div>
            </section>

            {/* Upcoming Events */}
            <section
                className="py-16 px-6 border-y transition-colors duration-300"
                style={{ backgroundColor: theme.bgSecondary, borderColor: theme.border }}
            >
                <div className="max-w-5xl mx-auto">
                    <FadeInUp>
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-semibold mb-3" style={{ color: theme.text }}>
                                Upcoming Events
                            </h2>
                            <p style={{ color: theme.textSecondary }}>
                                Join these community events and make a difference
                            </p>
                        </div>
                    </FadeInUp>

                    {loading ? (
                        <div className="text-center" style={{ color: theme.textMuted }}>Loading events...</div>
                    ) : events.length === 0 ? (
                        <FadeInUp>
                            <div className="text-center py-12">
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                                    style={{ backgroundColor: theme.bgTertiary }}
                                >
                                    <span className="text-2xl">📅</span>
                                </div>
                                <p className="mb-4" style={{ color: theme.textSecondary }}>No events yet. Be the first to create one!</p>
                                <Link
                                    to="/login"
                                    className="inline-flex px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:scale-105"
                                    style={{ backgroundColor: theme.btnPrimary, color: theme.btnPrimaryText }}
                                >
                                    Create Event
                                </Link>
                            </div>
                        </FadeInUp>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {events.map((event, index) => (
                                <FadeInUp key={event._id} delay={index * 0.1}>
                                    <div
                                        className="rounded-xl overflow-hidden border hover:shadow-lg transition-all hover:-translate-y-1 h-full"
                                        style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                                    >
                                        {event.photos && event.photos.length > 0 ? (
                                            <img
                                                src={getImageUrl(event.photos[0])}
                                                alt={event.title}
                                                className="w-full h-40 object-cover"
                                            />
                                        ) : (
                                            <div
                                                className="w-full h-40 flex items-center justify-center"
                                                style={{ backgroundColor: theme.bgTertiary }}
                                            >
                                                <span className="text-4xl opacity-30">📅</span>
                                            </div>
                                        )}
                                        <div className="p-5">
                                            <h3 className="font-semibold mb-1" style={{ color: theme.text }}>
                                                {event.title}
                                            </h3>
                                            <p className="text-sm mb-3 line-clamp-2" style={{ color: theme.textSecondary }}>
                                                {event.description}
                                            </p>
                                            <div className="flex items-center justify-between text-xs" style={{ color: theme.textMuted }}>
                                                <span>📍 {event.location}</span>
                                                <span>{new Date(event.date).toLocaleDateString()}</span>
                                            </div>
                                            <div
                                                className="mt-3 pt-3 border-t flex items-center justify-between"
                                                style={{ borderColor: theme.border }}
                                            >
                                                <span className="text-xs" style={{ color: theme.textMuted }}>
                                                    👥 {event.volunteers?.length || 0}/{event.maxVolunteers}
                                                </span>
                                                <Link
                                                    to="/login"
                                                    className="text-sm font-medium hover:underline"
                                                    style={{ color: theme.text }}
                                                >
                                                    Join →
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </FadeInUp>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* About Section */}
            <section className="py-20 px-6">
                <FadeInUp>
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-semibold mb-4" style={{ color: theme.text }}>
                            हिताय — For the benefit of all
                        </h2>
                        <p className="leading-relaxed mb-8" style={{ color: theme.textSecondary }}>
                            Hitayu is a Sanskrit word meaning "for the welfare of oneself and society."
                            We built this platform to connect passionate volunteers with meaningful community events,
                            making coordination effortless and impact measurable.
                        </p>
                        <Link
                            to="/login"
                            className="inline-flex px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 hover:shadow-lg"
                            style={{ backgroundColor: theme.btnPrimary, color: theme.btnPrimaryText }}
                        >
                            Join the Community
                        </Link>
                    </div>
                </FadeInUp>
            </section>

            {/* CTA */}
            <section className="py-16 px-6" style={{ backgroundColor: theme.ctaBg }}>
                <FadeInUp>
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-2xl md:text-3xl font-semibold mb-4" style={{ color: theme.ctaText }}>
                            The smarter and simpler way to coordinate.
                        </h2>
                        <Link
                            to="/login"
                            className="inline-flex px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
                            style={{ backgroundColor: theme.bg, color: theme.text }}
                        >
                            Create account
                        </Link>
                    </div>
                </FadeInUp>
            </section>

            {/* Footer */}
            <footer
                className="py-8 px-6 border-t transition-colors duration-300"
                style={{ backgroundColor: theme.bg, borderColor: theme.border }}
            >
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="font-semibold" style={{ color: theme.text }}>Hitayu</div>
                    <div className="flex gap-6 text-sm" style={{ color: theme.textSecondary }}>
                        <Link to="/login" className="hover:underline">Login</Link>
                        <Link to="/login" className="hover:underline">Register</Link>
                    </div>
                    <p className="text-sm" style={{ color: theme.textMuted }}>
                        © 2024 Hitayu
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
