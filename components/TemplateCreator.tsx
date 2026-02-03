import React, { useState, useRef, useEffect } from 'react';
import { OperationalEvent, EventStatus, PersonnelRequirement, VehicleEntry, VigilanceType } from '../types';

interface TemplateCreatorProps {
  onSave: (event: OperationalEvent) => void;
  onCancel: () => void;
  defaultDate: string;
  initialEvent?: OperationalEvent;
}

const VEHICLE_OPTIONS = [
  'AUTO',
  'AS',
  'APS',
  'ABP',
  'BUS',
  'FURGONE',
  'MEZZO PESANTE'
];

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6m4-11v6" />
  </svg>
);

const MessageCircleWarningIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M12 8v4"/><path d="M12 16h.01"/>
  </svg>
);

const ChevronLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const ChevronRight = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;

const CustomCalendar: React.FC<{ selectedDate: string, minDate: string, onSelect: (date: string) => void }> = ({ selectedDate, minDate, onSelect }) => {
  const [viewDate, setViewDate] = useState(new Date(selectedDate + 'T00:00:00' || new Date()));
  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: (firstDayOfMonth + 6) % 7 }, (_, i) => null);
  
  const isSelected = (day: number) => {
    const d = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return d === selectedDate;
  };
  
  const isBeforeMin = (day: number) => {
    const d = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return d < minDate;
  };
  
  const monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
  
  return (
    <div className="p-3 w-64 bg-white border border-slate-200 shadow-2xl rounded-2xl animate-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center mb-4">
        <button type="button" onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"><ChevronLeft /></button>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">{monthNames[currentMonth]} {currentYear}</span>
        <button type="button" onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"><ChevronRight /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map(d => <span key={d} className="text-[8px] font-black text-slate-300 mb-1">{d}</span>)}
        {padding.map((_, i) => <div key={`p-${i}`} />)}
        {days.map(d => {
          const disabled = isBeforeMin(d);
          const localISO = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          return (
            <button key={d} type="button" disabled={disabled} onClick={() => onSelect(localISO)} className={`h-8 w-8 text-[10px] font-bold rounded-lg transition-all ${disabled ? 'text-slate-200 cursor-not-allowed' : isSelected(d) ? 'bg-[#720000] text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}`}>
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const TemplateCreator: React.FC<TemplateCreatorProps> = ({ onSave, onCancel, initialEvent, defaultDate }) => {
  const currentYear = new Date().getFullYear();
  const minDate = `${currentYear}-01-01`;
  
  const [formData, setFormData] = useState({
    code: initialEvent?.code || '',
    location: initialEvent?.location || '',
    date: initialEvent?.date || defaultDate,
    start: initialEvent?.timeWindow.split(' - ')[0] || '08:00',
    end: initialEvent?.timeWindow.split(' - ')[1] || '16:00',
    vigilanceType: initialEvent?.vigilanceType || 'STANDARD',
    vehicles: initialEvent?.vehicles || []
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({ code: false, location: false, date: false });
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const initialReqs = initialEvent 
    ? initialEvent.requirements.map(r => ({ role: r.role, qty: r.qty })) 
    : [
        { role: 'DIR' as const, qty: 1 },
        { role: 'CP' as const, qty: 1 },
        { role: 'VIG' as const, qty: 1 },
        { role: 'ALTRO' as const, qty: 0 }
      ];

  const [reqs, setReqs] = useState<{role: 'DIR' | 'CP' | 'VIG' | 'ALTRO', qty: number}[]>(initialReqs as any);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) setShowCalendar(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: false }));
    if (globalError) setGlobalError(null);
  };

  const addVehicle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      vehicles: [...prev.vehicles, { type, plate: '', qty: 1 }]
    }));
  };

  const removeVehicleAt = (index: number) => {
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles.filter((_, i) => i !== index)
    }));
  };

  const handleVehicleChange = (index: number, field: 'plate', value: string) => {
    setFormData(prev => {
      const newVehicles = [...prev.vehicles];
      newVehicles[index] = { ...newVehicles[index], [field]: value };
      return { ...prev, vehicles: newVehicles };
    });
  };

  const handleSave = () => {
    const newErrors = {
      code: !formData.code.trim(),
      location: !formData.location.trim(),
      date: !formData.date
    };
    if (newErrors.code || newErrors.location || newErrors.date) {
      setErrors(newErrors);
      setGlobalError("Compila tutti i campi obbligatori per salvare il servizio.");
      return;
    }
    
    const newRequirements = reqs.map(r => {
      const existing = initialEvent?.requirements.find(er => er.role === r.role);
      let assignedIds = Array(r.qty).fill(null);
      let entrustedGroups = Array(r.qty).fill(null);
      if (existing) {
        for (let i = 0; i < Math.min(r.qty, existing.qty); i++) {
          assignedIds[i] = existing.assignedIds[i];
          if (existing.entrustedGroups) entrustedGroups[i] = existing.entrustedGroups[i];
        }
      }
      return { role: r.role, qty: r.qty, assignedIds, entrustedGroups };
    }) as PersonnelRequirement[];

    const newEvent: OperationalEvent = {
      id: initialEvent?.id || `EV-${Math.floor(Math.random() * 9000) + 1000}`,
      code: formData.code.toUpperCase(),
      location: formData.location.toUpperCase(),
      date: formData.date,
      timeWindow: `${formData.start} - ${formData.end}`,
      status: initialEvent?.status || EventStatus.IN_COMPILAZIONE, 
      vehicles: formData.vehicles,
      vigilanceType: formData.vigilanceType as VigilanceType,
      isOlympic: formData.vigilanceType.startsWith('OLYMPIC'),
      requirements: newRequirements
    };
    onSave(newEvent);
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCancel();
  };

  const inputClass = (field: string, base: string) => {
    const isError = errors[field];
    return `${base} ${isError ? 'border-red-600 ring-2 ring-red-100 border-2 bg-red-50/5' : 'border-slate-200'} transition-all duration-200`;
  };

  const getRoleLabel = (role: string) => {
    switch(role) {
        case 'DIR': return 'Funzionario';
        case 'CP': return 'Capo Posto';
        case 'VIG': return 'Vigile del Fuoco';
        case 'ALTRO': return 'Altro';
        default: return role;
    }
  }

  return (
    <div className="p-3 md:p-4 lg:px-6 lg:py-4 max-w-[1500px] mx-auto space-y-3 animate-in fade-in duration-500 pb-20 h-full flex flex-col relative overflow-y-auto overflow-x-hidden">
      <div className="flex justify-between items-center border-b border-slate-200 pb-3 shrink-0">
        <div>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-none">
             PIANIFICAZIONE SERVIZIO
          </h1>
          <p className="text-slate-400 font-bold text-[8px] mt-1 uppercase tracking-widest leading-none">Compilazione assetti e logistica operativa</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">ID Servizio</span>
                <span className="text-[10px] font-mono font-bold text-slate-800">{initialEvent?.id || 'NUOVO'}</span>
            </div>
            <div className="w-10 h-10 bg-[#720000] rounded-xl flex items-center justify-center text-amber-400 font-black text-lg shadow-lg">V1</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start flex-1">
        
        <div className="lg:col-span-7 space-y-4">
          <div className="diamond-card p-5 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-[10px]">1</div>
                <h3 className="text-[10px] font-black text-slate-700 tracking-widest uppercase">Anagrafica Intervento</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[8px] font-black text-slate-500 uppercase mb-1 tracking-widest">NOME DEL SERVIZIO <span className="text-red-500">*</span></label>
                <input type="text" value={formData.code} onChange={e => handleInputChange('code', e.target.value.toUpperCase())} placeholder="ES: VIGILANZA EVENTO SPORTIVO" className={inputClass('code', "w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm font-black uppercase placeholder:text-slate-200 focus:outline-none")} />
              </div>
              <div className="relative" ref={calendarRef}>
                <label className="block text-[8px] font-black text-slate-500 uppercase mb-1 tracking-widest">DATA SERVIZIO <span className="text-red-500">*</span></label>
                <button type="button" onClick={() => setShowCalendar(!showCalendar)} className={inputClass('date', "w-full flex items-center gap-3 bg-slate-50 border rounded-xl px-4 py-2.5 text-xs font-black text-left uppercase transition-all")}>
                  <CalendarIcon className="text-blue-500 shrink-0" />
                  <span className={formData.date ? 'text-slate-800' : 'text-slate-300'}>
                    {formData.date ? new Date(formData.date + 'T00:00:00').toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Seleziona data'}
                  </span>
                </button>
                {showCalendar && <div className="absolute top-full left-0 z-50 mt-1 shadow-2xl"><CustomCalendar selectedDate={formData.date} minDate={minDate} onSelect={(d) => { handleInputChange('date', d); setShowCalendar(false); }} /></div>}
              </div>
              <div>
                <label className="block text-[8px] font-black text-slate-500 uppercase mb-1 tracking-widest">TIPO VIGILANZA</label>
                <select value={formData.vigilanceType} onChange={e => handleInputChange('vigilanceType', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black uppercase shadow-sm focus:outline-none appearance-none cursor-pointer">
                  <option value="STANDARD">Vigilanza Standard</option>
                  <option value="RINFORZI">Rinforzi Sedi VVF</option>
                  <option value="OLYMPIC_SPEC">Presidio olimpico: squadra specialistici (SAF/NBCR)</option>
                  <option value="OLYMPIC_GENERIC">Presidio olimpico: squadra personale generico</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[8px] font-black text-slate-500 uppercase mb-1 tracking-widest">ORA INIZIO</label>
                  <input type="time" value={formData.start} onChange={e => handleInputChange('start', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold" />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-slate-500 uppercase mb-1 tracking-widest">ORA FINE</label>
                  <input type="time" value={formData.end} onChange={e => handleInputChange('end', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold" />
                </div>
              </div>
              <div>
                <label className="block text-[8px] font-black text-slate-500 uppercase mb-1 tracking-widest">UBICAZIONE <span className="text-red-500">*</span></label>
                <input type="text" value={formData.location} onChange={e => handleInputChange('location', e.target.value.toUpperCase())} placeholder="LUOGO INTERVENTO" className={inputClass('location', "w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-xs font-bold uppercase shadow-sm focus:outline-none")} />
              </div>
            </div>
          </div>

          <div className="diamond-card p-5 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-black text-[10px]">2</div>
                <h3 className="text-[10px] font-black text-slate-700 tracking-widest uppercase">Assetto Personale</h3>
            </div>
            <div className="space-y-2">
              {reqs.map((r, i) => (
                <div key={i} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none">
                    {getRoleLabel(r.role)}
                  </span>
                  <div className="flex items-center gap-3">
                      <button type="button" onClick={() => { const n = [...reqs]; n[i].qty = Math.max(0, n[i].qty - 1); setReqs(n); }} className="w-6 h-6 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 text-[10px] shadow-sm">-</button>
                      <span className="w-5 text-center font-mono font-black text-xs">{r.qty}</span>
                      <button type="button" onClick={() => { const n = [...reqs]; n[i].qty += 1; setReqs(n); }} className="w-6 h-6 flex items-center justify-center bg-[#720000] text-white rounded-lg text-[10px] shadow-sm">+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="diamond-card p-5 bg-[#720000]/5 border border-[#720000]/10 rounded-[1.5rem] shadow-sm flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#720000] flex items-center justify-center text-white font-black text-[10px]">3</div>
                    <h3 className="text-[10px] font-black text-[#720000] tracking-widest uppercase">Assetto Automezzi</h3>
                </div>
                <div className="flex flex-wrap gap-1 justify-end">
                   {VEHICLE_OPTIONS.map(opt => (
                      <button 
                        key={opt}
                        type="button"
                        onClick={() => addVehicle(opt)}
                        className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter border transition-all bg-white text-[#720000] border-[#720000]/20 hover:bg-[#720000] hover:text-white`}
                      >
                         + {opt}
                      </button>
                   ))}
                </div>
            </div>
            
            <div className="flex-1 bg-white/50 border border-[#720000]/5 rounded-xl overflow-hidden shadow-inner flex flex-col">
               <div className="grid grid-cols-12 gap-2 p-3 bg-[#720000]/10 text-[8px] font-black text-[#720000] uppercase tracking-widest border-b border-[#720000]/10 shrink-0">
                  <div className="col-span-5">Tipo Mezzo</div>
                  <div className="col-span-6 text-center">Targa</div>
                  <div className="col-span-1"></div>
               </div>
               <div className="divide-y divide-[#720000]/5 overflow-y-auto custom-scrollbar flex-1">
                  {formData.vehicles.map((v, index) => (
                    <div key={`${v.type}-${index}`} className="grid grid-cols-12 items-center gap-2 px-3 py-3 hover:bg-white transition-colors group">
                      <div className="col-span-5">
                         <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter leading-none">{v.type}</span>
                      </div>
                      <div className="col-span-6">
                         <input 
                            type="text" 
                            value={v.plate} 
                            onChange={e => handleVehicleChange(index, 'plate', e.target.value.toUpperCase())}
                            placeholder="VF-00000"
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-[#720000]/10 text-center shadow-sm"
                         />
                      </div>
                      <div className="col-span-1 flex justify-end">
                         <button type="button" onClick={() => removeVehicleAt(index)} className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-red-600 transition-colors bg-red-50/0 hover:bg-red-50 rounded-lg" title="Rimuovi mezzo">
                            <TrashIcon className="w-3.5 h-3.5" />
                         </button>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-16 right-0 h-14 bg-white border-t border-slate-200 flex flex-col justify-center px-10 z-[70] shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        {globalError && (
          <div className="absolute bottom-full left-4 right-4 bg-red-600 text-white px-4 py-2 rounded-t-xl flex items-center gap-4 shadow-lg border border-red-700">
            <MessageCircleWarningIcon />
            <div className="flex flex-col">
                <span className="text-[10px] font-medium tracking-tight opacity-95">{globalError}</span>
            </div>
            <button onClick={() => setGlobalError(null)} className="ml-auto text-white/50 hover:text-white transition-colors text-xl font-light leading-none">×</button>
          </div>
        )}
        <div className="flex justify-end gap-4 items-center">
            <button type="button" onClick={handleCancelClick} className="px-10 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-600 text-[10px] font-black uppercase tracking-widest transition-all">
                Annulla e Torna al Quadro
            </button>
            <button type="button" onClick={handleSave} className="px-12 py-2 bg-[#720000] hover:bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl shadow-xl transition-all active:scale-95 shadow-red-200">
                {initialEvent ? 'Salva Modifiche' : 'Pubblica Servizio'}
            </button>
        </div>
      </div>
    </div>
  );
};