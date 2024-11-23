import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from "react-router-dom";
import axios from "axios";
import Calendar from "react-calendar";
import moment from "moment";
import "react-calendar/dist/Calendar.css";
import "bootstrap/dist/css/bootstrap.min.css";

let isMounted = false; // Khai báo isMounted như biến thông thường

class ViewAttendByParent extends React.Component {
  state = {
    studentId: "",
    childerParent: [],
    attendanceData: [],
    selectedWeek: "",
    showCalendar: false,
    highlightedWeek: null,
    weekAttendance: [],
    startOfCurrentWeek: moment().startOf("isoWeek"),
    summary: {
      total: 0,
      attended: 0,
      late: 0,
      absence: 0,
    },
  };

  componentDidMount() {
    isMounted = true; // Đặt isMounted thành true khi component mount
    window.scrollTo(0, 0);

    const user = JSON.parse(localStorage.getItem("user"));
    const parentID = user?.user?.userId;

    if (!parentID) {
      console.error("Parent ID not found");
      return;
    }

    const startOfWeek = this.state.startOfCurrentWeek;
    const endOfWeek = startOfWeek.clone().endOf("isoWeek");

    this.setState({
      selectedWeek: `${startOfWeek.format("DD/MM/YYYY")} - ${endOfWeek.format("DD/MM/YYYY")}`,
      startOfCurrentWeek: startOfWeek,
    });

    axios
      .get(`http://localhost:5124/api/Request/GetStudentsByParentId/${parentID}`)
      .then((response) => {
        if (isMounted) {
          this.setState({ childerParent: response.data });
        }
      })
      .catch((error) => {
        console.error("Error fetching student data:", error);
      });
  }

  componentWillUnmount() {
    isMounted = false; // Đặt isMounted thành false khi component unmount
  }

