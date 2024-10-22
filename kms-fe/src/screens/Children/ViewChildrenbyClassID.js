import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from "react-router-dom";

class ViewChildrenByClassID extends React.Component {
  state = {
    StudentsData: [], // State để lưu trữ dữ liệu từ API
    file: null, // State để lưu trữ file Excel đã chọn
    error: "", // State để lưu trữ thông báo lỗi
  };

  componentDidMount() {
    window.scrollTo(0, 0);
    const classId = this.props.match.params.classId; // Lấy classId từ URL

    // Gọi API và cập nhật state với danh sách học sinh của lớp
    fetch(`http://localhost:5124/api/Class/GetChildrenByClassId/${classId}`)
      .then((response) => response.json())
      .then((data) => {
        this.setState({ StudentsData: data });
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }

  handleEdit = (studentId) => {
    // Chuyển hướng đến trang cập nhật thông tin học sinh
    this.props.history.push(`/viewstudentbyId/${studentId}`);
  };

  // Xử lý khi người dùng chọn file

  render() {
    const { StudentsData, error, file } = this.state;

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
                          {StudentsData.map((student, index) => (
                            <React.Fragment key={"student" + index}>
                              <tr>
                                <td>{student.fullName}</td>
                                <td>{student.nickName}</td>
                                <td>{student.grade}</td>
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
