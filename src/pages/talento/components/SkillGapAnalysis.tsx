import { Target } from "lucide-react";
import { getUsers } from "../../../data/data-service";
import { analyzeSkills, getGapColor } from "../talento-utils";

export function SkillGapAnalysis() {
  const users = getUsers();
  const skills = analyzeSkills(users);
  const totalUsers = users.length;

  if (skills.length === 0) {
    return (
      <article className="sb-ui-card sb-ui-card--elevated">
        <div className="sb-ui-card__content">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-bolivar-green" />
            <h3 className="sb-ui-heading-h6">Mapa de Brechas</h3>
          </div>
          <p className="text-gray-500">No hay datos de skills disponibles para analizar</p>
        </div>
      </article>
    );
  }

  const byDemand = [...skills].sort((a, b) => b.demand - a.demand);
  const byGap = [...skills].sort((a, b) => b.gap - a.gap);

  function getBarColorClass(averageLevel: number): string {
    const color = getGapColor(averageLevel);
    if (color === "green") return "bg-green-500";
    if (color === "yellow") return "bg-amber-500";
    return "bg-red-500";
  }

  return (
    <article className="sb-ui-card sb-ui-card--elevated">
      <div className="sb-ui-card__content">
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-5 h-5 text-bolivar-green" />
          <h3 className="sb-ui-heading-h6">Mapa de Brechas</h3>
        </div>

        {/* Skills más demandados */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Skills más demandados</h4>
          <div className="space-y-3">
            {byDemand.map((skill) => {
              const widthPercent = (skill.demand / totalUsers) * 100;
              const barColor = getBarColorClass(skill.averageLevel);
              return (
                <div key={skill.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-800">{skill.name}</span>
                    <span className="text-xs text-gray-500">{skill.demand} usuarios</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${barColor}`}
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Skills con mayor brecha */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Skills con mayor brecha</h4>
          <div className="space-y-3">
            {byGap.map((skill) => {
              const levelPercent = (skill.averageLevel / 5) * 100;
              const barColor = getBarColorClass(skill.averageLevel);
              return (
                <div key={skill.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-800">{skill.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {skill.averageLevel.toFixed(1)} / 5.0
                      </span>
                      <span className="text-xs font-semibold text-red-600">
                        Gap: {skill.gap.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 relative">
                    <div
                      className={`h-2.5 rounded-full ${barColor}`}
                      style={{ width: `${levelPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}
