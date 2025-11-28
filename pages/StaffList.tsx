import React, { useState } from 'react';

// Staff Interface
interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Administrador' | 'Gestor' | 'Guia' | 'Condutor';
  notes: string;
  isActive: boolean;
}

// Mock Data
const initialStaff: Staff[] = [
  { id: '101', name: 'Luciano Milani', email: 'lmilani@naturisnor.com', phone: '912345678', role: 'Administrador', notes: 'CEO e Fundador', isActive: true },
  { id: '102', name: 'Ana Pereira', email: 'ana.pereira@naturisnor.com', phone: '965432109', role: 'Gestor', notes: 'Responsável de Reservas', isActive: true },
  { id: '103', name: 'Carlos Santos', email: 'carlos.santos@naturisnor.com', phone: '933221100', role: 'Guia', notes: 'Especialista em Trilhos', isActive: false },
  { id: '104', name: 'Miguel Costa', email: 'miguel.costa@naturisnor.com', phone: '911888777', role: 'Condutor', notes: 'Turno da manhã', isActive: true },
];

export const StaffList: React.FC = () => {
  const [staffList, setStaffList] = useState<Staff[]>(initialStaff);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Status Filters (Toggles)
  const [showActive, setShowActive] = useState(true);
  const [showInactive, setShowInactive] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  
  // Form State
  const [currentStaff, setCurrentStaff] = useState<Staff>({
    id: '',
    name: '',
    email: '',
    phone: '',
    role: 'Guia',
    notes: '',
    isActive: true
  });

  // Filter Logic
  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          staff.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = (staff.isActive && showActive) || (!staff.isActive && showInactive);

    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleDelete = (id: string) => {
    if (window.confirm('Tem a certeza que deseja remover este colaborador?')) {
      setStaffList(staffList.filter(s => s.id !== id));
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setCurrentStaff({ id: '', name: '', email: '', phone: '', role: 'Guia', notes: '', isActive: true });
    setIsModalOpen(true);
  };

  const openEditModal = (staff: Staff) => {
    setModalMode('edit');
    setCurrentStaff(staff);
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentStaff(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusToggle = () => {
      setCurrentStaff(prev => ({ ...prev, isActive: !prev.isActive }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (modalMode === 'add') {
        const newId = Math.floor(Math.random() * 10000).toString();
        setStaffList([...staffList, { ...currentStaff, id: newId }]);
    } else {
        setStaffList(staffList.map(s => s.id === currentStaff.id ? currentStaff : s));
    }

    setIsModalOpen(false);
  };

  // Styles (Consistent with other lists)
  const baseInputClass = "w-full appearance-none py-2.5 bg-white dark:bg-[#102215] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm pl-3";
  const labelClass = "block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5";

  // Role Badge Color
  const getRoleColor = (role: string) => {
      switch(role) {
          case 'Administrador': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
          case 'Gestor': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
          case 'Guia': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
          default: return 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
      }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-gray-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Gestão de Equipa</h1>
          <p className="text-gray-600 dark:text-[#92c9a0] text-base font-normal mt-1">Gerencie os colaboradores e acessos ao sistema.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center justify-center rounded-lg h-10 px-4 bg-primary hover:bg-primary-dark text-background-dark text-sm font-bold tracking-wide gap-2 transition-all shadow-lg shadow-primary/20"
        >
            <span className="material-symbols-outlined">person_add</span>
            <span>Novo Colaborador</span>
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
                    placeholder="Nome, Email ou Função..." 
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
                        <th className="px-4 py-3 whitespace-nowrap">ID</th>
                        <th className="px-4 py-3 whitespace-nowrap">Nome</th>
                        <th className="px-4 py-3 whitespace-nowrap">Email</th>
                        <th className="px-4 py-3 whitespace-nowrap">Telefone</th>
                        <th className="px-4 py-3 whitespace-nowrap">Função</th>
                        <th className="px-4 py-3 whitespace-nowrap">Observações</th>
                        <th className="px-4 py-3 text-center whitespace-nowrap">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-surface-border">
                    {filteredStaff.length > 0 ? (
                        filteredStaff.map((staff) => (
                            <tr key={staff.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                <td className="px-4 py-3">
                                     <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${staff.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400'}`}>
                                        {staff.isActive ? 'Ativo' : 'Inativo'}
                                     </span>
                                </td>
                                <td className="px-4 py-3 text-xs font-mono font-medium text-gray-500 dark:text-gray-400">#{staff.id}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="size-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                                            {staff.name.split(' ').map(n => n[0]).join('').substring(0,2)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{staff.name}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{staff.email}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{staff.phone}</td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(staff.role)}`}>
                                        {staff.role}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate" title={staff.notes}>
                                    {staff.notes || '-'}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <button 
                                            onClick={() => openEditModal(staff)}
                                            className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <span className="material-symbols-outlined text-lg">edit</span>
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(staff.id)}
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
                                    <span className="material-symbols-outlined text-4xl opacity-50">group_off</span>
                                    <p>Nenhum colaborador encontrado.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Modal for Adding/Editing Staff */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-surface-dark w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-surface-border overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-surface-border bg-gray-50 dark:bg-black/20">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {modalMode === 'add' ? 'Adicionar Novo Colaborador' : 'Editar Colaborador'}
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2">
                        <label className={labelClass}>Nome Completo</label>
                        <input 
                            type="text" name="name" required 
                            value={currentStaff.name} onChange={handleInputChange} 
                            className={baseInputClass} placeholder="Ex: João Silva"
                        />
                    </div>
                    
                    <div>
                        <label className={labelClass}>Email (Login)</label>
                        <input 
                            type="email" name="email" required 
                            value={currentStaff.email} onChange={handleInputChange} 
                            className={baseInputClass} placeholder="email@naturisnor.com"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Telefone</label>
                        <input 
                            type="tel" name="phone" 
                            value={currentStaff.phone} onChange={handleInputChange} 
                            className={baseInputClass} placeholder="+351 912 345 678"
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Função</label>
                        <div className="relative">
                            <select 
                                name="role"
                                value={currentStaff.role} 
                                onChange={handleInputChange} 
                                className={baseInputClass}
                            >
                                <option value="Administrador">Administrador</option>
                                <option value="Gestor">Gestor</option>
                                <option value="Guia">Guia</option>
                                <option value="Condutor">Condutor</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                        </div>
                    </div>

                     {/* Password field placeholder (Visual only, logically implies login creation) */}
                     {modalMode === 'add' && (
                        <div>
                            <label className={labelClass}>Senha Inicial</label>
                            <input 
                                type="password" disabled
                                className={`${baseInputClass} opacity-60 cursor-not-allowed`} 
                                placeholder="Gerada automaticamente"
                            />
                        </div>
                    )}

                    <div className="col-span-1 md:col-span-2">
                        <label className={labelClass}>Observações</label>
                        <textarea 
                            name="notes"
                            rows={3}
                            value={currentStaff.notes} onChange={handleInputChange} 
                            className={baseInputClass} placeholder="Informações adicionais..."
                        />
                    </div>

                    {/* Status Switch in Modal */}
                    <div className="col-span-1 md:col-span-2 flex flex-col justify-end">
                         <label className={labelClass}>Estado do Colaborador</label>
                         <button 
                            type="button"
                            onClick={handleStatusToggle}
                            className={`flex items-center gap-3 w-full p-2.5 rounded-lg border transition-all ${currentStaff.isActive 
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                                : 'bg-gray-50 dark:bg-[#102215] border-gray-200 dark:border-gray-700'}`}
                         >
                             <div className={`w-10 h-5 rounded-full relative transition-colors ${currentStaff.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                 <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${currentStaff.isActive ? 'left-6' : 'left-1'}`}></div>
                             </div>
                             <span className={`text-sm font-semibold ${currentStaff.isActive ? 'text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'}`}>
                                 {currentStaff.isActive ? 'Ativo (Acesso Permitido)' : 'Inativo (Acesso Bloqueado)'}
                             </span>
                         </button>
                    </div>

                    <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4">
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
                            {modalMode === 'add' ? 'Criar Colaborador' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};