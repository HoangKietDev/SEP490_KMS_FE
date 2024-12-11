import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from "react-router-dom";
import Notification from "../../components/Notification";
class ViewAllChildren extends React.Component {
  state = {
    StudentsData: [], // State để lưu trữ dữ liệu từ API
    Grades: [], // State để lưu trữ danh sách grades
    Classes: [], // Danh sách classes (có thể lấy từ data hoặc API)
    file: null, // State để lưu trữ file Excel đã chọn
    error: "", // State để lưu trữ thông báo lỗi
    showNotification: false, // State to control notification visibility
    notificationText: "", // Text for the notification
    notificationType: "success",// Type of notification (success or error)
    searchQuery: "", // State để lưu trữ từ khóa tìm kiếm

  };

  componentDidMount() {
    window.scrollTo(0, 0);

    // Gọi API để lấy danh sách học sinh
    fetch(`${process.env.REACT_APP_API_URL}/api/Children/GetAllChildren`)
      .then((response) => response.json())
      .then((data) => {
        this.setState({ StudentsData: data });
      })
      .catch((error) => {
        console.error("Error fetching students data: ", error);
      });
    const { StudentsData } = this.setState
    console.log(StudentsData, "sdssd");

    // Gọi API để lấy danh sách grades
    fetch(`${process.env.REACT_APP_API_URL}/api/Grade`)
      .then((response) => response.json())
      .then((data) => {
        this.setState({ Grades: data });
      })
      .catch((error) => {
        console.error("Error fetching grades data: ", error);
      });
  }
  handleView = (studentId) => {
    // Chuyển hướng đến trang cập nhật thông tin học sinh
    this.props.history.push(`/viewdetailschildren/${studentId}`);
  };
  handleEdit = (studentId) => {
    // Chuyển hướng đến trang cập nhật thông tin học sinh
    this.props.history.push(`/viewstudentbyId/${studentId}`);
  };
  handleDownload = () => {
    const link = document.createElement('a'); // Tạo thẻ a
    link.href = '/assets/excel/Sample_Import_Student.xlsx';  // Đường dẫn đến file Excel
    link.download = 'Sample_Import_Student.xlsx';             // Tên file khi tải về
    link.click();                             // Kích hoạt sự kiện click để tải file
  };
  // Xử lý khi người dùng chọn file

  handleCreateStudent = (e) => {
    this.props.history.push(`/createstudent`);
  }
  handleFileChange = (e) => {
    this.setState({ file: e.target.files[0], error: "" });
  };
  handleSearchChange = (e) => {
    this.setState({ searchQuery: e.target.value });
  };

  getFilteredStudents = () => {
    const { StudentsData, searchQuery } = this.state;
    return StudentsData.filter(student =>
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) // Lọc học sinh theo tên
    );
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

