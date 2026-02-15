import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Order from "../pages/Order";

const Dashboard = () => <div>Dashboard Page</div>;
const Orders = () => <div>Orders Page</div>;
const Products = () => <div>Products Page</div>;
// const Order = () => <div>Order Page</div>;

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/order" element={<Order />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