  fetchAttendanceData = async (studentId) => {
    const { startOfCurrentWeek } = this.state;

    try {
      const attendanceResponse = await axios.get(
        `http://localhost:5124/api/Attendance/GetAttendanceByStudentId`,
        {
          params: {
            studentId,
            type: "Checkin",
            date: startOfCurrentWeek.format("YYYY-MM-DD"),
          },
        }
      );

      if (isMounted) {
        // Lưu dữ liệu kèm theo imageUrl
        const attendanceData = attendanceResponse.data.map((attendance) => ({
          ...attendance,
          imageUrl: attendance.attendanceDetail[0]?.imageUrl || null,
        }));

        this.setState({ attendanceData }, this.updateSummary);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu điểm danh:", error);
    }
  };

  handleStudentChange = (e) => {
    const studentId = e.target.value;

    // Xác định tuần hiện tại
    const startOfWeek = moment().startOf("isoWeek");
    const endOfWeek = startOfWeek.clone().endOf("isoWeek");

    // Cập nhật `studentId` và đặt tuần về tuần hiện tại
    this.setState(
      {
        studentId,
        selectedWeek: `${startOfWeek.format("DD/MM/YYYY")} - ${endOfWeek.format("DD/MM/YYYY")}`,
        startOfCurrentWeek: startOfWeek,
      },
      () => {
        // Gọi `updateWeekAttendance` để lấy dữ liệu điểm danh của tuần hiện tại cho học sinh mới
        this.updateWeekAttendance(startOfWeek, endOfWeek);
      }
    );
  };

  updateSummary = () => {
    if (!isMounted) return;

    const { attendanceData } = this.state;

    // Đảm bảo `total` là số lượng phần tử hợp lệ trong `attendanceData`
    const validAttendanceData = attendanceData.filter(att => att && att.attendanceDetail && att.attendanceDetail.length > 0);

    const summary = {
      total: validAttendanceData.length,
      attended: validAttendanceData.filter(
        (att) => att.attendanceDetail[0]?.status === "Có"
      ).length,
      late: validAttendanceData.filter(
        (att) => att.attendanceDetail[0]?.status === "Muộn"
      ).length,
      absence: validAttendanceData.filter(
        (att) => att.attendanceDetail[0]?.status === "Vắng"
      ).length,
    };

    this.setState({ summary });
  };

  handleDayHover = (date) => {
    const startOfWeek = moment(date).startOf("isoWeek");
    const endOfWeek = moment(date).endOf("isoWeek");
    this.setState({ highlightedWeek: { start: startOfWeek, end: endOfWeek } });
  };

  handleDaySelect = (date) => {
    const startOfWeek = moment(date).startOf("isoWeek");
    const endOfWeek = moment(date).endOf("isoWeek");

    this.setState(
      {
        selectedWeek: `${startOfWeek.format("DD/MM/YYYY")} - ${endOfWeek.format("DD/MM/YYYY")}`,
        showCalendar: false,
        highlightedWeek: null,
        startOfCurrentWeek: startOfWeek,
      },
      () => this.updateWeekAttendance(startOfWeek, endOfWeek)
    );
  };

  updateWeekAttendance = async (startOfWeek, endOfWeek) => {
    const { studentId } = this.state;

    if (!studentId || !startOfWeek || !endOfWeek) {
      console.warn("Student ID, startOfWeek, or endOfWeek is missing.");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5124/api/Attendance/GetAttendanceByStudentId`,
        {
          params: {
            studentId,
            type: "Checkin",
            date: startOfWeek.format("YYYY-MM-DD"),
          },
        }
      );

      const attendanceData = response.data;
      const weekDays = Array.from({ length: 7 }, (_, i) =>
        startOfWeek.clone().add(i, "days").format("YYYY-MM-DD")
      );

      const weekAttendanceData = weekDays.map((date) => {
        const dayAttendance = attendanceData.find((attendance) =>
          moment(attendance.createdAt).format("YYYY-MM-DD") === date
        );

        let status = "No Data";
        let imageUrl = null;
        if (dayAttendance && dayAttendance.attendanceDetail.length > 0) {
          status = dayAttendance.attendanceDetail[0].status;
          imageUrl = dayAttendance.attendanceDetail[0].imageUrl;
        }

        return {
          date,
          status,
          imageUrl,
        };
      });

      if (isMounted) {
        this.setState({ weekAttendance: weekAttendanceData, attendanceData }, this.updateSummary);
      }
    } catch (error) {
      console.error("Error fetching weekly attendance data:", error);
    }
  };

  toggleCalendar = () => {
    this.setState((prevState) => ({ showCalendar: !prevState.showCalendar }));
  };

  render() {
    const {
      childerParent,
      studentId,
      selectedWeek,
      showCalendar,
      highlightedWeek,
      weekAttendance,
      summary,
    } = this.state;

    return (
      <div className="container mt-4">
        <PageHeader
          HeaderText="Attendance Management"
          Breadcrumb={[
            { name: "Attendance Management", navigate: "" },
            { name: "View Attendance", navigate: "" },
          ]}
        />

        {/* Filter Section */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label fw-bold">Select Child</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="icon-user"></i>
                </span>
                <select
                  className="form-select"
                  value={studentId}
                  onChange={this.handleStudentChange}
                >
                  <option value="">Choose Student</option>
                  {childerParent.map((option) => (
                    <option key={option.studentId} value={option.studentId}>
                      {option.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Week Selection */}
          <div className="col-md-6">
            <label className="form-label fw-bold">Selected Week</label>
            <div className="input-group">
              <span className="input-group-text" onClick={this.toggleCalendar} style={{ cursor: "pointer" }}>
                <i className="fa fa-calendar"></i>
              </span>
              <input
                type="text"
                className="form-control"
                value={selectedWeek || "Select a week"}
                onClick={this.toggleCalendar}
                readOnly
              />
            </div>

            {showCalendar && (
              <div
                className="calendar-popup"
                style={{
                  position: "absolute",
                  zIndex: 1000,
                  backgroundColor: "white",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                  borderRadius: "8px",
                  marginTop: "10px",
                }}
              >
                <Calendar
                  onMouseOver={({ activeStartDate }) => this.handleDayHover(activeStartDate)}
                  onClickDay={(date) => this.handleDaySelect(date)}
                  tileContent={({ date, view }) => {
                    if (view === "month") {
                      const startOfWeek = highlightedWeek && highlightedWeek.start;
                      const endOfWeek = highlightedWeek && highlightedWeek.end;
                      if (
                        startOfWeek &&
                        endOfWeek &&
                        moment(date).isBetween(startOfWeek, endOfWeek, null, "[]")
                      ) {
                        return <div className="bg-info text-white rounded">{date.getDate()}</div>;
                      }
                    }
                    return null;
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="row text-center mb-4">
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">All</h5>
                <p className="card-text">{summary.total}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-success text-white">
              <div className="card-body">
                <h5 className="card-title">Attended</h5>
                <p className="card-text">{summary.attended}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-info text-white">
              <div className="card-body">
                <h5 className="card-title">Late</h5>
                <p className="card-text">{summary.late}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-danger text-white">
              <div className="card-body">
                <h5 className="card-title">Absence</h5>
                <p className="card-text">{summary.absence}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Table for Selected Week */}
        <div className="row mt-4">
          <div className="col-12">
            <h5>Attendance Details for Week of {selectedWeek}</h5>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Status</th>
                  <th>Image</th> {/* Thêm cột hiển thị hình ảnh */}
                </tr>
              </thead>
              <tbody>
                {weekAttendance.map((attendance, index) => (
                  <tr key={index}>
                    <td>{moment(attendance.date).format("DD/MM/YYYY")}</td>
                    <td>{moment(attendance.date).format("dddd")}</td>
                    <td>
                      {attendance.status === "Có" && (
                        <span className="badge bg-success">Attended</span>
                      )}
                      {attendance.status === "Muộn" && (
                        <span className="badge bg-warning">Late</span>
                      )}
                      {attendance.status === "Vắng" && (
                        <span className="badge bg-danger">Absence</span>
                      )}
                      {attendance.status === "No Data" && (
                        <span className="badge bg-secondary">No Data</span>
                      )}
                    </td>
                    <td>
                      {attendance.imageUrl ? (
                        <img
                          src={attendance.imageUrl}
                          alt="Attendance"
                          style={{ width: "100px", height: "auto" }}
                        />
                      ) : (
                        "No Image"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ ioTReducer }) => ({
  isSecuritySystem: ioTReducer.isSecuritySystem,
});

export default connect(mapStateToProps)(withRouter(ViewAttendByParent));
