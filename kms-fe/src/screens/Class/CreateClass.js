import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from 'react-router-dom';

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
    semesters: [],      // Chứa danh sách các semester
    grades: [],         // Chứa danh sách các grade
    teachers: [],       // Chứa danh sách các giáo viên
    selectedTeachers: [] // Chứa danh sách giáo viên được chọn
  };

  componentDidMount() {
    window.scrollTo(0, 0);

    // Gọi API để lấy danh sách semester, grade và teachers
    Promise.all([
      fetch("http://localhost:5124/api/Semester").then((res) => res.json()),
      fetch("http://localhost:5124/api/Grade").then((res) => res.json()),
      fetch("http://localhost:5124/api/Teacher/GetAllTeachers").then((res) => res.json())
    ])
      .then(([semesters, grades, teachers]) => {
        this.setState({ semesters, grades, teachers });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        alert("Failed to fetch data.");
      });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { className, number, isActive, expireDate, schoolId, semesterId, gradeId, selectedTeachers } = this.state;
  
    // Kiểm tra dữ liệu trước khi gửi
    if (!className || !expireDate || schoolId === 0) {
      this.setState({ submeet: true });
      return;
    }
  
    // Chuẩn bị dữ liệu để gửi lên API
    const newClass = {
      classId: 0,  // Không cần gửi classId, vì API sẽ tự tạo và trả về
      className,
      number,
      isActive,
      expireDate,
      schoolId,
      semesterId,
      gradeId,
      status: 0,  // Đặt mặc định là 0 khi gửi lên API
    };
  
    // Gọi API để thêm lớp học
    fetch("http://localhost:5124/api/Class/AddClass", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newClass),
    })
      .then((response) => response.json())
      .then((data) => {
        const classId = data.classId;  // Lấy classId từ phản hồi API sau khi tạo lớp
  
        console.log("Class added successfully:", data);
        alert("Class has been added successfully!");
  
        // Gọi API để thêm từng giáo viên vào lớp
        selectedTeachers.forEach((teacherId) => {
          fetch(`http://localhost:5124/api/Class/AddTeacherToClass?classId=${classId}&teacherId=${teacherId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ classId, teacherId }),  // Sử dụng classId vừa tạo
          })
            .then((res) => res.json())
            .then((result) => {
              console.log(`Teacher ${teacherId} added to class successfully`, result);
            })
            .catch((error) => {
              console.error("Error adding teacher to class:", error);
            });
        });
  
        // Chuyển hướng đến trang viewclass sau khi tạo lớp và thêm giáo viên xong
        this.props.history.push('/viewclass');
  
        // Reset form sau khi thêm thành công
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
          selectedTeachers: []  // Reset lựa chọn giáo viên
        });
      })
      .catch((error) => {
        console.error("Error adding class:", error);
        alert("Failed to add class. Please try again.");
      });
  };
  



  handleTeacherSelection = (teacherId) => {
    const { selectedTeachers } = this.state;
    if (selectedTeachers.includes(teacherId)) {
      this.setState({ selectedTeachers: selectedTeachers.filter(id => id !== teacherId) });
    } else {
      this.setState({ selectedTeachers: [...selectedTeachers, teacherId] });
    }
  };

  render() {
    const { className, number, expireDate, semesterId, gradeId, semesters, grades, teachers, selectedTeachers, submeet } = this.state;

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
                  required=""
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
                      {semester.name}
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
                    <label>{teacher.name}</label>
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
