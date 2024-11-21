import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import axios from "axios";
import { withRouter } from "react-router-dom/cjs/react-router-dom.min";
import Notification from "../../components/Notification";

class UserCreate extends React.Component {

    state = {
        semesterDetail: null,
        email: "",
        password: '',
        role: "",

        roleMap: {
            1: "Admin",
            2: "Parent",
            3: "Staff",
            4: "Principal",
            5: "Teacher",
        },

        showNotification: false, // State to control notification visibility
        notificationText: "", // Text for the notification
        notificationType: "success" // Type of notification (success or error)
    };
    componentDidMount() {
        window.scrollTo(0, 0);
    }

    handleCreatSemester = async (event) => {
        event.preventDefault(); // Ngăn hành vi mặc định của form
        const values = {
            Email: this.state.Email,
        };
        try {
            const response = await axios.post(
                "http://localhost:5124/api/Semester/AddSemester", values
            );
            this.setState({
                notificationText: "Semester Create successfully!",
                notificationType: "success",
                showNotification: true
            });
            setTimeout(() => {
                if (this.state.showNotification) {
                    this.props.history.push('/semester');
                }
            }, 1000);
        } catch (error) {
            let errorMessage = "An unexpected error occurred!";

            if (error.response?.data) {
                const fullMessage = error.response.data; // Lấy thông báo đầy đủ
                const startIndex = fullMessage.lastIndexOf(":") + 1; // Vị trí bắt đầu từ dấu `:`
                errorMessage = fullMessage.slice(startIndex).trim(); // Lấy phần sau dấu `:` và xóa khoảng trắng
            }
            this.setState({
                notificationText: errorMessage,
                notificationType: "error",
                showNotification: true
            });
        }
    };

    render() {
        const { email, password } = this.state;
        const { showNotification, notificationText, notificationType } = this.state;


        return (
            <div
                style={{ flex: 1 }}
                onClick={() => {
                    document.body.classList.remove("offcanvas-active");
                }}

            >
                {showNotification && (
                    <Notification
                        type={notificationType}
                        position="top-right"
                        dialogText={notificationText}
                        show={showNotification}
                        onClose={() => this.setState({ showNotification: false })}
                    />
                )}
                <div>
                    <div className="container-fluid">
                        <PageHeader
                            HeaderText="User Create"
                            Breadcrumb={[
                                { name: "UserList", navigate: "user" },
                                { name: "User Create", navigate: "" },
                            ]}
                        />
                        <div className="row clearfix">
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="body">
                                        <form onSubmit={this.handleCreatSemester}>
                                            <div className="row">
                                                <div className="form-group col-md-6">
                                                    <label>Enter Email </label>
                                                    <input
                                                        className={`form-control`}
                                                        value={email} // Bind value from state
                                                        name="email"
                                                        required
                                                        onChange={(e) => {
                                                            this.setState({
                                                                [e.target.name]: e.target.value,
                                                            });
                                                        }}
                                                    />
                                                </div>
                                                <div className="form-group  col-md-6">
                                                    <label>Enter Password</label>
                                                    <input
                                                        className={`form-control`}
                                                        value={password} // Bind value from state
                                                        name="password"
                                                        required
                                                        onChange={(e) => {
                                                            this.setState({
                                                                [e.target.name]: e.target.value,
                                                            });
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="row">
                                            <div className="form-group col-md-6">
                                                <label>Select Role</label>
                                                <select
                                                    className="form-control"
                                                    name="role"
                                                    value={this.state.role} // Bind value từ state
                                                    required
                                                    onChange={(e) => {
                                                        this.setState({ role: e.target.value });
                                                    }}
                                                >
                                                    <option value="" disabled>Select a Role</option>
                                                    {Object.entries(this.state.roleMap).map(([key, value]) => (
                                                        <option key={key} value={key}>
                                                            {value}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            </div>
                                            
                                            <br />
                                            <br />
                                            <button type="submit" className="btn btn-primary mr-4">Create Semester</button>
                                            <a href="semester" className="btn btn-success text-center">Back to Semester List</a>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


export default withRouter(UserCreate);
