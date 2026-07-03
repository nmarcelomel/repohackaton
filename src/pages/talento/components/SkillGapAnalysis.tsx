import { useState } from 'react';
import { Target, TrendingDown, Users, AlertTriangle, ChevronDown, ChevronUp, Lightbulb, Filter } from 'lucide-react';
import { getUsers } from '../../../data/data-service';
import { analyzeSkills, getGapColor } from '../talento-utils';
import type { User } from '../../../types';

interface SkillDetail {
  name: string;
  demand: number;
  averageLevel: number;
  gap: number;
  users: { name: string; level: number }[];
}

function getDetailedSkills(users: User[]): SkillDetail[] {
  const skills = analyzeSkills(users);
  const skillUserMap = new Map<string, { name: string; level: number }[]>();
  for (const user of users) {
    for (const skill of user.skills) {
      const list = skillUserMap.get(skill.name) ?? [];
      list.push({ name: user.name, level: skill.level });
      skillUserMap.set(skill.name, list);
    }
  }
  return skills.map(s => ({
    ...s,
    users: (skillUserMap.get(s.name) ?? []).sort((a, b) => b.level - a.level),
  }));
}

function getBarStyle(averageLevel: number): { bg: string; text: string; label: string; filter: string } {
  const color = getGapColor(averageLevel);
  if (color === 'green') return { bg: 'var(--sb-ui-color-primary-base, #009056)', text: 'var(--sb-ui-color-primary-D200, #05794a)', label: 'Cubierto', filter: 'green' };
  if (color === 'yellow') return { bg: 'var(--sb-ui-color-warning-base, #FFC107)', text: '#92400e', label: 'En desarrollo', filter: 'yellow' };
  return { bg: '#ef4444', text: '#991b1b', label: 'Brecha crítica', filter: 'red' };
}

const TOP_COUNT = 5;

