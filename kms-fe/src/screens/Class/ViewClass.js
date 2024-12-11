import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from 'react-router-dom';
import axios from "axios";
import { getSession } from "../../components/Auth/Auth";
import Notification from "../../components/Notification";
class ViewClass extends React.Component {
  state = {
    ProjectsData: [],
    GradesData: [],
    statusFilter: '',
    gradeFilter: '',
    nameFilter: '',
    selectedClassIds: [], // Thêm trạng thái để lưu các lớp đã chọn
    showNotification: false,
    notificationText: "",
    notificationType: "success",
  };

  componentDidMount() {
    window.scrollTo(0, 0);
    const user = getSession("user");
    console.log(user, "sdsdsd");
    this.fetchClasses();
    // fetch(`${process.env.REACT_APP_API_URL}/api/Class/GetAllClass`)
    //   .then((response) => response.json())
    //   .then((data) => {
    //     this.setState({ ProjectsData: data });
    //   })
    //   .catch((error) => {
    //     console.error("Error fetching class data: ", error);
    //   });

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
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/Class/UpdateStatusClass/${classId}/2`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
            });

            const data = await response.json();
            this.setState({
              notificationText: "Class updated successfully",
              notificationType: "success",
              showNotification: true,
            });
          } catch (error) {
            console.error(`Error updating class ${classId}:`, error);
            this.setState({
              notificationText: "Error updating class",
              notificationType: "error",
              showNotification: true,
            });
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
  handleSubmitToPrin = () => {
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
            this.setState({
              notificationText: "Class updated successfully",
              notificationType: "success",
              showNotification: true,
            });
          } catch (error) {
            console.error(`Error updating class ${classId}:`, error);
            this.setState({
              notificationText: "Error updating class",
              notificationType: "error",
              showNotification: true,
            });
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
            this.setState({
              notificationText: "Class updated successfully",
              notificationType: "success",
              showNotification: true,
            });
          } catch (error) {
            console.error(`Error updating class ${classId}:`, error);
            this.setState({
              notificationText: "Error updating class",
              notificationType: "error",
              showNotification: true,
            });
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
  // Hàm này sẽ được gọi khi người dùng click vào checkbox "Chọn tất cả"
  handleSelectAllChange = (e) => {
    const isChecked = e.target.checked;  // Kiểm tra trạng thái checkbox "Chọn tất cả"
    const selectedClassIds = isChecked
      ? this.state.ProjectsData.map(classData => classData.classId)  // Chọn tất cả các lớp
      : [];  // Bỏ chọn tất cả nếu không chọn

    this.setState({ selectedClassIds });
  };

  // Kiểm tra xem tất cả các lớp đã được chọn hay chưa
  isAllSelected = () => {
    return this.state.ProjectsData.length > 0 && this.state.selectedClassIds.length === this.state.ProjectsData.length;
  };
  // Hàm fetch lại danh sách lớp học sau khi cập nhật
  fetchClasses = async () => {
    try {
      const user = getSession("user"); // Giả sử bạn đã có hàm getSession để lấy dữ liệu cookie

      if (!user) {
        console.error("User not found in cookies");
        return;
      }

      const roleId = user.user.roleId; // Lấy roleId từ user

      // Gửi yêu cầu API với axios
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/Class/GetAllClass`);

      // Lấy dữ liệu từ response
      const data = response.data;

      // Lọc dữ liệu lớp theo roleId
      let filteredData;

      if (roleId === 4) { // Nếu là admin (roleId = 4), chỉ lấy các lớp có status = 1 hoặc 2
        filteredData = data?.filter((classItem) => classItem.status === 1 || classItem.status === 2);
      } else if (roleId === 3) { // Nếu là staff (roleId = 3), lấy tất cả các lớp có status = 0, 1, 2
        filteredData = data?.filter((classItem) => classItem.status === 0 || classItem.status === 1 || classItem.status === 2);
      } else {
        filteredData = data; // Nếu role không phải 3 hoặc 4, có thể lấy tất cả lớp (hoặc xử lý theo yêu cầu khác)
      }

