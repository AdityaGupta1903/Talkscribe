import * as React from "react"
import { Navigate, Outlet } from "react-router-dom"
import { Controller } from "../api/function"

const ProtectedRoute: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null); // null = loading

    React.useEffect(() => {
        const setIsAuth = async () => {
            const res = await Controller.isUserAuthenticated();
            setIsAuthenticated(res);
        };
        setIsAuth();
    }, []);

    if (isAuthenticated === null) {
        // or show a spinner here
        return <div>Loading...</div>;
    }

    return isAuthenticated ? <Outlet /> : <Navigate to='/' />;
};

export default ProtectedRoute;