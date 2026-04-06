'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Send, User } from 'lucide-react';
import { format } from 'date-fns';

interface Conversation {
  id: string;
  customerId: string;
  customerName?: string;
  platform: string;
  lastMessage: string;
  updatedAt: any;
}

interface Message {
  id: string;
  conversationId: string;
  sender: string;
  content: string;
  timestamp: any;
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // Fetch customers to map names
    let custMap: Record<string, string> = {};
    getDocs(collection(db, 'customers')).then(snap => {
      snap.docs.forEach(doc => {
        custMap[doc.id] = doc.data().name;
      });
      
      // Listen to conversations
      const q = query(collection(db, 'conversations'), orderBy('updatedAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          customerName: custMap[doc.data().customerId] || 'Khách hàng ẩn danh'
        } as Conversation));
        setConversations(data);
      });
      return () => unsubscribe();
    });
  }, []);

  useEffect(() => {
    if (!activeConv) return;
    
    const q = query(collection(db, 'messages'), where('conversationId', '==', activeConv.id), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(data);
    });
    return () => unsubscribe();
  }, [activeConv]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;

    try {
      await addDoc(collection(db, 'messages'), {
        conversationId: activeConv.id,
        sender: 'agent',
        content: newMessage,
        timestamp: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message", error);
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-white m-4 rounded-2xl shadow-sm border border-slate-200">
      {/* Sidebar */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
        <div className="p-5 border-b border-slate-200 bg-white">
          <h2 className="text-lg font-bold text-slate-800">Trò chuyện</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => setActiveConv(conv)}
              className={`p-4 border-b border-slate-100 cursor-pointer transition-colors ${activeConv?.id === conv.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'hover:bg-slate-100 border-l-4 border-l-transparent'}`}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-sm text-slate-900">{conv.customerName}</h3>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${conv.platform === 'zalo' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                  {conv.platform}
                </span>
              </div>
              <p className="text-sm text-slate-500 truncate mt-1.5">{conv.lastMessage}</p>
            </div>
          ))}
          {conversations.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center">
              <MessageCircle className="h-8 w-8 text-slate-300 mb-3" />
              Chưa có cuộc trò chuyện nào
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {activeConv ? (
          <>
            <div className="p-4 border-b border-slate-200 bg-white flex items-center shadow-sm z-10">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white mr-3 shadow-md">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">{activeConv.customerName}</h2>
                <p className="text-xs font-medium text-slate-500 capitalize">Qua {activeConv.platform}</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map(msg => {
                const isAgent = msg.sender === 'agent';
                return (
                  <div key={msg.id} className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm ${isAgent ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'}`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className={`text-[10px] mt-1.5 text-right font-medium ${isAgent ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {msg.timestamp ? format(msg.timestamp.toDate(), 'HH:mm') : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={sendMessage} className="flex space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 rounded-xl border-slate-200 bg-slate-50 focus:bg-white shadow-inner focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border transition-colors"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="inline-flex items-center justify-center rounded-xl border border-transparent bg-indigo-600 px-5 py-3 text-sm font-medium text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
            <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4">
              <MessageCircle className="h-10 w-10 text-slate-300" />
            </div>
            <p className="text-lg font-medium text-slate-500">Chọn một cuộc trò chuyện để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  );
}
