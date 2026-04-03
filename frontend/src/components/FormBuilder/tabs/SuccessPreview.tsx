import React from 'react';
import { Icon } from '@shopify/polaris';
import { CheckCircleIcon } from '@shopify/polaris-icons';
import type { IForm } from '../../../api/forms';

interface SuccessPreviewProps {
    formState: IForm;
}

export const SuccessPreview: React.FC<SuccessPreviewProps> = ({ formState }) => {
    return (
        <div className="animate-fadeIn text-center py-10 px-4 bg-white border border-[#ebeef0] rounded-2xl shadow-sm max-w-[500px] mx-auto">
            <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-[#00d0841a] text-[#00d084] rounded-full flex items-center justify-center p-2">
                    <Icon source={CheckCircleIcon} tone="success" />
                </div>
            </div>
            <h2 className="text-2xl font-bold text-[#1a1c1d] mb-3 tracking-tight">
                {formState.settings?.successTitle || 'Quote Requested Successfully!'}
            </h2>
            <div className="text-[#6d7175] text-sm mb-10 leading-relaxed max-w-[400px] mx-auto">
                {formState.settings?.successMessage || 'Thank you for your request. Our team will review your quote and get back to you shortly.'}
            </div>
            <button
                type="button"
                className="w-full bg-[#1a1c1d] text-white border-none py-4 px-6 rounded-lg text-sm font-bold cursor-not-allowed uppercase tracking-wider"
                disabled
            >
                Continue Shopping
            </button>
        </div>
    );
};
