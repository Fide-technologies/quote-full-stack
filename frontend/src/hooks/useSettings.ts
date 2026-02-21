import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSettings } from "../api/settings";

export function useSettings() {
    const queryClient = useQueryClient();

    const { data: settings, isLoading, error } = useQuery({
        queryKey: ["settings"],
        queryFn: getSettings,
        staleTime: 1000 * 60 * 5,
    });

    const { mutate: updateSettingsMutation, isPending: isUpdating } = useMutation({
        mutationFn: updateSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings"] });
        },
    });

    return {
        settings,
        isLoading,
        error,
        updateSettings: updateSettingsMutation,
        isUpdating,
    };
}
