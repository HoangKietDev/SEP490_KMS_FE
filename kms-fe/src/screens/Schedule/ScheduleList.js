import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
// import { withRouter } from 'react-router-dom';
import axios from "axios";
import Login from "../Login";
import { getSession } from "../../components/Auth/Auth";


class ScheduleList extends React.Component {
  state = {
    ScheduleListData: [],
    classData: []
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
        const response = await axios.get(`http://localhost:5124/api/Class/GetAllClass`);
        const data = response.data;
        // Update state with the default class and then fetch schedule data
        this.setState({
          classData: data,
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
      console.log(data);

      // Update the state locally after a successful API call
      this.setState((prevState) => ({
        ScheduleListData: prevState.ScheduleListData.map(schedule =>
          schedule.scheduleId === scheduleId ? { ...schedule, status: newStatus } : schedule
        )
      }));
      alert("Status updated successfully.");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  handleDetailSchedule = (classId) => {
    this.props.history.push(`/schedule?classId=${classId}`);
  }

  handleCreateSchedule = () => {
    this.props.history.push(`/create-schedule`);
  }

  render() {
    const { ScheduleListData, classData } = this.state;
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
        <div>
          <div className="container-fluid">
            <PageHeader
              HeaderText="Request Management"
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
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Create By</th>
                            {/* <th>Processing</th> */}
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ScheduleListData?.map((request, index) => {
                            return (
                              <React.Fragment key={"schedule" + index}>
                                <tr>
                                  <td>{index + 1}</td>
                                  <td
                                    onClick={() => this.handleDetailSchedule(request?.classId)}
                                    style={{ cursor: 'pointer' }}
                                    className="theme-color"
                                  >{classData?.find(i => i.classId === request?.classId)?.className}</td>
                                  <td>{request?.startDate}</td>
                                  <td>{request?.endDate}</td>
                                  <td>{request?.createBy || 'Staff'}</td>
                                  {/* <td>{request?.teacherName}</td> */}
                                  {/* <td>{request?.processing || ''}</td> */}

                                  {(roleId === 3 || roleId === 4) && (
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
