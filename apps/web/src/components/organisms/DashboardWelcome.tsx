import { FC } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@admitly/ui';

interface DashboardWelcomeProps {
    userName: string;
    className?: string;
}

export const DashboardWelcome: FC<DashboardWelcomeProps> = ({ userName, className }) => {
    return (
        <div className={cn("relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-blue-600 to-indigo-600 p-8 md:p-10 text-white shadow-xl", className)}>
            {/* Background Decor */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="space-y-2 text-center md:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 justify-center md:justify-start"
                    >
                        <h1 className="text-3xl md:text-4xl font-bold font-heading">
                            Hello, {userName}! <span className="inline-block animate-wave origin-bottom-right">👋</span>
                        </h1>
                    </motion.div>
                    <p className="text-blue-100 text-lg max-w-lg">
                        Ready to unlock your future? You're <span className="font-bold text-white">75%</span> closer to your dream admission! 🚀
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button variant="secondary" className="bg-white text-primary hover:bg-white/90 shadow-lg border-0 h-12 px-6 rounded-xl font-semibold">
                        Resume Application <Trophy className="ml-2 h-4 w-4 text-yellow-500" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
