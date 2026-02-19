// src/components/layout/Navbar.jsx
import { useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Sun, Moon } from "lucide-react";

const Navbar = () => {
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const { user } = useContext(AuthContext);
    const roleLabel = user?.role === "admin" || user?.is_superuser ? "administrateur" : "caissier";

    const getPageTitle = () => {
        switch (location.pathname) {
            case "/":
                return "Tableau de bord";
            case "/orders":
                return "Historique des commandes";
            case "/order":
                return "Commander";
            case "/products":
                return "Produits";
            case "/categories":
                return "Categories";
            case "/users":
                return "Utilisateurs";
            default:
                return "Systeme de caisse";
        }
    };

    return (
        <div className="h-20 bg-card shadow-sm flex items-center justify-between px-6 border-b border-border">
            {/* Page Title */}
            <h2 className="text-lg font-semibold text-foreground">
                {getPageTitle()}
            </h2>

            {/* User Section */}
            <div className="flex items-center gap-4">
                <span className="text-muted-foreground text-sm">
                    Vous etes connecte en tant que {roleLabel}
                </span>

                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 hover:bg-muted/80"
                    title={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
                >
                    {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
            </div>
        </div>
    );
};

export default Navbar;
