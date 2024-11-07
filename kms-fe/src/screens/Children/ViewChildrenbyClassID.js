import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from "react-router-dom";

class ViewChildrenByClassID extends React.Component {
  state = {
    StudentsData: [], // State để lưu trữ dữ liệu từ API
    GradesData: [], // State để lưu trữ dữ liệu grade
    file: null, // State để lưu trữ file Excel đã chọn
    error: "", // State để lưu trữ thông báo lỗi
    searchTerm: "", // State để lưu trữ giá trị tìm kiếm
  };

  componentDidMount() {
    window.scrollTo(0, 0);
    const classId = this.props.match.params.classId; // Lấy classId từ URL

    // Gọi API để lấy danh sách học sinh
    fetch(`http://localhost:5124/api/Class/GetChildrenByClassId/${classId}`)
      .then((response) => response.json())
      .then((data) => {
        this.setState({ StudentsData: data });
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });

    // Gọi API để lấy danh sách grade
    fetch(`http://localhost:5124/api/Grade`)
      .then((response) => response.json())
      .then((data) => {
        this.setState({ GradesData: data });
      })
      .catch((error) => {
        console.error("Error fetching grades: ", error);
      });
  }

  handleEdit = (studentId) => {
    // Chuyển hướng đến trang cập nhật thông tin học sinh
    this.props.history.push(`/viewstudentbyId/${studentId}`);
  };

  handleSearchChange = (event) => {
    this.setState({ searchTerm: event.target.value });
  };

  render() {
    const { StudentsData, GradesData, searchTerm } = this.state;

    // Lọc danh sách học sinh theo tên
    const filteredStudents = StudentsData.filter(student =>
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Hàm để lấy tên grade từ gradeId
    const getGradeName = (gradeId) => {
      const grade = GradesData.find(g => g.gradeId === gradeId);
      return grade ? grade.name : "Unknown"; // Trả về "Unknown" nếu không tìm thấy
    };

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
              HeaderText="Student Management"
              Breadcrumb={[
                { name: "Student Management", navigate: "" },
                { name: "View Students", navigate: "" },
              ]}
            />

            <div className="row clearfix">
              <div className="col-lg-12 col-md-12">
                <div className="card">
                  <div className="body project_report">
                    {/* Input tìm kiếm */}
                    <input
                      type="text"
                      placeholder="Search by full name..."
                      value={searchTerm}
                      onChange={this.handleSearchChange}
                      className="form-control mb-3"
                    />

                    <div className="table-responsive">
                      <table className="table m-b-0 table-hover">
                        <thead className="thead-light">
                          <tr>
                            <th>Full Name</th>
                            <th>Nick Name</th>
                            <th>Grade</th>
                            <th>Date of birth</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStudents.map((student, index) => (
                            <React.Fragment key={"student" + index}>
                              <tr>
                                <td>
                                  {/* Ảnh nằm cạnh tên */}
                                  <div className="d-flex align-items-center">
                                    <img
                                      src="https://static.vecteezy.com/system/resources/previews/005/129/844/non_2x/profile-user-icon-isolated-on-white-background-eps10-free-vector.jpg"
                                      alt="Profile"
                                      className="img-fluid rounded-circle mr-2"
                                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                    />
                                    <span>{student.fullName}</span>
                                  </div>
                                </td>
                                <td>{student.nickName}</td>
                                <td>{getGradeName(student.grade)}</td> {/* Hiển thị tên grade */}
                                <td>
                                  {new Date(student.dob).toLocaleDateString('vi-VN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                  })}
                                </td>
                                <td>
                                  {student.status === 1 ? (
                                    <span className="badge badge-success">Active</span>
                                  ) : (
                                    <span className="badge badge-default">Inactive</span>
                                  )}
                                </td>
                                <td className="project-actions">
                                  <a className="btn btn-outline-secondary mr-1">
                                    <i className="icon-eye"></i>
                                  </a>
                                  <a
                                    className="btn btn-outline-secondary"
                                    onClick={() => this.handleEdit(student.studentId)}
                                  >
                                    <i className="icon-pencil"></i>
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

export default connect(mapStateToProps)(withRouter(ViewChildrenByClassID));
