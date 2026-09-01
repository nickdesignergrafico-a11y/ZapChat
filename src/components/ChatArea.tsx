import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  MoreVertical, 
  Smile, 
  Paperclip, 
  Mic, 
  Send, 
  ArrowLeft,
  Image,
  FileText,
  MapPin,
  User as UserIcon,
  Check,
  CheckCheck,
  Users,
  Link2,
  Info
} from 'lucide-react';
import { Chat, Message, UserSession } from '../types';
import GroupInfoModal from './GroupInfoModal';

interface ChatAreaProps {
  chat: Chat | null;
  currentUser?: UserSession | null;
  onSendMessage: (text: string) => void;
  onSendAttachment: (type: 'image' | 'document' | 'location' | 'contact') => void;
  onBackToSidebar: () => void;
  onRevokeInvite?: (chatId: string) => Promise<string | void>;
}

const COMMON_EMOJIS = ['😂', '👍', '❤️', '🙏', '🎉', '🔥', '😍', '🚀', '💡', '👏', '🎂', '🌟', '🤔', '😢', '😂', '👀', '💩', '🍻'];

export default function ChatArea({ 
  chat, 
  currentUser = null,
  onSendMessage, 
  onSendAttachment,
  onBackToSidebar,
  onRevokeInvite
}: ChatAreaProps) {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [searchInChat, setSearchInChat] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on load and whenever messages array length changes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  if (!chat) {
    return (
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-slate-950/40 relative">
        <div className="max-w-md text-center p-8 flex flex-col items-center select-none text-white/90">
          {/* Authentic-looking intro graphic illustration */}
          <div className="w-64 h-40 mb-6 bg-cover bg-no-repeat opacity-[0.15]" style={{
            backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`
          }} />
          <h3 className="text-xl font-semibold text-white mb-2">ZapChat Web Pro</h3>
          <p className="text-sm text-white/50 leading-relaxed max-w-xs">
            Envie e receba mensagens com sincronização em tempo real, grupos e temas personalizados.
          </p>
          <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-emerald-400/80 font-medium bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20 shadow-sm">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Criptografado de ponta a ponta
          </div>
        </div>
      </div>
    );
  }

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
      setShowEmojiPicker(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const addEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
    // Keep focus in input
    const input = document.getElementById('chatInput');
    if (input) {
      input.focus();
    }
  };

  // Filter messages if search inside chat is active
  const displayedMessages = chatSearchQuery.trim()
    ? chat.messages.filter(msg => msg.text.toLowerCase().includes(chatSearchQuery.toLowerCase()))
    : chat.messages;

  return (
    <div className="w-full flex-1 flex flex-col h-full bg-slate-950/40 relative overflow-hidden">
      {/* Background doodle image with fallback */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
        style={{
          backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`,
          backgroundRepeat: 'repeat',
          backgroundSize: '360px'
        }}
      />

      {/* Chat Header */}
      <div className="h-18 bg-white/[0.03] px-4 md:px-6 py-2 flex items-center justify-between border-b border-white/10 z-10 relative select-none flex-shrink-0">
        <div 
          onClick={() => {
            if (chat.isGroup) {
              setShowGroupInfo(true);
            }
          }}
          className={`flex items-center gap-3 min-w-0 ${chat.isGroup ? 'cursor-pointer hover:opacity-90' : ''}`}
        >
          {/* Back button for mobile */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onBackToSidebar();
            }}
            className="md:hidden p-1.5 hover:bg-white/10 rounded-full transition-colors focus:outline-none cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-white/80" />
          </button>

          {/* Contact Avatar */}
          <div 
            className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-semibold text-base relative shadow-md"
            style={{ backgroundColor: chat.avatarColor }}
          >
            <span>{chat.avatarLetter}</span>
            {chat.online && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            )}
          </div>

          {/* Contact Details */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-white text-[15px] truncate">
                {chat.name}
              </h4>
              {chat.isGroup && (
                <span className="text-[10px] bg-white/10 text-white/70 px-1.5 py-0.5 rounded font-normal hidden sm:inline-block">
                  Grupo
                </span>
              )}
            </div>
            <span className={`text-xs font-medium truncate block ${chat.statusText === 'digitando...' ? 'text-emerald-400 animate-pulse' : 'text-white/50'}`}>
              {chat.statusText}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 text-white/60">
          {/* Group Invite Link Quick Action Button */}
          {chat.isGroup && (
            <button
              onClick={() => setShowGroupInfo(true)}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/20 transition-all cursor-pointer shadow-sm"
              title="Convidar para o grupo via link ou QR Code"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Convidar via link</span>
            </button>
          )}

          <button 
            onClick={() => setSearchInChat(!searchInChat)}
            className={`p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none cursor-pointer ${searchInChat ? 'bg-white/10 text-emerald-400' : ''}`}
            title="Pesquisar mensagens"
          >
            <Search className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none cursor-pointer"
              title="Opções"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showOptionsMenu && (
              <div className="absolute right-0 top-11 w-52 bg-slate-900 border border-white/10 rounded-xl shadow-2xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                {chat.isGroup ? (
                  <>
                    <button
                      onClick={() => {
                        setShowOptionsMenu(false);
                        setShowGroupInfo(true);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span>Dados do grupo</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowOptionsMenu(false);
                        setShowGroupInfo(true);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Link2 className="w-4 h-4 text-emerald-400" />
                      <span>Link de convite do grupo</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowOptionsMenu(false);
                      alert(`Contato: ${chat.name}\nStatus: ${chat.statusText}`);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Info className="w-4 h-4 text-emerald-400" />
                    <span>Dados do contato</span>
                  </button>
                )}
                <div className="h-px bg-white/10 my-1"></div>
                <button
                  onClick={() => {
                    setShowOptionsMenu(false);
                    setSearchInChat(true);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-white hover:bg-white/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4 text-white/60" />
                  <span>Pesquisar mensagens</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inside Chat Messaging Search Bar (Optional Utility) */}
      {searchInChat && (
        <div className="bg-slate-900 border-b border-white/10 px-4 py-3 flex items-center gap-3 z-10 animate-in slide-in-from-top duration-150">
          <Search className="w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Pesquisar na conversa..."
            value={chatSearchQuery}
            onChange={(e) => setChatSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            autoFocus
          />
          <button 
            onClick={() => {
              setSearchInChat(false);
              setChatSearchQuery('');
            }}
            className="text-xs font-semibold text-emerald-400 hover:underline cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto px-[6%] py-6 flex flex-col gap-4 z-10 relative">
        {displayedMessages.map((msg) => {
          const isMe = msg.sender === 'me';
          return (
            <div
              key={msg.id}
              className={`max-w-[70%] min-w-[80px] p-3 rounded-2xl text-[14.2px] leading-relaxed shadow-sm relative break-words ${
                isMe 
                  ? 'bg-emerald-500/20 border border-emerald-500/30 self-end rounded-tr-none text-white' 
                  : 'bg-white/10 border border-white/10 self-start rounded-tl-none text-white'
              }`}
            >
              {/* Group message sender's name tag */}
              {!isMe && chat.isGroup && msg.senderName && (
                <p className="text-[11px] font-bold text-emerald-400 mb-1 select-none leading-none">
                  {msg.senderName}
                </p>
              )}

              {/* Message text content */}
              <p className="text-white/95 whitespace-pre-wrap">{msg.text}</p>

              {/* Time and Ticks Status footer */}
              <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-white/40 font-medium select-none">
                <span>{msg.time}</span>
                {isMe && (
                  msg.status === 'read' ? (
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                  ) : msg.status === 'delivered' ? (
                    <CheckCheck className="w-3.5 h-3.5 text-white/40 stroke-[2.5]" />
                  ) : (
                    <Check className="w-3.5 h-3.5 text-white/40 stroke-[2.5]" />
                  )
                )}
              </div>
            </div>
          );
        })}
        {chatSearchQuery && displayedMessages.length === 0 && (
          <div className="self-center bg-slate-900/90 border border-white/10 rounded-lg px-4 py-2 text-center text-xs text-white/50 max-w-xs mt-4">
            Nenhum resultado para "{chatSearchQuery}" nesta conversa.
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Interactive Emoji & Attachment overlays */}
      {showEmojiPicker && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setShowEmojiPicker(false)} />
          <div className="absolute bottom-[84px] left-6 bg-slate-900 border border-white/10 rounded-lg shadow-xl p-3 z-30 w-72 animate-in fade-in slide-in-from-bottom-2 duration-150 text-white">
            <p className="text-xs font-semibold text-white/40 mb-2 select-none">Emojis Frequentes</p>
            <div className="grid grid-cols-6 gap-2">
              {COMMON_EMOJIS.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => addEmoji(emoji)}
                  className="text-2xl p-1 hover:bg-white/10 rounded transition cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {showAttachmentMenu && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setShowAttachmentMenu(false)} />
          <div className="absolute bottom-[84px] left-16 bg-slate-900 border border-white/10 rounded-lg shadow-xl py-1 z-30 w-44 animate-in fade-in slide-in-from-bottom-2 duration-150 text-white">
            <button
              onClick={() => {
                onSendAttachment('image');
                setShowAttachmentMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 flex items-center gap-2.5 font-medium cursor-pointer"
            >
              <Image className="w-4 h-4 text-[#bf59ec]" />
              Fotos e Vídeos
            </button>
            <button
              onClick={() => {
                onSendAttachment('document');
                setShowAttachmentMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 flex items-center gap-2.5 font-medium cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#5157e0]" />
              Documento
            </button>
            <button
              onClick={() => {
                onSendAttachment('location');
                setShowAttachmentMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 flex items-center gap-2.5 font-medium cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-[#1a9c1a]" />
              Localização
            </button>
            <button
              onClick={() => {
                onSendAttachment('contact');
                setShowAttachmentMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 flex items-center gap-2.5 font-medium cursor-pointer"
            >
              <UserIcon className="w-4 h-4 text-[#0097e6]" />
              Contato
            </button>
          </div>
        </>
      )}

      {/* Bottom Text Input Field / Footer with premium Frosted aesthetic */}
      <div className="p-6 pt-2 bg-transparent border-t border-white/10 flex flex-col z-10 relative select-none">
        <div className="h-14 px-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
          <div className="flex items-center gap-1 text-white/60">
            <button
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowAttachmentMenu(false);
              }}
              className={`p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none cursor-pointer ${showEmojiPicker ? 'text-emerald-400' : ''}`}
              title="Emojis"
            >
              <Smile className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => {
                setShowAttachmentMenu(!showAttachmentMenu);
                setShowEmojiPicker(false);
              }}
              className={`p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none cursor-pointer ${showAttachmentMenu ? 'text-emerald-400' : ''}`}
              title="Anexar arquivo"
            >
              <Paperclip className="w-4 h-4 rotate-45" />
            </button>
          </div>

          {/* Input box */}
          <div className="flex-1 relative">
            <input
              id="chatInput"
              type="text"
              placeholder="Digite uma mensagem..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full bg-transparent border-none text-sm text-white placeholder-white/30 focus:outline-none focus:ring-0 p-0"
              autoComplete="off"
            />
          </div>

          {/* Right side microphone or paper plane */}
          <div className="flex items-center text-white/60">
            {inputText.trim() ? (
              <button
                onClick={handleSend}
                className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 transition-colors flex items-center justify-center text-slate-950 flex-shrink-0 cursor-pointer shadow-md"
                title="Enviar mensagem"
              >
                <Send className="w-4.5 h-4.5 fill-slate-950 stroke-[2.5]" />
              </button>
            ) : (
              <button
                onClick={() => alert('Gravação de Áudio: O microfone foi ativado para gravação simulada de áudio!')}
                className="p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none cursor-pointer text-white/60"
                title="Gravar áudio"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Group Information & Invite Modal */}
      {chat.isGroup && (
        <GroupInfoModal
          isOpen={showGroupInfo}
          onClose={() => setShowGroupInfo(false)}
          chat={chat}
          currentUser={currentUser}
          onRevokeInvite={onRevokeInvite}
        />
      )}
    </div>
  );
}
