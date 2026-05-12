import React, { useState } from 'react';
import {
    Page,
    Box,
    Banner,
    Text,
    Tabs,
    Badge,
    Card,
    BlockStack,
    Checkbox,
    TextField,
} from '@shopify/polaris';
import {
    SaveIcon,
} from '@shopify/polaris-icons';
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    closestCorners,
    type DragEndEvent,
    type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { useFormBuilder } from '../hooks/useFormBuilder';
import { PageLoader } from '../components/loaders/PageLoader';
import { Sidebar } from '../components/FormBuilder/Sidebar';
import { parseSidebarDragId } from '../components/FormBuilder/Sidebar.utils';
import { BuilderCanvas } from '../components/FormBuilder/BuilderCanvas';
import { FormPreview } from '../components/FormBuilder/FormPreview';
import { QuoteForm } from '../components/FormBuilder/QuoteForm';

export const FormBuilder: React.FC = () => {
    const {
        formState,
        setFormState,
        isLoading,
        isSaving,
        selectedTab,
        setSelectedTab,
        canEdit,
        handleSave,
    } = useFormBuilder();

    const [activeDragLabel, setActiveDragLabel] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Increased distance to prevent accidental drags when clicking inputs
            }
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    if (isLoading) {
        return <PageLoader title="Form Builder" primaryAction hasSidebar />;
    }

    if (!canEdit) {
        return (
            <Page title="Form Builder">
                <Box paddingBlockEnd="800">
                    <Banner tone="warning" title="Upgrade required">
                        <p>The form builder is only available on professional plans. Please upgrade to customize your quote form.</p>
                    </Banner>
                </Box>
            </Page>
        );
    }


    const handleDragStart = (event: DragStartEvent) => {
        const data = event.active.data.current as { type?: string; elementLabel?: string } | undefined;
        if (data?.type === 'sidebar' && data.elementLabel) {
            setActiveDragLabel(data.elementLabel);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveDragLabel(null);
        const { active, over } = event;
        if (!over || !formState) return;

        const activeId = active.id.toString();
        const overId = over.id.toString();

        const activeData = active.data.current as { type?: string; elementType?: string; elementLabel?: string } | undefined;

        // Handle reordering within or across steps
        if (activeId !== overId && activeData?.type !== 'sidebar') {
            const activeStep = formState.steps.find(s => s.fields.some(f => f.id === activeId));
            const overStep = formState.steps.find(s => s.id === overId || s.fields.some(f => f.id === overId));

            if (activeStep && overStep) {
                const activeFields = [...activeStep.fields];
                const overFields = activeStep.id === overStep.id ? activeFields : [...overStep.fields];

                const activeIndex = activeFields.findIndex(f => f.id === activeId);
                const overIndex = overFields.findIndex(f => f.id === overId);

                const fieldToMove = activeFields[activeIndex];

                if (activeStep.id === overStep.id) {
                    // Reorder within same step
                    const updatedSteps = formState.steps.map(s => {
                        if (s.id !== activeStep.id) return s;
                        return {
                            ...s,
                            fields: arrayMove(s.fields, activeIndex, overIndex)
                        };
                    });
                    setFormState({ ...formState, steps: updatedSteps });
                } else {
                    // Move between steps
                    const updatedSteps = formState.steps.map(s => {
                        if (s.id === activeStep.id) {
                            return { ...s, fields: s.fields.filter(f => f.id !== activeId) };
                        }
                        if (s.id === overStep.id) {
                            const newFields = [...s.fields];
                            newFields.splice(overIndex >= 0 ? overIndex : newFields.length, 0, fieldToMove);
                            return { ...s, fields: newFields };
                        }
                        return s;
                    });
                    setFormState({ ...formState, steps: updatedSteps });
                }
                return;
            }
        }

        // Handle sidebar drop
        if (activeData?.type === 'sidebar') {
            const parsed = parseSidebarDragId(activeId);
            const elementType = parsed?.type || activeData.elementType;
            const elementLabel = parsed?.label || activeData.elementLabel;

            if (elementType && elementLabel) {
                // Prevent duplicate essential fields (Email, Phone) if they already exist
                const isEssential = ['email', 'phone'].includes(elementType.toLowerCase()) || 
                                   ['email address', 'phone number'].includes(elementLabel.toLowerCase());
                
                if (isEssential) {
                    const exists = formState.steps.some(s => 
                        s.fields.some(f => 
                            f.type === elementType || f.label.toLowerCase() === elementLabel.toLowerCase()
                        )
                    );
                    if (exists) {
                        if (typeof shopify !== 'undefined') {
                            shopify.toast.show(`${elementLabel} already exists in your form`, { isError: true });
                        }
                        return;
                    }
                }

                // Find which step we dropped into
                let targetStepIndex = 0;
                const overStep = formState.steps.find(s => s.id === overId || s.fields.some(f => f.id === overId));
                if (overStep) {
                    targetStepIndex = formState.steps.findIndex(s => s.id === overStep.id);
                }

                const updated = {
                    ...formState,
                    steps: formState.steps.map((s, si) =>
                        si !== targetStepIndex ? s : {
                            ...s,
                            fields: [
                                ...s.fields,
                                {
                                    id: `field-${Date.now()}`,
                                    type: elementType,
                                    label: elementLabel,
                                    required: false,
                                },
                            ],
                        }
                    ),
                };
                setFormState(updated);
            }
        }
    };

    const tabs = [
        {
            id: 'builder',
            content: 'Builder',
            accessibilityLabel: 'Form Builder',
            panelID: 'builder-panel',
        },
        {
            id: 'settings',
            content: 'Settings',
            accessibilityLabel: 'Form Settings',
            panelID: 'settings-panel',
        },
        {
            id: 'preview',
            content: 'Preview',
            accessibilityLabel: 'Form Preview',
            panelID: 'preview-panel',
        },
    ];

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <Page
                title="Form Builder"
                subtitle="Design your storefront quote request form"
                primaryAction={{
                    content: 'Save Changes',
                    icon: SaveIcon,
                    onAction: handleSave,
                    loading: isSaving,
                    disabled: isSaving,
                }}
                fullWidth
            >
                <Box paddingBlockEnd="400">
                    <Tabs
                        tabs={tabs}
                        selected={selectedTab}
                        onSelect={setSelectedTab}
                    />
                </Box>

                {formState && (
                    <div className="flex bg-white border border-gray-200 rounded-2xl overflow-hidden h-[calc(100vh-200px)] shadow-sm animate-fadeIn">
                        {selectedTab <= 1 ? (
                            <>
                                {/* Sidebar palette - only in Builder tab */}
                                {selectedTab === 0 && (
                                    <aside className="w-[280px] h-full flex-shrink-0 border-r border-gray-100 bg-gray-50/30 overflow-y-auto scrollbar-hide">
                                        <Sidebar />
                                    </aside>
                                )}

                                {/* Main Content Area (Canvas or Settings) */}
                                <main className="flex-1 h-full overflow-y-auto bg-[#fafbfc] preview-scrollbar border-r border-gray-100">
                                    {selectedTab === 0 ? (
                                        <BuilderCanvas
                                            formState={formState}
                                            setFormState={setFormState}
                                        />
                                    ) : (
                                        <div className="max-w-2xl mx-auto py-8 px-6 space-y-6">
                                            <Card>
                                                <BlockStack gap="400">
                                                    <Text variant="headingMd" as="h2">General Settings</Text>
                                                    <TextField
                                                        label="Form Title"
                                                        value={formState.title || ''}
                                                        onChange={(val) => setFormState({
                                                            ...formState,
                                                            title: val
                                                        })}
                                                        helpText="The main heading shown at the top of your quote form."
                                                        autoComplete="off"
                                                    />
                                                    <TextField
                                                        label="Form Description"
                                                        value={formState.description || ''}
                                                        onChange={(val) => setFormState({
                                                            ...formState,
                                                            description: val
                                                        })}
                                                        helpText="A short instruction or description shown below the title."
                                                        multiline={2}
                                                        autoComplete="off"
                                                    />
                                                </BlockStack>
                                            </Card>

                                            <Card>
                                                <BlockStack gap="400">
                                                    <Text variant="headingMd" as="h2">Product Display Settings</Text>
                                                    <Text variant="bodyMd" as="p" tone="subdued">
                                                        Control what product information is shown to customers in the quote request form.
                                                    </Text>

                                                    <Box paddingBlockStart="200">
                                                        <BlockStack gap="400">
                                                            <Checkbox
                                                                label="Show Product SKU"
                                                                checked={formState.settings?.showSku}
                                                                onChange={(val) => setFormState({
                                                                    ...formState,
                                                                    settings: { ...formState.settings, showSku: val }
                                                                })}
                                                                helpText="Display the product unique identifier."
                                                            />
                                                            <Checkbox
                                                                label="Show Product Vendor"
                                                                checked={formState.settings?.showVendor}
                                                                onChange={(val) => setFormState({
                                                                    ...formState,
                                                                    settings: { ...formState.settings, showVendor: val }
                                                                })}
                                                                helpText="Display the brand or manufacturer name."
                                                            />
                                                            <Checkbox
                                                                label="Show Quantity Selector"
                                                                checked={formState.settings?.showQuantity !== false}
                                                                onChange={(val) => setFormState({
                                                                    ...formState,
                                                                    settings: { ...formState.settings, showQuantity: val }
                                                                })}
                                                                helpText="Allow customers to specify how many items they need."
                                                            />
                                                            <Checkbox
                                                                label="Show Custom Note Field"
                                                                checked={formState.settings?.showProductNote}
                                                                onChange={(val) => setFormState({
                                                                    ...formState,
                                                                    settings: { ...formState.settings, showProductNote: val }
                                                                })}
                                                                helpText="Add a small note section specifically for the product."
                                                            />
                                                        </BlockStack>
                                                    </Box>
                                                </BlockStack>
                                            </Card>

                                            <Card>
                                                <BlockStack gap="400">
                                                    <Text variant="headingMd" as="h2">Success Message</Text>
                                                    <TextField
                                                        label="Success Title"
                                                        value={formState.settings?.successTitle || ''}
                                                        onChange={(val) => setFormState({
                                                            ...formState,
                                                            settings: { ...formState.settings, successTitle: val }
                                                        })}
                                                        autoComplete="off"
                                                    />
                                                    <TextField
                                                        label="Success Message"
                                                        value={formState.settings?.successMessage || ''}
                                                        onChange={(val) => setFormState({
                                                            ...formState,
                                                            settings: { ...formState.settings, successMessage: val }
                                                        })}
                                                        multiline={3}
                                                        autoComplete="off"
                                                    />
                                                </BlockStack>
                                            </Card>
                                        </div>
                                    )}
                                </main>

                                {/* Common Right Preview Sidebar */}
                                <aside className="w-[450px] h-full flex-shrink-0 bg-white overflow-y-auto preview-scrollbar">
                                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                        <Text variant="headingSm" as="h2">Live Preview</Text>
                                        <Badge tone="info">Real-time</Badge>
                                    </div>
                                    <div className="p-8 scale-[0.85] origin-top">
                                        <QuoteForm formState={formState} isPreview={true} isFocused={true} />
                                    </div>
                                </aside>
                            </>
                        ) : (
                            <main className="flex-1 overflow-y-auto bg-[#fafbfc] preview-scrollbar">
                                <FormPreview formState={formState} />
                            </main>
                        )}
                    </div>
                )}
                <Box paddingBlockEnd="800" />
            </Page>

            {/* Floating drag ghost */}
            <DragOverlay dropAnimation={{
                duration: 250,
                easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}>
                {activeDragLabel ? (
                    <div className="px-4 py-3 bg-white border-2 border-indigo-500 rounded-xl shadow-2xl scale-105 transform transition-transform pointer-events-none flex items-center gap-3">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                        <Text as="span" variant="bodySm" fontWeight="bold">
                            {activeDragLabel}
                        </Text>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};
