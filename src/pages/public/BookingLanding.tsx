import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';

export const BookingLanding: React.FC = () => {
    const navigate = useNavigate();
    const [agencyCode, setAgencyCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePrivateClick = () => {
        navigate('/book/private');
    };

    const handleAgencySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data: agency } = await supabase
                .from('agencies')
                .select('code')
                .eq('code', agencyCode.trim())
                .eq('is_active', true)
                .single();

            if (agency) {
                navigate(`/book/agency?code=${agency.code}`);
            } else {
                setError('Código de agência inválido. Por favor verifique e tente novamente.');
            }
        } catch (error) {
            setError('Código de agência inválido. Por favor verifique e tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Bem-vindo à NaturisNor</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">Selecione o tipo de reserva que deseja efetuar.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Private Client Card */}
                <div
                    onClick={handlePrivateClick}
                    className="group relative bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-primary/50 transition-all cursor-pointer flex flex-col items-center text-center gap-6"
                >
                    <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <span className="material-symbols-outlined text-4xl text-blue-600 dark:text-blue-400">person</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Cliente Particular</h2>
                        <p className="text-gray-500 dark:text-gray-400">Para reservas individuais, famílias ou grupos de amigos.</p>
                    </div>
                    <button className="mt-auto px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-lg group-hover:bg-primary group-hover:text-white transition-colors w-full">
                        Reservar Agora
                    </button>
                </div>

                {/* Agency Card */}
                <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-2xl p-8 shadow-sm flex flex-col items-center text-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-purple-600 dark:text-purple-400">storefront</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Agência / Parceiro</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Área exclusiva para parceiros registados.</p>

                        <form onSubmit={handleAgencySubmit} className="w-full">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Insira o Código da Agência"
                                    value={agencyCode}
                                    onChange={(e) => {
                                        setAgencyCode(e.target.value);
                                        setError('');
                                    }}
                                    className={`w-full px-4 py-3 rounded-lg border ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'} bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-white outline-none focus:ring-2 transition-all`}
                                    disabled={loading}
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1.5 p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors disabled:opacity-50"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        <span className="material-symbols-outlined text-xl">arrow_forward</span>
                                    )}
                                </button>
                            </div>
                            {error && <p className="text-red-500 text-xs mt-2 text-left">{error}</p>}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
