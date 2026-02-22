import { useEffect, useState } from "react";
import { getDashboardStats } from "../services/dashboardService";
import {
    ShoppingCart,
    ListOrdered,
    UtensilsCrossed,
    TrendingUp,
    Crown,
    Filter,
} from "lucide-react";
import { ResponsiveLine } from "@nivo/line";
import Loader from "../components/common/Loader";

const StatCard = ({ title, value, icon: Icon, accentColor }) => (
    <div className="bg-card p-6 rounded-xl shadow-sm border border-border relative overflow-hidden group">
        <div className={`absolute top-0 left-0 w-1 h-full ${accentColor}`}></div>
        <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-widest">{title}</h3>
        <p className="text-3xl font-black text-foreground mt-2">{value}</p>
        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <Icon size={80} className={accentColor.replace("bg-", "text-")} />
        </div>
    </div>
);

const ChartCard = ({ title, icon: Icon, children }) => (
    <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="text-primary w-4 h-4" />
            </div>
            <h2 className="text-base font-black text-foreground tracking-tight">{title}</h2>
        </div>
        {children}
    </div>
);

const nivoTheme = {
    text: { fill: "hsl(var(--muted-foreground))", fontSize: 11 },
    axis: {
        ticks: { text: { fill: "hsl(var(--muted-foreground))", fontSize: 11 } },
        legend: { text: { fill: "hsl(var(--muted-foreground))", fontSize: 12 } },
    },
    grid: { line: { stroke: "hsl(var(--border))", strokeDasharray: "4 4" } },
    crosshair: { line: { stroke: "hsl(var(--muted-foreground))", strokeWidth: 1 } },
    tooltip: {
        container: {
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,.1)",
            padding: "10px 14px",
            fontSize: "12px",
            color: "hsl(var(--foreground))",
        },
    },
};

