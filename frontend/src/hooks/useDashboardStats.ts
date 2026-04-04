import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, type DashboardStats } from '../api/dashboard';

export function useDashboardStats() {
    return useQuery<DashboardStats>({
        queryKey: ['dashboard-stats'],
        queryFn: getDashboardStats,
        refetchOnWindowFocus: true,
    });
}
