import React from 'react';
import {
    BlockStack,
    InlineStack,
    Text,
    Button,
    TextField,
    Checkbox,
    Badge,
    Icon,
    Popover,
    ActionList,
} from '@shopify/polaris';
import {
    DragHandleIcon,
    DeleteIcon,
    PlusIcon,
} from '@shopify/polaris-icons';
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { IForm, IFormField } from '../../api/forms';
import { 
    TYPE_LABEL, 
    FIELD_OPTIONS, 
    getStandardFields 
} from './BuilderCanvas.utils';

interface BuilderCanvasProps {
    formState: IForm;
    setFormState: (form: IForm) => void;
}

export const BuilderCanvas: React.FC<BuilderCanvasProps> = ({ formState, setFormState }) => {
    const [activePopover, setActivePopover] = React.useState<string | null>(null);

    const updateField = (stepId: string, fieldId: string, updates: Partial<IFormField>) => {
        const updatedSteps = formState.steps.map(step => {
            if (step.id !== stepId) return step;
            return {
                ...step,
                fields: step.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f)
            };
        });
        setFormState({ ...formState, steps: updatedSteps });
    };

    const removeField = (stepId: string, fieldId: string) => {
        const updatedSteps = formState.steps.map(step => {
            if (step.id !== stepId) return step;
            return {
                ...step,
                fields: step.fields.filter(f => f.id !== fieldId)
            };
        });
        setFormState({ ...formState, steps: updatedSteps });
    };

    const addFieldToStep = (stepId: string, type: string, label: string) => {
        const updatedSteps = formState.steps.map(step => {
            if (step.id !== stepId) return step;
            return {
                ...step,
                fields: [
                    ...step.fields,
                    {
                        id: `field-${Date.now()}`,
                        type,
                        label,
                        required: false,
                        placeholder: `Enter ${label.toLowerCase()}...`,
                        helpText: ''
                    }
                ]
            };
        });
        setFormState({ ...formState, steps: updatedSteps });
        setActivePopover(null);
    };

    const resetToStandard = (stepId: string) => {
        const fields = getStandardFields(stepId);
        const updatedSteps = formState.steps.map(s => {
            if (s.id !== stepId) return s;
            return {
                ...s,
                fields
            };
        });
        setFormState({ ...formState, steps: updatedSteps });
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-12 animate-fadeIn pb-32">
            <header className="flex flex-col gap-2">
                <Text variant="headingLg" as="h1">Edit Quote Form</Text>
                <Text variant="bodyMd" as="p" tone="subdued">
                    Organize your form into logical sections. Add fields to each section and reorder them as needed.
                </Text>
            </header>

            <div className="space-y-10">
                {formState.steps.map((step) => (
                    <div key={step.id} className="rq-builder-section bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                        {/* Section Header */}
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                            <InlineStack gap="300" align="center">
                                <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                                <TextField
                                    label="Step Title"
                                    labelHidden
                                    value={step.title}
                                    onChange={(val) => {
                                        const updatedSteps = formState.steps.map(s => 
                                            s.id === step.id ? { ...s, title: val } : s
                                        );
                                        setFormState({ ...formState, steps: updatedSteps });
                                    }}
                                    autoComplete="off"
                                />
                                <TextField
                                    label="Step Description"
                                    labelHidden
                                    value={step.description || ''}
                                    onChange={(val) => {
                                        const updatedSteps = formState.steps.map(s => 
                                            s.id === step.id ? { ...s, description: val } : s
                                        );
                                        setFormState({ ...formState, steps: updatedSteps });
                                    }}
                                    autoComplete="off"
                                    placeholder="Add a step description..."
                                />
                                <Badge tone="info">{`${step.fields.length} Fields`}</Badge>
                            </InlineStack>

                            <Button
                                variant="tertiary"
                                size="slim"
                                onClick={() => resetToStandard(step.id)}
                            >
                                Restore Standard Fields
                            </Button>
                        </div>

                        {/* Section Fields */}
                        <div className="p-6 space-y-4">
                            {step.fields.length === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center bg-gray-50/30 rounded-2xl border-2 border-dashed border-gray-100">
                                    <Text variant="bodySm" tone="subdued" as="p">No fields in this section yet.</Text>
                                </div>
                            ) : (
                                <SortableContext items={step.fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                                    <BlockStack gap="300">
                                        {step.fields.map((field) => (
                                            <SortableFieldRow
                                                key={field.id}
                                                field={field}
                                                onUpdate={(updates) => updateField(step.id, field.id, updates)}
                                                onRemove={() => removeField(step.id, field.id)}
                                            />
                                        ))}
                                    </BlockStack>
                                </SortableContext>
                            )}

                            {/* Add Field Button */}
                            <div className="pt-4 flex justify-center">
                                <Popover
                                    active={activePopover === step.id}
                                    activator={
                                        <Button
                                            icon={PlusIcon}
                                            onClick={() => setActivePopover(activePopover === step.id ? null : step.id)}
                                            variant="secondary"
                                            fullWidth
                                        >
                                            Add Field to {step.title}
                                        </Button>
                                    }
                                    onClose={() => setActivePopover(null)}
                                    autofocusTarget="first-node"
                                >
                                    <ActionList
                                        items={FIELD_OPTIONS.map(opt => ({
                                            content: opt.label,
                                            onAction: () => addFieldToStep(step.id, opt.type, opt.label)
                                        }))}
                                    />
                                </Popover>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-8 bg-indigo-50/30 rounded-3xl border border-indigo-100 text-center">
                <Text variant="bodySm" tone="subdued" as="p">
                    Tip: You can drag fields using the handle on the left to reorder them within a section.
                </Text>
            </div>
        </div>
    );
};

interface SortableFieldRowProps {
    field: IFormField;
    onUpdate: (updates: Partial<IFormField>) => void;
    onRemove: () => void;
}

const SortableFieldRow: React.FC<SortableFieldRowProps> = ({ field, onUpdate, onRemove }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: field.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group bg-white border ${isDragging ? 'border-indigo-400 shadow-xl ring-2 ring-indigo-500/20 z-50' : 'border-gray-100 shadow-sm'} rounded-2xl`}
        >
            <div className="flex items-center p-4 gap-4">
                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-gray-50 rounded-lg text-gray-300 hover:text-gray-500 transition-colors"
                >
                    <Icon source={DragHandleIcon} />
                </div>

                {/* Field Details */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] items-center gap-6">
                    <div className="flex flex-col gap-1">
                        <TextField
                            label="Label"
                            labelHidden
                            value={field.label}
                            onChange={(val) => onUpdate({ label: val })}
                            autoComplete="off"
                            placeholder="Field Label"
                        />
                        <TextField
                            label="Help Text / Description"
                            labelHidden
                            value={field.helpText}
                            onChange={(val) => onUpdate({ helpText: val })}
                            autoComplete="off"
                            placeholder="Add a description or help text (e.g. 'Only upload images')"
                            prefix={<Icon source={PlusIcon} tone="subdued" />}
                        />
                    </div>

                    <InlineStack gap="300" align="center">
                        <Badge size="small" tone="info">{TYPE_LABEL[field.type] ?? field.type}</Badge>
                        <Checkbox
                            label="Required"
                            checked={field.required}
                            onChange={(val) => onUpdate({ required: val })}
                        />
                    </InlineStack>

                    <div className="flex items-center justify-end">
                        <Button
                            icon={DeleteIcon}
                            tone="critical"
                            variant="tertiary"
                            onClick={onRemove}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