const Dashboard = () => {
    const today = new Date().toISOString().slice(0, 10);

    const [globalStats, setGlobalStats] = useState(null);
    const [filteredStats, setFilteredStats] = useState(null);
    const [loadingGlobal, setLoadingGlobal] = useState(true);
    const [loadingFiltered, setLoadingFiltered] = useState(true);
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [paymentMethod, setPaymentMethod] = useState("all");

    const openDatePicker = (event) => {
        if (typeof event.currentTarget.showPicker === "function") {
            event.currentTarget.showPicker();
        }
    };

    const blockDateKeyboardInput = (event) => {
        if (event.key === "Tab") return;
        event.preventDefault();
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoadingGlobal(true);
            try {
                const data = await getDashboardStats();
                setGlobalStats(data);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoadingGlobal(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchFilteredData = async () => {
            setLoadingFiltered(true);
            try {
                const data = await getDashboardStats({
                    start_date: startDate,
                    end_date: endDate,
                    payment_method: paymentMethod,
                });
                setFilteredStats(data);
            } catch (error) {
                console.error("Failed to load filtered dashboard data", error);
            } finally {
                setLoadingFiltered(false);
            }
        };
        fetchFilteredData();
    }, [startDate, endDate, paymentMethod]);

    if (loadingGlobal || !globalStats) return <Loader text="Analyzing POS Data" />;
    if (!globalStats) return <p className="text-destructive p-8">Failed to load dashboard data.</p>;
    const stats = globalStats;
    const scoped = filteredStats || {
        total_items_sold: 0,
        most_sold_overall: null,
        payment_breakdown: [],
        most_demanded_by_category: [],
    };

    const dailyChartData = [
        {
            id: "Daily Revenue",
            data: (stats.daily_revenue || []).map((d) => ({
                x: new Date(d.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                }),
                y: d.revenue,
            })),
        },
    ];

    const weeklyChartData = [
        {
            id: "Weekly Revenue",
            data: (stats.weekly_revenue || []).map((w) => {
                const dt = new Date(w.week);
                const weekNum = Math.ceil((((dt - new Date(dt.getFullYear(), 0, 1)) / 86400000) + 1) / 7);
                return {
                    x: `W${weekNum} ${dt.toLocaleDateString("en-US", { month: "short" })}`,
                    y: w.revenue,
                };
            }),
        },
    ];

    const commonLineProps = {
        margin: { top: 20, right: 20, bottom: 50, left: 60 },
        xScale: { type: "point" },
        yScale: { type: "linear", min: 0, max: "auto", stacked: false },
        curve: "catmullRom",
        enableGridX: false,
        enableArea: true,
        areaOpacity: 0.15,
        pointSize: 6,
        pointBorderWidth: 2,
        pointBorderColor: { from: "serieColor" },
        pointColor: "hsl(var(--card))",
        useMesh: true,
        theme: nivoTheme,
        axisBottom: {
            tickSize: 0,
            tickPadding: 10,
            tickRotation: -35,
        },
        axisLeft: {
            tickSize: 0,
            tickPadding: 10,
            format: (v) => `${v} EUR`,
        },
    };

    return (
        <div className="h-full overflow-y-auto pr-2 space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Revenu total"
                    value={`${Number(stats.total_revenue || 0).toFixed(2)} EUR`}
                    icon={ShoppingCart}
                    accentColor="bg-primary"
                />
                <StatCard
                    title="Total des commandes"
                    value={stats.total_orders || 0}
                    icon={ListOrdered}
                    accentColor="bg-secondary"
                />
                <StatCard
                    title="Total des produits"
                    value={stats.total_products || 0}
                    icon={UtensilsCrossed}
                    accentColor="bg-blue-500"
                />
                <StatCard
                    title="Tout vendu (unites)"
                    value={stats.total_items_sold || 0}
                    icon={ShoppingCart}
                    accentColor="bg-orange-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Revenu quotidien" icon={TrendingUp}>
                    {dailyChartData[0].data.length === 0 ? (
                        <p className="text-muted-foreground text-sm py-8 text-center">Aucune donnee de revenu disponible.</p>
                    ) : (
                        <div style={{ height: 280 }}>
                            <ResponsiveLine
                                {...commonLineProps}
                                data={dailyChartData}
                                colors={["hsl(var(--primary))"]}
                                areaBaselineValue={0}
                            />
                        </div>
                    )}
                </ChartCard>

                <ChartCard title="Revenu hebdomadaire" icon={TrendingUp}>
                    {weeklyChartData[0].data.length === 0 ? (
                        <p className="text-muted-foreground text-sm py-8 text-center">Aucune donnee de revenu disponible.</p>
                    ) : (
                        <div style={{ height: 280 }}>
                            <ResponsiveLine
                                {...commonLineProps}
                                data={weeklyChartData}
                                colors={["hsl(var(--secondary))"]}
                                areaBaselineValue={0}
                            />
                        </div>
                    )}
                </ChartCard>
            </div>

            <div className="bg-card p-4 rounded-xl shadow-sm border border-border flex flex-wrap items-end gap-3">
                <div className="flex items-center gap-2 mr-2">
                    <Filter size={16} className="text-primary" />
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Filtres</p>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Debut</label>
                    <input
                        type="date"
                        value={startDate}
                        max={endDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        onKeyDown={blockDateKeyboardInput}
                        onPaste={(e) => e.preventDefault()}
                        onClick={openDatePicker}
                        onFocus={openDatePicker}
                        inputMode="none"
                        className="px-3 py-1.5 rounded-lg border border-border bg-card text-sm font-semibold text-foreground outline-none"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Fin</label>
                    <input
                        type="date"
                        value={endDate}
                        min={startDate}
                        max={today}
                        onChange={(e) => setEndDate(e.target.value)}
                        onKeyDown={blockDateKeyboardInput}
                        onPaste={(e) => e.preventDefault()}
                        onClick={openDatePicker}
                        onFocus={openDatePicker}
                        inputMode="none"
                        className="px-3 py-1.5 rounded-lg border border-border bg-card text-sm font-semibold text-foreground outline-none"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Paiement</label>
                    <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-border bg-card text-sm font-semibold text-foreground outline-none"
                    >
                        <option value="all">Tous</option>
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                    <h2 className="text-base font-black text-foreground tracking-tight mb-4">Produit le plus vendu</h2>
                    {loadingFiltered ? (
                        <p className="text-muted-foreground text-sm">Chargement...</p>
                    ) : scoped.most_sold_overall ? (
                        <div className="p-4 rounded-lg bg-muted/40 border border-border">
                            <p className="text-sm font-black text-foreground">{scoped.most_sold_overall.product}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                <span className="font-mono-numbers font-bold text-primary">{scoped.most_sold_overall.total_qty}</span> unites vendues
                            </p>
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">Aucune vente dans cette periode.</p>
                    )}
                </div>
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                    <h2 className="text-base font-black text-foreground tracking-tight mb-4">Ventes par paiement</h2>
                    {loadingFiltered ? (
                        <p className="text-muted-foreground text-sm">Chargement...</p>
                    ) : scoped.payment_breakdown?.length ? (
                        <div className="space-y-2">
                            {scoped.payment_breakdown.map((row) => (
                                <div key={row.method} className="flex justify-between text-sm">
                                    <span className="uppercase font-semibold">{row.method}</span>
                                    <span>{Number(row.total_amount || 0).toFixed(2)} EUR ({row.order_count})</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">Aucune vente dans cette periode.</p>
                    )}
                </div>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                        <Crown className="text-secondary w-4 h-4" />
                    </div>
                    <h2 className="text-base font-black text-foreground tracking-tight">Les plus demandes par categorie</h2>
                </div>
                {loadingFiltered ? (
                    <p className="text-muted-foreground text-sm">Chargement...</p>
                ) : scoped.most_demanded_by_category?.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Aucune donnee de commande disponible pour le moment.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(scoped.most_demanded_by_category || []).map((item, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-4 p-4 rounded-lg bg-muted/40 border border-border hover:border-secondary/40 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                                    <Crown className="w-5 h-5 text-secondary" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest truncate">{item.category}</p>
                                    <p className="text-sm font-black text-foreground truncate">{item.product}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        <span className="font-mono-numbers font-bold text-secondary">{item.total_qty}</span> unites commandees
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
