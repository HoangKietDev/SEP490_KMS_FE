import React from "react";
import { Route, Redirect } from "react-router-dom";

// Utility function to get token and roleId
const getAuthDetails = () => {
    const user = localStorage.getItem("user"); // Assuming the user details (like roleId) are stored here
    if (user) {
        const parsedUser = JSON.parse(user); // Parse user to get roleId
        return { user, roleId: parsedUser.user.roleId }; // Returns roleId if available
    }
    return { user:null, roleId: null }; // Returns null if not logged in
};

// Higher-order component to protect routes based on role
const ProtectedRoute = ({ component: Component, allowedRoles, ...rest }) => {
    const { user, roleId } = getAuthDetails();

    return (
        <Route
            {...rest}
            render={(props) =>
                user && allowedRoles.includes(roleId) ? (
                    <Component {...props} />
                ) : !user ? (
                    <Redirect to={`${process.env.PUBLIC_URL}/login`} /> // Not authenticated
                ) : (
                    <Redirect to={`${process.env.PUBLIC_URL}/page404`} /> // Authenticated but role not allowed
                )
            }
        />
    );
};

export default ProtectedRoute;
