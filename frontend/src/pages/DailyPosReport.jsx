import { useEffect, useState } from "react";
import Loader from "../components/common/Loader";
import { closeDailyPosReport, downloadDailyPosReportPdf, getDailyPosReport, startDailyPosReport } from "../services/reportService";
import { ReceiptText, Printer, Download, MessageSquare } from "lucide-react";

const formatMoney = (value) => `${Number(value || 0).toFixed(2)} EUR`;
const formatDateTime = (value) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return parsed.toLocaleString();
};
const formatClosingStatus = (report) => {
    if (!report) return "-";
    if (report.is_closed) return formatDateTime(report.closing_time);
    if (report.is_started) return "En cours";
    return "-";
};

const DailyPosReport = () => {
    const today = new Date().toISOString().slice(0, 10);
    const [date, setDate] = useState(today);
    const [report, setReport] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exportingPdf, setExportingPdf] = useState(false);
    const [startingDay, setStartingDay] = useState(false);
    const [closingDay, setClosingDay] = useState(false);
    const [reportMode, setReportMode] = useState("detailed");
    const isTodaySelected = date === today;
    const isSimpleMode = reportMode === "simple";

    const loadReport = async (selectedDate, mode = reportMode) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getDailyPosReport(selectedDate, mode);
            setReport(data);
        } catch (err) {
            console.error("Failed to load daily POS report:", err);
            setError("Impossible de charger le rapport journalier.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReport(date, reportMode);
    }, []);

    useEffect(() => {
        if (!report?.tickets?.length) {
            setSelectedTicket(null);
            return;
        }
        setSelectedTicket(report.tickets[0]);
    }, [report]);

    const onDateChange = (e) => {
        const nextDate = e.target.value;
        setDate(nextDate);
        loadReport(nextDate, reportMode);
    };

    const onModeChange = (nextMode) => {
        if (nextMode === reportMode) return;
        setReportMode(nextMode);
        loadReport(date, nextMode);
    };

    const handleExportPdf = async () => {
        if (!report) return;
        setExportingPdf(true);
        try {
            await downloadDailyPosReportPdf(date, reportMode);
        } catch (err) {
            console.error("Failed to export PDF:", err);
            alert(err?.response?.data?.detail || err?.message || "Impossible d'exporter le PDF.");
        } finally {
            setExportingPdf(false);
        }
    };

    const handleCloseDay = async () => {
        if (!report || !isTodaySelected || !report.is_started || report.is_closed) return;
        setClosingDay(true);
        try {
            await closeDailyPosReport(date);
            await loadReport(date, reportMode);
        } catch (err) {
            console.error("Failed to close day:", err);
            alert(err?.response?.data?.detail || err?.message || "Impossible de cloturer la journee.");
        } finally {
            setClosingDay(false);
        }
    };

    const handleStartDay = async () => {
        if (!isTodaySelected || report?.is_started) return;
        setStartingDay(true);
        try {
            await startDailyPosReport(date);
            await loadReport(date, reportMode);
        } catch (err) {
            console.error("Failed to start day:", err);
            alert(err?.response?.data?.detail || err?.message || "Impossible de demarrer la journee.");
        } finally {
            setStartingDay(false);
        }
    };

    if (loading) return <Loader text="Chargement du rapport journalier" />;

    const taxLines = report?.by_tax_type?.length
        ? report.by_tax_type
        : (report?.by_tax_rate || []).map((row) => ({
            tax_type_id: String(row.tax_rate),
            tax_type: `${Number(row.tax_rate).toFixed(2)}%`,
            tax_rate: row.tax_rate,
            ticket_count: row.ticket_count,
            total_ht: row.total_ht,
            total_vat: row.total_vat,
            total_ttc: row.total_ttc,
        }));

    return (
        <div className="bg-card rounded-xl shadow h-full flex flex-col overflow-hidden border border-border">
            <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-foreground">Ma journee</h2>
                    <button
                        onClick={handleStartDay}
                        disabled={!isTodaySelected || startingDay || report?.is_started}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {report?.is_started ? "Journee demarree" : (startingDay ? "Demarrage..." : "Demarrer journee")}
                    </button>
                    <button
                        onClick={handleCloseDay}
                        disabled={!isTodaySelected || closingDay || !report?.is_started || report?.is_closed}
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {report?.is_closed ? "Journee cloturee" : (closingDay ? "Cloture..." : "Cloturer journee")}
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border">
                        <button
                            onClick={() => onModeChange("simple")}
                            className={`px-2 py-1 rounded text-[11px] font-bold ${isSimpleMode ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            Simple
                        </button>
                        <button
                            onClick={() => onModeChange("detailed")}
                            className={`px-2 py-1 rounded text-[11px] font-bold ${!isSimpleMode ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            Detaille
                        </button>
                    </div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={onDateChange}
                        max={today}
                        className="px-3 py-1.5 rounded-lg border border-border bg-card text-sm font-semibold text-foreground outline-none"
                    />
                </div>
            </div>

            {error && (
                <div className="m-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
                    {error}
                </div>
            )}

            {!error && report && (
                <div className="flex-1 min-h-0 grid grid-cols-12">
                    {/* LEFT - Ticket list */}
                    <div className="col-span-12 lg:col-span-3 border-r border-border flex flex-col min-h-0">
                        <div className="p-3 border-b border-border bg-muted/20">
                            <div className="flex items-center gap-2">
                           <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Tickets</p>
                                <span className="text-xs font-bold text-foreground">{report.tickets.length}</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto">
                            {report.tickets.length === 0 && (
                                <div className="p-6 text-center text-sm text-muted-foreground">Aucun ticket pour cette date.</div>
                            )}
                            {report.tickets.map((ticket) => (
                                <button
                                    key={ticket.order_id}
                                    onClick={() => setSelectedTicket(ticket)}
                                    className={`w-full text-left px-3 py-2 border-b border-border transition-colors ${selectedTicket?.order_id === ticket.order_id ? "bg-primary/5" : "hover:bg-muted/40"}`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-black text-foreground">#{ticket.order_id}</p>
                                            <p className="text-[11px] font-semibold text-muted-foreground truncate">
                                                {ticket.created_by_username || "Utilisateur inconnu"}
                                                {ticket.created_by_role ? ` (${ticket.created_by_role})` : ""}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-black text-primary">{formatMoney(ticket.ttc)}</p>
                                            <p className="text-[11px] font-semibold text-muted-foreground">
                                                {new Date(ticket.created_at).toLocaleDateString()} {new Date(ticket.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CENTER - Ticket preview placeholder */}
                    <div className="col-span-12 lg:col-span-5 border-r border-border flex items-center justify-center min-h-0">
                        {selectedTicket ? (
                            <div className="text-center px-6">
                                <ReceiptText size={72} className="mx-auto mb-4 text-muted-foreground/60" />
                                <p className="text-lg font-black text-foreground mb-1">Ticket #{selectedTicket.order_id}</p>
                                <p className="text-sm text-muted-foreground mb-3">
                                    {new Date(selectedTicket.created_at).toLocaleDateString()} {new Date(selectedTicket.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </p>
                                <div className="space-y-1 text-sm">
                                    <p><span className="font-bold">HT:</span> {formatMoney(selectedTicket.ht)}</p>
                                    <p><span className="font-bold">TVA:</span> {formatMoney(selectedTicket.vat)}</p>
                                    <p><span className="font-bold">TTC:</span> {formatMoney(selectedTicket.ttc)}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center px-6">
                                <ReceiptText size={72} className="mx-auto mb-4 text-muted-foreground/40" />
                                <p className="text-muted-foreground">Selectionner un ticket pour le consulter</p>
                            </div>
                        )}
                    </div>

                    {/* RIGHT - Z summary */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col min-h-0">
                        <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between">
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Rapports</p>
                            <div className="text-xs font-bold text-foreground">{report.report_mode === "simple" ? "Simple" : "Detaille"}</div>
                        </div>
                        <div className="flex-1 overflow-auto p-4 text-sm">
                            <div className="space-y-1 border-b border-border pb-3 mb-3">
                                <div className="flex justify-between"><span className="font-semibold">Numero de journee :</span><span className="font-mono-numbers font-bold">{report.totals.ticket_count}</span></div>
                                <div className="flex justify-between"><span className="font-semibold">Date debut :</span><span>{report.start_date || report.report_date}</span></div>
                                <div className="flex justify-between"><span className="font-semibold">Ouverture :</span><span>{formatDateTime(report.opening_time)}</span></div>
                                <div className="flex justify-between"><span className="font-semibold">Fermeture :</span><span>{formatClosingStatus(report)}</span></div>
                                <div className="flex justify-between"><span className="font-semibold">Date impression :</span><span>{report.report_date}</span></div>
                                <div className="flex justify-between"><span className="font-semibold">Source :</span><span>{report.source === "snapshot" ? "Cloture" : "Live"}</span></div>
                            </div>

                            {report.report_mode === "simple" ? (
                                <>
                                    <div className="space-y-1 border-b border-border pb-3 mb-3">
                                        <div className="flex justify-between"><span className="font-bold">CA TOTAL :</span><span className="font-black">{formatMoney(report.summary?.total_ttc)}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold">CA HT :</span><span>{formatMoney(report.summary?.total_ht)}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold">TVA :</span><span>{formatMoney(report.summary?.total_vat)}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold">Nombre de commandes :</span><span>{report.summary?.order_count || 0}</span></div>
                                    </div>

                                    {/* <div className="space-y-1">
                                        {(report.order_type_totals || []).map((row) => (
                                            <div key={row.type} className="flex justify-between">
                                                <span className="uppercase">{row.type}</span>
                                                <span>{formatMoney(row.total_ttc)} ({row.order_count})</span>
                                            </div>
                                        ))}
                                    </div> */}
                                </>
                            ) : (
                                <>
                                    <div className="space-y-1 border-b border-border pb-3 mb-3">
                                        <div className="flex justify-between"><span className="font-bold">CA TOTAL :</span><span className="font-black">{formatMoney(report.totals.total_revenue)}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold">CA HT :</span><span>{formatMoney(report.totals.total_ht)}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold">Ticket moyen TTC :</span><span>{formatMoney(report.totals.average_ticket)}</span></div>
                                        <div className="flex justify-between"><span className="font-semibold">Montant a encaisser :</span><span>{formatMoney(report.totals.total_ttc)}</span></div>
                                    </div>

                                    <div className="space-y-1 border-b border-border pb-3 mb-3">
                                        {taxLines.map((row) => (
                                            <div key={`tva-${row.tax_type_id}`} className="flex justify-between">
                                                <span>TVA {row.tax_type} ({Number(row.tax_rate).toFixed(2)} %) :</span>
                                                <span>{formatMoney(row.total_vat)}</span>
                                            </div>
                                        ))}
                                        {taxLines.map((row) => (
                                            <div key={`ttc-${row.tax_type_id}`} className="flex justify-between">
                                                <span>CA TTC {row.tax_type} :</span>
                                                <span>{formatMoney(row.total_ttc)}</span>
                                            </div>
                                        ))}
                                        {taxLines.map((row) => (
                                            <div key={`ht-${row.tax_type_id}`} className="flex justify-between">
                                                <span>CA HT {row.tax_type} :</span>
                                                <span>{formatMoney(row.total_ht)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-1">
                                        {report.payment_methods.map((row) => (
                                            <div key={row.method} className="flex justify-between">
                                                <span className="uppercase">{row.method}</span>
                                                <span>{formatMoney(row.total_amount)} ({row.ticket_count})</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="p-3 border-t border-border grid grid-cols-3 gap-2">
                            <button
                                disabled={!report?.is_closed}
                                className="py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-muted transition-colors flex items-center justify-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <Printer size={12} /> Imprimer X
                            </button>
                            <button
                                onClick={handleExportPdf}
                                disabled={exportingPdf || !report?.is_closed}
                                className="py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-muted transition-colors flex items-center justify-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <Download size={12} /> {exportingPdf ? "Export..." : "Exporter"}
                            </button>
                            <button className="py-1.5 rounded-lg border border-border text-xs font-bold hover:bg-muted transition-colors flex items-center justify-center gap-1">
                                <MessageSquare size={12} /> Commentaire
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailyPosReport;
