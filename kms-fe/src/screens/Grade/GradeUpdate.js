
import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import axios from "axios";
import { withRouter } from "react-router-dom/cjs/react-router-dom";

class CategoryUpdate extends React.Component {
    state = {
        gradeDetail: null,
        errorMessage: "",
        name: "", // Initialize with empty string
        baseTuitionFee: "", // Initialize with empty string
    };

    componentDidMount() {
        const { gradeId } = this.props.match.params; // Get categoryServiceId from URL
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:5124/api/Grade/GetGradeById/${gradeId}`);
                const data = response.data;

                this.setState({
                    gradeDetail: data,
                    name: data.name, // Set initial state from fetched data
                    baseTuitionFee: data.baseTuitionFee, // Set initial state from fetched data
                });
            } catch (error) {
                console.error('Error fetching category details:', error);
            }
        };

        fetchData();
    };

    handleSubmit = async (event) => {

        event.preventDefault(); // Make sure this is at the top

        if (!this.state.name) {
            this.setState({ submeet: true });
            return;
        }
        const updatedGrade = {
            gradeId: this.state.gradeDetail?.gradeId,
            name: this.state.name, // Use state instead of event target
            baseTuitionFee: this.state.baseTuitionFee, // Use state instead of event target
        };

        try {
            await axios.put(`http://localhost:5124/api/Grade/UpdateGrade`, updatedGrade, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            alert("Grade has been updated successfully!");
            this.props.history.push('/grade'); // Redirect to category list after successful update
        } catch (error) {
            console.error('Error updating grade:', error);
            this.setState({ errorMessage: 'Error updating grade' });
        }
    };

    render() {
        const { gradeDetail, name, baseTuitionFee } = this.state;

        return (
            <div style={{ flex: 1 }} onClick={() => document.body.classList.remove("offcanvas-active")}>
                <div>
                    <div className="container-fluid">
                        <PageHeader
                            HeaderText="Category Update"
                            Breadcrumb={[
                                { name: "Category", navigate: "grade" },
                                { name: "Category Update", navigate: "" },
                            ]}
                        />
                        <div className="row clearfix">
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="body">
                                        <form onSubmit={this.handleSubmit}>
                                            <div className="form-group">
                                                <label>Grade Name</label>
                                                <input
                                                    className={`form-control`}
                                                    value={name} // Bind value from state
                                                    name="name"
                                                    required
                                                    onChange={(e) => {
                                                        this.setState({
                                                            [e.target.name]: e.target.value,
                                                        });
                                                    }}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Base Tuition Fee</label>
                                                <input
                                                    className={`form-control`}
                                                    value={baseTuitionFee} // Bind value from state
                                                    name="baseTuitionFee"
                                                    required
                                                    onChange={(e) => {
                                                        this.setState({
                                                            [e.target.name]: e.target.value,
                                                        });
                                                    }}
                                                />
                                            </div>
                                            <br />
                                            <button type="submit" className="btn btn-primary mr-4">Update Grade</button>
                                            <a href="grade" className="btn btn-success text-center">Back to Grade List</a>
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


export default withRouter(CategoryUpdate);
