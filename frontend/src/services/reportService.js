import api from "./api";

export const getDailyPosReport = async (date, mode = "detailed") => {
    const params = {};
    if (date) params.date = date;
    if (mode) params.mode = mode;

    const response = await api.get("reports/daily-pos/", {
        params,
    });
    return response.data;
};

export const startDailyPosReport = async (date) => {
    const payload = {};
    if (date) payload.date = date;

    const response = await api.post("reports/daily-pos/start/", payload);
    return response.data;
};

export const closeDailyPosReport = async (date) => {
    const payload = {};
    if (date) payload.date = date;

    const response = await api.post("reports/daily-pos/close/", payload);
    return response.data;
};

export const downloadDailyPosReportPdf = async (date, mode = "detailed") => {
    const reportDate = date || new Date().toISOString().slice(0, 10);
    const token = localStorage.getItem("access");

    const baseURL = api.defaults.baseURL || "http://localhost:8000/api/";
    const apiRoot = baseURL.endsWith("/api/")
        ? baseURL.slice(0, -5)
        : baseURL.replace(/\/api\/?$/, "");
    const query = new URLSearchParams();
    if (mode) query.set("mode", mode);
    const querySuffix = query.toString() ? `?${query.toString()}` : "";
    const url = `${apiRoot}/api/reports/daily/pdf/${reportDate}/${querySuffix}`;

    const response = await fetch(url, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const blob = await response.blob();

    if (!response.ok) {
        let detail = `Export failed (${response.status})`;
        try {
            const text = await blob.text();
            const parsed = JSON.parse(text);
            detail = parsed?.detail || detail;
        } catch {}
        throw new Error(detail);
    }

    // 🔥 Extract filename from backend if provided
    const disposition = response.headers.get("content-disposition");
    let filename = `Z_Report_${reportDate}.pdf`;

    if (disposition && disposition.includes("filename=")) {
        filename = disposition
            .split("filename=")[1]
            .replace(/"/g, "");
    }

    // ✅ Trigger browser download
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
};
