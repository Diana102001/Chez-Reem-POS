import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import '../App.css'

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <AppRoutes />
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;