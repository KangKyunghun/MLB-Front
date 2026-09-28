import { api } from './client';
import type { TeamResponse } from '@/types';

export async function getAllTeams(): Promise<TeamResponse[]> {
  const { data } = await api.get<TeamResponse[]>('/api/teams');
  return data;
}