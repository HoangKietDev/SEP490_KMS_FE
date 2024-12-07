import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import axios from "axios";
import { withRouter } from "react-router-dom/cjs/react-router-dom.min";


class SemserterDetail extends React.Component {

    state = {
        semesterDetail: null,
        name: "",
        status: 1,
        startDate: '',
        endDate: '',
    };
    componentDidMount() {
        const { semesterId } = this.props.match.params; // Get categoryServiceId from URL
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:5124/api/Semester/GetAllSemester`);
                const data = response.data;
                const dataDetail = data?.find(i => i.semesterId == semesterId)
                console.log(dataDetail);
                this.setState({
                    semesterDetail: dataDetail,
                    name: dataDetail.name,
                    status: dataDetail.status,
                    startDate: dataDetail.startDate.split("T")[0],
                    endDate: dataDetail.endDate.split("T")[0],
                });
            } catch (error) {
                console.error('Error fetching category details:', error);
            }
        };

        fetchData();
    };

    render() {
        const { semesterDetail, name, status, startDate, endDate } = this.state;


        return (
            <div style={{ flex: 1 }} onClick={() => document.body.classList.remove("offcanvas-active")}>
                <div>
                    <div className="container-fluid">
                        <PageHeader
                            HeaderText="Semester Detail"
                            Breadcrumb={[
                                { name: "Semester", navigate: "semester" },
                                { name: "Semester Detail", navigate: "" },
                            ]}
                        />
                        <div className="row clearfix">
                            <div className="col-md-12">
                                <div className="card shadow-lg">
                                    <div className="card-header text-white theme-colorbg">
                                        <h4 className="mb-0">Detail Semester</h4>
                                    </div>
                                    <div className="body">
                                        <form onSubmit={this.handleSubmit}>
                                            <div className="form-group">
                                                <label>Semester Name</label>
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
                                            <div className="row">
                                                <div className="form-group col-md-6">
                                                    <label>Start Date</label>
                                                    <input
                                                        className={`form-control`}
                                                        value={startDate} // Bind value from state
                                                        name="startDate"
                                                        type="date"
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group col-md-6">
                                                    <label>End Date</label>
                                                    <input
                                                        className={`form-control`}
                                                        value={endDate} // Bind value from state
                                                        name="endDate"
                                                        type="date"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>Status</label>
                                                <br />
                                                <label className="fancy-radio">
                                                    <input
                                                        name="status"
                                                        type="radio"
                                                        checked={status === 1}
                                                    />
                                                    <span>
                                                        <i></i>Enable
                                                    </span>
                                                </label>
                                                <label className="fancy-radio">
                                                    <input
                                                        name="status"
                                                        type="radio"
                                                        checked={status === 0}
                                                    />
                                                    <span>
                                                        <i></i>Disable
                                                    </span>
                                                </label>
                                            </div>
                                            <br />
                                            <br />
                                            <a href="/semester" className="btn btn-success text-center">Back to Semester List</a>
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


export default withRouter(SemserterDetail);
