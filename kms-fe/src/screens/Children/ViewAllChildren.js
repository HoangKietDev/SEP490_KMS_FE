import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from "react-router-dom";

class ViewAllChildren extends React.Component {
  state = {
    StudentsData: [], // State để lưu trữ dữ liệu từ API
    file: null, // State để lưu trữ file Excel đã chọn
    error: "", // State để lưu trữ thông báo lỗi
  };

  componentDidMount() {
    window.scrollTo(0, 0);
    // Gọi API và cập nhật state
    fetch("http://localhost:5124/api/Children/GetAllChildren")
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
  handleFileChange = (e) => {
    this.setState({ file: e.target.files[0], error: "" });
  };

  // Xử lý việc upload file khi người dùng submit form
  handleSubmit = (e) => {
    e.preventDefault();

    const { file } = this.state;

    if (!file) {
      this.setState({ error: "Please choose an Excel file." });
      return;
    }

    const formData = new FormData();
    formData.append("file", file); // Thêm file vào form data

    fetch("http://localhost:5124/api/Children/ImportChildrenExcel", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("File uploaded successfully:", data);
        alert("File uploaded successfully!");
        
        // Reset trạng thái sau khi upload thành công
        this.setState({ error: "", file: null }); // Reset file về null và xóa thông báo lỗi

        // Cập nhật danh sách học sinh sau khi upload
        return fetch("http://localhost:5124/api/Children/GetAllChildren");
      })
      .then((response) => response.json())
      .then((data) => {
        this.setState({ StudentsData: data }); // Cập nhật danh sách học sinh mới
      })
      .catch((error) => {
        console.error("Error uploading file:", error);
        alert("Failed to upload file. Please try again.");
      });
  };

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
            <form onSubmit={this.handleSubmit}>
              <div className="form-group">
                <label>Choose Excel File</label>
                <input
                  type="file"
                  className="form-control"
                  accept=".xls,.xlsx" // Chỉ chấp nhận file Excel
                  onChange={this.handleFileChange}
                />
                {error && <p className="text-danger">{error}</p>}
              </div>
              <button type="submit" className="btn btn-primary">
                Upload Excel File
              </button>
            </form>

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
                                    onClick={() => this.handleEdit(student.studentId)} // Gọi hàm handleEdit
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

export default connect(mapStateToProps)(withRouter(ViewAllChildren));
