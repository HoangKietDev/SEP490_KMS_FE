import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from 'react-router-dom';
import axios from "axios";

class PaymentHistory extends React.Component {
  state = {
    currentItems: [
      {
        children: 'children 1',
        time: '05/11/2024 10:50',
        total: '10.000.000',
        paymentName: 'Tuition fee and Service 10/2024'
      },
      {
        children: 'children 2',
        time: '05/11/2024 10:50',
        total: '10.500.000',
        paymentName: 'Tuition fee and Service 10/2024'
      },
      {
        children: 'children 1',
        time: '05/10/2024 10:50',
        total: '11.000.000',
        paymentName: 'Tuition fee and Service 9/2024'
      }
    ]

  };

  async componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    const { currentItems, description, status, createAt, studentName, createByName, ReasonReject } = this.state;

    return (
      <div
        style={{ flex: 1 }}
        onClick={() => document.body.classList.remove("offcanvas-active")}
      >
        <div className="container-fluid">
          <PageHeader
            HeaderText="Payment"
            Breadcrumb={[
              { name: "Payment", navigate: "payment" },
              { name: "Payment History", navigate: "" },
            ]}
          />

          <div className="row clearfix">
            <div className="col-lg-12 col-md-12">
              <div className="card planned_task">
                <div className="row">
                  <div className="col-md-6">
                    <div className="header">
                      <h2>Payment History</h2>
                    </div>
                  </div>

                  <div className="col-md-6 d-flex align-items-center">
                    <div className="form-group mb-0">
                      <label htmlFor="childrenFilter" className="mr-2">Filter by Children</label>
                      <select
                        id="childrenFilter"
                        className="form-control"
                        style={{ width: 'auto', display: 'inline-block' }}
                      // value={selectedChildren}
                      // onChange={this.handleChildrenFilterChange}
                      >
                        <option value="">Your Children</option>
                        {/* {filteredChildrenData.map((childrenItem) => (
              <option key={childrenItem.studentId} value={childrenItem.studentId}>
                {childrenItem?.fullName}
              </option>
            ))} */}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-12 col-md-12">
              <div className="card">
                <div className="body project_report">
                  <div className="table-responsive">
                    <table className="table m-b-0 table-hover">
                      <thead className="">
                        <tr className="theme-color">
                          <th>#</th>
                          <th>Children</th>
                          <th>Time</th>
                          <th>Total</th>
                          <th>Payment Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems?.map((item, index) => {
                          // Đặt fullname ra ngoài return của map
                          return (
                            <React.Fragment key={"teacher" + index}>
                              <tr>
                                <td>{index + 1}</td>
                                <td>{item?.children}</td>
                                <td>{item?.time}</td>
                                <td>{item?.total} VNĐ</td>
                                {/* <td>{item?.time ? this.formatDate(item.timePost) : "N/A"}</td> */}
                                <td className="text-truncate" style={{ maxWidth: "150px" }}>{item?.paymentName}</td>
                              </tr>
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {/* <div className="pt-4">
                    <Pagination
                      currentPage={currentPage}
                      totalItems={filteredAlbumListData.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={this.handlePageChange}
                    />
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(PaymentHistory);
