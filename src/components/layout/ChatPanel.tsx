import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Activity, ChevronRight, AlertCircle, CheckCircle2, Zap, TrendingUp, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { useSageExecutor, SageResponse, SageAction } from '@/hooks/useSageExecutor';
import { useLocation } from 'react-router-dom';
import { useChatHistory } from '@/hooks/useChatHistory';

export function ChatPanel() {
  const { isChatPanelOpen, setChatPanelOpen, initialChatMessage, setInitialChatMessage } = useWorkspace();
  const [chatInput, setChatInput] = useState('');
  const { messages, isLoading, isSending, sendMessage, sessionId } = useChatHistory();
  const { executeAction } = useSageExecutor();
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isSending]);

  // Handle Initial Message from Context
  useEffect(() => {
    if (initialChatMessage) {
      handleSendMessage(initialChatMessage);
      setInitialChatMessage(null);
    }
  }, [initialChatMessage]);



  async function handleSendMessage(messageOverride?: string) {
    const messageToSend = messageOverride || chatInput;
    if (!messageToSend.trim()) return;

    if (!messageOverride) {
      setChatInput('');
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await sendMessage(messageToSend, user.id);

    } catch (error: any) {
      console.error("SAGE Error:", error);
      toast.error("Failed to send message", { description: error.message });
    }
  };

  const quickActions = [
    { label: "Forecast Liability", icon: TrendingUp, prompt: "Forecast my carbon liability for the next quarter." },
    { label: "View Emissions", icon: Activity, prompt: "Take me to the emissions dashboard." },
    { label: "Risk Report", icon: ShieldAlert, prompt: "Generate a risk report based on my compliance status." },
  ];

  return (
    <AnimatePresence>
      {isChatPanelOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed top-0 right-0 h-full w-full sm:w-[450px] z-[9998] flex flex-col border-l border-slate-700/50 bg-[#0B1221]/95 backdrop-blur-md font-sans shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-[#0B1221]/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 tracking-wide">ARTHA SAGE</h3>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">System Online</p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setChatPanelOpen(false)}
              className="rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {messages.length === 0 && !isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-6">
                <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center border border-slate-700/50">
                  <Zap className="w-8 h-8 text-slate-400" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-slate-300">Ready to assist.</p>
                  <p className="text-xs text-slate-500">Select a quick action or type a command.</p>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 gap-2 w-full max-w-[280px]">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(action.prompt)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/80 border border-slate-700/50 hover:border-indigo-500/30 transition-all group text-left"
                    >
                      <div className="p-2 rounded-lg bg-slate-900 group-hover:bg-indigo-500/20 transition-colors">
                        <action.icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />
                      </div>
                      <span className="text-xs font-medium text-slate-300 group-hover:text-white">{action.label}</span>
                      <ChevronRight className="w-3 h-3 ml-auto text-slate-600 group-hover:text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => {
              const action = message.metadata?.action as SageAction | undefined;

              return (
                <div key={message.id || index} className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Message Bubble */}
                  <div className={`max-w-[90%] p-4 text-sm shadow-sm ${message.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-2xl rounded-br-sm'
                    : 'bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-2xl rounded-bl-sm backdrop-blur-sm'
                    }`}>
                    {message.role === 'assistant' ? (
                      <div className="prose prose-invert prose-sm max-w-none prose-p:text-slate-300 prose-headings:text-white prose-strong:text-indigo-300 prose-code:text-indigo-200 prose-code:bg-indigo-900/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-md">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>

                  {/* Action Card (If AI has an action) */}
                  {message.role === 'assistant' && action && action.type !== 'NONE' && (
                    <div className="mt-2 ml-1 max-w-[85%]">
                      {action.type === 'NAVIGATE' && action.payload === location.pathname ? (
                        // Context Active Badge
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          You are here: {action.payload}
                        </div>
                      ) : (
                        // Interactive Action Card
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex flex-col gap-3 backdrop-blur-md shadow-lg">
                          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider border-b border-slate-700/50 pb-2">
                            <Activity className="w-3 h-3" />
                            Suggested Action
                          </div>
                          <p className="text-xs text-slate-400 font-medium">
                            {action.type === 'NAVIGATE' ? `Navigate to: ${action.payload}` : `Request: ${action.payload}`}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                executeAction(action!);
                                if (action.type === 'REQUEST_ACCESS') {
                                  await handleSendMessage("Access Granted. Proceed with the analysis.");
                                }
                              }}
                              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-2 px-3 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20"
                            >
                              Confirm Action
                            </button>
                            <button
                              className="bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-xs py-2 px-3 font-medium rounded-lg transition-colors"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {(isLoading || isSending) && (
              <div className="flex items-center gap-2 text-slate-500 text-xs animate-pulse pl-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                Sage is thinking...
              </div>
            )}
          </div>

          {/* Command Palette Input */}
          <div className="p-4 border-t border-slate-700/50 bg-[#0B1221]/80 backdrop-blur-md">
            <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 p-3 rounded-xl focus-within:border-indigo-500/50 focus-within:bg-slate-800 transition-all shadow-inner">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask Sage or type a command..."
                className="flex-1 bg-transparent border-none outline-none text-slate-200 text-sm placeholder:text-slate-500"
                autoFocus
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isSending || !chatInput.trim()}
                className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-30 disabled:bg-slate-700 transition-all shadow-lg shadow-indigo-900/20"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}