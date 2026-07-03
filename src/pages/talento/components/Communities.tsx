import { useState } from 'react';
import { Users } from 'lucide-react';

interface Community {
  id: string;
  name: string;
  members: number;
  type: 'techmaster' | 'techlovers';
}

const COMMUNITIES: Community[] = [
  { id: 'community-1', name: 'TechLovers AI', members: 128, type: 'techlovers' },
  { id: 'community-2', name: 'TechMaster Frontend', members: 95, type: 'techmaster' },
  { id: 'community-3', name: 'TechLovers Cloud', members: 64, type: 'techlovers' },
];

/**
 * Communities displays TechMaster & TechLovers community cards with join functionality.
 * State resets on remount (navigation away and back).
 */
export function Communities() {
  const [joinedCommunities, setJoinedCommunities] = useState<Set<string>>(new Set());

  const handleJoin = (communityId: string) => {
    setJoinedCommunities((prev) => {
      const next = new Set(prev);
      next.add(communityId);
      return next;
    });
  };

  return (
    <section>
      {/* Section title */}
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-indigo-500" />
        <h3 className="text-xl font-bold text-gray-900">
          Comunidades TechMaster &amp; TechLovers
        </h3>
      </div>

      {/* Community cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COMMUNITIES.map((community) => {
          const joined = joinedCommunities.has(community.id);
          const isTechMaster = community.type === 'techmaster';

          return (
            <article
              key={community.id}
              className={`sb-ui-card sb-ui-card--elevated border-2 ${
                isTechMaster
                  ? 'border-amber-400'
                  : 'border-indigo-400'
              }`}
            >
              <div className="sb-ui-card__content p-4 flex flex-col gap-3">
                {/* Community name with type indicator */}
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      isTechMaster ? 'bg-amber-400' : 'bg-indigo-400'
                    }`}
                  />
                  <h4 className="text-lg font-semibold text-gray-900">
                    {community.name}
                  </h4>
                </div>

                {/* Member count */}
                <p className="text-sm text-gray-600">
                  {community.members} miembros
                </p>

                {/* Join button */}
                <div className="mt-auto pt-2">
                  {joined ? (
                    <button
                      type="button"
                      className={`w-full px-4 py-2 text-sm font-medium rounded-md cursor-not-allowed ${
                        isTechMaster
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                      disabled
                    >
                      Miembro ✓
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`w-full px-4 py-2 text-sm font-medium rounded-md text-white transition-colors ${
                        isTechMaster
                          ? 'bg-amber-500 hover:bg-amber-600'
                          : 'bg-indigo-500 hover:bg-indigo-600'
                      }`}
                      onClick={() => handleJoin(community.id)}
                    >
                      Unirme
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
