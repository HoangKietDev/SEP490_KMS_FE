import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
// import { withRouter } from 'react-router-dom';
import axios from "axios";
import Pagination from "../../components/Common/Pagination";
import { Modal, Button, Form } from "react-bootstrap"; // Thêm modal từ react-bootstrap


class LocationActivityList extends React.Component {
  state = {
    RequestListData: [],
    NewRequestListData: [],
    LocationListData: [],
    NewLocationListData: [],
    ActivityListData: [],
    NewActivityListData: [],

    currentPageActivity: 1,
    itemsPerPage: 10,
    currentPageLocation: 1,

    newLocationName: "", // State để lưu trữ tên địa điểm mới
    showModalLocation: false, // State để kiểm soát hiển thị modal

    newActivityName: "", // State để lưu trữ tên địa điểm mới
    showModalActivity: false, // State để kiểm soát hiển thị modal
  };

  componentDidMount() {
    window.scrollTo(0, 0);
    // Gọi API và cập nhật state bằng axios
    axios.get("http://localhost:5124/api/LocationActivity/GetAllLocations")
      .then((response) => {
        this.setState({ LocationListData: response.data });
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });

    axios.get("http://localhost:5124/api/LocationActivity/GetAllActivities")
      .then((response) => {
        this.setState({ ActivityListData: response.data });
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });

  }

  handleCreateLocation = () => {
    const { newLocationName } = this.state;
    if (!newLocationName.trim()) {
      alert("Please enter a location name.");
      return;
    }

    axios.post("http://localhost:5124/api/LocationActivity/AddLocation", {
      locationName: newLocationName,
    })
      .then((response) => {
        alert("Location added successfully!");
        // Gọi lại API để lấy danh sách mới nhất
        axios.get("http://localhost:5124/api/LocationActivity/GetAllLocations")
          .then((response) => {
            this.setState({
              LocationListData: response.data, // Cập nhật lại LocationListData từ API
              newLocationName: "", // Reset lại tên địa điểm
              showModalLocation: false, // Đóng modal sau khi thêm thành công
            });
          })
          .catch((error) => {
            console.error("Error fetching updated locations: ", error);
          });
      })
      .catch((error) => {
        console.error("Error adding location: ", error);
        alert("Failed to add location. Please try again.");
      });
  };

  handleShowModalLocation = () => {
    this.setState({ showModalLocation: true });
  };

  handleCloseModalLocation = () => {
    this.setState({ showModalLocation: false, newLocationName: "" });
  };

  handleInputChangeLocation = (event) => {
    this.setState({ newLocationName: event.target.value });
  };


  handleCreateActivity = () => {
    const { newActivityName } = this.state;
    if (!newActivityName.trim()) {
      alert("Please enter a location name.");
      return;
    }

    axios.post("http://localhost:5124/api/LocationActivity/AddActivity", {
      activityName: newActivityName,
    })
      .then((response) => {
        alert("Activity added successfully!");
        // Gọi lại API để lấy danh sách mới nhất
        axios.get("http://localhost:5124/api/LocationActivity/GetAllActivities")
          .then((response) => {
            this.setState({
              ActivityListData: response.data, // Cập nhật lại LocationListData từ API
              newActivityName: "", // Reset lại tên địa điểm
              showModalActivity: false, // Đóng modal sau khi thêm thành công
            });
          })
          .catch((error) => {
            console.error("Error fetching updated locations: ", error);
          });
      })
      .catch((error) => {
        console.error("Error adding activity: ", error);
        alert("Failed to add activity. Please try again.");
      });
  };

  handleShowModalActivity = () => {
    this.setState({ showModalActivity: true });
  };

  handleCloseModalActivity = () => {
    this.setState({ showModalActivity: false, newActivityName: "" });
  };

  handleInputChangeActivity = (event) => {
    this.setState({ newActivityName: event.target.value });
  };
  // handleEdit = (requestId) => {
  //   this.props.history.push(`/request-update/${requestId}`);
  // };

  // handleDetail = (requestId) => {
  //   this.props.history.push(`/request-detail/${requestId}`);
  // };

  // handleCreateRequest = () => {
  //   // Chuyển hướng đến trang add teacher
  //   this.props.history.push(`/create-request`);
  // };

  handlePageChangeActivity = (pageNumber) => {
    this.setState({ currentPageActivity: pageNumber });
  };
  handlePageChangeLocation = (pageNumber) => {
    this.setState({ currentPageLocation: pageNumber });
  };

