import type { User, Skill } from '../../../types';

export interface ExpertCardProps {
  user: User;
  teamName: string;
  matchingSkills: Skill[];
  onRequestMentorship: (userId: string) => void;
  mentorshipRequested: boolean;
}

/**
 * ExpertCard displays expert user information with skills and mentorship request.
 * Uses sb-ui design system classes for card and chip styling.
 */
export function ExpertCard({
  user,
  teamName,
  matchingSkills,
  onRequestMentorship,
  mentorshipRequested,
}: ExpertCardProps) {
  const displayedSkills = matchingSkills.slice(0, 10);
  const resolvedTeamName = teamName || 'Equipo no asignado';

  return (
    <article className="sb-ui-card sb-ui-card--elevated">
      <div className="sb-ui-card__content p-4 flex flex-col gap-3">
        {/* Header: Name, Role, Team */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900">{user.name}</h4>
          <p className="text-sm text-gray-600">{user.role}</p>
          <p className="text-sm text-gray-500">{resolvedTeamName}</p>
        </div>

        {/* Skills as chips */}
        <div className="flex flex-wrap gap-2">
          {displayedSkills.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No hay skills registrados</p>
          ) : (
            displayedSkills.map((skill) => (
              <span
                key={skill.name}
                className="sb-ui-chip sb-ui-chip--soft"
              >
                <span className="sb-ui-chip__label">
                  {skill.name} ({skill.level}/5)
                </span>
              </span>
            ))
          )}
        </div>

        {/* Mentorship button */}
        <div className="mt-auto pt-2">
          {mentorshipRequested ? (
            <button
              type="button"
              className="w-full px-4 py-2 text-sm font-medium rounded-md bg-gray-200 text-gray-500 cursor-not-allowed"
              disabled
            >
              Solicitud Enviada
            </button>
          ) : (
            <button
              type="button"
              className="w-full px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              onClick={() => onRequestMentorship(user.id)}
            >
              Solicitar Mentoría
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
