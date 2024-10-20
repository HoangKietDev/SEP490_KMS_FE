import React from "react";
import { connect } from "react-redux";
import { Route, Switch, withRouter } from "react-router-dom";
import Login from "./screens/Login";
import dashboard from "./screens/Dashbord/Dashbord";
import demographic from "./screens/Dashbord/Demographic";
import ioT from "./screens/Dashbord/IoT";
import NavbarMenu from "./components/NavbarMenu";
import forgotpassword from "./screens/Auth/ForgotPassword";
import resetpassword from "./screens/Auth/ResetPassword";
import page404 from "./screens/Auth/Page404";
import maintanance from "./screens/Pages/Maintanance";
import viewclass from "./screens/Class/ViewClass";
import createclass from "./screens/Class/CreateClass";
import updateclass from "./screens/Class/UpdateClass";
import viewallstudent from "./screens/Children/ViewAllChildren";
import viewstudentbyID from "./screens/Children/ViewChildrenByID"
import createstudent from "./screens/Children/AddChildren"
import Category from "./screens/CategoryService/Category";
import CategoryCreate from "./screens/CategoryService/CategoryCreate";
import CategoryDetail from "./screens/CategoryService/CategoryDetail";
import CategoryUpdate from "./screens/CategoryService/CategoryUpdate";
import Service from "./screens/Service/Service";
import ServiceCreate from "./screens/Service/ServiceCreate";
import ServiceDetail from "./screens/Service/ServiceDetail";
import ServiceUpdate from "./screens/Service/ServiceUpdate";
import TeacherDetail from "./screens/Teacher/TeacherDetail";
import TeacherList from "./screens/Teacher/TeacherList";
import TeacherUpdate from "./screens/Teacher/TeacherUpdate";
import RequestList from "./screens/Request/RequestList";
import RequestDetail from "./screens/Request/RequestDetail";
import RequestUpdate from "./screens/Request/RequestUpdate";
import RequestCreate from "./screens/Request/RequestCreate";
import ViewMenu from "./screens/Menu/ViewMenu"
import ProtectedRoute from "./components/Router/ProtectRouter";
import Schedule from "./screens/Schedule/Schedule";


