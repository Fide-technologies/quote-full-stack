export async function getAllPlans() {
    const res = await fetch("/api/plans", {
        headers: { "ngrok-skip-browser-warning": "true" }
    });
    if (!res.ok) throw new Error("Failed to load plans");
    const json = await res.json();
    return json.data;
}

export async function getCurrentPlan() {
    console.log("working this get current plan in frotnend")
    const res = await fetch("/api/plans/current", {
        headers: { "ngrok-skip-browser-warning": "true" }
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
            "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({ planName, host }),
    });
    if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Failed to initiate upgrade");
    }
    return res.json();
}
