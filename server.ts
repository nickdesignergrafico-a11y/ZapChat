import express from 'express';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'zapchat-super-secret-key-987654321';
const DATA_FILE = path.join(process.cwd(), 'data_store.json');

// Interface Definitions
interface DBUser {
  email: string;
  passwordHash: string;
  initial: string;
  avatarColor: string;
}

interface DBMessage {
  id: string;
  senderEmail: string;
  senderName?: string;
  text: string;
  time: string;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
}

interface DBChat {
  id: string;
  name: string;
  avatarColor: string;
  avatarLetter: string;
  isGroup: boolean;
  statusText: string;
  online: boolean;
  messages: DBMessage[];
  unreadCount: number;
  inviteCode?: string;
  createdBy?: string;
  members?: string[];
  description?: string;
  createdAt?: string;
}

interface DBStore {
  users: DBUser[];
  chats: DBChat[];
}

// Default chats to initialize with
const INITIAL_CHATS_SERVER: DBChat[] = [
  {
    id: 'grupo-projetos',
    name: 'Grupo de Projetos 🚀',
    avatarColor: '#128C7E',
    avatarLetter: 'GP',
    isGroup: true,
    statusText: 'Carlos, Letícia, Rodrigo, Você',
    online: true,
    unreadCount: 0,
    inviteCode: 'proj-zap2026',
    createdBy: 'carlos@gmail.com',
    members: ['carlos@gmail.com', 'leticia@gmail.com', 'rodrigo@gmail.com'],
    description: 'Grupo oficial de desenvolvimento e novidades do ZapChat.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    messages: [
      {
        id: 'p1',
        senderEmail: 'carlos@gmail.com',
        senderName: 'Carlos',
        text: 'Olá pessoal! Começando o sprint de desenvolvimento do ZapChat.',
        time: '10:25',
        timestamp: Date.now() - 30 * 60 * 1000,
        status: 'read'
      },
      {
        id: 'p2',
        senderEmail: 'leticia@gmail.com',
        senderName: 'Letícia',
        text: 'Design pronto! Ficou fantástico com as cores originais.',
        time: '10:27',
        timestamp: Date.now() - 28 * 60 * 1000,
        status: 'read'
      },
      {
        id: 'p3',
        senderEmail: 'system-demo@gmail.com',
        senderName: 'Você',
        text: 'Excelente. Vou finalizar os balões de mensagem e scroll automático.',
        time: '10:28',
        timestamp: Date.now() - 27 * 60 * 1000,
        status: 'read'
      },
      {
        id: 'p4',
        senderEmail: 'rodrigo@gmail.com',
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
    unreadCount: 0,
    messages: [
      {
        id: 'a1',
        senderEmail: 'amanda@gmail.com',
        senderName: 'Amanda Silva',
        text: 'Oi! Você viu os novos ícones do Lucide? Ficam bem limpos na barra lateral.',
        time: '09:15',
        timestamp: Date.now() - 105 * 60 * 1000,
        status: 'read'
      },
      {
        id: 'a2',
        senderEmail: 'system-demo@gmail.com',
        senderName: 'Você',
        text: 'Gostei bastante! Vou usar para as opções do cabeçalho.',
        time: '09:18',
        timestamp: Date.now() - 102 * 60 * 1000,
        status: 'read'
      },
      {
        id: 'a3',
        senderEmail: 'amanda@gmail.com',
        senderName: 'Amanda Silva',
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
        senderEmail: 'suporte@zapchat.com',
        senderName: 'Suporte ZapChat',
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
        senderEmail: 'mae@gmail.com',
        senderName: 'Mãe',
        text: 'Não se esqueçam do almoço de domingo na casa da avó!',
        time: 'Ontem',
        timestamp: Date.now() - 24 * 60 * 60 * 1000,
        status: 'read'
      },
      {
        id: 'f2',
        senderEmail: 'lucas@gmail.com',
        senderName: 'Lucas',
        text: 'Eu levo a sobremesa 🍰 Estava pensando em um pavê!',
        time: 'Ontem',
        timestamp: Date.now() - 23.9 * 60 * 60 * 1000,
        status: 'read'
      },
      {
        id: 'f3',
        senderEmail: 'system-demo@gmail.com',
        senderName: 'Você',
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
        senderEmail: 'marcos@gmail.com',
        senderName: 'Marcos Vinicius',
        text: 'Cara, a partida de futebol ainda tá de pé pra hoje às 20h?',
        time: 'Ontem',
        timestamp: Date.now() - 25 * 60 * 60 * 1000,
        status: 'read'
      },
      {
        id: 'm2',
        senderEmail: 'system-demo@gmail.com',
        senderName: 'Você',
        text: 'Sim! Já confirmei com o pessoal do clube e a quadra tá reservada.',
        time: 'Ontem',
        timestamp: Date.now() - 24.9 * 60 * 60 * 1000,
        status: 'read'
      }
    ]
  }
];

// In-Memory state loaded from file
let db: DBStore = {
  users: [],
  chats: INITIAL_CHATS_SERVER
};

// Load data store from JSON file on startup
function loadDB() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      db = {
        users: parsed.users || [],
        chats: parsed.chats || INITIAL_CHATS_SERVER
      };
      console.log('Database loaded successfully from file.');
    } else {
      saveDB();
      console.log('Database initialized and saved.');
    }
  } catch (err) {
    console.error('Failed to load database file, using in-memory fallback', err);
  }
}