window.__DEV__ = true;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoad: true,
    };
  }
  render() {

    var res = window.location.pathname;
    var baseUrl = process.env.PUBLIC_URL;
    baseUrl = baseUrl.split("/");
    res = res.split("/");
    res = res.length > 0 ? res[baseUrl.length] : "/";
    res = res ? res : "/";
    const activeKey1 = res;

    return (
      <div id="wrapper">
        {activeKey1 === "" ||
          activeKey1 === "/" ||
          activeKey1 === "login" ||
          activeKey1 === "forgotpassword" ||
          activeKey1 === "resetpassword" ||
          activeKey1 === "page404" ||
          activeKey1 === "maintanance" ? (
          <Switch>
            <Route exact path={`${process.env.PUBLIC_URL}/`} component={Login} />
            <Route exact path={`${process.env.PUBLIC_URL}/login`} component={Login} />
            <Route exact path={`${process.env.PUBLIC_URL}/forgotpassword`} component={forgotpassword} />
            <Route exact path={`${process.env.PUBLIC_URL}/resetpassword`} component={resetpassword} />
            <Route exact path={`${process.env.PUBLIC_URL}/page404`} component={page404} />
            <Route exact path={`${process.env.PUBLIC_URL}/maintanance`} component={maintanance} />
          </Switch>
        ) : (
          <>
            <NavbarMenu history={this.props.history} activeKey={activeKey1} />
            <div id="main-content">
              <Switch>
                <ProtectedRoute
                  exact
                  path={`${process.env.PUBLIC_URL}/dashboard`}
                  component={dashboard}
                  allowedRoles={[1, 3]}
                />
                <ProtectedRoute
                  exact
                  path={`${process.env.PUBLIC_URL}/category`}
                  component={Category}
                  allowedRoles={[3]}
                />
                <ProtectedRoute
                  exact
                  path={`${process.env.PUBLIC_URL}/create-category`}
                  component={CategoryCreate}
                  allowedRoles={[3]}
                />
                <ProtectedRoute
                  exact
                  path={`${process.env.PUBLIC_URL}/category-detail/:categoryServiceId`}
                  component={CategoryDetail}
                  allowedRoles={[3]}

                />
                <ProtectedRoute
                  exact
                  path={`${process.env.PUBLIC_URL}/category-update/:categoryServiceId`}
                  component={CategoryUpdate}
                  allowedRoles={[3]}
                />
                <ProtectedRoute
                  exact
                  path={`${process.env.PUBLIC_URL}/service`}
                  component={Service}
                  allowedRoles={[2, 3, 4]}
                />
                <ProtectedRoute
                  exact
                  path={`${process.env.PUBLIC_URL}/create-service`}
                  component={ServiceCreate}
                  allowedRoles={[3]}
                />
                <ProtectedRoute
                  exact
                  path={`${process.env.PUBLIC_URL}/service-detail/:serviceId`}
                  component={ServiceDetail}
                  allowedRoles={[2, 3, 4]}
                />
                <ProtectedRoute
                  exact
                  path={`${process.env.PUBLIC_URL}/service-update/:serviceId`}
                  component={ServiceUpdate}
                  allowedRoles={[3, 4]}
                />
                <ProtectedRoute
                  exact
                  path={`${process.env.PUBLIC_URL}/teacher`}
                  component={TeacherList}
                  allowedRoles={[3]}
                />
                <ProtectedRoute
                  exact
                  path={`${process.env.PUBLIC_URL}/teacher-detail/:teacherId`}
                  component={TeacherDetail}
                  allowedRoles={[2, 3, 5]}

                />
                <ProtectedRoute
                  exact
                  path={`${process.env.PUBLIC_URL}/teacher-update/:teacherId`}
                  component={TeacherUpdate}
                  allowedRoles={[3]}
                />
                <ProtectedRoute
                  exact
                  path={`${process.env.PUBLIC_URL}/request`}
                  component={RequestList}
                  allowedRoles={[2, 3, 4]}
                />
                <ProtectedRoute
                  exact
                  path={`${process.env.PUBLIC_URL}/request-detail/:requestId`}
                  component={RequestDetail}
                  allowedRoles={[2, 3, 4]}
                />
                <ProtectedRoute
                  exact
                  path={`${process.env.PUBLIC_URL}/request-update/:requestId`}
                  component={RequestUpdate}
                  allowedRoles={[2, 3, 4]}
                />
                <ProtectedRoute
                  exact
                  path={`${process.env.PUBLIC_URL}/create-request`}
                  component={RequestCreate}
                  allowedRoles={[2]}
                />
                <ProtectedRoute
                  exact
                  path={`${process.env.PUBLIC_URL}/viewallstudent`}
                  component={viewallstudent}
                  allowedRoles={[2, 3]}
                />
                <ProtectedRoute
                  exact
                  path={`${process.env.PUBLIC_URL}/createstudent`}
                  component={createstudent}
                  allowedRoles={[2, 3]}
                />
                <ProtectedRoute
                  exact
                  path={`${process.env.PUBLIC_URL}/viewstudentbyID/:studentID`}
                  component={viewstudentbyID}
                />
                <ProtectedRoute
                  exact
                  path={`${process.env.PUBLIC_URL}/viewclass`}
                  component={viewclass}
                  allowedRoles={[2, 3, 5]}
                />
                <ProtectedRoute
                  exact
                  path={`${process.env.PUBLIC_URL}/createclass`}
                  component={createclass}
                  allowedRoles={[3]}
                />
                <ProtectedRoute
                  exact
                  path={`${process.env.PUBLIC_URL}/updateclass/:classId`}
                  component={updateclass}
                  allowedRoles={[3, 4]}
                />
                <ProtectedRoute
                  exact
                  path={`${process.env.PUBLIC_URL}/viewmenu`}
                  component={ViewMenu}
                  allowedRoles={[2, 4]}
                />


                <ProtectedRoute
                  exact
                  path={`${process.env.PUBLIC_URL}/schedule`}
                  component={Schedule}
                  allowedRoles={[2, 3, 4]}
                />
              </Switch>
            </div>
          </>
        )}
      </div>
    );
  }
}

const mapStateToProps = ({ loginReducer }) => ({
  isLoggedin: loginReducer.isLoggedin,
});

export default withRouter(connect(mapStateToProps, {})(App));
