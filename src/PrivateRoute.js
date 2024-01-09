import { Navigate, Outlet } from "react-router-dom";
import Login from "./screens/Login";

export { PrivateRoute }

function PrivateRoute() {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
        return <Navigate to="/" />
    }
            return <Outlet />

}