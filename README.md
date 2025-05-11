# Catch-Up Frontend

## Overview

Catch-Up Frontend is a web application designed to assist with onboarding. This project represents only the frontend part of the entire application.
The complete system also includes:

- [Backend](https://github.com/InterfectoremCubiculum/catch_up_Backend) built with .NET
- [Mobile app](https://github.com/InterfectoremCubiculum/catch_up_Mobile) developed using .NET MAUI
  

## Features
- [Application preview](#Application_preview)
- [Authentication and User managment](#User_management)
- [Task Management]
- [Roadmap Management]
- [Schooling Management]
- [Material Management]
- [Preset Management]
- [Feedback System]
- [Notifications]
- [Dark and Light Theme Support]
- [Localization]
- [Admin Tools]
- [Drag-and-Drop Functionality]

## Application preview
<details>
<summary>See more</summary>

</details>



## Technologies Used

- React
- TypeScript
- Vite
- [Bootstrap](https://getbootstrap.com/)
- [DnD Kit](https://dndkit.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- React Context APi
- Axios
- js-cookie
- LocalStorage


## User management
AuthProvider.tsx is a React Context Provider that manages user authentication, including access tokens, refresh tokens, user details, roles, and avatars. It provides a centralized way to handle authentication across the application using React Context API, Redux, Axios, Cookies, and LocalStorage.

### Features
✅ Global Authentication State – Manages user authentication data across the app.\
✅ Secure Token Storage – Uses Cookies to store access and refresh tokens.\
✅ User Role Management – Fetches and caches user roles from the API.\
✅ Avatar Handling – Downloads and stores user avatars in LocalStorage.\
✅ Session Management – Handles login, logout, and token updates.\
✅ Redux Integration – Dispatches actions upon logout (e.g., clearing user tasks).

<details>
<summary>How It Works?</summary>

#### Initializing Authentication State
On component mount, retrieves:
- accessToken & refreshToken from Cookies.
- user data from Cookies.
- avatar from LocalStorage.
```tsx
const [accessToken, setAccessToken_] = useState<string | null>(Cookies.get('accessToken') || null);
const [refreshToken, setRefreshToken_] = useState<string | null>(Cookies.get('refreshToken') || null);
const [user, setUser_] = useState<User | null>(() => {
    const storedUser = Cookies.get('user');
    return storedUser ? JSON.parse(storedUser) : null;
});
const [avatar, setAvatar] = useState<string | null>(loadStoredAvatar());
```
#### Managing Authentication Tokens
- Set Access Token: Stores token in Cookies when a user logs in.
- Set Refresh Token: Stores refresh token for session persistence.
- Remove Tokens on Logout: Deletes them from Cookies.
```tsx
    const setAccessToken = (newToken: string | null) => {
        setAccessToken_(newToken);
        if (newToken) {
            Cookies.set('accessToken', newToken, {
                path: '/',
                secure: true
            });
        } else {
            Cookies.remove('accessToken');
        }
    };
```
#### Managing User Data
- Saves user details in Cookies on login.
- Removes user data on logout.
- Fetches and stores user avatars using LocalStorage.
```tsx
   const setUser = (newUser: User | null) => {
        if (newUser) {
            const { ...userToStore } = newUser;
            Cookies.set('user', JSON.stringify(userToStore), {
                path: '/',
                secure: true
            });
            setUser_(userToStore);
            if (userToStore.avatarId) {
                fetchAndStoreAvatar(userToStore.avatarId);
            }
        } else {
            Cookies.remove('user');
            localStorage.removeItem('userAvatar');
            setAvatar(null);
            setUser_(null);
        }
    };
```
#### User Role Management
Fetches the user role from API and caches it to avoid redundant requests.
```tsx
  const getRole = async (userId: string): Promise<string> => {
        if (!userId) { throw new Error("Invalid userId");}
        try {
            const response = await axiosInstance.get(`User/GetRole/${userId}`);
            const role = response.data || "User";

            setRoleCache(role);
            return role;
        } catch (error) {  throw new Error("Failed to fetch user role");}
    };
```
#### Logout Functionality
- Clears all authentication-related data, including Redux state.
```tsx
const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    setRoleCache("");
    localStorage.removeItem('userAvatar');
    dispatch(clearTasks());
};
```
#### Usage
Wrapping the App with AuthProvider
- Include AuthProvider in the root component (main.tsx) to provide authentication context across the app.
```tsx
<AuthProvider>
    <App />
</AuthProvider>
```
</details>
