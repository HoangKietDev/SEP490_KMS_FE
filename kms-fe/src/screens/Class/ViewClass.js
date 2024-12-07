import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from 'react-router-dom';
import axios from "axios";
class ViewClass extends React.Component {
  state = {
    ProjectsData: [],
    GradesData: [],
    statusFilter: '',
    gradeFilter: '',
    nameFilter: '',
    selectedClassIds: [], // Thêm trạng thái để lưu các lớp đã chọn
  };

  componentDidMount() {
    window.scrollTo(0, 0);
    fetch(`${process.env.REACT_APP_API_URL}/api/Class/GetAllClass`)
      .then((response) => response.json())
      .then((data) => {
        this.setState({ ProjectsData: data });
      })
      .catch((error) => {
        console.error("Error fetching class data: ", error);
      });

    fetch(`${process.env.REACT_APP_API_URL}/api/Grade`)
      .then((response) => response.json())
      .then((data) => {
        this.setState({ GradesData: data });
      })
      .catch((error) => {
        console.error("Error fetching grade data: ", error);
      });
  }
  handleCheckboxChange = (classId) => {
    this.setState((prevState) => {
      const { selectedClassIds } = prevState;
      if (selectedClassIds.includes(classId)) {
        return {
          selectedClassIds: selectedClassIds.filter(id => id !== classId), // Xóa nếu đã chọn
        };
      } else {
        return {
          selectedClassIds: [...selectedClassIds, classId], // Thêm nếu chưa chọn
        };
      }
    });
  };

