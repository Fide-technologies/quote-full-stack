import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getForm, updateForm } from '../api/forms';
import type { IForm, IFormStep, IFormField } from '../api/forms';
import {
    Page, Layout, Spinner, Box, Tabs, Banner, BlockStack, Button
} from '@shopify/polaris';
import { PlusIcon } from '@shopify/polaris-icons';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import { usePlanUsage } from '../hooks/usePlanUsage';
import { PlanAction } from '../constants/plan.constants';
import { useNavigate } from 'react-router-dom';

// Extracted Components
import { FormStep } from '../components/FormBuilder/FormStep';
import { FormPreview } from '../components/FormBuilder/FormPreview';
import { FormSettings } from '../components/FormBuilder/FormSettings';

export const FormBuilder: React.FC = () => {
    const queryClient = useQueryClient();
    const [formState, setFormState] = useState<IForm | null>(null);
    const [expandedStep, setExpandedStep] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState(0);
    const [previewStepIndex, setPreviewStepIndex] = useState(0);
    const navigate = useNavigate();
    const { hasPermission, isLoading: isPlanLoading } = usePlanUsage();
    const canEdit = hasPermission(PlanAction.CUSTOM_FORM_BUILDER);

    const tabs = [
        { id: 'builder', content: 'Form Builder', accessibilityLabel: 'Form Builder', panelID: 'builder-panel' },
        { id: 'preview', content: 'Form Preview', accessibilityLabel: 'Form Preview', panelID: 'preview-panel' },
    ];

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const { data: initialData, isLoading, error } = useQuery({
        queryKey: ['formConfig'],
        queryFn: getForm,
        enabled: canEdit
    });

    useEffect(() => {
        if (initialData) {
            const guaranteedSteps = [...initialData.steps];

            // Ensure system steps exist
            if (!guaranteedSteps.find(s => s.id === "step-contact")) {
                guaranteedSteps.unshift({
                    id: "step-contact", title: "Contact", isSystem: true, fields: [
                        { id: "field-fname", type: "text", label: "First Name", required: true, isSystem: true, layoutWidth: "half" },
                        { id: "field-lname", type: "text", label: "Last Name", required: true, isSystem: true, layoutWidth: "half" },
                        { id: "field-email", type: "email", label: "Email Address", required: true, isSystem: true, layoutWidth: "full" },
                        { id: "field-phone", type: "phone", label: "Phone Number", required: true, isSystem: true, layoutWidth: "full" }
                    ]
                });
            }

            const defaultLayouts: Record<string, 'full' | 'half'> = {
                'field-fname': 'half', 'field-lname': 'half', 'field-email': 'full', 'field-phone': 'full',
                'field-address1': 'full', 'field-address2': 'full', 'field-city': 'half', 'field-district': 'half',
                'field-state': 'half', 'field-pincode': 'half',
            };

            const enrichedSteps = guaranteedSteps.map(step => ({
                ...step,
                fields: step.fields.map(field => {
                    let updated = { ...field };
                    if (updated.isSystem && !updated.layoutWidth && defaultLayouts[updated.id]) {
                        updated.layoutWidth = defaultLayouts[updated.id];
                    }
                    return updated;
                })
            }));

            setFormState({ ...initialData, steps: enrichedSteps });
            setExpandedStep(enrichedSteps[0]?.id || null);
        }
    }, [initialData]);

    const updateMutation = useMutation({
        mutationFn: updateForm,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['formConfig'] });
            if (typeof shopify !== 'undefined') shopify.toast.show('Form saved successfully');
        }
    });

    const handleSave = () => {
        if (formState) {
            for (const step of formState.steps) {
                for (const field of step.fields) {
                    if (!field.label.trim()) {
                        if (typeof shopify !== 'undefined') shopify.toast.show(`Field label cannot be empty`, { isError: true });
                        return;
                    }
                }
            }
            updateMutation.mutate(formState);
        }
    };

    const addStep = () => {
        if (!formState) return;
        const updatedSteps = [...formState.steps];
        const newStep: IFormStep = {
            id: `step-${Date.now()}`,
            title: `Step ${updatedSteps.length}`,
            fields: []
        };
        const reviewIndex = updatedSteps.findIndex(s => s.id === 'step-review');
        if (reviewIndex !== -1) {
            updatedSteps.splice(reviewIndex, 0, newStep);
        } else {
            updatedSteps.push(newStep);
        }
        setFormState({ ...formState, steps: updatedSteps });
    };



    const addField = (stepIndex: number) => {
        if (!formState) return;
        const newField: IFormField = {
            id: `field-${Date.now()}`,
            type: 'text',
            label: 'New Custom Field',
            required: false
        };
        const updatedSteps = [...formState.steps];
        updatedSteps[stepIndex].fields.push(newField);
        setFormState({ ...formState, steps: updatedSteps });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id || !formState) return;

        const updated = { ...formState, steps: [...formState.steps] };
        const activeId = String(active.id);
        const overId = String(over.id);

        if (activeId.startsWith('step-') && overId.startsWith('step-')) {
            if (overId === 'step-review') return;
            const oldIndex = updated.steps.findIndex(s => s.id === activeId);
            const newIndex = updated.steps.findIndex(s => s.id === overId);
            if (newIndex !== -1 && oldIndex !== -1) {
                updated.steps = arrayMove(updated.steps, oldIndex, newIndex);
                setFormState(updated);
            }
        } else if (activeId.startsWith('field-') && overId.startsWith('field-')) {
            const stepIdx = formState.steps.findIndex(s => s.fields.some(f => f.id === activeId));
            if (stepIdx !== -1) {
                const overStepIdx = formState.steps.findIndex(s => s.fields.some(f => f.id === overId));
                if (stepIdx === overStepIdx) {
                    const fields = [...updated.steps[stepIdx].fields];
                    const oldIndex = fields.findIndex(f => f.id === activeId);
                    const newIndex = fields.findIndex(f => f.id === overId);
                    updated.steps[stepIdx].fields = arrayMove(fields, oldIndex, newIndex);
                    setFormState(updated);
                } else {
                    const activeField = formState.steps[stepIdx].fields.find(f => f.id === activeId);
                    if (activeField) {
                        const newFieldsArr = [...updated.steps[stepIdx].fields];
                        newFieldsArr.splice(newFieldsArr.findIndex(f => f.id === activeId), 1);
                        updated.steps[stepIdx].fields = newFieldsArr;

                        const overFieldsArr = [...updated.steps[overStepIdx].fields];
                        const newIndex = overFieldsArr.findIndex(f => f.id === overId);
                        overFieldsArr.splice(newIndex, 0, activeField);
                        updated.steps[overStepIdx].fields = overFieldsArr;
                        setFormState(updated);
                    }
                }
            }
        }
    };

    if (isPlanLoading) return <Page><Spinner size="large" /></Page>;

    if (!canEdit) {
        return (
            <Page title="Custom Form Builder">
                <Layout>
                    <Layout.Section>
                        <Banner
                            tone="warning"
                            title="Pro Plan Feature"
                            action={{ content: 'View Plans', onAction: () => navigate('/plans') }}
                        >
                            <p>The Custom Form Builder is only available on our Pro plans. Please upgrade to unlock this feature.</p>
                        </Banner>
                    </Layout.Section>
                </Layout>
            </Page>
        );
    }

    if (isLoading) return <Page><Spinner size="large" /></Page>;
    if (error) return <Page><Banner tone="critical">Failed to load form settings</Banner></Page>;

    if (!formState) return <Page><Spinner size="large" /></Page>;

    return (
        <Page
            title="Multi-Step Form Builder"
            primaryAction={{ content: 'Save Form', onAction: handleSave, loading: updateMutation.isPending }}
        >
            <BlockStack gap="400">
                <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
                    <Box padding="400">
                        {selectedTab === 0 ? (
                            <Layout>
                                <Layout.Section>
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext
                                            items={formState.steps.filter(s => s.id !== 'step-review').map(s => s.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            <BlockStack gap="400">
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
                                                        readOnly={false}
                                                    />
                                                ))}
                                                <Box paddingBlockStart="400">
                                                    <Button variant="primary" onClick={addStep} icon={PlusIcon} disabled={formState.steps.length >= 5}>
                                                        Add New Step
                                                    </Button>
                                                </Box>
                                            </BlockStack>
                                        </SortableContext>
                                    </DndContext>
                                </Layout.Section>
                                <Layout.Section variant="oneThird">
                                    <FormSettings formState={formState} setFormState={setFormState} />
                                </Layout.Section>
                            </Layout>
                        ) : (
                            <FormPreview
                                formState={formState}
                                previewStepIndex={previewStepIndex}
                                setPreviewStepIndex={setPreviewStepIndex}
                            />
                        )}
                    </Box>
                </Tabs>
            </BlockStack>
        </Page>
    );
};
