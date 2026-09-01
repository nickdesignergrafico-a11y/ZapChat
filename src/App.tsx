import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { Chat, Message, UserSession } from './types';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import JoinGroupModal from './components/JoinGroupModal';

export default function App() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>('grupo-projetos');
  const [mobileShowChat, setMobileShowChat] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);

  // Group Invite Link states
  const [pendingInviteCode, setPendingInviteCode] = useState<string | null>(null);
  const [groupPreview, setGroupPreview] = useState<any | null>(null);
  const [isCheckingInvite, setIsCheckingInvite] = useState<boolean>(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);

  const lastSyncTimeRef = useRef<number>(0);
  const activeChatIdRef = useRef<string | null>(activeChatId);

  // Check URL query parameters for invite links
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const invite = params.get('invite');
      if (invite) {
        setPendingInviteCode(invite);
      }
    }
  }, []);

  // When user is logged in and there is a pending invite code, load preview
  useEffect(() => {
    if (!user || !pendingInviteCode) return;

    const fetchInvitePreview = async () => {
      setIsCheckingInvite(true);
      setInviteError(null);
      setShowJoinModal(true);

      try {
        const res = await fetch(`/api/invites/${pendingInviteCode}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Link de convite inválido ou expirado.');
        }

        const data = await res.json();
        setGroupPreview(data);
      } catch (err: any) {
        setInviteError(err.message || 'Erro ao carregar convite.');
      } finally {
        setIsCheckingInvite(false);
      }
    };

    fetchInvitePreview();
  }, [user, pendingInviteCode]);

  // Capture PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choiceResult = await deferredInstallPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setDeferredInstallPrompt(null);
      }
    }
  };

  // Sync activeChatId ref for the polling interval closure
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  // 1. Firebase Authentication Listener (Handles login persistence automatically)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const session: UserSession = {
              uid: fbUser.uid,
              email: data.email || fbUser.email || '',
              displayName: data.displayName || fbUser.displayName || '',
              initial: data.initial || (fbUser.email?.charAt(0).toUpperCase() || 'U'),
              avatarColor: data.avatarColor || '#059669'
            };
            setUser(session);
            localStorage.setItem('zapchat_user', JSON.stringify(session));
          } else {
            const initial = (fbUser.email?.charAt(0).toUpperCase() || 'U');
            const fallbackSession: UserSession = {
              uid: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || fbUser.email?.split('@')[0] || '',
              initial,
              avatarColor: '#059669'
            };
            setUser(fallbackSession);
            localStorage.setItem('zapchat_user', JSON.stringify(fallbackSession));
          }
        } catch (e) {
          console.error('Error fetching user profile from Firestore:', e);
          if (fbUser.email) {
            const initial = fbUser.email.charAt(0).toUpperCase();
            setUser({
              uid: fbUser.uid,
              email: fbUser.email,
              initial,
              avatarColor: '#059669'
            });
          }
        }
      } else {
        setUser(null);
        localStorage.removeItem('zapchat_user');
        localStorage.removeItem('zapchat_token');
      }
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Fetch all chats once user is logged in
  useEffect(() => {
    if (!user) return;

    const fetchChats = async () => {
      const token = localStorage.getItem('zapchat_token');
      try {
        const res = await fetch('/api/chats', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        if (res.ok) {
          const serverChats = await res.json();
          const mappedChats = serverChats.map((chat: any) => ({
            ...chat,
            messages: chat.messages.map((msg: any) => ({
              id: msg.id,
              sender: msg.senderEmail === user.email ? 'me' : 'them',
              senderName: msg.senderName,
              text: msg.text,
              time: msg.time,
              timestamp: msg.timestamp,
              status: msg.status
            }))
          }));

          setChats(mappedChats);
          lastSyncTimeRef.current = Date.now();
        }
      } catch (err) {
        console.error('Error fetching chats:', err);
      }
    };

    fetchChats();
  }, [user]);

  // 3. Real-time synchronization polling (every 1200ms)
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    let intervalId: any;

    const pollSync = async () => {
      const token = localStorage.getItem('zapchat_token');

      try {
        const res = await fetch(`/api/sync?since=${lastSyncTimeRef.current}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        if (!res.ok) {
          return;
        }

        const data = await res.json();
        if (!isMounted) return;

        // Update sync time
        lastSyncTimeRef.current = data.timestamp;

        // Sync new messages across chats
        if (data.messages && data.messages.length > 0) {
          setChats(prevChats => {
            let updated = false;
            const nextChats = prevChats.map(chat => {
              const chatMessages = data.messages.filter((m: any) => m.chatId === chat.id);
              if (chatMessages.length === 0) return chat;

              // Filter out duplicates
              const newMsgs = chatMessages
                .filter((m: any) => !chat.messages.some(existing => existing.id === m.id))
                .map((m: any) => ({
                  id: m.id,
                  sender: m.senderEmail === user.email ? 'me' as const : 'them' as const,
                  senderName: m.senderName,
                  text: m.text,
                  time: m.time,
                  timestamp: m.timestamp,
                  status: m.status
                }));

              if (newMsgs.length === 0) return chat;

              updated = true;
              const isCurrentlyActive = chat.id === activeChatIdRef.current;

              return {
                ...chat,
                messages: [...chat.messages, ...newMsgs],
                unreadCount: isCurrentlyActive ? 0 : chat.unreadCount + newMsgs.length
              };
            });

            return updated ? nextChats : prevChats;
          });
        }

        // Sync chats list (new conversations and online status updates)
        if (data.chats) {
          setChats(prevChats => {
            const mergedChats = [...prevChats];
            
            data.chats.forEach((serverChat: any) => {
              const existingIndex = mergedChats.findIndex(c => c.id === serverChat.id);
              
              if (existingIndex === -1) {
                // New chat created
                const clientChat: Chat = {
                  ...serverChat,
                  messages: serverChat.messages.map((m: any) => ({
                    id: m.id,
                    sender: m.senderEmail === user.email ? 'me' as const : 'them' as const,
                    senderName: m.senderName,
                    text: m.text,
                    time: m.time,
                    timestamp: m.timestamp,
                    status: m.status
                  }))
                };
                mergedChats.unshift(clientChat);
              } else {
                // Update online status or status text
                mergedChats[existingIndex] = {
                  ...mergedChats[existingIndex],
                  statusText: serverChat.statusText,
                  online: serverChat.online
                };
              }
            });

            return mergedChats;
          });
        }

      } catch (err) {
        console.error('Polling sync error:', err);
      }
    };

    intervalId = setInterval(pollSync, 1200);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [user]);

  const handleLoginSuccess = (session: UserSession, token: string) => {
    setUser(session);
    localStorage.setItem('zapchat_user', JSON.stringify(session));
    localStorage.setItem('zapchat_token', token);
    setActiveChatId('grupo-projetos');
    setMobileShowChat(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    setChats([]);
    setActiveChatId(null);
    setMobileShowChat(false);
    localStorage.removeItem('zapchat_user');
    localStorage.removeItem('zapchat_token');
  };

  const getFormattedTime = () => {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  };

  // 4. Send message securely to server and Firestore
  const handleSendMessage = async (text: string) => {
    if (!activeChatId || !user) return;

    const token = localStorage.getItem('zapchat_token');

    // A. Optimistic Update for snappy user feedback
    const timeString = getFormattedTime();
    const tempMsgId = 'msg-temp-' + Date.now();
    const tempMessage: Message = {
      id: tempMsgId,
      sender: 'me',
      text,
      time: timeString,
      timestamp: Date.now(),
      status: 'sent'
    };

    setChats(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          messages: [...chat.messages, tempMessage]
        };
      }
      return chat;
    }));

    // B. Send message to backend Express server & write to Firestore
    try {
      // 1. Post to API
      const res = await fetch(`/api/chats/${activeChatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ text, userEmail: user.email })
      });

      if (!res.ok) {
        throw new Error('Could not send message');
      }

      const savedMsg = await res.json();

      // 2. Also register in Firestore subcollection for real-time cloud durability
      try {
        await addDoc(collection(db, 'chats', activeChatId, 'messages'), {
          text,
          senderEmail: user.email,
          senderName: user.displayName || user.email.split('@')[0],
          time: timeString,
          timestamp: Date.now(),
          status: 'sent'
        });
      } catch (fErr) {
        console.warn('Firestore cloud backup notice:', fErr);
      }

      // Replace optimistic message with the verified database record
      setChats(prev => prev.map(chat => {
        if (chat.id === activeChatId) {
          return {
            ...chat,
            messages: chat.messages.map(m => m.id === tempMsgId ? {
              id: savedMsg.id,
              sender: 'me' as const,
              senderName: savedMsg.senderName,
              text: savedMsg.text,
              time: savedMsg.time,
              timestamp: savedMsg.timestamp,
              status: 'sent'
            } : m)
          };
        }
        return chat;
      }));

    } catch (err) {
      console.error(err);
      // Rollback optimistic message
      setChats(prev => prev.map(chat => {
        if (chat.id === activeChatId) {
          return {
            ...chat,
            messages: chat.messages.filter(m => m.id !== tempMsgId)
          };
        }
        return chat;
      }));
      alert('Erro ao enviar mensagem. Verifique sua conexão.');
    }
  };

  const handleSendAttachment = (type: 'image' | 'document' | 'location' | 'contact') => {
    if (!activeChatId) return;

    let text = '';
    switch (type) {
      case 'image':
        text = '🖼️ [Foto Simulada] zapchat_preview_mockup.png';
        break;
      case 'document':
        text = '📄 Documento_De_Requisitos.pdf (1.4 MB)';
        break;
      case 'location':
        text = '📍 Localização Simulada: Avenida Paulista, 1000 - São Paulo, SP';
        break;
      case 'contact':
        text = '👤 Contato: Letícia ZapChat (+55 11 99999-8888)';
        break;
    }

    handleSendMessage(text);
  };

  // 5. Create new chat on server and in Firestore
  const handleAddNewChat = async (name: string, isGroup: boolean) => {
    if (!user) return;

    const token = localStorage.getItem('zapchat_token');

    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ name, isGroup, userEmail: user.email })
      });

      if (!res.ok) {
        throw new Error('Failed to create new conversation');
      }

      const serverChat = await res.json();
      
      // Also register conversation entity in Firestore "chats" collection
      try {
        await setDoc(doc(db, 'chats', serverChat.id), {
          id: serverChat.id,
          name: serverChat.name,
          isGroup: serverChat.isGroup,
          avatarColor: serverChat.avatarColor,
          avatarLetter: serverChat.avatarLetter,
          createdBy: user.email,
          statusText: serverChat.statusText,
          online: serverChat.online,
          createdAt: new Date().toISOString()
        });
      } catch (fErr) {
        console.warn('Firestore cloud chat backup notice:', fErr);
      }

      const clientChat: Chat = {
        ...serverChat,
        messages: serverChat.messages.map((m: any) => ({
          id: m.id,
          sender: m.senderEmail === user.email ? 'me' as const : 'them' as const,
          senderName: m.senderName,
          text: m.text,
          time: m.time,
          timestamp: m.timestamp,
          status: m.status
        }))
      };

      setChats(prev => [clientChat, ...prev]);
      setActiveChatId(clientChat.id);
      setMobileShowChat(true);

    } catch (err) {
      console.error(err);
      alert('Não foi possível criar a conversa.');
    }
  };

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    setMobileShowChat(true);

    // Clean unread count locally instantly
    setChats(prev => prev.map(chat => {
      if (chat.id === id) {
        return { ...chat, unreadCount: 0 };
      }
      return chat;
    }));
  };

  // 6. Join Group via Invite Link
  const handleJoinGroup = async () => {
    if (!user || !pendingInviteCode) return;

    const token = localStorage.getItem('zapchat_token');

    try {
      const res = await fetch(`/api/invites/${pendingInviteCode}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ userEmail: user.email })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Não foi possível entrar no grupo.');
      }

      const serverChat = await res.json();
      const clientChat: Chat = {
        ...serverChat,
        messages: serverChat.messages.map((m: any) => ({
          id: m.id,
          sender: m.senderEmail === user.email ? 'me' as const : 'them' as const,
          senderName: m.senderName,
          text: m.text,
          time: m.time,
          timestamp: m.timestamp,
          status: m.status
        }))
      };

      setChats(prev => {
        const filtered = prev.filter(c => c.id !== clientChat.id);
        return [clientChat, ...filtered];
      });

      setActiveChatId(clientChat.id);
      setMobileShowChat(true);
      setShowJoinModal(false);
      setPendingInviteCode(null);

      // Clean URL params cleanly
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (err: any) {
      console.error('Join group error:', err);
      alert(err.message || 'Erro ao entrar no grupo.');
    }
  };

  // 7. Revoke and generate new invite code for a group
  const handleRevokeInvite = async (chatId: string) => {
    const token = localStorage.getItem('zapchat_token');
    try {
      const res = await fetch(`/api/chats/${chatId}/revoke-invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (res.ok) {
        const data = await res.json();
        setChats(prev => prev.map(c => c.id === chatId ? { ...c, inviteCode: data.inviteCode } : c));
        return data.inviteCode;
      }
    } catch (e) {
      console.error('Failed to revoke invite:', e);
    }
  };

  const activeChat = chats.find(c => c.id === activeChatId) || null;

  // Loader screen while verifying session on mount
  if (isInitializing) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-500/50 p-0.5 bg-slate-900 flex items-center justify-center mb-4 animate-pulse">
            <img 
              src="/icons/icon-192x192.png" 
              alt="ZapChat Web Logo" 
              className="w-full h-full object-cover rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-lg font-bold text-white tracking-wide">ZapChat Web</h1>
          <p className="text-xs text-emerald-400/80 mt-1 font-medium animate-pulse">Iniciando aplicativo e Firebase...</p>
        </div>
      </div>
    );
  }

  // Render Login/Register page if user session is absent
  if (!user) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="w-full h-full min-h-screen fixed inset-0 bg-slate-950 flex items-center justify-center font-sans antialiased p-0 sm:p-2 md:p-4 lg:p-6 overflow-hidden">
      {/* Mesh Gradient Background Decoration */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Main App Container with Frosted Glass look - perfectly centered */}
      <div className="w-full max-w-[1600px] h-full sm:h-[calc(100vh-16px)] md:h-[calc(100vh-32px)] lg:h-[calc(100vh-48px)] mx-auto rounded-none sm:rounded-xl md:rounded-2xl border border-white/10 backdrop-blur-3xl bg-slate-900/70 shadow-2xl flex z-10 relative overflow-hidden text-white/90">
        
        {/* Left column (Sidebar): visible on desktop or when active chat is hidden on mobile */}
        <div className={`h-full flex-col ${mobileShowChat ? 'hidden md:flex' : 'flex w-full md:w-[360px] lg:w-[400px] xl:w-[430px]'} flex-shrink-0 border-r border-white/10`}>
          <Sidebar
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={handleSelectChat}
            user={user}
            onLogout={handleLogout}
            onAddNewChat={handleAddNewChat}
            onInstallPwa={handleInstallPwa}
            canInstall={!!deferredInstallPrompt}
          />
        </div>

        {/* Right column (Chat Window): visible on desktop or when a chat is explicitly opened on mobile */}
        <div className={`h-full flex-1 flex flex-col ${!mobileShowChat ? 'hidden md:flex' : 'flex w-full'} min-w-0 overflow-hidden`}>
          <ChatArea
            chat={activeChat}
            currentUser={user}
            onSendMessage={handleSendMessage}
            onSendAttachment={handleSendAttachment}
            onBackToSidebar={() => setMobileShowChat(false)}
            onRevokeInvite={handleRevokeInvite}
          />
        </div>

      </div>

      {/* Join Group Invitation Modal Dialog */}
      {showJoinModal && pendingInviteCode && (
        <JoinGroupModal
          isOpen={showJoinModal}
          inviteCode={pendingInviteCode}
          groupPreview={groupPreview}
          isLoading={isCheckingInvite}
          error={inviteError}
          onJoin={handleJoinGroup}
          onCancel={() => {
            setShowJoinModal(false);
            setPendingInviteCode(null);
            if (typeof window !== 'undefined') {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          }}
        />
      )}
    </div>
  );
}
