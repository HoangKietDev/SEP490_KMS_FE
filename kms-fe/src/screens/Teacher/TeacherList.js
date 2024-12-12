import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from 'react-router-dom';
import axios from "axios";
import Pagination from "../../components/Common/Pagination";
import Notification from "../../components/Notification";
import { addNotificationByUserId } from "../../components/Common/Notification";
import defaultImage from "../../assets/images/profile-default.jpg"

class TeacherList extends React.Component {
  state = {
    TeacherListData: [], // State để lưu trữ dữ liệu từ API
    filteredTeacherListData: [], // Dữ liệu sau khi lọc
    filterClass: "", // Bộ lọc theo số điện thoại
    filterCode: "", // Bộ lọc theo mã
    filterStatus: "", // Bộ lọc theo trạng thái
    currentPage: 1,
    itemsPerPage: 10,
    selectedTeacherIds: [], // Mảng lưu trữ các ID của các giáo viên đã chọn
    showNotification: false,
    notificationText: "",
    notificationType: "success",
  };

  componentDidMount() {
    window.scrollTo(0, 0);
    // Gọi API và cập nhật state
    const fetchData = async () => {
      try {
        const TeacherResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/Teacher/GetAllTeachers`);
        const Teacherdata = TeacherResponse.data;
        this.setState({ TeacherListData: Teacherdata, filteredTeacherListData: Teacherdata })


      } catch (error) {
        console.error('Error fetching category details:', error);
      }
    };
    fetchData();
  }
  handleSelectAllChange = (e) => {
    const isChecked = e.target.checked;
    const selectedTeacherIds = isChecked
      ? this.state.filteredTeacherListData.map(teacher => teacher.teacherId) // Chọn tất cả
      : []; // Bỏ chọn tất cả
    this.setState({ selectedTeacherIds });
  };
  handleIndividualCheckboxChange = (e, teacherId) => {
    const { selectedTeacherIds } = this.state;
    if (e.target.checked) {
      this.setState({ selectedTeacherIds: [...selectedTeacherIds, teacherId] }); // Thêm ID khi chọn
    } else {
      this.setState({ selectedTeacherIds: selectedTeacherIds.filter(id => id !== teacherId) }); // Loại bỏ ID khi bỏ chọn
    }
  };

  filterTeacherList = () => {
    const { TeacherListData, filterClass, filterCode, filterStatus } = this.state;
    const filteredData = TeacherListData?.filter((teacher) => {
      const matchesPhone = filterClass === "" || teacher?.classes[0]?.includes(filterClass);
      const matchesCode = filterCode === "" || teacher.code?.includes(filterCode.toLocaleUpperCase());
      const matchesStatus = filterStatus === "" || teacher.status === parseInt(filterStatus);
      return matchesPhone && matchesCode && matchesStatus;
    });
    this.setState({ filteredTeacherListData: filteredData });
  };

  handleFilterClass = (e) => {
    this.setState({ filterClass: e.target.value }, this.filterTeacherList);
  };

  handleFilterCodeChange = (e) => {
    this.setState({ filterCode: e.target.value }, this.filterTeacherList);
  };

  handleFilterStatusChange = (e) => {
    this.setState({ filterStatus: e.target.value }, this.filterTeacherList);
  };

  handleEdit = (teacherId) => {
    // Chuyển hướng đến trang cập nhật thông tin học sinh
    this.props.history.push(`/teacher-update/${teacherId}`);
  };

  handleDetail = (teacherId) => {
    // Chuyển hướng đến trang cập nhật thông tin học sinh
    this.props.history.push(`/teacher-detail/${teacherId}`);
  };
  changeRole = async (userID) => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/User/UpdateUserRole?userID=${userID}`);
      // Kiểm tra phản hồi từ API
      if (response.status === 200) {
        this.setState({
          notificationText: "Assigned Check in/out successfully.",
          notificationType: "success",
          showNotification: true,
        });
        addNotificationByUserId("Assigned Check in/out", "You have been Assign Checkin/out in this week", userID);
        // Cập nhật lại danh sách giáo viên sau khi thay đổi role
        this.componentDidMount(); // Hoặc có thể gọi lại API để tải lại danh sách giáo viên
      } else {
        this.setState({
          notificationText: "An error occurred while assigning Check in/out.",
          notificationType: "error",
          showNotification: true,
        });
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Error updating role");
    }
  };
  assignTeachers = async () => {
    const { selectedTeacherIds } = this.state;

    if (selectedTeacherIds.length === 0) {
      alert("Please select at least one teacher.");
      return;
    }

    try {
      // Chạy tất cả các yêu cầu API đồng thời bằng Promise.all
      const responses = await Promise.all(
        selectedTeacherIds.map((teacherId) => {
          return axios.put(`${process.env.REACT_APP_API_URL}/api/User/UpdateUserRole?userID=${teacherId}`);
        })
      );

      // Kiểm tra phản hồi từ API
      const allSuccess = responses.every((response) => response.status === 200);

      if (allSuccess) {
        // alert("Assigned Check in/out successfully.");
        this.setState({
          notificationText: "Assigned Check in/out successfully.",
          notificationType: "success",
          showNotification: true,
        });
        this.setState({ selectedTeacherIds: [] }); // Reset selected teacher IDs
      } else {
        alert("Failed to assign Check in/out.");
      }
    } catch (error) {
      console.error("Error during assignment:", error);
      this.setState({
        notificationText: "An error occurred while assigning Check in/out.",
        notificationType: "success",
        showNotification: true,
      });
      // alert("An error occurred while assigning Check in/out.");
    }
  };

  handlePageChange = (pageNumber) => {
    this.setState({ currentPage: pageNumber });
  };

  render() {
    const { filteredTeacherListData, selectedTeacherIds, showNotification, notificationText, notificationType } = this.state;

    // phan trang
    const { currentPage, itemsPerPage } = this.state;
    const indexOfLastItem = currentPage * itemsPerPage;
    const isAllSelected = filteredTeacherListData.length > 0 &&
      filteredTeacherListData.every(teacher => selectedTeacherIds.includes(teacher.teacherId));

    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredTeacherListData.slice(indexOfFirstItem, indexOfLastItem);

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
              HeaderText="Teacher Management"
              Breadcrumb={[
                { name: "Teacher Management", navigate: "1" },
                { name: "Teacher List", navigate: "" },
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
                <div className="card planned_task">
                  <div className="header d-flex justify-content-between">
                    <h2>Teacher Manager</h2>
                    <div className="col-md-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by Class"
                        value={this.state.filterClass}
                        onChange={this.handleFilterClass}
                      />
                    </div>
                    <div className="col-md-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by Code"
                        value={this.state.filterCode}
                        onChange={this.handleFilterCodeChange}
                      />
                    </div>
                    <div className="col-md-3">
                      <select
                        className="form-control"
                        value={this.state.filterStatus}
                        onChange={this.handleFilterStatusChange}
                      >
                        <option value="">All Status</option>
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-12 col-md-12">
                <div className="card">
                  <div className="body project_report">
                    {currentItems && currentItems.length !== 0 ?

                      <div className="table-responsive">
                        <table className="table m-b-0 table-hover">
                          <thead className="">
                            <tr className="theme-color">
                              <th>
                                <div className="fancy-checkbox d-inline-block">
                                  <label>
                                    <input
                                      type="checkbox"
                                      checked={isAllSelected} // Kiểm tra nếu tất cả giáo viên đã được chọn
                                      onChange={this.handleSelectAllChange} // Gọi hàm khi thay đổi trạng thái checkbox "Chọn tất cả"
                                    />
                                    <span></span>
                                  </label>
                                </div>
                              </th>
                              <th>#</th>
                              <th>Name</th>
                              <th>Code</th>
                              <th>Phone</th>
                              <th>Teacher</th>
                              <th>Class</th>
                              <th>Status</th>
                              <th>Assign Check in/out</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentItems?.map((teacher, index) => (
                              <React.Fragment key={"teacher" + index}>
                                <tr>
                                  <td>
                                    <div className="fancy-checkbox d-inline-block">
                                      <label>
                                        <input
                                          type="checkbox"
                                          checked={selectedTeacherIds.includes(teacher.teacherId)} // Kiểm tra nếu ID của giáo viên có trong mảng selectedTeacherIds
                                          onChange={(e) => this.handleIndividualCheckboxChange(e, teacher.teacherId)} // Gọi hàm khi thay đổi
                                        />
                                        <span></span>
                                      </label>
                                    </div>
                                  </td>
                                  <td>{index + 1}</td>
                                  <td>
                                    <img
                                      src={teacher?.avatar || defaultImage}
                                      alt="Avatar"
                                      style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        marginRight: "10px",
                                      }}
                                    />
                                    {teacher?.firstname + " " + teacher.lastName}
                                  </td>
                                  <td>{teacher.code}</td>
                                  <td>{teacher.phoneNumber}</td>
                                  <td>
                                    {teacher?.homeroomTeacher === 1 ? (
                                      <span className="badge badge-success">Homeroom Teacher</span>
                                    ) : (
                                      <span className="badge badge-info">Teacher</span>
                                    )}
                                  </td>
                                  <td>{teacher?.classes[0]}</td>
                                  <td>
                                    {teacher?.status === 1 ? (
                                      <span className="badge badge-success">Active</span>
                                    ) : teacher?.status === 0 ? (
                                      <span className="badge badge-default">InActive</span>
                                    ) : null}
                                  </td>
                                  <td className="project-actions">
                                    {teacher?.role === 6 ? (
                                      <a className="btn btn-outline-success mr-1"
                                        onClick={() => this.changeRole(teacher.teacherId)} // Gọi API với userID
                                      >
                                        <i className="icon-check"> Assigned</i>
                                      </a>
                                    ) : (
                                      <a
                                        className="btn btn-outline-danger mr-1"
                                        onClick={() => this.changeRole(teacher.teacherId)} // Gọi API với userID
                                      >
                                        <i className="icon-close"> Assign</i>
                                      </a>
                                    )}
                                  </td>


                                  <td className="project-actions">
                                    <a className="btn btn-outline-secondary mr-1"
                                      onClick={() => this.handleDetail(teacher.teacherId)} // Gọi hàm handleEdit
                                    >
                                      <i className="icon-eye"></i>
                                    </a>
                                    <a
                                      className="btn btn-outline-secondary"
                                      onClick={() => this.handleEdit(teacher.teacherId)} // Gọi hàm handleEdit
                                    >
                                      <i className="icon-pencil"></i>
                                    </a>
                                  </td>
                                </tr>
                              </React.Fragment>
                            ))}
                          </tbody>
                        </table>
                        <div className="text-right">
                          <button className="btn btn-primary m-4 text-center" onClick={this.assignTeachers}>
                            Assign Check in/out
                          </button>
                        </div>
                      </div>
                      : <p className="">No data available</p>
                    }
                    <div className="pt-4">
                      <Pagination
                        currentPage={currentPage}
                        totalItems={filteredTeacherListData.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={this.handlePageChange}
                      />
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

export default connect(mapStateToProps)(withRouter(TeacherList));
