# Catch-Up Frontend

## Overview

Catch-Up Frontend is a web application designed to assist with onboarding. This project represents only the frontend part of the entire application.
The complete system also includes:

- [Backend](https://github.com/InterfectoremCubiculum/catch_up_Backend) built with .NET
- [Mobile app](https://github.com/InterfectoremCubiculum/catch_up_Mobile) developed using .NET MAUI
  

## Features
- [Application preview](#application-preview)
- [Authentication and User managment](#user-management)
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
  
  ### Home (Admin Panel)
  <img src="https://github.com/user-attachments/assets/dab24a40-dc9f-4aa9-9eba-1cce05cadbef">

  ### Notifications
  #### View unread messages
  <img src="https://github.com/user-attachments/assets/4373ede2-3153-4fe8-b6c3-dceef743e5d1">\
  
  <img src="https://github.com/user-attachments/assets/8e6683e4-e82d-4baf-828e-30ed8c7db178">\
  
  #### Popup A WebSocket connection listens for new notifications from the backend.
  <img src="https://github.com/user-attachments/assets/8d2279a2-1238-4cfa-b012-8df1a44bda28">

  #### Notification component
  <img src="https://github.com/user-attachments/assets/68a201b4-b0e5-43b2-9a67-d089121aeb8a">

  ### Task Manager with drag and drop
  <img src="https://github.com/user-attachments/assets/8738c25f-6400-4e57-a0a3-210d3bc9f88d">

  ### Road Maps
  <img src="https://github.com/user-attachments/assets/49be814c-c59b-4997-8678-e5a45b2d6269">\
  <img src="https://github.com/user-attachments/assets/9ef307cc-ec2d-45d6-8b63-17d6aa367072">

  ### Setting
  <img src="https://github.com/user-attachments/assets/f86aa658-0822-4549-863a-ffdd2dcba03c">

  ### AI assistant
  <img src="https://github.com/user-attachments/assets/6eec3d3d-3a28-487d-9513-246b158097f1">

  ### Feedbacks (In some components you can send feedbacks)
  <img src="https://github.com/user-attachments/assets/df66c747-b36c-42ce-9815-f2c64c09d6a7">
  <img src="https://github.com/user-attachments/assets/3289e350-3780-47e4-91e5-1de559781b13">

  ### FAQ
  <img src="https://github.com/user-attachments/assets/240e12be-f977-45d7-8201-65ab9c6d744d">

  ### Material Management
  <img src="https://github.com/user-attachments/assets/fc527fd4-14f2-4783-8a91-4607df632cf2">\
  <img src="https://github.com/user-attachments/assets/1ec5a7db-6855-49ab-bd2d-098d5da6e46b">\
  <img src="https://github.com/user-attachments/assets/e4d1b23b-3253-423b-abda-cb84ede5050f">\
  <img src="https://github.com/user-attachments/assets/c84dd2d6-384b-4435-bf78-a9a83c2971ab">\
  <img src="https://github.com/user-attachments/assets/beaf05af-82d5-477b-b53c-78889a2e6ebb">\

</details>



## Technologies Used

- React
- TypeScript
- Vite
- React Router
- [React-Bootstrap](https://react-bootstrap.netlify.app/)
- [Bootstrap](https://getbootstrap.com/)
- [DnD Kit](https://dndkit.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- React Context APi
- Axios
- js-cookie
- [i18next](https://www.i18next.com/) - For internationalization and localization support.
- LocalStorage
- [Confetti](https://www.npmjs.com/package/react-confetti) 🎉

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

#### In Progress
1 vs 6 solo doing read me :(
<img src="https://github.com/user-attachments/assets/1489816f-b51c-47af-97a9-f524f746e321">
<details>
<summary>POV: you are in the cinema and suddenly you have scenes after the credits</summary>
  me and my boys
  <img src="https://github.com/user-attachments/assets/2cd80f08-1f67-4eb5-a426-eb2254519a53">
  <img src="https://github.com/user-attachments/assets/fc76e6ef-cb67-4924-902d-e1131ed0c1d1">
  <img src="https://github.com/user-attachments/assets/50f17ad4-2714-4599-9cda-48235623b9a6">
  <img src="https://github.com/user-attachments/assets/6d7024b9-c9c2-4880-a552-cb0e69afbc61">
  <img src="https://github.com/user-attachments/assets/be4af822-cd41-4213-986f-e9e196174c6b">
  <img src="https://github.com/user-attachments/assets/9653b2e4-362e-4733-9d8d-3070b296840d">
  <img src="https://github.com/user-attachments/assets/722f5bd0-df1c-43a7-8688-8d8dd1a7c3f3">

</details>

