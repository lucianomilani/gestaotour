import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

export const BookingDetails: React.FC = () => {
  const { id } = useParams();

  // Mock data reflecting the spreadsheet structure
  const bookingData = {
    id: id || 'n9l231u',
    status: 'Confirmada', // Estado (Technical status)
    submissionDate: '2025-11-26T14:24:10', // Submetido
    adventure: {
      name: 'Passeio de Barco Arribas do Douro',
      location: 'Cardal Do Douro, 5200-079 Bemposta, Mogadouro PT',
      date: '2025-11-26', // Data da Reserva (Activity Date)
      time: '15:00', // Hora Inicio
      driver: 'Por definir', // Condutor
    },
    client: {
      name: 'Luciano Milani',
      nif: '123456789',
      email: 'info@milani.link',
      phone: '937777789',
      city: 'Fafe',
      country: 'Portugal'
    },
    participants: {
      total: 4, // Numero de Pessoas
      children: 1, // Qtd. Criancas
      babies: 0, // Crianças < 4
      adults: 3 // Derived
    },
    agency: {
      name: 'MLTours', // Agencia
      email: 'lmilani.mail@gmail.com', // email Agencia
      fee: '€5,75' // Fee Agencia
    },
    financial: {
      totalReserve: '€115,00', // Total da Reserva
      netTotal: '€109,25', // Total
      paymentType: 'MBWay', // Tipo de Pagamento
      paymentStatus: 'Em Processo', // Pagamento - Default from DB
      notes: 'teste 1' // Observacoes
    }
  };

  // State to manage the payment status locally
  const [paymentStatus, setPaymentStatus] = useState(bookingData.financial.paymentStatus);

  const getPaymentStatusColor = (status: string) => {
      switch(status) {
          case 'Concluído': return 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/40 border-green-200 dark:border-green-800';
          case 'Em Processo': return 'text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/40 border-yellow-200 dark:border-yellow-800';
          case 'Cancelado': return 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/40 border-red-200 dark:border-red-800';
          default: return 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
      }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-[#92c9a0]">
        <Link to="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">Dashboard</Link>
        <span>/</span>
        <Link to="/bookings" className="hover:text-gray-900 dark:hover:text-white transition-colors">Reservas</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">Reserva #{bookingData.id}</span>
      </div>

      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Detalhes da Reserva #{bookingData.id}</h1>
          
          {/* Highlighted Status Section */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border w-fit transition-colors duration-300 ${getPaymentStatusColor(paymentStatus)}`}>
              <span className="material-symbols-outlined text-lg">payments</span>
              <span className="text-sm font-bold uppercase tracking-wide">
                  Pagamento: {paymentStatus}
              </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-white/10 text-gray-900 dark:text-white font-semibold text-sm hover:bg-gray-50 dark:hover:bg-white/20 transition-colors border border-gray-200 dark:border-transparent">
                <span className="material-symbols-outlined text-lg">print</span>
                Imprimir
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-background-dark font-bold text-sm hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-lg">save</span>
                Salvar Alterações
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details Column (Left) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Adventure Card */}
            <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-surface-border flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Detalhes da Aventura</h2>
                    <span className="material-symbols-outlined text-gray-400">kayaking</span>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome Aventura</label>
                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{bookingData.adventure.name}</p>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Localização</label>
                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{bookingData.adventure.location}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data</label>
                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{bookingData.adventure.date}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hora</label>
                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{bookingData.adventure.time}</p>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Condutor</label>
                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">person</span>
                            {bookingData.adventure.driver}
                        </p>
                    </div>
                </div>
            </div>

            {/* Client Card */}
            <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-surface-border flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Detalhes do Cliente</h2>
                    <span className="material-symbols-outlined text-gray-400">person</span>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome</label>
                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{bookingData.client.name}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">NIF</label>
                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{bookingData.client.nif}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</label>
                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{bookingData.client.email}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Telefone</label>
                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{bookingData.client.phone}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cidade</label>
                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{bookingData.client.city}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">País</label>
                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{bookingData.client.country}</p>
                    </div>
                </div>
            </div>

            {/* Participants & Agency Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-surface-border flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Participantes</h2>
                        <span className="material-symbols-outlined text-gray-400">groups</span>
                    </div>
                    <div className="p-6">
                         <div className="flex items-end gap-2 mb-4">
                            <span className="text-4xl font-bold text-gray-900 dark:text-white">{bookingData.participants.total}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total de Pessoas</span>
                         </div>
                         <div className="space-y-2">
                             <div className="flex justify-between text-sm border-b border-gray-100 dark:border-white/5 pb-2">
                                <span className="text-gray-600 dark:text-gray-300">Adultos</span>
                                <span className="font-medium text-gray-900 dark:text-white">{bookingData.participants.adults}</span>
                             </div>
                             <div className="flex justify-between text-sm border-b border-gray-100 dark:border-white/5 pb-2">
                                <span className="text-gray-600 dark:text-gray-300">Crianças</span>
                                <span className="font-medium text-gray-900 dark:text-white">{bookingData.participants.children}</span>
                             </div>
                             <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-300">Crianças &lt; 4 anos</span>
                                <span className="font-medium text-gray-900 dark:text-white">{bookingData.participants.babies}</span>
                             </div>
                         </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-surface-border flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Agência</h2>
                        <span className="material-symbols-outlined text-gray-400">storefront</span>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                             <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome da Agência</label>
                             <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{bookingData.agency.name}</p>
                        </div>
                        <div>
                             <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email da Agência</label>
                             <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{bookingData.agency.email || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="material-symbols-outlined text-sm">info</span>
                <span>Submetido em: {new Date(bookingData.submissionDate).toLocaleString()}</span>
            </div>

        </div>

        {/* Sidebar Column (Right) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Financial Card (Moved to Sidebar) */}
            <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-surface-border flex justify-between items-center bg-gray-50 dark:bg-white/5">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Financeiro</h2>
                    <span className="material-symbols-outlined text-gray-500">payments</span>
                </div>
                <div className="p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Valor Total</label>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{bookingData.financial.totalReserve}</p>
                    </div>
                    <div className="flex justify-between items-center text-red-500">
                        <label className="text-xs font-medium uppercase">Fee Agência</label>
                        <p className="text-lg font-bold">-{bookingData.agency.fee}</p>
                    </div>
                    <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <label className="text-xs font-medium text-primary uppercase font-bold">Valor Líquido</label>
                        <p className="text-2xl font-black text-primary">{bookingData.financial.netTotal}</p>
                    </div>
                    
                    <div className="pt-2 space-y-3">
                         <div className="bg-gray-50 dark:bg-black/20 p-3 rounded-lg">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase block mb-1">Método de Pagamento</label>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-gray-400">credit_card</span>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{bookingData.financial.paymentType}</p>
                            </div>
                         </div>
                    </div>
                    
                    <div>
                         <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Observações</label>
                         <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-lg">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200 italic">{bookingData.financial.notes}</p>
                         </div>
                    </div>
                </div>
            </div>

            {/* Actions Section */}
            <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-surface-border">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Ações</h2>
                </div>
                <div className="p-6 flex flex-col gap-4">
                    
                    {/* Status Changer */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase block mb-2">Alterar Estado do Pagamento</label>
                        <div className="relative">
                            <select 
                                value={paymentStatus}
                                onChange={(e) => setPaymentStatus(e.target.value)}
                                className="w-full appearance-none bg-white dark:bg-[#112215] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg p-2.5 pr-8 focus:ring-2 focus:ring-primary focus:border-transparent outline-none cursor-pointer transition-colors shadow-sm"
                            >
                                <option value="Em Processo" className="bg-white dark:bg-[#1a3822]">Em Processo</option>
                                <option value="Concluído" className="bg-white dark:bg-[#1a3822]">Concluído</option>
                                <option value="Cancelado" className="bg-white dark:bg-[#1a3822]">Cancelado</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">expand_more</span>
                        </div>
                    </div>

                    <a 
                        href={`mailto:${bookingData.client.email}`}
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white text-sm font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">mail</span>
                        Enviar Email ao Cliente
                    </a>
                </div>
            </div>

             {/* Notes Section */}
            <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-surface-border">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Notas Internas</h2>
                </div>
                <div className="p-6 flex-1 max-h-[300px] overflow-y-auto flex flex-col gap-4">
                    <div className="text-sm pb-3 border-b border-gray-100 dark:border-white/5">
                        <p className="text-gray-800 dark:text-gray-200 mb-1">Cliente confirmou horário.</p>
                        <p className="text-xs text-gray-500">Sistema - 26/11/2025 15:30</p>
                    </div>
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-surface-border bg-gray-50 dark:bg-black/20">
                    <textarea 
                        className="w-full text-sm rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-dark text-gray-900 dark:text-white focus:ring-primary focus:border-primary resize-none p-2.5" 
                        placeholder="Adicionar nova nota..."
                        rows={2}
                    ></textarea>
                    <button className="mt-2 w-full py-2 bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white text-sm font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-white/20 transition-colors">
                        Adicionar Nota
                    </button>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};