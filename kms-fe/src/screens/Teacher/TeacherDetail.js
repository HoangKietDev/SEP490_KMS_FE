import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from 'react-router-dom';
import axios from "axios";
import defaultImage from "../../assets/images/profile-default.jpg"

class TeacherDetail extends React.Component {
  state = {
    TeacherData: {
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
      avatar1: "",
    }
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    const { teacherId } = this.props.match.params;
    this.setState({ teacherId: parseInt(teacherId) });

    // Gọi API
    const fetchData = async () => {
      try {
        const TeacherResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/Teacher/GetTeacherById/${teacherId}`);
        const Teacherdata = TeacherResponse.data;
        this.setState({ TeacherData: Teacherdata });
      } catch (error) {
        console.error('Error fetching teacher details:', error);
      }
    };
    fetchData();
  }

  render() {
    // Destructure fields from TeacherData object
    const { firstName, lastName, address, phone, mail, gender, status, dob, code, education, experience, avatar } = this.state.TeacherData;
    
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
                { name: "Teacher Management", navigate: "teacher" },
                { name: "Teacher Detail", navigate: "" },
              ]}
            />
            <div className="row clearfix">
              <div className="col-md-12">
                <div className="card shadow-lg">
                  <div className="card-header text-white theme-colorbg">
                    <h4 className="mb-0">Detail Teacher</h4>
                  </div>
                  <div className="body">
                    <form className="update-teacher-form">
                      <div className="row">
                        <div className="form-group col-md-6">
                          <label>First Name</label>
                          <input
                            className={`form-control`}
                            value={firstName}
                            name="firstName"
                            readOnly
                          />
                        </div>
                        <div className="form-group col-md-6">
                          <label>Last Name</label>
                          <input
                            className="form-control"
                            value={lastName}
                            name="lastName"
                            readOnly
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
                            readOnly
                          />
                        </div>
                        <div className="form-group col-md-6">
                          <label>Phone</label>
                          <input
                            className="form-control"
                            value={phone}
                            name="phone"
                            readOnly
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
                            readOnly
                          />
                        </div>
                        <div className="form-group col-md-6">
                          <label>Email</label>
                          <input
                            className="form-control"
                            value={mail}
                            name="mail"
                            readOnly
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
                              readOnly
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
                              value={dob?.split('T')[0]}
                              name="dob"
                              readOnly
                            />
                          </div>
                          <div className="form-group">
                            <label>Status</label>
                            <select
                              className="form-control"
                              value={status}
                              name="status"
                              readOnly
                            >
                              <option value={1}>Active</option>
                              <option value={0}>Inactive</option>
                            </select>
                          </div>
                        </div>

                        <div className="form-group col-md-6 d-grid">
                          <label>Avatar</label>
                          <img src={avatar || defaultImage} className="img-thumbnail" style={{ marginLeft: "12%", height: '200px', width: '200px' }} alt="Teacher Avatar"></img>
                        </div>
                      </div>

                      <div className="row">
                        <div className="form-group col-md-6">
                          <label>Education</label>
                          <input
                            className="form-control"
                            value={education}
                            name="education"
                            readOnly
                          />
                        </div>
                        <div className="form-group col-md-6">
                          <label>Work Experience</label>
                          <input
                            className="form-control"
                            value={experience}
                            name="experience"
                            readOnly
                          />
                        </div>
                      </div>
                      <br />
                    </form>
                  </div>

                  <div className="text-center pb-4">
                    <a href="/teacher" class="btn btn-success text-white">Back to list Teacher</a>
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
