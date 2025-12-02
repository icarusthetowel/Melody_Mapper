
'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Loader2, ChevronDown, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { chat, type ChatInput } from '@/ai/flows/chatbot-flow';
import { cn } from '@/lib/utils';


type Message = {
  role: 'user' | 'model';
  content: string;
};

export function Chatbot({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isLoginPage = pathname === '/' || pathname === '/signup' || pathname === '/teacher-signup' || pathname === '/admin-login' || pathname === '/admin-signup';

  useEffect(() => {
    let showTimer: NodeJS.Timeout;
    let hideTimer: NodeJS.Timeout;
    if (isLoginPage && !isOpen) {
      showTimer = setTimeout(() => {
        setShowWelcome(true);
        // Hide the welcome message after it has been visible for a while
        hideTimer = setTimeout(() => {
          setShowWelcome(false);
        }, 5000); // visible for 5 seconds
      }, 2000); // appears after 2 seconds
    }
    return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
    };
  }, [isLoginPage, isOpen]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const chatHistory: ChatInput['history'] = messages.map(msg => ({
            role: msg.role,
            content: [{ text: msg.content }]
        }));

      const result = await chat({
        history: chatHistory,
        message: input,
      });

      const modelMessage: Message = { role: 'model', content: result.message };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = { role: 'model', content: "Sorry, I'm having trouble connecting. Please try again later." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if(showWelcome) setShowWelcome(false);
  }

  if (isHidden) {
     return (
       <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-4 right-4 z-50">
        <Button onClick={() => setIsHidden(false)} size="icon" className="rounded-full h-14 w-14 shadow-lg">
            <Bot />
        </Button>
      </motion.div>
     )
  }

  return (
    <>
        <AnimatePresence>
         {isLoginPage && showWelcome && !isOpen && (
            <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-24 right-4 z-40 max-w-xs"
            >
                <Card className="shadow-lg bg-primary text-primary-foreground">
                    <button onClick={() => setShowWelcome(false)} className="absolute top-1 right-1 text-primary-foreground/70 hover:text-primary-foreground">
                        <X size={16} />
                    </button>
                    <CardContent className="p-3 text-sm">
                        <p>Welcome to Melody Mapper! If you need help getting started, feel free to ask.</p>
                    </CardContent>
                </Card>
            </motion.div>
         )}
        </AnimatePresence>

        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
            <AnimatePresence>
            {isOpen && (
                <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="w-[calc(100vw-2rem)] max-w-sm"
                >
                <Card className="h-[60vh] flex flex-col shadow-2xl">
                    <CardHeader className="flex flex-row items-center justify-between bg-card-foreground text-background p-4">
                    <div className="flex items-center gap-2">
                        <Bot className="h-6 w-6" />
                        <CardTitle className="text-lg">Melody Mapper Assistant</CardTitle>
                    </div>
                    <div>
                        {isLoggedIn && (
                             <Button variant="ghost" size="icon" onClick={() => { setIsOpen(false); setIsHidden(true); }} className="text-background hover:text-background/80 hover:bg-white/10 h-8 w-8">
                                <ChevronDown className="h-5 w-5" />
                                <span className="sr-only">Hide Chatbot</span>
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={toggleOpen} className="text-background hover:text-background/80 hover:bg-white/10 h-8 w-8">
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close Chat</span>
                        </Button>
                    </div>
                    
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                            <MessageSquare className="h-10 w-10 mb-2"/>
                            <p>Ask me anything about Melody Mapper!</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                        <div
                            key={index}
                            className={cn(
                            'flex items-start gap-3',
                            msg.role === 'user' ? 'justify-end' : 'justify-start'
                            )}
                        >
                            {msg.role === 'model' && (
                            <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                                <AvatarFallback><Bot size={18}/></AvatarFallback>
                            </Avatar>
                            )}
                            <div
                            className={cn(
                                'rounded-lg px-3 py-2 max-w-xs break-words',
                                msg.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}
                            >
                            {msg.content}
                            </div>
                        </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                    </CardContent>
                    <CardFooter className="p-4 border-t">
                    <div className="flex w-full items-center gap-2">
                        <Input
                        type="text"
                        placeholder="Ask a question..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        disabled={isLoading}
                        />
                        <Button onClick={handleSend} disabled={isLoading} size="icon">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </div>
                    </CardFooter>
                </Card>
                </motion.div>
            )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                >
                <Button onClick={toggleOpen} size="icon" className="rounded-full h-14 w-14 shadow-lg">
                    {isOpen ? <X /> : <Bot />}
                </Button>
            </motion.div>
        </div>
    </>
  );
}
