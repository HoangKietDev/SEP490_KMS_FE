
import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import axios from 'axios';
import Notification from "../../components/Notification";
import { getSession } from '../../components/Auth/Auth';
import Pagination from "../../components/Common/Pagination";

class Service extends React.Component {
  state = {
    services: [],
    filteredServices: [],
    searchText: "", // Dùng để lọc theo serviceName
    filterStatus: "", // Dùng để lọc theo status

    selectedServices: [], // Mảng lưu trữ các dịch vụ đã chọn

    showNotification: false, // Để hiển thị thông báo
    notificationText: "", // Nội dung thông báo
    notificationType: "success", // Loại thông báo (success/error)

    currentPage: 1,
    itemsPerPage: 5,
  };
  componentDidMount() {
    window.scrollTo(0, 0);
    this.fetchData();
  }

  fetchData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/Service/GetAllServices`);
      const data = response.data;
      this.setState({ services: data, filteredServices: data });
      console.log(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

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

  handleSearchChange = (e) => {
    this.setState({ searchText: e.target.value }, this.filterServices);
  };

  handleStatusFilterChange = (e) => {
    this.setState({ filterStatus: e.target.value }, this.filterServices);
  };

  filterServices = () => {
    const { services, searchText, filterStatus } = this.state;
    const filtered = services.filter(service => {
      const matchesName = service?.serviceName?.toLowerCase()?.includes(searchText?.toLowerCase());
      const matchesStatus = filterStatus === "" || service.status === parseInt(filterStatus);
      return matchesName && matchesStatus;
    });
    this.setState({ filteredServices: filtered });
  };

  handleStatusChange = async (service, newStatus) => {
    let data = {
      serviceId: service.serviceId,
      serviceName: service.serviceName,
      servicePrice: service.servicePrice,
      serviceDes: service.serviceDes,
      schoolId: service.schoolId,
      status: newStatus,
      categoryServiceId: service.categoryServiceId,
      categoryService: {
        categoryServiceId: service.categoryService.categoryServiceId,
        categoryName: service.categoryService.categoryName,
      }
    }
    console.log(data);
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/Service/UpdateService`, data);
      console.log("Status updated successfully:", response.data);
      this.setState({
        notificationText: "Status update successfully!",
        notificationType: "success",
        showNotification: true,
      });
      // Cập nhật trạng thái trong state
      this.setState((prevState) => {
        const updatedListData = prevState.filteredServices.map((item) =>
          item.serviceId === service.serviceId ? { ...item, status: newStatus } : item
        );
        return { filteredServices: updatedListData };
      });
    } catch (error) {
      const errorMessage = error?.response?.data?.message
      this.setState({
        notificationText: errorMessage || "Status updating error!",
        notificationType: "error",
        showNotification: true,
      });
    }
  };

  handleBulkStatusUpdate = async (newStatus) => {
    const { selectedServices, filteredServices } = this.state;
    const servicesToUpdate = filteredServices.filter(service => selectedServices.includes(service.serviceId));

    if (servicesToUpdate.length === 0) {
      this.setState({
        notificationText: "No services selected!",
        notificationType: "error",
        showNotification: true,
      });
      return;
    }

    try {
      // Gửi từng yêu cầu cập nhật cho mỗi service
      for (const service of servicesToUpdate) {
        const updatedService = {
          serviceId: service.serviceId,
          serviceName: service.serviceName,
          servicePrice: service.servicePrice,
          serviceDes: service.serviceDes,
          categoryServiceId: service.categoryServiceId,
          schoolId: service.schoolId,
          status: newStatus,
        };

        // Gửi yêu cầu cập nhật cho từng bản ghi
        const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/Service/UpdateService`, updatedService);

        // Sau khi mỗi yêu cầu thành công, cập nhật filteredServices
        this.setState(prevState => {
          const updatedListData = prevState.filteredServices.map(service =>
            service.serviceId === updatedService.serviceId ? { ...service, status: newStatus } : service
          );
          return { filteredServices: updatedListData };
        });


      }
      // Thông báo thành công cho mỗi bản ghi
      this.setState({
        notificationText: `${servicesToUpdate.length} Service status updated successfully!`,
        notificationType: "success",
        showNotification: true,
      });
      // Sau khi hoàn thành tất cả, reset selectedServices
      this.setState({ selectedServices: [] });
      this.fetchData();

    } catch (error) {
      const errorMessage = error?.response?.data?.message
      this.setState({
        notificationText: errorMessage || "Error updating status for one or more services!",
        notificationType: "error",
        showNotification: true,
      });
    }
  };


  handleSelectService = (serviceId) => {
    this.setState(prevState => {
      const selectedServices = prevState.selectedServices.includes(serviceId)
        ? prevState.selectedServices.filter(id => id !== serviceId)
        : [...prevState.selectedServices, serviceId];
      return { selectedServices };
    });

  };

  handleSelectAll = () => {
    this.setState(prevState => {
      if (prevState.selectedServices.length === prevState.filteredServices.length) {
        return { selectedServices: [] }; // Unselect all
      }
      const allServiceIds = prevState.filteredServices.map(service => service.serviceId);
      return { selectedServices: allServiceIds }; // Select all
    });
  };

  handlePageChange = (pageNumber) => {
    this.setState({ currentPage: pageNumber });
  };

  render() {

    const { filteredServices, selectedServices, } = this.state;
    const { showNotification, notificationText, notificationType } = this.state;

    const userData = getSession('user')?.user;
    const roleId = userData?.roleId;

    const statusOptions = [
      { value: 1, label: "Active", className: "badge-success" },
      { value: 0, label: "InActive", className: "badge-default" },
    ];

    // phan trang
    const { currentPage, itemsPerPage } = this.state;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredServices.slice(indexOfFirstItem, indexOfLastItem);

    // Đếm số bản ghi
    const totalRecords = filteredServices.length;

    return (
      <div
        style={{ flex: 1 }}
        onClick={() => {
          document.body.classList.remove("offcanvas-active");
        }}
      >
        {showNotification && (
          <Notification
            type={notificationType}
            position="top-right"
            dialogText={notificationText}
            show={showNotification}
            onClose={() => this.setState({ showNotification: false })}
          />
        )}
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
                  <div className='header'>
                    <div className=" d-flex justify-content-between">
                      <h2>Services Manager</h2>
                      <div className="col-md-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search by Service Name"
                          value={this.state.searchText}
                          onChange={this.handleSearchChange}
                        />
                      </div>
                      <div className="col-md-3">
                        <select
                          className="form-control"
                          value={this.state.filterStatus}
                          onChange={this.handleStatusFilterChange}
                        >
                          <option value="">All Status</option>
                          {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {roleId === 3 ? (
                        <a onClick={() => this.handleCreateCategory()} class="btn btn-success text-white">Create New Service</a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-12">
                <div className="card">
                  {currentItems && currentItems.length !== 0 ?
                    <div className="header table-responsive">
                      <div>
                        <strong>Total Records: </strong>{totalRecords}
                      </div>
                      <table className="table m-b-0 table-hover">
                        <thead className="">
                          <tr className='theme-color'>
                            <th>
                              {roleId === 4 &&
                                <button
                                  className="btn btn-primary"
                                  onClick={this.handleSelectAll}
                                >
                                  Select All
                                </button>

                              } {/* Thêm cột checkbox nếu là roleId 4 */}
                            </th>
                            <th>ServiceName</th>
                            <th>Price</th>
                            <th>Description</th>
                            <th>CategoryName</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Hiển thị số lượng bản ghi ở đầu bảng */}
                          {currentItems.map((service, i) => {
                            return (
                              <tr key={"dihf" + i}>

                                <td>
                                  <div className="fancy-checkbox d-inline-block">
                                    <label>
                                      {roleId === 4 && (
                                        <input
                                          type="checkbox"
                                          onChange={() => this.handleSelectService(service.serviceId)}
                                          checked={selectedServices.includes(service.serviceId)}  // Đảm bảo rằng checkbox được đánh dấu nếu serviceId nằm trong selectedServices
                                        />
                                      )}
                                      <span>{i + 1}</span>
                                    </label>
                                  </div>
                                </td>

                                <td>
                                  {service?.serviceName}
                                </td>
                                <td>
                                  {service?.servicePrice?.toLocaleString('vi-VN')}
                                </td>
                                <td>
                                  {service?.serviceDes}
                                </td>
                                <td>
                                  {service?.categoryService?.categoryName || "1"}
                                </td>

                                {(roleId === 4) && (
                                  <td>
                                    <select
                                      value={service?.status}
                                      onChange={(e) => this.handleStatusChange(service, parseInt(e.target.value))}
                                      className={`form-control ${service?.status === 1 ? 'badge-success' : 'badge-default'}`}
                                    >
                                      {statusOptions.map(option => (
                                        <option key={option.value} value={option.value} className={option.className}>
                                          {option.label}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                )}
                                {(roleId === 3) && (
                                  <td>
                                    <span className={`badge ${service?.status === 1 ? 'badge-success' : 'badge-default'}`}>
                                      {statusOptions.find(option => option.value === service?.status)?.label} {/* Hiển thị trạng thái */}
                                    </span>
                                  </td>
                                )}
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
                      {roleId === 4 && (
                        <div className="form-group text-right">
                          <button className="btn btn-danger" onClick={() => this.handleBulkStatusUpdate(0)}>
                            Reject
                          </button>
                          <button className="btn btn-success ml-2" onClick={() => this.handleBulkStatusUpdate(1)}>
                            Approve
                          </button>
                        </div>
                      )}
                    </div>
                    : <p className="p-4">No data available</p>
                  }


                  <div className="pt-4">
                    <Pagination
                      currentPage={currentPage}
                      totalItems={filteredServices.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={this.handlePageChange}
                    />
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