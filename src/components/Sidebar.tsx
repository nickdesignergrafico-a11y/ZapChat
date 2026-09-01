import React, { useState } from 'react';
import { 
  CircleDashed, 
  MessageSquare, 
  MoreVertical, 
  Search, 
  LogOut, 
  Plus, 
  X,
  User,
  Users,
  Download,
  Smartphone
} from 'lucide-react';
import { Chat, UserSession } from '../types';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  user: UserSession;
  onLogout: () => void;
  onAddNewChat: (name: string, isGroup: boolean) => void;
  onInstallPwa?: () => void;
  canInstall?: boolean;
}

export default function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  user,
  onLogout,
  onAddNewChat,
  onInstallPwa,
  canInstall
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showPwaInfoModal, setShowPwaInfoModal] = useState(false);

  // Filter chats by search term
  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChatName.trim()) {
      onAddNewChat(newChatName.trim(), isGroupChat);
      setNewChatName('');
      setIsGroupChat(false);
      setShowNewChatModal(false);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col h-full bg-slate-900/50 z-20 relative overflow-hidden">
      {/* Sidebar Header */}
      <div className="h-18 bg-white/[0.03] px-4 md:px-5 py-2 flex items-center justify-between border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* User profile picture */}
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shadow-sm relative group cursor-default"
            style={{ backgroundColor: user.avatarColor }}
            title={user.email}
          >
            {user.initial}
            {/* Soft border */}
            <div className="absolute inset-0 rounded-full border border-white/20"></div>
          </div>
          <div className="hidden sm:block">
            <p className="text-[10px] text-white/40 font-medium leading-tight">Conectado como</p>
            <p className="text-xs text-white/70 font-semibold truncate max-w-[130px]" title={user.email}>
              {user.email.split('@')[0]}
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 text-white/60">
          {/* PWA Install or Info Button */}
          <button 
            onClick={() => {
              if (onInstallPwa && canInstall) {
                onInstallPwa();
              } else {
                setShowPwaInfoModal(true);
              }
            }}
            className="p-2 hover:bg-emerald-500/20 text-emerald-400 rounded-full transition-colors duration-150 focus:outline-none cursor-pointer relative" 
            title="Instalar ZapChat App (PWA)"
          >
            <Download className="w-5 h-5" />
            {canInstall && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
            )}
          </button>

          <button 
            onClick={() => alert('ZapChat Status: Todos os sistemas operacionais e servidores sincronizados em tempo real!')}
            className="p-2 hover:bg-white/10 rounded-full transition-colors duration-150 focus:outline-none cursor-pointer" 
            title="Status"
          >
            <CircleDashed className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setShowNewChatModal(true)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors duration-150 focus:outline-none cursor-pointer" 
            title="Nova Conversa"
          >
            <Plus className="w-5 h-5 text-emerald-400 stroke-[2.5]" />
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors duration-150 focus:outline-none cursor-pointer" 
              title="Menu"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-1 w-52 bg-slate-900/95 border border-white/10 backdrop-blur-xl rounded-lg shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-white">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      if (onInstallPwa && canInstall) {
                        onInstallPwa();
                      } else {
                        setShowPwaInfoModal(true);
                      }
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-emerald-300 hover:bg-white/10 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    Instalar App (PWA)
                  </button>
                  <button
                    onClick={() => {
                      alert('ZapChat Web PWA v1.2.0 - Desenvolvido com React, Tailwind CSS e Service Worker.');
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-white/70 hover:bg-white/10 flex items-center gap-2 cursor-pointer"
                  >
                    Sobre o ZapChat
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Deseja realmente sair?')) {
                        onLogout();
                      }
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 border-t border-white/10 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair do App
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-transparent border-b border-white/10 flex-shrink-0">
        <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-3">
          <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
          <input
            type="text"
            placeholder="Pesquisar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-sm text-white placeholder-white/30 focus:ring-0 p-0"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="p-0.5 hover:bg-white/20 rounded-full cursor-pointer">
              <X className="w-3.5 h-3.5 text-white/60" />
            </button>
          )}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 p-3">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => {
            const hasMessages = chat.messages.length > 0;
            const lastMsg = hasMessages ? chat.messages[chat.messages.length - 1] : null;
            const isActive = chat.id === activeChatId;

            // Check if anyone is typing right now (simulated state)
            const isTyping = chat.statusText === 'digitando...';

            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-150 select-none ${
                  isActive 
                    ? 'bg-white/10 border border-white/10' 
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                {/* Avatar with potential Online Indicator */}
                <div 
                  className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white font-semibold text-lg relative shadow-inner"
                  style={{ backgroundColor: chat.avatarColor }}
                >
                  {chat.isGroup ? (
                    <Users className="w-5 h-5 text-white stroke-[2.5]" />
                  ) : (
                    <span>{chat.avatarLetter}</span>
                  )}
                  {chat.online && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" title="Online" />
                  )}
                </div>

                {/* Info block */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-medium text-[15px] truncate ${isActive ? 'text-white' : 'text-white/90'}`}>
                      {chat.name}
                    </span>
                    <span className="text-[10px] text-white/40 font-medium">
                      {lastMsg ? lastMsg.time : ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    {isTyping ? (
                      <span className="text-xs font-semibold text-emerald-400 animate-pulse">
                        digitando...
                      </span>
                    ) : (
                      <p className="text-xs text-white/50 truncate pr-2">
                        {lastMsg ? (
                          <>
                            {lastMsg.sender === 'me' && (
                              <span className="text-white/30 font-medium mr-1">Você:</span>
                            )}
                            {chat.isGroup && lastMsg.sender === 'them' && lastMsg.senderName && (
                              <span className="text-white/40 font-medium mr-1">{lastMsg.senderName}:</span>
                            )}
                            {lastMsg.text}
                          </>
                        ) : (
                          <span className="italic text-white/30 text-xs">Nenhuma mensagem</span>
                        )}
                      </p>
                    )}

                    {/* Unread message count badge */}
                    {chat.unreadCount > 0 && (
                      <span className="min-w-[20px] h-5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-full flex items-center justify-center px-1.5">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-white/40">
            <p className="text-sm font-medium">Nenhuma conversa encontrada</p>
            <p className="text-xs mt-1">Experimente buscar por outros termos</p>
          </div>
        )}
      </div>

      {/* Custom modal in absolute sidebar overlay to create chat */}
      {showNewChatModal && (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md flex flex-col justify-end z-50">
          <div className="bg-slate-900 border-t border-white/10 p-5 rounded-t-2xl shadow-xl animate-in slide-in-from-bottom duration-200 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-lg">Começar nova conversa</h3>
              <button 
                onClick={() => setShowNewChatModal(false)}
                className="p-1 hover:bg-white/10 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <form onSubmit={handleCreateChatSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-white/50 block mb-1">
                  Nome do contato ou grupo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Lucas Henrique, Plantas, etc."
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                  maxLength={30}
                />
              </div>

              {/* Toggle group chat */}
              <div className="flex items-center gap-3 py-1">
                <input
                  type="checkbox"
                  id="isGroup"
                  checked={isGroupChat}
                  onChange={(e) => setIsGroupChat(e.target.checked)}
                  className="w-4 h-4 text-emerald-400 bg-white/5 border-white/10 rounded focus:ring-emerald-500/50"
                />
                <label htmlFor="isGroup" className="text-sm font-medium text-white/70 cursor-pointer">
                  Criar como Grupo de Conversa
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  className="flex-1 border border-white/10 rounded-lg py-2 text-sm font-medium text-white/70 hover:bg-white/5 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg py-2 text-sm font-bold shadow-sm cursor-pointer"
                >
                  Criar Conversa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PWA Installation Info Modal */}
      {showPwaInfoModal && (
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md flex flex-col justify-center items-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/15 p-6 rounded-2xl shadow-2xl max-w-sm w-full text-white text-center relative">
            <button 
              onClick={() => setShowPwaInfoModal(false)}
              className="absolute top-3 right-3 p-1.5 hover:bg-white/10 rounded-full text-white/50 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-500/40 p-0.5 bg-slate-950 flex items-center justify-center">
              <img 
                src="/icons/icon-192x192.png" 
                alt="ZapChat Icon" 
                className="w-full h-full object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>

            <h3 className="text-lg font-bold text-white mb-1">Instalar ZapChat PWA</h3>
            <p className="text-xs text-white/60 mb-5 leading-relaxed">
              Instale o ZapChat diretamente na tela de início do seu celular ou no computador para acesso rápido em tela cheia e offline.
            </p>

            <div className="space-y-2.5 text-left text-xs bg-white/5 p-3.5 rounded-xl border border-white/10 mb-5">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">1</span>
                <p className="text-white/80">No Chrome/Edge: Clique no ícone de <strong>Instalar</strong> na barra de endereços ou no menu <strong>⋮</strong></p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">2</span>
                <p className="text-white/80">No iOS Safari: Toque em <strong>Compartilhar</strong> e selecione <strong>Adicionar à Tela de Início</strong></p>
              </div>
            </div>

            <button
              onClick={() => setShowPwaInfoModal(false)}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-lg text-sm transition-colors cursor-pointer shadow-md"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
