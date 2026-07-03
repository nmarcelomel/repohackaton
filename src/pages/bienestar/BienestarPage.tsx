import { Heart, Smile, Meh, Frown, Star, AlertTriangle } from "lucide-react";
import { getTeams, getUsersByTeam } from "../../data/data-service";

const moodConfig: Record<string, { icon: typeof Smile; label: string; color: string }> = {
 excelente: { icon: Star, label: "Excelente", color: "text-green-600" },
 bien: { icon: Smile, label: "Bien", color: "text-blue-500" },
 neutral: { icon: Meh, label: "Neutral", color: "text-yellow-500" },
 bajo: { icon: Frown, label: "Bajo", color: "text-orange-500" },
 critico: { icon: AlertTriangle, label: "Crítico", color: "text-red-500" },
};

export function BienestarPage() {
 const teams = getTeams();

 return (
 <div className="space-y-6">
 <div className="sb-ui-grid">
 {teams.map((team) => {
 const members = getUsersByTeam(team.id);
 return (
 <div key={team.id} className="sb-ui-col-12 sb-ui-col-md-4">
 <article className="sb-ui-card sb-ui-card--elevated">
 <div className="sb-ui-card__content">
 <div className="flex items-center gap-2 mb-3">
 <Heart className="w-5 h-5 text-bolivar-green" />
 <h3 className="sb-ui-heading-h6">{team.name}</h3>
 </div>
 <div className="space-y-3">
 {team.memberMood.map((mood) => {
 const user = members.find((u) => u.id === mood.userId);
 const config = moodConfig[mood.mood];
 const Icon = config.icon;
 return (
 <div key={mood.userId} className="flex items-center justify-between py-2 border-b border-bolivar-gray-light last:border-0">
 <span className="sb-ui-text-body text-sm">{user?.name || mood.userId}</span>
 <div className="flex items-center gap-2">
 <Icon className={`w-4 h-4 ${config.color}`} />
 <span className={`sb-ui-text-caption ${config.color}`}>{config.label}</span>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </article>
 </div>
 );
 })}
 </div>
 </div>
 );
}
