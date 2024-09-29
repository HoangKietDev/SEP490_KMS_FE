import LoginPage from "../page/auth/login";
import HomePage from "../page/homepage/homepage";
export const Routers = [
	{
		path: "/homepage",
		component: <HomePage />
	},
	
	{ path: "/", component: <HomePage /> },

];

export const AuthRoutes = [
	{ path: "/login", component: <LoginPage /> }
]