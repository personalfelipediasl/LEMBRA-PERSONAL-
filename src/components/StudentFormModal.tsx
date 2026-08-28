import React, { useState } from 'react';
import { X, Check, Plus, Trash2, ChevronRight, ChevronLeft, AlertTriangle, Clock, Calendar, Shield, Dumbbell, Sparkles } from 'lucide-react';
import { Student, DayOfWeek, DAYS_OF_WEEK_LABELS, AttentionCategory, AttentionPoint, AttentionMovement, ATTENTION_CATEGORIES } from '../types';
import { getTodayDateString } from '../lib/scheduler';

interface StudentFormModalProps {
  initialStudent?: Student | null;
  initialStep?: number;
  onClose: () => void;
  onSave: (student: Student) => Promise<void>;
}

const COMMON_ARTICULATIONS = ['Joelho', 'Ombro', 'Coluna Lombar', 'Quadril', 'Tornozelo', 'Cotovelo', 'Punho', 'Cervical'];
const COMMON_PAIN_TYPES = ['Dor durante flexão', 'Dor pós-treino', 'Dor recorrente', 'Sensibilidade / Pinçamento', 'Desconforto na carga alta'];
const COMMON_RESTRICTIONS = ['Amplitude limitada', 'Exercício a evitar', 'Carga reduzida', 'Movimento sem impacto', 'Evitar sobrecarga axial'];

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  initialStudent,
  initialStep = 1,
  onClose,
  onSave,
}) => {
  const [step, setStep] = useState<number>(initialStep);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState(initialStudent?.name || '');
  const [nickname, setNickname] = useState(initialStudent?.nickname || '');
  const [phone, setPhone] = useState(initialStudent?.phone || '');
  const [generalNotes, setGeneralNotes] = useState(initialStudent?.generalNotes || '');
  const [startDate, setStartDate] = useState(initialStudent?.startDate || getTodayDateString());
  const [status, setStatus] = useState<'active' | 'inactive'>(initialStudent?.status || 'active');

  // Schedules State: map of day -> time
  const [selectedDays, setSelectedDays] = useState<Record<DayOfWeek, boolean>>(() => {
    const map: Record<DayOfWeek, boolean> = { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false };
    if (initialStudent) {
      initialStudent.schedules.forEach((s) => {
        map[s.dayOfWeek] = true;
      });
    } else {
      // Default: Seg, Qua, Sex
      map[1] = true;
      map[3] = true;
      map[5] = true;
    }
    return map;
  });

  const [dayTimes, setDayTimes] = useState<Record<DayOfWeek, string>>(() => {
    const times: Record<DayOfWeek, string> = { 0: '08:00', 1: '07:00', 2: '07:00', 3: '07:00', 4: '07:00', 5: '07:00', 6: '08:00' };
    if (initialStudent) {
      initialStudent.schedules.forEach((s) => {
        times[s.dayOfWeek] = s.time;
      });
    }
    return times;
  });

  // Attention Points State
  const [attentionPoints, setAttentionPoints] = useState<AttentionPoint[]>(initialStudent?.attentionPoints || []);
  
  // Sub-form for adding an attention point
  const [pointCategory, setPointCategory] = useState<AttentionCategory>('articulations');
  const [pointTitle, setPointTitle] = useState('');
  const [pointCondition, setPointCondition] = useState('');
  const [pointLocation, setPointLocation] = useState('');
  const [pointWhenHappens, setPointWhenHappens] = useState('');
  const [pointRelatedMovements, setPointRelatedMovements] = useState('');
  const [pointWhatToRemember, setPointWhatToRemember] = useState('');
  const [pointNotes, setPointNotes] = useState('');
  const [pointSeverity, setPointSeverity] = useState<'attention' | 'warning' | 'high'>('warning');
  const [isAddingPoint, setIsAddingPoint] = useState(false);

  // Movements for Attention State
  const [movements, setMovements] = useState<AttentionMovement[]>(initialStudent?.movements || []);
  const [movExercise, setMovExercise] = useState('');
  const [movAmplitude, setMovAmplitude] = useState('');
  const [movLoad, setMovLoad] = useState('');
  const [movPosition, setMovPosition] = useState('');
  const [movNotes, setMovNotes] = useState('');
  const [isAddingMovement, setIsAddingMovement] = useState(false);

  // Reminder Settings
  const [leadTimes, setLeadTimes] = useState<number[]>(initialStudent?.reminderSettings?.leadTimes || [10, 30]);

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const handleTimeChange = (day: DayOfWeek, time: string) => {
    setDayTimes((prev) => ({ ...prev, [day]: time }));
  };

  const applyTimeToAllSelected = (timeToApply: string) => {
    setDayTimes((prev) => {
      const updated = { ...prev };
      (Object.keys(selectedDays) as unknown as DayOfWeek[]).forEach((d) => {
        if (selectedDays[d]) {
          updated[d] = timeToApply;
        }
      });
      return updated;
    });
  };

  const toggleLeadTime = (mins: number) => {
    setLeadTimes((prev) =>
      prev.includes(mins) ? prev.filter((m) => m !== mins) : [...prev, mins].sort((a, b) => a - b)
    );
  };

  const handleAddAttentionPoint = () => {
    if (!pointTitle.trim()) return;

    const newPoint: AttentionPoint = {
      id: `pt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      category: pointCategory,
      title: pointTitle.trim(),
      condition: pointCondition.trim() || 'Informação de atenção registrada.',
      location: pointLocation.trim() || undefined,
      whenHappens: pointWhenHappens.trim() || undefined,
      relatedMovements: pointRelatedMovements
        ? pointRelatedMovements.split(',').map((m) => m.trim()).filter(Boolean)
        : undefined,
      whatToRemember: pointWhatToRemember.trim() || 'Atenção à tolerância e execução durante o exercício.',
      notes: pointNotes.trim() || undefined,
      severity: pointSeverity,
    };

    setAttentionPoints((prev) => [...prev, newPoint]);
    // Reset point form
    setPointTitle('');
    setPointCondition('');
    setPointLocation('');
    setPointWhenHappens('');
    setPointRelatedMovements('');
    setPointWhatToRemember('');
    setPointNotes('');
    setIsAddingPoint(false);
  };

  const handleRemovePoint = (id: string) => {
    setAttentionPoints((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddMovement = () => {
    if (!movExercise.trim()) return;

    const newMov: AttentionMovement = {
      id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      exercise: movExercise.trim(),
      amplitude: movAmplitude.trim() || undefined,
      load: movLoad.trim() || undefined,
      position: movPosition.trim() || undefined,
      notes: movNotes.trim() || 'Observar resposta durante a execução.',
    };

    setMovements((prev) => [...prev, newMov]);
    setMovExercise('');
    setMovAmplitude('');
    setMovLoad('');
    setMovPosition('');
    setMovNotes('');
    setIsAddingMovement(false);
  };

  const handleRemoveMovement = (id: string) => {
    setMovements((prev) => prev.filter((m) => m.id !== id));
  };

  const handleFinalSave = async () => {
    if (!name.trim()) {
      setStep(1);
      return;
    }

    setIsSaving(true);

    // Build schedules array
    const schedules = (Object.keys(selectedDays) as unknown as DayOfWeek[])
      .filter((d) => selectedDays[d])
      .map((d) => ({
        id: `sch_${d}_${dayTimes[d]}`,
        dayOfWeek: Number(d) as DayOfWeek,
        time: dayTimes[d] || '07:00',
      }));

    const updatedStudent: Student = {
      id: initialStudent?.id || `stud_${Date.now()}`,
      name: name.trim(),
      nickname: nickname.trim() || undefined,
      phone: phone.trim() || undefined,
      generalNotes: generalNotes.trim() || undefined,
      startDate,
      status,
      schedules,
      attentionPoints,
      movements,
      reminderSettings: {
        leadTimes: leadTimes.length > 0 ? leadTimes : [10],
        enabled: true,
      },
      createdAt: initialStudent?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await onSave(updatedStudent);
      onClose();
    } catch (err) {
      console.error('Erro ao salvar aluno:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const stepsTitles = [
    { num: 1, title: 'Identificação' },
    { num: 2, title: 'Atendimento' },
    { num: 3, title: 'Pontos de Atenção' },
    { num: 4, title: 'Movimentos' },
    { num: 5, title: 'Lembretes' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0e0e11] border border-orange-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header & Progress Bar */}
        <div className="px-5 py-4 bg-[#121215] border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 font-mono">
                {initialStudent ? 'EDITAR ALUNO' : 'NOVO ALUNO'} • ETAPA {step} DE 5
              </span>
              <h2 className="text-lg font-extrabold text-white font-heading">
                {stepsTitles[step - 1].title}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Dots */}
          <div className="grid grid-cols-5 gap-1.5 mt-3">
            {stepsTitles.map((s) => (
              <button
                key={s.num}
                onClick={() => setStep(s.num)}
                className={`h-1.5 rounded-full transition-all ${
                  step === s.num
                    ? 'bg-orange-500 shadow-sm shadow-orange-500/50'
                    : step > s.num
                    ? 'bg-orange-500/40'
                    : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-left flex-1">
          {/* ──────────────────────────────────────────────────────────
              ETAPA 1: IDENTIFICAÇÃO
             ────────────────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wide mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: José Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#16161a] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wide mb-1">
                    Apelido (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Zé"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full bg-[#16161a] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wide mb-1">
                    Telefone (opcional)
                  </label>
                  <input
                    type="tel"
                    placeholder="(11) 98765-4321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#16161a] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wide mb-1">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#16161a] border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wide mb-1">
                    Status do Aluno
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus('active')}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border ${
                        status === 'active'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      Ativo
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('inactive')}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border ${
                        status === 'inactive'
                          ? 'bg-zinc-800 text-zinc-200 border-zinc-600'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      Inativo
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wide mb-1">
                  Observações Gerais / Perfil
                </label>
                <textarea
                  rows={3}
                  placeholder="Objetivos do aluno, preferências ou notas gerais de acompanhamento..."
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  className="w-full bg-[#16161a] border border-zinc-700 rounded-xl p-3 text-sm text-white focus:border-orange-500 focus:outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              ETAPA 2: ATENDIMENTO
             ────────────────────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Quando você atende este aluno?</h4>
                <p className="text-xs text-zinc-400 mb-3">
                  Selecione os dias da semana em que há atendimento regular.
                </p>

                <div className="grid grid-cols-7 gap-1.5">
                  {([1, 2, 3, 4, 5, 6, 0] as DayOfWeek[]).map((day) => {
                    const isSelected = selectedDays[day];
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`py-2.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-orange-500 text-black font-extrabold shadow-md shadow-orange-500/20'
                            : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700 font-semibold'
                        }`}
                      >
                        <span className="text-[10px] uppercase">{DAYS_OF_WEEK_LABELS[day].short}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Configure times for each selected day */}
              <div className="pt-2 border-t border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wide">
                    Horários de Atendimento por Dia
                  </h4>
                  <button
                    type="button"
                    onClick={() => applyTimeToAllSelected(dayTimes[1] || '07:00')}
                    className="text-[11px] text-orange-400 hover:text-orange-300 font-semibold underline"
                  >
                    Igualar horários
                  </button>
                </div>

                <div className="space-y-2">
                  {([1, 2, 3, 4, 5, 6, 0] as DayOfWeek[]).map((day) => {
                    if (!selectedDays[day]) return null;

                    return (
                      <div
                        key={day}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-orange-400" />
                          <span className="text-xs font-bold text-white">
                            {DAYS_OF_WEEK_LABELS[day].long}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          <input
                            type="time"
                            value={dayTimes[day]}
                            onChange={(e) => handleTimeChange(day, e.target.value)}
                            className="bg-zinc-950 text-orange-400 font-mono font-bold text-sm px-2.5 py-1 rounded-lg border border-zinc-700 focus:border-orange-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              ETAPA 3: PONTOS DE ATENÇÃO
             ────────────────────────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white mb-0.5">
                  O que você precisa lembrar sobre este aluno?
                </h4>
                <p className="text-xs text-zinc-400">
                  Registre aqui informações importantes para revisar antes do treino.
                </p>
              </div>

              {/* Existing Points List */}
              {attentionPoints.length > 0 && (
                <div className="space-y-2">
                  {attentionPoints.map((pt) => (
                    <div
                      key={pt.id}
                      className="p-3 rounded-xl bg-[#141210] border border-orange-500/30 flex items-start justify-between gap-2 shadow-sm"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-orange-400">
                            {pt.title}
                          </span>
                          <span className="text-[10px] text-zinc-400 px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800">
                            {pt.category}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-200">{pt.condition}</p>
                        <p className="text-[11px] text-orange-300 font-medium">
                          Lembrar: {pt.whatToRemember}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemovePoint(pt.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-900"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Point Toggle & Sub-form */}
              {!isAddingPoint ? (
                <button
                  type="button"
                  onClick={() => setIsAddingPoint(true)}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-orange-500/40 hover:border-orange-500 bg-orange-500/5 hover:bg-orange-500/10 text-orange-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  + Adicionar Ponto de Atenção
                </button>
              ) : (
                <div className="p-4 rounded-xl bg-zinc-900 border border-orange-500/40 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                      Novo Ponto de Atenção
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingPoint(false)}
                      className="text-xs text-zinc-500 hover:text-white"
                    >
                      Cancelar
                    </button>
                  </div>

                  {/* Category Selector */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1.5">
                      Categoria:
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {ATTENTION_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setPointCategory(cat.id)}
                          className={`p-2 rounded-lg text-left text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                            pointCategory === cat.id
                              ? 'bg-orange-500 text-black font-bold border-orange-500'
                              : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <span>{cat.icon}</span>
                          <span className="truncate">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Pill Suggestions based on category */}
                  <div>
                    <span className="text-[10px] text-zinc-500 block mb-1">Sugestões rápidas:</span>
                    <div className="flex flex-wrap gap-1">
                      {(pointCategory === 'articulations'
                        ? COMMON_ARTICULATIONS
                        : pointCategory === 'pain'
                        ? COMMON_PAIN_TYPES
                        : COMMON_RESTRICTIONS
                      ).map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => {
                            setPointTitle(sug);
                          }}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-orange-500/50"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title & Local */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-0.5">
                        Problema / Título *
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Joelho direito"
                        value={pointTitle}
                        onChange={(e) => setPointTitle(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-0.5">
                        Local específico
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Face anterior"
                        value={pointLocation}
                        onChange={(e) => setPointLocation(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Condição / O que acontece */}
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-0.5">
                      O que foi relatado pelo aluno? (Condição)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Dor relatada durante exercícios com maior flexão de joelho."
                      value={pointCondition}
                      onChange={(e) => setPointCondition(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  {/* Quando acontece & Movimentos relacionados */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-0.5">
                        Quando acontece?
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Em amplitude profunda"
                        value={pointWhenHappens}
                        onChange={(e) => setPointWhenHappens(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-0.5">
                        Movimentos (vírgula)
                      </label>
                      <input
                        type="text"
                        placeholder="Agachamento, Leg Press"
                        value={pointRelatedMovements}
                        onChange={(e) => setPointRelatedMovements(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* O que devo lembrar no treino */}
                  <div>
                    <label className="block text-[10px] font-bold text-orange-400 uppercase mb-0.5">
                      O que devo lembrar durante o treino? *
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ex: Observar tolerância durante o movimento e ajustar amplitude se necessário."
                      value={pointWhatToRemember}
                      onChange={(e) => setPointWhatToRemember(e.target.value)}
                      className="w-full bg-zinc-950 border border-orange-500/40 rounded-lg p-2 text-xs text-white focus:border-orange-500 focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={!pointTitle.trim()}
                    onClick={handleAddAttentionPoint}
                    className="w-full py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-black font-bold text-xs uppercase"
                  >
                    Confirmar Ponto de Atenção
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              ETAPA 4: MOVIMENTOS DE ATENÇÃO
             ────────────────────────────────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white mb-0.5">Movimentos para Lembrar</h4>
                <p className="text-xs text-zinc-400">
                  Exercícios específicos que exigem observação de carga, amplitude ou postura.
                </p>
              </div>

              {movements.length > 0 && (
                <div className="space-y-2">
                  {movements.map((mov) => (
                    <div
                      key={mov.id}
                      className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start justify-between gap-2"
                    >
                      <div className="text-xs space-y-0.5">
                        <span className="font-bold text-white">{mov.exercise}</span>
                        <p className="text-zinc-300">{mov.notes}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveMovement(mov.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {!isAddingMovement ? (
                <button
                  type="button"
                  onClick={() => setIsAddingMovement(true)}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-zinc-800 hover:border-orange-500/40 bg-zinc-900/50 text-zinc-300 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-orange-400" />
                  + Adicionar Exercício de Atenção
                </button>
              ) : (
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
                    <span className="text-xs font-bold text-white">Novo Exercício / Movimento</span>
                    <button
                      type="button"
                      onClick={() => setIsAddingMovement(false)}
                      className="text-xs text-zinc-500 hover:text-white"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-0.5">
                      Exercício *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Agachamento Livre / Leg Press"
                      value={movExercise}
                      onChange={(e) => setMovExercise(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-0.5">
                        Amplitude
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Até 90°"
                        value={movAmplitude}
                        onChange={(e) => setMovAmplitude(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-0.5">
                        Carga
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Moderar"
                        value={movLoad}
                        onChange={(e) => setMovLoad(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-0.5">
                        Posição
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Pés abertos"
                        value={movPosition}
                        onChange={(e) => setMovPosition(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 text-xs text-white focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-orange-400 uppercase mb-0.5">
                      Observação para Lembrar no Treino
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Atenção à tolerância na amplitude profunda."
                      value={movNotes}
                      onChange={(e) => setMovNotes(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={!movExercise.trim()}
                    onClick={handleAddMovement}
                    className="w-full py-2 rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-black font-bold text-xs uppercase"
                  >
                    Salvar Movimento
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────
              ETAPA 5: CONFIGURAÇÃO DE LEMBRETE
             ────────────────────────────────────────────────────────── */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white mb-0.5">
                  Quando você quer ser lembrado?
                </h4>
                <p className="text-xs text-zinc-400">
                  O aplicativo disparará o lembrete de preparação antes do início da sessão.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { mins: 5, label: '5 minutos antes', desc: 'Lembrete imediato pré-aquecimento' },
                  { mins: 10, label: '10 minutos antes', desc: 'Recomendado: tempo ideal para revisar cuidados' },
                  { mins: 15, label: '15 minutos antes', desc: 'Preparação com antecedência' },
                  { mins: 30, label: '30 minutos antes', desc: 'Lembrete geral do atendimento' },
                  { mins: 60, label: '1 hora antes', desc: 'Planejamento prévio' },
                ].map((item) => {
                  const isChecked = leadTimes.includes(item.mins);
                  return (
                    <button
                      key={item.mins}
                      type="button"
                      onClick={() => toggleLeadTime(item.mins)}
                      className={`w-full p-3 rounded-xl flex items-center justify-between border text-left transition-all ${
                        isChecked
                          ? 'bg-orange-500/10 border-orange-500 text-white'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold block text-white">{item.label}</span>
                        <span className="text-[11px] text-zinc-400">{item.desc}</span>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                          isChecked
                            ? 'bg-orange-500 border-orange-500 text-black'
                            : 'border-zinc-700 bg-zinc-950'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 space-y-1">
                <span className="font-bold text-zinc-300 block">Como funcionam os lembretes:</span>
                <p>
                  Antes de cada atendimento, você verá a notificação e o modo &ldquo;Antes do Treino&rdquo; na tela inicial com todos os pontos para revisar.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Step Navigation */}
        <div className="p-4 bg-[#121215] border-t border-zinc-800 flex items-center justify-between flex-shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              disabled={step === 1 && !name.trim()}
              onClick={() => setStep((s) => s + 1)}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-black text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md shadow-orange-500/20"
            >
              Avançar
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSaving || !name.trim()}
              onClick={handleFinalSave}
              className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-black text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg shadow-orange-500/30"
            >
              {isSaving ? 'Salvando...' : initialStudent ? 'Atualizar Aluno' : 'Concluir Cadastro'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
