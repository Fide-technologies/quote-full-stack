import React from 'react';
import { Layout, Banner } from '@shopify/polaris';

interface PlansBannersProps {
    showSuccessBanner: boolean;
    onDismissSuccess: () => void;
    showErrorBanner: boolean;
    onDismissError: () => void;
    upgradeError: string | null;
    onDismissUpgradeError: () => void;
}

export const PlansBanners: React.FC<PlansBannersProps> = ({
    showSuccessBanner,
    onDismissSuccess,
    showErrorBanner,
    onDismissError,
    upgradeError,
    onDismissUpgradeError
}) => {
    return (
        <>
            {showSuccessBanner && (
                <Layout.Section>
                    <Banner 
                        tone="success" 
                        onDismiss={onDismissSuccess}
                        title="Plan updated"
                    >
                        <p>Your plan has been updated successfully. New features are now available.</p>
                    </Banner>
                </Layout.Section>
            )}

            {showErrorBanner && (
                <Layout.Section>
                    <Banner 
                        tone="critical" 
                        onDismiss={onDismissError}
                        title="Upgrade failed"
                    >
                        <p>Could not process your plan upgrade. Please try again or contact support.</p>
                    </Banner>
                </Layout.Section>
            )}

            {upgradeError && (
                <Layout.Section>
                    <Banner 
                        tone="critical" 
                        title="Upgrade Error"
                        onDismiss={onDismissUpgradeError}
                    >
                        <p>{upgradeError}</p>
                    </Banner>
                </Layout.Section>
            )}
        </>
    );
};
