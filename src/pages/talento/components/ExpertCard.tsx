import { UserCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import type { User, Skill } from '../../../types';

export interface ExpertCardProps {
  user: User;
  teamName: string;
  matchingSkills: Skill[];
  onRequestMentorship: (userId: string) => void;
  mentorshipRequested: boolean;
}

/**
 * Returns a chip class based on skill level using sb-ui chip variants.
 */
function getSkillChipClass(level: number): string {
  if (level === 5) return 'sb-ui-chip sb-ui-chip--soft sb-ui-chip--warning';
  if (level === 4) return 'sb-ui-chip sb-ui-chip--soft sb-ui-chip--success';
  if (level === 3) return 'sb-ui-chip sb-ui-chip--soft sb-ui-chip--primary';
  return 'sb-ui-chip sb-ui-chip--soft sb-ui-chip--default';
}

/**
 * Returns inline style for the avatar gradient based on the user's top skill level.
 */
function getAvatarStyle(skills: Skill[]): React.CSSProperties {
  const maxLevel = skills.length > 0 ? Math.max(...skills.map(s => s.level)) : 0;
  if (maxLevel === 5) return { background: 'linear-gradient(135deg, var(--sb-ui-color-warning-base, #FFC107), #FF9800)' };
  if (maxLevel === 4) return { background: 'linear-gradient(135deg, var(--sb-ui-color-primary-base, #009056), var(--sb-ui-color-primary-D100, #038450))' };
  if (maxLevel === 3) return { background: 'linear-gradient(135deg, #3b82f6, #6366f1)' };
  return { background: 'linear-gradient(135deg, #9ca3af, #6b7280)' };
}

/**
 * ExpertCard displays expert user information with skills and mentorship request.
 * Uses sb-ui design system classes for consistent branding.
 */
export function ExpertCard({
  user,
  teamName,
  matchingSkills,
  onRequestMentorship,
  mentorshipRequested,
}: ExpertCardProps) {
  const displayedSkills = matchingSkills.slice(0, 10);
  const remainingCount = matchingSkills.length - 10;
  const resolvedTeamName = teamName || 'Equipo no asignado';
  const hasMasterSkill = user.skills.some(s => s.level === 5);

  return (
    <article className="sb-ui-card sb-ui-card--elevated hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      <div className="sb-ui-card__content p-4 flex flex-col gap-3">
        {/* Header: Avatar + Info */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className="relative shrink-0 w-11 h-11 rounded-full flex items-center justify-center shadow-sm"
            style={getAvatarStyle(user.skills)}
          >
            <UserCircle className="w-7 h-7 text-white" />
            {hasMasterSkill && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: 'var(--sb-ui-color-warning-base, #FFC107)' }}
              >
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="sb-ui-text-body font-bold truncate" style={{ color: 'var(--sb-ui-color-grayscale-D400, #333)' }}>
              {user.name}
            </h4>
            <p className="sb-ui-text-caption" style={{ color: 'var(--sb-ui-color-grayscale-base, #666)' }}>
              {user.role}
            </p>
            <p className="sb-ui-text-caption text-xs" style={{ color: 'var(--sb-ui-color-grayscale-L100, #999)' }}>
              {resolvedTeamName}
            </p>
          </div>
        </div>

        {/* Skills as sb-ui chips */}
        <div className="flex flex-wrap gap-1.5">
          {displayedSkills.length === 0 ? (
            <p className="sb-ui-text-caption italic" style={{ color: 'var(--sb-ui-color-grayscale-L100, #999)' }}>
              No hay skills registrados
            </p>
          ) : (
            <>
              {displayedSkills.map((skill) => (
                <span key={skill.name} className={`${getSkillChipClass(skill.level)} sb-ui-chip--sm`}>
                  <span className="sb-ui-chip__label">
                    {skill.name} ({skill.level}/5)
                  </span>
                </span>
              ))}
              {remainingCount > 0 && (
                <span className="sb-ui-chip sb-ui-chip--soft sb-ui-chip--default sb-ui-chip--sm">
                  <span className="sb-ui-chip__label">+{remainingCount} más</span>
                </span>
              )}
            </>
          )}
        </div>

        {/* Mentorship button using sb-ui button styles */}
        <div className="mt-auto pt-2">
          {mentorshipRequested ? (
            <button
              type="button"
              className="w-full px-4 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 cursor-not-allowed"
              style={{
                background: 'var(--sb-ui-color-primary-L300, #e5f4ee)',
                color: 'var(--sb-ui-color-primary-D200, #05794a)',
                border: '1px solid var(--sb-ui-color-primary-L200, #cce9dd)',
              }}
              disabled
            >
              <CheckCircle2 className="w-4 h-4" />
              Solicitud Enviada
            </button>
          ) : (
            <button
              type="button"
              className="w-full px-4 py-2.5 text-sm font-semibold rounded-md text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: 'var(--sb-ui-color-primary-base, #009056)' }}
              onClick={() => onRequestMentorship(user.id)}
            >
              🚀 Solicitar Mentoría
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
