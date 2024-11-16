import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from 'react-router-dom';
import axios from "axios";
import { getSession } from "../../components/Auth/Auth";

class PaymentHistory extends React.Component {
  state = {
    historyPayment: [],
    myChildren: [],
    selectedChildren: '',
  };

  async componentDidMount() {
    window.scrollTo(0, 0);
    const userData = getSession('user')?.user;
    const parentId = userData?.userId; // Giá trị thực tế của parentId


    // Lấy tất cả các tham số từ URL
    const queryParams = new URLSearchParams(window.location.search);

    // Tạo một đối tượng để lưu tất cả các tham số từ URL
    const mydata = {};
    queryParams.forEach((value, key) => {
      mydata[key] = value;
    });
    console.log('All query parameters:', mydata);

    // Kiểm tra nếu các tham số cần thiết có trong URL
    if (mydata.vnp_TxnRef && mydata.vnp_ResponseCode && mydata.vnp_SecureHash) {
      // Gọi API callback để xác nhận
      axios.post("http://localhost:5124/api/Payment/payment-callback",  
        {
          "data": mydata
        } 
      )
        .then(response => {
          console.log('Payment Callback Response:', response.data);
          // Xử lý logic nếu cần, ví dụ: hiển thị thông báo thành công
        })
        .catch(error => {
          console.error('Error in Payment Callback:', error);
          alert("Payment callback failed. Please try again.");
        });
    }


    // Gọi API và cập nhật state bằng axios
    axios.get(`http://localhost:5124/api/Payment/history/${parentId}`)
      .then((response) => {
        this.setState({ historyPayment: response.data });
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });

    axios.get(`http://localhost:5124/api/Children/GetAllChildren`)
      .then((response) => {
        const data = response.data;
        const myChildren = data?.filter(i => i.parentId === parentId);
        this.setState({ myChildren: myChildren });
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }

  handleChildrenFilterChange = (e) => {
    const selectedChildren = e.target.value;
    this.setState({ selectedChildren });
  };

  render() {
    const { historyPayment, myChildren, selectedChildren, currentItems, description, status, createAt, studentName, createByName, ReasonReject } = this.state;

    // Lọc dữ liệu historyPayment dựa trên đứa trẻ được chọn
    const filteredHistory = selectedChildren
      ? historyPayment.filter(item => item.Childid === selectedChildren)
      : historyPayment;

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
                        value={selectedChildren}
                        onChange={this.handleChildrenFilterChange}
                      >
                        <option value="">All Children</option>
                        {myChildren.map((childrenItem) => (
                          <option key={childrenItem.studentId} value={childrenItem.studentId}>
                            {childrenItem?.fullName}
                          </option>
                        ))}
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
                        {filteredHistory?.map((item, index) => {
                          // Đặt fullname ra ngoài return của map
                          return (
                            <React.Fragment key={"teacher" + index}>
                              <tr>
                                <td>{index + 1}</td>
                                <td>{item?.childName}</td>
                                <td>{item?.paymentDate}</td>
                                <td>{item?.totalAmount} VNĐ</td>
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
