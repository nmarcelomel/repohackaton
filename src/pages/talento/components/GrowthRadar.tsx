import { useState } from 'react';
import { Radar as RadarIcon, ChevronDown, UserCircle } from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import { getUsers, getTeamById } from '../../../data/data-service';
import { computeMaturityIndex } from '../talento-utils';

export function GrowthRadar() {
  const users = getUsers();
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id ?? '');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedUser = users.find(u => u.id === selectedUserId) ?? users[0];
  const hasSkills = selectedUser && selectedUser.skills.length > 0;

  const chartData = hasSkills
    ? selectedUser.skills.map((skill) => ({
        skill: skill.name,
        nivelActual: skill.level,
        nivelDeseado: 5,
      }))
    : [];

  const maturityIndex = selectedUser ? computeMaturityIndex(selectedUser) : 0;
  const team = selectedUser ? getTeamById(selectedUser.teamId) : undefined;

  return (
    <article className="sb-ui-card sb-ui-card--elevated">
      <div className="sb-ui-card__content">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <RadarIcon className="w-5 h-5 text-bolivar-green" />
            <div>
              <h3 className="sb-ui-heading-h6">Radar de Crecimiento</h3>
              <p className="sb-ui-text-caption" style={{ color: 'var(--sb-ui-color-grayscale-base)' }}>
                Compara nivel actual vs. nivel deseado por skill
              </p>
            </div>
          </div>

          {/* User Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-all"
              style={{
                borderColor: dropdownOpen ? 'var(--sb-ui-color-primary-base, #009056)' : 'var(--sb-ui-color-grayscale-L200, #e0e0e0)',
                background: dropdownOpen ? 'var(--sb-ui-color-primary-L300, #e5f4ee)' : 'white',
              }}
            >
              <UserCircle className="w-4 h-4" style={{ color: 'var(--sb-ui-color-primary-base)' }} />
              <span className="font-medium max-w-[140px] truncate" style={{ color: 'var(--sb-ui-color-grayscale-D400, #333)' }}>
                {selectedUser?.name.split(' ')[0] ?? 'Seleccionar'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--sb-ui-color-grayscale-base)' }} />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border z-20 max-h-60 overflow-y-auto"
                style={{ borderColor: 'var(--sb-ui-color-grayscale-L200, #e0e0e0)' }}
              >
                {users.map((user) => {
                  const userTeam = getTeamById(user.teamId);
                  const isSelected = user.id === selectedUserId;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => { setSelectedUserId(user.id); setDropdownOpen(false); }}
                      className="w-full px-3 py-2.5 text-left flex items-center gap-2 transition-colors hover:bg-bolivar-gray-bg"
                      style={isSelected ? { background: 'var(--sb-ui-color-primary-L300, #e5f4ee)' } : {}}
                    >
                      <UserCircle
                        className="w-5 h-5 shrink-0"
                        style={{ color: isSelected ? 'var(--sb-ui-color-primary-base)' : 'var(--sb-ui-color-grayscale-L100)' }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--sb-ui-color-grayscale-D400, #333)' }}>
                          {user.name}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--sb-ui-color-grayscale-base)' }}>
                          {user.role} — {userTeam?.name ?? 'Sin equipo'}
                        </p>
                      </div>
                      <span className="text-xs font-mono shrink-0" style={{ color: 'var(--sb-ui-color-grayscale-L100)' }}>
                        {computeMaturityIndex(user).toFixed(1)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Selected User Info Bar */}
        {selectedUser && (
          <div
            className="flex items-center justify-between px-4 py-2.5 rounded-lg mb-4"
            style={{ background: 'var(--sb-ui-color-grayscale-L300, #f5f5f5)' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: 'var(--sb-ui-color-grayscale-D400, #333)' }}>
                {selectedUser.name}
              </span>
              <span className="sb-ui-chip sb-ui-chip--soft sb-ui-chip--sm sb-ui-chip--primary">
                <span className="sb-ui-chip__label">{selectedUser.role}</span>
              </span>
              {team && (
                <span className="sb-ui-chip sb-ui-chip--soft sb-ui-chip--sm sb-ui-chip--default">
                  <span className="sb-ui-chip__label">{team.name}</span>
                </span>
              )}
            </div>
            <div className="text-right">
              <span className="text-xs" style={{ color: 'var(--sb-ui-color-grayscale-base)' }}>Índice Madurez</span>
              <p className="text-sm font-bold" style={{ color: 'var(--sb-ui-color-primary-base, #009056)' }}>
                {maturityIndex.toFixed(1)} / 5.0
              </p>
            </div>
          </div>
        )}

        {/* Chart */}
        {!hasSkills ? (
          <div className="text-center py-10">
            <RadarIcon className="w-10 h-10 mx-auto mb-2" style={{ color: 'var(--sb-ui-color-grayscale-L200)' }} />
            <p className="sb-ui-text-body" style={{ color: 'var(--sb-ui-color-grayscale-base)' }}>
              No hay datos de skills disponibles
            </p>
            <p className="sb-ui-text-caption mt-1" style={{ color: 'var(--sb-ui-color-grayscale-L100)' }}>
              Este usuario no tiene skills registrados
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320} minHeight={300}>
            <RadarChart data={chartData}>
              <PolarGrid stroke="var(--sb-ui-color-grayscale-L200, #e0e0e0)" />
              <PolarAngleAxis
                dataKey="skill"
                tick={{ fontSize: 12, fill: 'var(--sb-ui-color-grayscale-D400, #333)' }}
              />
              <PolarRadiusAxis domain={[0, 5]} tickCount={6} tick={{ fontSize: 10 }} />
              <Radar
                name="Nivel Actual"
                dataKey="nivelActual"
                stroke="var(--sb-ui-color-primary-base, #009056)"
                fill="var(--sb-ui-color-primary-base, #009056)"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Radar
                name="Nivel Deseado (5)"
                dataKey="nivelDeseado"
                stroke="var(--sb-ui-color-grayscale-L100, #999)"
                fill="var(--sb-ui-color-grayscale-L100, #999)"
                fillOpacity={0.05}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        )}

        {/* Skills Summary below chart */}
        {hasSkills && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {selectedUser.skills.map((skill) => (
              <span
                key={skill.name}
                className={`sb-ui-chip sb-ui-chip--soft sb-ui-chip--sm ${
                  skill.level === 5 ? 'sb-ui-chip--warning' :
                  skill.level === 4 ? 'sb-ui-chip--success' :
                  skill.level === 3 ? 'sb-ui-chip--primary' :
                  'sb-ui-chip--default'
                }`}
              >
                <span className="sb-ui-chip__label">{skill.name} ({skill.level}/5)</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
