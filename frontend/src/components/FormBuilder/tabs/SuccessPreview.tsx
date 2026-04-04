import React from 'react';
import { Icon } from '@shopify/polaris';
import { CheckCircleIcon } from '@shopify/polaris-icons';
import type { IForm } from '../../../api/forms';

interface SuccessPreviewProps {
    formState: IForm;
}

export const SuccessPreview: React.FC<SuccessPreviewProps> = ({ formState }) => {
    return (
        <div className="relative animate-fadeIn text-center py-10 px-6 bg-white border border-[#ebeef0] rounded-2xl shadow-xl max-w-[500px] mx-auto overflow-hidden">
            {/* Mock Modal Close Button */}
            <div className="absolute top-4 right-4 w-8 h-8 bg-[#f6f6f7] rounded-full flex items-center justify-center cursor-not-allowed">
                <span className="text-[#6d7175] text-lg">×</span>
            </div>

            <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-[#00d0841a] text-[#00d084] rounded-full flex items-center justify-center p-4">
                    <Icon source={CheckCircleIcon} tone="success" />
                </div>
            </div>
            
            <h2 className="text-[28px] font-bold text-[#1a1c1d] mb-4 tracking-tight leading-tight">
                {formState.settings?.successTitle || 'Quote Requested Successfully!'}
            </h2>
            
            <div className="text-[#6d7175] text-[15px] mb-10 leading-relaxed max-w-[360px] mx-auto">
                {formState.settings?.successMessage || 'Thank you for your request. Our team will review your quote and get back to you shortly.'}
            </div>
            
            <button
                type="button"
                className="w-full bg-[#1a1c1d] text-white border-none py-4 px-6 rounded-xl text-[13px] font-bold cursor-not-allowed uppercase tracking-widest shadow-md"
                disabled
            >
                Continue Shopping
            </button>
        </div>
    );
};
