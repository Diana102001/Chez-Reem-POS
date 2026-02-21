import { useEffect, useState } from "react";
import { getDashboardStats } from "../services/dashboardService";
import {
    ShoppingCart,
    ListOrdered,
    UtensilsCrossed,
    TrendingUp,
    Crown,
} from "lucide-react";
import { ResponsiveLine } from "@nivo/line";
import Loader from "../components/common/Loader";

const StatCard = ({ title, value, icon: Icon, accentColor }) => (
    <div className="bg-card p-6 rounded-xl shadow-sm border border-border relative overflow-hidden group">
        <div className={`absolute top-0 left-0 w-1 h-full ${accentColor}`}></div>
        <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-widest">
            {title}
        </h3>
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
            <h2 className="text-base font-black text-foreground tracking-tight">
                {title}
            </h2>
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
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <Loader text="Analyzing POS Data" />;
    if (!stats) return <p className="text-destructive p-8">Failed to load dashboard data.</p>;

    // Format daily chart data for Nivo
    const dailyChartData = [
        {
            id: "Daily Revenue",
            data: stats.daily_revenue.map((d) => ({
                x: new Date(d.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                }),
                y: d.revenue,
            })),
        },
    ];

    // Format weekly chart data for Nivo
    const weeklyChartData = [
        {
            id: "Weekly Revenue",
            data: stats.weekly_revenue.map((w) => {
                const dt = new Date(w.week);
                const weekNum = Math.ceil(
                    ((dt - new Date(dt.getFullYear(), 0, 1)) / 86400000 + 1) / 7
                );
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
            format: (v) => `${v}€`,
        },
        tooltip: ({ point }) => (
            <div
                style={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,.1)",
                    padding: "10px 14px",
                }}
            >
                <p style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", margin: 0 }}>
                    {point.data.xFormatted}
                </p>
                <p style={{ fontSize: 13, fontWeight: 900, color: "hsl(var(--foreground))", margin: "4px 0 0" }}>
                    {point.data.yFormatted}€
                </p>
            </div>
        ),
    };

    return (
        <div className="h-full overflow-y-auto pr-2 space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>

            {/* ─── Stat Cards ─── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Revenu total"
                    value={`${stats.total_revenue.toFixed(2)}€`}
                    icon={ShoppingCart}
                    accentColor="bg-primary"
                />
                <StatCard
                    title="Total des commandes"
                    value={stats.total_orders}
                    icon={ListOrdered}
                    accentColor="bg-secondary"
                />
                <StatCard
                    title="Total des produits"
                    value={stats.total_products}
                    icon={UtensilsCrossed}
                    accentColor="bg-blue-500"
                />
            </div>

            {/* ─── Revenue Charts ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Revenue */}
                <ChartCard title="Revenu quotidien (30 derniers jours)" icon={TrendingUp}>
                    {dailyChartData[0].data.length === 0 ? (
                        <p className="text-muted-foreground text-sm py-8 text-center">
                            Aucune donn\u00e9e de revenu disponible pour les 30 derniers jours
                        </p>
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

                {/* Weekly Revenue */}
                <ChartCard title="Revenu hebdomadaire (12 dernières semaines)" icon={TrendingUp}>
                    {weeklyChartData[0].data.length === 0 ? (
                        <p className="text-muted-foreground text-sm py-8 text-center">
                            Aucune donn\u00e9e de revenu disponible pour les 12 derni\u00e8res semaines
                        </p>
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

            {/* ─── Most Demanded by Category ─── */}
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                        <Crown className="text-secondary w-4 h-4" />
                    </div>
                    <h2 className="text-base font-black text-foreground tracking-tight">
                        Les plus demandés par catégorie
                    </h2>
                </div>
                {stats.most_demanded_by_category.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Aucune donnée de commande disponible pour le moment.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stats.most_demanded_by_category.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-4 p-4 rounded-lg bg-muted/40 border border-border hover:border-secondary/40 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                                    <Crown className="w-5 h-5 text-secondary" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest truncate">
                                        {item.category}
                                    </p>
                                    <p className="text-sm font-black text-foreground truncate">
                                        {item.product}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        <span className="font-mono-numbers font-bold text-secondary">
                                            {item.total_qty}
                                        </span>{" "}
                                        unités commandées
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