    fetch(`${process.env.REACT_APP_API_URL}/api/Children/ImportChildrenExcel`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("File uploaded successfully:", data);
        // alert("File uploaded successfully!");
        this.setState({
          notificationText: "File uploaded successfully!",
          notificationType: "success",
          showNotification: true
        });

        // Reset trạng thái sau khi upload thành công
        this.setState({ error: "", file: null }); // Reset file về null và xóa thông báo lỗi

        // Cập nhật danh sách học sinh sau khi upload
        return fetch(`${process.env.REACT_APP_API_URL}/api/Children/GetAllChildren`);
      })
      .then((response) => response.json())
      .then((data) => {
        this.setState({ StudentsData: data }); // Cập nhật danh sách học sinh mới
      })
      .catch((error) => {
        console.error("Error uploading file:", error);
        // alert("Failed to upload file. Please try again.");
        this.setState({
          notificationText: "FFailed to upload file. Please try again.",
          notificationType: "error",
          showNotification: true
        });
      });
  };
  getFilteredStudents = () => {
    const { StudentsData, searchQuery, selectedGrade, selectedClass } = this.state;

    return StudentsData.filter(student => {
      const gradeMatches = selectedGrade ? student.gradeId === parseInt(selectedGrade) : true;
      const classMatches = selectedClass ? student.classes.some(cls => cls.className === selectedClass) : true;
      const nameMatches = student.fullName.toLowerCase().includes(searchQuery.toLowerCase());

      return gradeMatches && classMatches && nameMatches;
    });
  };

  render() {
    const { StudentsData, error, file, showNotification, // State to control notification visibility
      notificationText,// Text for the notification
      notificationType } = this.state;

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
            {showNotification && (
              <Notification
                type={notificationType}
                position="top-right"
                dialogText={notificationText}
                show={showNotification}
                onClose={() => this.setState({ showNotification: false })}
              />
            )}

            <a
              onClick={() => {
                this.handleDownload()
              }}
              className="btn btn-success text-white mr-4 "
            >
              <i className="icon-arrow-down mr-2"></i>Dowload Template
            </a>
            <div className="btn btn-success text-white mr-4 ">
              <a
                onClick={this.handleCreateStudent}
                className="btn btn-success text-white d-flex align-items-center"
              >
                <i className="icon-plus mr-2"></i>Create Student
              </a>
            </div>
            <form onSubmit={this.handleSubmit}>
              <div className="form-group">
                <label>Choose Excel File</label>
                <input
                  type="file"
                  className="form-control col-3"
                  accept=".xls,.xlsx" // Chỉ chấp nhận file Excel
                  onChange={this.handleFileChange}
                />
                {error && <p className="text-danger">{error}</p>}

              </div>
              <button type="submit" className="btn btn-primary">
                Upload Excel File
              </button>
            </form>

            {/* <div className="form-inline m-3">
              <div className="form-group mr-3">
                <label htmlFor="statusFilter" className="mr-2">Grade:</label>
                <select
                  className="form-control"
                  value={this.state.selectedGrade}
                  onChange={(e) => this.setState({ selectedGrade: e.target.value })}
                >
                  <option value="">All Grades</option>
                  {this.state.Grades.map((grade) => (
                    <option key={grade.gradeId} value={grade.gradeId}>
                      {grade.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group mr-3">
                <label htmlFor="gradeFilter" className="mr-2">Class:</label>
                <select
                  className="form-control"
                  value={this.state.selectedClass}
                  onChange={(e) => this.setState({ selectedClass: e.target.value })}
                >
                  <option value="">All Classes</option>
                  {this.state.Classes.map((cls, index) => (
                    <option key={index} value={cls.className}>
                      {cls.className}
                    </option>
                  ))}
                </select>
              </div>
            </div> */}
            <div className="row clearfix">
              <div className="col-lg-12 col-md-12">
                <div className="card">
                  <div className="body project_report">
                    <div className="table-responsive">
                      <div className="form-inline m-2">
                        <div className="form-group mr-3">
                          <label htmlFor="statusFilter" className="mr-2">Grade:</label>
                          <select
                            className="form-control"
                            value={this.state.selectedGrade}
                            onChange={(e) => this.setState({ selectedGrade: e.target.value })}
                          >
                            <option value="">All Grades</option>
                            {this.state.Grades.map((grade) => (
                              <option key={grade.gradeId} value={grade.gradeId}>
                                {grade.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group mr-3">
                          <label htmlFor="gradeFilter" className="mr-2">Class:</label>
                          <select
                            className="form-control"
                            value={this.state.selectedClass}
                            onChange={(e) => this.setState({ selectedClass: e.target.value })}
                          >
                            <option value="">All Classes</option>
                            {this.state.Classes.map((cls, index) => (
                              <option key={index} value={cls.className}>
                                {cls.className}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <table className="table m-b-0 table-hover">
                        <thead className="thead-light">
                          <tr>
                            <th>Full Name</th>
                            <th>Nick Name</th>
                            <th>Code</th>
                            <th>Class</th>
                            <th>Grade</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.getFilteredStudents().map((student, index) => {
                            // Lọc tên grade và class
                            const grade = this.state.Grades.find((g) => g.gradeId === student.gradeId);
                            const gradeName = grade ? grade.name : "Unknown";
                            const className = student.classes.length > 0 ? student.classes[0].className : "No Class";

                            const avatar =
                              student.avatar ||
                              "https://static.vecteezy.com/system/resources/previews/005/129/844/non_2x/profile-user-icon-isolated-on-white-background-eps10-free-vector.jpg";

                            return (
                              <React.Fragment key={"student" + index}>
                                <tr>
                                  <td>
                                    <img
                                      src={avatar}
                                      alt="Avatar"
                                      style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        marginRight: "10px",
                                      }}
                                    />
                                    {student.fullName}
                                  </td>
                                  <td>{student.nickName}</td>
                                  <td>{student.code}</td>
                                  <td>{className}</td>
                                  <td>{gradeName}</td>
                                  <td>
                                    {student.status === 1 ? (
                                      <span className="badge badge-success">Active</span>
                                    ) : (
                                      <span className="badge badge-default">Inactive</span>
                                    )}
                                  </td>
                                  <td className="project-actions">
                                    <a className="btn btn-outline-secondary mr-1" onClick={() => this.handleView(student.studentId)}>
                                      <i className="icon-eye"></i>
                                    </a>
                                    <a className="btn btn-outline-secondary" onClick={() => this.handleEdit(student.studentId)}>
                                      <i className="icon-pencil"></i>
                                    </a>
                                  </td>
                                </tr>
                              </React.Fragment>
                            );
                          })}
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
