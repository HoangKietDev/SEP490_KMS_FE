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
  state = {
    scheduleData: [
      // {
      //   classId: '',
      //   startDate: '2024-10-21T00:00:00',
      //   endDate: '2024-11-02T00:00:00',
      //   schedule: [
      //     { activity: 'Nhận đón trẻ', location: '', teacher: '', note: '' },
      //     { activity: 'Breakfast', location: '', teacher: '', note: '' },
      //     { activity: 'Tiếng Anh/English', location: 'A103', teacher: 'Hoàng Tuấn Kiệt', note: 'Phát âm a,ch,ss,k Phát âm a,ch,ssádasdasdasdsadasdasdas' },
      //     { activity: 'Chơi tự do/Play time', location: 'A000', teacher: '', note: '' },
      //     { activity: 'Lunch', location: '', teacher: '', note: '' },
      //     { activity: 'Nap', location: '', teacher: '', note: '' },
      //     { activity: 'Tạo hình/Art and craft', location: 'A103', teacher: 'Hoàng Tuấn Kiệt', note: '' },
      //     { activity: 'Snack', location: '', teacher: '', note: '' },
      //     { activity: 'Hoạt động', location: 'A103', teacher: 'Hoàng Tuấn Kiệt', note: '' },
      //     { activity: 'Chơi tự do/Play time', location: 'A000', teacher: 'Hoàng Tuấn Kiệt', note: '' },
      //     { activity: 'Drop off', location: '', teacher: '', note: '' }
      //   ]
      // },
      // {
      //   classId: '',
      //   startDate: '2024-10-21T00:00:00',
      //   endDate: '2024-11-02T00:00:00',
      //   schedule: [
      //     { activity: 'Nhận đón trẻ', location: '', teacher: '', note: '' },
      //     { activity: 'Breakfast', location: '', teacher: '', note: '' },
      //     { activity: 'Tiếng Anh/English', location: 'A103', teacher: 1, note: '' },
      //     { activity: 'Chơi tự do/Play time', location: 'A103', teacher: '', note: '' }
      //   ]
      // },
      // {
      //   classId: '',
      //   startDate: '2024-10-21T00:00:00',
      //   endDate: '2024-11-02T00:00:00',
      //   schedule: [
      //     { activity: 'Nhận đón trẻ', location: '', teacher: '', note: '' },
      //     { activity: 'Breakfast', location: '', teacher: '', note: '' },
      //     { activity: 'Tiếng Anh/English', location: 'A103', teacher: 1, note: '' },
      //     { activity: 'Chơi tự do/Play time', location: '', teacher: '', note: '' }
      //   ]
      // },
      // {
      //   classId: '',
      //   startDate: '2024-10-21T00:00:00',
      //   endDate: '2024-11-02T00:00:00',
      //   schedule: [
      //     { activity: 'Nhận đón trẻ', location: '', teacher: '', note: '' },
      //     { activity: 'Breakfast', location: '', teacher: '', note: '' },
      //     { activity: 'Tiếng Anh/English', location: 'A103', teacher: 1, note: '' },
      //     { activity: 'Chơi tự do/Play time', location: '', teacher: '', note: '' }
      //   ]
      // },
      // {
      //   classId: '',
      //   startDate: '2024-10-21T00:00:00',
      //   endDate: '2024-11-02T00:00:00',
      //   schedule: [
      //     { activity: 'Nhận đón trẻ', location: '', teacher: '', note: '' },
      //     { activity: 'Breakfast', location: '', teacher: '', note: '' },
      //     { activity: 'Tiếng Anh/English', location: 'A103', teacher: 1, note: '' },
      //     { activity: 'Chơi tự do/Play time', location: '', teacher: '', note: '' }
      //   ]
      // },
    ],
    daysOfWeek: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"],
    timeslots: ['07:00-08:00', '08:00-08:30', '08:30-10:30', '10:30-11:00',
      '11:00-11:30', '11:30-13:30', '13:30-14:00', '14:00-14:30',
      '14:30-15:30', '15:30-16:00', '16:00-17:00'],
    selectedWeek: this.getCurrentWeek(), // Lấy tuần hiện tại làm mặc định
    filteredScheduleData: [], // Schedule đã lọc theo tuần
  };


  // get Start date and end date
  getWeekStartEnd = (selectedWeek) => {
    const [year, week] = selectedWeek.split('-W');
    const firstDayOfYear = new Date(year, 0, 1);
    const days = (week - 1) * 7;
    const startDate = new Date(firstDayOfYear.setDate(firstDayOfYear.getDate() + days - firstDayOfYear.getDay() + 1));
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // Ngày kết thúc tuần

    return { startDate, endDate };
  };

  // filter schedule by week Now
  filterScheduleByWeek = (selectedWeek, data) => {
    const { startDate, endDate } = this.getWeekStartEnd(selectedWeek);
    const filteredSchedule = data.filter(item =>
      startDate <= endDate
    );
    this.setState({ filteredScheduleData: filteredSchedule });
    console.log(startDate <= endDate);
    console.log(startDate.getTime());

  };

  componentDidMount() {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5124/api/Schedule/GetAllSchedules');
        const data = response.data;
        const a = this.filterScheduleByWeek(this.state.selectedWeek, data);
        this.setState({ scheduleData: data });
        console.log(data);
        console.log(a);
        console.log(this.state.selectedWeek);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }

  handleWeekChange = (event) => {
    const selectedWeek = event.target.value;
    this.setState({ selectedWeek });
    this.filterScheduleByWeek(selectedWeek, this.state.scheduleData); // Lọc lại danh sách theo tuần mới

  };

  renderTable = () => {
    const { scheduleData, daysOfWeek, timeslots, filteredScheduleData } = this.state;
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
                    <div className="week-selector">
                      <input
                        type="week"
                        value={this.state.selectedWeek}
                        onChange={this.handleWeekChange}
                        className="week-input"
                      />
                      {/* {weekStartEnd.start && weekStartEnd.end && (
                        <div className="week-dates">
                          Tuần từ: <strong>{weekStartEnd.start}</strong> đến <strong>{weekStartEnd.end}</strong>
                        </div>
                      )} */}
                    </div>
                    {roleId === 2 ? (
                      <a
                        onClick={() => this.handleCreateCategory()}
                        className="btn btn-success text-white"
                      >
                        Create New Schedule
                      </a>
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
                              {filteredScheduleData.map((schedule, dayIndex) => (
                                <td key={dayIndex}>
                                  {schedule.schedule && schedule.schedule[timeslotIndex] ? (
                                    <div>
                                      <strong>{schedule.schedule[timeslotIndex].activity || 'No activity'}</strong>
                                      <div className="d-flex flex-column">
                                        {schedule.schedule[timeslotIndex].location && (
                                          <span style={{ fontSize: 'smaller' }} className="pt-2">
                                            <i className="icon-layers m-1"></i>
                                            {schedule.schedule[timeslotIndex].location + ' - ' + `NameClass`}
                                          </span>
                                        )}
                                        {schedule.schedule[timeslotIndex].teacher
                                          && (
                                            <span style={{ fontSize: 'smaller' }} className="pt-2">
                                              <i className="icon-user m-1"></i>
                                              {schedule.schedule[timeslotIndex].teacher}
                                            </span>
                                          )}
                                        {schedule.schedule[timeslotIndex].note
                                          && (
                                            <span style={{ fontSize: 'smaller', maxWidth: '145px' }} className="pt-2 text-truncate d-block" >
                                              <i className="icon-notebook m-1"></i>
                                              {schedule.schedule[timeslotIndex].note}
                                            </span>
                                          )}
                                      </div>
                                    </div>
                                  ) : (
                                    <></>
                                  )}
                                </td>
                              ))}
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
