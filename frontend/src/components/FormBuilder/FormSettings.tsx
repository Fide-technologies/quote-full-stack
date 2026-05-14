import React from 'react';
import { Card, BlockStack, Text, TextField, Divider } from '@shopify/polaris';
import type { IForm } from '../../api/forms';

interface FormSettingsProps {
    formState: IForm;
    setFormState: React.Dispatch<React.SetStateAction<IForm | null>>;
    readOnly?: boolean;
}

export const FormSettings: React.FC<FormSettingsProps> = ({ formState, setFormState, readOnly = false }) => {
    return (
        <Card>
            <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Form Settings</Text>
                
                <Divider />
                <Text variant="bodyMd" fontWeight="bold" as="h3">Success State</Text>

                <TextField
                    label="Success State Title"
                    value={formState.settings?.successTitle || ''}
                    onChange={(val) => setFormState({
                        ...formState,
                        settings: { ...formState.settings, successTitle: val }
                    })}
                    placeholder="e.g. Quote Requested Successfully!"
                    autoComplete="off"
                    disabled={readOnly}
                />
                <TextField
                    label="Success Message Content"
                    value={formState.settings?.successMessage || ''}
                    onChange={(val) => setFormState({
                        ...formState,
                        settings: { ...formState.settings, successMessage: val }
                    })}
                    autoComplete="off"
                    multiline={3}
                    disabled={readOnly}
                />
            </BlockStack>
        </Card>
    );
};
