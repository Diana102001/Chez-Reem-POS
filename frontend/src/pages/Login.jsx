import { useState, useContext } from "react";
// import API from "../api"; // Not needed directly anymore
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const { login } = useContext(AuthContext);
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        const result = await login(username, password);
        if (result.success) {
            navigate("/");
        } else {
            setError(result.message || "Invalid credentials");
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gray-100">
            <form
                onSubmit={handleLogin}
                className="bg-white p-8 rounded-2xl shadow-xl w-96"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">
                    Restaurant POS Login
                </h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <input
                    type="text"
                    placeholder="Username"
                    className="w-full p-3 mb-4 border rounded-lg"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-3 mb-6 border rounded-lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button className="w-full bg-black text-white p-3 rounded-lg hover:bg-gray-800">
                    Login
                </button>
            </form>
        </div>
    );
}
