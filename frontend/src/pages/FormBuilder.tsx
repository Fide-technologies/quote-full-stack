import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getForm, updateForm } from '../api/forms';
import type { IForm, IFormStep, IFormField } from '../api/forms';
import {
    Page, Layout, Card, Text, TextField, Button, BlockStack, InlineStack,
    Select, Checkbox, Divider, Banner, Spinner, Box, Icon, Tooltip, Badge, Collapsible,
    Tabs
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
                        <div className="p-1 opacity-30 cursor-not-allowed">
                            <Icon source={DragHandleIcon} tone="base" />
                        </div>
                    ) : (
                        <div {...attributes} {...listeners} className="cursor-grab p-1">
                            <Icon source={DragHandleIcon} tone="base" />
                        </div>
                    )}

                    <div className="flex-[2]">
                        <TextField
                            label="Label"
                            labelHidden
                            value={field.label}
                            onChange={updateFieldLabel}
                            autoComplete="off"
                            disabled={field.isSystem}
                        />
                    </div>

                    <div className="flex-1">
                        <Select
                            label="Type"
                            labelHidden
                            options={fieldTypes}
                            value={field.type}
                            onChange={updateFieldType}
                            disabled={field.isSystem}
                        />
                    </div>

                    <div className="flex-1">
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

                    <div className="flex items-center w-[100px]">
                        <Checkbox
                            label="Required"
                            checked={field.required}
                            onChange={updateFieldRequired}
                            disabled={field.isSystem && field.required}
                        />
                    </div>

                    {field.isSystem ? (
                        <div className="min-w-[85px] flex justify-center">
                            <Badge tone="info">System</Badge>
                        </div>
                    ) : (
                        <div className="min-w-[85px] flex justify-center">
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
                                            <div className="flex-1">
                                                <TextField
                                                    label="Min Length"
                                                    type="number"
                                                    value={field.minLength?.toString() || ''}
                                                    onChange={(val) => updateFieldProperty('minLength', val ? parseInt(val) : undefined)}
                                                    autoComplete="off"
                                                />
                                            </div>
                                            <div className="flex-1">
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
                                        <div className="flex-[2]">
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
                                            <div className="flex-[2]">
                                                <TextField
                                                    label="Allowed File Types (e.g. image/jpeg, .pdf)"
                                                    value={field.allowedFileTypes || ''}
                                                    onChange={(val) => updateFieldProperty('allowedFileTypes', val)}
                                                    placeholder="image/*, application/pdf"
                                                    autoComplete="off"
                                                />
                                            </div>
                                            <div className="flex-1">
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
    const [selectedTab, setSelectedTab] = useState(0);
    const [previewStepIndex, setPreviewStepIndex] = useState(0);

    const tabs = [
        {
            id: 'builder',
            content: 'Form Builder',
            accessibilityLabel: 'Form Builder',
            panelID: 'builder-panel',
        },
        {
            id: 'preview',
            content: 'Form Preview',
            accessibilityLabel: 'Form Preview',
            panelID: 'preview-panel',
        },
    ];

    const handleTabChange = (selectedTabIndex: number) => {
        setSelectedTab(selectedTabIndex);
        if (selectedTabIndex === 1) {
            setPreviewStepIndex(0);
        }
    };

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
                <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
                    <Box padding="400">
                        {selectedTab === 0 ? (
                            <Layout>
                                <Layout.Section>
                                    <BlockStack gap="400">
                                        {formState.steps.map((step, stepIdx) => (
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
                                        </BlockStack>
                                    </Card>
                                </Layout.Section>
                            </Layout>
                        ) : (
                            <div className="bg-[#f0f2f4] py-16 px-5 min-h-[600px] rounded-xl flex items-center justify-center">
                                {/* Browser Mockup Frame */}
                                <div className="bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-[550px] overflow-hidden border border-[#e1e3e5]">
                                    {/* Browser Header */}
                                    <div className="bg-[#f1f2f3] p-4 border-b border-[#e1e3e5] flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                                        <div className="bg-white rounded flex-1 mx-5 h-6 text-[11px] flex items-center px-2.5 text-[#8c9196] border border-[#e1e3e5]">
                                            your-store.myshopify.com/request-quote
                                        </div>
                                    </div>

                                    {/* Form Content Area */}
                                    <div className="p-10 md:p-8 max-h-[500px] overflow-y-auto preview-scrollbar">
                                        {/* Progress Section */}
                                        <div className="mb-8">
                                            <div className="flex justify-between items-center mb-3">
                                                <Text variant="bodySm" as="span" tone="subdued" fontWeight="medium">
                                                    Step {previewStepIndex + 1} of {formState.steps.length}
                                                </Text>
                                                <Badge tone="info" progress="partiallyComplete">
                                                    {`${Math.round(((previewStepIndex + 1) / formState.steps.length) * 100)}% Complete`}
                                                </Badge>
                                            </div>
                                            <div className="h-2 bg-[#f1f2f4] rounded-full overflow-hidden border border-[#f0f0f0]">
                                                <div
                                                    className="h-full bg-gradient-to-r from-[#0066FF] to-[#00a2ff] transition-all duration-500 ease-in-out shadow-[0_0_10px_rgba(0,102,255,0.3)]"
                                                    style={{ width: `${((previewStepIndex + 1) / formState.steps.length) * 100}%` }}
                                                />
                                            </div>
                                        </div>

                                        {formState.steps[previewStepIndex] && (
                                            <div className="animate-fadeIn">

                                                <div className="mb-7 text-center">
                                                    <h2 className="text-2xl font-bold text-[#1a1c1d] mb-2 tracking-tight">
                                                        {formState.steps[previewStepIndex].title}
                                                    </h2>
                                                    {previewStepIndex === 0 && (
                                                        <p className="text-[#6d7175] text-sm">
                                                            Please fill in the details below to receive a custom quote.
                                                        </p>
                                                    )}
                                                </div>

                                                {formState.steps[previewStepIndex].id === 'step-review' ? (
                                                    <div className="mb-8">
                                                        <div className="bg-[#f8f9fa] rounded-xl p-5 border border-[#ebeef0]">
                                                            <BlockStack gap="400">
                                                                {formState.steps.filter(s => s.id !== 'step-review' && s.fields.length > 0).map((s, sIdx) => (
                                                                    <div key={s.id}>
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <div className="w-1 h-3.5 bg-[#0066FF] rounded-sm" />
                                                                            <Text variant="bodySm" as="span" fontWeight="bold" tone="base">{s.title}</Text>
                                                                        </div>
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 pl-3">
                                                                            {s.fields.map(f => (
                                                                                <div key={f.id} className="text-[13px]">
                                                                                    <span className="text-[#6d7175] mr-1">{f.label}:</span>
                                                                                    <span className="text-[#202223] font-medium">Sample data</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                        {sIdx < formState.steps.filter(st => st.id !== 'step-review' && st.fields.length > 0).length - 1 && (
                                                                            <div className="mt-4"><Divider /></div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </BlockStack>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-wrap gap-y-5 justify-between">
                                                        {formState.steps[previewStepIndex].fields.map((field) => (
                                                            <div key={field.id} className={field.layoutWidth === 'half' ? 'w-[calc(50%-10px)]' : 'w-full'}>
                                                                <div className="mb-1">
                                                                    <label className="block text-[13px] font-semibold text-[#1a1c1d] mb-1.5">
                                                                        {field.label} {field.required && <span className="text-[#d72c0d]">*</span>}
                                                                    </label>
                                                                    {field.type === 'textarea' ? (
                                                                        <textarea
                                                                            className="w-full px-3.5 py-3 border border-[#d2d5d8] rounded-lg resize-none min-h-[100px] text-sm bg-white transition-colors duration-200 outline-none focus:border-[#0066FF]"
                                                                            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                                                                            disabled
                                                                        />
                                                                    ) : field.type === 'file' ? (
                                                                        <div className="w-full py-6 px-4 border-2 border-dashed border-[#d2d5d8] rounded-lg bg-[#f9fafb] text-center cursor-not-allowed transition-all duration-200">
                                                                            <div className="text-[#0066FF] font-semibold text-sm mb-1">Click to upload</div>
                                                                            <div className="text-xs text-[#6d7175]">PDF, JPG, PNG up to 10MB</div>
                                                                        </div>
                                                                    ) : (
                                                                        <input
                                                                            type={field.type === 'number' ? 'number' : 'text'}
                                                                            className="box-border w-full px-3.5 py-3 border border-[#d2d5d8] rounded-lg text-sm bg-white outline-none transition-colors duration-200 focus:border-[#0066FF]"
                                                                            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                                                                            disabled
                                                                        />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex gap-4 mt-10">
                                                    {previewStepIndex > 0 && (
                                                        <button
                                                            onClick={() => setPreviewStepIndex(previewStepIndex - 1)}
                                                            className="flex-1 bg-white text-[#202223] border border-[#d2d5d8] py-3.5 px-5 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-slate-50 active:scale-95"
                                                        >
                                                            Back
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            if (previewStepIndex < formState.steps.length - 1) {
                                                                setPreviewStepIndex(previewStepIndex + 1);
                                                            } else {
                                                                shopify.toast.show("Form submitted successfully! (Preview Mode)");
                                                            }
                                                        }}
                                                        className="flex-[2] bg-[#0066FF] text-white border-none py-3.5 px-5 rounded-lg text-sm font-semibold cursor-pointer shadow-[0_4px_12px_rgba(0,102,255,0.25)] transition-all duration-200 hover:bg-[#0052cc] active:scale-95 flex items-center justify-center"
                                                    >
                                                        {previewStepIndex < formState.steps.length - 1 ? 'Continue to Next Step' : (formState.settings?.submitButtonText || 'Submit Request')}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Browser Footer */}
                                    <div className="p-4 border-t border-[#f0f1f2] text-center bg-[#fafbfc]">
                                        <Text variant="bodyXs" as="p" tone="subdued">Powered by Request Quote App</Text>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Box>
                </Tabs>
            </BlockStack>
        </Page>
    );
};
