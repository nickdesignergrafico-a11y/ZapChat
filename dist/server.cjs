var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_vite = require("vite");
var PORT = 3e3;
var JWT_SECRET = process.env.JWT_SECRET || "zapchat-super-secret-key-987654321";
var DATA_FILE = import_path.default.join(process.cwd(), "data_store.json");
var INITIAL_CHATS_SERVER = [
  {
    id: "grupo-projetos",
    name: "Grupo de Projetos \u{1F680}",
    avatarColor: "#128C7E",
    avatarLetter: "GP",
    isGroup: true,
    statusText: "Carlos, Let\xEDcia, Rodrigo, Voc\xEA",
    online: true,
    unreadCount: 0,
    inviteCode: "proj-zap2026",
    createdBy: "carlos@gmail.com",
    members: ["carlos@gmail.com", "leticia@gmail.com", "rodrigo@gmail.com"],
    description: "Grupo oficial de desenvolvimento e novidades do ZapChat.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString(),
    messages: [
      {
        id: "p1",
        senderEmail: "carlos@gmail.com",
        senderName: "Carlos",
        text: "Ol\xE1 pessoal! Come\xE7ando o sprint de desenvolvimento do ZapChat.",
        time: "10:25",
        timestamp: Date.now() - 30 * 60 * 1e3,
        status: "read"
      },
      {
        id: "p2",
        senderEmail: "leticia@gmail.com",
        senderName: "Let\xEDcia",
        text: "Design pronto! Ficou fant\xE1stico com as cores originais.",
        time: "10:27",
        timestamp: Date.now() - 28 * 60 * 1e3,
        status: "read"
      },
      {
        id: "p3",
        senderEmail: "system-demo@gmail.com",
        senderName: "Voc\xEA",
        text: "Excelente. Vou finalizar os bal\xF5es de mensagem e scroll autom\xE1tico.",
        time: "10:28",
        timestamp: Date.now() - 27 * 60 * 1e3,
        status: "read"
      },
      {
        id: "p4",
        senderEmail: "rodrigo@gmail.com",
        senderName: "Rodrigo",
        text: "Interface criada com sucesso!",
        time: "10:30",
        timestamp: Date.now() - 25 * 60 * 1e3,
        status: "read"
      }
    ]
  },
  {
    id: "amanda-silva",
    name: "Amanda Silva",
    avatarColor: "#E06666",
    avatarLetter: "AS",
    isGroup: false,
    statusText: "online",
    online: true,
    unreadCount: 0,
    messages: [
      {
        id: "a1",
        senderEmail: "amanda@gmail.com",
        senderName: "Amanda Silva",
        text: "Oi! Voc\xEA viu os novos \xEDcones do Lucide? Ficam bem limpos na barra lateral.",
        time: "09:15",
        timestamp: Date.now() - 105 * 60 * 1e3,
        status: "read"
      },
      {
        id: "a2",
        senderEmail: "system-demo@gmail.com",
        senderName: "Voc\xEA",
        text: "Gostei bastante! Vou usar para as op\xE7\xF5es do cabe\xE7alho.",
        time: "09:18",
        timestamp: Date.now() - 102 * 60 * 1e3,
        status: "read"
      },
      {
        id: "a3",
        senderEmail: "amanda@gmail.com",
        senderName: "Amanda Silva",
        text: "\xD3timo. Qualquer altera\xE7\xE3o no layout me avisa!",
        time: "09:20",
        timestamp: Date.now() - 100 * 60 * 1e3,
        status: "read"
      }
    ]
  },
  {
    id: "suporte-zapchat",
    name: "Suporte ZapChat (Assistente)",
    avatarColor: "#3D85C6",
    avatarLetter: "S",
    isGroup: false,
    statusText: "Assistente Virtual",
    online: true,
    unreadCount: 0,
    messages: [
      {
        id: "s1",
        senderEmail: "suporte@zapchat.com",
        senderName: "Suporte ZapChat",
        text: "Ol\xE1! Sou o assistente virtual do ZapChat. Digite qualquer mensagem para testar as respostas autom\xE1ticas!",
        time: "08:00",
        timestamp: Date.now() - 180 * 60 * 1e3,
        status: "read"
      }
    ]
  },
  {
    id: "familia",
    name: "Fam\xEDlia Carvalho \u2764\uFE0F",
    avatarColor: "#E69138",
    avatarLetter: "FC",
    isGroup: true,
    statusText: "M\xE3e, Lucas, Voc\xEA",
    online: false,
    unreadCount: 0,
    messages: [
      {
        id: "f1",
        senderEmail: "mae@gmail.com",
        senderName: "M\xE3e",
        text: "N\xE3o se esque\xE7am do almo\xE7o de domingo na casa da av\xF3!",
        time: "Ontem",
        timestamp: Date.now() - 24 * 60 * 60 * 1e3,
        status: "read"
      },
      {
        id: "f2",
        senderEmail: "lucas@gmail.com",
        senderName: "Lucas",
        text: "Eu levo a sobremesa \u{1F370} Estava pensando em um pav\xEA!",
        time: "Ontem",
        timestamp: Date.now() - 23.9 * 60 * 60 * 1e3,
        status: "read"
      },
      {
        id: "f3",
        senderEmail: "system-demo@gmail.com",
        senderName: "Voc\xEA",
        text: "Confirmad\xEDssimo! Contem comigo e com a fome haha.",
        time: "Ontem",
        timestamp: Date.now() - 23.8 * 60 * 60 * 1e3,
        status: "read"
      }
    ]
  },
  {
    id: "marcos-vinicius",
    name: "Marcos Vinicius",
    avatarColor: "#8E7CC3",
    avatarLetter: "MV",
    isGroup: false,
    statusText: "visto por \xFAltimo hoje \xE0s 07:15",
    online: false,
    unreadCount: 0,
    messages: [
      {
        id: "m1",
        senderEmail: "marcos@gmail.com",
        senderName: "Marcos Vinicius",
        text: "Cara, a partida de futebol ainda t\xE1 de p\xE9 pra hoje \xE0s 20h?",
        time: "Ontem",
        timestamp: Date.now() - 25 * 60 * 60 * 1e3,
        status: "read"
      },
      {
        id: "m2",
        senderEmail: "system-demo@gmail.com",
        senderName: "Voc\xEA",
        text: "Sim! J\xE1 confirmei com o pessoal do clube e a quadra t\xE1 reservada.",
        time: "Ontem",
        timestamp: Date.now() - 24.9 * 60 * 60 * 1e3,
        status: "read"
      }
    ]
  }
];
var db = {
  users: [],
  chats: INITIAL_CHATS_SERVER
};
function loadDB() {
  try {
    if (import_fs.default.existsSync(DATA_FILE)) {
      const data = import_fs.default.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(data);
      db = {
        users: parsed.users || [],
        chats: parsed.chats || INITIAL_CHATS_SERVER
      };
      console.log("Database loaded successfully from file.");
    } else {
      saveDB();
      console.log("Database initialized and saved.");
    }
  } catch (err) {
    console.error("Failed to load database file, using in-memory fallback", err);
  }
}
function saveDB() {
  try {
    import_fs.default.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save database file", err);
  }
}
loadDB();
async function startServer() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json());
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Token de autentica\xE7\xE3o ausente." });
    }
    import_jsonwebtoken.default.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: "Token inv\xE1lido ou expirado." });
      }
      req.user = decoded;
      next();
    });
  };
  app.post("/api/auth/register", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "E-mail e senha s\xE3o obrigat\xF3rios." });
    }
    if (!email.includes("@")) {
      return res.status(400).json({ error: "Formato de e-mail inv\xE1lido." });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: "A senha deve ter pelo menos 4 caracteres." });
    }
    const emailNormalized = email.toLowerCase().trim();
    const userExists = db.users.some((u) => u.email === emailNormalized);
    if (userExists) {
      return res.status(409).json({ error: "Este e-mail j\xE1 est\xE1 cadastrado." });
    }
    const passwordHash = import_bcryptjs.default.hashSync(password, 10);
    const initial = emailNormalized.charAt(0).toUpperCase();
    const colors = [
      "#128C7E",
      "#34B7F1",
      "#E53935",
      "#D81B60",
      "#8E24AA",
      "#5E35B1",
      "#3949AB",
      "#039BE5",
      "#00ACC1",
      "#00897B",
      "#43A047",
      "#7CB342"
    ];
    const colorIndex = (initial.charCodeAt(0) || 0) % colors.length;
    const avatarColor = colors[colorIndex];
    const newUser = {
      email: emailNormalized,
      passwordHash,
      initial,
      avatarColor
    };
    db.users.push(newUser);
    saveDB();
    const token = import_jsonwebtoken.default.sign({ email: emailNormalized }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({
      token,
      user: {
        email: emailNormalized,
        initial,
        avatarColor
      }
    });
  });
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "E-mail e senha s\xE3o obrigat\xF3rios." });
    }
    const emailNormalized = email.toLowerCase().trim();
    const user = db.users.find((u) => u.email === emailNormalized);
    if (!user) {
      return res.status(401).json({ error: "Credenciais inv\xE1lidas. Verifique seu e-mail e senha." });
    }
    const isPasswordValid = import_bcryptjs.default.compareSync(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Credenciais inv\xE1lidas. Verifique seu e-mail e senha." });
    }
    const token = import_jsonwebtoken.default.sign({ email: emailNormalized }, JWT_SECRET, { expiresIn: "7d" });
    res.status(200).json({
      token,
      user: {
        email: emailNormalized,
        initial: user.initial,
        avatarColor: user.avatarColor
      }
    });
  });
  app.get("/api/auth/me", authenticateToken, (req, res) => {
    const user = db.users.find((u) => u.email === req.user.email);
    if (!user) {
      return res.status(404).json({ error: "Usu\xE1rio n\xE3o encontrado." });
    }
    res.status(200).json({
      user: {
        email: user.email,
        initial: user.initial,
        avatarColor: user.avatarColor
      }
    });
  });
  app.post("/api/chats", (req, res) => {
    const { name, isGroup, userEmail, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: "O nome da conversa \xE9 obrigat\xF3rio." });
    }
    const colors = ["#00a884", "#128C7E", "#3D85C6", "#8E7CC3", "#E69138", "#E06666"];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];
    const words = name.trim().split(" ");
    const avatarLetter = words.map((w) => w.charAt(0).toUpperCase()).slice(0, 2).join("");
    const senderEmail = userEmail || req.user && req.user.email || "usuario@zapchat.com";
    const inviteCode = isGroup ? "zap-" + Math.random().toString(36).substring(2, 8) : void 0;
    const newChat = {
      id: "chat-" + Date.now(),
      name: name.trim(),
      avatarColor,
      avatarLetter,
      isGroup: !!isGroup,
      statusText: isGroup ? "1 participante" : "online",
      online: !isGroup,
      unreadCount: 0,
      inviteCode,
      createdBy: senderEmail,
      members: isGroup ? [senderEmail] : void 0,
      description: description || (isGroup ? "Grupo criado no ZapChat" : void 0),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      messages: [
        {
          id: "welcome-" + Date.now(),
          senderEmail: "system-demo@gmail.com",
          senderName: "Sistema",
          text: isGroup ? `Voc\xEA criou o grupo "${name}". Compartilhe o link de convite com seus contatos para que entrem!` : `Nova conversa iniciada com ${name}. Envie uma mensagem!`,
          time: (/* @__PURE__ */ new Date()).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          timestamp: Date.now(),
          status: "read"
        }
      ]
    };
    db.chats.unshift(newChat);
    saveDB();
    res.status(201).json(newChat);
  });
  app.get("/api/invites/:inviteCode", (req, res) => {
    const { inviteCode } = req.params;
    const chat = db.chats.find((c) => c.isGroup && c.inviteCode === inviteCode);
    if (!chat) {
      return res.status(404).json({ error: "Link de convite inv\xE1lido ou expirado." });
    }
    res.status(200).json({
      id: chat.id,
      name: chat.name,
      avatarColor: chat.avatarColor,
      avatarLetter: chat.avatarLetter,
      description: chat.description || "Grupo no ZapChat Web",
      memberCount: chat.members ? chat.members.length : 1,
      createdAt: chat.createdAt,
      createdBy: chat.createdBy
    });
  });
  app.post("/api/invites/:inviteCode/join", (req, res) => {
    const { inviteCode } = req.params;
    const { userEmail } = req.body;
    const chat = db.chats.find((c) => c.isGroup && c.inviteCode === inviteCode);
    if (!chat) {
      return res.status(404).json({ error: "Link de convite inv\xE1lido ou expirado." });
    }
    const email = userEmail || req.user && req.user.email || "usuario@zapchat.com";
    const userName = email.split("@")[0];
    if (!chat.members) {
      chat.members = [];
    }
    const alreadyMember = chat.members.includes(email);
    if (!alreadyMember) {
      chat.members.push(email);
      const joinMessage = {
        id: "join-" + Date.now(),
        senderEmail: "system-demo@gmail.com",
        senderName: "Sistema",
        text: `\u{1F7E2} ${userName} entrou no grupo usando o link de convite.`,
        time: (/* @__PURE__ */ new Date()).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        timestamp: Date.now(),
        status: "read"
      };
      chat.messages.push(joinMessage);
      chat.statusText = `${chat.members.length} participantes`;
      saveDB();
    }
    res.status(200).json(chat);
  });
  app.post("/api/chats/:chatId/revoke-invite", (req, res) => {
    const { chatId } = req.params;
    const chat = db.chats.find((c) => c.id === chatId);
    if (!chat || !chat.isGroup) {
      return res.status(404).json({ error: "Grupo n\xE3o encontrado." });
    }
    chat.inviteCode = "zap-" + Math.random().toString(36).substring(2, 8);
    saveDB();
    res.status(200).json({
      inviteCode: chat.inviteCode,
      message: "Novo link de convite gerado com sucesso."
    });
  });
  app.post("/api/chats/:chatId/messages", (req, res) => {
    const { chatId } = req.params;
    const { text, userEmail } = req.body;
    if (!text) {
      return res.status(400).json({ error: "O texto da mensagem \xE9 obrigat\xF3rio." });
    }
    const chat = db.chats.find((c) => c.id === chatId);
    if (!chat) {
      return res.status(404).json({ error: "Conversa n\xE3o encontrada." });
    }
    const senderEmail = userEmail || req.user && req.user.email || "usuario@zapchat.com";
    const senderName = senderEmail.split("@")[0];
    const newMessage = {
      id: "msg-" + Date.now(),
      senderEmail,
      senderName,
      text,
      time: (/* @__PURE__ */ new Date()).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      timestamp: Date.now(),
      status: "sent"
    };
    chat.messages.push(newMessage);
    saveDB();
    triggerServerAutoReply(chatId, text, senderEmail);
    res.status(201).json(newMessage);
  });
  app.get("/api/chats", (req, res) => {
    res.status(200).json(db.chats);
  });
  app.get("/api/sync", (req, res) => {
    const since = parseInt(req.query.since) || 0;
    const newMessages = [];
    db.chats.forEach((chat) => {
      chat.messages.forEach((msg) => {
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
      chats: db.chats,
      // send all chats to ensure any newly added conversations or statuses are synced
      timestamp: Date.now()
    });
  });
  function triggerServerAutoReply(chatId, userText, userEmail) {
    if (chatId !== "suporte-zapchat" && chatId !== "grupo-projetos" && chatId !== "amanda-silva") return;
    const lowerText = userText.toLowerCase();
    setTimeout(() => {
      const chat = db.chats.find((c) => c.id === chatId);
      if (chat) {
        chat.statusText = "digitando...";
        saveDB();
      }
      setTimeout(() => {
        let replyText = "";
        let senderEmail = "suporte@zapchat.com";
        let senderName = "Suporte ZapChat";
        if (chatId === "suporte-zapchat") {
          if (lowerText.includes("ajuda") || lowerText.includes("como") || lowerText.includes("opcoes") || lowerText.includes("op\xE7\xF5es")) {
            replyText = 'Aqui est\xE3o as a\xE7\xF5es que voc\xEA pode realizar no ZapChat:\n\n1. \u2795 Adicionar novas conversas personalizadas clicando no \xEDcone verde de "+" no topo.\n2. \u{1F4CE} Enviar fotos, arquivos de \xE1udio, mapas e contatos pelo menu de clipes no rodap\xE9 do chat.\n3. \u{1F50D} Pesquisar termos espec\xEDficos em mensagens do chat ativo usando a lupa do cabe\xE7alho.\n4. \u{1F4F1} Abra outra aba para testar a sincroniza\xE7\xE3o das mensagens em tempo real!';
          } else if (lowerText.includes("anexo") || lowerText.includes("clipe") || lowerText.includes("foto")) {
            replyText = "Exato! Ao clicar no clipe \u{1F4CE}, voc\xEA simula o envio de m\xEDdias estruturadas no bal\xE3o de conversa.";
          } else {
            replyText = `Ol\xE1! Sou o Assistente Virtual ZapChat. \u{1F916}

Estou funcionando perfeitamente em React e Tailwind CSS!

\u{1F4A1} Digite "ajuda" para ver um guia completo das funcionalidades que voc\xEA pode simular por aqui.`;
          }
        } else if (chatId === "grupo-projetos") {
          const members = [
            { email: "carlos@gmail.com", name: "Carlos" },
            { email: "leticia@gmail.com", name: "Let\xEDcia" },
            { email: "rodrigo@gmail.com", name: "Rodrigo" }
          ];
          const randomMember = members[Math.floor(Math.random() * members.length)];
          senderEmail = randomMember.email;
          senderName = randomMember.name;
          if (lowerText.includes("parabens") || lowerText.includes("parab\xE9ns") || lowerText.includes("show") || lowerText.includes("legal")) {
            replyText = "Obrigado! Esse design ficou impec\xE1vel mesmo.";
          } else {
            replyText = "Muito bom! Vou continuar testando e atualizando as tarefas do sprint por aqui.";
          }
        } else if (chatId === "amanda-silva") {
          senderEmail = "amanda@gmail.com";
          senderName = "Amanda Silva";
          if (lowerText.includes("oi") || lowerText.includes("ola") || lowerText.includes("ol\xE1")) {
            replyText = "Oi! Tudo bem? Estou finalizando as novas diretrizes do design do projeto.";
          } else {
            replyText = "Entendido! Qualquer novidade me d\xE1 um toque aqui.";
          }
        }
        const replyMessage = {
          id: "reply-" + Date.now(),
          senderEmail,
          senderName,
          text: replyText,
          time: (/* @__PURE__ */ new Date()).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          timestamp: Date.now(),
          status: "read"
        };
        const targetChat = db.chats.find((c) => c.id === chatId);
        if (targetChat) {
          targetChat.messages.push(replyMessage);
          targetChat.statusText = targetChat.isGroup ? "Carlos, Let\xEDcia, Rodrigo, Voc\xEA" : "online";
          saveDB();
        }
      }, 1800);
    }, 1e3);
  }
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ZapChat Backend] Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode.`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
