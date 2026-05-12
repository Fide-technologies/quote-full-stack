import type { IFormField } from '../../api/forms';

export const TYPE_LABEL: Record<string, string> = {
    text: 'Text Input',
    email: 'Email Address',
    phone: 'Phone Number',
    number: 'Number Field',
    textarea: 'Paragraph Text',
    select: 'Dropdown Menu',
    checkbox: 'Checkbox Group',
    radio: 'Radio Buttons',
    file: 'File Upload',
    price: 'Price Field',
};

export const FIELD_OPTIONS = [
    { type: 'text', label: 'Single Line' },
    { type: 'textarea', label: 'Paragraph' },
    { type: 'select', label: 'Dropdown' },
    { type: 'checkbox', label: 'Checkbox' },
    { type: 'radio', label: 'Single Choice' },
    { type: 'file', label: 'File Upload' },
    { type: 'price', label: 'Price Field' },
];

export const getStandardFields = (stepId: string): IFormField[] => {
    const now = Date.now();
    const map: Record<string, IFormField[]> = {
        'contact-info': [
            { id: `f-${now}-1`, type: 'text', label: 'First Name', required: true, placeholder: 'Enter first name...', helpText: '' },
            { id: `f-${now}-2`, type: 'text', label: 'Last Name', required: true, placeholder: 'Enter last name...', helpText: '' },
            { id: `f-${now}-3`, type: 'email', label: 'Email Address', required: true, placeholder: 'Enter email address...', helpText: '' },
            { id: `f-${now}-4`, type: 'phone', label: 'Phone Number', required: false, placeholder: 'Phone number', helpText: '' },
        ],
        'address-info': [
            { id: `f-${now}-5`, type: 'text', label: 'Address Line 1', required: true, placeholder: 'Enter address line 1...', helpText: '' },
            { id: `f-${now}-6`, type: 'text', label: 'Address Line 2', required: false, placeholder: 'Enter address line 2...', helpText: '' },
            { id: `f-${now}-7`, type: 'text', label: 'City', required: true, placeholder: 'Enter city...', helpText: '' },
            { id: `f-${now}-8`, type: 'text', label: 'State', required: true, placeholder: 'Enter state...', helpText: '' },
            { id: `f-${now}-9`, type: 'text', label: 'Pincode', required: true, placeholder: 'Enter pincode...', helpText: '' },
            { id: `f-${now}-10`, type: 'text', label: 'Country', required: true, placeholder: 'Enter country...', helpText: '' },
        ],
        'details-info': [
            { id: `f-${now}-11`, type: 'textarea', label: 'Additional Message', required: false, placeholder: 'Enter any additional details...', helpText: '' },
        ]
    };
    return map[stepId] || [];
};