export function SkillGapAnalysis() {
  const users = getUsers();
  const detailedSkills = getDetailedSkills(users);
  const totalUsers = users.length;
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'gap' | 'demand'>('gap');
  const [showAll, setShowAll] = useState(false);
  const [filterLevel, setFilterLevel] = useState<'all' | 'red' | 'yellow' | 'green'>('all');

  if (detailedSkills.length === 0) {
    return (
      <article className="sb-ui-card sb-ui-card--elevated">
        <div className="sb-ui-card__content">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-bolivar-green" />
            <h3 className="sb-ui-heading-h6">Mapa de Brechas</h3>
          </div>
          <p className="sb-ui-text-caption" style={{ color: 'var(--sb-ui-color-grayscale-base)' }}>
            No hay datos de skills disponibles para analizar
          </p>
        </div>
      </article>
    );
  }

  const criticalSkills = detailedSkills.filter(s => getGapColor(s.averageLevel) === 'red');
  const developingSkills = detailedSkills.filter(s => getGapColor(s.averageLevel) === 'yellow');
  const coveredSkills = detailedSkills.filter(s => getGapColor(s.averageLevel) === 'green');
  const avgGap = detailedSkills.reduce((sum, s) => sum + s.gap, 0) / detailedSkills.length;

  // Filter and sort
  let filteredSkills = detailedSkills;
  if (filterLevel !== 'all') {
    filteredSkills = detailedSkills.filter(s => getGapColor(s.averageLevel) === filterLevel);
  }

  const sorted = activeTab === 'gap'
    ? [...filteredSkills].sort((a, b) => b.gap - a.gap)
    : [...filteredSkills].sort((a, b) => b.demand - a.demand);

  const visibleSkills = showAll ? sorted : sorted.slice(0, TOP_COUNT);
  const hasMore = sorted.length > TOP_COUNT;

  return (
    <article className="sb-ui-card sb-ui-card--elevated">
      <div className="sb-ui-card__content">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Target className="w-5 h-5 text-bolivar-green" />
          <h3 className="sb-ui-heading-h6">Mapa de Brechas</h3>
        </div>
        <p className="sb-ui-text-caption mb-4" style={{ color: 'var(--sb-ui-color-grayscale-base)' }}>
          Identifica habilidades que necesitan desarrollo para la excelencia técnica
        </p>

        {/* Summary — clickable filter buttons */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <button
            type="button"
            onClick={() => setFilterLevel('all')}
            className={`p-2.5 rounded-lg text-left transition-all ${filterLevel === 'all' ? 'ring-2' : ''}`}
            style={{
              background: 'var(--sb-ui-color-grayscale-L300, #f5f5f5)',
              ringColor: 'var(--sb-ui-color-primary-base)',
            }}
          >
            <span className="text-xs font-medium block" style={{ color: 'var(--sb-ui-color-grayscale-base)' }}>Todos</span>
            <span className="text-lg font-bold" style={{ color: 'var(--sb-ui-color-grayscale-D400, #333)' }}>{detailedSkills.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterLevel('red')}
            className={`p-2.5 rounded-lg text-left transition-all ${filterLevel === 'red' ? 'ring-2 ring-red-400' : ''}`}
            style={{ background: '#fef2f2' }}
          >
            <span className="text-xs font-medium block" style={{ color: '#991b1b' }}>Críticos</span>
            <span className="text-lg font-bold" style={{ color: '#ef4444' }}>{criticalSkills.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterLevel('yellow')}
            className={`p-2.5 rounded-lg text-left transition-all ${filterLevel === 'yellow' ? 'ring-2 ring-amber-400' : ''}`}
            style={{ background: '#fffbeb' }}
          >
            <span className="text-xs font-medium block" style={{ color: '#92400e' }}>En desarrollo</span>
            <span className="text-lg font-bold" style={{ color: '#d97706' }}>{developingSkills.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterLevel('green')}
            className={`p-2.5 rounded-lg text-left transition-all ${filterLevel === 'green' ? 'ring-2' : ''}`}
            style={{
              background: 'var(--sb-ui-color-primary-L300, #e5f4ee)',
              ringColor: 'var(--sb-ui-color-primary-base)',
            }}
          >
            <span className="text-xs font-medium block" style={{ color: 'var(--sb-ui-color-primary-D200, #05794a)' }}>Cubiertos</span>
            <span className="text-lg font-bold" style={{ color: 'var(--sb-ui-color-primary-base, #009056)' }}>{coveredSkills.length}</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--sb-ui-color-grayscale-L300, #f5f5f5)' }}>
            <button
              type="button"
              onClick={() => { setActiveTab('gap'); setShowAll(false); }}
              className={`py-1.5 px-3 text-xs font-medium rounded-md transition-all ${activeTab === 'gap' ? 'bg-white shadow-sm' : ''}`}
              style={{ color: activeTab === 'gap' ? 'var(--sb-ui-color-primary-base)' : 'var(--sb-ui-color-grayscale-base)' }}
            >
              Mayor Brecha
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('demand'); setShowAll(false); }}
              className={`py-1.5 px-3 text-xs font-medium rounded-md transition-all ${activeTab === 'demand' ? 'bg-white shadow-sm' : ''}`}
              style={{ color: activeTab === 'demand' ? 'var(--sb-ui-color-primary-base)' : 'var(--sb-ui-color-grayscale-base)' }}
            >
              Más Demandados
            </button>
          </div>
          <span className="text-xs" style={{ color: 'var(--sb-ui-color-grayscale-L100)' }}>
            {sorted.length} skill{sorted.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Skills List — compact */}
        <div className="space-y-1.5">
          {visibleSkills.map((skill) => {
            const barStyle = getBarStyle(skill.averageLevel);
            const isExpanded = expandedSkill === skill.name;
            const levelPercent = (skill.averageLevel / 5) * 100;

            return (
              <div
                key={skill.name}
                className="rounded-lg border transition-all"
                style={{ borderColor: isExpanded ? 'var(--sb-ui-color-primary-L100, #66bc9a)' : 'var(--sb-ui-color-grayscale-L200, #e0e0e0)' }}
              >
                <button
                  type="button"
                  onClick={() => setExpandedSkill(isExpanded ? null : skill.name)}
                  className="w-full px-3 py-2 text-left flex items-center gap-3"
                >
                  {/* Color dot */}
                  <span className="shrink-0 w-2.5 h-2.5 rounded-full" style={{ background: barStyle.bg }} />

                  {/* Name */}
                  <span className="flex-1 text-sm font-medium truncate" style={{ color: 'var(--sb-ui-color-grayscale-D400, #333)' }}>
                    {skill.name}
                  </span>

                  {/* Mini bar */}
                  <div className="w-20 shrink-0 rounded-full h-1.5" style={{ background: 'var(--sb-ui-color-grayscale-L300, #f0f0f0)' }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${levelPercent}%`, background: barStyle.bg }} />
                  </div>

                  {/* Score */}
                  <span className="text-xs font-mono w-8 text-right shrink-0" style={{ color: barStyle.text }}>
                    {skill.averageLevel.toFixed(1)}
                  </span>

                  {/* Users count */}
                  <span className="text-xs shrink-0 w-5 text-center" style={{ color: 'var(--sb-ui-color-grayscale-L100)' }}>
                    {skill.demand}
                  </span>

                  {/* Expand icon */}
                  {isExpanded
                    ? <ChevronUp className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--sb-ui-color-grayscale-L100)' }} />
                    : <ChevronDown className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--sb-ui-color-grayscale-L100)' }} />
                  }
                </button>

                {/* Expanded */}
                {isExpanded && (
                  <div className="px-3 pb-3 border-t" style={{ borderColor: 'var(--sb-ui-color-grayscale-L200, #e0e0e0)' }}>
                    <div className="mt-2 mb-2">
                      <div className="flex flex-wrap gap-1.5">
                        {skill.users.map((u) => (
                          <span key={u.name} className="sb-ui-chip sb-ui-chip--soft sb-ui-chip--sm">
                            <span className="sb-ui-chip__label">{u.name.split(' ')[0]} <strong>({u.level}/5)</strong></span>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-2 rounded-md flex items-start gap-2" style={{ background: 'var(--sb-ui-color-primary-L300, #e5f4ee)' }}>
                      <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-bolivar-green" />
                      <p className="text-xs" style={{ color: 'var(--sb-ui-color-primary-D200, #05794a)' }}>
                        {skill.gap >= 2
                          ? `Brecha de ${skill.gap.toFixed(1)} pts. Crear mentorías con expertos nivel 4-5. ${totalUsers - skill.demand} persona${totalUsers - skill.demand !== 1 ? 's' : ''} no tiene este skill.`
                          : skill.gap >= 1
                          ? `Gap moderado (${skill.gap.toFixed(1)} pts). Fomentar pair programming.`
                          : 'Bien cubierto — dominio consolidado.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Show more / less */}
        {hasMore && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="w-full mt-3 py-2 text-sm font-medium rounded-md transition-all"
            style={{ color: 'var(--sb-ui-color-primary-base, #009056)', background: 'var(--sb-ui-color-primary-L300, #e5f4ee)' }}
          >
            {showAll ? `Mostrar Top ${TOP_COUNT}` : `Ver todos (${sorted.length - TOP_COUNT} más)`}
          </button>
        )}
      </div>
    </article>
  );
}
