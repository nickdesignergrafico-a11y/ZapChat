import { Chat } from './types';

export const INITIAL_CHATS: Chat[] = [
  {
    id: 'grupo-projetos',
    name: 'Grupo de Projetos 🚀',
    avatarColor: '#128C7E',
    avatarLetter: 'GP',
    isGroup: true,
    statusText: 'Carlos, Letícia, Rodrigo, Você',
    online: true,
    unreadCount: 0,
    messages: [
      {
        id: 'p1',
        sender: 'them',
        senderName: 'Carlos',
        text: 'Olá pessoal! Começando o sprint de desenvolvimento do ZapChat.',
        time: '10:25',
        timestamp: Date.now() - 30 * 60 * 1000,
        status: 'read'
      },
      {
        id: 'p2',
        sender: 'them',
        senderName: 'Letícia',
        text: 'Design pronto! Ficou fantástico com as cores originais.',
        time: '10:27',
        timestamp: Date.now() - 28 * 60 * 1000,
        status: 'read'
      },
      {
        id: 'p3',
        sender: 'me',
        text: 'Excelente. Vou finalizar os balões de mensagem e scroll automático.',
        time: '10:28',
        timestamp: Date.now() - 27 * 60 * 1000,
        status: 'read'
      },
      {
        id: 'p4',
        sender: 'them',
        senderName: 'Rodrigo',
        text: 'Interface criada com sucesso!',
        time: '10:30',
        timestamp: Date.now() - 25 * 60 * 1000,
        status: 'read'
      }
    ]
  },
  {
    id: 'amanda-silva',
    name: 'Amanda Silva',
    avatarColor: '#E06666',
    avatarLetter: 'AS',
    isGroup: false,
    statusText: 'online',
    online: true,
    unreadCount: 1,
    messages: [
      {
        id: 'a1',
        sender: 'them',
        text: 'Oi! Você viu os novos ícones do Lucide? Ficam bem limpos na barra lateral.',
        time: '09:15',
        timestamp: Date.now() - 105 * 60 * 1000,
        status: 'read'
      },
      {
        id: 'a2',
        sender: 'me',
        text: 'Gostei bastante! Vou usar para as opções do cabeçalho.',
        time: '09:18',
        timestamp: Date.now() - 102 * 60 * 1000,
        status: 'read'
      },
      {
        id: 'a3',
        sender: 'them',
        text: 'Ótimo. Qualquer alteração no layout me avisa!',
        time: '09:20',
        timestamp: Date.now() - 100 * 60 * 1000,
        status: 'read'
      }
    ]
  },
  {
    id: 'suporte-zapchat',
    name: 'Suporte ZapChat (Assistente)',
    avatarColor: '#3D85C6',
    avatarLetter: 'S',
    isGroup: false,
    statusText: 'Assistente Virtual',
    online: true,
    unreadCount: 0,
    messages: [
      {
        id: 's1',
        sender: 'them',
        text: 'Olá! Sou o assistente virtual do ZapChat. Digite qualquer mensagem para testar as respostas automáticas!',
        time: '08:00',
        timestamp: Date.now() - 180 * 60 * 1000,
        status: 'read'
      }
    ]
  },
  {
    id: 'familia',
    name: 'Família Carvalho ❤️',
    avatarColor: '#E69138',
    avatarLetter: 'FC',
    isGroup: true,
    statusText: 'Mãe, Lucas, Você',
    online: false,
    unreadCount: 0,
    messages: [
      {
        id: 'f1',
        sender: 'them',
        senderName: 'Mãe',
        text: 'Não se esqueçam do almoço de domingo na casa da avó!',
        time: 'Ontem',
        timestamp: Date.now() - 24 * 60 * 60 * 1000,
        status: 'read'
      },
      {
        id: 'f2',
        sender: 'them',
        senderName: 'Lucas',
        text: 'Eu levo a sobremesa 🍰 Estava pensando em um pavê!',
        time: 'Ontem',
        timestamp: Date.now() - 23.9 * 60 * 60 * 1000,
        status: 'read'
      },
      {
        id: 'f3',
        sender: 'me',
        text: 'Confirmadíssimo! Contem comigo e com a fome haha.',
        time: 'Ontem',
        timestamp: Date.now() - 23.8 * 60 * 60 * 1000,
        status: 'read'
      }
    ]
  },
  {
    id: 'marcos-vinicius',
    name: 'Marcos Vinicius',
    avatarColor: '#8E7CC3',
    avatarLetter: 'MV',
    isGroup: false,
    statusText: 'visto por último hoje às 07:15',
    online: false,
    unreadCount: 0,
    messages: [
      {
        id: 'm1',
        sender: 'them',
        text: 'Cara, a partida de futebol ainda tá de pé pra hoje às 20h?',
        time: 'Ontem',
        timestamp: Date.now() - 25 * 60 * 60 * 1000,
        status: 'read'
      },
      {
        id: 'm2',
        sender: 'me',
        text: 'Sim! Já confirmei com o pessoal do clube e a quadra tá reservada.',
        time: 'Ontem',
        timestamp: Date.now() - 24.9 * 60 * 60 * 1000,
        status: 'read'
      }
    ]
  }
];
