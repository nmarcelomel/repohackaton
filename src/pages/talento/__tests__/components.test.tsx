import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { User, Skill, Team } from '../../../types';

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockUsers: User[] = [
  {
    id: 'user-01',
    name: 'Carlos Martínez',
    role: 'Tech Lead',
    teamId: 'team-openfinance',
    skills: [
      { name: 'React', level: 5 },
      { name: 'TypeScript', level: 4 },
      { name: 'AWS', level: 3 },
    ],
  },
  {
    id: 'user-02',
    name: 'Ana López',
    role: 'Backend Developer',
    teamId: 'team-openfinance',
    skills: [
      { name: 'Java', level: 5 },
      { name: 'Spring Boot', level: 4 },
      { name: 'PostgreSQL', level: 4 },
    ],
  },
  {
    id: 'user-03',
    name: 'Diego Ramírez',
    role: 'QA Engineer',
    teamId: 'team-openfinance',
    skills: [
      { name: 'Selenium', level: 4 },
      { name: 'Cypress', level: 3 },
      { name: 'Python', level: 3 },
    ],
  },
];

const mockTeams: Team[] = [
  {
    id: 'team-openfinance',
    name: 'OpenFinance',
    wipLimit: 5,
    wipCurrent: 3,
    doraMetrics: {
      deploymentFrequency: 12,
      leadTimeForChanges: 4.2,
      changeFailureRate: 8,
      mttr: 1.5,
    },
    previousLeadTimeForChanges: 6.5,
    memberMood: [],
  },
  {
    id: 'team-siniestros',
    name: 'Siniestros',
    wipLimit: 5,
    wipCurrent: 5,
    doraMetrics: {
      deploymentFrequency: 6,
      leadTimeForChanges: 12.5,
      changeFailureRate: 15,
      mttr: 4.0,
    },
    previousLeadTimeForChanges: 15.0,
    memberMood: [],
  },
  {
    id: 'team-emision',
    name: 'Emisión',
    wipLimit: 5,
    wipCurrent: 4,
    doraMetrics: {
      deploymentFrequency: 8,
      leadTimeForChanges: 7.8,
      changeFailureRate: 10,
      mttr: 2.3,
    },
    memberMood: [],
  },
];

vi.mock('../../../data/data-service', () => ({
  getUsers: () => [...mockUsers],
  getTeams: () => [...mockTeams],
  getTeamById: (id: string) => mockTeams.find((t) => t.id === id),
}));

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  RadarChart: ({ children }: any) => <div data-testid="radar-chart">{children}</div>,
  PolarGrid: () => null,
  PolarAngleAxis: () => null,
  PolarRadiusAxis: () => null,
  Radar: () => null,
  Legend: () => null,
}));

// ─── Imports (after mocks) ───────────────────────────────────────────────────

import { ExpertSearch } from '../components/ExpertSearch';
import { ExpertCard } from '../components/ExpertCard';
import { GrowthRadar } from '../components/GrowthRadar';
import { Communities } from '../components/Communities';
import { TechRewards } from '../components/TechRewards';

// ─── ExpertSearch Tests ──────────────────────────────────────────────────────

describe('ExpertSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders all users when search is empty', () => {
    render(<ExpertSearch />);
    expect(screen.getByText('Carlos Martínez')).toBeInTheDocument();
    expect(screen.getByText('Ana López')).toBeInTheDocument();
    expect(screen.getByText('Diego Ramírez')).toBeInTheDocument();
  });

  it('filters users by skill name after debounce', async () => {
    render(<ExpertSearch />);
    const input = screen.getByPlaceholderText('Buscar experto por tecnología...');

    await act(async () => {
      fireEvent.change(input, { target: { value: 'React' } });
    });

    // Before debounce, all users still visible
    expect(screen.getByText('Carlos Martínez')).toBeInTheDocument();

    // Advance timers to trigger debounce (300ms)
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    // After debounce, only user with React skill visible
    expect(screen.getByText('Carlos Martínez')).toBeInTheDocument();
    expect(screen.queryByText('Ana López')).not.toBeInTheDocument();
    expect(screen.queryByText('Diego Ramírez')).not.toBeInTheDocument();
  });

  it('shows no results message when no matches', async () => {
    render(<ExpertSearch />);
    const input = screen.getByPlaceholderText('Buscar experto por tecnología...');

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Nonexistent' } });
    });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(
      screen.getByText("No se encontraron expertos para 'Nonexistent'")
    ).toBeInTheDocument();
  });
});

// ─── ExpertCard Tests ────────────────────────────────────────────────────────