// Save database state to JSON file
function saveDB() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database file', err);
  }
}

// Run DB loader
loadDB();

// Express server setup
async function startServer() {
  const app = express();
  
  app.use(express.json());

  // CORS headers for ease of preview in cross-origin situations
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // JWT auth verification middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token de autenticação ausente.' });
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ error: 'Token inválido ou expirado.' });
      }
      req.user = decoded;
      next();
    });
  };

  // --- AUTH ENDPOINTS ---

  // POST /api/auth/register
  app.post('/api/auth/register', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Formato de e-mail inválido.' });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 4 caracteres.' });
    }

    const emailNormalized = email.toLowerCase().trim();

    // Check if user already exists
    const userExists = db.users.some(u => u.email === emailNormalized);
    if (userExists) {
      return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    }

    // Hash password
    const passwordHash = bcrypt.hashSync(password, 10);
    const initial = emailNormalized.charAt(0).toUpperCase();

    const colors = [
      '#128C7E', '#34B7F1', '#E53935', '#D81B60', 
      '#8E24AA', '#5E35B1', '#3949AB', '#039BE5', 
      '#00ACC1', '#00897B', '#43A047', '#7CB342'
    ];
    const colorIndex = (initial.charCodeAt(0) || 0) % colors.length;
    const avatarColor = colors[colorIndex];

    const newUser: DBUser = {
      email: emailNormalized,
      passwordHash,
      initial,
      avatarColor
    };

    db.users.push(newUser);
    saveDB();

    // Generate JWT token
    const token = jwt.sign({ email: emailNormalized }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        email: emailNormalized,
        initial,
        avatarColor
      }
    });
  });

  // POST /api/auth/login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const emailNormalized = email.toLowerCase().trim();

    // Find user
    const user = db.users.find(u => u.email === emailNormalized);
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas. Verifique seu e-mail e senha.' });
    }

    // Verify password hash
    const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas. Verifique seu e-mail e senha.' });
    }

    // Generate JWT token
    const token = jwt.sign({ email: emailNormalized }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      token,
      user: {
        email: emailNormalized,
        initial: user.initial,
        avatarColor: user.avatarColor
      }
    });
  });

  // GET /api/auth/me
  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    const user = db.users.find(u => u.email === req.user.email);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    res.status(200).json({
      user: {
        email: user.email,
        initial: user.initial,
        avatarColor: user.avatarColor
      }
    });
  });

  // --- CHAT ENDPOINTS ---

  // POST /api/chats (create a new chat)
  app.post('/api/chats', (req: any, res) => {
    const { name, isGroup, userEmail, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'O nome da conversa é obrigatório.' });
    }

    const colors = ['#00a884', '#128C7E', '#3D85C6', '#8E7CC3', '#E69138', '#E06666'];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];
    
    const words = name.trim().split(' ');
    const avatarLetter = words.map((w: string) => w.charAt(0).toUpperCase()).slice(0, 2).join('');

    const senderEmail = userEmail || (req.user && req.user.email) || 'usuario@zapchat.com';
    const inviteCode = isGroup ? 'zap-' + Math.random().toString(36).substring(2, 8) : undefined;

    const newChat: DBChat = {
      id: 'chat-' + Date.now(),
      name: name.trim(),
      avatarColor,
      avatarLetter,
      isGroup: !!isGroup,
      statusText: isGroup ? '1 participante' : 'online',
      online: !isGroup,
      unreadCount: 0,
      inviteCode,
      createdBy: senderEmail,
      members: isGroup ? [senderEmail] : undefined,
      description: description || (isGroup ? 'Grupo criado no ZapChat' : undefined),
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: 'welcome-' + Date.now(),
          senderEmail: 'system-demo@gmail.com',
          senderName: 'Sistema',
          text: isGroup 
            ? `Você criou o grupo "${name}". Compartilhe o link de convite com seus contatos para que entrem!` 
            : `Nova conversa iniciada com ${name}. Envie uma mensagem!`,
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
          status: 'read'
        }
      ]
    };

    db.chats.unshift(newChat);
    saveDB();

    res.status(201).json(newChat);
  });

  // GET /api/invites/:inviteCode (fetch group preview by invite code)
  app.get('/api/invites/:inviteCode', (req, res) => {
    const { inviteCode } = req.params;
    const chat = db.chats.find(c => c.isGroup && c.inviteCode === inviteCode);

    if (!chat) {
      return res.status(404).json({ error: 'Link de convite inválido ou expirado.' });
    }

    res.status(200).json({
      id: chat.id,
      name: chat.name,
      avatarColor: chat.avatarColor,
      avatarLetter: chat.avatarLetter,
      description: chat.description || 'Grupo no ZapChat Web',
      memberCount: chat.members ? chat.members.length : 1,
      createdAt: chat.createdAt,
      createdBy: chat.createdBy
    });
  });

  // POST /api/invites/:inviteCode/join (join group via invite code)
  app.post('/api/invites/:inviteCode/join', (req: any, res) => {
    const { inviteCode } = req.params;
    const { userEmail } = req.body;

    const chat = db.chats.find(c => c.isGroup && c.inviteCode === inviteCode);
    if (!chat) {
      return res.status(404).json({ error: 'Link de convite inválido ou expirado.' });
    }

    const email = userEmail || (req.user && req.user.email) || 'usuario@zapchat.com';
    const userName = email.split('@')[0];

    if (!chat.members) {
      chat.members = [];
    }

    const alreadyMember = chat.members.includes(email);
    if (!alreadyMember) {
      chat.members.push(email);

      const joinMessage: DBMessage = {
        id: 'join-' + Date.now(),
        senderEmail: 'system-demo@gmail.com',
        senderName: 'Sistema',
        text: `🟢 ${userName} entrou no grupo usando o link de convite.`,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        status: 'read'
      };

      chat.messages.push(joinMessage);
      chat.statusText = `${chat.members.length} participantes`;
      saveDB();
    }

    res.status(200).json(chat);
  });

  // POST /api/chats/:chatId/revoke-invite (generate new invite code)
  app.post('/api/chats/:chatId/revoke-invite', (req: any, res) => {
    const { chatId } = req.params;
    const chat = db.chats.find(c => c.id === chatId);

    if (!chat || !chat.isGroup) {
      return res.status(404).json({ error: 'Grupo não encontrado.' });
    }

    chat.inviteCode = 'zap-' + Math.random().toString(36).substring(2, 8);
    saveDB();

    res.status(200).json({ 
      inviteCode: chat.inviteCode,
      message: 'Novo link de convite gerado com sucesso.' 
    });
  });

  // POST /api/chats/:chatId/messages (send a message)
  app.post('/api/chats/:chatId/messages', (req: any, res) => {
    const { chatId } = req.params;
    const { text, userEmail } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'O texto da mensagem é obrigatório.' });
    }

    const chat = db.chats.find(c => c.id === chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Conversa não encontrada.' });
    }

    const senderEmail = userEmail || (req.user && req.user.email) || 'usuario@zapchat.com';
    const senderName = senderEmail.split('@')[0];

    const newMessage: DBMessage = {
      id: 'msg-' + Date.now(),
      senderEmail,
      senderName,
      text,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      status: 'sent'
    };

    chat.messages.push(newMessage);
    saveDB();

    // Trigger auto-reply for simulation immediately
    triggerServerAutoReply(chatId, text, senderEmail);

    res.status(201).json(newMessage);
  });

  // GET /api/chats (returns all chats)
  app.get('/api/chats', (req, res) => {
    res.status(200).json(db.chats);
  });

  // GET /api/sync (polling sync endpoint across clients)
  app.get('/api/sync', (req, res) => {
    const since = parseInt(req.query.since as string) || 0;

    // Extract all messages created since `since` across all chats
    const newMessages: (DBMessage & { chatId: string })[] = [];
    
    db.chats.forEach(chat => {
      chat.messages.forEach(msg => {
        if (msg.timestamp > since) {
          newMessages.push({
            ...msg,
            chatId: chat.id
          });
        }
      });
    });

    res.status(200).json({
      messages: newMessages,
      chats: db.chats, // send all chats to ensure any newly added conversations or statuses are synced
      timestamp: Date.now()
    });
  });

  // Support-Bot server-side simulation
  function triggerServerAutoReply(chatId: string, userText: string, userEmail: string) {
    if (chatId !== 'suporte-zapchat' && chatId !== 'grupo-projetos' && chatId !== 'amanda-silva') return;

    const lowerText = userText.toLowerCase();

    setTimeout(() => {
      // Set status to typing in database
      const chat = db.chats.find(c => c.id === chatId);
      if (chat) {
        chat.statusText = 'digitando...';
        saveDB();
      }

      setTimeout(() => {
        let replyText = '';
        let senderEmail = 'suporte@zapchat.com';
        let senderName = 'Suporte ZapChat';

        if (chatId === 'suporte-zapchat') {
          if (lowerText.includes('ajuda') || lowerText.includes('como') || lowerText.includes('opcoes') || lowerText.includes('opções')) {
            replyText = 'Aqui estão as ações que você pode realizar no ZapChat:\n\n1. ➕ Adicionar novas conversas personalizadas clicando no ícone verde de "+" no topo.\n2. 📎 Enviar fotos, arquivos de áudio, mapas e contatos pelo menu de clipes no rodapé do chat.\n3. 🔍 Pesquisar termos específicos em mensagens do chat ativo usando a lupa do cabeçalho.\n4. 📱 Abra outra aba para testar a sincronização das mensagens em tempo real!';
          } else if (lowerText.includes('anexo') || lowerText.includes('clipe') || lowerText.includes('foto')) {
            replyText = 'Exato! Ao clicar no clipe 📎, você simula o envio de mídias estruturadas no balão de conversa.';
          } else {
            replyText = `Olá! Sou o Assistente Virtual ZapChat. 🤖\n\nEstou funcionando perfeitamente em React e Tailwind CSS!\n\n💡 Digite "ajuda" para ver um guia completo das funcionalidades que você pode simular por aqui.`;
          }
        } else if (chatId === 'grupo-projetos') {
          const members = [
            { email: 'carlos@gmail.com', name: 'Carlos' },
            { email: 'leticia@gmail.com', name: 'Letícia' },
            { email: 'rodrigo@gmail.com', name: 'Rodrigo' }
          ];
          const randomMember = members[Math.floor(Math.random() * members.length)];
          senderEmail = randomMember.email;
          senderName = randomMember.name;

          if (lowerText.includes('parabens') || lowerText.includes('parabéns') || lowerText.includes('show') || lowerText.includes('legal')) {
            replyText = 'Obrigado! Esse design ficou impecável mesmo.';
          } else {
            replyText = 'Muito bom! Vou continuar testando e atualizando as tarefas do sprint por aqui.';
          }
        } else if (chatId === 'amanda-silva') {
          senderEmail = 'amanda@gmail.com';
          senderName = 'Amanda Silva';
          if (lowerText.includes('oi') || lowerText.includes('ola') || lowerText.includes('olá')) {
            replyText = 'Oi! Tudo bem? Estou finalizando as novas diretrizes do design do projeto.';
          } else {
            replyText = 'Entendido! Qualquer novidade me dá um toque aqui.';
          }
        }

        const replyMessage: DBMessage = {
          id: 'reply-' + Date.now(),
          senderEmail,
          senderName,
          text: replyText,
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
          status: 'read'
        };

        const targetChat = db.chats.find(c => c.id === chatId);
        if (targetChat) {
          targetChat.messages.push(replyMessage);
          targetChat.statusText = targetChat.isGroup ? 'Carlos, Letícia, Rodrigo, Você' : 'online';
          saveDB();
        }
      }, 1800);
    }, 1000);
  }

  // Vite development middleware vs Static serving in Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ZapChat Backend] Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
}

startServer();
