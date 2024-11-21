import React from "react";
// import { withRouter } from "react-router-dom";
import "./Schedule.css"; // Tạo file CSS riêng cho các style
import PageHeader from "../../components/PageHeader";
import axios from "axios";
import Modal from "react-bootstrap/Modal"; // Import Bootstrap Modal
import Button from "react-bootstrap/Button";

class ScheduleCreate extends React.Component {

  state = {
    semesterData: [],
    classData: [],
    semesterId: null,
    classId: null,
    semesterName: ''
  };


  componentDidMount() {
    window.scrollTo(0, 0);

    // Gọi hàm fetchData
    this.fetchData();
  }

  async fetchData() {
    try {
      const [classResponse, semesterResponse] = await Promise.all([
        axios.get('http://localhost:5124/api/Class/GetAllClass'),
        axios.get('http://localhost:5124/api/Semester/GetAllSemester')
      ]);

      this.setState({
        classData: classResponse.data,
        semesterData: semesterResponse.data,
      });
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }


  handleCreateSchedule = async (event) => {
    event.preventDefault(); // Prevent form from reloading the page

    // Prepare the schedule data to send
    const { startdate, enddate, classId, semesterId } = this.state;
    const scheduleData = {
      semesterId: parseInt(semesterId),
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

  handleChooseClass = (event) => {
    const selectedClassId = event.target.value;
    this.setState({ classId: selectedClassId }, () => {
      const classchoose = this.state.classData.find((i) => i.classId === parseInt(this.state.classId));
      
      console.log(classchoose);
      
      if (classchoose) {
        const relatedSemester = this.state.semesterData.filter((i) => i.semesterId === classchoose.semesterId);
        console.log(relatedSemester);
        
        this.setState({
          semesterId: relatedSemester[0]?.semesterId,
          semesterName: relatedSemester[0]?.name,
        })
      }

    });
  };



  render() {
    return (
      <div style={{ flex: 1 }} onClick={() => document.body.classList.remove("offcanvas-active")}>
        <div className="container-fluid">
          <PageHeader
            HeaderText="New Schedule"
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
                          onChange={this.handleChooseClass}
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
                      <div className="form-group col-md-12">
                        <label>Semeter</label>
                        <input
                          className="form-control"
                          value={this.state.semesterName}
                          name="semesterName"
                          readOnly
                          type="text"
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
