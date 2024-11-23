import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from "react-router-dom";

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
    selectedFile: null, // File ảnh được chọn
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

  handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      this.setState({ selectedFile: file });

      // Hiển thị preview ảnh
      const reader = new FileReader();
      reader.onload = () => {
        this.setState({ avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { studentId, code, fullName, nickName, grade, dob, gender, status, ethnicGroups, nationality, religion, parentId, selectedFile } = this.state;

    if (!fullName || !dob || parentId === 0) {
      this.setState({ submeet: true });
      return;
    }

    // Chuẩn bị dữ liệu theo schema
    const formData = new FormData();
    formData.append("studentId", studentId);
    formData.append("code", code);
    formData.append("fullName", fullName);
    formData.append("nickName", nickName);
    formData.append("gradeId", grade);
    formData.append("dob", dob);
    formData.append("gender", gender);
    formData.append("status", status);
    formData.append("ethnicGroups", ethnicGroups);
    formData.append("nationality", nationality);
    formData.append("religion", religion);
    formData.append("parentId", parentId);

    if (selectedFile) {
      formData.append("avatar", selectedFile);
    }

    // Gọi API để thêm học sinh
    fetch("http://localhost:5124/api/Children/AddChildren", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Student added successfully:", data);
        alert("Student has been added successfully!");

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
          selectedFile: null,
          submeet: false,
        });

        // Chuyển hướng đến danh sách học sinh
        this.props.history.push("/viewallstudent");
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
                { name: "Student Management", navigate: "/viewallstudent" },
                { name: "Create Student", navigate: "" },
              ]}
            />
            <div className="card shadow-lg">
              <div className="card-header text-white" style={{ backgroundColor: "#48C3B4" }}>
                <h4 className="mb-0">Create Student</h4>
              </div>
              <div className="card-body">
                <form onSubmit={this.handleSubmit}>
                  <div className="form-group">
                    <label>Avatar</label>
                    <div className="d-flex align-items-center">
                      {avatar && (
                        <img
                          src={avatar}
                          alt="Avatar Preview"
                          style={{ width: "80px", height: "80px", marginRight: "10px" }}
                          className="rounded-circle border"
                        />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control-file"
                        onChange={this.handleFileChange}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Full Name</label>
                        <input
                          type="text"
                          className={`form-control ${fullName === "" && submeet && "is-invalid"}`}
                          value={fullName}
                          onChange={(e) => this.setState({ fullName: e.target.value })}
                        />
                        {fullName === "" && submeet && (
                          <div className="invalid-feedback">Full name is required.</div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Nick Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={nickName}
                          onChange={(e) => this.setState({ nickName: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Code</label>
                        <input
                          type="text"
                          className="form-control"
                          value={code}
                          onChange={(e) => this.setState({ code: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Date of Birth</label>
                        <input
                          type="date"
                          className="form-control"
                          value={dob}
                          onChange={(e) => this.setState({ dob: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
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
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Gender</label>
                        <select
                          className="form-control"
                          value={gender}
                          onChange={(e) => this.setState({ gender: parseInt(e.target.value) })}
                        >
                          <option value={0}>Female</option>
                          <option value={1}>Male</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Nationality</label>
                        <input
                          type="text"
                          className="form-control"
                          value={nationality}
                          onChange={(e) => this.setState({ nationality: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Religion</label>
                        <input
                          type="text"
                          className="form-control"
                          value={religion}
                          onChange={(e) => this.setState({ religion: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Ethnic Groups</label>
                        <input
                          type="text"
                          className="form-control"
                          value={ethnicGroups}
                          onChange={(e) => this.setState({ ethnicGroups: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Parent ID</label>
                        <input
                          type="number"
                          className="form-control"
                          value={parentId}
                          onChange={(e) => this.setState({ parentId: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      className="form-control"
                      value={status}
                      onChange={(e) => this.setState({ status: parseInt(e.target.value) })}
                    >
                      <option value={0}>Inactive</option>
                      <option value={1}>Active</option>
                    </select>
                  </div>

                  <div className="text-right">
                    <button type="submit" className="btn btn-primary">
                      Add Student
                    </button>
                  </div>
                </form>
              </div>
            </div>
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
