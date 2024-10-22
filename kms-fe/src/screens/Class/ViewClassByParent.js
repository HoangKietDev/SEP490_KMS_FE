import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from 'react-router-dom';
import axios from "axios";

class ViewMenuByTeacherAndParent extends React.Component {
    state = {
        studentId: '', // ID của học sinh được chọn
        childerParent: [], // Danh sách con của phụ huynh
        studentClasses: [], // Danh sách lớp học của học sinh
        statusFilter: '', // Trạng thái lọc
    };

    componentDidMount() {
        window.scrollTo(0, 0);
        
        // Lấy userID từ localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        const parentID = user.user.userId;

        if (!parentID) {
            console.error("Parent ID not found");
            return;
        }

        // Gọi API để lấy danh sách con theo parentID
        axios.get(`http://localhost:5124/api/Request/GetStudentsByParentId/${parentID}`)
            .then(response => {
                this.setState({ childerParent: response.data });
            })
            .catch(error => {
                console.error("Error fetching student data:", error);
            });
    }

    handleStudentChange = async (e) => {
        const studentId = e.target.value;
        this.setState({ studentId });
        try {
            // Gọi API để lấy lớp học của học sinh
            const classResponse = await axios.get(`http://localhost:5124/api/Class/GetClassesByStudentId/${studentId}`);
            const classData = classResponse.data;

            // Lưu danh sách lớp học vào state
            this.setState({ studentClasses: classData });
        } catch (error) {
            console.error("Error fetching class data:", error);
        }
    };

    handleView = (classId) => {
        this.props.history.push(`/viewchildrenbyclassid/${classId}`);
    };

    handleStatusFilterChange = (event) => {
        this.setState({ statusFilter: event.target.value });
    };

    render() {
        const { childerParent, studentId, studentClasses } = this.state;

        // Lọc dữ liệu chỉ để hiển thị các lớp có status === 1 (Active)
        const activeClasses = studentClasses.filter(classData => classData.status === 1);

        return (
            <div style={{ flex: 1 }} onClick={() => { document.body.classList.remove("offcanvas-active"); }}>
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

                                    {/* Dropdown để chọn học sinh */}
                                    <div className="form-group">
                                        <label>Choose Your Children</label>
                                        <select
                                            className="form-control"
                                            value={studentId}
                                            name="studentId"
                                            required
                                            onChange={this.handleStudentChange}
                                        >
                                            <option value="">Choose Student</option>
                                            {childerParent.map((option) => (
                                                <option key={option.studentId} value={option.studentId}>
                                                    {option.fullName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Hiển thị thông tin lớp học của học sinh đã chọn */}
                                    {activeClasses.length > 0 ? (
                                        <div className="table-responsive">
                                            <table className="table m-b-0 table-hover">
                                                <thead className="thead-light">
                                                    <tr>
                                                        <th>Class Name</th>
                                                        <th>Status</th>
                                                        <th>Expire Date</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {activeClasses.map((classData, classIndex) => (
                                                        <tr key={"class" + classIndex}>
                                                            <td>{classData.className}</td>
                                                            <td>
                                                                <span className="badge badge-success">Active</span>
                                                            </td>
                                                            <td>{new Date(classData.expireDate).toLocaleDateString()}</td>
                                                            <td className="project-actions">
                                                                <button 
                                                                    className="btn btn-outline-secondary mr-1"
                                                                    onClick={() => this.handleView(classData.classId)}
                                                                >
                                                                    <i className="icon-eye"></i> View
                                                                </button>
                                                                <button className="btn btn-outline-secondary">
                                                                    <i className="icon-trash"></i> Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p>No active classes found for this student.</p>
                                    )}

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

export default connect(mapStateToProps)(withRouter(ViewMenuByTeacherAndParent));
