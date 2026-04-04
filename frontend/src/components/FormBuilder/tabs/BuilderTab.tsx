import React from 'react';
import { Banner, BlockStack, Layout } from '@shopify/polaris';
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
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { IForm } from '../../../api/forms';
import { FormStep } from '../FormStep';

interface BuilderTabProps {
    formState: IForm;
    setFormState: React.Dispatch<React.SetStateAction<IForm | null>>;
    expandedStep: string | null;
    setExpandedStep: React.Dispatch<React.SetStateAction<string | null>>;
    addField: (stepIdx: number) => void;
    handleDragEnd: (event: DragEndEvent) => void;
}

export const BuilderTab: React.FC<BuilderTabProps> = ({
    formState,
    setFormState,
    expandedStep,
    setExpandedStep,
    addField,
    handleDragEnd
}) => {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    return (
        <Layout>
            <Layout.Section>
                <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                    <BlockStack gap="400">
                        <Banner tone="info">
                            <p>Combine up to 6 steps and 6 fields per step in your custom form configuration. Drag and drop to reorder steps.</p>
                        </Banner>
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
                    </BlockStack>
                </div>
            </Layout.Section>
        </Layout>
    );
};
