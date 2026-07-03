import { useState } from 'react';
import { Target, TrendingDown, Users, AlertTriangle, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
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

/**
 * Enriches skill analysis with the list of users who have each skill.
 */
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

/**
 * Returns sb-ui aligned color styles based on gap severity.
 */
function getBarStyle(averageLevel: number): { bg: string; text: string; label: string } {
  const color = getGapColor(averageLevel);
  if (color === 'green') return { bg: 'var(--sb-ui-color-primary-base, #009056)', text: 'var(--sb-ui-color-primary-D200, #05794a)', label: 'Cubierto' };
  if (color === 'yellow') return { bg: 'var(--sb-ui-color-warning-base, #FFC107)', text: '#92400e', label: 'En desarrollo' };
  return { bg: '#ef4444', text: '#991b1b', label: 'Brecha crítica' };
}

export function SkillGapAnalysis() {
  const users = getUsers();
  const detailedSkills = getDetailedSkills(users);
  const totalUsers = users.length;
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'demand' | 'gap'>('gap');

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

  const byDemand = [...detailedSkills].sort((a, b) => b.demand - a.demand);
  const byGap = [...detailedSkills].sort((a, b) => b.gap - a.gap);
  const criticalSkills = detailedSkills.filter(s => getGapColor(s.averageLevel) === 'red');
  const avgGap = detailedSkills.reduce((sum, s) => sum + s.gap, 0) / detailedSkills.length;

  const activeList = activeTab === 'gap' ? byGap : byDemand;

  return (
    <article className="sb-ui-card sb-ui-card--elevated">
      <div className="sb-ui-card__content">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Target className="w-5 h-5 text-bolivar-green" />
          <h3 className="sb-ui-heading-h6">Mapa de Brechas</h3>
        </div>
        <p className="sb-ui-text-caption mb-4" style={{ color: 'var(--sb-ui-color-grayscale-base)' }}>
          Identifica habilidades que la organización necesita desarrollar para alcanzar la excelencia técnica
        </p>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="p-3 rounded-lg" style={{ background: 'var(--sb-ui-color-grayscale-L300, #f5f5f5)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <Target className="w-3.5 h-3.5 text-bolivar-green" />
              <span className="text-xs font-medium" style={{ color: 'var(--sb-ui-color-grayscale-base)' }}>Total Skills</span>
            </div>
            <p className="text-xl font-bold" style={{ color: 'var(--sb-ui-color-grayscale-D400, #333)' }}>
              {detailedSkills.length}
            </p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'var(--sb-ui-color-grayscale-L300, #f5f5f5)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown className="w-3.5 h-3.5 text-bolivar-yellow" />
              <span className="text-xs font-medium" style={{ color: 'var(--sb-ui-color-grayscale-base)' }}>Gap Promedio</span>
            </div>
            <p className="text-xl font-bold" style={{ color: 'var(--sb-ui-color-grayscale-D400, #333)' }}>
              {avgGap.toFixed(1)}
            </p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: criticalSkills.length > 0 ? '#fef2f2' : 'var(--sb-ui-color-grayscale-L300, #f5f5f5)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: criticalSkills.length > 0 ? '#ef4444' : 'var(--sb-ui-color-grayscale-base)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--sb-ui-color-grayscale-base)' }}>Críticos</span>
            </div>
            <p className="text-xl font-bold" style={{ color: criticalSkills.length > 0 ? '#ef4444' : 'var(--sb-ui-color-grayscale-D400, #333)' }}>
              {criticalSkills.length}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 p-1 rounded-lg mb-4" style={{ background: 'var(--sb-ui-color-grayscale-L300, #f5f5f5)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('gap')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all ${
              activeTab === 'gap' ? 'bg-white shadow-sm' : ''
            }`}
            style={{ color: activeTab === 'gap' ? 'var(--sb-ui-color-primary-base, #009056)' : 'var(--sb-ui-color-grayscale-base)' }}
          >
            Mayor Brecha
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('demand')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all ${
              activeTab === 'demand' ? 'bg-white shadow-sm' : ''
            }`}
            style={{ color: activeTab === 'demand' ? 'var(--sb-ui-color-primary-base, #009056)' : 'var(--sb-ui-color-grayscale-base)' }}
          >
            Más Demandados
          </button>
        </div>

        {/* Skills List */}
        <div className="space-y-2">
          {activeList.map((skill) => {
            const barStyle = getBarStyle(skill.averageLevel);
            const isExpanded = expandedSkill === skill.name;
            const levelPercent = (skill.averageLevel / 5) * 100;
            const demandPercent = (skill.demand / totalUsers) * 100;

            return (
              <div
                key={skill.name}
                className="rounded-lg border transition-all"
                style={{ borderColor: isExpanded ? 'var(--sb-ui-color-primary-L100, #66bc9a)' : 'var(--sb-ui-color-grayscale-L200, #e0e0e0)' }}
              >
                {/* Skill Row - clickable */}
                <button
                  type="button"
                  onClick={() => setExpandedSkill(isExpanded ? null : skill.name)}
                  className="w-full p-3 text-left"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: 'var(--sb-ui-color-grayscale-D400, #333)' }}>
                        {skill.name}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: barStyle.bg + '20', color: barStyle.text }}
                      >
                        {barStyle.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" style={{ color: 'var(--sb-ui-color-grayscale-L100)' }} />
                        <span className="text-xs" style={{ color: 'var(--sb-ui-color-grayscale-base)' }}>
                          {skill.demand}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-semibold" style={{ color: barStyle.text }}>
                        {skill.averageLevel.toFixed(1)}/5
                      </span>
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--sb-ui-color-grayscale-L100)' }} />
                        : <ChevronDown className="w-4 h-4" style={{ color: 'var(--sb-ui-color-grayscale-L100)' }} />
                      }
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full rounded-full h-2 relative" style={{ background: 'var(--sb-ui-color-grayscale-L300, #f0f0f0)' }}>
                    {/* Filled portion = current level */}
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${levelPercent}%`, background: barStyle.bg }}
                    />
                    {/* Gap zone indicator */}
                    <div
                      className="absolute top-0 h-2 rounded-r-full opacity-20"
                      style={{
                        left: `${levelPercent}%`,
                        width: `${100 - levelPercent}%`,
                        background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 6px)',
                      }}
                    />
                  </div>

                  {/* Demand bar (small, secondary) */}
                  {activeTab === 'demand' && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-xs shrink-0" style={{ color: 'var(--sb-ui-color-grayscale-L100)' }}>Demanda:</span>
                      <div className="flex-1 rounded-full h-1.5" style={{ background: 'var(--sb-ui-color-grayscale-L300)' }}>
                        <div
                          className="h-1.5 rounded-full"
                          style={{ width: `${demandPercent}%`, background: 'var(--sb-ui-color-primary-L100, #66bc9a)' }}
                        />
                      </div>
                      <span className="text-xs shrink-0" style={{ color: 'var(--sb-ui-color-grayscale-base)' }}>
                        {Math.round(demandPercent)}%
                      </span>
                    </div>
                  )}
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-0 border-t" style={{ borderColor: 'var(--sb-ui-color-grayscale-L200, #e0e0e0)' }}>
                    {/* Users with this skill */}
                    <div className="mt-3 mb-3">
                      <p className="text-xs font-semibold mb-2" style={{ color: 'var(--sb-ui-color-grayscale-D400, #333)' }}>
                        Quién lo tiene:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {skill.users.map((u) => (
                          <span
                            key={u.name}
                            className="sb-ui-chip sb-ui-chip--soft sb-ui-chip--sm"
                          >
                            <span className="sb-ui-chip__label">
                              {u.name.split(' ')[0]} <strong>({u.level}/5)</strong>
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Gap insight */}
                    <div
                      className="p-2.5 rounded-md flex items-start gap-2"
                      style={{ background: 'var(--sb-ui-color-primary-L300, #e5f4ee)' }}
                    >
                      <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-bolivar-green" />
                      <div>
                        <p className="text-xs font-medium" style={{ color: 'var(--sb-ui-color-primary-D200, #05794a)' }}>
                          {skill.gap >= 2
                            ? `Brecha significativa (${skill.gap.toFixed(1)} puntos). Se recomienda crear sesiones de mentoría con los expertos nivel 4-5 y promover cursos especializados.`
                            : skill.gap >= 1
                            ? `Brecha moderada (${skill.gap.toFixed(1)} puntos). El equipo está en buen camino. Fomentar prácticas de pair programming con los usuarios de mayor nivel.`
                            : `Skill bien cubierto. El equipo tiene dominio consolidado en esta tecnología.`
                          }
                        </p>
                        {skill.gap >= 2 && (
                          <p className="text-xs mt-1" style={{ color: 'var(--sb-ui-color-primary-base)' }}>
                            💡 {totalUsers - skill.demand} colaborador{totalUsers - skill.demand !== 1 ? 'es' : ''} no tiene este skill — oportunidad de capacitación cruzada
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}
