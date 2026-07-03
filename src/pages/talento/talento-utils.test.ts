// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { filterUsersBySkill, getMatchingSkills } from './talento-utils';
import type { User } from '../../types';

const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Alice',
    role: 'Frontend Dev',
    teamId: 'team-1',
    skills: [
      { name: 'React', level: 4 },
      { name: 'TypeScript', level: 5 },
    ],
  },
  {
    id: 'u2',
    name: 'Bob',
    role: 'Backend Dev',
    teamId: 'team-2',
    skills: [
      { name: 'Java', level: 3 },
      { name: 'Spring', level: 4 },
    ],
  },
  {
    id: 'u3',
    name: 'Charlie',
    role: 'Fullstack',
    teamId: 'team-1',
    skills: [
      { name: 'React', level: 3 },
      { name: 'Node.js', level: 4 },
      { name: 'typescript', level: 2 },
    ],
  },
];

describe('filterUsersBySkill', () => {
  it('returns all users when searchTerm is empty', () => {
    expect(filterUsersBySkill(mockUsers, '')).toEqual(mockUsers);
  });

  it('filters users by skill name case-insensitively', () => {
    const result = filterUsersBySkill(mockUsers, 'react');
    expect(result).toHaveLength(2);
    expect(result.map((u) => u.id)).toEqual(['u1', 'u3']);
  });

  it('matches substring in skill name', () => {
    const result = filterUsersBySkill(mockUsers, 'script');
    expect(result).toHaveLength(2);
    expect(result.map((u) => u.id)).toEqual(['u1', 'u3']);
  });

  it('returns empty array when no users match', () => {
    const result = filterUsersBySkill(mockUsers, 'python');
    expect(result).toHaveLength(0);
  });

  it('is case-insensitive (uppercase search)', () => {
    const result = filterUsersBySkill(mockUsers, 'JAVA');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('u2');
  });
});

describe('getMatchingSkills', () => {
  it('returns empty array when searchTerm is empty', () => {
    expect(getMatchingSkills(mockUsers[0], '')).toEqual([]);
  });

  it('returns matching skills case-insensitively', () => {
    const result = getMatchingSkills(mockUsers[0], 'type');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('TypeScript');
  });

  it('returns multiple matching skills', () => {
    const result = getMatchingSkills(mockUsers[2], 'script');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('typescript');
  });

  it('returns empty array when no skills match', () => {
    const result = getMatchingSkills(mockUsers[0], 'python');
    expect(result).toHaveLength(0);
  });
});