      // Cập nhật state với dữ liệu đã lọc
      this.setState({ ProjectsData: filteredData });
    } catch (error) {
      // Xử lý lỗi nếu có
      console.error('Error fetching class data: ', error.response ? error.response.data : error.message);
    }
  };


  render() {
    const { ProjectsData, statusFilter, gradeFilter, nameFilter, GradesData, showNotification, notificationText, notificationType } = this.state;

    const user = getSession('user');
    const isRole4 = user && user.user.roleId === 4;
    const isRole3 = user && user.user.roleId === 3; // Kiểm tra roleId = 3

    // Lọc dữ liệu lớp
    const filteredData = ProjectsData.filter(classData => {
      // Lọc status
      let statusMatch = false;

      if (isRole4) {
        // Nếu roleId là 4 (admin), chỉ lọc các lớp có status là 'pending' hoặc 'approved'
        statusMatch = statusFilter === '' ||
          (statusFilter === 'pending' && (classData.status === 1 || classData.status === 2)) ||  // Lọc status là pending (1 hoặc 2)
          (statusFilter === 'approved' && classData.status === 0); // Lọc status là approved (0)
      } else if (isRole3) {
        // Nếu roleId là 3 (staff), có thể lọc các lớp có status là 'draft', 'pending' hoặc 'approved'
        statusMatch = statusFilter === '' ||
          (statusFilter === 'draft' && classData.status === 0) ||  // Lọc status là draft (0)
          (statusFilter === 'pending' && (classData.status === 1 || classData.status === 2)) ||  // Lọc status là pending (1 hoặc 2)
          (statusFilter === 'approved' && classData.status === 0); // Lọc status là approved (0)
      }

      // Lọc grade
      const gradeMatch = gradeFilter === '' || classData.gradeId === parseInt(gradeFilter);

      // Lọc name
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
                          {user && user.user.roleId === 3 ? (
                            <>
                              <option value="draft">Draft</option>
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                            </>
                          ) : (
                            <>
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                            </>
                          )}
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
                            <th>
                              <div className="fancy-checkbox d-inline-block">
                                <label>
                                  <input
                                    type="checkbox"
                                    checked={this.isAllSelected()}  // Kiểm tra nếu tất cả lớp đã được chọn
                                    onChange={this.handleSelectAllChange}  // Gọi hàm để chọn/bỏ chọn tất cả
                                  />
                                  <span></span>
                                </label>
                              </div>
                            </th>

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

                              <td>
                                <div className="fancy-checkbox d-inline-block">
                                  <label>
                                    <input
                                      type="checkbox"
                                      checked={this.state.selectedClassIds.includes(classData.classId)}  // Kiểm tra nếu classId có trong selectedClassIds
                                      onChange={() => this.handleCheckboxChange(classData.classId)}  // Xử lý khi người dùng click vào checkbox của một lớp
                                    />
                                    <span></span>
                                  </label>
                                </div>
                              </td>


                              <td>{classData.className}</td>
                              <td>{classData.number}</td>
                              <td>{this.getGradeName(classData.gradeId)}</td>
                              <td>
                                {classData.status === 0 ? (
                                  <span className="badge badge-default">Draft</span>
                                ) : classData.status === 1 ? (
                                  <span className="badge badge-warning">Pending</span>
                                ) : (
                                  <span className="badge badge-success">Approved</span>
                                )}
                              </td>
                              <td>
                                {classData.teachers.map((teacher, teacherIndex) => (
                                  <div key={teacherIndex}>+ {teacher.teacherName} - {teacher.code}</div>
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


                    {isRole4 && ProjectsData.length > 0 && (
                      <div className="form-group text-right m-2">
                        <button className="btn btn-danger" onClick={this.handleReject}>
                          Reject
                        </button>
                        <button className="btn btn-success ml-2" onClick={this.handleApprove}>
                          Approve
                        </button>
                      </div>
                    )}
                    {isRole3 && ProjectsData.length > 0 && (
                      <div className="form-group text-right m-2">
                        <button className="btn btn-primary" onClick={this.handleSubmitToPrin}>
                          Submit to Principal
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
