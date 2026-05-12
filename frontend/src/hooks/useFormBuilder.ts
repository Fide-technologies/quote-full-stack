import { useState, useEffect } from 'react';
import { getForm, updateForm, type IForm, type IFormStep, type IFormField } from '../api/forms';
import { usePlanUsage } from '../hooks/usePlanUsage';

export function useFormBuilder() {
    const [formState, setFormState] = useState<IForm | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedTab, setSelectedTab] = useState(0);

    const { hasPermission, isLoading: isPlanLoading } = usePlanUsage();
    const canEdit = !isPlanLoading && hasPermission('form_builder');

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const data = await getForm();

                // Ensure we have exactly 3 steps for the new segmented builder experience
                const requiredSteps: IFormStep[] = [
                    { id: 'contact-info', title: 'Contact Information', fields: [] as IFormField[] },
                    { id: 'address-info', title: 'Shipping Address', fields: [] as IFormField[] },
                    { id: 'details-info', title: 'Additional Details', fields: [] as IFormField[] }
                ];

                if (data.steps && data.steps.length > 0) {
                    const allFields = data.steps.flatMap(step => step.fields);
                    
                    // Deduplicate fields by ID to prevent repeated fields from previous bugs
                    const uniqueFieldsMap = new Map<string, IFormField>();
                    for (const f of allFields) {
                        if (f && f.id && !uniqueFieldsMap.has(f.id)) {
                            uniqueFieldsMap.set(f.id, f);
                        }
                    }
                    const uniqueFields = Array.from(uniqueFieldsMap.values());

                    const assignedFieldIds = new Set<string>();

                    // Re-distribute existing fields into the 3 new buckets based on labels
                    // Step 0: Contact Info
                    requiredSteps[0].fields = uniqueFields.filter(f => {
                        if (f.type === 'section') return false;
                        const l = (f.label || '').toLowerCase();
                        const isMatch = l.includes('name') || l.includes('email') || l.includes('phone');
                        if (isMatch) assignedFieldIds.add(f.id);
                        return isMatch;
                    });
                    
                    // Step 1: Address Info
                    requiredSteps[1].fields = uniqueFields.filter(f => {
                        if (f.type === 'section' || assignedFieldIds.has(f.id)) return false;
                        const l = (f.label || '').toLowerCase();
                        const isMatch = l.includes('address') || l.includes('city') || l.includes('country') || l.includes('pincode') || l.includes('state') || l.includes('district');
                        if (isMatch) assignedFieldIds.add(f.id);
                        return isMatch;
                    });

                    // Step 2: Additional Details
                    requiredSteps[2].fields = uniqueFields.filter(f => {
                        if (f.type === 'section') return false;
                        const l = (f.label || '').toLowerCase();
                        const isMatch = l.includes('message') || l.includes('note') || l.includes('additional') || !assignedFieldIds.has(f.id);
                        return isMatch;
                    });

                    // Preserve existing step metadata if available
                    requiredSteps.forEach((rs, idx) => {
                        const existing = data.steps[idx];
                        if (existing) {
                            rs.title = existing.title || rs.title;
                            rs.description = existing.description || rs.description;
                        }
                    });

                    data.steps = requiredSteps;
                } else {
                    // Default fields for a brand new form with unique IDs
                    const now = Date.now();
                    requiredSteps[0].fields = [
                        { id: `f-${now}-1`, type: 'text', label: 'First Name', required: true, placeholder: 'Enter first name...' },
                        { id: `f-${now}-2`, type: 'text', label: 'Last Name', required: true, placeholder: 'Enter last name...' },
                        { id: `f-${now}-3`, type: 'email', label: 'Email Address', required: true, placeholder: 'Enter email address...' },
                    ];
                    requiredSteps[1].fields = [
                        { id: `f-${now}-5`, type: 'text', label: 'Address Line 1', required: true, placeholder: 'Enter address line 1...' },
                        { id: `f-${now}-7`, type: 'text', label: 'City', required: true, placeholder: 'Enter city...' },
                    ];
                    requiredSteps[2].fields = [
                        { id: `f-${now}-12`, type: 'textarea', label: 'Additional Message', required: false, placeholder: 'Enter any additional details...' },
                    ];
                    data.steps = requiredSteps;
                }

                setFormState(data);
            } catch (err) {
                console.error("Fetch form error", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchForm();
    }, []);

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
        selectedTab,
        setSelectedTab,
        canEdit,
        handleSave,
    };
}
