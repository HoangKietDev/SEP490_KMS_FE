import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from "react-router-dom";

class CreateClass extends React.Component {
  state = {
    classId: 0,
    className: "",
    number: 0,
    isActive: 1,
    expireDate: "",
    schoolId: 1,
    semesterId: 0,
    gradeId: 0,
    status: 0,
    submeet: false,
    semesters: [], // Danh sách các semester
    grades: [], // Danh sách các grade
    teachers: [], // Danh sách các giáo viên
    selectedTeachers: [], // Danh sách giáo viên được chọn
  };

  componentDidMount() {
    window.scrollTo(0, 0);
    this.fetchData();
  }

  fetchData = () => {
    Promise.all([
      fetch("http://localhost:5124/api/Semester/GetAllSemester").then((res) => res.json()),
      fetch("http://localhost:5124/api/Grade").then((res) => res.json()),
      fetch("http://localhost:5124/api/Teacher/GetAllTeachers").then((res) => res.json()),
    ])
      .then(([semesters, grades, teachers]) => {
        const activeSemesters = semesters.filter((semester) => semester.status === 0);
        const validTeachers = teachers.filter((teacher) => teacher.name?.trim());
        this.setState({
          semesters: activeSemesters,
          grades,
          teachers: validTeachers,
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        alert("Failed to fetch data.");
      });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { className, number, isActive, schoolId, semesterId, gradeId, selectedTeachers } = this.state;

    if (!className  || semesterId === 0 || gradeId === 0 || selectedTeachers.length === 0) {
      this.setState({ submeet: true });
      return;
    }

    const newClass = {
      classId: 0,
      className,
      number,
      isActive,
      schoolId,
      semesterId,
      gradeId,
      status: 0,
    };

    fetch("http://localhost:5124/api/Class/AddClass", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newClass),
    })
      .then((response) => response.json())
      .then((data) => {
        const classId = data.classId;
        console.log("Class added successfully:", data);
        alert("Class has been added successfully!");

        selectedTeachers.forEach((teacherId) => {
          fetch(`http://localhost:5124/api/Class/AddTeacherToClass?classId=${classId}&teacherId=${teacherId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((res) => res.json())
            .then((result) => {
              console.log(`Teacher ${teacherId} added to class successfully`, result);
            })
            .catch((error) => {
              console.error("Error adding teacher to class:", error);
            });
        });

        this.props.history.push("/viewclass");
        this.resetForm();
      })
      .catch((error) => {
        console.error("Error adding class:", error);
        alert("Failed to add class. Please try again.");
      });
  };

  resetForm = () => {
    this.setState({
      classId: 0,
      className: "",
      number: 0,
      isActive: 1,
      expireDate: "",
      schoolId: 1,
      semesterId: 0,
      gradeId: 0,
      status: 0,
      submeet: false,
      selectedTeachers: [],
    });
  };

  handleTeacherSelection = (teacherId) => {
    const { selectedTeachers } = this.state;
    if (selectedTeachers.includes(teacherId)) {
      this.setState({ selectedTeachers: selectedTeachers.filter((id) => id !== teacherId) });
    } else {
      this.setState({ selectedTeachers: [...selectedTeachers, teacherId] });
    }
  };

  render() {
    const { className, number, semesterId, gradeId, semesters, grades, teachers, selectedTeachers, submeet } = this.state;

    return (
      <div style={{ flex: 1 }} onClick={() => document.body.classList.remove("offcanvas-active")}>
        <div>
          <div className="container-fluid">
            <PageHeader
              HeaderText="Class Management"
              Breadcrumb={[
                { name: "Class Management", navigate: "" },
                { name: "Create Class", navigate: "" },
              ]}
            />
            <form onSubmit={this.handleSubmit}>
              <div className="form-group">
                <label>Class Name</label>
                <input
                  className={`form-control ${className === "" && submeet && "parsley-error"}`}
                  value={className}
                  name="className"
                  onChange={(e) => this.setState({ className: e.target.value })}
                />
                {className === "" && submeet && (
                  <ul className="parsley-errors-list filled">
                    <li className="parsley-required">Class name is required.</li>
                  </ul>
                )}
              </div>

              <div className="form-group">
                <label>Number of Students</label>
                <input
                  type="number"
                  className="form-control"
                  value={number}
                  name="number"
                  onChange={(e) => this.setState({ number: parseInt(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label>Semester</label>
                <select
                  className="form-control"
                  value={semesterId}
                  onChange={(e) => this.setState({ semesterId: parseInt(e.target.value) })}
                >
                  <option value={0}>Select Semester</option>
                  {semesters.map((semester) => (
                    <option key={semester.semesterId} value={semester.semesterId}>
                      {semester.name} ({semester.startDate.split("T")[0]} - {semester.endDate.split("T")[0]})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Grade</label>
                <select
                  className="form-control"
                  value={gradeId}
                  onChange={(e) => this.setState({ gradeId: parseInt(e.target.value) })}
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
                <label>Select Teachers</label>
                {teachers.map((teacher) => (
                  <div key={teacher.teacherId}>
                    <input
                      type="checkbox"
                      checked={selectedTeachers.includes(teacher.teacherId)}
                      onChange={() => this.handleTeacherSelection(teacher.teacherId)}
                    />
                    <label>
                      {teacher.name}
                  
                    </label>
                  </div>
                ))}
              </div>

              <br />
              <button type="submit" className="btn btn-primary">
                Add Class
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

export default connect(mapStateToProps)(withRouter(CreateClass));
