import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import axios from "axios";
import { withRouter } from "react-router-dom/cjs/react-router-dom.min";
import Notification from "../../components/Notification";

class GradeCreate extends React.Component {

    state = {
        name: '',
        description: '',
        baseTuitionfee: null,
        grades: [], // Chứa danh sách các grade

        showNotification: false, // Để hiển thị thông báo
        notificationText: "", // Nội dung thông báo
        notificationType: "success", // Loại thông báo (success/error)
    };
    componentDidMount() {
        window.scrollTo(0, 0);
    }

    handleCreatGrade = async (event) => {
        event.preventDefault(); // Ngăn hành vi mặc định của form
        const values = {
            name: this.state.name,
            description: this.state.description,
            baseTuitionfee: this.state.baseTuitionfee,
        };
        try {
            const response = await axios.post(
                "http://localhost:5124/api/Grade/AddGrade", values
            );
            this.setState({
                notificationText: "Grade create successfully!",
                notificationType: "success",
                showNotification: true,
            });
            setTimeout(() => {
                if (this.state.showNotification) {
                    this.props.history.push('/grade');
                }
            }, 1000);
        } catch (error) {
            const errormess = error?.response?.data?.errors?.BaseTuitionFee
            console.log(errormess);
            this.setState({
                notificationText: errormess[0] || "Grade Create Error",
                notificationType: "error",
                showNotification: true,
            });
        }
    };

    render() {
        const { name, description, baseTuitionfee } = this.state;
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
                            HeaderText="New Grade"
                            Breadcrumb={[
                                { name: "Grade", navigate: "grade" },
                                { name: "New Grade", navigate: "" },
                            ]}
                        />
                        <div className="row clearfix">
                            <div className="col-md-12">
                                <div className="card shadow-lg">
                                    <div className="card-header text-white theme-colorbg">
                                        <h4 className="mb-0">Create Grade</h4>
                                    </div>
                                    <div className="body">
                                        <form onSubmit={this.handleCreatGrade}>
                                            <div className="row">
                                                <div className="form-group col-md-12 d-flex flex-column">
                                                    <label>Grade Name</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={name}
                                                        onChange={(e) => this.setState({ name: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="form-group col-md-12 d-flex flex-column">
                                                    <label>Grade Description</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={description}
                                                        onChange={(e) => this.setState({ description: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="form-group col-md-12 d-flex flex-column">
                                                    <label>Base Tuition Fee</label>
                                                    <input
                                                        type="Number"
                                                        className="form-control"
                                                        value={baseTuitionfee}
                                                        onChange={(e) => this.setState({ baseTuitionfee: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <br />
                                            <a href="grade" className="btn btn-success text-center">Back to Grade List</a>
                                            <button type="submit" className="btn btn-primary ml-4">Create Grade</button>
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


export default withRouter(GradeCreate);
