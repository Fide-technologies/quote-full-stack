export async function getAllPlans() {
    const res = await fetch("/api/plans");
    if (!res.ok) throw new Error("Failed to load plans");
    const json = await res.json();
    return json.data;
}

export async function getCurrentPlan() {
    const res = await fetch("/api/plans/current");
    if (!res.ok) throw new Error("Failed to load current plan");
    const json = await res.json();
    return json.data;
}

export async function upgradePlan(planName: string) {
    const res = await fetch("/api/plans/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName }),
    });
    if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Failed to initiate upgrade");
    }
    return res.json();
}
