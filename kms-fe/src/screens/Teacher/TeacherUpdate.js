import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from 'react-router-dom';
import axios from "axios";

class UpdateChildren extends React.Component {
  state = {
    teacherId: 0,
    firstName: "Hoang",
    lastName: "Kiet",
    address: "Thai Binh",
    phone: "0323241545",
    mail: "kiet7cvl@gmail.com",
    gender: 1,
    status: 1,
    dob: "21/3/2002",
    code: "TC101",
    education: "string",
    experience: "string",
    avatar: "https://greekherald.com.au/wp-content/uploads/2020/07/default-avatar.png",
  };

  componentDidMount() {
    window.scrollTo(0, 0);
    const { studentID } = this.props.match.params;
    this.setState({ teacherId: parseInt(studentID) });

    // Gọi API để lấy thông tin học sinh
    // axios.get(`http://localhost:5124/api/ChildrenDetail/GetChildrenDetailsByChildrenId/${studentID}`)
    //   .then((response) => {
    //     const data = response.data;

    //     // Cập nhật state với dữ liệu học sinh
    //     this.setState({
    //       studentDetailId: data.studentDetailId,
    //       fullName: data.fullName,
    //       nickName: data.nickName,
    //       grade: data.grade,
    //       dob: data.dob ? new Date(data.dob).toISOString().slice(0, 10) : "", // Chuyển đổi sang định dạng YYYY-MM-DD
    //       gender: data.gender,
    //       status: data.status,
    //       admissionDay: data.admissionDay ? new Date(data.admissionDay).toISOString().slice(0, 10) : "",
    //       ethnicGroups: data.ethnicGroups || "string",
    //       nationality: data.nationality || "string",
    //       religion: data.religion || "string",
    //       identifier: data.identifier || "string",
    //       issueDate: data.issueDate ? new Date(data.issueDate).toISOString().slice(0, 10) : "", // Chuyển đổi sang định dạng YYYY-MM-DD
    //       issuePlace: data.issuePlace || "string",
    //       studentId: data.studentId || 1,
    //     });
    //   })
    //   .catch((error) => {
    //     console.error("Error fetching student data: ", error);
    //     alert("Failed to fetch student data. Please try again.");
    //   });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    // const { studentDetailId, classId, fullName, nickName, grade, dob, gender, status, admissionDay, ethnicGroups, nationality, religion, identifier, issueDate, issuePlace, studentId } = this.state;

    // // Kiểm tra dữ liệu trước khi gửi
    // if (!fullName || !dob) {
    //   this.setState({ submeet: true });
    //   return;
    // }

    // // Chuẩn bị dữ liệu cập nhật học sinh
    // const updatedStudent = {
    //   studentDetailId,
    //   classId, // Sử dụng classId mặc định là 1
    //   fullName,
    //   nickName,
    //   grade,
    //   dob,
    //   gender,
    //   status,
    //   admissionDay,
    //   ethnicGroups,
    //   nationality,
    //   religion,
    //   identifier,
    //   issueDate,
    //   issuePlace,
    //   studentId,
    // };

    // console.log("Updating student with data:", updatedStudent); // In dữ liệu gửi đi

    // // Gọi API cập nhật học sinh
    // axios.put("http://localhost:5124/api/ChildrenDetail/UpdateChildrenDetails", updatedStudent, {
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // })
    //   .then((response) => {
    //     console.log("Student updated successfully:", response.data);
    //     alert("Student has been updated successfully!");

    //     // Chuyển hướng về danh sách học sinh
    //     this.props.history.push('/viewstudents');
    //   })
    //   .catch((error) => {
    //     console.error("Error updating student:", error.response ? error.response.data : error.message); // Log thêm thông tin lỗi
    //     alert("Failed to update student. Please try again.");
    //   });
  };

  handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.setState({ avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  render() {
    const { firstName, lastName, address, phone, mail, gender, status, dob, code, education, experience, avatar } = this.state;

    return (
      <div
        style={{ flex: 1 }}
        onClick={() => document.body.classList.remove("offcanvas-active")}
      >
        <div>
          <div className="container-fluid">
            <PageHeader
              HeaderText="Teacher Management"
              Breadcrumb={[
                { name: "Teacher Management", navigate: "" },
                { name: "Update Teacher", navigate: "" },
              ]}
            />
            <div className="row clearfix">
              <div className="col-md-12">
                <div className="card">
                  <div className="header text-center">
                    <h4>Teacher Update</h4>
                  </div>
                  <div className="body">
                    <form onSubmit={this.handleSubmit} className="update-teacher-form">
                      <div className="row">
                        <div className="form-group col-md-6">
                          <label>First Name</label>
                          <input
                            className={`form-control ${firstName === "" && "parsley-error"}`}
                            value={firstName}
                            name="firstName"
                            type="text"
                            onChange={(e) => {
                              this.setState({
                                [e.target.name]: e.target.value,
                              });
                            }}
                          />
                        </div>
                        <div className="form-group col-md-6">
                          <label>Last Name</label>
                          <input
                            className={`form-control ${lastName === "" && "parsley-error"}`}
                            value={lastName}
                            name="lastName"
                            type="text"
                            onChange={(e) => {
                              this.setState({
                                [e.target.name]: e.target.value,
                              });
                            }}
                          />
                        </div>
                      </div>

                      <div className="row">
                        <div className="form-group col-md-6">
                          <label>Address</label>
                          <input
                            className={`form-control ${address === "" && "parsley-error"}`}
                            value={address}
                            name="address"
                            type="text"
                            onChange={(e) => {
                              this.setState({
                                [e.target.name]: e.target.value,
                              });
                            }}
                          />
                        </div>
                        <div className="form-group col-md-6">
                          <label>Phone</label>
                          <input
                            className={`form-control ${phone === "" && "parsley-error"}`}
                            value={phone}
                            name="phone"
                            type="text"
                            onChange={(e) => {
                              this.setState({
                                [e.target.name]: e.target.value,
                              });
                            }}
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="form-group col-md-6">
                          <label>Code</label>
                          <input
                            className="form-control"
                            value={code}
                            name="code"
                          />
                        </div>
                        <div className="form-group col-md-6">
                          <label>Email</label>
                          <input
                            className={`form-control ${mail === "" && "parsley-error"}`}
                            value={mail}
                            name="mail"
                            type="email"
                            onChange={(e) => {
                              this.setState({
                                [e.target.name]: e.target.value,
                              });
                            }}
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="form-group col-md-6">
                          <div className="form-group">
                            <label>Gender</label>
                            <select
                              className="form-control"
                              value={gender}
                              name="gender"
                              onChange={(e) => {
                                this.setState({
                                  [e.target.name]: e.target.value,
                                });
                              }}
                            >
                              <option value={1}>Male</option>
                              <option value={0}>Female</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Date Of Birth</label>
                            <input
                              className="form-control"
                              type="date"
                              value={dob}
                              name="dob"
                              onChange={(e) => {
                                this.setState({
                                  [e.target.name]: e.target.value,
                                });
                              }}
                            />
                          </div>
                          <div className="form-group">
                            <label>Status</label>
                            <select
                              className="form-control"
                              value={status}
                              name="status"
                              onChange={(e) => {
                                this.setState({
                                  [e.target.name]: e.target.value,
                                });
                              }}
                            >
                              <option value={1}>Active</option>
                              <option value={0}>Inactive</option>
                            </select>
                          </div>
                        </div>

                        <div className="form-group col-md-6 d-grid">
                          <label>Avatar</label>
                          <div onClick={() => this.fileInput.click()}>
                            <img src={avatar} className="img-thumbnail" style={{ maxWidth: "50%", marginLeft: "12%" }} alt="Avatar" />
                          </div>
                          <input
                            type="file"
                            style={{ display: 'none' }}
                            ref={input => this.fileInput = input}
                            onChange={this.handleAvatarChange}
                            accept="image/*"
                          />
                        </div>
                      </div>

                      <div className="row">
                        <div className="form-group col-md-6">
                          <label>Educaiton</label>
                          <input
                            className="form-control"
                            value={education}
                            name="education"
                          />
                        </div>
                        <div className="form-group col-md-6">
                          <label>Work Experience</label>
                          <input
                            className="form-control"
                            value={experience}
                            name="experience"
                          />
                        </div>
                      </div>

                      <div className="text-center">
                        <button type="submit" className="btn btn-primary my-4 text-center">Update Teacher</button>
                      </div>
                      <br />
                    </form>
                  </div>
                </div>
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

export default connect(mapStateToProps)(withRouter(UpdateChildren));
