import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { AuthRoutes } from "../routers/router";


const Layout = () =>
{
	return (
		<React.Fragment>
			<Routes>
				<Route>
					{ AuthRoutes.map( ( route, idx ) => (
						<Route
							path={ route.path }
							element={ route.component}
							key={ idx }
							exact={ true }
						/>
					) ) }
				</Route>
			</Routes>
		</React.Fragment>
	);
};

export default Layout;
