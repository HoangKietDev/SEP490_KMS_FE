import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap nếu chưa có
import Notification from "../../components/Notification";
import axios from 'axios';
import { getSession } from "../../components/Auth/Auth";
class ViewChildrenByClassID extends React.Component {
  state = {
    StudentsData: [],
    GradesData: [],
    searchTerm: "",
    hoveredImageSrc: null,
    hoveredImagePosition: { top: 0, left: 0 },
    studentsWithoutClass: [], // New state to store students without class
    showAddModal: false, // To control showing the modal
    selectedStudents: [], // Mảng chứa ID của các học sinh đã chọn
    showNotification: false,
    notificationText: "",
    notificationType: "success",
  };

  componentDidMount() {
    window.scrollTo(0, 0);
    const classId = this.props.match.params.classId;

    // Fetch students data
    fetch(`${process.env.REACT_APP_API_URL}/api/Class/GetChildrenByClassId/${classId}`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          this.setState({ StudentsData: data });
        } else {
          console.error("Dữ liệu không hợp lệ:", data);
        }
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });

    // Fetch grade data
    fetch(`${process.env.REACT_APP_API_URL}/api/Grade`)
      .then((response) => response.json())
      .then((data) => {
        this.setState({ GradesData: data });
      })
      .catch((error) => {
        console.error("Error fetching grades: ", error);
      });
  }

  handleSearchChange = (event) => {
    this.setState({ searchTerm: event.target.value });
  };
  handleCheckboxChange = (studentId) => {
    this.setState((prevState) => {
      const isSelected = prevState.selectedStudents.includes(studentId);
      const newSelectedStudents = isSelected
        ? prevState.selectedStudents.filter((id) => id !== studentId)
        : [...prevState.selectedStudents, studentId];

      return { selectedStudents: newSelectedStudents };
    });
  };

  handleAddChildren = () => {
    const classId = this.props.match.params.classId;
    // Fetch students without class
    fetch(`${process.env.REACT_APP_API_URL}/api/Children/GetChildrensWithoutClassByClassId/${classId}`)
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          studentsWithoutClass: data,
          showAddModal: true, // Show the modal when data is fetched
        });
      })
      .catch((error) => {
        console.error("Error fetching students without class: ", error);
      });
  };
  handleAssignSelectedStudents = () => {
    const { selectedStudents } = this.state;
    const classId = this.props.match.params.classId;

    if (selectedStudents.length === 0) {
      alert("Please select at least one student.");
      return;
    }

    // Đếm số lượng yêu cầu đã thành công
    let successCount = 0;

    // Lặp qua từng học sinh đã chọn và gửi yêu cầu API để thêm vào lớp
    selectedStudents.forEach((studentId) => {
      fetch(`${process.env.REACT_APP_API_URL}/api/Children/AddChildToClass?classId=${classId}&studentId=${studentId}`, {
        method: "POST",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === "Children added successfully.") {
            successCount++;

            // Cập nhật UI nếu học sinh được thêm thành công
            this.setState((prevState) => ({
              studentsWithoutClass: prevState.studentsWithoutClass.filter(
                (student) => student.studentId !== studentId
              ),
              selectedStudents: prevState.selectedStudents.filter(
                (id) => id !== studentId
              ),
            }));
          } else {
            alert(`Failed to assign student ${studentId} to class.`);
          }

          // Kiểm tra xem tất cả yêu cầu đã hoàn thành chưa
          if (successCount === selectedStudents.length) {
            this.setState({
              notificationText: "All selected students have been assigned to the class successfully!",
              notificationType: "success",
              showNotification: true
            });
            // Reload trang sau khi tất cả học sinh đã được thêm thành công
            window.location.reload();
          }
        })
        .catch((error) => {
          console.error("Error assigning student to class:", error);
          alert(`An error occurred while assigning student ${studentId}. Please try again.`);
        });
    });
  };

  handleDownload = async () => {
    try {
      // Lấy classId từ state hoặc props, ví dụ ở đây là từ this.state.classId
      const classId = this.props.match.params.classId;

      // Gửi yêu cầu GET đến API để tải file
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/Children/ExportChildrenWithoutClassToExcel?classId=${classId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Kiểm tra nếu yêu cầu thành công (status code 200)
      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      // Lấy tên file từ header "content-disposition"
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename*=UTF-8\'\'')[1]
        : 'ChildrenWithoutClass.xlsx';

      // Lấy dữ liệu file dạng Blob
      const blob = await response.blob();

      // Tạo URL để tải file
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;  // Đặt tên file khi tải xuống
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };
  // handleImportStudent = async (event) => {
  //   // Lấy file từ event.target.files thay vì từ this.fileInput
  //   event.preventDefault();

  //   const file = event.target.files[0]; 

  //   if (!file) {
  //     alert("Please select a file to import!"); // Kiểm tra nếu không có file được chọn
  //     this.setState({
  //       notificationText: "Please select a file to import!",
  //       notificationType: "info",
  //       showNotification: true
  //     });
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append('file', file); // Thêm file vào FormData

  //   try {
  //     const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/Children/AddChildrenToClassesFromExcel`, formData, {
  //       headers: {
  //         'Content-Type': 'multipart/form-data', // Chắc chắn rằng header Content-Type là multipart
  //       },
  //     });

  //     // Kiểm tra phản hồi từ API
  //     if (response.status === 200) {
  //       this.setState({
  //         notificationText: "Import successful!!",
  //         notificationType: "success",
  //         showNotification: true
  //       });
  //       // Có thể làm thêm các thao tác khác như refresh data...
  //     }
  //   } catch (error) {
  //     console.error("Error importing schedule: ", error);
  //     this.setState({
  //       notificationText: "Failed to import schedule. Please try again.",
  //       notificationType: "error",
  //       showNotification: true
  //     });
  //   }
  // };

  handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      alert("Please select a file to import!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/Children/AddChildrenToClassesFromExcel`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        this.setState({
          notificationText: "Import successful!",
          notificationType: "success",
          showNotification: true,
        });
        // Có thể refresh lại dữ liệu nếu cần
        window.location.reload();
      }
    } catch (error) {
      console.error("Error importing schedule: ", error);
      this.setState({
        notificationText: "Failed to import schedule. Please try again.",
        notificationType: "error",
        showNotification: true,
      });
    }
  };


  handleCloseModal = () => {
    this.setState({ showAddModal: false }); // Close modal
  };
  handleAssignClass = (studentId) => {
    const classId = this.props.match.params.classId;  // Lấy ID lớp từ URL

    // Gửi yêu cầu API để gán học sinh vào lớp
    fetch(`${process.env.REACT_APP_API_URL}/api/Children/AddChildToClass?classId=${classId}&studentId=${studentId}`, {
      method: "POST",
    })
      .then((response) => response.json())
      .then((data) => {
        // Kiểm tra nếu thông báo là "Children added successfully."
        if (data.message === "Children added successfully.") {
          // Cập nhật UI nếu thêm học sinh thành công
          this.setState((prevState) => ({
            studentsWithoutClass: prevState.studentsWithoutClass.filter(
              (student) => student.studentId !== studentId
            ),
            showAddModal: false,
          }));

          alert("Student assigned to class successfully!");
        } else {
          alert("Failed to assign student to class.");
        }
      })
      .catch((error) => {
        console.error("Error assigning student to class:", error);
        alert("An error occurred. Please try again.");
      });

  };


  // Add further methods for assigning students to class or other actions...

  render() {
    const { StudentsData, GradesData, searchTerm, hoveredImageSrc, hoveredImagePosition, studentsWithoutClass, showAddModal, showNotification, notificationText, notificationType } = this.state;
    const user = getSession('user');
    const roleId = user?.user?.roleId
    const isRole4 = user && user.user.roleId === 4;
    const isRole3 = user && user.user.roleId === 3; // Kiểm tra roleId = 3
    const filteredStudents = StudentsData.filter((student) =>
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getGradeName = (gradeID) => {
      const grade = GradesData.find((g) => g.gradeId === gradeID);
      return grade ? grade.name : "Unknown";
    };

    return (
      <div style={{ flex: 1 }}>
        <div className="container-fluid">
          <PageHeader
            HeaderText="Student Management"
            Breadcrumb={[
              { name: "Class Management", 
                navigate: roleId === 5 ? "/viewclass3" : roleId === 2 ? "/viewclass2"  : "/viewclass"
              },
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
          <div className="row clearfix">
            <div className="col-lg-12 col-md-12">
              <div className="card">
                <div className="body project_report">

                  <div className="">
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="Search by full name..."
                        value={searchTerm}
                        onChange={this.handleSearchChange}
                        className="form-control"
                      />
                    </div>

                    {(isRole3 || isRole4) && (
                      <div className="mb-4 d-flex flex-column flex-sm-row justify-content-between">
                        <div className="btn-group">
                          <a
                            onClick={this.handleAddChildren} // On click open the modal
                            className="btn btn-success text-white d-flex align-items-center mr-2"
                          >
                            <i className="icon-plus mr-2"></i>Add Children To Class
                          </a>
                          <a
                            onClick={() => this.handleDownload()}
                            className="btn btn-success text-white d-flex align-items-center mr-2"
                          >
                            <i className="icon-arrow-down mr-2"></i>Export Student
                          </a>
                          <a
                            onClick={() => document.getElementById("fileInput").click()} // Trigger file input click
                            className="btn btn-primary text-white d-flex align-items-center"
                          >
                            <i className="icon-arrow-up mr-2"></i>Import Excel
                          </a>
                          <input
                            id="fileInput"
                            type="file"
                            style={{ display: "none" }}
                            onChange={this.handleFileChange} // Tự động gọi API khi chọn file
                            accept=".xls,.xlsx,.csv" // Chỉ chấp nhận file Excel
                          />
                        </div>
                      </div>
                    )}

                  </div>

                  <div className="table-responsive">
                    <table className="table m-b-0 table-hover">
                      <thead className="thead-light">
                        <tr>
                          <th>Full Name</th>
                          <th>Nick Name</th>
                          <th>Code</th>
                          <th>Grade</th>
                          <th>Date of birth</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="text-center">
                              No data available
                            </td>
                          </tr>
                        ) : (
                          filteredStudents.map((student, index) => (
                            <tr key={index}>
                              <td><div className="d-flex align-items-center">
                                <img
                                  src={student.avatar || "https://static.vecteezy.com/system/resources/previews/005/129/844/non_2x/profile-user-icon-isolated-on-white-background-eps10-free-vector.jpg"} // Avatar học sinh hoặc avatar mặc định
                                  alt="Profile"
                                  className="img-fluid rounded-circle mr-2"
                                  style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                />
                                <span>{student.fullName}</span>
                              </div>
                              </td>
                              <td>{student.nickName}</td>
                              <td>{student.code}</td>
                              <td>{getGradeName(student.gradeId)}</td>
                              <td>
                                {new Date(student.dob).toLocaleDateString("vi-VN", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })}
                              </td>
                              <td>
                                {student.status === 1 ? (
                                  <span className="badge badge-success">Active</span>
                                ) : (
                                  <span className="badge badge-secondary">Inactive</span>
                                )}
                              </td>
                              <td className="project-actions">
                                <a className="btn btn-outline-secondary mr-1">
                                  <i className="icon-eye"></i>
                                </a>
                                <a className="btn btn-outline-secondary">
                                  <i className="icon-pencil"></i>
                                </a>

                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal for adding students without class */}
        {/* Modal for adding students without class */}
        {showAddModal && (
          <div className="modal" style={{ display: "block", zIndex: 1050 }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add Children To Class</h5>
                  <button type="button" className="close" onClick={this.handleCloseModal}>
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Full Name</th>
                        <th>Nick Name</th>
                        <th>Code</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsWithoutClass.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center">No students available</td>
                        </tr>
                      ) : (
                        studentsWithoutClass.map((student) => (
                          <tr key={student.studentId}>
                            <td>{student.fullName}</td>
                            <td>{student.nickName}</td>
                            <td>{student.code}</td>
                            <td>
                              <input
                                type="checkbox"
                                onChange={() => this.handleCheckboxChange(student.studentId)}
                                checked={this.state.selectedStudents.includes(student.studentId)}
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={this.handleCloseModal}>
                    Close
                  </button>
                  <button type="button" className="btn btn-primary" onClick={this.handleAssignSelectedStudents}>
                    Assign to Class
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }
}


const mapStateToProps = ({ ioTReducer }) => ({
  isSecuritySystem: ioTReducer.isSecuritySystem,
});

export default connect(mapStateToProps)(withRouter(ViewChildrenByClassID));
