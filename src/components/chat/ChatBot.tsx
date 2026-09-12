import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from 'react-router-dom';
import { Send, Bot, User, Sparkles, LogIn, Loader2, History, Plus, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePresentationMode } from '@/contexts/PresentationModeContext';
import { dummyChatHistory } from '@/data/presentationDummyData';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  date: string;
  messages: Message[];
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/study-chat`;

export function ChatBot() {
  const { user } = useAuth();
  const { isPresentationMode } = usePresentationMode();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch past chat sessions from DB
  const { data: dbChatSessions = [] } = useQuery({
    queryKey: ['chat-sessions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Group messages into sessions (by gaps > 30 min)
      const sessions: ChatSession[] = [];
      let currentSession: Message[] = [];
      let sessionStart = '';
      let lastTime = 0;

      for (const msg of data) {
        const msgTime = new Date(msg.created_at).getTime();
        if (lastTime && msgTime - lastTime > 30 * 60 * 1000) {
          // New session
          if (currentSession.length > 0) {
            const firstUserMsg = currentSession.find(m => m.role === 'user');
            sessions.push({
              id: `db-${sessions.length}`,
              title: firstUserMsg?.content.slice(0, 50) || 'Chat',
              date: sessionStart,
              messages: [...currentSession],
            });
          }
          currentSession = [];
        }
        if (currentSession.length === 0) sessionStart = msg.created_at;
        currentSession.push({ role: msg.role as 'user' | 'assistant', content: msg.content });
        lastTime = msgTime;
      }

      if (currentSession.length > 0) {
        const firstUserMsg = currentSession.find(m => m.role === 'user');
        sessions.push({
          id: `db-${sessions.length}`,
          title: firstUserMsg?.content.slice(0, 50) || 'Chat',
          date: sessionStart,
          messages: [...currentSession],
        });
      }

      return sessions.reverse();
    },
    enabled: !!user,
  });

  const chatSessions: ChatSession[] = isPresentationMode ? dummyChatHistory : dbChatSessions;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessages: Message[]) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: userMessages }),
    });

    if (resp.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    }
    if (resp.status === 402) {
      throw new Error('AI credits exhausted. Please try again later.');
    }
    if (resp.status === 401) {
      throw new Error('Not authorized. Please sign out and sign back in.');
    }
    if (!resp.ok || !resp.body) {
      // Try to read the error body for a helpful message
      let detail = 'Failed to start AI chat.';
      try {
        const errBody = await resp.clone().json();
        if (errBody?.error) detail = errBody.error;
      } catch {
        // ignore parse errors
      }
      throw new Error(detail);
    }


    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let assistantContent = '';

    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = { role: 'assistant', content: assistantContent };
              return newMessages;
            });
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      await streamChat(updatedMessages);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to get response',
        variant: 'destructive',
      });
      setMessages(prev => prev.filter((_, i) => i !== prev.length - 1));
    } finally {
      setIsLoading(false);
    }
  };

  const loadSession = (session: ChatSession) => {
    setMessages(session.messages);
    setActiveSessionId(session.id);
    setShowHistory(false);
  };

  const startNewChat = () => {
    setMessages([]);
    setActiveSessionId(null);
    setShowHistory(false);
  };

  const quickPrompts = [
    { text: "How do I study for a math test?", icon: "📐" },
    { text: "Help me plan for my history exam next week", icon: "📚" },
    { text: "What's the best way to memorize vocabulary?", icon: "🔤" },
    { text: "How can I stay focused while studying?", icon: "🎯" },
  ];

  if (!user) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-info/20 to-primary/20 flex items-center justify-center mx-auto mb-6">
          <Bot className="h-10 w-10 text-info" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-2">Meet Your AI Study Buddy</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Get personalized study tips, homework help, and test preparation advice. Sign in to start chatting!
        </p>
        <Button asChild>
          <Link to="/auth">
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold mb-1 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-info" />
            AI Study Buddy
          </h2>
          <p className="text-muted-foreground">Get help with studying, homework, and test prep</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="gap-2"
          >
            <History className="h-4 w-4" />
            Past Chats
          </Button>
          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={startNewChat}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          )}
        </div>
      </div>

      {/* Past Chats Panel */}
      {showHistory && (
        <Card className="card-elevated animate-fade-up">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <History className="h-4 w-4" />
              Chat History
            </h3>
            {chatSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No past chats yet. Start a conversation!
              </p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {chatSessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => loadSession(session)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeSessionId === session.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'bg-secondary/50 hover:bg-secondary'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{session.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(session.date), 'MMM d, yyyy')} · {session.messages.length} messages
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="card-elevated">
        <CardContent className="p-0">
          {/* Chat Messages */}
          <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <Bot className="h-12 w-12 text-info mb-4" />
                <h3 className="font-display font-bold text-lg mb-2">How can I help you study?</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  Ask me anything about studying, homework, or preparing for tests!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                  {quickPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(prompt.text)}
                      className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary text-left text-sm transition-colors"
                    >
                      <span className="mr-2">{prompt.icon}</span>
                      {prompt.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-info" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-secondary text-secondary-foreground rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-info" />
                    </div>
                    <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                placeholder="Ask about studying, homework, or test prep..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                disabled={isLoading}
              />
              <Button onClick={sendMessage} disabled={!input.trim() || isLoading} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}