import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
// import { withRouter } from 'react-router-dom';
import axios from "axios";
import Login from "../Login";
import { getSession } from "../../components/Auth/Auth";
import { addNotificationByRoleId, addNotificationByUserId } from "../../components/Common/Notification";
import Notification from "../../components/Notification";
import Pagination from "../../components/Common/Pagination";



class ScheduleList extends React.Component {
  state = {
    ScheduleListData: [],
    filteredSchedules: [],
    classData: [],
    semesterListData: [],
    myChild: [],

    showNotification: false, // State to control notification visibility
    notificationText: "", // Text for the notification
    notificationType: "success", // Type of notification (success or error)

    searchText: "",
    filterStatus: "all", // Giá trị 'all', '1', hoặc '0' để lọc trạng thái

    selectedItems: [], // Mảng lưu trữ các dịch vụ đã chọn


    currentPage: 1,
    itemsPerPage: 5,
  };

  componentDidMount() {
    const userData = getSession('user')?.user;
    const roleId = userData.roleId
    window.scrollTo(0, 0);
    this.fetchData();
  }

  fetchData = async () => {
    const userData = getSession('user')?.user;
    const roleId = userData.roleId
    try {
      // Nếu là Teacher (roleId = 5), lấy danh sách classId mà giáo viên đó dạy
      let allowedClassIds = [];
      if (roleId === 5 || roleId === 6) { // Teacher
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/Class/GetClassesByTeacherId/${userData.userId}`);
          allowedClassIds = response.data?.map((cls) => cls.classId) || [];
        } catch (error) {
          console.error("Error fetching teacher's classes: ", error);
        }
        console.log(allowedClassIds);

      } else if (roleId === 2) { // Parent
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/Children/GetAllChildren`);
          // Lấy tất cả classId từ danh sách con
          const myChild = response.data?.filter(child => child.parentId === userData.userId)
          allowedClassIds = myChild.reduce((acc, student) => {
            student.classes.forEach(cls => {
              if (!acc.includes(cls.classId)) {
                acc.push(cls.classId); // Thêm classId nếu chưa có trong mảng
              }
            });
            return acc;
          }, []);
          this.setState({ myChild });
        } catch (error) {
          console.error("Error fetching parent's children: ", error);
        }
      }
      axios.get(`${process.env.REACT_APP_API_URL}/api/Schedule/GetAllSchedules`)
        .then((response) => {
          const allSchedules = response.data;
          let filteredSchedules = []
          // Lọc dữ liệu nếu là Teacher (roleId = 5) hoặc Parent (roleId = 2)
          if (roleId === 5 || roleId === 6 || roleId === 2) {
            filteredSchedules = allSchedules.filter((schedule) => allowedClassIds.includes(schedule.classId))
          }
          else if (roleId === 4) {
            filteredSchedules = allSchedules.filter((schedule) => schedule?.status !== 0)
          }
          else filteredSchedules = allSchedules
          console.log(filteredSchedules);

          this.setState({ ScheduleListData: filteredSchedules, filteredSchedules: filteredSchedules });
        })
        .catch((error) => {
          console.error("Error fetching data: ", error);
        });

      axios.get(`${process.env.REACT_APP_API_URL}/api/Semester/GetAllSemester`)
        .then((response) => {
          this.setState({ semesterListData: response.data });
        })
        .catch((error) => {
          console.error("Error fetching data: ", error);
        });

      axios.get(`${process.env.REACT_APP_API_URL}/api/Class/GetAllClass`)
        .then((response) => {
          this.setState({ classData: response.data });
        })
        .catch((error) => {
          console.error("Error fetching data: ", error);
        });

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Function to handle status change and call API
  handleStatusChange = async (data, scheduleId, newStatus) => {
    try {
      let formdata = {
        scheduleId,
        startDate: data?.startDate,
        endDate: data?.endDate,
        classId: data?.classId,
        status: newStatus,
        classId: data?.classId,
        teacherName: data?.teacherName
      }
      await axios.put(`${process.env.REACT_APP_API_URL}/api/Schedule/UpdateSchedule`, formdata);

      // Update the state locally after a successful API call
      this.setState((prevState) => ({
        ScheduleListData: prevState.ScheduleListData.map(schedule =>
          schedule.scheduleId === scheduleId ? { ...schedule, status: newStatus } : schedule
        )
      }));
      this.setState({
        notificationText: "Status updated successfully!",
        notificationType: "success",
        showNotification: true
      });
    } catch (error) {
      console.error("Error updating status:", error);
      this.setState({
        notificationText: "Status updated Error!",
        notificationType: "error",
        showNotification: true
      });
    }
  };

  handleDetailSchedule = (classId) => {
    this.props.history.push(`/schedule?classId=${classId}`);
  }

  handleCreateSchedule = () => {
    this.props.history.push(`/create-schedule`);
  }

  handleSearchChange = (e) => {
    this.setState({ searchText: e.target.value });
  };

  handleStatusFilterChange = (e) => {
    this.setState({ filterStatus: e.target.value });
  };

