import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from "react-router-dom";
import axios from "axios";


class ListClassAttendance extends React.Component {
    state = {
        ProjectsData: [], // State để lưu trữ dữ liệu từ API
        statusFilter: '', // State để lưu trạng thái lọc
    };

    componentDidMount() {
        window.scrollTo(0, 0);
        const user = JSON.parse(localStorage.getItem("user"));
        const teacherId = user ? user.user.userId : null; // Lấy teacherId từ localStorage

        if (teacherId) {
            // Gọi API và cập nhật state
            fetch(`http://localhost:5124/api/Class/GetClassesByTeacherId/${teacherId}`)
                .then((response) => response.json())
                .then((data) => {
                    // Lọc các lớp có status là 1
                    const activeClasses = data.filter((classData) => classData.status === 1);
                    this.setState({ ProjectsData: activeClasses });
                })
                .catch((error) => {
                    console.error("Error fetching data: ", error);
                });
        } else {
            console.error("Teacher ID không tồn tại trong localStorage.");
        }
    }

    handleEdit = (classId) => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user && user.user.roleId === 3) {
            this.props.history.push(`/updateclass/${classId}`);
        } else if (user && user.user.roleId === 4) {
            this.props.history.push(`/updateclass2/${classId}`);
        } else {
            console.error("User roleId không hợp lệ hoặc không tồn tại.");
        }
    };


    handleView = async (classId) => {
        try {
            // Gọi API để tạo attendance mới
            const response = await axios.post("http://localhost:5124/api/Attendance/CreateDailyCheckin");
            console.log("Daily check-in created successfully:", response.data);
        } catch (error) {
            if (error.response && error.response.status === 500) {
                const errorMessage = error.response.data;
                console.error("Error creating daily check-in:", errorMessage);

                // Xử lý lỗi nếu có, nhưng không gọi lại API, vẫn tiếp tục chuyển hướng
            } else {
                console.error("Unexpected error:", error);
            }
        }

        // Dù thành công hay thất bại, vẫn chuyển hướng sang trang checkin với classId
        this.props.history.push(`/checkin/${classId}`);
    };


    handleStatusFilterChange = (event) => {
        this.setState({ statusFilter: event.target.value });
    };

    render() {
        const { ProjectsData, statusFilter } = this.state;

        // Lọc dữ liệu theo trạng thái
        const filteredData = ProjectsData.filter((classData) => {
            if (statusFilter === "") return true; // Không lọc nếu không có bộ lọc
            return (statusFilter === "active" && classData.status === 1) || (statusFilter === "inactive" && classData.status === 0);
        });

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
                            HeaderText="Class Management"
                            Breadcrumb={[
                                { name: "Class Management", navigate: "" },
                                { name: "View Class", navigate: "" },
                            ]}
                        />
                        <div className="row clearfix">
                            <div className="col-lg-12 col-md-12">
                                <div className="card">
                                    <div className="body project_report">
                                        {/* Dropdown để chọn trạng thái */}
                                        <div className="form-group">
                                            <label htmlFor="statusFilter">Filter by Status:</label>
                                            <select
                                                id="statusFilter"
                                                className="form-control"
                                                value={statusFilter}
                                                onChange={this.handleStatusFilterChange}
                                            >
                                                <option value="">All</option>
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>
                                        <div className="table-responsive">
                                            <table className="table m-b-0 table-hover">
                                                <thead className="thead-light">
                                                    <tr>
                                                        <th>Class Name</th>
                                                        <th>Status</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredData.map((classData, classIndex) => (
                                                        <React.Fragment key={"class" + classIndex}>
                                                            <tr>
                                                                <td>{classData.className}</td>
                                                                <td>
                                                                    {classData.status === 1 ? (
                                                                        <span className="badge badge-success">Active</span>
                                                                    ) : (
                                                                        <span className="badge badge-default">Inactive</span>
                                                                    )}
                                                                </td>
                                                                <td className="project-actions">
                                                                    <a
                                                                        className="btn btn-outline-secondary mr-1"
                                                                        onClick={() => this.handleView(classData.classId)}
                                                                    >
                                                                        <i className="icon-eye"></i>
                                                                    </a>

                                                                    <a className="btn btn-outline-secondary">
                                                                        <i className="icon-trash"></i>
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                        </React.Fragment>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
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

const mapStateToProps = ({ ioTReducer }) => ({
    isSecuritySystem: ioTReducer.isSecuritySystem,
});

export default connect(mapStateToProps)(withRouter(ListClassAttendance));
