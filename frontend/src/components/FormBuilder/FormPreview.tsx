import React from 'react';
import { Text, Badge, Box, Divider, Icon, BlockStack } from '@shopify/polaris';
import { ImageIcon } from '@shopify/polaris-icons';
import type { IForm } from '../../api/forms';

interface FormPreviewProps {
    formState: IForm;
    previewStepIndex: number;
    setPreviewStepIndex: (index: number) => void;
}

export const FormPreview: React.FC<FormPreviewProps> = ({ formState, previewStepIndex, setPreviewStepIndex }) => {
    return (
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
                                                    <div className="w-full">
                                                        <div className="py-6 px-4 border-2 border-dashed border-[#d2d5d8] rounded-lg bg-[#f9fafb] text-center cursor-not-allowed transition-all duration-200">
                                                            {field.allowMultiple ? (
                                                                <div className="flex justify-center gap-2 mb-3">
                                                                    {[1, 2, 3].map(i => (
                                                                        <div key={i} className="w-10 h-10 rounded border border-[#e1e3e5] bg-white flex items-center justify-center">
                                                                            <div className="w-5 h-5 opacity-20"><Icon source={ImageIcon} /></div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="flex justify-center mb-3">
                                                                    <div className="w-12 h-12 rounded-lg border border-[#e1e3e5] bg-white flex items-center justify-center">
                                                                        <div className="w-6 h-6 opacity-20"><Icon source={ImageIcon} /></div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="text-[#0066FF] font-semibold text-sm mb-1">{field.allowMultiple ? 'Click to upload multiple' : 'Click to upload'}</div>
                                                            <div className="text-xs text-[#6d7175]">
                                                                Supported: {[...(field.allowedImageFormats || []), field.allowedFileTypes].filter(Boolean).join(', ') || 'Images'} (Max {field.maxFileSizeMB || 5}MB)
                                                            </div>
                                                        </div>
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
                                            if (typeof shopify !== 'undefined') {
                                                shopify.toast.show("Form submitted successfully! (Preview Mode)");
                                            }
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
    );
};
