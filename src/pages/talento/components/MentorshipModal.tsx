import { useState } from 'react';
import { X, Calendar, Clock, Users, UserCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { User, Skill } from '../../../types';
import { getUsers } from '../../../data/data-service';

export interface MentorshipModalProps {
  expert: User;
  expertTeamName: string;
  onClose: () => void;
  onConfirm: (selectedSlot: string, mentees: string[]) => void;
}

/** Simulated available time slots for the expert */
function getAvailableSlots(expertId: string): { day: string; time: string; id: string }[] {
  // Generate mock availability based on expertId for consistency
  const baseSlots = [
    { day: 'Lunes', time: '9:00 - 10:00 AM', id: 'mon-9' },
    { day: 'Lunes', time: '3:00 - 4:00 PM', id: 'mon-15' },
    { day: 'Martes', time: '10:00 - 11:00 AM', id: 'tue-10' },
    { day: 'Miércoles', time: '2:00 - 3:00 PM', id: 'wed-14' },
    { day: 'Jueves', time: '11:00 - 12:00 PM', id: 'thu-11' },
    { day: 'Viernes', time: '9:00 - 10:00 AM', id: 'fri-9' },
  ];
  // Use expertId hash to pick 3-4 slots
  const hash = expertId.charCodeAt(expertId.length - 1) % 3;
  return baseSlots.slice(hash, hash + 4);
}

/**
 * Identifies users who have weak skills (level 1 or 2) in the expert's strong areas (level 4-5).
 * These are the "talentos débiles" who would benefit from mentorship.
 */
function getWeakTalents(expert: User): { user: User; weakSkills: Skill[]; matchingExpertSkills: string[] }[] {
  const allUsers = getUsers();
  const expertStrongSkills = expert.skills.filter(s => s.level >= 4).map(s => s.name.toLowerCase());

  if (expertStrongSkills.length === 0) return [];

  const weakTalents: { user: User; weakSkills: Skill[]; matchingExpertSkills: string[] }[] = [];

  for (const user of allUsers) {
    if (user.id === expert.id) continue;

    const userWeakInExpertArea = user.skills.filter(
      s => s.level <= 2 && expertStrongSkills.includes(s.name.toLowerCase())
    );

    // Also check if user LACKS skills that the expert has (implicit gap)
    const userSkillNames = user.skills.map(s => s.name.toLowerCase());
    const missingSkills = expert.skills
      .filter(s => s.level >= 4 && !userSkillNames.includes(s.name.toLowerCase()))
      .map(s => s.name);

    if (userWeakInExpertArea.length > 0 || missingSkills.length > 0) {
      weakTalents.push({
        user,
        weakSkills: userWeakInExpertArea,
        matchingExpertSkills: [
          ...userWeakInExpertArea.map(s => s.name),
          ...missingSkills,
        ],
      });
    }
  }

  return weakTalents;
}

/**
 * MentorshipModal shows the expert's available schedule and identifies
 * weak-talent users who would benefit from the mentorship session.
 */
export function MentorshipModal({ expert, expertTeamName, onClose, onConfirm }: MentorshipModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedMentees, setSelectedMentees] = useState<Set<string>>(new Set());

  const slots = getAvailableSlots(expert.id);
  const weakTalents = getWeakTalents(expert);

  const toggleMentee = (userId: string) => {
    setSelectedMentees(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const selectAllMentees = () => {
    if (selectedMentees.size === weakTalents.length) {
      setSelectedMentees(new Set());
    } else {
      setSelectedMentees(new Set(weakTalents.map(t => t.user.id)));
    }
  };

  const handleConfirm = () => {
    if (selectedSlot) {
      onConfirm(selectedSlot, Array.from(selectedMentees));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between border-b"
          style={{ borderColor: 'var(--sb-ui-color-grayscale-L200, #e0e0e0)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'var(--sb-ui-color-primary-base, #009056)' }}
            >
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="sb-ui-heading-h6">Solicitar Mentoría</h3>
              <p className="sb-ui-text-caption" style={{ color: 'var(--sb-ui-color-grayscale-base)' }}>
                con {expert.name} — {expertTeamName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-bolivar-gray-bg transition-colors"
          >
            <X className="w-5 h-5" style={{ color: 'var(--sb-ui-color-grayscale-base)' }} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Available Schedule */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-bolivar-green" />
              <h4 className="text-sm font-bold" style={{ color: 'var(--sb-ui-color-grayscale-D400, #333)' }}>
                Agenda Disponible
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedSlot(slot.id)}
                  className={`p-3 rounded-md border text-left transition-all text-sm ${
                    selectedSlot === slot.id ? 'shadow-sm' : 'hover:border-bolivar-green'
                  }`}
                  style={
                    selectedSlot === slot.id
                      ? {
                          borderColor: 'var(--sb-ui-color-primary-base, #009056)',
                          background: 'var(--sb-ui-color-primary-L300, #e5f4ee)',
                        }
                      : { borderColor: 'var(--sb-ui-color-grayscale-L200, #e0e0e0)' }
                  }
                >
                  <span className="font-semibold" style={{ color: 'var(--sb-ui-color-grayscale-D400, #333)' }}>
                    {slot.day}
                  </span>
                  <span className="ml-2" style={{ color: 'var(--sb-ui-color-grayscale-base, #666)' }}>
                    {slot.time}
                  </span>
                  {selectedSlot === slot.id && (
                    <CheckCircle2 className="inline-block ml-2 w-4 h-4 text-bolivar-green" />
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Weak Talents Group */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-bolivar-yellow" />
                <h4 className="text-sm font-bold" style={{ color: 'var(--sb-ui-color-grayscale-D400, #333)' }}>
                  Grupo de Talentos a Desarrollar
                </h4>
              </div>
              {weakTalents.length > 0 && (
                <button
                  type="button"
                  onClick={selectAllMentees}
                  className="text-xs font-medium px-2 py-1 rounded transition-colors"
                  style={{ color: 'var(--sb-ui-color-primary-base, #009056)' }}
                >
                  {selectedMentees.size === weakTalents.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                </button>
              )}
            </div>

            {weakTalents.length === 0 ? (
              <div className="text-center py-4 rounded-md" style={{ background: 'var(--sb-ui-color-grayscale-L300, #f5f5f5)' }}>
                <p className="sb-ui-text-caption" style={{ color: 'var(--sb-ui-color-grayscale-base)' }}>
                  No se identificaron talentos con brechas en las áreas de este experto
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="sb-ui-text-caption mb-2" style={{ color: 'var(--sb-ui-color-grayscale-base)' }}>
                  Colaboradores con brechas en las áreas fuertes de {expert.name.split(' ')[0]}:
                </p>
                {weakTalents.map(({ user, matchingExpertSkills }) => (
                  <label
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all ${
                      selectedMentees.has(user.id) ? '' : 'hover:border-bolivar-green'
                    }`}
                    style={
                      selectedMentees.has(user.id)
                        ? {
                            borderColor: 'var(--sb-ui-color-primary-base, #009056)',
                            background: 'var(--sb-ui-color-primary-L300, #e5f4ee)',
                          }
                        : { borderColor: 'var(--sb-ui-color-grayscale-L200, #e0e0e0)' }
                    }
                  >
                    <input
                      type="checkbox"
                      checked={selectedMentees.has(user.id)}
                      onChange={() => toggleMentee(user.id)}
                      className="sr-only"
                    />
                    <div className="shrink-0 w-8 h-8 rounded-full bg-bolivar-gray-bg flex items-center justify-center">
                      <UserCircle className="w-5 h-5" style={{ color: 'var(--sb-ui-color-grayscale-base)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--sb-ui-color-grayscale-D400, #333)' }}>
                        {user.name}
                      </p>
                      <div className="flex items-center gap-1 flex-wrap">
                        <AlertTriangle className="w-3 h-3 text-bolivar-yellow shrink-0" />
                        <span className="sb-ui-text-caption text-xs" style={{ color: 'var(--sb-ui-color-grayscale-base)' }}>
                          Necesita: {matchingExpertSkills.slice(0, 3).join(', ')}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors`}
                      style={
                        selectedMentees.has(user.id)
                          ? { borderColor: 'var(--sb-ui-color-primary-base)', background: 'var(--sb-ui-color-primary-base)' }
                          : { borderColor: 'var(--sb-ui-color-grayscale-L200, #e0e0e0)' }
                      }
                    >
                      {selectedMentees.has(user.id) && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex items-center justify-between border-t"
          style={{ borderColor: 'var(--sb-ui-color-grayscale-L200, #e0e0e0)' }}
        >
          <p className="sb-ui-text-caption" style={{ color: 'var(--sb-ui-color-grayscale-base)' }}>
            {selectedMentees.size > 0
              ? `${selectedMentees.size} participante${selectedMentees.size > 1 ? 's' : ''} seleccionado${selectedMentees.size > 1 ? 's' : ''}`
              : 'Selecciona un horario para continuar'}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
              style={{
                border: '1px solid var(--sb-ui-color-grayscale-L200, #e0e0e0)',
                color: 'var(--sb-ui-color-grayscale-base)',
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedSlot}
              className="px-4 py-2 text-sm font-semibold rounded-md text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
              style={{ background: 'var(--sb-ui-color-primary-base, #009056)' }}
            >
              Confirmar Mentoría
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
