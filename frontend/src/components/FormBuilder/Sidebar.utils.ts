import type React from 'react';

export interface SidebarElementDef {
    type: string;
    label: string;
    icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    color?: string;
}

export const BASIC_ELEMENTS: SidebarElementDef[] = [
    { type: 'text', label: 'Full Name' },
    { type: 'email', label: 'Email Address' },
    { type: 'phone', label: 'Phone Number' },
    { type: 'text', label: 'City' },
    { type: 'text', label: 'State' },
    { type: 'text', label: 'Pincode' },
    { type: 'text', label: 'Country' },
    { type: 'textarea', label: 'Message' },
];

export const CUSTOM_ELEMENTS: SidebarElementDef[] = [
    { type: 'text', label: 'Single Line' },
    { type: 'textarea', label: 'Paragraph' },
    { type: 'heading', label: 'Heading' },
    { type: 'select', label: 'Dropdown' },
    { type: 'checkbox', label: 'Checkbox' },
    { type: 'radio', label: 'Single Choice' },
    { type: 'file', label: 'File Upload' },
    { type: 'price', label: 'Price Field' },
];

export function parseSidebarDragId(id: string): { type: string; label: string } | null {
    const parts = id.split('::');
    if (parts[0] !== 'sidebar' || parts.length < 3) return null;
    return { type: parts[1], label: parts[2] };
}
