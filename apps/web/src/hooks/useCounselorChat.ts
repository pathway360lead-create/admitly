import { useState } from 'react';
import axios from 'axios';
import { CounselorPersona } from '@/components/organisms/VirtualCounselor/PersonaSelector';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const useCounselorChat = (persona: CounselorPersona) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initial welcome message (local only, doesn't hit API)
    const initializeChat = () => {
        const welcomeText = getWelcomeMessage(persona);
        setMessages([
            {
                id: 'welcome',
                role: 'assistant',
                content: welcomeText,
                timestamp: new Date(),
            },
        ]);
    };

    const sendMessage = async (content: string) => {
        // 1. Add user message immediately
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);
        setError(null);

        try {
            // 2. Call API
            const response = await axios.post(`${API_URL}/guidance/chat`, {
                message: content,
                persona: persona,
                history: messages.map(m => ({ role: m.role, content: m.content })) // Send history for context
            });

            // 3. Add assistant response
            const assistantMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant', // Type assertion if needed, but API returns 'assistant'
                content: response.data.content,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMsg]);

        } catch (err) {
            console.error('Chat Error:', err);
            setError('Failed to get a response. Please try again.');
            // Optional: Add system message for error
        } finally {
            setIsLoading(false);
        }
    };

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        initializeChat
    };
};

// Start fresh with welcome message based on persona
function getWelcomeMessage(id: CounselorPersona) {
    switch (id) {
        case 'bayo': return "Welcome. I've reviewed your profile. My goal is to maximize your admission probability based on the data. What's your top priority right now?";
        case 'chioma': return "Hello! 🌟 I'm so glad you're here. Remember, there's a path for everyone. How are you feeling about your applications today?";
        case 'kemi': return "Alright, let's get to work. Time is the one resource we can't get back. What is the status of your application list?";
    }
}
