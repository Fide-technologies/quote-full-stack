import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { getCurrentPlan, upgradePlan } from '../api/plans';
import plansData from '../data/plans.json';
import type { Plan } from '../types/plans';

export const usePlansLogic = () => {
    const [searchParams] = useSearchParams();
    const host = searchParams.get('host') || '';
    const queryClient = useQueryClient();

    // States for banners
    const [showSuccessBanner, setShowSuccessBanner] = useState(false);
    const [showErrorBanner, setShowErrorBanner] = useState(false);
    const [upgradeError, setUpgradeError] = useState<string | null>(null);

    // Fetch current plan data
    const {
        data: currentPlanData,
        isLoading,
        isError,
        error,
        refetch
    } = useQuery({
        queryKey: ['planUsage'],
        queryFn: getCurrentPlan,
        staleTime: 5 * 60 * 1000,
    });

    const plans: Plan[] = plansData;

    const currentPlanName = currentPlanData?.plan?.name || 'Starter';

    const upgradeMutation = useMutation({
        mutationFn: (planId: string) => upgradePlan(planId, host),
        onSuccess: (data) => {
            if (data.confirmationUrl) {
                // Redirect to Shopify confirmation page
                window.open(data.confirmationUrl, '_top');
            } else {
                setShowSuccessBanner(true);
                queryClient.invalidateQueries({ queryKey: ['planUsage'] });
            }
        },
        onError: (err: any) => {
            setUpgradeError(err.message || 'Failed to initiate upgrade');
            setShowErrorBanner(true);
        }
    });

    const handleUpgrade = (planId: string) => {
        setUpgradeError(null);
        upgradeMutation.mutate(planId);
    };

    return {
        currentPlanData,
        plans,
        currentPlanName,
        isLoading,
        isError,
        error,
        refetch,
        upgradeMutation,
        handleUpgrade,
        upgradeError,
        showSuccessBanner,
        setShowSuccessBanner,
        showErrorBanner,
        setShowErrorBanner,
        setUpgradeError
    };
};
