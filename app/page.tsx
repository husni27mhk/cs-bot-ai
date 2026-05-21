"use client";
import { useState, useEffect, useRef } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
}

interface FullscreenDocument extends Document {
  webkitExitFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
  webkitFullscreenElement?: Element | null;
  msFullscreenElement?: Element | null;
}

const FALLBACK_MESSAGE =
  "mohon maaf ada kendala sistem silahkan hubungi : \nhttps://Wa.me/6281935036470\nuntuk custemer service lebih lanjut";

function getFullscreenDocument(): FullscreenDocument {
  return document as FullscreenDocument;
}

function getFullscreenElement(el: HTMLElement): FullscreenElement {
  return el as FullscreenElement;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Halo! Selamat datang di CS Virtual. Ada yang bisa kami bantu hari ini?", sender: 'bot' }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Auto scroll ke bawah setiap ada pesan baru
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Fullscreen support
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    const el = getFullscreenElement(containerRef.current);
    const doc = getFullscreenDocument();
    try {
      if (!document.fullscreenElement) {
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
          await el.webkitRequestFullscreen();
        } else if (el.msRequestFullscreen) {
          await el.msRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Error toggling fullscreen:", err);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = getFullscreenDocument();
      setIsFullscreen(
        !!document.fullscreenElement ||
        !!doc.webkitFullscreenElement ||
        !!doc.msFullscreenElement
      );
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const userMsg: Message = { text: trimmedInput, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Panggil API route internal Next.js (/api/chat) untuk menghindari CORS dan menjaga URL Webhook tetap aman
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmedInput }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.output || errorData.error || FALLBACK_MESSAGE);
      }

      const data = await res.json();
      const botReply = data.output || "Tidak ada respon dari asisten.";
      setMessages(prev => [...prev, { text: botReply, sender: 'bot' }]);
    } catch {
      setMessages(prev => [...prev, { text: FALLBACK_MESSAGE, sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} id="chat-container" className="fixed inset-0 flex flex-col w-full bg-gray-50 text-gray-800 overflow-hidden">
      {/* Header */}
      <header id="chat-header" className="sticky top-0 z-20 shrink-0 bg-white border-b pt-[calc(1rem+env(safe-area-inset-top,0px))] pb-4 px-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
          <div id="cv-avatar" className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold mr-3 shrink-0">CV</div>
          <div>
            <h1 id="cs-title" className="font-bold text-sm">CS Virtual</h1>
            <div id="status-online" className="flex items-center text-xs text-emerald-500">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-1"></span> Online
            </div>
          </div>
        </div>
        
        {/* Fullscreen Toggle Button */}
        <button
          id="fullscreen-toggle-btn"
          onClick={toggleFullscreen}
          className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition duration-200 cursor-pointer flex items-center justify-center shadow-sm border border-gray-100 bg-white"
          title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5 text-gray-600" />
          ) : (
            <Maximize2 className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </header>

      {/* Chat Area */}
      <main ref={scrollRef} id="chat-message-list" className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} id={`msg-wrapper-${idx}`} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div id={`msg-${idx}`} className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
              msg.sender === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white border rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div id="loading-indicator" className="flex justify-start">
            <div id="loading-dots" className="bg-white border p-3 rounded-2xl rounded-tl-none flex space-x-1">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </main>

      {/* Input Bar */}
      <footer id="chat-footer" className="shrink-0 p-4 bg-white border-t pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
        <form id="chat-input-form" onSubmit={handleSend} className="max-w-4xl mx-auto flex space-x-2">
          <input
            id="chat-text-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={(e) => {
              requestAnimationFrame(() => {
                e.target.scrollIntoView({ block: "nearest", behavior: "smooth" });
              });
            }}
            disabled={isLoading}
            placeholder="Tanyakan sesuatu..."
            className="flex-grow p-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          />
          <button
            id="chat-submit-btn"
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-emerald-600 text-white px-5 py-3 rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer"
          >
            Kirim
          </button>
        </form>
      </footer>
    </div>
  );
}
