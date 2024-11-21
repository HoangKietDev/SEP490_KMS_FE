import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import axios from "axios";
import { withRouter } from "react-router-dom/cjs/react-router-dom.min";

class GradeCreate extends React.Component {

    state = {
        name: '',
        baseTuitionfee: null,
        grades: [], // Chứa danh sách các grade
    };
    componentDidMount() {
        window.scrollTo(0, 0);
    }

    handleCreatGrade = async (event) => {
        event.preventDefault(); // Ngăn hành vi mặc định của form
        const values = {
            name: this.state.name,
            baseTuitionfee: this.state.baseTuitionfee,
        };
        try {
            const response = await axios.post(
                "http://localhost:5124/api/Grade/AddGrade", values
            );
            alert("Tạo Khối lớp thành công!"); // User-friendly success message
            this.props.history.push('/grade'); // Redirect to category list after successful update
        } catch (error) {
            console.error("Lỗi khi tạo Khối lớp:", error);
            alert("Lỗi khi tạo Khối lớp!"); // User-friendly error message
        }
    };

    render() {
        const { name, baseTuitionfee } = this.state;

        return (
            <div
                style={{ flex: 1 }}
                onClick={() => {
                    document.body.classList.remove("offcanvas-active");
                }}
            >
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
                                <div className="card">
                                    <div className="header text-center">
                                        <h4>Create New Grade</h4>
                                    </div>
                                    <div className="body">
                                        <form onSubmit={this.handleCreatGrade}>
                                            <div className="row">
                                                <div className="form-group col-md-12 d-flex flex-column">
                                                    <label>Name</label>
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
                                            <div className="text-center">
                                                <button type="submit" className="btn btn-success">
                                                    Create Grade
                                                </button>
                                            </div>
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
