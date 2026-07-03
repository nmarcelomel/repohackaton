import { Trophy, UserCircle, Award } from "lucide-react";
import { getUsers } from "../../../data/data-service";
import { computeRanking } from "../talento-utils";
import type { RankedUser } from "../talento-utils";

/**
 * Returns the avatar color based on ranking position.
 * Gold for 1st, silver for 2nd, bronze for 3rd, gray otherwise.
 */
function getPositionColor(position: number): string {
  switch (position) {
    case 1:
      return "#FFD700";
    case 2:
      return "#C0C0C0";
    case 3:
      return "#CD7F32";
    default:
      return "#6B7280";
  }
}

/**
 * Returns podium background styling for top-3 positions.
 */
function getPodiumStyle(position: number): string {
  switch (position) {
    case 1:
      return "border-l-4 border-[#FFD700] bg-gradient-to-r from-yellow-50 to-transparent";
    case 2:
      return "border-l-4 border-[#C0C0C0] bg-gradient-to-r from-gray-50 to-transparent";
    case 3:
      return "border-l-4 border-[#CD7F32] bg-gradient-to-r from-orange-50 to-transparent";
    default:
      return "";
  }
}

export function TechMasterRanking() {
  const users = getUsers();
  const ranking: RankedUser[] = computeRanking(users);

  return (
    <article className="sb-ui-card sb-ui-card--elevated">
      <div className="sb-ui-card__content">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="sb-ui-heading-h6">Ranking TechMaster</h3>
        </div>
        <p className="sb-ui-text-caption mb-4" style={{ color: "var(--sb-ui-color-grayscale-base)" }}>
          Líderes de Vanguardia Técnica
        </p>

        {/* Leaderboard */}
        <div className="space-y-2">
          {ranking.map((ranked) => (
            <div
              key={ranked.user.id}
              className={`flex items-center gap-3 p-3 rounded-lg ${getPodiumStyle(ranked.position)}`}
            >
              {/* Position */}
              <span className="font-bold text-lg w-8 text-center shrink-0">
                {ranked.position}
              </span>

              {/* Avatar */}
              <UserCircle
                className="w-8 h-8 shrink-0"
                style={{ color: getPositionColor(ranked.position) }}
              />

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium truncate">{ranked.user.name}</span>
                  {ranked.isTechMaster && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
                      <Award className="w-3 h-3" />
                      TechMaster
                    </span>
                  )}
                </div>
                <span className="sb-ui-text-caption" style={{ color: "var(--sb-ui-color-grayscale-base)" }}>
                  {ranked.user.role}
                </span>
              </div>

              {/* Maturity Index */}
              <div className="text-right shrink-0">
                <span className="font-semibold text-sm">
                  {ranked.index.toFixed(1)} / 5.0
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
