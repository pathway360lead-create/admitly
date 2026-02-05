import { FC, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Badge } from '@admitly/ui';
import { ArrowRight, Calendar, Bookmark, PlayCircle } from 'lucide-react';

interface NewsItem {
    id: string;
    type: 'news' | 'scholarship' | 'video';
    title: string;
    category: string;
    date?: string;
    image: string;
}

const mockNews: NewsItem[] = [
    {
        id: '1',
        type: 'news',
        title: 'JAMB Announces New Cut-off Marks for 2025/2026 Session',
        category: 'Admission News',
        date: '2 hrs ago',
        image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1000&auto=format&fit=crop'
    },
    {
        id: '2',
        type: 'scholarship',
        title: 'MTN Foundation Undergraduate Scholarship 2025',
        category: 'Scholarship',
        date: 'Deadline: Oct 30',
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop'
    },
    {
        id: '3',
        type: 'video',
        title: 'How to Calculate Your Aggregate Score (Step-by-Step)',
        category: 'Guide',
        date: '10 min watch',
        image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1000&auto=format&fit=crop'
    },
    {
        id: '4',
        type: 'news',
        title: 'UNILAG Release Post-UTME Results',
        category: 'Admission News',
        date: '1 day ago',
        image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1000&auto=format&fit=crop'
    }
];

export const NewsFeed: FC = () => {
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <section className="py-16 bg-muted/30 border-y border-border/40">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Badge variant="outline" className="mb-2 border-primary/20 text-primary bg-primary/5">
                            Updates
                        </Badge>
                        <h2 className="text-3xl font-bold font-heading">The EdTech Pulse ⚡</h2>
                        <p className="text-muted-foreground mt-1">Latest exam news, scholarships, and guides.</p>
                    </div>
                    <button className="hidden md:flex items-center text-primary font-medium hover:underline text-sm gap-1">
                        View All Updates <ArrowRight size={16} />
                    </button>
                </div>

                {/* Scroll Container */}
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
                >
                    {mockNews.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="snap-start shrink-0 w-[85vw] md:w-[350px] bg-background border border-border/60 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                        >
                            <div className="h-48 overflow-hidden relative">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm text-gray-700 hover:text-primary transition-colors">
                                    <Bookmark size={16} />
                                </div>
                                {item.type === 'video' && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                                        <PlayCircle className="text-white w-12 h-12 drop-shadow-lg" />
                                    </div>
                                )}
                            </div>
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-3 text-xs">
                                    <span className={`px-2 py-1 rounded-md font-medium ${item.type === 'scholarship' ? 'bg-green-100 text-green-700' :
                                            item.type === 'video' ? 'bg-purple-100 text-purple-700' :
                                                'bg-blue-100 text-blue-700'
                                        }`}>
                                        {item.category}
                                    </span>
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <Calendar size={12} /> {item.date}
                                    </span>
                                </div>
                                <h3 className="font-heading font-semibold text-lg leading-tight mb-2 group-hover:text-primary transition-colors">
                                    {item.title}
                                </h3>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
