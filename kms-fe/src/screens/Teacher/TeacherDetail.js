import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from 'react-router-dom';
import axios from "axios";

class TeacherDetail extends React.Component {
  state = {
    id: 0,
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
    const { teacherId } = this.props.match.params;
    this.setState({ studentDetailId: parseInt(teacherId) });
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
                { name: "Teacher Detail", navigate: "" },
              ]}
            />
            <div className="row clearfix">
              <div className="col-md-12">
                <div className="card">
                  <div className="header text-center">
                    <h4>Teacher Detail</h4>
                  </div>
                  <div className="body">
                    <form onSubmit={this.handleSubmit} className="update-teacher-form">
                      <div className="row">
                        <div className="form-group col-md-6">
                          <label>First Name</label>
                          <input
                            className={`form-control`}
                            value={firstName}
                            name="firstName"
                          />
                        </div>
                        <div className="form-group col-md-6">
                          <label>Last Name</label>
                          <input
                            className="form-control"
                            value={lastName}
                            name="lastName"
                          />
                        </div>
                      </div>

                      <div className="row">
                        <div className="form-group col-md-6">
                          <label>Address</label>
                          <input
                            className="form-control"
                            value={address}
                            name="address"
                          />
                        </div>
                        <div className="form-group col-md-6">
                          <label>Phone</label>
                          <input
                            className="form-control"
                            value={phone}
                            name="phone"
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
                            className="form-control"
                            value={mail}
                            name="mail"
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
                            />
                          </div>
                          <div className="form-group">
                            <label>Status</label>
                            <select
                              className="form-control"
                              value={status}
                              name="status"
                            >
                              <option value={1}>Active</option>
                              <option value={0}>Inactive</option>
                            </select>
                          </div>
                        </div>

                        <div className="form-group col-md-6 d-grid">
                          <label>Avatar</label>
                          <img src={avatar} className="img-thumbnail" style={{ maxWidth: "50%", marginLeft: "12%" }} ></img>
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

export default connect(mapStateToProps)(withRouter(TeacherDetail));
