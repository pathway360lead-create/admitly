import { FC, useState, useEffect } from 'react';
import { PersonaSelector, CounselorPersona } from './PersonaSelector';
import { ChatInterface } from './ChatInterface';
import { Sparkles } from 'lucide-react';

export const VirtualCounselorContainer: FC = () => {
    const [selectedPersona, setSelectedPersona] = useState<CounselorPersona | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load saved persona from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('admitly_counselor_persona');
        if (saved && ['bayo', 'chioma', 'kemi'].includes(saved)) {
            setSelectedPersona(saved as CounselorPersona);
        }
        setIsLoading(false);
    }, []);

    const handleSelectPersona = (persona: CounselorPersona) => {
        setSelectedPersona(persona);
        localStorage.setItem('admitly_counselor_persona', persona);
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to switch counselors? Chat history will be cleared.')) {
            setSelectedPersona(null);
            localStorage.removeItem('admitly_counselor_persona');
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading your counselor...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
                    <Sparkles size={20} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-heading">Virtual Counselor</h1>
                    <p className="text-gray-500 text-sm">AI-powered guidance grounded in real admissions data.</p>
                </div>
            </div>

            {/* Content */}
            <div className="fade-in">
                {!selectedPersona ? (
                    <PersonaSelector onSelect={handleSelectPersona} />
                ) : (
                    <ChatInterface persona={selectedPersona} onReset={handleReset} />
                )}
            </div>
        </div>
    );
};
