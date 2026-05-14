import { useQuery } from '@tanstack/react-query';
import { type DashboardStats, getDashboardStats } from '../api/dashboard';

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    refetchOnWindowFocus: true,
  });
}
