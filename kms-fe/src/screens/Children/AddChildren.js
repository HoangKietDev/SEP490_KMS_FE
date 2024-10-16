import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from 'react-router-dom';

class CreateChildren extends React.Component {
  state = {
    studentId: 0,
    code: "",
    fullName: "",
    nickName: "",
    grade: 0,
    dob: "",
    gender: 0,
    status: 0,
    ethnicGroups: "",
    nationality: "",
    religion: "",
    parentId: 0,
    avatar: "",
    submeet: false,
    grades: [], // Chứa danh sách các grade
  };

  componentDidMount() {
    window.scrollTo(0, 0);

    // Gọi API để lấy danh sách grade
    fetch("http://localhost:5124/api/Grade")
      .then((res) => res.json())
      .then((grades) => {
        this.setState({ grades });
      })
      .catch((error) => {
        console.error("Error fetching grades: ", error);
        alert("Failed to fetch grades.");
      });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { studentId, code, fullName, nickName, grade, dob, gender, status, ethnicGroups, nationality, religion, parentId, avatar } = this.state;

    // Kiểm tra dữ liệu trước khi gửi
    if (!fullName || !dob || parentId === 0) {
      this.setState({ submeet: true });
      return;
    }

    // Chuẩn bị dữ liệu theo schema
    const newStudent = {
      studentId,
      code,
      fullName,
      nickName,
      grade,
      dob,
      gender,
      status,
      ethnicGroups,
      nationality,
      religion,
      parentId,
      avatar,
    };

    // Gọi API để thêm học sinh
    fetch("http://localhost:5124/api/Children/AddChildren", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newStudent),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Student added successfully:", data);
        alert("Student has been added successfully!");

        // Chuyển hướng đến /viewchildren
        this.props.history.push('/viewallstudent');

        // Reset form
        this.setState({
          studentId: 0,
          code: "",
          fullName: "",
          nickName: "",
          grade: 0,
          dob: "",
          gender: 0,
          status: 0,
          ethnicGroups: "",
          nationality: "",
          religion: "",
          parentId: 0,
          avatar: "",
          submeet: false,
        });
      })
      .catch((error) => {
        console.error("Error adding student:", error);
        alert("Failed to add student. Please try again.");
      });
  };

  render() {
    const { fullName, nickName, code, grade, dob, gender, status, ethnicGroups, nationality, religion, parentId, avatar, grades, submeet } = this.state;

    return (
      <div style={{ flex: 1 }} onClick={() => document.body.classList.remove("offcanvas-active")}>
        <div>
          <div className="container-fluid">
            <PageHeader
              HeaderText="Student Management"
              Breadcrumb={[
                { name: "Student Management", navigate: "" },
                { name: "Create Student", navigate: "" },
              ]}
            />
            <form onSubmit={this.handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  className={`form-control ${fullName === "" && submeet && "parsley-error"}`}
                  value={fullName}
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
                  onChange={(e) => this.setState({ nickName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Code</label>
                <input
                  className="form-control"
                  value={code}
                  onChange={(e) => this.setState({ code: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  className="form-control"
                  value={dob}
                  onChange={(e) => this.setState({ dob: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Grade</label>
                <select
                  className="form-control"
                  value={grade}
                  onChange={(e) => this.setState({ grade: parseInt(e.target.value) })}
                >
                  <option value={0}>Select Grade</option>
                  {grades.map((grade) => (
                    <option key={grade.gradeId} value={grade.gradeId}>
                      {grade.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Gender</label>
                <input
                  type="number"
                  className="form-control"
                  value={gender}
                  onChange={(e) => this.setState({ gender: parseInt(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label>Nationality</label>
                <input
                  className="form-control"
                  value={nationality}
                  onChange={(e) => this.setState({ nationality: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Religion</label>
                <input
                  className="form-control"
                  value={religion}
                  onChange={(e) => this.setState({ religion: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Ethnic Groups</label>
                <input
                  className="form-control"
                  value={ethnicGroups}
                  onChange={(e) => this.setState({ ethnicGroups: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Parent ID</label>
                <input
                  type="number"
                  className="form-control"
                  value={parentId}
                  onChange={(e) => this.setState({ parentId: parseInt(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label>Avatar URL</label>
                <input
                  className="form-control"
                  value={avatar}
                  onChange={(e) => this.setState({ avatar: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <input
                  type="number"
                  className="form-control"
                  value={status}
                  onChange={(e) => this.setState({ status: parseInt(e.target.value) })}
                />
              </div>

              <br />
              <button type="submit" className="btn btn-primary">
                Add Student
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

export default connect(mapStateToProps)(withRouter(CreateChildren));