  handleEdit = (classId) => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user && user.user.roleId === 3) {
      this.props.history.push(`/updateclass/${classId}`);
    } else if (user && user.user.roleId === 4) {
      this.props.history.push(`/updateclass2/${classId}`);
    } else {
      console.error("User roleId không hợp lệ hoặc không tồn tại.");
    }
  };
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
        `${process.env.REACT_APP_API_URL}/api/Class/ImportClassExcel`,
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
      console.error("Error importing class: ", error);
      this.setState({
        notificationText: "Failed to import schedule. Please try again.",
        notificationType: "error",
        showNotification: true,
      });
    }
  };

  handleView = (classId) => {
    this.props.history.push(`/viewchildrenbyclassid/${classId}`);
  };

  handleStatusFilterChange = (event) => {
    this.setState({ statusFilter: event.target.value });
  };

  handleGradeFilterChange = (event) => {
    this.setState({ gradeFilter: event.target.value });
  };

  handleNameFilterChange = (event) => {
    this.setState({ nameFilter: event.target.value });
  };

  formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/assets/excel/Class_import.xlsx';
    link.download = 'classimportsample.xlsx';
    link.click();
  };
  getGradeName = (gradeId) => {
    const { GradesData } = this.state;
    const grade = GradesData.find((g) => g.gradeId === gradeId);
    return grade ? grade.name : 'N/A';
  };
  handleApprove = () => {
    const { selectedClassIds } = this.state;

    if (selectedClassIds.length > 0) {
      // Duyệt qua từng classId và gọi API lần lượt
      const updateClassStatus = async () => {
        for (let i = 0; i < selectedClassIds.length; i++) {
          const classId = selectedClassIds[i];

          try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/Class/UpdateStatusClass/${classId}/1`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
            });

            const data = await response.json();
            console.log(`Class ${classId} updated successfully:`, data);
          } catch (error) {
            console.error(`Error updating class ${classId}:`, error);
          }
        }

        // Reset lại các lớp đã chọn sau khi hoàn thành
        this.setState({ selectedClassIds: [] }, this.fetchClasses); // Gọi lại API để tải lại danh sách lớp học
      };

      // Gọi hàm updateStatusClass
      updateClassStatus();
    } else {
      console.log('No classes selected.');
    }
  };


  handleReject = () => {
    const { selectedClassIds } = this.state;

    if (selectedClassIds.length > 0) {
      // Duyệt qua từng classId và gọi API lần lượt
      const updateClassStatus = async () => {
        for (let i = 0; i < selectedClassIds.length; i++) {
          const classId = selectedClassIds[i];

          try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/Class/UpdateStatusClass/${classId}/0`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
            });

            const data = await response.json();
            console.log(`Class ${classId} updated successfully:`, data);
          } catch (error) {
            console.error(`Error updating class ${classId}:`, error);
          }
        }

        // Reset lại các lớp đã chọn sau khi hoàn thành
        this.setState({ selectedClassIds: [] }, this.fetchClasses); // Gọi lại API để tải lại danh sách lớp học
      };

      // Gọi hàm updateStatusClass
      updateClassStatus();
    } else {
      console.log('No classes selected.');
    }
  };

  // Hàm fetch lại danh sách lớp học sau khi cập nhật
  fetchClasses = () => {
    fetch(`${process.env.REACT_APP_API_URL}/api/Class/GetAllClass`)
      .then((response) => response.json())
      .then((data) => {
        this.setState({ ProjectsData: data });
      })
      .catch((error) => {
        console.error("Error fetching class data: ", error);
      });
  };


  render() {
    const { ProjectsData, statusFilter, gradeFilter, nameFilter, GradesData } = this.state;

    const user = JSON.parse(sessionStorage.getItem('user'));
    const isRole4 = user && user.user.roleId === 4;

    const filteredData = ProjectsData.filter(classData => {
      const statusMatch = statusFilter === '' ||
        (statusFilter === 'active' && classData.status === 1) ||
        (statusFilter === 'inactive' && classData.status === 0);

      const gradeMatch = gradeFilter === '' || classData.gradeId === parseInt(gradeFilter);

      const nameMatch = nameFilter === '' || classData.className.toLowerCase().includes(nameFilter.toLowerCase());

      return statusMatch && gradeMatch && nameMatch;
    });

    return (
      <div style={{ flex: 1 }} onClick={() => document.body.classList.remove("offcanvas-active")}>
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
                    <div className="form-inline mb-3">
                      <div className="form-group mr-3">
                        <label htmlFor="nameFilter" className="mr-2">Class Name:</label>
                        <input
                          type="text"
                          id="nameFilter"
                          className="form-control"
                          value={nameFilter}
                          onChange={this.handleNameFilterChange}
                          placeholder="Enter class name"
                        />
                      </div>
                      <div className="form-group mr-3">
                        <label htmlFor="statusFilter" className="mr-2">Status:</label>
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

                      <div className="form-group mr-3">
                        <label htmlFor="gradeFilter" className="mr-2">Grade:</label>
                        <select
                          id="gradeFilter"
                          className="form-control"
                          value={gradeFilter}
                          onChange={this.handleGradeFilterChange}
                        >
                          <option value="">All</option>
                          {GradesData.map(grade => (
                            <option key={grade.gradeId} value={grade.gradeId}>
                              {grade.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group mr-3">
                        <a
                          onClick={this.handleDownload}
                          className="btn btn-success text-white d-flex align-items-center"
                        >
                          <i className="icon-arrow-down mr-2"></i>Download Template
                        </a>
                      </div>
                      <div className="form-group mr-3">
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
                          accept=".xls,.xlsx" // Chỉ chấp nhận file Excel
                        />
                      </div>
                    </div>
                    <div className="table-responsive">
                      <table className="table m-b-0 table-hover">
                        <thead className="thead-light">
                          <tr>
                            {isRole4 && <th>
                              <button
                                className="btn btn-primary"
                                onClick={this.handleSelectAll}
                              >
                                Select All
                              </button></th>} {/* Thêm cột checkbox nếu là roleId 4 */}
                            <th>Class Name</th>
                            <th>Number of Students</th>
                            <th>Grade</th>
                            <th>Status</th>
                            <th>Teachers</th> {/* Thêm cột giáo viên */}
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.map((classData, classIndex) => (
                            <tr key={"class" + classIndex}>
                              {isRole4 && (
                                <td>
                                  <div className="fancy-checkbox d-inline-block">
                                    <label>
                                      <input
                                        type="checkbox"
                                        checked={this.state.selectedClassIds.includes(classData.classId)}
                                        onChange={() => this.handleCheckboxChange(classData.classId)}
                                      />
                                      <span></span>
                                    </label>
                                  </div>
                                </td>
                              )}
                              <td>{classData.className}</td>
                              <td>{classData.number}</td>
                              <td>{this.getGradeName(classData.gradeId)}</td>
                              <td>
                                {classData.status === 1 ? (
                                  <span className="badge badge-success">Active</span>
                                ) : (
                                  <span className="badge badge-default">Inactive</span>
                                )}
                              </td>
                              <td>
                                {classData.teachers.map((teacher, teacherIndex) => (
                                  <div key={teacherIndex}>{teacher.teacherName} - {teacher.code}</div>
                                ))}
                              </td>
                              <td className="project-actions">
                                <a className="btn btn-outline-secondary mr-1" onClick={() => this.handleView(classData.classId)}>
                                  <i className="icon-eye"></i>
                                </a>
                                <a className="btn btn-outline-secondary mr-1" onClick={() => this.handleEdit(classData.classId)}>
                                  <i className="icon-pencil"></i>
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {isRole4 && (
                      <div className="form-group text-right">
                        <button className="btn btn-danger" onClick={this.handleReject}>
                          Reject
                        </button>
                        <button className="btn btn-success ml-2" onClick={this.handleApprove}>
                          Approve
                        </button>
                      </div>
                    )}
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

export default connect(mapStateToProps)(withRouter(ViewClass));
