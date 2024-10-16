import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from 'react-router-dom';


class RequestList extends React.Component {
  state = {
    // RequestListData: [], // State để lưu trữ dữ liệu từ API
    RequestListData: [{
      requestId: 1,
      title: "Change Class",
      description: "Want to change class for my children",
      status: 1,
      createAt: "21/3/2002",
      createBy: "Parent",
      classId: 101,
      studentId: 161307,
      changesClassId: 103,
      ReasonReject: "Class want to change are already full"
    }, {
      requestId: 1,
      title: "Change Class",
      description: "Want to change class for my children",
      status: 2,
      createAt: "21/3/2002",
      createBy: "Parent",
      classId: 101,
      studentId: 161307,
      changesClassId: 103,
      ReasonReject: "Class want to change are already full"
    }]
  };


  componentDidMount() {
    window.scrollTo(0, 0);
    // Gọi API và cập nhật state
    fetch("http://localhost:5124/api/Request/GetAllRequests")
      .then((response) => response.json())
      .then((data) => {
        this.setState({ RequestListData: data });
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });


  }

  handleEdit = (requestId) => {
    this.props.history.push(`/request-update/${requestId}`);
  };

  handleDetail = (requestId) => {
    this.props.history.push(`/request-detail/${requestId}`);
  };

  handleCreateCategory = () => {
    // Chuyển hướng đến trang add teacher
    this.props.history.push(`/create-request`);
  };



  render() {
    const { RequestListData } = this.state;
    const statusDescriptions = {
      1: "Proccessing",
      2: "Staff Approved",
      3: "Staff Reject",
      4: "Principal Approved",
      5: "Principal Reject",
      6: "Cancel",
    };
    let NewRequestListData = []
    const userData = JSON.parse(localStorage.getItem("user")).user;
    const roleId = userData.roleId
    if(roleId === 2) {
       NewRequestListData = RequestListData.filter(i => i.createBy === userData.userId)
    } else {
       NewRequestListData = RequestListData
    }
    return (
      <div
        style={{ flex: 1 }}
        onClick={() => {
          document.body.classList.remove("offcanvas-active");
        }}
      >
        <div>
          <div className="container-fluid">
            <PageHeader
              HeaderText="Request Management"
              Breadcrumb={[
                { name: "Request Management", navigate: "request" },
                { name: "Request List", navigate: "" },
              ]}
            />
            <div className="row clearfix">

              <div className="col-lg-12 col-md-12">
                <div className="card planned_task">
                  <div className="header d-flex justify-content-between">
                    <h2>Request Manager</h2>
                    {roleId === 2 ? (
                      <a onClick={() => this.handleCreateCategory()} class="btn btn-success text-white">Create New Request</a>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="col-lg-12 col-md-12">
                <div className="card">
                  <div className="body project_report">
                    <div className="table-responsive">
                      <table className="table m-b-0 table-hover">
                        <thead className="thead-light">
                          <tr>
                            <th>#</th>
                            <th>Title</th>
                            <th>Description Name</th>
                            <th>Create By</th>
                            <th>Create At</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {NewRequestListData?.map((request, index) => (
                            <React.Fragment key={"teacher" + index}>
                              <tr>
                                <td>{index + 1}</td>
                                <td>{request?.title}</td>
                                <td>{request?.description}</td>
                                <td>{request?.createBy}</td>
                                <td> {request?.createAt ? request.createAt.slice(0, 10) : ''}</td>
                                <td>
                                  {statusDescriptions[request?.statusRequest] || "Unknown Status"}
                                </td>
                                <td className="project-actions">
                                  <a className="btn btn-outline-secondary mr-1"
                                    onClick={() => this.handleDetail(request.requestId)}
                                  >
                                    <i className="icon-eye"></i>
                                  </a>

                                  {roleId === 3 || roleId === 4 ? (
                                    <a
                                      className="btn btn-outline-secondary"
                                      onClick={() => this.handleEdit(request.requestId)}
                                    >
                                      <i className="icon-pencil"></i>
                                    </a>
                                  ) : null}
                                </td>

                              </tr>
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
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

export default connect(mapStateToProps)(withRouter(RequestList));
