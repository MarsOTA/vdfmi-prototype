import React, { useState, useMemo } from 'react';
import { MOCK_OPERATORS, ALL_SEDI } from '../constants';
import { Operator } from '../types';
import { SEQ } from '../utils/turnarioLogic';

const UserRoundXIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 21a8 8 0 0 1 11.873-7"/>
    <circle cx="10" cy="8" r="5"/>
    <path d="m17 17 5 5"/>
    <path d="m22 17-5 5"/>
  </svg>
);

export const StaffView: React.FC = () => {
  const [operators, setOperators] = useState<Operator[]>(MOCK_OPERATORS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOp, setSelectedOp] = useState<Operator | null>(null);
  
  // Stato per i dati dell'indisponibilità: solo motivo e date
  const [unavailabilityData, setUnavailabilityData] = useState({ 
    reason: 'Ferie', 
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('TUTTI');
  const [sedeFilter, setSedeFilter] = useState('TUTTE');

  const openUnavailabilityModal = (op: Operator) => {
    setSelectedOp(op);
    // Reset dello stato al momento dell'apertura
    setUnavailabilityData({
        reason: 'Ferie',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const formatDateLabel = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const saveUnavailability = () => {
    if (!selectedOp) return;
    
    // Creazione della stringa di stato che include il range temporale
    const statusMsg = `${unavailabilityData.reason.toUpperCase()} (${formatDateLabel(unavailabilityData.startDate)} - ${formatDateLabel(unavailabilityData.endDate)})`;

    const updatedOps = operators.map(op => 
      op.id === selectedOp.id 
        ? { ...op, available: false, assignedHours: 0, statusMessage: statusMsg }
        : op
    );
    setOperators(updatedOps);
    setIsModalOpen(false);
    setSelectedOp(null);
  };

  const filteredOperators = useMemo(() => {
    return operators.filter(op => {
      const matchesSearch = op.name.toLowerCase().includes(search.toLowerCase()) || op.id.toLowerCase().includes(search.toLowerCase());
      const matchesGroup = groupFilter === 'TUTTI' || op.subgroup === groupFilter;
      const matchesSede = sedeFilter === 'TUTTE' || op.sede === sedeFilter;
      return matchesSearch && matchesGroup && matchesSede;
    });
  }, [operators, search, groupFilter, sedeFilter]);

  return (
    <div className="p-8 max-w-[1700px] mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">Anagrafica Personale</h1>
          <p className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-[0.2em]">Gestione dipendenti e monitoraggio disponibilità operativa</p>
        </div>
      </div>

      <div className="diamond-card overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight shrink-0">Registro Operativo Personale</h2>
          
          <div className="flex flex-wrap items-center gap-3">
             <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Filtra Gruppo:</span>
                <select 
                  value={groupFilter}
                  onChange={e => setGroupFilter(e.target.value)}
                  className="bg-transparent text-xs font-black uppercase focus:outline-none cursor-pointer text-[#720000]"
                >
                  <option value="TUTTI">TUTTI I GRUPPI</option>
                  {SEQ.map(code => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
             </div>

             <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Filtra Sede:</span>
                <select 
                  value={sedeFilter}
                  onChange={e => setSedeFilter(e.target.value)}
                  className="bg-transparent text-xs font-black uppercase focus:outline-none cursor-pointer text-[#720000]"
                >
                  <option value="TUTTE">TUTTE LE SEDI</option>
                  {ALL_SEDI.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
             </div>

             <div className="relative">
                <input 
                  type="text" 
                  placeholder="Cerca nominativo..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-white border border-slate-200 text-xs font-bold px-4 py-2.5 pl-10 rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-red-100 shadow-sm uppercase" 
                />
                <svg className="w-4 h-4 text-slate-300 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-slate-400 font-bold border-b border-slate-100 bg-slate-50/20">
                <th className="px-6 py-4">Nominativo</th>
                <th className="px-6 py-4">Grado / Qualifica</th>
                <th className="px-6 py-4">Patente</th>
                <th className="px-6 py-4">Specializzazioni</th>
                <th className="px-6 py-4">SEDE</th>
                <th className="px-6 py-4">GRUPPO</th>
                <th className="px-6 py-4 text-center">Ore</th>
                <th className="px-6 py-4 text-center w-20">Stato</th>
                <th className="px-6 py-4 text-right pr-10">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {filteredOperators.map(op => (
                <tr key={op.id} className="hover:bg-slate-50 transition-all group border-l-4 border-transparent hover:border-[#720000]">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-slate-800 font-black text-sm uppercase group-hover:text-[#720000] transition-colors">{op.name}</span>
                      <span className="text-slate-400 text-[10px] font-mono tracking-tighter">{op.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-slate-600 text-xs font-bold uppercase">{op.rank}</span>
                      <span className="text-slate-400 text-[9px] font-black uppercase tracking-tighter">{op.qualification}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-black border border-slate-200 uppercase tracking-tighter">
                      {op.tipoPatente || 'N/D'}
                    </span>
                  </td>
                  <td className="px-6 py-5 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {op.specializations && op.specializations.length > 0 ? (
                        op.specializations.map((spec, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-500 text-[8px] font-black px-1.5 py-0.5 rounded uppercase border border-slate-200 tracking-tighter">
                            {spec}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-200 text-[8px] font-bold uppercase">Nessuna</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">{op.sede || 'N/D'}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-black border shadow-sm ${
                      op.group === 'A' ? 'bg-red-50 text-red-700 border-red-100' :
                      op.group === 'B' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      op.group === 'C' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {op.subgroup || op.group}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`text-sm font-mono font-normal ${op.assignedHours && op.assignedHours > 0 ? 'text-[#720000]' : 'text-slate-300'}`}>
                        {op.assignedHours ? op.assignedHours.toString().padStart(2, '0') : '00'}h
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex justify-center">
                      <div 
                        title={op.available ? 'Disponibile' : op.statusMessage || 'Indisponibile'}
                        className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-100 ${op.available ? 'bg-emerald-500' : 'bg-red-600'}`}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right pr-10">
                    <button 
                      onClick={() => openUnavailabilityModal(op)}
                      title="Registra Indisponibilità"
                      className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-[#720000] hover:text-white hover:border-[#720000] transition-all shadow-sm group/action"
                    >
                      <UserRoundXIcon className="transition-transform group-hover/action:scale-110" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOperators.length === 0 && (
          <div className="py-20 text-center bg-white">
             <p className="text-slate-300 text-sm font-black uppercase tracking-[0.2em]">Nessun operatore trovato per i filtri selezionati</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
          <div className="diamond-card w-full max-w-md bg-white p-8 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200 rounded-[2.5rem]">
            <div className="flex justify-between items-start mb-6">
               <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Inserimento Assenza</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Operatore: {selectedOp?.name}</p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-600 text-2xl font-light">×</button>
            </div>
            
            <div className="space-y-6">
               <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Causa Indisponibilità</label>
                  <div className="grid grid-cols-3 gap-2">
                     {['Indisposizione', 'Ferie', 'Articoli'].map(reason => (
                        <button 
                          key={reason}
                          onClick={() => setUnavailabilityData({...unavailabilityData, reason})}
                          className={`px-2 py-3 text-[10px] font-black uppercase rounded-xl border transition-all ${unavailabilityData.reason === reason ? 'bg-[#720000] text-white border-[#720000]' : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-300'}`}
                        >
                          {reason}
                        </button>
                     ))}
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Data Inizio</label>
                    <input 
                      type="date" 
                      value={unavailabilityData.startDate}
                      onChange={e => setUnavailabilityData({...unavailabilityData, startDate: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-red-500/10"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Data Fine</label>
                    <input 
                      type="date" 
                      value={unavailabilityData.endDate}
                      onChange={e => setUnavailabilityData({...unavailabilityData, endDate: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-red-500/10"
                    />
                  </div>
               </div>
               
               <div className="pt-4 flex gap-3">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50">
                    Annulla
                  </button>
                  <button onClick={saveUnavailability} className="flex-1 px-4 py-3 bg-[#720000] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-red-100 hover:bg-[#a5020c]">
                    Salva Stato
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};