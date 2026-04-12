import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";
import { getSettings, updateSettings } from "../api/settings";
import { DEFAULT_SETTINGS, type ISettings } from "../types/settings";

export function useSettingsLogic() {
    const queryClient = useQueryClient();
    const shopify = useAppBridge();
    const [selectedTab, setSelectedTab] = useState(0);
    const [localSettings, setLocalSettings] = useState<ISettings | null>(null);
    const [hasChanged, setHasChanged] = useState(false);

    const {
        data: serverSettings,
        isLoading,
        isError,
        error,
        refetch
    } = useQuery<ISettings>({
        queryKey: ["settings"],
        queryFn: getSettings,
    });

    const normalizedServerSettings = useMemo((): ISettings => {
        return { ...DEFAULT_SETTINGS, ...serverSettings };
    }, [serverSettings]);

    const currentSettings = useMemo((): ISettings => {
        return {
            ...normalizedServerSettings,
            ...localSettings,
        };
    }, [localSettings, normalizedServerSettings]);

    const mutation = useMutation({
        mutationFn: (settings: ISettings) => updateSettings(settings),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings"] });
            shopify.toast.show("Settings saved successfully");
            setLocalSettings(null);
            setHasChanged(false);
        },
        onError: () => {
            shopify.toast.show("Failed to save settings", { isError: true });
        },
    });

    useEffect(() => {
        if (hasChanged) {
            shopify.saveBar.show("settings-save-bar");
        } else {
            shopify.saveBar.hide("settings-save-bar");
        }
    }, [hasChanged, shopify]);

    const handleFieldChange = useCallback(
        (key: keyof ISettings, value: unknown) => {
            setLocalSettings((prev: ISettings | null) => ({
                ...(prev || normalizedServerSettings),
                [key]: value,
            }));
            setHasChanged(true);
        },
        [normalizedServerSettings],
    );

    const handleSave = useCallback(() => {
        if (localSettings) {
            const settingsToSave = { ...currentSettings };
            delete settingsToSave.plan;
            delete settingsToSave.isAppEmbedded;
            delete settingsToSave.deepLinkUrl;
            mutation.mutate(settingsToSave as ISettings);
        }
    }, [localSettings, currentSettings, mutation]);

    const handleDiscard = useCallback(() => {
        setLocalSettings(null);
        setHasChanged(false);
    }, []);

    const tabs = [
        { id: "button", content: "Quote button", accessibilityLabel: "Quote button", panelID: "button-panel" },
        { id: "pricing", content: "Hide price", accessibilityLabel: "Hide price", panelID: "pricing-panel" },
        {
            id: "hide-buttons",
            content: "Hide checkout buttons",
            accessibilityLabel: "Hide checkout buttons",
            panelID: "hide-buttons-panel",
        },
        {
            id: "cart-widget",
            content: "Quote cart widget",
            accessibilityLabel: "Quote cart widget",
            panelID: "cart-widget-panel",
        },
        {
            id: "history-widget",
            content: "Quote history widget",
            accessibilityLabel: "Quote history widget",
            panelID: "history-widget-panel",
        },
    ];

    return {
        selectedTab,
        setSelectedTab,
        currentSettings,
        handleFieldChange,
        handleSave,
        handleDiscard,
        isLoading,
        isError,
        error,
        refetch,
        isSaving: mutation.isPending,
        tabs,
    };
}
