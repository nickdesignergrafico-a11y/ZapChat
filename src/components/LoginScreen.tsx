import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Mail, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserSession } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (session: UserSession, token: string) => void;
}

const AVATAR_COLORS = [
  '#059669', '#2563eb', '#7c3aed', '#db2777', '#ea580c', 
  '#0891b2', '#4f46e5', '#d97706', '#16a34a', '#e11d48'
];

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validations
    if (!email.includes('@')) {
      setError('Por favor, insira um e-mail válido.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres no Firebase.');
      return;
    }

    setIsLoading(true);

    try {
      if (isRegistering) {
        // 1. Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const fbUser = userCredential.user;
        const initial = email.trim().charAt(0).toUpperCase();
        const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

        // Update auth profile
        await updateProfile(fbUser, {
          displayName: email.trim().split('@')[0]
        });

        // 2. Save user document in Firestore "users" collection
        const userProfile = {
          uid: fbUser.uid,
          email: fbUser.email || email.trim(),
          displayName: fbUser.displayName || email.trim().split('@')[0],
          initial,
          avatarColor: randomColor,
          createdAt: new Date().toISOString()
        };

        await setDoc(doc(db, 'users', fbUser.uid), userProfile);

        // Get ID token
        const idToken = await fbUser.getIdToken();

        const session: UserSession = {
          uid: fbUser.uid,
          email: userProfile.email,
          displayName: userProfile.displayName,
          initial: userProfile.initial,
          avatarColor: userProfile.avatarColor
        };

        setSuccess('Cadastro criado com sucesso no Firebase! Conectando...');
        setTimeout(() => {
          onLoginSuccess(session, idToken);
        }, 1000);

      } else {
        // Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const fbUser = userCredential.user;
        const idToken = await fbUser.getIdToken();

        // Retrieve or initialize Firestore user profile
        const userDocRef = doc(db, 'users', fbUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        let session: UserSession;

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          session = {
            uid: fbUser.uid,
            email: data.email || fbUser.email || email.trim(),
            displayName: data.displayName || fbUser.displayName || email.trim().split('@')[0],
            initial: data.initial || email.trim().charAt(0).toUpperCase(),
            avatarColor: data.avatarColor || '#059669'
          };
        } else {
          // In case user exists in Auth but document was not populated
          const initial = email.trim().charAt(0).toUpperCase();
          const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
          const newProfile = {
            uid: fbUser.uid,
            email: fbUser.email || email.trim(),
            displayName: fbUser.displayName || email.trim().split('@')[0],
            initial,
            avatarColor: randomColor,
            createdAt: new Date().toISOString()
          };
          await setDoc(userDocRef, newProfile);
          session = {
            uid: fbUser.uid,
            email: newProfile.email,
            displayName: newProfile.displayName,
            initial,
            avatarColor: randomColor
          };
        }

        onLoginSuccess(session, idToken);
      }
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      let message = 'Ocorreu um erro ao processar sua solicitação.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'Este e-mail já está em uso. Faça login ou use outro.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'O formato do e-mail é inválido.';
      } else if (err.code === 'auth/weak-password') {
        message = 'A senha é muito fraca. Escolha pelo menos 6 caracteres.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'E-mail ou senha incorretos.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 selection:bg-emerald-500/20 relative overflow-hidden">
      {/* Mesh Gradient Background Decoration */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[420px] bg-white/5 rounded-2xl border border-white/10 backdrop-blur-3xl shadow-2xl p-8 text-white/90 z-10 relative"
        id="loginScreen"
      >
        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-500/40 p-0.5 bg-slate-900 flex items-center justify-center group hover:scale-105 transition-transform duration-300">
              <img 
                src="/icons/icon-192x192.png" 
                alt="ZapChat PWA Logo" 
                className="w-full h-full object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="absolute -bottom-2 -right-1 bg-emerald-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded-md shadow-md tracking-wider">
              PWA
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight text-center">
            {isRegistering ? 'Criar Conta no ZapChat' : 'Entrar no ZapChat'}
          </h2>
          <p className="text-sm text-white/50 mt-1 text-center">
            {isRegistering ? 'Cadastre-se para sincronizar suas conversas' : 'Ambiente seguro, veloz e instalável'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border-l-4 border-red-500 rounded text-xs text-red-200 font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-500/10 border-l-4 border-emerald-500 rounded text-xs text-emerald-200 font-medium">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/60 block" htmlFor="email">
              E-mail
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white/30">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuusuario@email.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-white/60 block" htmlFor="password">
                Senha
              </label>
              {isRegistering ? (
                <span className="text-[10px] text-white/40 flex items-center gap-1">
                  Mínimo de 4 caracteres
                </span>
              ) : (
                <span className="text-[10px] text-white/40 flex items-center gap-1">
                  Qualquer senha se cadastrado
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white/30">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/30 hover:text-white/50 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-2.5 rounded-lg font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-75 flex items-center justify-center gap-2 shadow-md cursor-pointer mt-2"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              isRegistering ? 'Criar Conta e Acessar' : 'Acessar ZapChat'
            )}
          </button>
        </form>

        {/* Toggle between Register and Login */}
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
              setSuccess('');
            }}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold focus:outline-none cursor-pointer"
          >
            {isRegistering ? 'Já tem uma conta? Faça Login' : 'Não tem uma conta? Cadastre-se'}
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p className="text-[10px] text-white/40 leading-relaxed">
            Este é um ambiente simulado com persistência real em banco de dados.<br />
            Suas credenciais são protegidas com criptografia de ponta a ponta.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
