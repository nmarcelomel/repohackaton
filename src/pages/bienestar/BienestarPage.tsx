import { useState, useMemo, useEffect, useRef } from "react";
import {
  Heart,
  Star,
  AlertTriangle,
  Send,
  TrendingUp,
  TrendingDown,
  Activity,
  Lightbulb,
  CheckCircle,
  XCircle,
  Zap,
  Shield,
  Users,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getTeams,
  getUsers,
  getKudos,
  getMoodHistoryByTeam,
  getWellnessSuggestions,
} from "../../data/data-service";
import type { Team, User, Kudos, WellnessSuggestion, MemberMood } from "../../types";
import { getAverageMood, calculateHealthScore, isAtBurnoutRisk, getScoreColor, getScoreBg, getScoreLabel, getCategoryEmoji, getUserName } from "./bienestar.utils";

/* ─── Tipos internos ─── */

type MoodValue = "excelente" | "neutral" | "bajo";

type MoodOption = {
  emoji: string;
  label: string;
  value: MoodValue;
};

type TimelineEvent = {
  id: string;
  type: "mood_change" | "risk_detected" | "risk_resolved" | "kudo_sent";
  message: string;
  timestamp: Date;
  icon: string;
};

const MOOD_OPTIONS: MoodOption[] = [
  { emoji: "😃", label: "Me siento genial", value: "excelente" },
  { emoji: "😐", label: "Normal", value: "neutral" },
  { emoji: "😫", label: "Agotado", value: "bajo" },
];

const INTERACTIVE_TEAM_ID = "team-siniestros";
const JURY_USER_ID = "user-jury";

/* ─── Toast / Notificaciones ─── */

function Toast({ message, type, onClose }: { message: string; type: "success" | "warning" | "info"; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgClass = type === "success" ? "bg-green-600" : type === "warning" ? "bg-amber-500" : "bg-blue-600";

  return (
    <div className={`fixed top-6 right-6 z-50 ${bgClass} text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in`}>
      <span className="text-lg">{type === "success" ? "🎉" : type === "warning" ? "⚠️" : "ℹ️"}</span>
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="ml-2 text-white/70 hover:text-white text-lg">&times;</button>
    </div>
  );
}

/* ─── Banner Resumen Ejecutivo ─── */

function ExecutiveSummary({ teams }: { teams: Team[] }) {
  const totalTeams = teams.length;
  const healthyTeams = teams.filter((t) => !isAtBurnoutRisk(t)).length;
  const avgMoodGlobal = teams.reduce((sum, t) => sum + getAverageMood(t), 0) / totalTeams;
  const activeAlerts = teams.filter(isAtBurnoutRisk).length;
  const avgScore = Math.round(teams.reduce((sum, t) => sum + calculateHealthScore(t), 0) / totalTeams);

  return (
    <section className="mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-bolivar-gray-light shadow-sm transition-all duration-500">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-500 font-medium">Equipos Saludables</span>
          </div>
          <p className={`text-3xl font-bold ${healthyTeams === totalTeams ? "text-green-600" : "text-amber-600"}`}>
            {healthyTeams}/{totalTeams}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-bolivar-gray-light shadow-sm transition-all duration-500">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-4 h-4 text-red-400" />
            <span className="text-xs text-gray-500 font-medium">Ánimo Promedio</span>
          </div>
          <p className={`text-3xl font-bold ${avgMoodGlobal >= 3.5 ? "text-green-600" : avgMoodGlobal >= 2.5 ? "text-amber-600" : "text-red-600"}`}>
            {avgMoodGlobal.toFixed(1)}<span className="text-lg text-gray-400">/5</span>
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-bolivar-gray-light shadow-sm transition-all duration-500">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-gray-500 font-medium">Alertas Activas</span>
          </div>
          <p className={`text-3xl font-bold ${activeAlerts === 0 ? "text-green-600" : "text-red-600"}`}>
            {activeAlerts}
          </p>
          {activeAlerts === 0 && <p className="text-xs text-green-500 mt-0.5">Todo en orden ✓</p>}
        </div>

        <div className="bg-white rounded-xl p-4 border border-bolivar-gray-light shadow-sm transition-all duration-500">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-bolivar-green" />
            <span className="text-xs text-gray-500 font-medium">Score Promedio</span>
          </div>
          <p className={`text-3xl font-bold ${getScoreColor(avgScore)}`}>
            {avgScore}
          </p>
          <p className={`text-xs mt-0.5 ${getScoreColor(avgScore)}`}>{getScoreLabel(avgScore)}</p>
        </div>
      </div>
    </section>
  );
}

/* ─── Niko-Niko Mood Selector (interactivo) ─── */

function NikoNikoThermometer({ selectedMood, onSelectMood }: {
  selectedMood: MoodValue | null;
  onSelectMood: (mood: MoodValue) => void;
}) {
  return (
    <section className="sb-ui-card sb-ui-card--elevated mb-6 overflow-hidden relative">
      {selectedMood && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 left-4 text-2xl animate-float opacity-20">💚</div>
          <div className="absolute top-4 right-8 text-xl animate-float-delayed opacity-15">✨</div>
          <div className="absolute bottom-2 left-1/3 text-lg animate-float opacity-10">🌱</div>
        </div>
      )}
      <div className="sb-ui-card__content relative">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-red-400" />
          <h2 className="sb-ui-heading-h5">¿Cómo te sientes hoy?</h2>
        </div>
        <p className="text-center text-xs text-gray-500 mb-3">
          Tu respuesta impacta los indicadores del equipo <span className="font-semibold text-bolivar-green">Siniestros</span> en tiempo real
        </p>
        <div className="flex items-center justify-center gap-6">
          {MOOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelectMood(option.value)}
              aria-label={option.label}
              className={`flex flex-col items-center gap-1 p-4 rounded-xl transition-all duration-300 cursor-pointer
                ${
                  selectedMood === option.value
                    ? "bg-bolivar-green/10 ring-2 ring-bolivar-green scale-110 shadow-lg"
                    : "hover:bg-gray-100 hover:scale-105"
                }`}
            >
              <span className="text-4xl" role="img" aria-label={option.label}>
                {option.emoji}
              </span>
              <span className="sb-ui-text-caption text-xs">{option.label}</span>
            </button>
          ))}
        </div>
        {selectedMood && (
          <p className="text-center mt-3 sb-ui-text-body text-sm text-bolivar-green font-medium animate-fade-in">
            ¡Gracias por compartir! Tu bienestar nos importa 💚
          </p>
        )}
      </div>
    </section>
  );
}