describe('ExpertCard', () => {
  const baseUser: User = {
    id: 'user-01',
    name: 'Carlos Martínez',
    role: 'Tech Lead',
    teamId: 'team-openfinance',
    skills: [
      { name: 'React', level: 5 },
      { name: 'TypeScript', level: 4 },
    ],
  };

  it('renders user name, role, and team name', () => {
    render(
      <ExpertCard
        user={baseUser}
        teamName="OpenFinance"
        matchingSkills={baseUser.skills}
        onRequestMentorship={vi.fn()}
        mentorshipRequested={false}
      />
    );
    expect(screen.getByText('Carlos Martínez')).toBeInTheDocument();
    expect(screen.getByText('Tech Lead')).toBeInTheDocument();
    expect(screen.getByText('OpenFinance')).toBeInTheDocument();
  });

  it('shows "Equipo no asignado" when teamName is empty', () => {
    render(
      <ExpertCard
        user={baseUser}
        teamName=""
        matchingSkills={baseUser.skills}
        onRequestMentorship={vi.fn()}
        mentorshipRequested={false}
      />
    );
    expect(screen.getByText('Equipo no asignado')).toBeInTheDocument();
  });

  it('displays max 10 skills even if user has more', () => {
    const manySkills: Skill[] = Array.from({ length: 12 }, (_, i) => ({
      name: `Skill${i + 1}`,
      level: 3 as Skill['level'],
    }));

    render(
      <ExpertCard
        user={baseUser}
        teamName="OpenFinance"
        matchingSkills={manySkills}
        onRequestMentorship={vi.fn()}
        mentorshipRequested={false}
      />
    );

    // Should show exactly 10 skill chips
    expect(screen.getByText('Skill1 (3/5)')).toBeInTheDocument();
    expect(screen.getByText('Skill10 (3/5)')).toBeInTheDocument();
    expect(screen.queryByText('Skill11 (3/5)')).not.toBeInTheDocument();
    expect(screen.queryByText('Skill12 (3/5)')).not.toBeInTheDocument();
  });

  it('shows "No hay skills registrados" when matchingSkills is empty', () => {
    render(
      <ExpertCard
        user={baseUser}
        teamName="OpenFinance"
        matchingSkills={[]}
        onRequestMentorship={vi.fn()}
        mentorshipRequested={false}
      />
    );
    expect(screen.getByText('No hay skills registrados')).toBeInTheDocument();
  });

  it('button "Solicitar Mentoría" calls onRequestMentorship on click', () => {
    const onRequestMentorship = vi.fn();
    render(
      <ExpertCard
        user={baseUser}
        teamName="OpenFinance"
        matchingSkills={baseUser.skills}
        onRequestMentorship={onRequestMentorship}
        mentorshipRequested={false}
      />
    );

    fireEvent.click(screen.getByText('Solicitar Mentoría'));
    expect(onRequestMentorship).toHaveBeenCalledWith('user-01');
  });

  it('shows "Solicitud Enviada" disabled when mentorshipRequested is true', () => {
    render(
      <ExpertCard
        user={baseUser}
        teamName="OpenFinance"
        matchingSkills={baseUser.skills}
        onRequestMentorship={vi.fn()}
        mentorshipRequested={true}
      />
    );

    const button = screen.getByText('Solicitud Enviada');
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });
});

// ─── GrowthRadar Tests ───────────────────────────────────────────────────────

describe('GrowthRadar', () => {
  it('renders chart area when user has skills', () => {
    render(<GrowthRadar />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });

  it('shows "No hay datos de skills disponibles" when user has no skills', () => {
    // Temporarily override mockUsers to have no skills
    const originalSkills = mockUsers[0].skills;
    mockUsers[0].skills = [];

    render(<GrowthRadar />);
    expect(screen.getByText('No hay datos de skills disponibles')).toBeInTheDocument();

    // Restore
    mockUsers[0].skills = originalSkills;
  });
});

// ─── Communities Tests ───────────────────────────────────────────────────────

describe('Communities', () => {
  it('renders 3 community cards with correct names and member counts', () => {
    render(<Communities />);

    expect(screen.getByText('TechLovers AI')).toBeInTheDocument();
    expect(screen.getByText('TechMaster Frontend')).toBeInTheDocument();
    expect(screen.getByText('TechLovers Cloud')).toBeInTheDocument();

    expect(screen.getByText('128 miembros')).toBeInTheDocument();
    expect(screen.getByText('95 miembros')).toBeInTheDocument();
    expect(screen.getByText('64 miembros')).toBeInTheDocument();
  });

  it('"Unirme" button changes to "Miembro ✓" on click', () => {
    render(<Communities />);

    const joinButtons = screen.getAllByText('Unirme');
    expect(joinButtons).toHaveLength(3);

    fireEvent.click(joinButtons[0]);

    expect(screen.getByText('Miembro ✓')).toBeInTheDocument();
    expect(screen.getAllByText('Unirme')).toHaveLength(2);
  });

  it('disabled button does not fire action', () => {
    render(<Communities />);

    // Click to join first community
    const joinButtons = screen.getAllByText('Unirme');
    fireEvent.click(joinButtons[0]);

    // Now the "Miembro ✓" button is disabled
    const memberButton = screen.getByText('Miembro ✓');
    expect(memberButton).toBeDisabled();

    // Clicking it should not change anything
    fireEvent.click(memberButton);
    expect(screen.getByText('Miembro ✓')).toBeInTheDocument();
    expect(screen.getAllByText('Unirme')).toHaveLength(2);
  });
});

// ─── TechRewards Tests ───────────────────────────────────────────────────────

describe('TechRewards', () => {
  it('renders team cards (at least 1 team name appears)', () => {
    render(<TechRewards />);
    expect(screen.getByText('OpenFinance')).toBeInTheDocument();
  });

  it('shows "Equipo TechMaster" badge for qualifying teams', () => {
    render(<TechRewards />);
    // OpenFinance has elite DORA metrics + 35% improvement → qualifies for badge
    expect(screen.getByText('Equipo TechMaster')).toBeInTheDocument();
  });

  it('shows "Sin datos históricos" when previousLeadTimeForChanges is undefined', () => {
    render(<TechRewards />);
    // team-emision has no previousLeadTimeForChanges (undefined in mockTeams)
    expect(screen.getByText('Sin datos históricos')).toBeInTheDocument();
  });

  it('shows "En camino a TechMaster" progress bar for non-badge teams', () => {
    render(<TechRewards />);
    // Teams without badge should show the progress text
    expect(screen.getAllByText('En camino a TechMaster').length).toBeGreaterThanOrEqual(1);
  });
});
