import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { API_URL } from '../config';


const Typewriter = ({ text }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let index = 0;
        // Immediate start
        if (!text) return;

        const intervalId = setInterval(() => {
            setDisplayedText(text.slice(0, index + 1));
            index++;
            if (index > text.length) {
                clearInterval(intervalId);
            }
        }, 15);
        return () => clearInterval(intervalId);
    }, [text]);

    return <span>{displayedText}</span>;
};

const Chatbot = () => {
    const { user } = useAuth();
    const location = useLocation();

    // Hide chatbot on login and signup pages
    if (['/login', '/signup'].includes(location.pathname)) {
        return null;
    }

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! I'm your AI food assistant. How can I help you today?", sender: 'bot' }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);



    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            const response = await fetch(`${API_URL}/api/chat/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: user?._id,
                    message: userMsg.text
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessages(prev => [...prev, { id: Date.now() + 1, text: data.reply, sender: 'bot' }]);
            } else {
                setMessages(prev => [...prev, { id: Date.now() + 1, text: "Sorry, I'm having trouble connecting right now.", sender: 'bot' }]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "Something went wrong. Please try again later.", sender: 'bot' }]);
        } finally {
            setIsTyping(false);
        }
    };

    const formatMessage = (text) => {
        // 1. Linkify [text](url) or raw URLs
        // Simple regex for [text](url)
        let formatted = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-orange-600 hover:underline font-bold" rel="noopener noreferrer">$1</a>');

        // Simple regex for raw http(s) (if not covered above)
        // (Be careful not to double linkify if above matched)
        // formatted = formatted.replace(/(?<!href=")(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-blue-500 hover:underline" rel="noopener noreferrer">$1</a>');

        // 2. Bold **text**
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // 3. Line breaks
        formatted = formatted.replace(/\n/g, '<br />');

        return formatted;
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 flex items-center justify-center animate-bounce-slow"
                >
                    <MessageSquare className="w-6 h-6" />
                </button>
            )}

            {/* Chat Interface */}
            {isOpen && (
                <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 border border-gray-100 overflow-hidden flex flex-col h-[500px] animate-fade-in flex flex-col">
                    <div className="bg-primary-600 p-4 flex justify-between items-center text-white shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white/20 rounded-full">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">AI Assistant</h3>
                                <span className="text-xs text-primary-100 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                                    {isTyping ? 'Thinking...' : 'Online'}
                                </span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                        {messages.map((msg, index) => (
                            <div key={msg.id} className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.sender === 'user'
                                    ? 'bg-primary-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-bl-none'
                                    }`}>
                                    {msg.sender === 'bot' ? (
                                        <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }} />
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start mb-3">
                                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 rounded-bl-none">
                                    <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 bg-white border-t border-gray-100 shrink-0">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about orders, food..."
                                disabled={isTyping}
                                className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all disabled:opacity-50"
                            />
                            <button
                                onClick={handleSend}
                                disabled={isTyping || !input.trim()}
                                className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
