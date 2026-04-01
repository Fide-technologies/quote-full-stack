import React, { useState, useEffect } from 'react';
import {
    Page,
    Layout,
    Card,
    BlockStack,
    Text,
    InlineStack,
    Divider,
    Box,
    Badge,
    Banner,
    Tabs,
} from '@shopify/polaris';
import { PlusIcon, SaveIcon } from '@shopify/polaris-icons';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { getForm, updateForm, type IForm } from '../api/forms';
import { FormStep } from '../components/FormBuilder/FormStep';
import { FormPreview } from '../components/FormBuilder/FormPreview';
import { FormSettings } from '../components/FormBuilder/FormSettings';
import { usePlanUsage } from '../hooks/usePlanUsage';
import { PageLoader } from '../components/loaders/PageLoader';

export const FormBuilder: React.FC = () => {
    const [formState, setFormState] = useState<IForm | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [expandedStep, setExpandedStep] = useState<string | null>(null);
    const [previewStepIndex, setPreviewStepIndex] = useState(0);
    const [selectedTab, setSelectedTab] = useState(0);

    const { hasPermission, isLoading: isPlanLoading } = usePlanUsage();
    const [canEdit, setCanEdit] = useState(true);

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const data = await getForm();
                setFormState(data);
                if (data.steps.length > 0) {
                    setExpandedStep(data.steps[0].id);
                }
            } catch (err) {
                console.error("Fetch form error", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchForm();
    }, []);

    useEffect(() => {
        if (!isPlanLoading) {
            setCanEdit(hasPermission('form_builder'));
        }
    }, [isPlanLoading, hasPermission]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id && formState) {
            const oldIndex = formState.steps.findIndex(s => s.id === active.id);
            const newIndex = formState.steps.findIndex(s => s.id === over.id);
            setFormState({
                ...formState,
                steps: arrayMove(formState.steps, oldIndex, newIndex)
            });
        }
    };

    const addStep = () => {
        if (!formState) return;
        const newStepId = `step-${Date.now()}`;
        const newStep = {
            id: newStepId,
            title: 'New Step',
            fields: []
        };
        setFormState({
            ...formState,
            steps: [...formState.steps, newStep]
        });
        setExpandedStep(newStepId);
    };

    const addField = (stepIdx: number) => {
        if (!formState) return;
        const updated = { ...formState };
        const newField = {
            id: `field-${Date.now()}`,
            type: 'text',
            label: 'New Field',
            required: false
        };
        updated.steps[stepIdx].fields.push(newField);
        setFormState(updated);
    };

    const handleSave = async () => {
        if (!formState) return;
        setIsSaving(true);
        try {
            await updateForm(formState);
            if (typeof shopify !== 'undefined') shopify.toast.show('Form configuration saved');
        } catch (err) {
            console.error("Save form error", err);
            if (typeof shopify !== 'undefined') shopify.toast.show('Failed to save form', { isError: true });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || isPlanLoading) {
        return <PageLoader title="Form Builder" primaryAction hasSidebar />;
    }

    if (!canEdit) {
        return (
            <Page title="Form Builder">
                <Box paddingBlockEnd="800">
                    <Layout>
                        <Layout.Section>
                            <Banner tone="warning" title="Upgrade required">
                                <p>The form builder is only available on professional plans. Please upgrade to customize your quote form.</p>
                            </Banner>
                        </Layout.Section>
                    </Layout>
                </Box>
            </Page>
        );
    }

    const stepsCount = formState?.steps?.length || 0;

    const tabs = [
        {
            id: 'builder-tab',
            content: 'Builder',
            accessibilityLabel: 'Edit form fields',
            panelID: 'builder-panel',
        },
        {
            id: 'preview-tab',
            content: 'Preview',
            accessibilityLabel: 'View form preview',
            panelID: 'preview-panel',
        },
    ];

    return (
        <Page
            title="Form Builder"
            primaryAction={{
                content: 'Save Form',
                icon: SaveIcon,
                onAction: handleSave,
                loading: isSaving,
                disabled: isSaving
            }}
            secondaryActions={[
                {
                    content: 'Add Step',
                    icon: PlusIcon,
                    onAction: addStep,
                    disabled: stepsCount >= 6
                }
            ]}
        >
            <Box paddingBlockEnd="800">
                <Layout>
                    <Layout.Section>
                        <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
                            <Box paddingBlockStart="400">
                                {selectedTab === 0 ? (
                                    <BlockStack gap="400">
                                        {formState && (
                                            <DndContext
                                                sensors={sensors}
                                                collisionDetection={closestCenter}
                                                onDragEnd={handleDragEnd}
                                            >
                                                <BlockStack gap="400">
                                                    <SortableContext
                                                        items={formState.steps.map(s => s.id)}
                                                        strategy={verticalListSortingStrategy}
                                                    >
                                                        {formState.steps.map((step, idx) => (
                                                            <FormStep
                                                                key={step.id}
                                                                step={step}
                                                                stepIdx={idx}
                                                                formState={formState}
                                                                setFormState={setFormState}
                                                                expandedStep={expandedStep}
                                                                setExpandedStep={setExpandedStep}
                                                                addField={addField}
                                                            />
                                                        ))}
                                                    </SortableContext>
                                                </BlockStack>
                                            </DndContext>
                                        )}

                                        {formState && (
                                            <Card>
                                                <FormSettings formState={formState} setFormState={setFormState} />
                                            </Card>
                                        )}
                                        
                                        <Banner tone="info">
                                            <p>Combine up to 6 steps and 6 fields per step in your custom form configuration.</p>
                                        </Banner>
                                    </BlockStack>
                                ) : (
                                    <BlockStack gap="400">
                                        <Card>
                                            <BlockStack gap="300">
                                                <InlineStack align="space-between" blockAlign="center">
                                                    <Text variant="headingMd" as="h2">Live Preview</Text>
                                                    <Badge tone="info">{`${stepsCount} Steps`}</Badge>
                                                </InlineStack>
                                                <Divider />
                                                <Box paddingBlockStart="200">
                                                    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                                                        {formState && (
                                                            <FormPreview
                                                                formState={formState}
                                                                previewStepIndex={previewStepIndex}
                                                                setPreviewStepIndex={setPreviewStepIndex}
                                                            />
                                                        )}
                                                    </div>
                                                </Box>
                                            </BlockStack>
                                        </Card>
                                    </BlockStack>
                                )}
                            </Box>
                        </Tabs>
                    </Layout.Section>
                </Layout>
            </Box>
        </Page>
    );
};
