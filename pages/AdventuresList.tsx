import React, { useState } from 'react';

// Adventure Interface
interface Adventure {
  id: string;
  name: string;
  description: string;
  location: string;
  meetingPoint: string;
  duration: string;
  priceAdult: number;
  priceChild: number;
  priceBaby: number;
  isActive: boolean;
  availableTimes: string[];
}

// Mock Data
const initialAdventures: Adventure[] = [
  { 
    id: '1', 
    name: 'Trilho do Sol', 
    description: 'Caminhada panorâmica pelas encostas.', 
    location: 'Serra de Montesinho', 
    meetingPoint: 'Centro de Visitantes', 
    duration: '3h', 
    priceAdult: 35.00, 
    priceChild: 20.00, 
    priceBaby: 0, 
    isActive: true, 
    availableTimes: ['09:00', '14:00'] 
  },
  { 
    id: '2', 
    name: 'Kayak no Rio', 
    description: 'Aventura aquática pelo Rio Douro.', 
    location: 'Rio Douro', 
    meetingPoint: 'Cais Fluvial', 
    duration: '2h30', 
    priceAdult: 45.00, 
    priceChild: 25.00, 
    priceBaby: 10.00, 
    isActive: true, 
    availableTimes: ['10:00', '15:00', '17:00'] 
  },
  { 
    id: '3', 
    name: 'Escalada Montanha', 
    description: 'Escalada técnica para iniciantes.', 
    location: 'Gerês', 
    meetingPoint: 'Base da Montanha', 
    duration: '4h', 
    priceAdult: 60.00, 
    priceChild: 40.00, 
    priceBaby: 0, 
    isActive: false, 
    availableTimes: ['08:00'] 
  },
];

const timeOptions = [
    '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', 
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
];

