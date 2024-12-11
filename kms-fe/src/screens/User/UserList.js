
import React, { useState, useEffect } from 'react';
import PageHeader from "../../components/PageHeader";
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import { getCookie } from '../../components/Auth/Auth';
import Pagination from "../../components/Common/Pagination";
import Notification from "../../components/Notification";
import { RotatingLines } from 'react-loader-spinner';

class UserList extends React.Component {
  state = {
    users: [],
    searchText: "",
    filterStatus: "all", // Giá trị 'all', '1', hoặc '0' để lọc trạng thái
    filterRoles: "all",
    roleMap: {
      1: "Manager System",
      2: "Parent",
      3: "Staff",
      4: "Principal",
      5: "Teacher",
    },

    currentPage: 1,
    itemsPerPage: 10,

    isUploading: false,  // Biến để theo dõi trạng thái upload

    showNotification: false, // State to control notification visibility
    notificationText: "", // Text for the notification
    notificationType: "success" // Type of notification (success or error)
  };
  componentDidMount() {
    window.scrollTo(0, 0);
    this.fetchData();
  }

  fetchData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/User`);
      const data = response.data;
      this.setState({ users: data });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  handleCreateUser = () => {
    // Chuyển hướng đến cap nhat category
    this.props.history.push(`/create-user`);
  };

  handleViewDetail = (semesterId) => {
    // Chuyển hướng đến trang chi tiet category
    this.props.history.push(`/semester-detail/${semesterId}`);
  };


  handleSearchChange = (e) => {
    this.setState({ searchText: e.target.value });
  };


  handleStatusFilterChange = (e) => {
    this.setState({ filterStatus: e.target.value });
  };

  handleRolesFilterChange = (e) => {
    this.setState({ filterRoles: e.target.value });
  };

  handlePageChange = (pageNumber) => {
    this.setState({ currentPage: pageNumber });
  };

  handleStatusChange = async (userId) => {
    try {
      // API call to update the status of the user
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/User/UpdateUserStatus`, {
        userId,
      });

      if (response.status === 200) {
        // Successfully updated status, update local state
        this.setState((prevState) => {
          const updatedUsers = prevState.users.map((user) =>
            user.userId === userId ? { ...user, status: user.status === 1 ? 0 : 1 } : user // Toggle the status between 0 and 1
          );
          return { users: updatedUsers };
        });
        this.setState({
          notificationText: "User status updated successfully!",
          notificationType: "success",
          showNotification: true
        });
      } else {
        this.setState({
          notificationText: "Failed to update user status!",
          notificationType: "error",
          showNotification: true
        });
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      this.setState({
        notificationText: "Failed to update user status 111!",
        notificationType: "error",
        showNotification: true
      });
    }
  };

  handleImportUser = async (event) => {
    // Ngăn chặn hành vi mặc định của form nếu bạn đang dùng trong một form
    event.preventDefault();
    const file = this.fileInput.files[0]; // Lấy file từ ref

    if (!file) {
      this.setState({
        notificationText: "Please select a file to import!",
        notificationType: "info",
        showNotification: true
      });
      return;
    }

    this.setState({ isUploading: true });  // Bật loading khi bắt đầu upload
    const formData = new FormData();
    formData.append('file', file); // Thêm file vào FormData

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/Account/ImportListAccounts`, formData, {
        headers: {
          'accept': '*/*', // Chỉ để header này
        },
      });

      // Kiểm tra phản hồi từ API
      if (response.status === 200) {
        this.setState({
          notificationText: "Import successful!!",
          notificationType: "success",
          showNotification: true
        });
        // Có thể làm thêm các thao tác khác như refresh data...
        await this.fetchData() // Gọi lại hàm fetch dữ liệu
      }
    } catch (error) {
      console.error("Error importing user: ", error);
      const errormessage = error?.response?.data || "Failed to import user. Please try again.!!"
      this.setState({
        notificationText: errormessage,
        notificationType: "error",
        showNotification: true
      });
    } finally {
      this.setState({ isUploading: false });  // Tắt loader sau khi tải lên xong
    }
  };



  render() {

    const { users, searchText, filterStatus, filterRoles } = this.state;
    const userData = getCookie('user')?.user;
    const roleId = userData.roleId


    // Lọc danh sách
    const filteredUsers = users
      .filter((item) =>
        item.mail?.toLowerCase().includes(searchText?.toLowerCase()) // Tìm kiếm theo tên
      )
      .filter((item) =>
        filterStatus === "all" ? true : item.status.toString() === filterStatus // Lọc theo trạng thái
      )
      .filter((item) =>
        filterRoles === "all" ? true : item.roleId.toString() === filterRoles // Lọc theo trạng thái
      );

    // phan trang
    const { currentPage, itemsPerPage } = this.state;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

    const { showNotification, notificationText, notificationType } = this.state;

    const statusOptions = [
      { value: 1, label: "Active", className: "badge-success" },
      { value: 0, label: "Inactive", className: "badge-default" },
    ];
    return (
      <div
        style={{ flex: 1 }}
        onClick={() => {
          document.body.classList.remove("offcanvas-active");
        }}
      >
        {showNotification && (
          <Notification
            type={notificationType}
            position="top-right"
            dialogText={notificationText}
            show={showNotification}
            onClose={() => this.setState({ showNotification: false })}
          />
        )}
        <div>
          <div className="container-fluid">
            <PageHeader
              HeaderText="User Management"
              Breadcrumb={[
                { name: "User", navigate: "" },
              ]}
            />
            <div className="row clearfix">
              <div className="col-lg-12 col-md-12">
                <div className="card planned_task">
                  <div className="header d-flex justify-content-between">
                    <h2>User Manager</h2>
                    {roleId === 1 ? (
                      <div>
                        <input
                          type="file"
                          ref={(input) => (this.fileInput = input)}
                          style={{ display: 'none' }}
                          accept=".xlsx, .xls"
                          onChange={this.handleImportUser}
                        />
                        {this.state.isUploading && (
                          <RotatingLines color="#00BFFF" height={50} width={50} />
                        )}
                        {/* <a onClick={() => this.fileInput.click()} class="btn btn-info text-white mr-2" style={{ width: "200px", textAlign: 'center' }} disabled={false}>{this.state.isUploading ? 'Importing' : 'Import Excel'}</a> */}

                        <a
                          onClick={(e) => {
                            if (this.state.isUploading) {
                              e.preventDefault(); // Ngừng hành động mặc định của link khi đang upload
                              return;
                            }
                            this.fileInput.click(); // Thực thi hành động bình thường khi không đang upload
                          }}
                          className="btn btn-info text-white mr-2"
                          style={{
                            width: "200px",
                            textAlign: 'center',
                            pointerEvents: this.state.isUploading ? 'none' : 'auto', // Disable click khi đang upload
                            opacity: this.state.isUploading ? 0.5 : 1 // Giảm độ sáng khi vô hiệu hóa
                          }}
                        >
                          {this.state.isUploading ? 'Importing' : 'Import Excel'}
                        </a>
                        <a onClick={() => this.handleCreateUser()} class="btn btn-success text-white " style={{ width: "200px", textAlign: 'center' }}>Create New User</a>
                      </div>
                    ) : null}

                  </div>
                  <div className="form-group row pl-3">
                    <div className="col-md-3 mb-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by Email"
                        value={searchText}
                        onChange={this.handleSearchChange}
                      />
                    </div>
                    <div className="col-md-3  mb-2">
                      <select
                        className="form-control"
                        value={filterStatus}
                        onChange={this.handleStatusFilterChange}
                      >
                        <option value="all">All Status</option>
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                      </select>
                    </div>

                    <div className="col-md-3  mb-2">
                      <select
                        className="form-control"
                        value={filterRoles}
                        onChange={this.handleRolesFilterChange}
                      >
                        <option value="all">All Roles</option>
                        <option value="1">Manager System</option>
                        <option value="2">Parent</option>
                        <option value="3">Staff</option>
                        <option value="4">Principal</option>
                        <option value="5">Teacher</option>
                      </select>
                    </div>

                  </div>
                </div>
              </div>
              <div className="col-lg-12">
                <div className="card">
                  <div className="table-responsive">
                    <table className="table m-b-0 table-hover">
                      <thead className="">
                        <tr className="theme-color">
                          <th>#</th>
                          <th>FirstName</th>
                          <th>LastName</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Gender</th>
                          <th>Role</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map((item, i) => {
                          return (
                            <tr key={"dihf" + i}>

                              <td className="project-title">
                                <th scope="row">{i + 1}</th>
                              </td>
                              <td>
                                {item?.firstname}
                              </td>
                              <td>
                                {item?.lastName}
                              </td>
                              <td>
                                {item?.mail}
                              </td>
                              <td>
                                {item?.phoneNumber}
                              </td>
                              <td>
                                {item?.gender === 0 ? "FeMale" : "Male"}
                              </td>
                              <td>
                                {this.state.roleMap[item?.roleId] || "Unknown Role"}
                              </td>
                              <td>
                                <select
                                  value={item?.status}
                                  onChange={(e) => this.handleStatusChange(item.userId, parseInt(e.target.value))}
                                  className={`form-control ${item?.status === 1 ? 'badge-success' : 'badge-default'}`}
                                >
                                  {statusOptions.map(option => (
                                    <option key={option.value} value={option.value} className={option.className}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="pt-4">
                    <Pagination
                      currentPage={currentPage}
                      totalItems={filteredUsers.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={this.handlePageChange}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div >
      </div >
    );
  }
}

export default withRouter(UserList);