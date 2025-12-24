import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWorkspace } from '@/contexts/WorkspaceContext';

const chatResponses: Record<string, string> = {
  'analyze my scope 1 spikes': 'Based on the data, Furnace B is showing anomalous energy consumption at 2 PM daily. This correlates with a 23% increase in Scope 1 emissions. Recommendation: Check maintenance logs for Furnace B - likely heat exchanger inefficiency.',
  'predict next quarter': 'Based on current trends and seasonal patterns, Q2 2025 emissions are projected at 8,450 tCO2e (+12% vs Q1). Key drivers: Summer cooling demand, production ramp-up. Mitigation opportunity: Solar PV installation could offset 15%.',
  'cost optimization': 'Top 3 cost reduction opportunities identified:\n1. Shift furnace operations to off-peak hours: ₹2.3L/month savings\n2. Replace Furnace B heat exchanger: ₹1.8L/month\n3. Optimize HVAC schedules: ₹0.9L/month',
  'green projects': 'I found 3 high-impact green projects matching your criteria:\n1. Adani Solar Park - 24,500 tCO2e/year, ₹450/credit\n2. Sundarbans Mangrove - 15,000 tCO2e/year, ₹380/credit\n3. Gujarat Wind Farm - 42,000 tCO2e/year, ₹520/credit',
  'compliance status': 'Your CCTS compliance status:\n• Steel Plant A: Action Required (700 CCCCs short)\n• Cement Unit B: On Track (+560 surplus)\n• Refinery C: Critical (3,240 CCCCs short)\n\nRecommendation: Purchase 3,940 CCCCs at current market price ₹1,500/credit.',
};

export function ChatPanel() {
  const { isChatPanelOpen, setChatPanelOpen } = useWorkspace();
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai'; content: string}[]>([]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput.toLowerCase().trim();
    setChatMessages(prev => [...prev, { role: 'user', content: chatInput }]);
    
    const matchedKey = Object.keys(chatResponses).find(key => 
      userMessage.includes(key) || key.includes(userMessage.split(' ').slice(0, 3).join(' '))
    );
    
    const aiResponse = matchedKey 
      ? chatResponses[matchedKey]
      : "I can help you with emissions analysis, cost optimization, compliance status, and green project recommendations. Try asking about 'scope 1 spikes', 'predict next quarter', 'cost optimization', 'green projects', or 'compliance status'.";
    
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    }, 500);
    
    setChatInput('');
  };

  return (
    <AnimatePresence>
      {isChatPanelOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 h-full w-full sm:w-[400px] z-[9998] flex flex-col border-l border-border bg-background/95 backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground">Artha SAGE</h3>
                <p className="text-xs text-muted-foreground">AI-Powered Assistant</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setChatPanelOpen(false)}
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-600/20 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-purple-500" />
                </div>
                <h4 className="font-medium text-foreground mb-2">How can I help you?</h4>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Ask me about emissions analysis, cost optimization, compliance, or green project recommendations.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {['Analyze my scope 1 spikes', 'Cost optimization', 'Compliance status'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setChatInput(suggestion);
                      }}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {chatMessages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-3 rounded-xl text-sm whitespace-pre-line ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground'
                }`}>
                  {message.content}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask Artha SAGE..."
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                size="icon"
                className="bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}