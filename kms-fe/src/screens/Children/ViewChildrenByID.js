import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from 'react-router-dom';
import axios from "axios";

class UpdateChildren extends React.Component {
  state = {
    studentDetailId: 0,
    classId: 1, // Đặt mặc định classId là 1
    fullName: "",
    nickName: "",
    grade: 0,
    dob: "",
    gender: 1,
    status: 1,
    admissionDay: "",
    ethnicGroups: "string", // Thêm trường ethnicGroups
    nationality: "string",   // Thêm trường nationality
    religion: "string",      // Thêm trường religion
    identifier: "string",    // Thêm trường identifier
    issueDate: "",           // Thêm trường issueDate
    issuePlace: "string",    // Thêm trường issuePlace
    studentId: 1,            // Thêm trường studentId
    submeet: false,
  };

  componentDidMount() {
    window.scrollTo(0, 0);
    const { studentID } = this.props.match.params;
    this.setState({ studentDetailId: parseInt(studentID) });

    // Gọi API để lấy thông tin học sinh
    axios.get(`http://localhost:5124/api/ChildrenDetail/GetChildrenDetailsByChildrenId/${studentID}`)
      .then((response) => {
        const data = response.data;

        // Cập nhật state với dữ liệu học sinh
        this.setState({
          studentDetailId: data.studentDetailId,
          fullName: data.fullName,
          nickName: data.nickName,
          grade: data.grade,
          dob: data.dob ? new Date(data.dob).toISOString().slice(0, 10) : "", // Chuyển đổi sang định dạng YYYY-MM-DD
          gender: data.gender,
          status: data.status,
          admissionDay: data.admissionDay ? new Date(data.admissionDay).toISOString().slice(0, 10) : "",
          ethnicGroups: data.ethnicGroups || "string",
          nationality: data.nationality || "string",
          religion: data.religion || "string",
          identifier: data.identifier || "string",
          issueDate: data.issueDate ? new Date(data.issueDate).toISOString().slice(0, 10) : "", // Chuyển đổi sang định dạng YYYY-MM-DD
          issuePlace: data.issuePlace || "string",
          studentId: data.studentId || 1,
        });
      })
      .catch((error) => {
        console.error("Error fetching student data: ", error);
        alert("Failed to fetch student data. Please try again.");
      });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { studentDetailId, classId, fullName, nickName, grade, dob, gender, status, admissionDay, ethnicGroups, nationality, religion, identifier, issueDate, issuePlace, studentId } = this.state;

    // Kiểm tra dữ liệu trước khi gửi
    if (!fullName || !dob) {
      this.setState({ submeet: true });
      return;
    }

    // Chuẩn bị dữ liệu cập nhật học sinh
    const updatedStudent = {
      studentDetailId,
      classId, // Sử dụng classId mặc định là 1
      fullName,
      nickName,
      grade,
      dob,
      gender,
      status,
      admissionDay,
      ethnicGroups,
      nationality,
      religion,
      identifier,
      issueDate,
      issuePlace,
      studentId,
    };

    console.log("Updating student with data:", updatedStudent); // In dữ liệu gửi đi

    // Gọi API cập nhật học sinh
    axios.put("http://localhost:5124/api/ChildrenDetail/UpdateChildrenDetails", updatedStudent, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        console.log("Student updated successfully:", response.data);
        alert("Student has been updated successfully!");

        // Chuyển hướng về danh sách học sinh
        this.props.history.push('/viewstudents');
      })
      .catch((error) => {
        console.error("Error updating student:", error.response ? error.response.data : error.message); // Log thêm thông tin lỗi
        alert("Failed to update student. Please try again.");
      });
  };

  render() {
    const { fullName, nickName, grade, dob, gender, status, admissionDay, ethnicGroups, nationality, religion, identifier, issueDate, issuePlace, submeet } = this.state;

    return (
      <div
        style={{ flex: 1 }}
        onClick={() => document.body.classList.remove("offcanvas-active")}
      >
        <div>
          <div className="container-fluid">
            <PageHeader
              HeaderText="Student Management"
              Breadcrumb={[
                { name: "Student Management", navigate: "" },
                { name: "Update Student", navigate: "" },
              ]}
            />
            <form onSubmit={this.handleSubmit} className="update-student-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  className={`form-control ${fullName === "" && submeet && "parsley-error"}`}
                  value={fullName}
                  name="fullName"
                  onChange={(e) => this.setState({ fullName: e.target.value })}
                />
                {fullName === "" && submeet && (
                  <ul className="parsley-errors-list filled">
                    <li className="parsley-required">Full name is required.</li>
                  </ul>
                )}
              </div>

              <div className="form-group">
                <label>Nick Name</label>
                <input
                  className="form-control"
                  value={nickName}
                  name="nickName"
                  onChange={(e) => this.setState({ nickName: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group col-md-6">
                  <label>Grade</label>
                  <input
                    className="form-control"
                    value={grade}
                    name="grade"
                    type="number"
                    onChange={(e) => this.setState({ grade: e.target.value })}
                  />
                </div>

                <div className="form-group col-md-6">
                  <label>Date of Birth</label>
                  <input
                    className="form-control"
                    type="date"
                    value={dob}
                    name="dob"
                    onChange={(e) => this.setState({ dob: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group col-md-6">
                  <label>Gender</label>
                  <select
                    className="form-control"
                    value={gender}
                    name="gender"
                    onChange={(e) => this.setState({ gender: e.target.value })}
                  >
                    <option value={1}>Male</option>
                    <option value={0}>Female</option>
                  </select>
                </div>

                <div className="form-group col-md-6">
                  <label>Status</label>
                  <select
                    className="form-control"
                    value={status}
                    name="status"
                    onChange={(e) => this.setState({ status: e.target.value })}
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group col-md-6">
                  <label>Admission Day</label>
                  <input
                    className="form-control"
                    type="date"
                    value={admissionDay}
                    name="admissionDay"
                    onChange={(e) => this.setState({ admissionDay: e.target.value })}
                  />
                </div>

                <div className="form-group col-md-6">
                  <label>Ethnic Groups</label>
                  <input
                    className="form-control"
                    value={ethnicGroups}
                    name="ethnicGroups"
                    onChange={(e) => this.setState({ ethnicGroups: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group col-md-6">
                  <label>Nationality</label>
                  <input
                    className="form-control"
                    value={nationality}
                    name="nationality"
                    onChange={(e) => this.setState({ nationality: e.target.value })}
                  />
                </div>

                <div className="form-group col-md-6">
                  <label>Religion</label>
                  <input
                    className="form-control"
                    value={religion}
                    name="religion"
                    onChange={(e) => this.setState({ religion: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group col-md-6">
                  <label>Identifier</label>
                  <input
                    className="form-control"
                    value={identifier}
                    name="identifier"
                    onChange={(e) => this.setState({ identifier: e.target.value })}
                  />
                </div>

                <div className="form-group col-md-6">
                  <label>Issue Date</label>
                  <input
                    className="form-control"
                    type="date"
                    value={issueDate}
                    name="issueDate"
                    onChange={(e) => this.setState({ issueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group col-md-6">
                  <label>Issue Place</label>
                  <input
                    className="form-control"
                    value={issuePlace}
                    name="issuePlace"
                    onChange={(e) => this.setState({ issuePlace: e.target.value })}
                  />
                </div>
              </div>

              <br />
              <button type="submit" className="btn btn-primary">
                Update Student
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ ioTReducer }) => ({
  isSecuritySystem: ioTReducer.isSecuritySystem,
});

export default connect(mapStateToProps)(withRouter(UpdateChildren));
