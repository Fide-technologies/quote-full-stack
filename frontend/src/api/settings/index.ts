import type { ISettings } from "../../types/settings";

export async function getSettings(): Promise<ISettings> {
    const res = await fetch("/api/settings");
    if (!res.ok) throw new Error("Failed to load settings");
    const json = await res.json();
    console.log("[API] getSettings response:", json);
    return json.data;
}

export async function updateSettings(settings: ISettings) {
    console.log("[API] updateSettings payload:", settings);
    const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
    });

    if (!res.ok) throw new Error("Failed to update settings");
    return res.json();
}
