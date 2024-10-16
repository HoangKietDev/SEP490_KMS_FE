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
    semesters: [],  // Chứa danh sách các semester
    grades: [],      // Chứa danh sách các grade
  };

  componentDidMount() {
    window.scrollTo(0, 0);

    // Gọi API để lấy danh sách semester và grade
    Promise.all([
      fetch("http://localhost:5124/api/Semester").then((res) => res.json()),
      fetch("http://localhost:5124/api/Grade").then((res) => res.json())
    ])
      .then(([semesters, grades]) => {
        this.setState({ semesters, grades });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        alert("Failed to fetch semesters or grades.");
      });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { classId, className, number, isActive, expireDate, schoolId, semesterId, gradeId, status } = this.state;

    // Kiểm tra dữ liệu trước khi gửi
    if (!className || !expireDate || schoolId === 0) {
      this.setState({ submeet: true });
      return;
    }

    // Chuẩn bị dữ liệu theo schema
    const newClass = {
      classId,
      className,
      number,
      isActive,
      expireDate,
      schoolId,
      semesterId,
      gradeId,
      status,
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
        console.log("Class added successfully:", data);
        // Hiển thị thông báo thành công
        alert("Class has been added successfully!");

        // Chuyển hướng đến /viewclass
        this.props.history.push('/viewclass');

        // Reset form
        this.setState({
          classId: 0,
          className: "",
          number: 0,
          isActive: 1,  // Đặt lại trạng thái isActive mặc định
          expireDate: "",
          schoolId: 1,
          semesterId: 0,
          gradeId: 0,
          status: 1,
          submeet: false,
        });
      })
      .catch((error) => {
        console.error("Error adding class:", error);
        alert("Failed to add class. Please try again.");
      });
  };

  render() {
    const { className, number, isActive, expireDate, schoolId, semesterId, gradeId, status, semesters, grades, submeet } = this.state;

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
                <label>Expire Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={expireDate}
                  name="expireDate"
                  required=""
                  onChange={(e) => this.setState({ expireDate: e.target.value })}
                />
                {expireDate === "" && submeet && (
                  <ul className="parsley-errors-list filled">
                    <li className="parsley-required">Expire date is required.</li>
                  </ul>
                )}
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

// Export component wrapped with withRouter to have access to history
export default connect(mapStateToProps)(withRouter(CreateClass));
