import React, { Suspense, useEffect, useState } from "react";
import { Navigation } from "../components/navigation";
import { Contact } from "../components/contact";


const LayOutPage = ( props ) =>
{
	return (
		<React.Fragment>
			<div className="main-content d-flex flex-column justify-content-between" style={ { height: '100vh' } }>
				<div className="page-content">
					<Navigation {...props} />
					{ props.children }
					<Contact />

				</div>
			</div>
		</React.Fragment>
	);
};

export default LayOutPage ;
