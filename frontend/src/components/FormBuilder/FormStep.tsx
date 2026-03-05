import React from 'react';
import { Card, BlockStack, InlineStack, Text, Button, Collapsible, TextField, Divider, Box } from '@shopify/polaris';
import { ChevronUpIcon, ChevronDownIcon, PlusIcon } from '@shopify/polaris-icons';
import { DndContext, closestCenter, type SensorDescriptor, type SensorOptions } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableFieldItem } from './SortableFieldItem';
import type { IForm, IFormStep } from '../../api/forms';

interface FormStepProps {
    step: IFormStep;
    stepIdx: number;
    formState: IForm;
    setFormState: React.Dispatch<React.SetStateAction<IForm | null>>;
    expandedStep: string | null;
    setExpandedStep: (id: string | null) => void;
    sensors: SensorDescriptor<SensorOptions>[];
    handleDragEnd: (event: any, stepIdx: number) => void;
    addField: (stepIdx: number) => void;
}

export const FormStep: React.FC<FormStepProps> = ({
    step,
    stepIdx,
    formState,
    setFormState,
    expandedStep,
    setExpandedStep,
    sensors,
    handleDragEnd,
    addField
}) => {
    return (
        <Card key={step.id}>
            <BlockStack gap="400">
                <div
                    className="cursor-pointer"
                    onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                >
                    <InlineStack align="space-between" blockAlign="center">
                        <Text variant="headingMd" as="h2">Step {stepIdx + 1}: {step.title}</Text>
                        <InlineStack gap="300" blockAlign="center">
                            <Text variant="bodySm" as="span" tone="subdued">
                                {step.fields.length} / 6 fields
                            </Text>
                            {!step.isSystem && (
                                <div onClick={(e) => e.stopPropagation()}>
                                    <Button
                                        tone="critical"
                                        variant="plain"
                                        onClick={() => {
                                            const updated = [...formState.steps];
                                            updated.splice(stepIdx, 1);
                                            setFormState({ ...formState, steps: updated });
                                        }}
                                    >
                                        Remove Step
                                    </Button>
                                </div>
                            )}
                            <Button
                                variant="plain"
                                icon={expandedStep === step.id ? ChevronUpIcon : ChevronDownIcon}
                                accessibilityLabel="Toggle step"
                            />
                        </InlineStack>
                    </InlineStack>
                </div>

                <Collapsible
                    open={expandedStep === step.id}
                    id={`collapsible-${step.id}`}
                    transition={{ duration: '500ms', timingFunction: 'ease-in-out' }}
                    expandOnPrint
                >
                    <BlockStack gap="400">
                        <Box paddingBlockStart="200">
                            <TextField
                                label="Step Title"
                                value={step.title}
                                onChange={(val) => {
                                    const updated = [...formState.steps];
                                    updated[stepIdx].title = val;
                                    setFormState({ ...formState, steps: updated });
                                }}
                                autoComplete="off"
                                disabled={step.isSystem}
                            />
                        </Box>

                        <Divider />

                        <InlineStack align="space-between" blockAlign="center">
                            <Text variant="headingSm" as="h3">Fields</Text>
                            <Button
                                icon={PlusIcon}
                                size="micro"
                                variant="plain"
                                onClick={() => addField(stepIdx)}
                                disabled={step.fields.length >= 6}
                            >
                                Add Field
                            </Button>
                        </InlineStack>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(e) => handleDragEnd(e, stepIdx)}
                        >
                            <SortableContext
                                items={step.fields.map(f => f.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <BlockStack gap="200">
                                    {step.fields.map((field, fieldIdx) => (
                                        <SortableFieldItem
                                            key={field.id}
                                            field={field}
                                            fieldIdx={fieldIdx}
                                            stepIdx={stepIdx}
                                            formState={formState}
                                            setFormState={setFormState}
                                        />
                                    ))}
                                </BlockStack>
                            </SortableContext>
                        </DndContext>
                    </BlockStack>
                </Collapsible>
            </BlockStack>
        </Card>
    );
};
