import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Spinner } from "react-bootstrap";

class ViewCheckService extends React.Component {
    state = {
        studentId: "",
        childrenParent: [],
        date: "",
        checkServices: [],
        loading: false,
        error: null,
        startDate: "",
        endDate : "",
        allServices: [], // To store all services for name resolution
    };

    componentDidMount() {
        window.scrollTo(0, 0);

        const user = JSON.parse(sessionStorage.getItem("user"));
        const parentID = user?.user?.userId;

        if (!parentID) {
            console.error("Parent ID not found");
            this.setState({ error: "Parent ID not found." });
            return;
        }

        // Fetch children data
        axios
            .get(`${process.env.REACT_APP_API_URL}/api/Request/GetStudentsByParentId/${parentID}`)
            .then((response) => {
                this.setState({ childrenParent: response.data });
            })
            .catch((error) => {
                console.error("Error fetching student data:", error);
                this.setState({ error: "Failed to fetch student data." });
            });

        // Fetch all services for name resolution
        axios
            .get(`${process.env.REACT_APP_API_URL}/api/Service/GetAllServices`)
            .then((response) => {
                this.setState({ allServices: response.data });
            })
            .catch((error) => {
                console.error("Error fetching all services:", error);
                // Optional: You can set an error state if needed
            });
    }

    handleStudentChange = (e) => {
        const studentId = e.target.value;
        const today = this.formatDate(new Date());

        this.setState(
            {
                studentId,
                date: today, // Automatically set to today's date
                checkServices: [], // Reset check services when changing student
                error: null, // Reset any existing errors
            },
            () => {
                if (studentId && this.state.date) {
                    this.fetchCheckServicesByWeek(studentId, this.getStartOfWeek(new Date(this.state.date)), this.getEndOfWeek(new Date(this.state.date)));
                }
            }
        );
    };

    handleDateChange = (e) => {
        const selectedDate = new Date(e.target.value);
        const startOfWeek = this.getStartOfWeek(selectedDate);
        const endOfWeek = this.getEndOfWeek(selectedDate);

        const { studentId } = this.state;

        this.setState(
            {
                date: e.target.value,
                checkServices: [], // Reset check services when changing date
                error: null, // Reset any existing errors
                endDate: endOfWeek,
                startDate: startOfWeek,
            },
            () => {
                if (studentId && startOfWeek && endOfWeek) {
                    this.fetchCheckServicesByWeek(studentId, startOfWeek, endOfWeek);
                }
            }
        );
    };