/* ─── Pulso del Equipo (Recharts) ─── */

function TeamPulse({ teams }: { teams: Team[] }) {
  return (
    <section className="sb-ui-card sb-ui-card--elevated mb-6">
      <div className="sb-ui-card__content">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-purple-500" />
          <h2 className="sb-ui-heading-h5">Pulso Semanal del Equipo</h2>
        </div>
        <div className="space-y-5">
          {teams.map((team) => {
            const history = getMoodHistoryByTeam(team.id);
            const chartData = history.map((h) => ({
              week: h.week.replace("2026-", ""),
              avgMood: h.avgMood,
            }));
            const latest = history[history.length - 1]?.avgMood || 0;
            const previous = history[history.length - 2]?.avgMood || latest;
            const trend = latest - previous;
            const isUp = trend >= 0;
            const chartColor = latest >= 4 ? "#22c55e" : latest >= 3 ? "#eab308" : "#ef4444";

            return (
              <div key={team.id} className="p-3 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{team.name}</span>
                  <div className="flex items-center gap-1">
                    {isUp ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-xs font-semibold ${isUp ? "text-green-600" : "text-red-600"}`}>
                      {trend >= 0 ? "+" : ""}{trend.toFixed(1)}
                    </span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={60}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`gradient-${team.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColor} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={chartColor} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="week" hide />
                    <YAxis domain={[0, 5]} hide />
                    <Tooltip
                      contentStyle={{ fontSize: "11px", borderRadius: "8px" }}
                      formatter={(value: number) => [value.toFixed(1), "Ánimo"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="avgMood"
                      stroke={chartColor}
                      strokeWidth={2}
                      fill={`url(#gradient-${team.id})`}
                      animationDuration={800}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Índice de Sostenibilidad ─── */

function SustainabilityIndex({ teams }: { teams: Team[] }) {
  return (
    <section className="sb-ui-card sb-ui-card--elevated mb-6">
      <div className="sb-ui-card__content">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-yellow-500" />
          <h2 className="sb-ui-heading-h5">Índice de Sostenibilidad</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {teams.map((team) => {
            const score = calculateHealthScore(team);
            return (
              <div
                key={team.id}
                className={`p-4 rounded-lg border text-center transition-all duration-500 ${getScoreBg(score)}`}
              >
                <p className="text-xs text-gray-500 mb-1">{team.name}</p>
                <p className={`text-3xl font-bold transition-colors duration-500 ${getScoreColor(score)}`}>
                  {score}
                </p>
                <p className={`text-xs font-medium mt-1 transition-colors duration-500 ${getScoreColor(score)}`}>
                  {getScoreLabel(score)}
                </p>
                <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                  <p>Ánimo: {getAverageMood(team).toFixed(1)}/5</p>
                  <p>WIP: {team.wipCurrent}/{team.wipLimit}</p>
                  <p>Deploy freq: {team.doraMetrics.deploymentFrequency}/sem</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Burnout Radar ─── */

function BurnoutRadar({ teams }: { teams: Team[] }) {
  const atRisk = teams.filter(isAtBurnoutRisk);
  const safe = teams.filter((t) => !isAtBurnoutRisk(t));

  return (
    <section className="sb-ui-card sb-ui-card--elevated mb-6">
      <div className="sb-ui-card__content">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <h2 className="sb-ui-heading-h5">Radar de Burnout</h2>
        </div>

        {atRisk.length > 0 ? (
          <div className="space-y-3 transition-all duration-500">
            {atRisk.map((team) => (
              <div
                key={team.id}
                className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200 animate-pulse"
                role="alert"
              >
                <span className="text-2xl">🚨</span>
                <div>
                  <p className="font-semibold text-red-800">
                    Riesgo Alto de Burnout en {team.name}
                  </p>
                  <p className="text-sm text-red-600">
                    WIP: {team.wipCurrent}/{team.wipLimit} · Ánimo promedio:{" "}
                    {getAverageMood(team).toFixed(1)}/5
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200 transition-all duration-500">
            <span className="text-2xl">✅</span>
            <p className="text-green-800 font-medium">
              Todas las células están en niveles saludables
            </p>
          </div>
        )}

        {safe.length > 0 && atRisk.length > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-gray-50">
            <p className="text-sm text-gray-600">
              <Star className="w-4 h-4 inline text-green-500 mr-1" />
              {safe.map((t) => t.name).join(", ")}: sin alertas
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── Sugerencias de Acción ─── */

function ActionSuggestions({ teams }: { teams: Team[] }) {
  const suggestions = getWellnessSuggestions();
  const critical = suggestions.filter((s) => s.type === "critical");
  const positive = suggestions.filter((s) => s.type === "positive");

  function getTeamName(teamId: string): string {
    return teams.find((t) => t.id === teamId)?.name || teamId;
  }

  return (
    <section className="sb-ui-card sb-ui-card--elevated mb-6">
      <div className="sb-ui-card__content">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h2 className="sb-ui-heading-h5">Sugerencias Inteligentes</h2>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">IA</span>
        </div>

        {critical.length > 0 && (
          <div className="space-y-2 mb-4">
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Acciones urgentes</p>
            {critical.map((s, i) => (
              <SuggestionCard key={i} suggestion={s} teamName={getTeamName(s.teamId)} />
            ))}
          </div>
        )}

        {positive.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Oportunidades</p>
            {positive.map((s, i) => (
              <SuggestionCard key={i} suggestion={s} teamName={getTeamName(s.teamId)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SuggestionCard({ suggestion, teamName }: { suggestion: WellnessSuggestion; teamName: string }) {
  const isCritical = suggestion.type === "critical";
  return (
    <div className={`p-3 rounded-lg border ${isCritical ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"}`}>
      <div className="flex items-start gap-2">
        {isCritical ? <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" /> : <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />}
        <div>
          <p className="text-sm font-medium"><span className="text-gray-500">{teamName}:</span> {suggestion.message}</p>
          <p className="text-xs text-gray-500 mt-1">→ {suggestion.action}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Timeline de Acciones ─── */

function ActionTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) return null;

  return (
    <section className="sb-ui-card sb-ui-card--elevated mb-6">
      <div className="sb-ui-card__content">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-500" />
          <h2 className="sb-ui-heading-h5">Actividad Reciente</h2>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">En vivo</span>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {events.map((event) => (
            <div key={event.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors animate-fade-in">
              <span className="text-lg mt-0.5">{event.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">{event.message}</p>
                <p className="text-xs text-gray-400">
                  {event.timestamp.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Muro de Kudos ─── */

const KUDO_CATEGORIES: { value: Kudos["category"]; label: string; emoji: string }[] = [
  { value: "colaboracion", label: "Colaboración", emoji: "🤝" },
  { value: "innovacion", label: "Innovación", emoji: "💡" },
  { value: "liderazgo", label: "Liderazgo", emoji: "🌟" },
  { value: "calidad", label: "Calidad", emoji: "🎯" },
];

function KudosWall({ onKudoSent }: { onKudoSent: (kudo: Kudos) => void }) {
  const initialKudos = getKudos();
  const users = getUsers();
  const [kudosList, setKudosList] = useState<Kudos[]>(initialKudos);
  const [showForm, setShowForm] = useState(false);
  const [toUserId, setToUserId] = useState("");
  const [category, setCategory] = useState<Kudos["category"]>("colaboracion");
  const [message, setMessage] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const currentUserId = users[0]?.id || "unknown";

  function handleSubmitKudo(e: React.FormEvent) {
    e.preventDefault();
    if (!toUserId || !message.trim()) return;

    const newKudo: Kudos = {
      id: `kudo-${Date.now()}`,
      fromUserId: currentUserId,
      toUserId,
      message: message.trim(),
      category,
      date: new Date().toISOString().split("T")[0],
    };

    setKudosList([newKudo, ...kudosList]);
    setShowForm(false);
    setToUserId("");
    setCategory("colaboracion");
    setMessage("");
    setSuccessMsg("¡Kudo enviado con éxito! 🎉");
    onKudoSent(newKudo);
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  return (
    <section className="sb-ui-card sb-ui-card--elevated">
      <div className="sb-ui-card__content">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <h2 className="sb-ui-heading-h5">Muro de Kudos</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="sb-ui-btn sb-ui-btn--primary sb-ui-btn--sm flex items-center gap-1"
          >
            <Send className="w-3 h-3" />
            <span>{showForm ? "Cancelar" : "Enviar Kudo"}</span>
          </button>
        </div>

        {successMsg && (
          <div className="mb-3 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-medium text-center animate-fade-in">
            {successMsg}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmitKudo} className="mb-4 p-4 rounded-lg bg-bolivar-gray-bg border border-bolivar-gray-light space-y-3 animate-fade-in">
            <div>
              <label htmlFor="kudo-to" className="block text-xs font-medium text-gray-600 mb-1">¿A quién quieres reconocer?</label>
              <select id="kudo-to" value={toUserId} onChange={(e) => setToUserId(e.target.value)} required className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolivar-green focus:border-bolivar-green outline-none">
                <option value="">Selecciona un compañero...</option>
                {users.filter((u) => u.id !== currentUserId).map((u) => (
                  <option key={u.id} value={u.id}>{u.name} — {u.role}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Categoría</label>
              <div className="flex gap-2 flex-wrap">
                {KUDO_CATEGORIES.map((cat) => (
                  <button key={cat.value} type="button" onClick={() => setCategory(cat.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${category === cat.value ? "bg-bolivar-green text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:border-bolivar-green"}`}>
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="kudo-message" className="block text-xs font-medium text-gray-600 mb-1">Mensaje</label>
              <textarea id="kudo-message" value={message} onChange={(e) => setMessage(e.target.value)} required maxLength={200} rows={2} placeholder="Escribe por qué reconoces a esta persona..." className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolivar-green focus:border-bolivar-green outline-none resize-none" />
              <p className="text-xs text-gray-400 text-right">{message.length}/200</p>
            </div>
            <button type="submit" disabled={!toUserId || !message.trim()} className="w-full py-2 px-4 rounded-lg text-sm font-medium text-white bg-bolivar-green hover:bg-bolivar-green-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Enviar reconocimiento 🎉
            </button>
          </form>
        )}

        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {kudosList.map((kudo) => (
            <article key={kudo.id} className="p-3 rounded-lg bg-gray-50 border border-gray-100 hover:border-bolivar-green/30 transition-colors">
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{getCategoryEmoji(kudo.category)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold text-bolivar-green">{getUserName(kudo.fromUserId, users)}</span>{" "}reconoció a{" "}<span className="font-semibold">{getUserName(kudo.toUserId, users)}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{kudo.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{kudo.date}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Page Layout (state lifted here for full interactivity) ─── */

export function BienestarPage() {
  const [juryMood, setJuryMood] = useState<MoodValue | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "warning" | "info" } | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const prevRiskRef = useRef<boolean>(true);

  const users = getUsers();

  const teams: Team[] = useMemo(() => {
    const baseTeams = getTeams();
    if (!juryMood) return baseTeams;

    return baseTeams.map((team) => {
      if (team.id !== INTERACTIVE_TEAM_ID) return team;
      const juryMember: MemberMood = {
        userId: JURY_USER_ID,
        mood: juryMood,
        date: new Date().toISOString().split("T")[0],
      };
      return { ...team, memberMood: [...team.memberMood, juryMember] };
    });
  }, [juryMood]);

  /** Detectar cambios de estado de riesgo y emitir notificaciones. */
  useEffect(() => {
    if (!juryMood) return;

    const interactiveTeam = teams.find((t) => t.id === INTERACTIVE_TEAM_ID);
    if (!interactiveTeam) return;

    const currentlyAtRisk = isAtBurnoutRisk(interactiveTeam);

    if (prevRiskRef.current && !currentlyAtRisk) {
      setToast({ message: "🎉 ¡Siniestros salió del riesgo de burnout! El equipo está saludable.", type: "success" });
      addTimelineEvent("risk_resolved", "Siniestros salió del riesgo de burnout gracias a la mejora del ánimo", "✅");
    } else if (!prevRiskRef.current && currentlyAtRisk) {
      setToast({ message: "⚠️ Siniestros entró en riesgo de burnout. Se requiere atención.", type: "warning" });
      addTimelineEvent("risk_detected", "Se detectó riesgo de burnout en Siniestros", "🚨");
    }

    const moodLabels: Record<MoodValue, string> = { excelente: "😃 Genial", neutral: "😐 Normal", bajo: "😫 Agotado" };
    addTimelineEvent("mood_change", `El jurado reportó su ánimo: ${moodLabels[juryMood]}`, "💬");

    prevRiskRef.current = currentlyAtRisk;
  }, [juryMood, teams]);

  function addTimelineEvent(type: TimelineEvent["type"], message: string, icon: string) {
    setTimeline((prev) => [
      { id: `event-${Date.now()}-${Math.random()}`, type, message, timestamp: new Date(), icon },
      ...prev,
    ].slice(0, 20));
  }

  function handleKudoSent(kudo: Kudos) {
    const toName = getUserName(kudo.toUserId, users);
    addTimelineEvent("kudo_sent", `Kudo enviado a ${toName} por ${getCategoryEmoji(kudo.category)} ${kudo.category}`, "🏆");
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ExecutiveSummary teams={teams} />

      <NikoNikoThermometer selectedMood={juryMood} onSelectMood={setJuryMood} />

      <SustainabilityIndex teams={teams} />

      <div className="sb-ui-grid">
        <div className="sb-ui-col-12 sb-ui-col-md-7">
          <BurnoutRadar teams={teams} />
          <ActionSuggestions teams={teams} />
          <ActionTimeline events={timeline} />
        </div>
        <div className="sb-ui-col-12 sb-ui-col-md-5">
          <TeamPulse teams={teams} />
          <KudosWall onKudoSent={handleKudoSent} />
        </div>
      </div>
    </div>
  );
}
