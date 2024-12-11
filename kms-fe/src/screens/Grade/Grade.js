
import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import { getSession } from '../../components/Auth/Auth';
import Notification from "../../components/Notification";
import Pagination from "../../components/Common/Pagination";


class Grade extends React.Component {
  state = {
    grades: [],

    showNotification: false, // Để hiển thị thông báo
    notificationText: "", // Nội dung thông báo
    notificationType: "success", // Loại thông báo (success/error)

    currentPage: 1,
    itemsPerPage: 10,
  };
  componentDidMount() {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/Grade`);
        const data = response.data;
        this.setState({ grades: data });
        console.log(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }

  handleCreateCategory = () => {
    // Chuyển hướng đến cap nhat category
    this.props.history.push(`/create-grade`);
  };

  handleViewDetail = (gradeId) => {
    // Chuyển hướng đến trang chi tiet category
    this.props.history.push(`/grade-detail/${gradeId}`);
  };

  handleEdit = (gradeId) => {
    // Chuyển hướng đến cap nhat category
    this.props.history.push(`/grade-update/${gradeId}`);
  };
 


  handlePageChange = (pageNumber) => {
    this.setState({ currentPage: pageNumber });
  };


  render() {
    const { showNotification, notificationText, notificationType } = this.state;

    const { grades } = this.state;
    const userData = getSession('user')?.user;
    const roleId = userData.roleId

    // phan trang
    const { currentPage, itemsPerPage } = this.state;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = grades.slice(indexOfFirstItem, indexOfLastItem);

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
              HeaderText="Grade Management"
              Breadcrumb={[
                { name: "Grade", navigate: "" },
              ]}
            />
            <div className="row clearfix">
              <div className="col-lg-12 col-md-12">
                <div className="card planned_task">
                  <div className="header d-flex justify-content-between">
                    <h2>Grade Manager</h2>

                    {roleId === 4 ? (
                      <div>
                        <a onClick={() => this.handleCreateCategory()} class="btn btn-success text-white">Create New Grade</a>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="col-lg-12">
                <div className="card">
                  <div className="table-responsive">
                    <table className="table m-b-0 table-hover">
                      <thead className="thead-light">
                        <tr>
                          <th>#</th>
                          <th>Grade</th>
                          <th>Description</th>
                          <th>BaseTuitionFee</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map((item, i) => {
                          return (
                            <tr key={"dihf" + i}>

                              <td className="project-title">
                                <th scope="row">{i + 1}</th>
                              </td>

                              <td>
                                {item?.name}
                              </td>

                              <td>
                                {item?.description}
                              </td>

                              <td>
                                {item?.baseTuitionFee?.toLocaleString('vi-VN')}
                              </td>

                              {/* <td>
                                {item?.status === "Active" ? (
                                  <span className="badge badge-success">Active</span>
                                ) : item?.status === "InActive" ? (
                                  <span className="badge badge-default">InActive</span>
                                )  : null}
                              </td> */}
                              <td className="project-actions">
                                <a onClick={() => this.handleViewDetail(item.gradeId)} className="btn btn-outline-secondary mr-1">
                                  <i className="icon-eye"></i>
                                </a>
                                <a onClick={() => this.handleEdit(item.gradeId)} className="btn btn-outline-secondary">
                                  <i className="icon-pencil"></i>
                                </a>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="pt-4">
                    <Pagination
                      currentPage={currentPage}
                      totalItems={grades.length}
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

export default withRouter(Grade);