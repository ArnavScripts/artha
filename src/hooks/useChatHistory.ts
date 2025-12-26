import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    metadata?: any;
    created_at?: string;
}

export function useChatHistory() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // Load latest active session on mount
    useEffect(() => {
        const loadLatestSession = async () => {
            setIsLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Fetch most recent active session
                const { data: session } = await supabase
                    .from('chat_sessions')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('is_active', true)
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .single();

                if (session) {
                    setSessionId(session.id);
                    // Fetch messages for this session
                    const { data: history } = await supabase
                        .from('chat_messages')
                        .select('*')
                        .eq('session_id', session.id)
                        .order('created_at', { ascending: true });

                    if (history) {
                        setMessages(history);
                    }
                }
            } catch (error) {
                console.error('Failed to load chat history:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadLatestSession();
    }, []);

    const sendMessage = useCallback(async (content: string, userId: string) => {
        setIsSending(true);

        // Optimistic Update
        const tempId = crypto.randomUUID();
        const optimisticMessage: Message = {
            id: tempId,
            role: 'user',
            content,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMessage]);

        try {
            const { data, error } = await supabase.functions.invoke('ask-sage', {
                body: {
                    userId,
                    message: content,
                    sessionId // Send current session ID if exists
                }
            });

            if (error) throw error;

            const responseData = JSON.parse(data.response || JSON.stringify(data)); // Handle both string and object response

            if (responseData.error) {
                throw new Error(responseData.error);
            }

            const newSessionId = data.sessionId || responseData.sessionId;

            if (newSessionId && newSessionId !== sessionId) {
                setSessionId(newSessionId);
            }

            // Add AI response
            const aiMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: responseData.message,
                metadata: responseData.action ? { action: responseData.action } : {},
                created_at: new Date().toISOString()
            };

            setMessages(prev => [...prev, aiMessage]);
            return aiMessage; // Return for immediate action handling if needed

        } catch (error: any) {
            console.error('Send message error:', error);
            toast.error(`Failed to send message: ${error.message || 'Unknown error'}`);
            // Rollback optimistic update? Or just show error state.
            // For now, we'll leave it but maybe mark as error in a real app.
        } finally {
            setIsSending(false);
        }
    }, [sessionId]);

    const clearHistory = useCallback(() => {
        setMessages([]);
        setSessionId(null);
    }, []);

    return {
        messages,
        isLoading,
        isSending,
        sendMessage,
        clearHistory,
        sessionId
    };
}
