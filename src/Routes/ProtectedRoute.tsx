import { Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const location = useLocation();

    useEffect(() => {
        const verifyAuthorization = () => {
            const accessToken = Cookies.get('accessToken');

            if (accessToken) {
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        };

        verifyAuthorization();
    }, []);

    if (isAuthorized === null) {
        return null;
    }

    if (isAuthorized === false) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
