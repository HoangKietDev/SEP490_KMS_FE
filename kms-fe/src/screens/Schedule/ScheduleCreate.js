import React from "react";
// import { withRouter } from "react-router-dom";
import "./Schedule.css"; // Tạo file CSS riêng cho các style
import PageHeader from "../../components/PageHeader";
import axios from "axios";
import Modal from "react-bootstrap/Modal"; // Import Bootstrap Modal
import Button from "react-bootstrap/Button";

class ScheduleCreate extends React.Component {

  state = {
    classData: [],
    startdate: '',
    enddate: '',
    classId: null,
  };


  componentDidMount() {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5124/api/Class/GetAllClass`);
        const data = response.data;
        this.setState({
          classData: data,
        })
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }


  handleCreateSchedule = async (event) => {
    event.preventDefault(); // Prevent form from reloading the page

    // Prepare the schedule data to send
    const { startdate, enddate, classId } = this.state;
    const scheduleData = {
      startDate: startdate,
      endDate: enddate,
      status: 0,
      classId: parseInt(classId),
      teacherName: '',
    };

    try {
      // Make POST request to create the new schedule
      const response = await axios.post(`http://localhost:5124/api/Schedule/AddSchedule`, scheduleData);
      console.log('Schedule created successfully:', response.data);

      // Optionally, you can redirect or show a success message after creation
      this.props.history.push('/listschedule'); // Redirect to the schedule list after creation
    } catch (error) {
      console.error('Error creating schedule:', error);
    }
  };



  render() {
    return (
      <div style={{ flex: 1 }} onClick={() => document.body.classList.remove("offcanvas-active")}>
        <div className="container-fluid">
          <PageHeader
            HeaderText="New Request"
            Breadcrumb={[
              { name: "Schedule List", navigate: "listschedule" },
              { name: "Schedule Create", navigate: "" },
            ]}
          />
          <div className="row clearfix">
            <div className="col-md-12">
              <div className="card">
                <div className="header text-center">
                  <h4>Create New Schedule</h4>
                </div>
                <div className="body">
                  <form onSubmit={this.handleCreateSchedule}>
                    <div className="row">
                      <div className="form-group col-md-12 d-flex flex-column">
                        <label>Class</label>
                        <select
                          className="form-control"
                          value={this.state.classId}
                          name="classname"
                          required
                          onChange={(e) => this.setState({ classId: e.target.value })}
                        >
                          <option value="">Choose Class</option>
                          {this.state.classData?.map((option) => (
                            <option key={option.classId} value={option.classId}>
                              {option.className}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="row">
                      <div className="form-group col-md-6">
                        <label>Start Date</label>
                        <input
                          className="form-control"
                          value={this.state.startdate}
                          name="startdate"
                          required
                          type="date"
                          onChange={(e) => this.setState({ startdate: e.target.value })}
                        />
                      </div>
                      <div className="form-group col-md-6">
                        <label>End Date</label>
                        <input
                          className="form-control"
                          value={this.state.enddate}
                          name="enddate"
                          required
                          type="date"
                          onChange={(e) => this.setState({ enddate: e.target.value })}
                        />
                      </div>
                    </div>
                    <br />
                    <div className="text-center">
                      <button type="submit" className="btn btn-success">
                        Create Schedule
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default (ScheduleCreate);
