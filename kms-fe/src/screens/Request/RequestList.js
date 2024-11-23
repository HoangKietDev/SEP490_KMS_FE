import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
// import { withRouter } from 'react-router-dom';
import axios from "axios";
import { getSession } from "../../components/Auth/Auth";


class RequestList extends React.Component {
  state = {
    UserListData: [],
    RequestListData: [],
    NewRequestListData: []
  };

  componentDidMount() {
    window.scrollTo(0, 0);
    // Gọi API và cập nhật state bằng axios
    axios.get("http://localhost:5124/api/Request/GetAllRequests")
      .then((response) => {
        this.setState({ RequestListData: response.data });
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });

    axios.get("http://localhost:5124/api/User")
      .then((response) => {
        this.setState({ UserListData: response.data });
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

  handleCreateRequest = () => {
    // Chuyển hướng đến trang add teacher
    this.props.history.push(`/create-request`);
  };



  render() {
    const { RequestListData, UserListData } = this.state;
    const statusDescriptions = {
      1: "Pending",
      2: "Processing",
      3: "Approved",
      4: "Rejected",
    };
    let NewRequestListData = []

    const userData = getSession('user')?.user;
    const roleId = userData?.roleId

    console.log(RequestListData);

    if (roleId === 5) {
      NewRequestListData = RequestListData
    }
    else if (roleId === 3) {
      NewRequestListData = RequestListData.filter(i => i.statusRequest === 2 || i.statusRequest === 3 || i.statusRequest === 4)
      console.log(NewRequestListData);
    }
    else if (roleId === 2) {
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
                      <a onClick={() => this.handleCreateRequest()} class="btn btn-success text-white">Create New Request</a>
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
                            <th>Process Note</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {NewRequestListData?.map((request, index) => {
                            // Đặt fullname ra ngoài return của map
                            const fullname = UserListData?.find(i => i.userId === request?.createBy);
                            return (
                              <React.Fragment key={"teacher" + index}>
                                <tr>
                                  <td>{index + 1}</td>
                                  <td>{request?.title}</td>
                                  <td className="text-truncate" style={{ maxWidth: "150px" }}>{request?.description}</td>
                                  {/* Kiểm tra fullname tồn tại trước khi truy cập firstname và lastName */}
                                  <td>{fullname ? `${fullname.firstname} ${fullname.lastName}` : "Unknown User"}</td>
                                  <td>{request?.createAt ? request.createAt.slice(0, 10) : ''}</td>
                                  <td className="text-truncate" style={{ maxWidth: "150px" }}>{request?.processNote}</td>
                                  <td>
                                    {(() => {
                                      switch (request?.statusRequest) {
                                        case 1:
                                          return <span className="badge badge-default">Pending</span>;
                                        case 2:
                                          return <span className="badge badge-info">Processing</span>;
                                        case 3:
                                          return <span className="badge badge-success">Approved</span>;
                                        default:
                                          return <span className="badge badge-danger">Reject</span>;
                                      }
                                    })()}
                                  </td>

                                  {/* {(statusDescriptions[request?.statusRequest] === 'Processing' && roleId === 3 || statusDescriptions[request?.statusRequest] === 'Pending' && roleId === 5) ? ( */}
                                  <td className="project-actions">
                                    <a className="btn btn-outline-secondary mr-1"
                                      onClick={() => this.handleDetail(request.requestId)}
                                    >
                                      <i className="icon-eye"></i>
                                    </a>

                                    {(roleId === 3 || roleId === 2 || roleId === 5) && (
                                      <a className="btn btn-outline-secondary"
                                        onClick={() => this.handleEdit(request.requestId)}
                                      >
                                        <i className="icon-pencil"></i>
                                      </a>
                                    )}
                                  </td>
                                  {/* ) : (
                                    <td></td>
                                  )} */}

                                  {/* {(roleId === 3 || roleId === 2 || roleId === 4) ? (
                                    <td className="project-actions">
                                      <a className="btn btn-outline-secondary mr-1"
                                        onClick={() => this.handleDetail(request.requestId)}
                                      >
                                        <i className="icon-eye"></i>
                                      </a>

                                      {(roleId === 3 || roleId === 4) && (
                                        <a className="btn btn-outline-secondary"
                                          onClick={() => this.handleEdit(request.requestId)}
                                        >
                                          <i className="icon-pencil"></i>
                                        </a>
                                      )}
                                    </td>
                                  ) : (
                                    <td></td>
                                  )} */}
                                </tr>
                              </React.Fragment>
                            );
                          })}
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

export default connect(mapStateToProps)((RequestList));
