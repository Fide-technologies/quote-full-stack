import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getForm, updateForm } from '../api/forms';
import type { IForm, IFormStep, IFormField } from '../api/forms';
import {
    Page, Layout, Card, Text, TextField, Button, BlockStack, InlineStack,
    Select, Checkbox, Divider, Banner, Spinner, Box, Icon, Tooltip, Badge, Collapsible,
    Modal
} from '@shopify/polaris';
import { DragHandleIcon, DeleteIcon, PlusIcon, ChevronDownIcon, ChevronUpIcon } from '@shopify/polaris-icons';
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
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const fieldTypes = [
    { label: 'Text', value: 'text' },
    { label: 'Email', value: 'email' },
    { label: 'Phone', value: 'phone' },
    { label: 'Number', value: 'number' },
    { label: 'Long Text', value: 'textarea' },
    { label: 'Dropdown', value: 'select' },
    { label: 'Radio Buttons', value: 'radio' },
    { label: 'Checkboxes', value: 'checkbox' },
    { label: 'File Upload', value: 'file' }
];

interface SortableFieldProps {
    field: IFormField;
    fieldIdx: number;
    stepIdx: number;
    formState: IForm;
    setFormState: React.Dispatch<React.SetStateAction<IForm | null>>;
}

function SortableFieldItem({ field, fieldIdx, stepIdx, formState, setFormState }: SortableFieldProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: field.id, disabled: field.isSystem });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 999 : 1,
        position: isDragging ? 'relative' : 'static' as any,
    };

    const updateFieldLabel = (val: string) => {
        const updated = { ...formState, steps: [...formState.steps] };
        updated.steps[stepIdx].fields[fieldIdx].label = val;
        setFormState(updated);
    };

    const updateFieldType = (val: string) => {
        const updated = { ...formState, steps: [...formState.steps] };
        updated.steps[stepIdx].fields[fieldIdx].type = val;
        setFormState(updated);
    };

    const updateFieldRequired = (checked: boolean) => {
        const updated = { ...formState, steps: [...formState.steps] };
        updated.steps[stepIdx].fields[fieldIdx].required = checked;
        setFormState(updated);
    };

    const updateFieldProperty = (prop: keyof typeof field, value: any) => {
        const updated = { ...formState, steps: [...formState.steps] };
        (updated.steps[stepIdx].fields[fieldIdx] as any)[prop] = value;
        setFormState(updated);
    };

    const removeField = () => {
        const updated = { ...formState, steps: [...formState.steps] };
        updated.steps[stepIdx].fields.splice(fieldIdx, 1);
        setFormState(updated);
    };

    const regexOptions = [
        { label: 'None', value: '' },
        { label: 'Letters Only (a-z, A-Z)', value: '^[a-zA-Z\\s]+$' },
        { label: 'Numbers Only (0-9)', value: '^[0-9]+$' },
        { label: 'Alphanumeric', value: '^[a-zA-Z0-9\\s]+$' },
    ];

    return (
        <div ref={setNodeRef} style={style}>
            <Box
                background={field.isSystem ? "bg-surface-secondary" : "bg-surface"}
                padding="300"
                borderRadius="200"
                borderColor="border"
                borderWidth="025"
                shadow={isDragging ? '400' : '100'}
            >
                <InlineStack align="start" blockAlign="center" gap="400" wrap={false}>
                    {field.isSystem ? (
                        <div style={{ padding: '4px', opacity: 0.3, cursor: 'not-allowed' }}>
                            <Icon source={DragHandleIcon} tone="base" />
                        </div>
                    ) : (
                        <div {...attributes} {...listeners} style={{ cursor: 'grab', padding: '4px' }}>
                            <Icon source={DragHandleIcon} tone="base" />
                        </div>
                    )}

                    <div style={{ flex: 2 }}>
                        <TextField
                            label="Label"
                            labelHidden
                            value={field.label}
                            onChange={updateFieldLabel}
                            autoComplete="off"
                            disabled={field.isSystem}
                        />
                    </div>

                    <div style={{ flex: 1 }}>
                        <Select
                            label="Type"
                            labelHidden
                            options={fieldTypes}
                            value={field.type}
                            onChange={updateFieldType}
                            disabled={field.isSystem}
                        />
                    </div>

                    <div style={{ flex: 1 }}>
                        <Select
                            label="Layout Width"
                            labelHidden
                            options={[
                                { label: 'Full Width', value: 'full' },
                                { label: 'Half Width', value: 'half' }
                            ]}
                            value={field.layoutWidth || 'full'}
                            onChange={(val) => updateFieldProperty('layoutWidth', val)}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', width: '100px' }}>
                        <Checkbox
                            label="Required"
                            checked={field.required}
                            onChange={updateFieldRequired}
                            disabled={field.isSystem && field.required}
                        />
                    </div>

                    {field.isSystem ? (
                        <div style={{ minWidth: '85px', display: 'flex', justifyContent: 'center' }}>
                            <Badge tone="info">System</Badge>
                        </div>
                    ) : (
                        <div style={{ minWidth: '85px', display: 'flex', justifyContent: 'center' }}>
                            <Tooltip content="Remove field">
                                <Button variant="plain" tone="critical" icon={DeleteIcon} onClick={removeField} accessibilityLabel="Remove field" />
                            </Tooltip>
                        </div>
                    )}
                </InlineStack>

                {/* Advanced Validation & Layout Configuration Box */}
                {!field.isSystem && (
                    <Box paddingBlockStart="400">
                        <Divider />
                        <Box paddingBlockStart="300">
                            <BlockStack gap="400">
                                <Text variant="bodyMd" as="h4" tone="subdued">Advanced Settings</Text>

                                <InlineStack gap="400">

                                    {(field.type === 'text' || field.type === 'textarea') && (
                                        <>
                                            <div style={{ flex: 1 }}>
                                                <TextField
                                                    label="Min Length"
                                                    type="number"
                                                    value={field.minLength?.toString() || ''}
                                                    onChange={(val) => updateFieldProperty('minLength', val ? parseInt(val) : undefined)}
                                                    autoComplete="off"
                                                />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <TextField
                                                    label="Max Length"
                                                    type="number"
                                                    value={field.maxLength?.toString() || ''}
                                                    onChange={(val) => updateFieldProperty('maxLength', val ? parseInt(val) : undefined)}
                                                    autoComplete="off"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {field.type === 'text' && (
                                        <div style={{ flex: 2 }}>
                                            <Select
                                                label="Validation Rule (Regex)"
                                                options={regexOptions}
                                                value={field.validationRegex || ''}
                                                onChange={(val) => updateFieldProperty('validationRegex', val)}
                                            />
                                        </div>
                                    )}

                                    {field.type === 'file' && (
                                        <>
                                            <div style={{ flex: 2 }}>
                                                <TextField
                                                    label="Allowed File Types (e.g. image/jpeg, .pdf)"
                                                    value={field.allowedFileTypes || ''}
                                                    onChange={(val) => updateFieldProperty('allowedFileTypes', val)}
                                                    placeholder="image/*, application/pdf"
                                                    autoComplete="off"
                                                />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <TextField
                                                    label="Max File Size (MB)"
                                                    type="number"
                                                    value={field.maxFileSizeMB?.toString() || ''}
                                                    onChange={(val) => updateFieldProperty('maxFileSizeMB', val ? parseInt(val) : undefined)}
                                                    autoComplete="off"
                                                />
                                            </div>
                                        </>
                                    )}
                                </InlineStack>

                                {field.validationRegex && (
                                    <TextField
                                        label="Custom Regex Error Message"
                                        value={field.validationMessage || ''}
                                        onChange={(val) => updateFieldProperty('validationMessage', val)}
                                        placeholder="Please enter a valid format."
                                        autoComplete="off"
                                    />
                                )}
                            </BlockStack>
                        </Box>
                    </Box>
                )}
            </Box>
        </div>
    );
}


export const FormBuilder: React.FC = () => {
    const queryClient = useQueryClient();
    const [formState, setFormState] = useState<IForm | null>(null);
    const [expandedStep, setExpandedStep] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const { data: initialData, isLoading, error } = useQuery({
        queryKey: ['formConfig'],
        queryFn: getForm,
    });

    React.useEffect(() => {
        if (initialData) {
            // Ensure default steps exist if missing from old saved data
            const guaranteedSteps = [...initialData.steps];

            // If contact step is missing, we append a basic version or default structure
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
            if (!guaranteedSteps.find(s => s.id === "step-address")) {
                guaranteedSteps.splice(1, 0, {
                    id: "step-address", title: "Address", isSystem: true, fields: [
                        { id: "field-address1", type: "text", label: "Address Line 1", required: true, isSystem: true, layoutWidth: "full" },
                        { id: "field-address2", type: "text", label: "Address Line 2", required: false, isSystem: true, layoutWidth: "full" },
                        { id: "field-city", type: "text", label: "City", required: true, isSystem: true, layoutWidth: "half" },
                        { id: "field-district", type: "text", label: "District", required: true, isSystem: true, layoutWidth: "half" },
                        { id: "field-state", type: "text", label: "State", required: true, isSystem: true, layoutWidth: "half" },
                        { id: "field-pincode", type: "text", label: "Pincode", required: true, isSystem: true, layoutWidth: "half" }
                    ]
                });
            }
            if (!guaranteedSteps.find(s => s.id === "step-details")) {
                guaranteedSteps.splice(2, 0, {
                    id: "step-details", title: "Details", isSystem: true, fields: [
                        { id: "field-message", type: "textarea", label: "Additional Message", required: false, isSystem: true }
                    ]
                });
            }
            if (!guaranteedSteps.find(s => s.id === "step-review")) {
                guaranteedSteps.push({
                    id: "step-review", title: "Review", isSystem: true, fields: []
                });
            }

            // Provide default widths for legacy system fields that may have been saved before this feature existed
            const defaultLayouts: Record<string, 'full' | 'half'> = {
                'field-fname': 'half',
                'field-lname': 'half',
                'field-email': 'full',
                'field-phone': 'full',
                'field-address1': 'full',
                'field-address2': 'full',
                'field-city': 'half',
                'field-district': 'half',
                'field-state': 'half',
                'field-pincode': 'half',
            };

            const enrichedSteps = guaranteedSteps.map(step => ({
                ...step,
                fields: step.fields.map(field => {
                    let updated = { ...field };
                    if (updated.isSystem && !updated.layoutWidth && defaultLayouts[updated.id]) {
                        updated.layoutWidth = defaultLayouts[updated.id];
                    }
                    if (updated.id === 'field-phone') {
                        if (!updated.minLength) updated.minLength = 10;
                        if (!updated.maxLength) updated.maxLength = 10;
                    }
                    if (updated.id === 'field-pincode') {
                        if (!updated.minLength) updated.minLength = 6;
                        if (!updated.maxLength) updated.maxLength = 6;
                        if (!updated.validationRegex) updated.validationRegex = '^[0-9]+$';
                        if (!updated.validationMessage) updated.validationMessage = 'Pincode must be numbers only.';
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
            shopify.toast.show('Form saved successfully');
        },
        onError: (err: any) => {
            if (err.message?.includes("403")) {
                shopify.toast.show('Upgrade to Pro to use the Custom Form Builder', { isError: true });
            } else {
                shopify.toast.show(err.message || 'Failed to save form', { isError: true });
            }
        }
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent, stepIdx: number) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setFormState((state) => {
                if (!state) return state;
                const updated = { ...state, steps: [...state.steps] };
                const step = { ...updated.steps[stepIdx] };
                const fields = [...step.fields];

                const oldIndex = fields.findIndex(f => f.id === active.id);
                const newIndex = fields.findIndex(f => f.id === over.id);

                // Prevent sorting custom fields above or between locked system fields if desired,
                // but standard arrayMove works perfectly fine here
                step.fields = arrayMove(fields, oldIndex, newIndex);
                updated.steps[stepIdx] = step;

                return updated;
            });
        }
    }


    if (isLoading || !formState) return <Page><Spinner size="large" /></Page>;
    if (error) return <Page><Banner tone="critical">Failed to load form builder.</Banner></Page>;

    const handleSave = () => {
        if (formState) {
            // Validation
            for (const step of formState.steps) {
                for (const field of step.fields) {
                    if (!field.label.trim()) {
                        shopify.toast.show(`Field label cannot be empty in step "${step.title}"`, { isError: true });
                        setExpandedStep(step.id);
                        return;
                    }
                }
            }
            updateMutation.mutate(formState);
        }
    };

    const addStep = () => {
        const newStep: IFormStep = {
            id: `step-${Date.now()}`,
            title: `Step ${formState!.steps.length + 1}`,
            fields: []
        };
        setFormState({ ...formState!, steps: [...formState!.steps, newStep] });
    };

    const addField = (stepIndex: number) => {
        const newField: IFormField = {
            id: `field-${Date.now()}`,
            type: 'text',
            label: 'New Custom Field',
            required: false
        };
        const updatedSteps = [...formState!.steps];
        updatedSteps[stepIndex].fields.push(newField);
        setFormState({ ...formState!, steps: updatedSteps });
    };

    return (
        <Page
            title="Multi-Step Form Builder"
            primaryAction={{ content: 'Save Form', onAction: handleSave, loading: updateMutation.isPending }}
        >
            <BlockStack gap="400">
                <InlineStack align="end">
                    <Button variant="primary" tone="success" size="large" onClick={() => setIsPreviewOpen(true)}>
                        Preview Entire Form
                    </Button>
                </InlineStack>

                <Layout>
                    <Layout.Section>
                        <BlockStack gap="400">
                            {formState.steps.map((step, stepIdx) => (
                                <Card key={step.id}>
                                    <BlockStack gap="400">
                                        <div
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                                        >
                                            <InlineStack align="space-between" blockAlign="center">
                                                <Text variant="headingMd" as="h2">Step {stepIdx + 1}: {step.title}</Text>
                                                <InlineStack gap="300" blockAlign="center">
                                                    <Text variant="bodySm" as="span" tone="subdued">
                                                        {step.fields.length} / 6 fields
                                                    </Text>
                                                    {!step.isSystem && (
                                                        <Button tone="critical" variant="plain" onClick={() => {
                                                            const updated = [...formState.steps];
                                                            updated.splice(stepIdx, 1);
                                                            setFormState({ ...formState, steps: updated });
                                                        }}>Remove Step</Button>
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
                            ))}
                        </BlockStack>

                        <Box paddingBlockStart="400">
                            <Button variant="primary" onClick={addStep} icon={PlusIcon} disabled={formState.steps.length >= 5}>Add New Step</Button>
                        </Box>
                    </Layout.Section>

                    <Layout.Section variant="oneThird">
                        <Card>
                            <BlockStack gap="400">
                                <Text variant="headingMd" as="h2">Form Settings</Text>
                                <TextField
                                    label="Submit Button Text"
                                    value={formState.settings?.submitButtonText || ''}
                                    onChange={(val) => setFormState({
                                        ...formState,
                                        settings: { ...formState.settings, submitButtonText: val }
                                    })}
                                    autoComplete="off"
                                />
                                <TextField
                                    label="Success Message"
                                    value={formState.settings?.successMessage || ''}
                                    onChange={(val) => setFormState({
                                        ...formState,
                                        settings: { ...formState.settings, successMessage: val }
                                    })}
                                    autoComplete="off"
                                    multiline={3}
                                />
                                <Box paddingBlockStart="200">
                                    <Button size="large" fullWidth onClick={() => setIsPreviewOpen(true)}>
                                        Preview Form
                                    </Button>
                                </Box>
                            </BlockStack>
                        </Card>
                    </Layout.Section>
                </Layout>

                <Modal
                    title="Form Preview"
                    open={isPreviewOpen}
                    onClose={() => setIsPreviewOpen(false)}
                    size="large"
                >
                    <Modal.Section>
                        <div style={{
                            background: '#ffffff',
                            borderRadius: '8px',
                            padding: '24px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            border: '1px solid #dfe3e8',
                            maxWidth: '500px',
                            margin: '0 auto'
                        }}>
                            {/* We will loop through the steps to show the whole form preview stacked cleanly */}
                            {formState.steps.map((step, idx) => (
                                <div key={step.id} style={{ marginBottom: idx === formState.steps.length - 1 ? '0' : '32px' }}>
                                    <div style={{ paddingBottom: '20px', textAlign: 'center' }}>
                                        <Text variant="headingLg" as="h3">{step.title}</Text>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 0', justifyContent: 'space-between' }}>
                                        {step.fields.map((field) => (
                                            <div key={field.id} style={{
                                                width: field.layoutWidth === 'half' ? 'calc(50% - 8px)' : '100%',
                                                marginBottom: '6px'
                                            }}>
                                                <BlockStack gap="100">
                                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#202223', marginBottom: '2px' }}>
                                                        {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
                                                    </label>
                                                    {field.type === 'textarea' ? (
                                                        <textarea style={{ width: '100%', padding: '10px 12px', boxSizing: 'border-box', border: '1px solid #c9cccf', borderRadius: '4px', resize: 'vertical', minHeight: '80px', fontSize: '14px' }} placeholder={field.placeholder || ''} disabled />
                                                    ) : field.type === 'file' ? (
                                                        <div style={{ width: '100%', padding: '10px 12px', boxSizing: 'border-box', border: '1px dashed #c9cccf', borderRadius: '4px', background: '#f4f6f8', textAlign: 'center', fontSize: '14px', color: '#6d7175' }}>Select a File</div>
                                                    ) : (
                                                        <input type={field.type === 'number' ? 'number' : 'text'} style={{ boxSizing: 'border-box', width: '100%', padding: '10px 12px', border: '1px solid #c9cccf', borderRadius: '4px', fontSize: '14px', background: '#fff' }} placeholder={field.placeholder || ''} disabled />
                                                    )}
                                                </BlockStack>
                                            </div>
                                        ))}
                                        {idx === formState.steps.length - 1 && (
                                            <div style={{ width: '100%', marginTop: '16px' }}>
                                                <button style={{ width: '100%', background: '#0066FF', color: 'white', border: 'none', padding: '12px 16px', borderRadius: '4px', fontSize: '15px', fontWeight: 600, cursor: 'not-allowed' }} disabled>
                                                    {formState.settings?.submitButtonText || 'Submit'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {idx < formState.steps.length - 1 && <Divider />}
                                </div>
                            ))}
                        </div>
                    </Modal.Section>
                </Modal>
            </BlockStack>
        </Page>
    );
};
