import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Download,
  Upload,
  ShieldCheck,
  Smartphone,
  Info,
  CheckCircle2,
  RefreshCw,
  Lock,
  Volume2,
  Clock,
  Radio,
} from 'lucide-react';
import {
  NotificationPermissionState,
  requestNotificationPermission,
  sendLocalNotification,
  scheduleDelayedTestNotification,
} from '../lib/notifications';
import { exportAllData, importAllData, resetToDefaultSeed } from '../lib/db';

interface SettingsViewProps {
  notificationStatus: NotificationPermissionState;
  onRefreshNotifications: () => void;
  onDataChanged: () => void;
  installPrompt: any;
  onInstallApp: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  notificationStatus,
  onRefreshNotifications,
  onDataChanged,
  installPrompt,
  onInstallApp,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [testSent, setTestSent] = useState(false);
  const [delayTestCountdown, setDelayTestCountdown] = useState<number | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [swActive, setSwActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      setSwActive(true);
    } else if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => setSwActive(true));
    }
  }, []);

  const handleRequestPermission = async () => {
    await requestNotificationPermission();
    onRefreshNotifications();
  };

  const handleTestNotification = async () => {
    setTestSent(true);
    await sendLocalNotification({
      title: '🔔 TESTE DE LEMBRETE — LEMBRA PERSONAL',
      body: 'Seu aluno José Silva chega em 10 minutos. Ponto de atenção: joelho direito.',
      tag: `test-${Date.now()}`,
    });
    setTimeout(() => setTestSent(false), 3000);
  };

  const handleScheduleDelayedTest = async () => {
    setDelayTestCountdown(5);
    await scheduleDelayedTestNotification(5);

    let count = 5;
    const interval = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(interval);
        setDelayTestCountdown(null);
      } else {
        setDelayTestCountdown(count);
      }
    }, 1000);
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const json = await exportAllData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lembra_personal_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao exportar dados:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = await importAllData(content);
        if (res.success) {
          setImportStatus(`Sucesso! ${res.studentCount} alunos importados.`);
          onDataChanged();
        } else {
          setImportStatus(`Erro: ${res.error || 'Falha ao importar.'}`);
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetSeed = async () => {
    if (window.confirm('Deseja restaurar os alunos e atendimentos de exemplo? Isso substituirá os dados atuais.')) {
      setIsResetting(true);
      await resetToDefaultSeed();
      onDataChanged();
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-5 pb-24 text-left">
      <div>
        <h2 className="text-xl font-extrabold text-white font-heading tracking-tight">
          CONFIGURAÇÕES & AJUSTES
        </h2>
        <p className="text-xs text-zinc-400">
          Notificações em segundo plano, backup local e diretrizes de privacidade.
        </p>
      </div>

      {/* 1. STATUS DOS LEMBRETES & SEGUNDO PLANO */}
      <div className="rounded-2xl bg-[#121215] border border-zinc-800 p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
              NOTIFICAÇÕES EM SEGUNDO PLANO
            </h3>
          </div>

          <span
            className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
              notificationStatus === 'granted'
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                : 'bg-orange-500/15 text-orange-400 border-orange-500/40'
            }`}
          >
            {notificationStatus === 'granted' ? '✓ Notificações Ativas' : '⚠ Permissão Pendente'}
          </span>
        </div>

        {/* Diagnóstico técnico */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
          <div className="flex items-center gap-1.5">
            <CheckCircle2
              className={`w-3.5 h-3.5 ${
                notificationStatus === 'granted' ? 'text-emerald-400' : 'text-zinc-600'
              }`}
            />
            <span className="text-zinc-300">Permissão do Sistema</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Radio
              className={`w-3.5 h-3.5 ${
                swActive ? 'text-emerald-400 animate-pulse' : 'text-zinc-600'
              }`}
            />
            <span className="text-zinc-300">Service Worker (2º Plano)</span>
          </div>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          {notificationStatus === 'granted'
            ? 'O Service Worker está configurado para agendar e disparar alertas sonoros com o nome do aluno e pontos de atenção mesmo com o app minimizado ou em segundo plano.'
            : 'Ative as notificações para receber os avisos automáticos antes de cada atendimento.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          {notificationStatus !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-xs uppercase tracking-wider transition-colors shadow-md shadow-orange-500/20"
            >
              Ativar Notificações
            </button>
          )}

          <button
            onClick={handleTestNotification}
            className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-zinc-700 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5 text-orange-400" />
            <span>{testSent ? '✓ Alerta Disparado!' : 'Testar Imediato'}</span>
          </button>

          <button
            onClick={handleScheduleDelayedTest}
            disabled={delayTestCountdown !== null}
            className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-zinc-700 transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            <span>
              {delayTestCountdown !== null
                ? `Bloqueie a tela! Disparo em ${delayTestCountdown}s...`
                : 'Testar em 2º Plano (5s)'}
            </span>
          </button>
        </div>

        {delayTestCountdown !== null && (
          <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-xs text-orange-300 animate-pulse">
            ⏱ <strong>Dica de teste:</strong> Minimize o app ou bloqueie a tela do celular agora para ver a notificação chegar em segundo plano!
          </div>
        )}
      </div>

      {/* 2. INSTALAÇÃO PWA */}
      <div className="rounded-2xl bg-[#121215] border border-orange-500/30 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-orange-400" />
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
            INSTALAR NA TELA INICIAL (PWA)
          </h3>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          Para que as notificações e a sincronização em segundo plano funcionem com máxima confiabilidade no celular, instale o <strong>Lembra Personal</strong> na tela inicial.
        </p>

        {installPrompt ? (
          <button
            onClick={onInstallApp}
            className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-transform active:scale-98"
          >
            <Smartphone className="w-4 h-4" />
            Adicionar à Tela Inicial Agora
          </button>
        ) : (
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 space-y-1.5">
            <span className="font-bold text-zinc-300 block">Como instalar no seu celular:</span>
            <ul className="list-disc pl-4 space-y-1 text-zinc-300">
              <li>
                <strong>No iPhone (Safari):</strong> Toque no ícone Compartilhar (quadrado com seta para cima) e selecione <em>&ldquo;Adicionar à Tela de Início&rdquo;</em> (requer iOS 16.4+ para notificações push em segundo plano).
              </li>
              <li>
                <strong>No Android (Chrome):</strong> Toque no menu de três pontinhos no topo e selecione <em>&ldquo;Instalar aplicativo&rdquo;</em> ou <em>&ldquo;Adicionar à tela inicial&rdquo;</em>.
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* 3. BACKUP MANUAL & RESTAURAÇÃO */}
      <div className="rounded-2xl bg-[#121215] border border-zinc-800 p-4 space-y-3.5">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-orange-400" />
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
            BACKUP & EXPORTAÇÃO
          </h3>
        </div>

        <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-300/90 leading-relaxed">
          Seus dados ficam armazenados neste dispositivo (IndexedDB). Recomendamos fazer um backup periodicamente para transferir a outro celular ou proteger suas anotações.
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            disabled={isExporting}
            onClick={handleExportData}
            className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-zinc-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-orange-400" />
            <span>{isExporting ? 'Exportando...' : 'Exportar Backup'}</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-zinc-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-orange-400" />
            <span>Restaurar Backup</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        {importStatus && (
          <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200">
            {importStatus}
          </div>
        )}

        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
          <span className="text-xs text-zinc-500">Dados de demonstração:</span>
          <button
            disabled={isResetting}
            onClick={handleResetSeed}
            className="text-xs text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Restaurar Alunos de Exemplo
          </button>
        </div>
      </div>

      {/* 4. PRIVACIDADE E SEGURANÇA */}
      <div className="rounded-2xl bg-[#121215] border border-zinc-800 p-4 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-white font-bold">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>Privacidade e Segurança dos Dados</span>
        </div>
        <p className="text-zinc-400 leading-relaxed">
          As informações cadastradas são armazenadas <strong>localmente neste dispositivo</strong>. Não envie informações desnecessárias e registre somente aquilo que for relevante para o acompanhamento profissional do aluno. Nenhuma informação é compartilhada com APIs ou servidores externos.
        </p>
      </div>

      {/* 5. AVISO DE RESPONSABILIDADE PROFISSIONAL */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 text-[11px] text-zinc-500 leading-relaxed space-y-2">
        <p>
          Este aplicativo é uma ferramenta de organização e lembrete profissional. Não substitui avaliação médica, fisioterapêutica ou qualquer avaliação clínica necessária. O Personal Trainer é inteiramente responsável pela utilização das informações registradas e pela condução do treinamento dentro de sua competência profissional.
        </p>
        <div className="pt-2 border-t border-zinc-900 text-center text-zinc-500 text-[11px]">
          Desenvolvido por Felipe Dias • Versão PWA 1.0.0
        </div>
      </div>
    </div>
  );
};
