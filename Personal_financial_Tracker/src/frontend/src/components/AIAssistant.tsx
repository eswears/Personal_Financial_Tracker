import React, { useState, useRef, useEffect } from 'react';
import type { Transaction, SpendingTrend, CategoryBreakdown } from '../types';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: {
    label: string;
    action: () => void;
  }[];
}

interface AIAssistantProps {
  transactions: Transaction[];
  trends: SpendingTrend[];
  categories: CategoryBreakdown[];
  monthlyIncome: number;
  monthlyExpenses: number;
  onScenarioCreate?: (scenario: any) => void;
  onNavigate?: (page: string) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  transactions,
  trends,
  categories,
  monthlyIncome,
  monthlyExpenses,
  onScenarioCreate,
  onNavigate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: `Hi! I'm your AI financial assistant. I have access to all your financial data and can help you:
      
• Analyze spending patterns
• Create budget scenarios
• Find savings opportunities
• Answer questions about your finances
• Build custom forecasts

What would you like to explore?`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  // Call real AI API
  const generateResponse = async (userMessage: string): Promise<{ content: string; actions?: any[] }> => {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          userId: 'default-user-123' // In production, use actual user ID
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      // Convert action strings to functions
      const actions = data.actions?.map((action: any) => ({
        ...action,
        action: () => onNavigate?.(action.action)
      })) || [];

      return {
        content: data.response,
        actions: actions
      };

    } catch (error) {
      console.error('AI API call failed:', error);
      
      // Fallback response with actual financial data
      const topCategory = categories[0];
      const savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(1);
      
      return {
        content: `I'm having trouble connecting to my AI service right now, but I can share some insights from your data:

📊 **Your Financial Overview:**
• Monthly Income: $${monthlyIncome.toFixed(2)}
• Monthly Expenses: $${monthlyExpenses.toFixed(2)}
• Savings Rate: ${savingsRate}%
• Top Spending: ${topCategory?.category} ($${topCategory?.amount.toFixed(2)}/month)

I'll try to reconnect for more detailed analysis. In the meantime, you can explore your data using the navigation buttons below.`,
        actions: [
          { label: 'View Analytics', action: () => onNavigate?.('analytics') },
          { label: 'Create Forecast', action: () => onNavigate?.('forecast') }
        ]
      };
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Simulate AI processing
    setTimeout(async () => {
      const response = await generateResponse(inputValue);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        actions: response.actions
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const quickActions = [
    { label: 'Category Breakdown', query: 'breakdown my spending by category' },
    { label: 'Biggest Savings', query: 'what can I stop spending money on' },
    { label: 'Other Category', query: 'what is the other category spending on' },
    { label: 'Budget Plan', query: 'create a savings plan for me' }
  ];

  return (
    <>
      {/* AI Assistant Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all hover:scale-110 z-50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
        </button>
      )}

      {/* AI Assistant Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 bg-white rounded-xl shadow-2xl border border-gray-200 transition-all z-50 ${
          isMinimized ? 'h-14 w-80' : 'h-[600px] w-[400px]'
        }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">AI Financial Assistant</h3>
                <p className="text-xs opacity-90">Always here to help</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white/80 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMinimized ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 h-[420px]">
                {messages.map(message => (
                  <div 
                    key={message.id}
                    className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}
                  >
                    <div className={`inline-block max-w-[80%] ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white rounded-l-xl rounded-tr-xl' 
                        : 'bg-gray-100 text-gray-900 rounded-r-xl rounded-tl-xl'
                    } px-4 py-3`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.actions && (
                        <div className="mt-3 space-y-2">
                          {message.actions.map((action, index) => (
                            <button
                              key={index}
                              onClick={action.action}
                              className="block w-full text-left bg-white/20 hover:bg-white/30 rounded px-3 py-2 text-xs transition-colors"
                            >
                              {action.label} →
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 px-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                ))}
                {isTyping && (
                  <div className="text-left mb-4">
                    <div className="inline-block bg-gray-100 rounded-r-xl rounded-tl-xl px-4 py-3">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              <div className="px-4 py-2 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInputValue(action.query);
                        inputRef.current?.focus();
                      }}
                      className="text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-end space-x-2">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Ask me anything about your finances..."
                    className="flex-1 resize-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[40px] max-h-[120px]"
                    rows={1}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className="bg-purple-600 text-white rounded-lg p-2 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};