import { FC } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Users, GraduationCap, Building2, BookOpen } from 'lucide-react';

interface StatItem {
    label: string;
    value: number;
    suffix?: string;
    prefix?: string;
    icon: any; // Lucide icon or string name if mapped
    color: string;
}

interface StatsSectionProps {
    stats?: StatItem[];
}

const defaultStats = [
    { label: 'Verified Institutions', value: 200, suffix: '+', icon: Building2, color: 'text-blue-600' },
    { label: 'Active Students', value: 15000, suffix: '+', icon: Users, color: 'text-green-600' },
    { label: 'Available Programs', value: 500, suffix: '+', icon: BookOpen, color: 'text-purple-600' },
    { label: 'Scholarships', value: 50, suffix: 'M', prefix: '₦', icon: GraduationCap, color: 'text-orange-600' },
];

const Counter = ({ from, to }: { from: number; to: number }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const [count, setCount] = useState(from);

    useEffect(() => {
        if (isInView) {
            let start = from;
            const end = to;
            const duration = 2000;
            const incrementTime = 16; // ~60fps
            const steps = duration / incrementTime;
            const increment = (end - start) / steps;

            const timer = setInterval(() => {
                start += increment;
                if (start >= end) {
                    setCount(end);
                    clearInterval(timer);
                } else {
                    setCount(Math.floor(start));
                }
            }, incrementTime);

            return () => clearInterval(timer);
        }
    }, [isInView, from, to]);

    return <span ref={ref}>{count.toLocaleString()}</span>;
};

export const StatsSection: FC<StatsSectionProps> = ({ stats = defaultStats }) => {
    // Helper to resolve icon if it's a string from CMS
    // Note: In real app, we'd need a map of string -> IconComponent
    // For now, if stats come from CMS, they might have string icons. 
    // We should handle that or expect the parent to map it.
    // Let's assume parent maps it or we fallback.

    // Quick icon map for CMS strings
    const iconMap: Record<string, any> = {
        'Building2': Building2,
        'Users': Users,
        'BookOpen': BookOpen,
        'GraduationCap': GraduationCap,
        'Search': Users, // Fallback
        'BarChart3': Users, // Fallback
        'Bell': Users // Fallback
    };

    const displayStats = stats.map(s => {
        if (typeof s.icon === 'string') {
            return { ...s, icon: iconMap[s.icon] || Building2 };
        }
        return s;
    });

    return (
        <section className="py-20 bg-background relative overflow-hidden">
            {/* Decorative dashed lines */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}
            ></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/40">
                    {displayStats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`text-center px-4 ${index % 2 !== 0 ? 'border-none md:border-solid md:border-l' : ''}`}
                            >
                                <div className={`mx-auto w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-4 shadow-sm ${stat.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="text-3xl md:text-4xl font-bold font-heading mb-2 text-foreground">
                                    {stat.prefix}<Counter from={0} to={stat.value} />{stat.suffix}
                                </div>
                                <p className="text-muted-foreground font-medium text-sm">{stat.label}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
