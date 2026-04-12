import type { ISettings } from "./settings";

export interface SettingsComponentProps {
    settings: ISettings;
    onChange: (key: keyof ISettings, value: unknown) => void;
}

export interface PreviewCardProps {
    settings: ISettings;
}
