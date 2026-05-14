import React from 'react';
import { Layout, InlineGrid } from '@shopify/polaris';
import { PlanCard } from './PlanCard';
import { FreePlanInfo } from './FreePlanInfo';
import type { Plan } from '../../types/plans';

interface PlansGridProps {
    isPaidApp: boolean;
    plans: Plan[];
    currentPlanName: string;
    isUpgrading: boolean;
    upgradingPlanId: string | undefined;
    onUpgrade: (planId: string) => void;
}

export const PlansGrid: React.FC<PlansGridProps> = ({
    isPaidApp,
    plans,
    currentPlanName,
    isUpgrading,
    upgradingPlanId,
    onUpgrade
}) => {
    if (!isPaidApp) {
        return (
            <Layout.Section>
                <FreePlanInfo />
            </Layout.Section>
        );
    }

    return (
        <Layout.Section>
            <InlineGrid columns={{ xs: 1, md: 3 }} gap="400">
                {plans.map((plan) => (
                    <PlanCard 
                        key={plan.id}
                        plan={plan}
                        currentPlanName={currentPlanName}
                        isUpgrading={isUpgrading}
                        upgradingPlanId={upgradingPlanId}
                        onUpgrade={onUpgrade}
                    />
                ))}
            </InlineGrid>
        </Layout.Section>
    );
};