    // Utility function to format date to YYYY-MM-DD
    formatDate = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = (`0${d.getMonth() + 1}`).slice(-2);
        const day = (`0${d.getDate()}`).slice(-2);
        return `${year}-${month}-${day}`;
    };

    // Tính toán ngày đầu tuần và cuối tuần
    getStartOfWeek = (date) => {
        const day = date.getDay(),
            diff = date.getDate() - day + (day == 0 ? -6 : 1); // Chủ nhật là ngày đầu tuần
        const startOfWeek = new Date(date.setDate(diff));
        return this.formatDate(startOfWeek);
    };

    getEndOfWeek = (date) => {
        const day = date.getDay(),
            diff = date.getDate() - day + (day == 0 ? -6 : 1) + 6; // Thứ Bảy là cuối tuần
        const endOfWeek = new Date(date.setDate(diff));
        return this.formatDate(endOfWeek);
    };

    // Gửi API với ngày đầu và cuối tuần
    fetchCheckServicesByWeek = (studentId, startDate, endDate) => {
        this.setState({ loading: true, error: null });
    
        axios
            .get(
                `${process.env.REACT_APP_API_URL}/api/Service/GetCheckServiceByStudentIdAndWeek/${studentId}/${startDate}/${endDate}`
            )
            .then((response) => {
                // Lọc dữ liệu để chỉ lấy những bản ghi có status = 1
                const filteredServices = response.data?.filter(service => service.status === 1);
    
                this.setState({ checkServices: filteredServices, loading: false });
            })
            .catch((error) => {
                console.error("Error fetching check services:", error);
                this.setState({ error: "Failed to fetch check services.", loading: false });
            });
    };
    

    // Function to get service name by ID
    getServiceName = (serviceId) => {
        const { allServices } = this.state;
        const service = allServices.find((s) => s.serviceId === serviceId);
        return service ? service.serviceName : "Unknown Service";
    };

    // Helper to get student name
    getStudentName = (id) => {
        const student = this.state.childrenParent.find(
            (child) => child.studentId === parseInt(id)
        );
        return student ? student.fullName : "";
    };

    render() {
        const {
            childrenParent,
            studentId,
            date,
            checkServices,
            loading,
            error,
            endDate,
            startDate
        } = this.state;

        return (
            <div
                style={{ flex: 1 }}
                onClick={() => {
                    document.body.classList.remove("offcanvas-active");
                }}
            >
                <PageHeader
                    HeaderText="View Check Services"
                    Breadcrumb={[{ name: "Service Management", navigate: "" }, { name: "View Check Services", navigate: "" }]}
                />

                <div className="row mb-4">
                    <div className="col-md-4">
                        <div className="form-group">
                            <label className="form-label fw-bold">
                                <i className="bi bi-person-lines-fill me-2"></i> Select Child
                            </label>
                            <div className="input-group mb-3">
                                <span className="input-group-text bg-light">
                                    <i className="icon-user"></i>
                                </span>
                                <select
                                    className="form-select border-primary"
                                    value={studentId}
                                    onChange={this.handleStudentChange}
                                    style={{
                                        borderRadius: "0.5rem",
                                        boxShadow: "0 0 5px rgba(0, 123, 255, 0.25)",
                                    }}
                                >
                                    <option value="" disabled>
                                        Choose Student
                                    </option>
                                    {childrenParent.map((option) => (
                                        <option key={option.studentId} value={option.studentId}>
                                            {option.fullName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <small className="text-muted">Select a child to view services.</small>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="form-group">
                            <label className="form-label fw-bold">
                                <i className="bi bi-calendar-event me-2"></i> Select Date (Week)
                            </label>
                            <div className="input-group mb-3">
                                <span className="input-group-text bg-light">
                                <i className="fa fa-calendar"></i>
                                </span>
                                <input
                                    type="date"
                                    className="form-control border-primary"
                                    value={date}
                                    onChange={this.handleDateChange}
                                    style={{
                                        borderRadius: "0.5rem",
                                        boxShadow: "0 0 5px rgba(0, 123, 255, 0.25)",
                                    }}
                                />
                            </div>
                            <small className="text-muted">Select a date to view services within the week.</small>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="row mb-4">
                        <div className="col-12 text-center">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        </div>
                    </div>
                )}

                {checkServices.length > 0 ? (
                    <div className="row mt-4">
                        <div className="col-12">
                            <h5>
                                Check Services for {this.getStudentName(studentId)} on {startDate} -  {endDate}
                            </h5>
                            <div className="table-responsive">
                                <table className="table table-striped table-bordered table-hover">
                                    <thead className="thead-light">
                                        <tr>
                                            <th>#</th>
                                            <th>Service Name</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Payment Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {checkServices.map((checkService, index) => (
                                            <tr key={checkService.checkServiceId}>
                                                <td>{index + 1}</td>
                                                <td>{this.getServiceName(checkService.serviceId)}</td>
                                                <td>{checkService.date}</td>
                                                <td>
                                                    {checkService.status === 0
                                                        ? "Pending"
                                                        : checkService.status === 1
                                                            ? "Completed"
                                                            : "Unknown"}
                                                </td>
                                                <td>
                                                    {checkService.payService === 0
                                                        ? "Unpaid"
                                                        : checkService.payService === 1
                                                            ? "Paid"
                                                            : "Unknown"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    (!loading && studentId && date) && (
                        <div className="row mt-4">
                            <div className="col-12">
                                <div className="alert alert-info" role="alert">
                                    No check services found for the selected student and date.
                                </div>
                            </div>
                        </div>
                    )
                )}

            </div>
        );
    }
}

const mapStateToProps = ({ ioTReducer }) => ({
    isSecuritySystem: ioTReducer.isSecuritySystem,
});

export default connect(mapStateToProps)(withRouter(ViewCheckService));
