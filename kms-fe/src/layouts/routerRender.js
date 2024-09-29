import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { AuthRoutes, Routers } from "../routers/router";

const LayOutPage = React.lazy( () => import( './layOutPage' ) )

const Layout = () => {
	return (
		<React.Fragment>
			<Routes>
				<Route>
					{Routers.map((route, idx) => (
						<Route
							path={route.path}
							element={<LayOutPage {...route}>{route.component}</LayOutPage>}
							key={idx}
							exact={true}
						/>
					))}
				</Route>
				<Route>
					{AuthRoutes.map((route, idx) => (
						<Route
							path={route.path}
							element={route.component}
							key={idx}
							exact={true}
						/>
					))}
				</Route>
			</Routes>
		</React.Fragment>
	);
};

export default Layout;