  render() {
    const { LocationListData, ActivityListData, newLocationName, showModalLocation , newActivityName, showModalActivity} = this.state;
    const statusDescriptions = {
      1: "Active",
      2: "Inactive",
    };

    // phan trang activity
    const { currentPageActivity, itemsPerPage } = this.state;
    const indexOfLastItemActivity = currentPageActivity * itemsPerPage;
    const indexOfFirstItemActivity = indexOfLastItemActivity - itemsPerPage;
    const currentItemsActivity = ActivityListData.slice(indexOfFirstItemActivity, indexOfLastItemActivity);

    // phan trang location
    const { currentPageLocation } = this.state;
    const indexOfLastItemLocation = currentPageLocation * itemsPerPage;
    const indexOfFirstItemLocation = indexOfLastItemLocation - itemsPerPage;
    const currentItemsLocation = LocationListData.slice(indexOfFirstItemLocation, indexOfLastItemLocation);

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
              HeaderText="Location and Activity"
              Breadcrumb={[
                { name: "Item List", navigate: "" },
              ]}
            />
            <div className="row clearfix">
              <div className="col-lg-12 col-md-12">
                <div className="card planned_task">
                  <div className="header d-flex justify-content-between">
                    <h2>Location and Activity Manager</h2>
                    {/* {roleId === 2 ? (
                      <a onClick={() => this.handleCreateRequest()} class="btn btn-success text-white">Create New Request</a>
                    ) : null} */}
                  </div>
                </div>
              </div>
              <div className="col-lg-12 col-md-12">
                <div className="card">
                  <div className="body project_report row">
                    <div className="col-md-6">
                      <div className="d-flex justify-content-between">
                        <h4>Location Table</h4>
                        <a
                          onClick={this.handleShowModalLocation}
                          className="btn btn-primary text-white mb-2"
                        >
                          <i className="icon-plus"></i>
                        </a>
                      </div>
                      <div className="table-responsive">
                        <table className="table m-b-0 table-hover">
                          <thead className="thead-light">
                            <tr>
                              <th>#</th>
                              <th>Location Name</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentItemsLocation?.map((item, index) => {
                              return (
                                <React.Fragment key={"teacher" + index}>
                                  <tr>
                                    <td>{index + 1}</td>
                                    <td>{item?.locationName}</td>
                                    <td>{item?.status}</td>

                                    {/* 
                                    {(statusDescriptions[request?.statusRequest] === 'Processing' && roleId === 3 || statusDescriptions[request?.statusRequest] === 'Pending' && roleId === 5) ? (
                                      <td className="project-actions">
                                        <a className="btn btn-outline-secondary mr-1"
                                          onClick={() => this.handleDetail(request.requestId)}
                                        >
                                          <i className="icon-eye"></i>
                                        </a>

                                        {(roleId === 3 || roleId === 5) && (
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
                        <div className="pt-4">
                          <Pagination
                            currentPage={currentPageLocation}
                            totalItems={LocationListData.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={this.handlePageChangeLocation}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex justify-content-between">
                        <h4>Actibity Table</h4>
                        <a
                          onClick={() => this.handleShowModalActivity()}
                          className="btn btn-primary text-white mb-2"
                        >
                          <i className="icon-plus"></i>
                        </a>
                      </div>
                      <div className="table-responsive">
                        <table className="table m-b-0 table-hover">
                          <thead className="thead-light">
                            <tr>
                              <th>#</th>
                              <th>Activity Name</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentItemsActivity?.map((item, index) => {
                              return (
                                <React.Fragment key={"teacher" + index}>
                                  <tr>
                                    <td>{index + 1}</td>
                                    <td>{item?.activityName}</td>
                                    <td>{item?.status}</td>

                                    {/* {(statusDescriptions[request?.statusRequest] === 'Processing' && roleId === 3 || statusDescriptions[request?.statusRequest] === 'Pending' && roleId === 5) ? (
                                      <td className="project-actions">
                                        <a className="btn btn-outline-secondary mr-1"
                                          onClick={() => this.handleDetail(request.requestId)}
                                        >
                                          <i className="icon-eye"></i>
                                        </a>

                                        {(roleId === 3 || roleId === 5) && (
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
                        <div className="pt-4">
                          <Pagination
                            currentPage={currentPageActivity}
                            totalItems={ActivityListData.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={this.handlePageChangeActivity}
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Modal để tạo địa điểm */}
        <Modal show={showModalLocation} onHide={this.handleCloseModalLocation}>
          <Modal.Header closeButton>
            <Modal.Title>Create New Location</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formLocationName">
                <Form.Label>Location Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter location name"
                  value={newLocationName}
                  onChange={this.handleInputChangeLocation}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleCloseModalLocation}>
              Close
            </Button>
            <Button variant="primary" onClick={this.handleCreateLocation}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
        {/* Modal để tạo địa điểm */}
        <Modal show={showModalActivity} onHide={this.handleCloseModalActivity}>
          <Modal.Header closeButton>
            <Modal.Title>Create New Activity</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formActivityName">
                <Form.Label>Activity Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Activity name"
                  value={newActivityName}
                  onChange={this.handleInputChangeActivity}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleCloseModalActivity}>
              Close
            </Button>
            <Button variant="primary" onClick={this.handleCreateActivity}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = ({ ioTReducer }) => ({
  isSecuritySystem: ioTReducer.isSecuritySystem,
});

export default connect(mapStateToProps)((LocationActivityList));
