import React from 'react';
import { Card, BlockStack, InlineStack, Text, Button, Collapsible, TextField, Divider, Box, Icon } from '@shopify/polaris';
import { ChevronUpIcon, ChevronDownIcon, PlusIcon, DragHandleIcon } from '@shopify/polaris-icons';
import { useSortable } from '@dnd-kit/sortable';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableFieldItem } from './SortableFieldItem';
import type { IForm, IFormStep } from '../../api/forms';

interface FormStepProps {
    step: IFormStep;
    stepIdx: number;
    formState: IForm;
    setFormState: React.Dispatch<React.SetStateAction<IForm | null>>;
    expandedStep: string | null;
    setExpandedStep: (id: string | null) => void;
    addField: (stepIdx: number) => void;
    readOnly?: boolean;
}

export const FormStep: React.FC<FormStepProps> = ({
    step,
    stepIdx,
    formState,
    setFormState,
    expandedStep,
    setExpandedStep,
    addField,
    readOnly = false
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: step.id, disabled: step.id === 'step-review' || readOnly });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 999 : 1,
        position: isDragging ? 'relative' : 'static' as any,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <Card>
                <BlockStack gap="400">
                    <div
                        className="cursor-pointer"
                        onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                    >
                        <InlineStack align="space-between" blockAlign="center">
                            <InlineStack gap="200" blockAlign="center">
                                {step.id !== 'step-review' && !readOnly && (
                                    <div {...attributes} {...listeners} className="cursor-grab p-1" onClick={(e) => e.stopPropagation()}>
                                        <Icon source={DragHandleIcon} tone="base" />
                                    </div>
                                )}
                                <Text variant="headingMd" as="h2">Step {stepIdx + 1}: {step.title}</Text>
                            </InlineStack>
                            <InlineStack gap="300" blockAlign="center">
                                <Text variant="bodySm" as="span" tone="subdued">
                                    {step.id === 'step-review' ? '' : `${step.fields.length} / 6 fields`}
                                </Text>
                                {!step.isSystem && !readOnly && (
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
                                disabled={step.isSystem || readOnly}
                            />
                        </Box>

                        {step.id !== 'step-review' && (
                            <>
                                <Divider />

                                <InlineStack align="space-between" blockAlign="center">
                                    <Text variant="headingSm" as="h3">Fields</Text>
                                    {!readOnly && (
                                        <Button
                                            icon={PlusIcon}
                                            size="micro"
                                            variant="plain"
                                            onClick={() => addField(stepIdx)}
                                            disabled={step.fields.length >= 6}
                                        >
                                            Add Field
                                        </Button>
                                    )}
                                </InlineStack>

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
                                                readOnly={readOnly}
                                            />
                                        ))}
                                    </BlockStack>
                                </SortableContext>
                            </>
                        )}
                    </BlockStack>
                </Collapsible>
            </BlockStack>
            </Card>
        </div>
    );
};
