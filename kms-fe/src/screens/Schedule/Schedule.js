import React from "react";
import { withRouter } from "react-router-dom";
import "./Schedule.css"; // Tạo file CSS riêng cho các style
import PageHeader from "../../components/PageHeader";
import axios from "axios";

class Schedule extends React.Component {

  getCurrentWeek = () => {
    const today = new Date();
    const startYear = new Date(today.getFullYear(), 0, 1);
    const days = Math.floor((today - startYear) / (24 * 60 * 60 * 1000));
    const currentWeek = Math.ceil((days + startYear.getDay() + 1) / 7);
    const year = today.getFullYear();
    return `${year}-W${currentWeek.toString().padStart(2, '0')}`;
  };

  // get Start date and end date
  getWeekStartEnd = (selectedWeek) => {
    const [year, week] = selectedWeek?.split('-W');
    const firstDayOfYear = new Date(year, 0, 1);
    const days = (week - 1) * 7;
    const startDate = new Date(firstDayOfYear.setDate(firstDayOfYear.getDate() + days - firstDayOfYear.getDay() + 1));
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // Ngày kết thúc tuần

    // Function to format the date to 'YYYY-MM-DD'
    const formatDate = (date) => date.toISOString().split('T')[0];

    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    };
  };

  state = {
    scheduleData: [],
    scheduleDetails: [],

    classData: [],
    daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    timeslots: ['07:00 - 08:00', '08:00 - 08:30', '08:30 - 10:30', '10:30 - 11:00',
      '11:00 - 11:30', '11:30 - 13:30', '13:30 - 14:00', '14:00 - 14:30',
      '14:30 - 15:30', '15:30 - 16:00', '16:00 - 17:00'],

    selectedWeek: this.getCurrentWeek(), // Lấy tuần hiện tại làm mặc định
    selectId: '',
    startDate: this.getWeekStartEnd(this.getCurrentWeek()).startDate,  // Corrected here
    endDate: this.getWeekStartEnd(this.getCurrentWeek()).endDate,      // Corrected here
    className: ''
  };


  componentDidMount() {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5124/api/Class/GetAllClass`);
        const data = response.data;
        const defaultClassId = data.length > 0 ? data[0].classId : '';
        this.setState({
          classData: data,
          selectId: defaultClassId
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }

  handleChange = async (type, event) => {
    let { startDate, endDate, selectId } = this.state;

    const weekDatesDefault = this.getWeekStartEnd(this.state.selectedWeek);
    console.log(weekDatesDefault);

    this.setState({ startDate: weekDatesDefault.startDate, endDate: weekDatesDefault.endDate });

    if (type === "class") {
      selectId = event.target.value;
      this.setState({ selectId });
    } else if (type === "week") {
      const selectedWeek = event.target.value;
      this.setState({ selectedWeek });
      const weekDates = this.getWeekStartEnd(selectedWeek);
      startDate = weekDates.startDate;
      endDate = weekDates.endDate;
      this.setState({ startDate, endDate });
    }

    // Clear previous schedule data before fetching new data
    this.setState({
      scheduleData: [],    // Reset scheduleData
      scheduleDetails: [], // Reset scheduleDetails
    });

    console.log(startDate, endDate, selectId);

    try {
      const response = await axios.get(
        `http://localhost:5124/api/Schedule/GetSchedulesByDateAndClass?startDate=${startDate}&endDate=${endDate}&classId=${selectId}`
      );
      const scheduleData = response.data;

      if (scheduleData.length > 0) {
        const scheduleId = scheduleData[0].scheduleId;
        const detailResponse = await axios.get(
          `http://localhost:5124/api/Schedule/GetAllScheduleDetailsByScheduleId/${scheduleId}`
        );
        const scheduleDetails = detailResponse.data;

        // Set both scheduleData and scheduleDetails into state
        this.setState({
          scheduleData: scheduleData.map((schedule) => ({
            ...schedule,
            scheduleDetail: scheduleDetails, // Assuming schedule details belong to this schedule
          })),
          scheduleDetails: scheduleDetails,
        });

        console.log("Schedule Data:", scheduleData);
        console.log("Schedule Details:", scheduleDetails);
      } else {
        // No schedule data for the selected week and class, ensure schedule is empty
        this.setState({
          scheduleData: [],    // Ensure data is cleared if no data is found
          scheduleDetails: [], // Ensure details are cleared as well
        });
        console.log('No schedule found for the selected week and class.');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      this.setState({
        scheduleData: [],    // Clear data on error as well
        scheduleDetails: [], // Clear details on error
      });
    }
  };

  handleImportSchedule = async (event) => {
    // Ngăn chặn hành vi mặc định của form nếu bạn đang dùng trong một form
    event.preventDefault();

    const fileInput = document.getElementById('file-input'); // Lấy input file từ DOM
    const file = fileInput?.files[0]; // Lấy file được chọn

    const formData = new FormData();
    formData.append('file', file); // Thêm file vào FormData

    try {
      const response = await axios.post('http://localhost:5124/api/Schedule/Import', formData, {
        headers: {
          'accept': '*/*',
          'Content-Type': 'multipart/form-data', // Đặt Content-Type cho multipart
        },
      });

      // Kiểm tra phản hồi từ API
      if (response.status === 200) {
        alert("Import successful!");
        // Có thể làm thêm các thao tác khác như refresh data...
      }
    } catch (error) {
      console.error("Error importing schedule: ", error);
      alert("Failed to import schedule. Please try again.");
    }
  };




  renderTable = () => {
    const { scheduleData, daysOfWeek, timeslots, classData, selectId, scheduleDetails } = this.state;
    const userData = JSON.parse(localStorage.getItem("user")).user;
    const roleId = userData.roleId;
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
              HeaderText="Schedule"
              Breadcrumb={[{ name: "Schedule", navigate: "" }]}
            />
            <div className="row clearfix">
              <div className="col-lg-12 col-md-12">
                <div className="card planned_task">
                  <div className="header d-flex justify-content-between">
                    <div className="week-selector d-inline-flex">
                      <input
                        type="week"
                        value={this.state.selectedWeek}
                        onChange={(event) => this.handleChange("week", event)}
                        className="week-input"
                      />
                      <div className="ml-4" style={{ width: "200px" }}>
                        <select
                          className="form-control"
                          value={selectId}
                          name="selectId"
                          required
                          onChange={(event) => this.handleChange("class", event)}
                        >
                          {classData.map((option) => (
                            <option key={option.classId} value={option.classId}>
                              {option.className}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {roleId === 3 ? (
                      <div>
                        <a onClick={() => this.fileInput.click()} // Khi nhấn vào thẻ <a>, sẽ mở dialog chọn file
                          className="btn btn-primary text-white mr-4">
                          <i className="icon-arrow-up mr-2"></i>Import Excel
                        </a>
                        <input
                          type="file"
                          ref={(input) => (this.fileInput = input)} // Lưu tham chiếu tới input file
                          style={{ display: 'none' }} // Ẩn input file
                          accept=".xlsx, .xls" // Chỉ chấp nhận file Excel
                          onChange={this.handleImportSchedule} // Gọi hàm khi người dùng chọn file
                        />

                        <a
                          onClick={() => this.handleCreateCategory()}
                          className="btn btn-success text-white"
                        >
                          <i className="icon-plus mr-2"></i>Create New Schedule
                        </a>
                      </div>

                    ) : null}
                  </div>
                </div>
              </div>
              <div className="col-lg-12">
                <div className="card">
                  <div className="body project_report">
                    <div className="table-responsive">
                      <table className="custom-table table table-bordered">
                        <thead className="thead-light schedule-head">
                          <tr>
                            <th style={{ width: '150px' }} className="text-center">Thời gian</th>
                            {daysOfWeek.map((day, index) => (
                              <th key={index}>{day}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="schedule-head">
                          {timeslots.map((timeslot, timeslotIndex) => (
                            <tr key={timeslotIndex}>
                              {/* Display the time slot */}
                              <td className="sticky-col">
                                <strong>{timeslot}</strong>
                              </td>
                              {/* Loop through each day of the week */}
                              {daysOfWeek.map((day, dayIndex) => {
                                let result = scheduleDetails?.find(i => i.day === day && i.timeSlotName === timeslot)
                                return (
                                  <td key={dayIndex}>
                                    {result ? (
                                      <div>
                                        <strong>{result?.activityName || 'No activity'}</strong>
                                        <div className="d-flex flex-column">
                                          {result?.locationName && (
                                            <span style={{ fontSize: 'smaller' }} className="pt-2">
                                              <i className="icon-layers m-1"></i>
                                              {result?.locationName}
                                            </span>
                                          )}
                                          {result?.locationName && scheduleData[0]?.teacherName && (
                                            <span style={{ fontSize: 'smaller' }} className="pt-2">
                                              <i className="icon-user m-1"></i>
                                              {scheduleData[0]?.teacherName}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <span>No activity</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
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
  };

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12 col-md-12">
            <div className="table-container">
              {this.renderTable()}
            </div>

          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Schedule);
