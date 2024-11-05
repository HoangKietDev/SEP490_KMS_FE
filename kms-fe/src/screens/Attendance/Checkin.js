import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import CSS của DatePicker
import axios from "axios";
import './Checkin.css'; // Import CSS cho hiệu ứng nút

class Checkin extends React.Component {
  state = {
    studentDataCheckin: [], // Dữ liệu học sinh cho Check In
    studentDataCheckout: [], // Dữ liệu học sinh cho Check Out
    teacherName: "",
    attendanceDataCheckin: {}, // Dữ liệu điểm danh cho Check In
    attendanceDataCheckout: {}, // Dữ liệu điểm danh cho Check Out
    attendanceDetailsCheckin: [], // Chi tiết điểm danh cho Check In
    attendanceDetailsCheckout: [], // Chi tiết điểm danh cho Check Out
    attendanceId: 0,
    createdAt: "",
    classId: this.props.match.params.classId, // Nhận classID từ URL
    // classId: 2,
    activeTab: "checkin", // State để theo dõi tab hiện tại
    selectedDate: new Date(), // Khởi tạo ngày hiện tại
  };

  componentDidMount() {
    this.fetchAttendanceData(); // Gọi fetchAttendanceData trước
  }

  // Hàm để định dạng ngày thành "YYYY-MM-DD"
  formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
  
