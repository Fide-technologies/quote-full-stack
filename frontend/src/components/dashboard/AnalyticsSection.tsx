import React, { useState, useCallback } from 'react';
import { Card, Box, BlockStack, InlineStack, Text, Button, Popover, ActionList } from '@shopify/polaris';
import { AnalyticsCard } from './AnalyticsCard';

import type { AnalyticsSectionProps } from '../../types/dashboard';

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
    periodOptions,
    selectedPeriod,
    onPeriodChange,
    currentStats,
    allTimeStats,
}) => {
    const [popoverActive, setPopoverActive] = useState(false);
    const togglePopover = useCallback(() => setPopoverActive((active) => !active), []);

    const conversionRate = currentStats.total > 0
        ? ((currentStats.converted / currentStats.total) * 100).toFixed(1)
        : "0.0";

    return (
        <Card padding="0">
            <Box padding="500">
                <BlockStack gap="400">
                    <InlineStack align="space-between" blockAlign="center">
                        <Text variant="headingMd" as="h2">Performance Analytics</Text>
                        <InlineStack gap="300" blockAlign="center">
                            <Box
                                background="bg-fill-info-secondary"
                                paddingInline="300"
                                paddingBlock="150"
                                borderRadius="200"
                                borderColor="border-info"
                                borderStyle="solid"
                                borderWidth="025"
                            >
                                <InlineStack gap="150" blockAlign="center">
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: 'var(--p-color-bg-fill-info)',
                                        boxShadow: '0 0 0 2px var(--p-color-bg-fill-info-secondary)',
                                        animation: 'pulse 2s infinite'
                                    }} />
                                    <Text variant="bodySm" as="p" fontWeight="medium">Live Data</Text>
                                </InlineStack>
                            </Box>

                            <Popover
                                active={popoverActive}
                                activator={
                                    <Button
                                        onClick={togglePopover}
                                        disclosure
                                        variant="tertiary"
                                        size="slim"
                                    >
                                        {periodOptions.find(opt => opt.value === selectedPeriod)?.label || 'Select Period'}
                                    </Button>
                                }
                                onClose={togglePopover}
                                autofocusTarget="first-node"
                            >
                                <ActionList
                                    actionRole="menuitem"
                                    items={periodOptions.map(option => ({
                                        content: option.label,
                                        active: selectedPeriod === option.value,
                                        onAction: () => {
                                            onPeriodChange(option.value);
                                            togglePopover();
                                        }
                                    }))}
                                />
                            </Popover>
                        </InlineStack>
                    </InlineStack>

                    <style>{`
                        @keyframes pulse {
                            0% { transform: scale(0.95); opacity: 0.8; }
                            50% { transform: scale(1.1); opacity: 1; }
                            100% { transform: scale(0.95); opacity: 0.8; }
                        }
                    `}</style>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <AnalyticsCard
                            title="TOTAL QUOTES"
                            value={currentStats.total}
                            subtitle="In this period"
                        />
                        <AnalyticsCard
                            title="CONVERTED"
                            value={currentStats.converted}
                            subtitle="Draft Orders created"
                            tone="success"
                        />
                        <AnalyticsCard
                            title="CONVERSION RATE"
                            value={`${conversionRate}%`}
                            subtitle="Quotes to Orders"
                        />
                        <AnalyticsCard
                            title="ESTIMATED REVENUE"
                            value={`$${(currentStats.amount / 100).toFixed(2)}`}
                            subtitle="From converted quotes"
                        />
                    </div>

                    <InlineStack gap="600" align="center">
                        <BlockStack gap="100" align="center">
                            <Text variant="bodySm" as="p" tone="subdued">TOTAL QUOTES</Text>
                            <Text variant="headingMd" as="p">{allTimeStats.totalQuotes}</Text>
                        </BlockStack>
                        <div style={{ width: '1px', height: '24px', background: 'var(--p-color-border-subdued)' }} />
                        <BlockStack gap="100" align="center">
                            <Text variant="bodySm" as="p" tone="subdued">TOTAL CONVERTED</Text>
                            <Text variant="headingMd" as="p">{allTimeStats.convertedQuotes}</Text>
                        </BlockStack>
                        <div style={{ width: '1px', height: '24px', background: 'var(--p-color-border-subdued)' }} />
                        <BlockStack gap="100" align="center">
                            <Text variant="bodySm" as="p" tone="subdued">REVENUE (ALL TIME)</Text>
                            <Text variant="headingMd" as="p">${(allTimeStats.yearAmount / 100).toFixed(2)}</Text>
                        </BlockStack>
                    </InlineStack>
                </BlockStack>
            </Box>
        </Card>
    );
};
