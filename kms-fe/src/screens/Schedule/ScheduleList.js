import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
// import { withRouter } from 'react-router-dom';
import axios from "axios";
import Login from "../Login";
import { getSession } from "../../components/Auth/Auth";
import { addNotificationByRoleId, addNotificationByUserId } from "../../components/Common/Notification";
import Notification from "../../components/Notification";



class ScheduleList extends React.Component {
  state = {
    ScheduleListData: [],
    classData: [],
    semesterListData: [],

    showNotification: false, // State to control notification visibility
    notificationText: "", // Text for the notification
    notificationType: "success" // Type of notification (success or error)
  };

  componentDidMount() {
    const userData = getSession('user')?.user;
    if (!userData) {
      this.props.history.push("/login");  // Nếu cookie không tồn tại hoặc không hợp lệ, chuyển hướng về login
      return;
    }
    window.scrollTo(0, 0);

    const fetchData = async () => {
      try {
        axios.get("http://localhost:5124/api/Schedule/GetAllSchedules")
          .then((response) => {
            this.setState({ ScheduleListData: response.data });
          })
          .catch((error) => {
            console.error("Error fetching data: ", error);
          });

        axios.get("http://localhost:5124/api/Semester/GetAllSemester")
          .then((response) => {
            this.setState({ semesterListData: response.data });
          })
          .catch((error) => {
            console.error("Error fetching data: ", error);
          });

        axios.get("http://localhost:5124/api/Class/GetAllClass")
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
    fetchData();

  }

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
      await axios.put(`http://localhost:5124/api/Schedule/UpdateSchedule`, formdata);

      // tao thong bao moi
      addNotificationByUserId('UserId', 'content', 21);
      // addNotificationByRoleId('RoleId', 'content', 3);

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

  render() {
    const { ScheduleListData, classData, semesterListData } = this.state;
    const { showNotification, notificationText, notificationType } = this.state;

    const statusOptions = [
      { value: 1, label: "Active", className: "badge-success" },
      { value: 2, label: "Inactive", className: "badge-danger" },
      { value: 0, label: "Pending", className: "badge-default" },
    ];

    const userData = getSession('user')?.user;
    const roleId = userData?.roleId

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
                    {roleId === 3 ? (
                      <a onClick={() => this.handleCreateSchedule()} class="btn btn-success text-white">Create New Schedule</a>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="col-lg-12 col-md-12">
                <div className="card">
                  <div className="body project_report">
                    <div className="table-responsive">
                      <table className="table m-b-0 table-hover">
                        <thead className="theme-color">
                          <tr>
                            <th>#</th>
                            <th>Class</th>
                            <th>Semeter</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Create By</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ScheduleListData?.map((request, index) => {
                            const classDetail = classData?.find(i => i.classId === request?.classId)
                            const semesterDetail = semesterListData?.find(i => i.semesterId === classDetail?.semesterId)
                            return (
                              <React.Fragment key={"schedule" + index}>
                                <tr>
                                  <td>{index + 1}</td>
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
                                  {/* <td>{request?.teacherName}</td> */}
                                  {/* <td>{request?.processing || ''}</td> */}

                                  {(roleId === 4) ? (
                                    <td>
                                      <select
                                        value={request.status}
                                        onChange={(e) => this.handleStatusChange(request, request.scheduleId, parseInt(e.target.value))}
                                        className={`form-control ${request?.status === 1 ? 'badge-success' : request?.status === 2 ? 'badge-danger' : 'badge-default'}`}
                                      >
                                        {statusOptions.map(option => (
                                          <option key={option.value} value={option.value} className={option.className}>
                                            {option.label}
                                          </option>
                                        ))}
                                      </select>
                                    </td>
                                  ) : (roleId === 2 || roleId === 3 || roleId === 5) && (
                                    <td>
                                      <span className={`badge ${request?.status === 1 ? 'badge-success' : request?.status === 2 ? 'badge-danger' : 'badge-default'}`}>
                                        {statusOptions.find(option => option.value === request.status)?.label || 'Unknown'}
                                      </span>
                                    </td>
                                  )}


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

export default connect(mapStateToProps)((ScheduleList));
