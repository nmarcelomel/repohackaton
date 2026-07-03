import { Radar as RadarIcon } from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import { getUsers } from "../../../data/data-service";

export function GrowthRadar() {
  const users = getUsers();
  const currentUser = users[0];

  const hasSkills = currentUser && currentUser.skills.length > 0;

  const chartData = hasSkills
    ? currentUser.skills.map((skill) => ({
        skill: skill.name,
        nivelActual: skill.level,
        nivelDeseado: 5,
      }))
    : [];

  return (
    <article className="sb-ui-card sb-ui-card--elevated">
      <div className="sb-ui-card__content">
        <div className="flex items-center gap-2 mb-4">
          <RadarIcon className="w-5 h-5 text-blue-500" />
          <h3 className="sb-ui-heading-h6">
            Radar de Crecimiento — {currentUser?.name ?? "Usuario"}
          </h3>
        </div>

        {!hasSkills ? (
          <p className="text-gray-500 text-center py-8">
            No hay datos de skills disponibles
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300} minHeight={300}>
            <RadarChart data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" />
              <PolarRadiusAxis domain={[0, 5]} tickCount={6} />
              <Radar
                name="Nivel Actual"
                dataKey="nivelActual"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
              />
              <Radar
                name="Nivel Deseado"
                dataKey="nivelDeseado"
                stroke="#9ca3af"
                fill="#9ca3af"
                fillOpacity={0.1}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
    </article>
  );
}
