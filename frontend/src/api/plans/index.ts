export async function getCurrentPlan() {
    console.log("working this get current plan in frotnend")
    const res = await fetch("/api/plans/current", {
    });
    if (!res.ok) throw new Error("Failed to load current plan");
    const json = await res.json();
    return json.data;
}

export async function upgradePlan(planName: string, host: string) {
    const res = await fetch("/api/plans/upgrade", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ planName, host }),
    });
    if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Failed to initiate upgrade");
    }
    return res.json();
}

export async function getChargeHistory() {
    const res = await fetch("/api/plans/history", {
    });
    if (!res.ok) throw new Error("Failed to load charge history");
    const json = await res.json();
    return json.data;
}
