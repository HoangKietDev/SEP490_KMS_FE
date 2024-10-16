
import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import axios from 'axios';

class Service extends React.Component {
  state = {
    services: [],
  };
  componentDidMount() {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5124/api/Service/GetAllServices');
        const data = response.data;
        this.setState({ services: data });
        console.log(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }

  handleCreateCategory = () => {
    // Chuyển hướng đến cap nhat category
    this.props.history.push(`/create-service`);
  };

  handleViewDetail = (serviceId) => {
    // Chuyển hướng đến trang chi tiet category
    this.props.history.push(`/service-detail/${serviceId}`);
  };

  handleEdit = (serviceId) => {
    // Chuyển hướng đến cap nhat category
    this.props.history.push(`/service-update/${serviceId}`);
  };

  render() {

    const { services } = this.state;
    const userData = JSON.parse(localStorage.getItem("user")).user;
    const roleId = userData.roleId

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
              HeaderText="Service"
              Breadcrumb={[
                { name: "Service", navigate: "" },
              ]}
            />
            <div className="row clearfix">
              <div className="col-lg-12 col-md-12">
                <div className="card planned_task">
                  <div className="header d-flex justify-content-between">
                    <h2>Services Manager</h2>
                    {roleId === 3 ? (
                      <a onClick={() => this.handleCreateCategory()} class="btn btn-success text-white">Create New Service</a>
                    ) : null}
                  </div>
                </div>
              </div>
              {/* <ProjectsListTable data={services} history={this.props.history}/> */}
              <div className="col-lg-12">
                <div className="card">
                  <div className="header">
                  </div>
                  <div className="table-responsive">
                    <table className="table m-b-0 table-hover">
                      <thead className="thead-light">
                        <tr>
                          <th>#</th>
                          <th>ServiceName</th>
                          <th>ServicePrice</th>
                          <th>ServiceDes</th>
                          <th>CategoryName</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {services.map((service, i) => {
                          return (
                            <tr key={"dihf" + i}>

                              <td className="project-title">
                                <th scope="row">{i + 1}</th>
                              </td>
                              <td>
                                {service?.serviceName}
                              </td>
                              <td>
                                {service?.servicePrice}
                              </td>
                              <td>
                                {service?.serviceDes}
                              </td>
                              <td>
                                {service?.categoryService?.categoryName || "1"}
                              </td>

                              <td>
                                {service?.status === "Active" ? (
                                  <span className="badge badge-success">Active</span>
                                ) : service?.status === "InActive" ? (
                                  <span className="badge badge-default">InActive</span>
                                ) : service?.status === "PENDING" ? (
                                  <span className="badge badge-warning">Pending</span>
                                ) : service?.status === "Closed" ? (
                                  <span className="badge badge-primary">Closed</span>
                                ) : null}
                              </td>
                              <td className="project-actions">
                                <a onClick={() => this.handleViewDetail(service.serviceId)} className="btn btn-outline-secondary mr-1">
                                  <i className="icon-eye"></i>
                                </a>
                                <a onClick={() => this.handleEdit(service.serviceId)} className="btn btn-outline-secondary">
                                  <i className="icon-pencil"></i>
                                </a>
                              </td>
                            </tr>
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
    );
  }
}

const mapStateToProps = ({ serviceReducer }) => ({

});

export default connect(mapStateToProps, {})(Service);