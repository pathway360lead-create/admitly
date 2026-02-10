import { FC } from 'react';
import { Card, CardContent, Button } from '@admitly/ui';
import { Check } from 'lucide-react';

export type CounselorPersona = 'bayo' | 'chioma' | 'kemi';

interface PersonaSelectorProps {
    onSelect: (persona: CounselorPersona) => void;
    selected?: CounselorPersona;
}

const personas = [
    {
        id: 'bayo' as const,
        name: 'Coach Bayo',
        role: 'The Strategist',
        icon: '📊',
        description: 'Data-driven, direct, and focused on probabilities. "Let\'s look at the numbers."',
        color: 'bg-blue-50 border-blue-200 text-blue-900',
        buttonColor: 'bg-blue-600 hover:bg-blue-700',
    },
    {
        id: 'chioma' as const,
        name: 'Coach Chioma',
        role: 'The Motivator',
        icon: '❤️',
        description: 'Empathetic, encouraging, and focused on potential. "We will find a way."',
        color: 'bg-rose-50 border-rose-200 text-rose-900',
        buttonColor: 'bg-rose-600 hover:bg-rose-700',
    },
    {
        id: 'kemi' as const,
        name: 'Coach Kemi',
        role: 'The Drill Sergeant',
        icon: '⚡',
        description: 'Action-oriented, disciplined, and deadline-focused. "Did you submit the form?"',
        color: 'bg-amber-50 border-amber-200 text-amber-900',
        buttonColor: 'bg-amber-600 hover:bg-amber-700',
    },
];

export const PersonaSelector: FC<PersonaSelectorProps> = ({ onSelect, selected }) => {
    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Counselor</h2>
                <p className="text-gray-500">Select the coaching style that works best for you.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {personas.map((persona) => (
                    <Card
                        key={persona.id}
                        className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer border-2 ${selected === persona.id ? 'border-primary ring-2 ring-primary/20 shadow-lg scale-105' : 'border-transparent hover:border-gray-200'
                            }`}
                        onClick={() => onSelect(persona.id)}
                    >
                        {selected === persona.id && (
                            <div className="absolute top-3 right-3 bg-primary text-white rounded-full p-1 shadow-sm">
                                <Check size={16} />
                            </div>
                        )}

                        <CardContent className="p-6 text-center space-y-4">
                            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl shadow-sm ${persona.color}`}>
                                {persona.icon}
                            </div>

                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{persona.name}</h3>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{persona.role}</p>
                            </div>

                            <p className="text-sm text-gray-600 min-h-[40px]">
                                {persona.description}
                            </p>

                            <Button
                                className={`w-full text-white ${persona.buttonColor} ${selected === persona.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                variant="default"
                            >
                                Select {persona.name.split(' ')[1]}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};
