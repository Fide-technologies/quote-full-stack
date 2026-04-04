import React from 'react';
import { Text } from '@shopify/polaris';
import type { IForm } from '../../api/forms';
import { QuoteForm } from './QuoteForm';

interface FormPreviewProps {
    formState: IForm;
    previewStepIndex: number;
    setPreviewStepIndex: (index: number) => void;
}

export const FormPreview: React.FC<FormPreviewProps> = ({ formState, previewStepIndex, setPreviewStepIndex }) => {
    return (
        <div className="bg-[#f0f2f4] py-12 px-4 md:px-8 min-h-[650px] rounded-xl flex items-center justify-center w-full">
            <div className="bg-white rounded-xl shadow-[0_15px_45px_rgba(0,0,0,0.15)] w-full max-w-[700px] overflow-hidden border border-[#e1e3e5]">
                <div className="bg-[#f1f2f3] p-4 border-b border-[#e1e3e5] flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                    <div className="bg-white rounded flex-1 mx-5 h-6 text-[11px] flex items-center px-2.5 text-[#8c9196] border border-[#e1e3e5]">
                        your-store.myshopify.com/request-quote
                    </div>
                </div>

                <div className="p-10 md:p-8 max-h-[500px] overflow-y-auto preview-scrollbar">
                    {formState && (
                        <QuoteForm
                            formState={formState}
                            currentStepIndex={previewStepIndex}
                            onStepChange={setPreviewStepIndex}
                            isPreview={true}
                        />
                    )}
                </div>

                {/* Browser Footer */}
                <div className="p-4 border-t border-[#f0f1f2] text-center bg-[#fafbfc]">
                    <Text variant="bodyXs" as="p" tone="subdued">Powered by Request Quote App</Text>
                </div>
            </div>
        </div>
    );
};