    return `${year}-${month}-${day}`;
  };
  

  fetchStudentData = (studentIds, isCheckin = true) => {
    // Nếu không có studentIds, không cần gọi API
    if (!studentIds.length) {
      return;
    }

    // Sử dụng Promise.all để lấy thông tin học sinh cho từng studentId
    const studentPromises = studentIds.map(studentId =>
      axios.get(`http://localhost:5124/api/Children/GetChildrenByChildrenId/${studentId}`)
    );

    // Chờ tất cả các promise hoàn thành
    Promise.all(studentPromises)
      .then((responses) => {
        const studentData = responses.map(response => response.data);
        if (isCheckin) {
          this.setState({ studentDataCheckin: studentData });
        } else {
          this.setState({ studentDataCheckout: studentData });
        }
      })
      .catch((error) => {
        console.error("Error fetching student data: ", error);
      });
  };

  fetchAttendanceData = () => {
    const { activeTab, selectedDate, classId } = this.state;
    const type = activeTab === "checkin" ? "Checkin" : "Checkout";
    const formattedDate = this.formatDate(selectedDate); // Định dạng ngày đã chọn
    console.log(formattedDate, "test format date");
    
    axios
      .get(`http://localhost:5124/api/Attendance/GetAttendanceByDate?classId=${classId}&type=${type}&date=${formattedDate}`)
      .then((response) => {
        const attendanceData = response.data;
        console.log(attendanceData,"test log");
        
        if (attendanceData.length > 0) {
          const details = attendanceData[0].attendanceDetail;
          const attendanceMap = {};
          details.forEach((detail) => {
            attendanceMap[detail.studentId] = detail.status;
          });
  
          const studentIds = details.map(detail => detail.studentId); // Lấy danh sách studentId từ attendanceDetails
  
          if (activeTab === "checkin") {
            this.setState({
              attendanceDataCheckin: attendanceMap,
              attendanceDetailsCheckin: details,
              attendanceId: attendanceData[0].attendanceId,
              createdAt: new Date().toISOString(),
            }, () => {
              this.fetchStudentData(studentIds, true); // Gọi fetchStudentData với danh sách studentId cho Check In
            });
          } else {
            this.setState({
              attendanceDataCheckout: attendanceMap,
              attendanceDetailsCheckout: details,
              attendanceId: attendanceData[0].attendanceId,
              createdAt: new Date().toISOString(),
            }, () => {
              this.fetchStudentData(studentIds, false); // Gọi fetchStudentData với danh sách studentId cho Check Out
            });
          }
        } else {
          // Nếu không có dữ liệu, cập nhật attendanceDetails và attendanceData
          if (activeTab === "checkin") {
            this.setState({ attendanceDetailsCheckin: [], attendanceDataCheckin: {} });
          } else {
            this.setState({ attendanceDetailsCheckout: [], attendanceDataCheckout: {} });
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching attendance data: ", error);
      });
  };
  

  handleDateChange = (date) => {
    // Loại bỏ phần giờ để tránh ảnh hưởng bởi múi giờ
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    this.setState({ selectedDate: localDate }, () => {
      this.fetchAttendanceData(); // Gọi lại API khi ngày thay đổi, đảm bảo dữ liệu được cập nhật cho ngày đã chọn
    });
  };
  

  handleAttendance = (studentId, status) => {
    this.setState((prevState) => {
      if (this.state.activeTab === "checkin") {
        return {
          attendanceDataCheckin: {
            ...prevState.attendanceDataCheckin,
            [studentId]: status,
          },
        };
      } else {
        return {
          attendanceDataCheckout: {
            ...prevState.attendanceDataCheckout,
            [studentId]: status,
          },
        };
      }
    });
  };

  updateAttendance = () => {
    const {
      attendanceDataCheckin,
      attendanceDataCheckout,
      attendanceDetailsCheckin,
      attendanceDetailsCheckout,
      classId,
      activeTab,
    } = this.state;
  
    const attendanceId =
      activeTab === "checkin"
        ? attendanceDetailsCheckin.length > 0
          ? attendanceDetailsCheckin[0].attendanceId
          : 115
        : attendanceDetailsCheckout.length > 0
        ? attendanceDetailsCheckout[0].attendanceId
        : 115;
  
    const createdAt = new Date().toISOString();
    const attendanceUpdate = [
      {
        attendanceId: attendanceId,
        type: activeTab === "checkin" ? "Checkin" : "Checkout",
        createdAt: createdAt,
        classId: classId,
        attendanceDetail: Object.keys(
          activeTab === "checkin" ? attendanceDataCheckin : attendanceDataCheckout
        ).map((studentId) => {
          const detail =
            activeTab === "checkin"
              ? attendanceDetailsCheckin.find((d) => d.studentId === Number(studentId))
              : attendanceDetailsCheckout.find((d) => d.studentId === Number(studentId));
          return {
            attendanceDetailId: detail ? detail.attendanceDetailId : 0,
            attendanceId: attendanceId,
            studentId: Number(studentId),
            createdAt: createdAt,
            status: activeTab === "checkin" ? attendanceDataCheckin[studentId] : attendanceDataCheckout[studentId],
          };
        }),
      },
    ];
  
    const data = JSON.stringify(attendanceUpdate, null, 2);
    console.log(data);
  
    fetch(
      `http://localhost:5124/api/Attendance/UpdateAttendance?classId=${classId}&type=${
        activeTab === "checkin" ? "Checkin" : "Checkout"
      }`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: data,
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Attendance updated successfully:", data);
        alert("Điểm danh đã được cập nhật thành công!");
      })
      .catch((error) => {
        console.error("Error updating attendance: ", error);
        alert("Có lỗi xảy ra khi cập nhật điểm danh.");
      })
      .finally(() => {
        // Luôn luôn gọi CreateDailyCheckout bất kể kết quả của UpdateAttendance
        fetch("http://localhost:5124/api/Attendance/CreateDailyCheckout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            classId: classId,
            date: this.formatDate(this.state.selectedDate),
          }),
        })
          .then((response) => {
            if (!response.ok) {
              console.warn("Warning: CreateDailyCheckout returned a non-200 status:", response.statusText);
            }
            return response.json();
          })
          .then((data) => {
            console.log("CreateDailyCheckout called successfully:", data);
          })
          .catch((error) => {
            console.error("Error in CreateDailyCheckout:", error);
          });
      });
  };
  

  toggleTab = (tab) => {
    this.setState({ activeTab: tab }, () => {
      this.fetchAttendanceData(); // Fetch attendance data mỗi khi đổi tab
    });
  };

  render() {
    const { studentDataCheckin, studentDataCheckout, teacherName, attendanceDataCheckin, attendanceDataCheckout, activeTab, selectedDate, attendanceDetailsCheckin, attendanceDetailsCheckout } = this.state;

    // Kiểm tra xem ngày đã chọn có phải là ngày hôm nay không
    const isToday = this.formatDate(new Date()) === this.formatDate(selectedDate);

    return (
      <div className="container-fluid">
        <PageHeader
          HeaderText={`Violet | Check In - Teacher: ${teacherName}`}
          Breadcrumb={[
            { name: "Học Thuật", navigate: "" },
            { name: "Quản Lý Điểm Danh", navigate: "" },
            { name: "Chi Tiết Điểm Danh", navigate: "" },
          ]}
        />

        {/* Chọn lịch */}
        <div className="form-group">
          <label>Chọn Ngày:</label>
          <DatePicker
            selected={selectedDate}
            onChange={this.handleDateChange}
            dateFormat="yyyy-MM-dd" // Định dạng ngày
            className="form-control"
          />
        </div>

        <div className="card">
          <div className="body">
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <a
                  className={`nav-link ${activeTab === "checkin" ? "active" : ""}`}
                  onClick={() => this.setState({ activeTab: "checkin" }, this.fetchAttendanceData)}
                >
                  Check In
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${activeTab === "checkout" ? "active" : ""}`}
                  onClick={() => this.setState({ activeTab: "checkout" }, this.fetchAttendanceData)}
                >
                  Check Out
                </a>
              </li>
            </ul>

            <div className="table-responsive">
              {activeTab === "checkin" && (
                <table className="table table-hover mt-3">
                  <thead className="thead-light">
                    <tr>
                      <th>Tên học sinh</th>
                      <th>Xe buýt</th>
                      <th>Thông tin khác</th>
                      <th>Thời gian đến</th>
                      <th>Người đưa đón</th>
                      <th>Liên hệ</th>
                      <th>Điểm danh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceDetailsCheckin.length > 0 ? (
                      studentDataCheckin.map((student, index) => (
                        <tr key={index}>
                          <td>{student.fullName}</td>
                          <td>n/a</td>
                          <td>n/a</td>
                          <td>n/a</td>
                          <td>n/a</td>
                          <td>n/a</td>
                          <td>
                            <button
                              className={`btn mr-1 ${attendanceDataCheckin[student.studentId] === "Có" ? "btn-success" : ""}`}
                              onClick={() => isToday && this.handleAttendance(student.studentId, "Có")}
                              disabled={!isToday} // Disable nút nếu ngày không phải hôm nay
                            >
                              Có
                            </button>
                            <button
                              className={`btn mr-1 ${attendanceDataCheckin[student.studentId] === "Muộn" ? "btn-warning" : ""}`}
                              onClick={() => isToday && this.handleAttendance(student.studentId, "Muộn")}
                              disabled={!isToday} // Disable nút nếu ngày không phải hôm nay
                            >
                              Muộn
                            </button>
                            <button
                              className={`btn ${attendanceDataCheckin[student.studentId] === "Vắng" ? "btn-danger" : ""}`}
                              onClick={() => isToday && this.handleAttendance(student.studentId, "Vắng")}
                              disabled={!isToday} // Disable nút nếu ngày không phải hôm nay
                            >
                              Vắng
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">Không có dữ liệu</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
              {activeTab === "checkout" && (
                <table className="table table-hover mt-3">
                  <thead className="thead-light">
                    <tr>
                      <th>Tên học sinh</th>
                      <th>Thông tin khác</th>
                      <th>Thời gian đến</th>
                      <th>Người đưa đón</th>
                      <th>Liên hệ</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentDataCheckout.length > 0 ? (
                      studentDataCheckout.map((student, index) => (
                        <tr key={index}>
                          <td>{student.fullName}</td>
                          <td>n/a</td>
                          <td>n/a</td>
                          <td>n/a</td>
                          <td>n/a</td>
                          <td>
                            <button
                              className="btn btn-primary mr-1"
                              onClick={() => this.handleAttendance(student.studentId, "Đã về")}
                            >
                              Đã về
                            </button>
                            <button
                              className="btn btn-secondary"
                              onClick={() => this.handleAttendance(student.studentId, "Chưa về")}
                            >
                              Chưa về
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">Không có dữ liệu</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {activeTab === "checkin" && ( // Chỉ hiển thị thống kê điểm danh trong tab "Check In"
              <div className="attendance-summary mt-3">
                <span>Thông tin điểm danh: </span>
                <span className="badge badge-success mr-2">{Object.values(attendanceDataCheckin).filter(status => status === "Có").length} Có</span>
                <span className="badge badge-warning mr-2">{Object.values(attendanceDataCheckin).filter(status => status === "Muộn").length} Muộn</span>
                <span className="badge badge-danger mr-2">{Object.values(attendanceDataCheckin).filter(status => status === "Vắng").length} Vắng</span>
              </div>
            )}

            <div className="text-right mt-3">
              <button className="btn btn-primary" onClick={this.updateAttendance} disabled={!isToday}>
                Xác Nhận Điểm Danh
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect()(withRouter(Checkin));
