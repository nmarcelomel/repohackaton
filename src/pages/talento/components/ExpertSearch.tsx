import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { getUsers, getTeamById } from '../../../data/data-service';
import { filterUsersBySkill, getMatchingSkills } from '../talento-utils';
import { ExpertCard } from './ExpertCard';

/**
 * ExpertSearch provides a search interface for finding experts by technology/skill.
 * Includes debounced filtering, responsive grid layout, confetti on mentorship request,
 * and a toast notification for successful requests.
 */
export function ExpertSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [mentorshipRequested, setMentorshipRequested] = useState<Set<string>>(new Set());
  const [toastVisible, setToastVisible] = useState(false);

  // Debounce search term by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const users = getUsers();
  const filteredUsers = filterUsersBySkill(users, debouncedTerm);

  const handleRequestMentorship = async (userId: string) => {
    // Add userId to mentorshipRequested set
    setMentorshipRequested((prev) => new Set(prev).add(userId));

    // Dynamically import canvas-confetti and fire
    try {
      const confettiModule = await import('canvas-confetti');
      const confetti = confettiModule.default ?? confettiModule;
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Gracefully handle confetti load failure
    }

    // Show toast for 3 seconds
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  const noResults = debouncedTerm !== '' && filteredUsers.length === 0;

  return (
    <section className="relative">
      {/* Search input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar experto por tecnología..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* No results message */}
      {noResults && (
        <p className="text-center text-gray-500 py-8">
          No se encontraron expertos para &apos;{debouncedTerm}&apos;
        </p>
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
                onRequestMentorship={handleRequestMentorship}
                mentorshipRequested={mentorshipRequested.has(user.id)}
              />
            );
          })}
        </div>
      )}

      {/* Toast notification */}
      {toastVisible && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-md shadow-lg animate-fade-in">
          ¡Solicitud de mentoría enviada!
        </div>
      )}
    </section>
  );
}
