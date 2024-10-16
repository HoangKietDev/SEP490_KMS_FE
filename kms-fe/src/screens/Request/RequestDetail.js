import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from 'react-router-dom';
import axios from "axios";

class RequestDetail extends React.Component {
  state = {
    requestId: 1,
    title: "Change Class",
    description: "Want to change class for my children",
    status: 1,
    createAt: "21/3/2002",
    createBy: "Parent",
    classId: 101,
    studentId: 161307,
    classChangeId: 103,
    ReasonReject: "Class want to change are already full",
    ClassRequestChangeInfor: {
      className: "classname",
      classChangeName: "classchangename",
      studentName: "name",
      createByName: "createByName"
    },
  };

  async componentDidMount() {
    window.scrollTo(0, 0);
    const { requestId } = this.props.match.params;
    this.setState({ requestId: parseInt(requestId) });

    try {
      // Fetch request details
      const response = await axios.get(`http://localhost:5124/api/Request/GetRequestById/${requestId}`);
      const data = response.data;

      // Update state with request details
      this.setState({
        requestId: data.requestId,
        title: data.title,
        description: data.description,
        createBy: data.createBy,
        createAt: data.createAt ? new Date(data.createAt).toISOString().slice(0, 10) : "",
        classId: data.classId,
        status: data.statusRequest,
        studentId: data.studentId,
        classChangeId: data.classChangeId,
        ReasonReject: data.reasonReject || "",
      });
      
      // Fetch student information
      const studentResponse = await axios.get(`http://localhost:5124/api/Children/GetChildrenByChildrenId/${data.studentId}`);
      const studentData = studentResponse.data;

      this.setState(prevState => ({
        ClassRequestChangeInfor: {
          ...prevState.ClassRequestChangeInfor,
          studentName: studentData?.nickName,
        }
      }));

      // Fetch user information
      const userResponse = await axios.get(`http://localhost:5124/api/User/${data.createBy}`);
      const userData = userResponse.data;

      this.setState(prevState => ({
        ClassRequestChangeInfor: {
          ...prevState.ClassRequestChangeInfor,
          createByName: `${userData?.firstname} ${userData?.lastName}`,
        }
      }));

      // Fetch class information
      const classResponse = await axios.get(`http://localhost:5124/api/Class/GetClassById/${data.classId}`);
      const classData = classResponse.data;
      this.setState(prevState => ({
        ClassRequestChangeInfor: {
          ...prevState.ClassRequestChangeInfor,
          className: classData?.className,
        }
      }));

      // Fetch change class information
      const classChangeResponse = await axios.get(`http://localhost:5124/api/Class/GetClassById/${data.classChangeId}`);
      const classChangeData = classChangeResponse.data;

      this.setState(prevState => ({
        ClassRequestChangeInfor: {
          ...prevState.ClassRequestChangeInfor,
          classChangeName: classChangeData?.className,
        }
      }));

    } catch (error) {
      console.error("Error fetching data: ", error);
      alert("Failed to fetch data. Please try again.");
    }
  }

  render() {
    const { title, description, status, createAt, ClassRequestChangeInfor, changesClassId, ReasonReject } = this.state;
    const statusDescriptions = {
      1: "Processing",
      2: "Staff Approved",
      3: "Staff Reject",
      4: "Principal Approved",
      5: "Principal Reject",
      6: "Cancel",
    };

    return (
      <div
        style={{ flex: 1 }}
        onClick={() => document.body.classList.remove("offcanvas-active")}
      >
        <div className="container-fluid">
          <PageHeader
            HeaderText="Request Management"
            Breadcrumb={[
              { name: "Request Management", navigate: "request" },
              { name: "Request Detail", navigate: "" },
            ]}
          />
          <div className="row clearfix">
            <div className="col-md-12">
              <div className="card">
                <div className="header text-center">
                  <h4>Request Detail</h4>
                </div>
                <div className="body">
                  <form className="update-teacher-form">
                    <div className="row">
                      <div className="form-group col-md-6">
                        <label>Title Request</label>
                        <input className="form-control" value={title} name="title" readOnly />
                      </div>
                      <div className="form-group col-md-6">
                        <label>Create At</label>
                        <input className="form-control" value={createAt} name="createAt" readOnly />
                      </div>
                    </div>

                    <div className="row">
                      <div className="form-group col-md-6">
                        <label>Student</label>
                        <input className="form-control" value={ClassRequestChangeInfor?.studentName} name="studentId" readOnly />
                      </div>
                      <div className="form-group col-md-6">
                        <label>Created by</label>
                        <input className="form-control" value={ClassRequestChangeInfor?.createByName} name="createBy" readOnly />
                      </div>
                    </div>

                    <div className="row">
                      <div className="form-group col-md-6 d-flex flex-column">
                        <label>Request Description</label>
                        <textarea className="form" rows="6" value={description} name="description" readOnly />
                      </div>
                      <div className="form-group col-md-6 d-flex flex-column">
                        <label>Reason Reject</label>
                        <textarea className="form" rows="6" value={ReasonReject} name="ReasonReject" readOnly />
                      </div>
                    </div>

                    <div className="row">
                      <div className="form-group col-md-6">
                        <label>Status</label>
                        <select className="form-control" value={status} name="status" readOnly>
                          {Object.entries(statusDescriptions).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group col-md-6 row">
                        <div className="form-group col-md-6">
                          <label>Class Studying</label>
                          <input className="form-control" value={ClassRequestChangeInfor?.className} name="classId" readOnly />
                        </div>
                        <div className="form-group col-md-6">
                          <label>Class Change</label>
                          <input className="form-control" value={ClassRequestChangeInfor?.classChangeName} name="changesClassId" readOnly />
                        </div>
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
    );
  }
}

const mapStateToProps = ({ ioTReducer }) => ({
  isSecuritySystem: ioTReducer.isSecuritySystem,
});

export default connect(mapStateToProps)(withRouter(RequestDetail));
