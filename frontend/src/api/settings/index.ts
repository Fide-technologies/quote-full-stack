export async function getSettings() {
    const res = await fetch("/api/settings");
    if (!res.ok) throw new Error("Failed to load settings");
    const json = await res.json();
    console.log("[API] getSettings response:", json);
    return json.data;
}

export async function updateSettings(showOnAll: boolean) {
    console.log("working the seciton", showOnAll)
    const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showOnAll }),
    });

    if (!res.ok) throw new Error("Failed to update settings");
    return res.json();
}
