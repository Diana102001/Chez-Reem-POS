import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/common/Loader";
import { createUser, deleteUser, getUsers } from "../services/userService";

const emptyForm = {
    username: "",
    email: "",
    password: "",
    role: "cashier",
};

const Users = () => {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (err) {
            console.error("Failed to fetch users:", err);
            setError("Impossible de charger les utilisateurs.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const newUser = await createUser(form);
            setUsers((prev) => [...prev, newUser]);
            setForm(emptyForm);
        } catch (err) {
            console.error("Failed to create user:", err);
            const backendError =
                err.response?.data?.username?.[0] ||
                err.response?.data?.email?.[0] ||
                err.response?.data?.password?.[0] ||
                err.response?.data?.detail ||
                "Impossible de creer l'utilisateur.";
            setError(backendError);
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = (target) => {
        setDeleteTarget(target);
    };

    const handleDeleteUser = async () => {
        if (!deleteTarget) return;
        try {
            await deleteUser(deleteTarget.id);
            setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
            setDeleteTarget(null);
        } catch (err) {
            console.error("Failed to delete user:", err);
            setError("Impossible de supprimer l'utilisateur.");
        }
    };

    if (loading) return <Loader text="Chargement des utilisateurs" />;

    return (
        <div className="bg-card p-6 rounded-xl shadow h-full flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">Utilisateurs</h2>
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
                    {error}
                </div>
            )}

            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Nom d'utilisateur"
                    required
                    className="px-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-semibold text-foreground outline-none"
                />
                <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                    className="px-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-semibold text-foreground outline-none"
                />
                <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Mot de passe"
                    required
                    className="px-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-semibold text-foreground outline-none"
                />
                <div className="flex gap-2">
                    <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="flex-1 px-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-semibold text-foreground outline-none"
                    >
                        <option value="cashier">Caissier</option>
                        <option value="admin">Admin</option>
                    </select>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
                    >
                        {saving ? "Ajout..." : "Ajouter"}
                    </button>
                </div>
            </form>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="py-3 px-4 font-semibold text-muted-foreground">Nom</th>
                            <th className="py-3 px-4 font-semibold text-muted-foreground">Email</th>
                            <th className="py-3 px-4 font-semibold text-muted-foreground">Role</th>
                            <th className="py-3 px-4 font-semibold text-muted-foreground text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id} className="border-b border-border hover:bg-muted/50">
                                <td className="py-3 px-4 font-bold text-foreground">{u.username}</td>
                                <td className="py-3 px-4 text-foreground">{u.email || "-"}</td>
                                <td className="py-3 px-4">
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-secondary/10 text-secondary uppercase tracking-wider">
                                        {u.role === "admin" || u.is_superuser ? "Admin" : "Caissier"}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <button
                                        onClick={() => confirmDelete(u)}
                                        disabled={u.id === user?.id}
                                        className="px-3 py-1 bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100 transition-colors text-sm font-bold shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                        Aucun utilisateur trouve.
                    </div>
                )}
            </div>

            {deleteTarget && (
                <div
                    className="fixed inset-0 bg-foreground/10 flex items-center justify-center z-50 backdrop-blur-md transition-all duration-300"
                    onClick={() => setDeleteTarget(null)}
                >
                    <div
                        className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold text-foreground mb-2">Supprimer l'utilisateur</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Confirmer la suppression de "{deleteTarget.username}" ?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2 rounded-xl bg-muted text-muted-foreground font-bold hover:bg-muted/80 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteUser}
                                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
