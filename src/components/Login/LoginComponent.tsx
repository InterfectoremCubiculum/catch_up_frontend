import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../axiosConfig';
import { useAuth } from '../../Provider/authProvider';
import { jwtDecode } from 'jwt-decode';

const LoginComponent = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { setAccessToken, setRefreshToken, setUser } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Step 1: Login and get access token
            const response = await axiosInstance.post('Auth/Login', { email, password });
            const { accessToken, refreshToken } = response.data;
            setAccessToken(accessToken);
            setRefreshToken(refreshToken);

            // Step 2: Decode token to get user ID
            const decodedToken: any = jwtDecode(accessToken);
            const userId = decodedToken.nameid;

            // Step 3: Fetch user details using the ID
            const userResponse = await axiosInstance.get(`User/GetById/${userId}`);
            const userData = userResponse.data;
            setUser(userData);

            navigate('/');
        } catch (err) {
            setError('Invalid email or password');
            setAccessToken(null);
            setRefreshToken(null);
            setUser(null);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#101010' }}>
            <div className="card shadow-lg p-4" style={{ width: '400px' }}>
                <h2 className="text-center mb-4">Login</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Login</button>
                </form>
            </div>
        </div>
    );
};

export default LoginComponent;