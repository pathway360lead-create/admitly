import { FC } from 'react';
import { motion } from 'framer-motion';
import { SearchBar } from '../molecules/SearchBar';
import { Button, Badge } from '@admitly/ui';
import { Play, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeroSectionContent {
    title: string;
    subtitle: string;
    badge: string;
    cta_primary: string;
    cta_secondary: string;
}

interface HeroSectionProps {
    onSearch: (query: string) => void;
    initialSearchValue?: string;
    content?: HeroSectionContent;
}

export const HeroSection: FC<HeroSectionProps> = ({ onSearch, initialSearchValue, content }) => {
    const navigate = useNavigate();

    // Default content if CMS data is missing
    const defaultContent: HeroSectionContent = {
        title: 'Find Your <br /> <span class="text-primary">Dream University</span>',
        subtitle: "Nigeria's most trusted platform for educational decision-making. Search, compare, and apply to over 200+ institutions.",
        badge: '🚀 Prepare for your future today',
        cta_primary: 'Browse Schools',
        cta_secondary: 'Create Free Account'
    };

    const { title, subtitle, badge, cta_primary, cta_secondary } = content || defaultContent;

    return (
        <section className="relative pt-20 pb-32 overflow-hidden bg-background">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/20 rounded-full blur-3xl opacity-50" />
            </div>

            <div className="container relative mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-6 space-y-8 text-center lg:text-left"
                    >
                        <Badge variant="secondary" className="px-4 py-2 text-sm bg-primary/10 text-primary border-primary/20">
                            {badge}
                        </Badge>

                        <h1
                            className="text-5xl md:text-6xl lg:text-7xl font-bold font-heading tracking-tight leading-[1.1]"
                            dangerouslySetInnerHTML={{ __html: title }}
                        />

                        <p className="text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 font-sans leading-relaxed">
                            {subtitle}
                        </p>

                        <div className="max-w-md mx-auto lg:mx-0">
                            <SearchBar
                                placeholder="Search institutions, programs..."
                                onSearch={onSearch}
                                initialValue={initialSearchValue}
                                className="w-full shadow-lg border-primary/20"
                            />
                            <div className="mt-4 flex gap-4 justify-center lg:justify-start">
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-semibold text-primary">Popular:</span> Computer Science, Nursing, UNILAG
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Content - Bento Grid */}
                    <div className="lg:col-span-6 relative">
                        <div className="grid grid-cols-2 gap-4 h-[500px]">
                            {/* Main Video Card */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden group cursor-pointer border shadow-xl bg-card"
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 pointer-events-none" />
                                {/* YouTube Video Embed */}
                                <div className="w-full h-full relative">
                                    <iframe
                                        className="absolute inset-0 w-full h-full"
                                        src="https://www.youtube.com/embed/Kat1z9PJGoI?controls=1&modestbranding=1&rel=0"
                                        title="Campus Tour Video"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>

                                <div className="absolute bottom-6 left-6 z-20 text-white pointer-events-none">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30">
                                            <Play className="h-6 w-6 fill-current" />
                                        </span>
                                        <div>
                                            <p className="font-semibold text-lg font-heading">Campus Tour</p>
                                            <p className="text-sm opacity-90">Watch university life</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
