import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Cookies from "js-cookie";

const axiosInstance = axios.create({
    baseURL: 'https://localhost:7097/api/',
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false; // flag to not allow multiple refreshesh cus async
let refreshSubscribers: ((token: string) => void)[] = [];

// refresh queue
const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
    refreshSubscribers.forEach(cb => cb(token));
    refreshSubscribers = [];
};

// Request interceptor
axiosInstance.interceptors.request.use(
    async (config) => {
        const accessToken = Cookies.get('accessToken');
        const refreshToken = Cookies.get('refreshToken');

        if (accessToken) {
            try {
                const decodedToken: any = jwtDecode(accessToken);
                const isAccessTokenExpired = decodedToken.exp * 1000 < Date.now();

                if (isAccessTokenExpired) {
                    if (!refreshToken) {
                        Cookies.remove('accessToken');
                        Cookies.remove('refreshToken');
                        Cookies.remove('user');
                        window.location.href = '/login';
                        throw new Error('No refresh token available');
                    }

                    const decodedRefreshToken: any = jwtDecode(refreshToken);
                    const isRefreshTokenExpired = decodedRefreshToken.exp * 1000 < Date.now();

                    if (isRefreshTokenExpired) {
                        Cookies.remove('accessToken');
                        Cookies.remove('refreshToken');
                        Cookies.remove('user');
                        window.location.href = '/login';
                        throw new Error('Refresh token expired');
                    }

                    // If we're not already refreshing, start the refresh process
                    if (!isRefreshing) {
                        isRefreshing = true;

                        try {
                            const response = await axios.post(
                                'https://localhost:7097/api/Auth/Refresh',
                                refreshToken,
                                {
                                    headers: {
                                        'Content-Type': 'application/json',
                                    }
                                }
                            );

                            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

                            Cookies.set('accessToken', newAccessToken, {
                                path: '/',
                                secure: true
                            });
                            Cookies.set('refreshToken', newRefreshToken, {
                                path: '/',
                                secure: true
                            });

                            onRefreshed(newAccessToken);
                            isRefreshing = false;

                            config.headers.Authorization = `Bearer ${newAccessToken}`;
                        } catch (refreshError) {
                            Cookies.remove('accessToken');
                            Cookies.remove('refreshToken');
                            Cookies.remove('user');
                            window.location.href = '/login';
                            isRefreshing = false;
                            throw refreshError;
                        }
                    } else {
                        return new Promise((resolve) => {
                            subscribeTokenRefresh((token) => {
                                config.headers.Authorization = `Bearer ${token}`;
                                resolve(config);
                            });
                        });
                    }
                }

                config.headers.Authorization = `Bearer ${accessToken}`;
                return config;
            } catch (error) {
                Cookies.remove('accessToken');
                Cookies.remove('refreshToken');
                Cookies.remove('user');
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error)
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
            Cookies.remove('user');

            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;