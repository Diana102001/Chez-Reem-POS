import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Loader from "../components/common/Loader";

export default function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useContext(AuthContext);
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            const result = await login(username, password);
            if (result.success) {
                navigate("/");
            } else {
                setError(result.message || "Identifiants invalides");
                setIsSubmitting(false);
            }
        } catch (err) {
            setError("Une erreur inattendue s'est produite");
            setIsSubmitting(false);
        }
    };

    if (isSubmitting) return <Loader fullScreen text="Bienvenue" />;

    return (
        <div className="h-screen flex items-center justify-center bg-background">
            <form
                onSubmit={handleLogin}
                className="bg-card p-8 rounded-2xl shadow-xl w-96"
            >
                <h2 className="text-2xl font-bold mb-6 text-center text-foreground">
                    Connexion à la caisse POS
                </h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <input
                    type="text"
                    placeholder="Nom d'utilisateur"
                    className="w-full p-3 mb-4 border border-border rounded-lg bg-muted/50 text-foreground"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Mot de passe"
                    className="w-full p-3 mb-6 border border-border rounded-lg bg-muted/50 text-foreground"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    type="submit"
                    className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                >
                    Se connecter
                </button>
            </form>
        </div>
    );
}
