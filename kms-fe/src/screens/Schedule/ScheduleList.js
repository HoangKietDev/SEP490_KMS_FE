import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from 'react-router-dom';
import axios from "axios";
import Login from "../Login";


class ScheduleList extends React.Component {
  state = {
    ScheduleListData: [],
    classData: []
  };

  componentDidMount() {
    window.scrollTo(0, 0);
    // Gọi API và cập nhật state bằng axios


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

  render() {
    const { ScheduleListData, classData } = this.state;
    const statusOptions = [
      { value: 1, label: "Processing", className: "badge-info" },
      { value: 2, label: "Approved", className: "badge-success" },
      { value: 3, label: "Rejected", className: "badge-danger" },
    ];
    // let NewRequestListData = []
    // const userData = JSON.parse(localStorage.getItem("user")).user;
    // const roleId = userData.roleId
    // console.log(RequestListData);

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
                { name: "Schedule Management", navigate: "request" },
                { name: "Schedule List", navigate: "" },
              ]}
            />
            <div className="row clearfix">

              <div className="col-lg-12 col-md-12">
                <div className="card planned_task">
                  <div className="header d-flex justify-content-between">
                    <h2>Schedule Manager</h2>
                  </div>
                </div>
              </div>
              <div className="col-lg-12 col-md-12">
                <div className="card">
                  <div className="body project_report">
                    <div className="table-responsive">
                      <table className="table m-b-0 table-hover">
                        <thead className="thead-light">
                          <tr>
                            <th>#</th>
                            <th>Class</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Create By</th>
                            <th>Teaching</th>
                            <th>Semester</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ScheduleListData?.map((request, index) => {
                            return (
                              <React.Fragment key={"schedule" + index}>
                                <tr>
                                  <td>{index + 1}</td>
                                  <td>{classData?.find(i => i.classId === request?.classId)?.className}</td>
                                  <td>{request?.startDate}</td>
                                  <td>{request?.endDate}</td>
                                  <td>{request?.createBy || 'Staff'}</td>
                                  <td>{request?.teacherName}</td>
                                  <td>{request?.semester || ''}</td>
                                  <td>
                                    {request.status === 1 ? (
                                      <select
                                        value={request.status}
                                        onChange={(e) => this.handleStatusChange(request, request.scheduleId, parseInt(e.target.value))}
                                        className={`form-control`}
                                      >
                                        {statusOptions.map(option => (
                                          <option key={option.value} value={option.value}>
                                            {option.label}
                                          </option>
                                        ))}
                                      </select>
                                    ) : (
                                      <span className={`badge ${request.status === 2 ? 'badge-success' : 'badge-danger'}`}>
                                        {statusOptions.find(option => option.value === request.status)?.label}
                                      </span>
                                    )}
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

export default connect(mapStateToProps)(withRouter(ScheduleList));
