import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from 'react-router-dom';
import axios from "axios";


class PaymentList extends React.Component {
  state = {
    UserListData: [],
    RequestListData: [],
    NewRequestListData: [],
    tuition: {
      paymentName: "Tuiton fee 10/2024",
      quantity: 1,
      price: 5000000,
    },
    ServiceListData: [
      {
        paymentName: "Service 1",
        quantity: 20,
        price: 500000,
      },
      {
        paymentName: "Service 2",
        quantity: 30,
        price: 20000,
      },
      {
        paymentName: "Service 3",
        quantity: 20,
        price: 25000,
      }
    ],
    showServices: false

  };


  componentDidMount() {
    window.scrollTo(0, 0);
    // Gọi API và cập nhật state bằng axios

  }


  handlePaymentHistory = (userId) => {
    this.props.history.push(`/payment-history/${userId}`);
  };

  // Hàm xử lý ẩn/hiện các hàng dịch vụ
  toggleServices = () => {
    this.setState((prevState) => ({
      showServices: !prevState.showServices
    }));
  };



  render() {
    const { ServiceListData, UserListData, tuition, showServices } = this.state;
    const userData = JSON.parse(localStorage.getItem("user")).user;
    const roleId = userData.roleId

    // Tính tổng chi phí của tất cả các dịch vụ
    const totalServicesCost = ServiceListData.reduce((total, item) => {
      return total + (item.quantity * item.price);
    }, 0);

    // Tính tổng thanh toán = học phí + tổng chi phí dịch vụ
    const totalPayment = (tuition.quantity * tuition.price) + totalServicesCost;

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
              HeaderText="Payment Management"
              Breadcrumb={[
                { name: "Payment", navigate: "payment" },
              ]}
            />
            <div className="row clearfix">

              <div className="col-lg-12 col-md-12">
                <div className="card planned_task">
                  <div className="header d-flex justify-content-between">
                    <h2>Payment</h2>
                    {roleId === 2 ? (
                      <a onClick={() => this.handlePaymentHistory()} class="btn btn-success text-white">History Payment</a>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="col-lg-12 col-md-12">
                <div className="card">
                  <div className="body project_report">
                    <div className="row pt-2">
                      <div className="col-md-3">
                        <h4 className="pb-4">Your Children</h4>
                        <div class=" border mb-3 border-dark rounded" style={{ background: "#c6e5ff" }}>
                          <div class="card-body text-dark">
                            <h5 class="card-title">Your Children 1</h5>
                            <p class="card-text">StudentCode: ST121</p>
                            <p class="card-text">Class: Violet </p>
                          </div>
                        </div>

                        <div class=" border mb-3 border-dark rounded">
                          <div class="card-body text-dark">
                            <h5 class="card-title">Your Children 2</h5>
                            <p class="card-text">StudentCode: ST122</p>
                            <p class="card-text">Class: Roser </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-9">
                        <h4 className="pb-4"> Tuiton Fee Payable</h4>
                        <div className="table-responsive">
                          <table className="table m-b-0 table-hover">
                            <thead className="">
                              <tr className="theme-color">
                                <th>#</th>
                                <th>Payment Name</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>1</td>
                                <td>{tuition?.paymentName}</td>
                                {/* <td className="text-truncate" style={{ maxWidth: "150px" }}>{request?.description}</td> */}
                                <td>{tuition?.quantity} Month</td>
                                <td>{tuition?.price?.toLocaleString('vi-VN')}</td>
                                <td className="text-danger">{(tuition?.quantity * tuition?.price)?.toLocaleString('vi-VN')} VNĐ</td>
                              </tr>
                              <tr>
                                <td>2</td>
                                <td>Services Month</td>
                                {/* <td className="text-truncate" style={{ maxWidth: "150px" }}>{request?.description}</td> */}
                                <td></td>
                                <td></td>
                                <td >
                                  <span className="text-danger">
                                    {totalServicesCost?.toLocaleString('vi-VN')} VNĐ
                                  </span>
                                  <span onClick={this.toggleServices} style={{ cursor: 'pointer' }} className="ml-4">
                                    {this.state.showServices ? (
                                      <i className="icon-arrow-up"></i> // Biểu tượng khi danh sách dịch vụ đang hiển thị
                                    ) : (
                                      <i className="icon-arrow-down"></i> // Biểu tượng khi danh sách dịch vụ bị ẩn
                                    )}
                                  </span>
                                </td>
                              </tr>
                              {showServices && ServiceListData?.map((item, index) => {
                                return (
                                  <React.Fragment key={"service" + index}>
                                    <tr>
                                      <td></td>
                                      <td>{item?.paymentName}</td>
                                      <td>{item?.quantity}</td>
                                      <td>{item?.price?.toLocaleString('vi-VN')}</td>
                                      <td className="text-danger">{(item?.quantity * item?.price)?.toLocaleString('vi-VN')} VNĐ</td>
                                    </tr>
                                  </React.Fragment>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <hr></hr>
                        <div className="d-flex justify-content-end">
                          <h4 className="py-4 "> Total Payment: </h4>
                          <h4 className="text-danger p-4 " >{totalPayment?.toLocaleString('vi-VN')} VNĐ</h4>
                          <div className="py-4">
                            <button type="button " class="btn btn-primary btn-lg">Payment</button>
                          </div>
                        </div>

                      </div>
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

export default withRouter(PaymentList);

