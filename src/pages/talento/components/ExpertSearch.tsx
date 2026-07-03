import { useState, useEffect } from 'react';
import { Search, Users, X } from 'lucide-react';
import { getUsers, getTeamById } from '../../../data/data-service';
import { filterUsersBySkill, getMatchingSkills } from '../talento-utils';
import { ExpertCard } from './ExpertCard';
import { MentorshipModal } from './MentorshipModal';
import type { User } from '../../../types';

/**
 * ExpertSearch provides a search interface for finding experts by technology/skill.
 * Uses sb-ui design system for consistent Seguros Bolívar branding.
 */
export function ExpertSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [mentorshipRequested, setMentorshipRequested] = useState<Set<string>>(new Set());
  const [toastVisible, setToastVisible] = useState(false);
  const [toastName, setToastName] = useState('');
  const [toastMentees, setToastMentees] = useState(0);
  const [modalExpert, setModalExpert] = useState<User | null>(null);
  const [modalTeamName, setModalTeamName] = useState('');

  // Debounce search term by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const users = getUsers();
  const filteredUsers = filterUsersBySkill(users, debouncedTerm);

  const handleOpenModal = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const team = getTeamById(user.teamId);
    setModalExpert(user);
    setModalTeamName(team?.name ?? 'Equipo no asignado');
  };

  const handleConfirmMentorship = async (selectedSlot: string, mentees: string[]) => {
    if (!modalExpert) return;

    setMentorshipRequested((prev) => new Set(prev).add(modalExpert.id));
    setModalExpert(null);

    // Dynamically import canvas-confetti and fire with brand colors
    try {
      const confettiModule = await import('canvas-confetti');
      const confetti = confettiModule.default ?? confettiModule;
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.65 },
        colors: ['#009056', '#FFC107', '#00A651', '#008C44', '#E5AC00'],
      });
    } catch {
      // Gracefully handle confetti load failure
    }

    // Show toast for 4 seconds
    setToastName(modalExpert.name.split(' ')[0]);
    setToastMentees(mentees.length);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 4000);
  };

  const noResults = debouncedTerm !== '' && filteredUsers.length === 0;

  return (
    <article className="sb-ui-card sb-ui-card--elevated">
      <div className="sb-ui-card__content">
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-bolivar-green" />
            <div>
              <h3 className="sb-ui-heading-h6">Buscador de Expertos</h3>
              <p className="sb-ui-text-caption" style={{ color: 'var(--sb-ui-color-grayscale-base)' }}>
                Conecta con los mejores talentos técnicos
              </p>
            </div>
          </div>
          {debouncedTerm && !noResults && (
            <span className="sb-ui-chip sb-ui-chip--soft sb-ui-chip--primary sb-ui-chip--sm">
              <span className="sb-ui-chip__label">
                {filteredUsers.length} resultado{filteredUsers.length !== 1 ? 's' : ''}
              </span>
            </span>
          )}
        </div>

        {/* Search input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: 'var(--sb-ui-color-grayscale-L100, #999)' }} />
          <input
            type="text"
            placeholder="Buscar experto por tecnología... (React, Python, AWS...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-md text-sm transition-all"
            style={{
              border: '1px solid var(--sb-ui-color-grayscale-L200, #e0e0e0)',
              background: 'var(--sb-ui-color-grayscale-L400, #fafafa)',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--sb-ui-color-primary-base, #009056)';
              e.currentTarget.style.boxShadow = '0 0 0 2px var(--sb-ui-color-primary-L200, #cce9dd)';
              e.currentTarget.style.background = '#fff';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--sb-ui-color-grayscale-L200, #e0e0e0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.background = 'var(--sb-ui-color-grayscale-L400, #fafafa)';
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-bolivar-gray-bg transition-colors"
            >
              <X className="h-4 w-4" style={{ color: 'var(--sb-ui-color-grayscale-base, #666)' }} />
            </button>
          )}
        </div>

        {/* No results message */}
        {noResults && (
          <div className="text-center py-10">
            <div
              className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center"
              style={{ background: 'var(--sb-ui-color-grayscale-L300, #f5f5f5)' }}
            >
              <Search className="w-7 h-7" style={{ color: 'var(--sb-ui-color-grayscale-L100, #999)' }} />
            </div>
            <p className="sb-ui-text-body font-medium" style={{ color: 'var(--sb-ui-color-grayscale-base, #666)' }}>
              No se encontraron expertos para &apos;{debouncedTerm}&apos;
            </p>
            <p className="sb-ui-text-caption mt-1" style={{ color: 'var(--sb-ui-color-grayscale-L100, #999)' }}>
              Intenta con otro término de búsqueda
            </p>
          </div>
        )}

        {/* Expert cards grid */}
        {!noResults && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => {
              const team = getTeamById(user.teamId);
              const teamName = team?.name ?? 'Equipo no asignado';
              const matchingSkills =
                debouncedTerm === '' ? user.skills : getMatchingSkills(user, debouncedTerm);

              return (
                <ExpertCard
                  key={user.id}
                  user={user}
                  teamName={teamName}
                  matchingSkills={matchingSkills}
                  onRequestMentorship={handleOpenModal}
                  mentorshipRequested={mentorshipRequested.has(user.id)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Mentorship Modal */}
      {modalExpert && (
        <MentorshipModal
          expert={modalExpert}
          expertTeamName={modalTeamName}
          onClose={() => setModalExpert(null)}
          onConfirm={handleConfirmMentorship}
        />
      )}

      {/* Toast notification with brand colors */}
      {toastVisible && (
        <div
          className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-md shadow-lg flex items-center gap-3 text-white"
          style={{ background: 'var(--sb-ui-color-primary-base, #009056)' }}
        >
          <span className="text-xl">🎉</span>
          <div>
            <p className="font-semibold text-sm">¡Mentoría agendada con {toastName}!</p>
            <p className="text-xs opacity-90">
              {toastMentees > 0
                ? `Grupo creado con ${toastMentees} participante${toastMentees > 1 ? 's' : ''}`
                : 'Sesión individual confirmada'}
            </p>
          </div>
        </div>
      )}
    </article>
  );
}
