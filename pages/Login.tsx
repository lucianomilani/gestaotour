import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await login(email);
            navigate('/');
        } catch (err: any) {
            setError('Falha ao iniciar sessão. Verifique as suas credenciais.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4 font-display">
            <div className="w-full max-w-md bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-2xl shadow-xl overflow-hidden animate-fade-in">

                {/* Header / Logo Area */}
                <div className="p-8 text-center border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-black/20">
                    <div
                        className="mx-auto bg-center bg-no-repeat bg-cover rounded-full size-16 shadow-lg border-2 border-primary/20 mb-4"
                        style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBZkiVga_83D8i9DdG9zNzl-rZdFbqy7E7GwXh6TtB6GqbwHkMXWzAlFDUCjD4cqR8bN0ehLkitfSXui7DrtqfJ4evbG-HwfLuPujFx_i69nOXhDbS77kL-R2QUtLiVt1zeE68V2oQe4koRsrriSt5YhWeNSjT6KFZqrD0f6H148uCbD_5Sz7W7OyiNYFiecSpoCpXdIltAYG9JzFWKq3UUfKTZDgbl0PIORDXVn_symKXxEHy21UPGWyMD5_qMMR1IOJa-GSIeDL4")' }}
                    ></div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bem-vindo de volta</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Acesse ao painel de gestão Naturisnor</p>
                </div>

                {/* Form Area */}
                <div className="p-8">
                    <form onSubmit={handleLogin} className="flex flex-col gap-5">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-300 text-sm font-medium flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">error</span>
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Email</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#102215] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder="seu.email@naturisnor.com"
                                />
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">mail</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                                <div className="flex justify-between items-center">
                                    <span>Password</span>
                                    <a href="#" className="text-primary hover:text-primary-dark normal-case font-medium transition-colors">Esqueceu-se?</a>
                                </div>
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#102215] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                />
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">lock</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 w-full bg-primary hover:bg-primary-dark text-background-dark font-bold py-3 rounded-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-background-dark border-t-transparent rounded-full animate-spin"></span>
                                    A entrar...
                                </>
                            ) : (
                                <>
                                    <span>Entrar</span>
                                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            &copy; 2024 Naturisnor. Todos os direitos reservados.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};