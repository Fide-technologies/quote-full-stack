import React from 'react';
import {
    Box, InlineStack, Icon, TextField, Select, Checkbox,
    Tooltip, Button, Badge, Divider, BlockStack, Text, ChoiceList
} from '@shopify/polaris';
import { DragHandleIcon, DeleteIcon } from '@shopify/polaris-icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { IForm, IFormField } from '../../api/forms';

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

const regexOptions = [
    { label: 'None', value: '' },
    { label: 'Letters Only (a-z, A-Z)', value: '^[a-zA-Z\\s]+$' },
    { label: 'Numbers Only (0-9)', value: '^[0-9]+$' },
    { label: 'Alphanumeric', value: '^[a-zA-Z0-9\\s]+$' },
];

interface SortableFieldProps {
    field: IFormField;
    fieldIdx: number;
    stepIdx: number;
    formState: IForm;
    setFormState: React.Dispatch<React.SetStateAction<IForm | null>>;
}

export function SortableFieldItem({ field, fieldIdx, stepIdx, formState, setFormState }: SortableFieldProps) {
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

    const updateFieldProperty = (prop: keyof IFormField, value: any) => {
        const updated = { ...formState, steps: [...formState.steps] };
        (updated.steps[stepIdx].fields[fieldIdx] as any)[prop] = value;
        setFormState(updated);
    };

    const removeField = () => {
        const updated = { ...formState, steps: [...formState.steps] };
        updated.steps[stepIdx].fields.splice(fieldIdx, 1);
        setFormState(updated);
    };

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
                                        <div className="w-full">
                                            <BlockStack gap="400">
                                                <InlineStack gap="400">
                                                    <div className="flex-1">
                                                        <Select
                                                            label="Upload Type"
                                                            options={[
                                                                { label: 'Single Image', value: 'single' },
                                                                { label: 'Multiple Images', value: 'multiple' }
                                                            ]}
                                                            value={field.allowMultiple ? 'multiple' : 'single'}
                                                            onChange={(val) => updateFieldProperty('allowMultiple', val === 'multiple')}
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
                                                </InlineStack>

                                                <Box paddingBlockStart="200">
                                                    <ChoiceList
                                                        allowMultiple
                                                        title="Supported Image Formats"
                                                        choices={[
                                                            { label: 'JPEG (.jpg, .jpeg)', value: '.jpg' },
                                                            { label: 'PNG (.png)', value: '.png' },
                                                            { label: 'WebP (.webp)', value: '.webp' },
                                                            { label: 'GIF (.gif)', value: '.gif' },
                                                            { label: 'SVG (.svg)', value: '.svg' },
                                                        ]}
                                                        selected={field.allowedImageFormats || []}
                                                        onChange={(val) => updateFieldProperty('allowedImageFormats', val)}
                                                    />
                                                </Box>

                                                <TextField
                                                    label="Other Allowed File Types (optional, comma-separated)"
                                                    value={field.allowedFileTypes || ''}
                                                    onChange={(val) => updateFieldProperty('allowedFileTypes', val)}
                                                    placeholder="application/pdf, .zip"
                                                    autoComplete="off"
                                                    helpText="If you select image formats above, they will be combined with these."
                                                />
                                            </BlockStack>
                                        </div>
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
