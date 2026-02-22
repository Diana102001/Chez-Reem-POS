import { NavLink } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { updateMe } from "../../services/authService";
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    History,
    LogOut,
    UtensilsCrossed,
    Layers,
    Users,
    Percent,
    FileText,
} from "lucide-react";

const Sidebar = () => {
    const { logout, user, refreshUser } = useContext(AuthContext);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [profileForm, setProfileForm] = useState({ password: "" });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState(null);

    const menuItems = [
        { name: "Tableau de bord", path: "/", icon: LayoutDashboard },
        { name: "Commande", path: "/order", icon: ShoppingCart },
        { name: "Historique", path: "/orders", icon: History },
        { name: "Rapport journalier", path: "/reports/daily", icon: FileText },
    ];

    if (user?.role === "admin" || user?.is_superuser) {
        menuItems.push({ name: "Produits", path: "/products", icon: Package });
        menuItems.push({ name: "Categories", path: "/categories", icon: Layers });
        menuItems.push({ name: "Types de taxe", path: "/tax-types", icon: Percent });
        menuItems.push({ name: "Utilisateurs", path: "/users", icon: Users });
    }

    const initials = (user?.username || "U").slice(0, 2).toUpperCase();
    const roleLabel = user?.role === "admin" || user?.is_superuser ? "Administrateur" : "Caissier";

    const openProfileModal = () => {
        setProfileError(null);
        setProfileForm({ password: "" });
        setIsProfileOpen(true);
    };

    const closeProfileModal = () => {
        if (profileLoading) return;
        setIsProfileOpen(false);
    };

    const onProfileInput = (e) => {
        const { name, value } = e.target;
        setProfileForm((prev) => ({ ...prev, [name]: value }));
    };

    const saveProfile = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileError(null);

        try {
            const payload = {};
            if (profileForm.password.trim()) {
                payload.password = profileForm.password;
            }

            await updateMe(payload);
            await refreshUser();
            setIsProfileOpen(false);
        } catch (err) {
            console.error("Failed to update profile:", err);
            const message =
                err.response?.data?.username?.[0] ||
                err.response?.data?.email?.[0] ||
                err.response?.data?.password?.[0] ||
                err.response?.data?.detail ||
                "Impossible de mettre a jour le profil.";
            setProfileError(message);
        } finally {
            setProfileLoading(false);
        }
    };

    return (
        <>
            <div
                className={`flex flex-col h-screen bg-card border-r border-border shadow-sm transition-all duration-300 ease-in-out z-50 overflow-x-hidden flex-shrink-0 ${isExpanded ? "w-56" : "w-16"}`}
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
            >
                {/* Logo Section */}
                <div className="h-20 flex items-center px-3 border-b border-border overflow-hidden">
                    <div className="flex items-center gap-3 min-w-max">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                            <UtensilsCrossed className="text-primary-foreground w-6 h-6" />
                        </div>
                        <div className={`transition-all duration-300 ${isExpanded ? "opacity-100" : "opacity-0 invisible w-0"}`}>
                            <h1 className="text-base font-bold text-foreground tracking-tight leading-none whitespace-nowrap">Chez Reem</h1>
                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Systeme de caisse</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-2.5 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden font-sans">
                    <p className={`px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 transition-all duration-300 ${isExpanded ? "opacity-100" : "opacity-0 h-0 pointer-events-none"}`}>
                        Menu Principal
                    </p>
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.path === "/"}
                            className={({ isActive }) =>
                                `flex items-center rounded-xl transition-all duration-200 group relative ${isExpanded ? "px-3 py-2.5 gap-3" : "justify-center p-2.5"} ${
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`
                            }
                        >
                            <item.icon className={`flex-shrink-0 ${isExpanded ? "w-5 h-5" : "w-6 h-6"}`} />
                            <span className={`font-semibold text-sm whitespace-nowrap transition-all duration-300 ${isExpanded ? "opacity-100" : "opacity-0 invisible w-0"}`}>
                                {item.name}
                            </span>

                            {!isExpanded && (
                                <div className="absolute left-full ml-4 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 invisible group-hover:visible pointer-events-none transition-all whitespace-nowrap z-50 shadow-lg">
                                    {item.name}
                                </div>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* User Profile & Logout */}
                <div className="p-3 border-t border-border bg-muted/50">
                    <button
                        type="button"
                        onClick={openProfileModal}
                        className={`w-full flex items-center transition-all duration-300 mb-4 rounded-xl hover:bg-muted/70 ${isExpanded ? "px-1 py-1 gap-3" : "justify-center py-1"}`}
                    >
                        <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary font-bold text-sm flex-shrink-0 shadow-sm">
                            {initials}
                        </div>
                        <div className={`text-left overflow-hidden transition-all duration-300 ${isExpanded ? "opacity-100 w-full" : "opacity-0 w-0"}`}>
                            <p className="text-xs font-bold text-foreground truncate">{user?.username || "Utilisateur"}</p>
                            <p className="text-[10px] text-muted-foreground truncate font-medium">{roleLabel}</p>
                        </div>
                    </button>

                    <button
                        onClick={logout}
                        className={`flex items-center justify-center transition-all duration-300 rounded-xl border border-destructive/20 text-destructive hover:bg-destructive hover:text-white group relative ${isExpanded ? "w-full py-2.5 px-3 gap-2" : "w-10 h-10 mx-auto"}`}
                    >
                        <LogOut className={`flex-shrink-0 ${isExpanded ? "w-4 h-4" : "w-5 h-5"}`} />
                        <span className={`font-bold text-xs whitespace-nowrap transition-all duration-300 ${isExpanded ? "opacity-100" : "opacity-0 invisible w-0"}`}>
                            Deconnexion
                        </span>

                        {!isExpanded && (
                            <div className="absolute left-full ml-4 px-2 py-1 bg-destructive text-white text-xs rounded opacity-0 group-hover:opacity-100 invisible group-hover:visible pointer-events-none transition-all whitespace-nowrap z-50 shadow-lg">
                                Deconnexion
                            </div>
                        )}
                    </button>
                </div>
            </div>

            {isProfileOpen && (
                <div
                    className="fixed inset-0 bg-foreground/10 flex items-center justify-center z-50 backdrop-blur-md transition-all duration-300"
                    onClick={closeProfileModal}
                >
                    <div
                        className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold text-foreground mb-2">Profil utilisateur</h3>
                        <p className="text-sm text-muted-foreground mb-5">Consulter et modifier vos informations.</p>

                        {profileError && (
                            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
                                {profileError}
                            </div>
                        )}

                        <form onSubmit={saveProfile} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Nom d'utilisateur</label>
                                <div className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-semibold text-foreground">
                                    {user?.username || "-"}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Email</label>
                                <div className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-semibold text-foreground">
                                    {user?.email || "-"}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Nouveau mot de passe (optionnel)</label>
                                <input
                                    name="password"
                                    type="password"
                                    value={profileForm.password}
                                    onChange={onProfileInput}
                                    className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-semibold text-foreground outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Role</label>
                                <div className="w-full px-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-semibold text-foreground">
                                    {roleLabel}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeProfileModal}
                                    disabled={profileLoading}
                                    className="px-4 py-2 rounded-xl bg-muted text-muted-foreground font-bold hover:bg-muted/80 transition-colors disabled:opacity-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={profileLoading}
                                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all disabled:opacity-50"
                                >
                                    {profileLoading ? "Enregistrement..." : "Enregistrer"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
