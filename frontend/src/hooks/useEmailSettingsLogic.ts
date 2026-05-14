import { useAppBridge } from '@shopify/app-bridge-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getEmailSettings, getSmtpProviders, type IEmailSettings, updateEmailSettings } from '../api/email-settings';

export const DEFAULT_EMAIL_SETTINGS: IEmailSettings = {
  adminEmailEnabled: true,
  adminEmail: '',
  customerEmailEnabled: true,
  smtpEnabled: false,
  smtpProvider: 'custom',
  smtpHost: '',
  smtpPort: 587,
  smtpSecure: false,
  smtpFrom: '',
  smtpUser: '',
  smtpPass: '',
};

export function useEmailSettingsLogic() {
  const queryClient = useQueryClient();
  const shopify = useAppBridge();
  const [localSettings, setLocalSettings] = useState<Partial<IEmailSettings> | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const {
    data: serverSettings,
    isLoading,
    error,
    refetch,
  } = useQuery<IEmailSettings>({
    queryKey: ['emailSettings'],
    queryFn: getEmailSettings,
  });

  const normalizedServerSettings = useMemo((): IEmailSettings => {
    return { ...DEFAULT_EMAIL_SETTINGS, ...serverSettings };
  }, [serverSettings]);

  const currentSettings = useMemo((): IEmailSettings => {
    return {
      ...normalizedServerSettings,
      ...localSettings,
    };
  }, [localSettings, normalizedServerSettings]);

  useEffect(() => {
    if (isDirty) {
      shopify.saveBar.show('settings-save-bar');
    } else {
      shopify.saveBar.hide('settings-save-bar');
    }
  }, [isDirty, shopify]);

  const handleFieldChange = useCallback((key: keyof IEmailSettings, value: unknown) => {
    setLocalSettings((prev) => ({
      ...(prev || {}),
      [key]: value,
    }));
    setIsDirty(true);

    // Provider switching logic
    if (key === 'smtpProvider' && value !== 'custom') {
      getSmtpProviders().then((providers) => {
        const provider = providers.find((p) => p.value === value);
        if (provider) {
          setLocalSettings((prev) => ({
            ...(prev || {}),
            smtpHost: provider.host,
            smtpPort: provider.port,
            smtpSecure: provider.secure,
            smtpUser: value === 'sendgrid' ? 'apikey' : (prev?.smtpUser || ''),
          }));
        }
      });
    }
  }, []);

  const mutation = useMutation({
    mutationFn: updateEmailSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailSettings'] });
      setIsDirty(false);
      setLocalSettings(null);
      shopify.toast.show('Email Settings saved successfully');
    },
    onError: (err: Error) => {
      shopify.toast.show(`Failed to save: ${err.message}`, { isError: true });
    },
  });

  const handleSave = () => {
    mutation.mutate(currentSettings);
  };

  const handleDiscard = () => {
    setLocalSettings(null);
    setIsDirty(false);
  };

  return {
    currentSettings,
    isLoading,
    error,
    isDirty,
    isSaving: mutation.isPending,
    handleFieldChange,
    handleSave,
    handleDiscard,
    refetch,
  };
}