  handleClassSelectChange = (event) => {
    const selectedStudentId = event.target.value;
    if (selectedStudentId === 'all') {
      this.setState({ selectedClassId: null }); // Nếu chọn 'All Your Children', bỏ lọc theo classId
    } else {
      const selectedChild = this.state.myChild.find(child => child.studentId.toString() === selectedStudentId);
      this.setState({
        selectedClassId: selectedChild?.classes?.map(cls => cls.classId) || [] // Lấy tất cả classId của child đã chọn
      });
    }
  };

  handleBulkStatusUpdate = async (newStatus) => {
    const { selectedItems, filteredSchedules } = this.state;
    const scheduleToUpdate = filteredSchedules.filter(schedule => selectedItems.includes(schedule.scheduleId));

    if (scheduleToUpdate.length === 0) {
      this.setState({
        notificationText: "No schedule selected!",
        notificationType: "error",
        showNotification: true,
      });
      return;
    }
    try {
      // Gửi từng yêu cầu cập nhật cho mỗi service
      for (const item of scheduleToUpdate) {
        const updated = {
          scheduleId: item?.scheduleId,
          startDate: item?.startDate,
          endDate: item?.endDate,
          classId: item?.classId,
          status: newStatus,
          classId: item?.classId,
          teacherName: item?.teacherName
        };

        // Gửi yêu cầu cập nhật cho từng bản ghi
        const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/Schedule/UpdateSchedule`, updated);

        // Sau khi mỗi yêu cầu thành công, cập nhật filteredServices
        this.setState(prevState => {
          const updatedListData = prevState.filteredSchedules.map(item =>
            item.scheduleId === updated.scheduleId ? { ...item, status: newStatus } : item
          );
          return { filteredSchedules: updatedListData };
        });


      }
      // Thông báo thành công cho mỗi bản ghi
      this.setState({
        notificationText: `${scheduleToUpdate.length} Schedule status updated successfully!`,
        notificationType: "success",
        showNotification: true,
      });
      // Sau khi hoàn thành tất cả, reset selectedItems
      this.setState({ selectedItems: [] });
      this.fetchData();

    } catch (error) {
      console.log(error);
      const errorMessage = error?.response?.data?.message
      this.setState({
        notificationText: errorMessage || "Error updating status for one or more Schedule!",
        notificationType: "error",
        showNotification: true,
      });
    }
  };

  handleSelect = (id) => {
    this.setState(prevState => {
      const selectedItems = prevState.selectedItems.includes(id)
        ? prevState.selectedItems.filter(id => id !== id)
        : [...prevState.selectedItems, id];
      return { selectedItems };
    });
    console.log(this.state.selectedItems);

  };

  handleSelectAll = () => {
    this.setState(prevState => {
      if (prevState.selectedItems.length === prevState.filteredSchedules.length) {
        return { selectedItems: [] }; // Unselect all
      }
      const allServiceIds = prevState.filteredSchedules.map(item => item.scheduleId);
      return { selectedItems: allServiceIds }; // Select all
    });
    console.log(this.state.selectedItems, this.state.filteredSchedules);

  };



  handlePageChange = (pageNumber) => {
    this.setState({ currentPage: pageNumber });
  };

  render() {
    const { ScheduleListData, classData, semesterListData, myChild, selectedClassId, selectedItems } = this.state;
    const { searchText, filterStatus } = this.state;

    const { showNotification, notificationText, notificationType } = this.state;


    const statusOptions = [
      { value: 0, label: "Draff", className: "badge-default" },
      { value: 1, label: "Pending", className: "badge-info" },
      { value: 2, label: "Approved", className: "badge-success" },
    ];

    const userData = getSession('user')?.user;
    const roleId = userData?.roleId
    



    // Lọc danh sách
    console.log(ScheduleListData);

    const filteredSchedules = ScheduleListData
      .filter((item) => {
        const classDetail = classData?.find(i => i.classId === item?.classId);
        const semesterDetail = semesterListData?.find(i => i.semesterId === classDetail?.semesterId);

        // Điều kiện tìm kiếm
        const classNameMatch = classDetail?.className?.toLowerCase().includes(searchText.toLowerCase());
        const semesterNameMatch = semesterDetail?.name?.toLowerCase().includes(searchText.toLowerCase());

        // Điều kiện lọc trạng thái
        const statusMatch = filterStatus === "all" ? true : item.status.toString() === filterStatus;

        // Lọc theo classId nếu có
        const classIdMatch = selectedClassId ? selectedClassId.includes(item.classId) : true;

        // Kết hợp tất cả các điều kiện
        return (classNameMatch || semesterNameMatch) && statusMatch && classIdMatch;
      });

    // phan trang
    const { currentPage, itemsPerPage } = this.state;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredSchedules.slice(indexOfFirstItem, indexOfLastItem);

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
              HeaderText="Schedule List"
              Breadcrumb={[
                { name: "Schedule List", navigate: "" },
              ]}
            />
            <div className="row clearfix">

              <div className="col-lg-12 col-md-12">
                <div className="card planned_task">
                  <div className="header d-flex justify-content-between">
                    <h2>Schedule List</h2>
                    {myChild && myChild.length !== 0 ?
                      <div className="col-md-3 mb-2" onChange={(e) => this.handleClassSelectChange(e)}>
                        <select className="form-control">
                          <option value="all">All Your Children</option>
                          {myChild.map((child, index) => (
                            <option key={index} value={child.studentId}>
                              {child.fullName} {/* Hiển thị tên của child */}
                            </option>
                          ))}
                        </select>
                      </div>
                      :
                      <div className="col-md-3 mb-2">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search by Name"
                          value={searchText}
                          onChange={this.handleSearchChange}
                        />
                      </div>
                    }
                    {roleId !== 2 && roleId !== 5 && roleId !== 6 ?
                      <div className="col-md-3  mb-2">
                        <select
                          className="form-control"
                          value={filterStatus}
                          onChange={this.handleStatusFilterChange}
                        >
                          <option value="all">All Status</option>
                          {roleId === 3 ? <option value="0">Draft</option> : <></>}
                          <option value="1">Pending</option>
                          <option value="2">Approved</option>
                        </select>
                      </div>
                      : <></>}

                    {roleId === 3 ? (
                      <a onClick={() => this.handleCreateSchedule()} class="btn btn-success text-white">Create New Schedule</a>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="col-lg-12 col-md-12">
                <div className="card">
                  <div className="body project_report">
                    {currentItems && currentItems.length !== 0 ?
                      <div className="table-responsive">
                        <table className="table m-b-0 table-hover">
                          <thead className="theme-color">
                            <tr>
                              <th>
                                {roleId === 4 &&
                                  <button
                                    className="btn btn-primary"
                                    onClick={this.handleSelectAll}
                                  >
                                    Select All
                                  </button>

                                } {/* Thêm cột checkbox nếu là roleId 4 */}
                              </th>
                              <th>Class</th>
                              <th>School Year</th>
                              <th>Start Date</th>
                              <th>End Date</th>
                              <th>Create By</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentItems?.map((request, index) => {
                              const classDetail = classData?.find(i => i.classId === request?.classId)
                              const semesterDetail = semesterListData?.find(i => i.semesterId === classDetail?.semesterId)
                              return (
                                <React.Fragment key={"schedule" + index}>
                                  <tr>
                                    <td>
                                      <div className="fancy-checkbox d-inline-block">
                                        <label>
                                          {roleId === 4 && (
                                            <input
                                              type="checkbox"
                                              onChange={() => this.handleSelect(request.scheduleId)}
                                              checked={selectedItems.includes(request.scheduleId)}  // Đảm bảo rằng checkbox được đánh dấu nếu serviceId nằm trong selectedServices
                                            />
                                          )}
                                          <span>{index + 1}</span>
                                        </label>
                                      </div>
                                    </td>
                                    <td
                                      onClick={() => this.handleDetailSchedule(request?.classId)}
                                      style={{ cursor: 'pointer' }}
                                      className="theme-color"
                                    >{classDetail?.className}</td>
                                    <td>
                                      {semesterDetail?.name}
                                    </td>
                                    <td>{semesterDetail?.startDate?.split("T")[0]}</td>
                                    <td>{semesterDetail?.endDate?.split("T")[0]}</td>
                                    <td>{request?.createBy || 'Staff'}</td>

                                    {(roleId === 4) ? (
                                      <td>
                                        <select
                                          value={request.status}
                                          onChange={(e) => this.handleStatusChange(request, request.scheduleId, parseInt(e.target.value))}
                                          className={`form-control ${request?.status === 2 ? 'badge-success' : request?.status === 1 ? 'badge-info' : 'badge-default'}`}
                                        >
                                          {statusOptions.map(option => (
                                            <option key={option.value} value={option.value} className={option.className}>
                                              {option.label}
                                            </option>
                                          ))}
                                        </select>
                                      </td>
                                    ) : (roleId === 2 || roleId === 3 || roleId === 5 || roleId === 6 ) && (
                                      <td>
                                        <span className={`badge ${request?.status === 2 ? 'badge-success' : request?.status === 1 ? 'badge-info' : 'badge-default'}`}>
                                          {statusOptions.find(option => option.value === request.status)?.label}
                                        </span>
                                      </td>
                                    )}


                                  </tr>
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                        {roleId === 4 && (
                          <div className="form-group text-right">
                            <button className="btn btn-danger" onClick={() => this.handleBulkStatusUpdate(0)}>
                              Reject
                            </button>
                            <button className="btn btn-success ml-2" onClick={() => this.handleBulkStatusUpdate(2)}>
                              Approve
                            </button>
                          </div>
                        )}
                      </div>

                      : <p className="">No data available</p>
                    }
                    <div className="pt-4">
                      <Pagination
                        currentPage={currentPage}
                        totalItems={filteredSchedules.length}
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

export default connect(mapStateToProps)((ScheduleList));
