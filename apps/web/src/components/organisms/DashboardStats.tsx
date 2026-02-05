import { FC } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Coins, Calendar, PlayCircle, ChevronRight } from 'lucide-react';
import { Button } from '@admitly/ui';

export const DashboardStats: FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Application Status Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Rocket size={100} className="text-primary rotate-12" />
                </div>
                <div className="relative z-10">
                    <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                        <span className="p-1.5 bg-blue-100 text-primary rounded-lg"><Rocket size={18} /></span>
                        Application Status
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">University of Lagos (UNILAG)</p>

                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm font-medium">
                            <span>Progress</span>
                            <span className="text-primary">75%</span>
                        </div>
                        <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-400 to-primary w-3/4 animate-pulse relative">
                                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground pt-1">
                            <span>Profile</span>
                            <span>Documents</span>
                            <span>Review</span>
                            <span className="font-bold text-gray-400">Submit</span>
                        </div>
                    </div>

                    <Button className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 shadow-none border-blue-200">
                        Continue Application <ChevronRight size={16} className="ml-1" />
                    </Button>
                </div>
            </motion.div>

            {/* Scholarship Match Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-2xl shadow-sm border border-orange-100/50 hover:shadow-md transition-shadow"
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                            <span className="p-1.5 bg-orange-100 text-orange-600 rounded-lg"><Coins size={18} /></span>
                            Scholarship Match
                        </h3>
                        <p className="text-sm text-muted-foreground">We found 12 new matches!</p>
                    </div>
                    <div className="relative h-16 w-16 flex items-center justify-center">
                        <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 36 36">
                            <path className="text-orange-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                            <path className="text-orange-500" strokeDasharray="90, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                        </svg>
                        <span className="absolute text-xs font-bold text-orange-700">90%</span>
                    </div>
                </div>
                <ul className="space-y-2 mb-4">
                    <li className="text-sm flex items-center gap-2 text-gray-700">
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                        Future Tech Leaders Award
                    </li>
                    <li className="text-sm flex items-center gap-2 text-gray-700">
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                        Women in STEM Grant
                    </li>
                </ul>
                <Button className="w-full bg-orange-500 text-white hover:bg-orange-600">
                    View Matches
                </Button>
            </motion.div>

            {/* Upcoming Exam */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="p-1.5 bg-green-100 text-green-600 rounded-lg"><Calendar size={18} /></span>
                    Upcoming JAMB Exams
                </h3>
                <div className="flex gap-4 items-center bg-green-50 p-3 rounded-xl mb-4 border border-green-100">
                    <div className="bg-white p-2 rounded-lg text-center shadow-sm min-w-[60px]">
                        <span className="block text-xs font-bold text-red-500 uppercase">OCT</span>
                        <span className="block text-xl font-bold text-gray-800">26</span>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">Main JAMB Exam</p>
                        <p className="text-xs text-green-700 font-medium">24 Days Left</p>
                    </div>
                </div>
                <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-xs font-medium">
                        <span>Preparation Status</span>
                        <span className="text-green-600">Good</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full">
                        <div className="h-full bg-green-500 w-3/5 rounded-full" />
                    </div>
                    <p className="text-xs text-muted-foreground text-right">3/5 Practice Tests Done</p>
                </div>
                <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800">
                    Start Practice Test
                </Button>
            </motion.div>

            {/* Video Tour */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-900 rounded-2xl shadow-sm overflow-hidden relative group cursor-pointer h-full min-h-[200px]"
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-60 group-hover:opacity-40 transition-opacity" />
                <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
                    <div className="self-end bg-white/20 backdrop-blur-md px-2 py-1 rounded-md text-xs font-medium text-white">
                        360° View
                    </div>
                    <div>
                        <div className="mb-3 h-12 w-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
                            <PlayCircle className="text-white fill-white/20 h-8 w-8" />
                        </div>
                        <h3 className="font-bold text-white text-lg">University Video Tour</h3>
                        <p className="text-gray-300 text-sm">Discover University of Lagos</p>
                    </div>
                </div>
            </motion.div>

        </div>
    );
};
