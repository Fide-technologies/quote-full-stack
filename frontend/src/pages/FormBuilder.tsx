import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getForm, updateForm } from '../api/forms';
import type { IForm, IFormStep, IFormField } from '../api/forms';
import {
    Page, Layout, Spinner, Box, Tabs, Banner, BlockStack, Button
} from '@shopify/polaris';
import { PlusIcon } from '@shopify/polaris-icons';
import {
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
    arrayMove,
    sortableKeyboardCoordinates
} from '@dnd-kit/sortable';

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
        const newStep: IFormStep = {
            id: `step-${Date.now()}`,
            title: `Step ${formState.steps.length + 1}`,
            fields: []
        };
        setFormState({ ...formState, steps: [...formState.steps, newStep] });
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

    const handleDragEnd = (event: DragEndEvent, stepIdx: number) => {
        const { active, over } = event;
        if (over && active.id !== over.id && formState) {
            const updated = { ...formState, steps: [...formState.steps] };
            const fields = [...updated.steps[stepIdx].fields];
            const oldIndex = fields.findIndex(f => f.id === active.id);
            const newIndex = fields.findIndex(f => f.id === over.id);
            updated.steps[stepIdx].fields = arrayMove(fields, oldIndex, newIndex);
            setFormState(updated);
        }
    };

    if (isLoading || !formState) return <Page><Spinner size="large" /></Page>;
    if (error) return <Page><Banner tone="critical">Failed to load form builder.</Banner></Page>;

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
                                                sensors={sensors}
                                                handleDragEnd={handleDragEnd}
                                                addField={addField}
                                            />
                                        ))}
                                        <Box paddingBlockStart="400">
                                            <Button variant="primary" onClick={addStep} icon={PlusIcon} disabled={formState.steps.length >= 5}>
                                                Add New Step
                                            </Button>
                                        </Box>
                                    </BlockStack>
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
