import { FC, useState, useEffect } from 'react';
import { Button } from '@admitly/ui';
import { Send, AlertCircle, Loader2 } from 'lucide-react';
import { CounselorPersona } from './PersonaSelector';
import { useCounselorChat } from '@/hooks/useCounselorChat';

interface ChatInterfaceProps {
    persona: CounselorPersona;
    onReset: () => void;
}

export const ChatInterface: FC<ChatInterfaceProps> = ({ persona, onReset }) => {
    const [input, setInput] = useState('');
    const { messages, isLoading, error, sendMessage, initializeChat } = useCounselorChat(persona);

    // Initialize chat when component mounts or persona changes
    useEffect(() => {
        initializeChat();
    }, [persona]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const messageToSend = input;
        setInput(''); // Clear immediately
        await sendMessage(messageToSend);
    };

    return (
        <div className="h-[600px] flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl border border-primary/20">
                        {getPersonaIcon(persona)}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{getPersonaName(persona)}</h3>
                        <p className="text-xs text-green-600 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Online
                        </p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onReset} className="text-gray-400 hover:text-gray-600">
                    Switch Counselor
                </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground rounded-br-none'
                                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                }`}
                        >
                            <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                            <span className="text-[10px] opacity-70 mt-1 block">
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-2xl rounded-bl-none p-4 flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                            <span className="text-xs text-gray-500">Thinking...</span>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="flex justify-center my-2">
                        <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 px-3 py-1 rounded-full">
                            <AlertCircle size={12} />
                            {error}
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        disabled={isLoading}
                        placeholder={`Ask ${getPersonaName(persona).split(' ')[1]} anything...`}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
                    >
                        <Send size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

// Utils
function getPersonaName(id: CounselorPersona) {
    switch (id) {
        case 'bayo': return 'Coach Bayo';
        case 'chioma': return 'Coach Chioma';
        case 'kemi': return 'Coach Kemi';
    }
}

function getPersonaIcon(id: CounselorPersona) {
    switch (id) {
        case 'bayo': return '📊';
        case 'chioma': return '❤️';
        case 'kemi': return '⚡';
    }
}