export const AdventuresList: React.FC = () => {
  const [adventures, setAdventures] = useState<Adventure[]>(initialAdventures);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Status Filters (Checkboxes)
  const [showActive, setShowActive] = useState(true);
  const [showInactive, setShowInactive] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  
  // Form State
  const [currentAdventure, setCurrentAdventure] = useState<Adventure>({
    id: '',
    name: '',
    description: '',
    location: '',
    meetingPoint: '',
    duration: '',
    priceAdult: 0,
    priceChild: 0,
    priceBaby: 0,
    isActive: true,
    availableTimes: []
  });

  // Filter Logic
  const filteredAdventures = adventures.filter(adv => {
    const matchesSearch = adv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          adv.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = (adv.isActive && showActive) || (!adv.isActive && showInactive);

    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleDelete = (id: string) => {
    if (window.confirm('Tem a certeza que deseja remover este passeio?')) {
      setAdventures(adventures.filter(a => a.id !== id));
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setCurrentAdventure({ 
        id: '', name: '', description: '', location: '', meetingPoint: '', duration: '', 
        priceAdult: 0, priceChild: 0, priceBaby: 0, isActive: true, availableTimes: [] 
    });
    setIsModalOpen(true);
    setIsTimeDropdownOpen(false);
  };

  const openEditModal = (adv: Adventure) => {
    setModalMode('edit');
    setCurrentAdventure(adv);
    setIsModalOpen(true);
    setIsTimeDropdownOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Handle numbers
    if (type === 'number') {
        setCurrentAdventure(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
        setCurrentAdventure(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleStatusToggle = () => {
      setCurrentAdventure(prev => ({ ...prev, isActive: !prev.isActive }));
  };

  const toggleTimeSelection = (time: string) => {
      setCurrentAdventure(prev => {
          const exists = prev.availableTimes.includes(time);
          if (exists) {
              return { ...prev, availableTimes: prev.availableTimes.filter(t => t !== time).sort() };
          } else {
              return { ...prev, availableTimes: [...prev.availableTimes, time].sort() };
          }
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'add') {
        const newId = Math.random().toString(36).substr(2, 9);
        setAdventures([...adventures, { ...currentAdventure, id: newId }]);
    } else {
        setAdventures(adventures.map(a => a.id === currentAdventure.id ? currentAdventure : a));
    }
    setIsModalOpen(false);
  };

  // Styles
  const baseInputClass = "w-full appearance-none py-2.5 bg-white dark:bg-[#102215] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm pl-3";
  const labelClass = "block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5";

  return (
    <div className="flex flex-col gap-6 animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-gray-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Gestão de Passeios</h1>
          <p className="text-gray-600 dark:text-[#92c9a0] text-base font-normal mt-1">Configure as suas ofertas turísticas, preços e horários.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center justify-center rounded-lg h-10 px-4 bg-primary hover:bg-primary-dark text-background-dark text-sm font-bold tracking-wide gap-2 transition-all shadow-lg shadow-primary/20"
        >
            <span className="material-symbols-outlined">hiking</span>
            <span>Novo Passeio</span>
        </button>
      </div>

      {/* Search Bar & Filters */}
      <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl p-5 shadow-sm flex flex-col sm:flex-row gap-6 items-end">
        <div className="w-full max-w-md relative">
             <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Pesquisar</label>
             <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                <input 
                    type="text" 
                    placeholder="Nome do passeio, localização..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#102215] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
        </div>

        {/* Status Toggles */}
        <div className="flex flex-col gap-1.5">
             <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-1">Mostrar</span>
             <div className="flex items-center gap-6 h-[42px]">
                 {/* Active Toggle */}
                 <label className="flex items-center gap-2 cursor-pointer group select-none">
                    <div className={`relative w-9 h-5 rounded-full transition-colors ${showActive ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                        <input 
                            type="checkbox" 
                            checked={showActive} 
                            onChange={(e) => setShowActive(e.target.checked)} 
                            className="sr-only" 
                        />
                        <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform shadow-sm ${showActive ? 'translate-x-4' : ''}`}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">Ativos</span>
                 </label>

                 {/* Inactive Toggle */}
                 <label className="flex items-center gap-2 cursor-pointer group select-none">
                    <div className={`relative w-9 h-5 rounded-full transition-colors ${showInactive ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                        <input 
                            type="checkbox" 
                            checked={showInactive} 
                            onChange={(e) => setShowInactive(e.target.checked)} 
                            className="sr-only" 
                        />
                        <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform shadow-sm ${showInactive ? 'translate-x-4' : ''}`}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">Inativos</span>
                 </label>
             </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-surface-dark border border-gray-200 dark:border-surface-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 dark:bg-black/20 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold border-b border-gray-200 dark:border-surface-border">
                        <th className="px-4 py-3 whitespace-nowrap">Status</th>
                        <th className="px-4 py-3 whitespace-nowrap">Nome</th>
                        <th className="px-4 py-3 whitespace-nowrap">Localização</th>
                        <th className="px-4 py-3 whitespace-nowrap">Duração</th>
                        <th className="px-4 py-3 whitespace-nowrap">Adulto</th>
                        <th className="px-4 py-3 whitespace-nowrap">Criança</th>
                        <th className="px-4 py-3 whitespace-nowrap">Horários</th>
                        <th className="px-4 py-3 text-center whitespace-nowrap">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-surface-border">
                    {filteredAdventures.length > 0 ? (
                        filteredAdventures.map((adv) => (
                            <tr key={adv.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                <td className="px-4 py-3">
                                     <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${adv.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400'}`}>
                                        {adv.isActive ? 'Ativo' : 'Inativo'}
                                     </span>
                                </td>
                                <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{adv.name}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{adv.location}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{adv.duration}</td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">€{adv.priceAdult.toFixed(2)}</td>
                                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">€{adv.priceChild.toFixed(2)}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="flex gap-1 flex-wrap max-w-[150px]">
                                        {adv.availableTimes.slice(0, 3).map(t => (
                                            <span key={t} className="px-1.5 py-0.5 bg-gray-100 dark:bg-white/10 rounded text-xs">{t}</span>
                                        ))}
                                        {adv.availableTimes.length > 3 && (
                                            <span className="px-1.5 py-0.5 text-xs text-gray-400">+{adv.availableTimes.length - 3}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <button 
                                            onClick={() => openEditModal(adv)}
                                            className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <span className="material-symbols-outlined text-lg">edit</span>
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(adv.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Apagar"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                <div className="flex flex-col items-center gap-2">
                                    <span className="material-symbols-outlined text-4xl opacity-50">hiking</span>
                                    <p>Nenhum passeio encontrado.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Modal for Adding/Editing Adventure */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="bg-white dark:bg-surface-dark w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 dark:border-surface-border overflow-hidden my-8">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-surface-border bg-gray-50 dark:bg-black/20">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {modalMode === 'add' ? 'Adicionar Novo Passeio' : 'Editar Passeio'}
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Basic Info */}
                    <div className="col-span-1 md:col-span-2">
                        <label className={labelClass}>Nome do Passeio</label>
                        <input 
                            type="text" name="name" required 
                            value={currentAdventure.name} onChange={handleInputChange} 
                            className={baseInputClass} placeholder="Ex: Trilho Panorâmico"
                        />
                    </div>
                    
                    <div className="col-span-1 md:col-span-2">
                        <label className={labelClass}>Descrição</label>
                        <textarea 
                            name="description" required rows={3}
                            value={currentAdventure.description} onChange={handleInputChange} 
                            className={baseInputClass} placeholder="Descrição detalhada do passeio..."
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Localização</label>
                        <div className="relative">
                             <input 
                                type="text" name="location" required 
                                value={currentAdventure.location} onChange={handleInputChange} 
                                className={`${baseInputClass} pl-10`} placeholder="Ex: Serra do Gerês"
                            />
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">location_on</span>
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Ponto de Encontro</label>
                        <div className="relative">
                             <input 
                                type="text" name="meetingPoint" required 
                                value={currentAdventure.meetingPoint} onChange={handleInputChange} 
                                className={`${baseInputClass} pl-10`} placeholder="Ex: Centro de Turismo"
                            />
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">place</span>
                        </div>
                    </div>

                     <div>
                        <label className={labelClass}>Duração</label>
                        <div className="relative">
                             <input 
                                type="text" name="duration" required 
                                value={currentAdventure.duration} onChange={handleInputChange} 
                                className={`${baseInputClass} pl-10`} placeholder="Ex: 3 horas"
                            />
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">schedule</span>
                        </div>
                    </div>

                    {/* Status Switch */}
                    <div className="flex flex-col justify-end">
                         <label className={labelClass}>Estado do Passeio</label>
                         <button 
                            type="button"
                            onClick={handleStatusToggle}
                            className={`flex items-center gap-3 w-full p-2.5 rounded-lg border transition-all ${currentAdventure.isActive 
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                                : 'bg-gray-50 dark:bg-[#102215] border-gray-200 dark:border-gray-700'}`}
                         >
                             <div className={`w-10 h-5 rounded-full relative transition-colors ${currentAdventure.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                 <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${currentAdventure.isActive ? 'left-6' : 'left-1'}`}></div>
                             </div>
                             <span className={`text-sm font-semibold ${currentAdventure.isActive ? 'text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'}`}>
                                 {currentAdventure.isActive ? 'Ativo (Disponível para reservas)' : 'Inativo (Indisponível)'}
                             </span>
                         </button>
                    </div>

                    {/* Pricing */}
                    <div className="col-span-1 md:col-span-2 pt-2 pb-1">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-1">Tabela de Preços</h3>
                    </div>

                    <div>
                        <label className={labelClass}>Valor Adulto (€)</label>
                        <input 
                            type="number" step="0.01" name="priceAdult" required 
                            value={currentAdventure.priceAdult} onChange={handleInputChange} 
                            className={baseInputClass} placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Valor Criança (€)</label>
                        <input 
                            type="number" step="0.01" name="priceChild" required 
                            value={currentAdventure.priceChild} onChange={handleInputChange} 
                            className={baseInputClass} placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Valor Bebé (&lt;4) (€)</label>
                        <input 
                            type="number" step="0.01" name="priceBaby" required 
                            value={currentAdventure.priceBaby} onChange={handleInputChange} 
                            className={baseInputClass} placeholder="0.00"
                        />
                    </div>

                    {/* Available Times Custom Dropdown */}
                    <div className="col-span-1 md:col-span-2 relative">
                        <label className={labelClass}>Horários Disponíveis (Multi-escolha)</label>
                        <div className="relative">
                            <button 
                                type="button"
                                onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                                className={`text-left ${baseInputClass} flex items-center justify-between`}
                            >
                                <span className={currentAdventure.availableTimes.length ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>
                                    {currentAdventure.availableTimes.length 
                                        ? `${currentAdventure.availableTimes.length} horários selecionados` 
                                        : 'Selecione os horários...'}
                                </span>
                                <span className="material-symbols-outlined text-gray-400">{isTimeDropdownOpen ? 'expand_less' : 'expand_more'}</span>
                            </button>
                            
                            {/* Dropdown Content */}
                            {isTimeDropdownOpen && (
                                <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-50 p-4 animate-fade-in max-h-60 overflow-y-auto">
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                        {timeOptions.map(time => {
                                            const isSelected = currentAdventure.availableTimes.includes(time);
                                            return (
                                                <button
                                                    key={time}
                                                    type="button"
                                                    onClick={() => toggleTimeSelection(time)}
                                                    className={`py-1.5 px-1 text-xs font-bold rounded-md border transition-colors ${
                                                        isSelected 
                                                        ? 'bg-primary text-background-dark border-primary' 
                                                        : 'bg-gray-50 dark:bg-black/20 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary'
                                                    }`}
                                                >
                                                    {time}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100 dark:border-white/5">
                                        <span className="text-xs text-gray-500">
                                            {currentAdventure.availableTimes.join(', ')}
                                        </span>
                                        <button 
                                            type="button"
                                            onClick={() => setIsTimeDropdownOpen(false)}
                                            className="text-xs font-bold text-primary hover:underline"
                                        >
                                            Confirmar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="px-6 py-2 rounded-lg text-sm font-bold bg-primary text-background-dark hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
                        >
                            {modalMode === 'add' ? 'Criar Passeio' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};