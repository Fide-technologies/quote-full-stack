import { useState, useEffect } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import { getForm, updateForm, type IForm } from '../api/forms';
import { usePlanUsage } from '../hooks/usePlanUsage';

export function useFormBuilder() {
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
        
        const updatedSteps = [...formState.steps];
        const reviewIndex = updatedSteps.findIndex(s => s.id === 'step-review');
        
        if (reviewIndex !== -1) {
            updatedSteps.splice(reviewIndex, 0, newStep);
        } else {
            updatedSteps.push(newStep);
        }

        setFormState({
            ...formState,
            steps: updatedSteps
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

    return {
        formState,
        setFormState,
        isLoading: isLoading || isPlanLoading,
        isSaving,
        expandedStep,
        setExpandedStep,
        previewStepIndex,
        setPreviewStepIndex,
        selectedTab,
        setSelectedTab,
        canEdit,
        handleDragEnd,
        addStep,
        addField,
        handleSave,
        stepsCount: formState?.steps?.length || 0
    };
}
