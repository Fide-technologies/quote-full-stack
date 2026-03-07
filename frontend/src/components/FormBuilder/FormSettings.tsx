import React from 'react';
import { Card, BlockStack, Text, TextField } from '@shopify/polaris';
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
                <TextField
                    label="Submit Button Text"
                    value={formState.settings?.submitButtonText || ''}
                    onChange={(val) => setFormState({
                        ...formState,
                        settings: { ...formState.settings, submitButtonText: val }
                    })}
                    autoComplete="off"
                    disabled={readOnly}
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
                    disabled={readOnly}
                />
            </BlockStack>
        </Card>
    );
};
