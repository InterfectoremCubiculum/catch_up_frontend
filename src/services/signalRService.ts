import * as signalR from "@microsoft/signalr";
import axiosInstance from "../../axiosConfig";
import Cookies from "js-cookie";

const API_URL = axiosInstance.defaults.baseURL?.toString().replace('/api/', '');
const HUB_URL = API_URL + "/notificationHub";

const getAccessToken = () => {
    return Cookies.get("refreshToken");
};

const connection = new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL, {
        accessTokenFactory: () => {
            const token = getAccessToken();
            if (!token) {
                throw new Error('JWT token is missing');
            }
            return token;
        },
        withCredentials: true,
        headers: {
            "Authorization": `Bearer ${getAccessToken()}` 
        },
        transport: signalR.HttpTransportType.WebSockets,
    })
    .withAutomaticReconnect()
    .build();

const startConnection = async () => {
    if (connection.state === signalR.HubConnectionState.Disconnected) {
        try {
            await connection.start();
            console.log("✅ SignalR connected");
        } catch (err) {
            console.error("❌ SignalR error:", err);
            setTimeout(startConnection, 5000);
        }
    } else {
        console.log("Connection state:", connection.state);
    }
};

connection.onclose(() => {
    console.warn("🔴 SignalR disconnected, reconnecting...");
    setTimeout(startConnection, 5000);
});

export { connection, startConnection };