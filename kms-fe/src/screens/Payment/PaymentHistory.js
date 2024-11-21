import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from 'react-router-dom';
import axios from "axios";
import { getSession } from "../../components/Auth/Auth";
import Notification from "../../components/Notification";
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";


class PaymentHistory extends React.Component {
  state = {
    historyPayment: [],
    myChildren: [],
    selectedChildren: '',

    showNotification: false, // State to control notification visibility
    notificationText: "", // Text for the notification
    notificationType: "success" // Type of notification (success or error)

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
          this.setState({
            notificationText: "Payment successfully!",
            notificationType: "success",
            showNotification: true
          });
          // Xử lý logic nếu cần, ví dụ: hiển thị thông báo thành công
        })
        .catch(error => {
          console.error('Error in Payment Callback:', error);
          this.setState({
            notificationText: "Payment Cancel!",
            notificationType: "error",
            showNotification: true
          });
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

  pdfRef = React.createRef(); // Ref duy nhất cho bản ghi

  generatePDF = (item) => {

  };


  render() {
    const { historyPayment, myChildren, selectedChildren, currentItems, description, status, createAt, studentName, createByName, ReasonReject } = this.state;
    const { showNotification, notificationText, notificationType } = this.state;

    // Lọc dữ liệu historyPayment dựa trên đứa trẻ được chọn
    const filteredHistory = selectedChildren
      ? historyPayment.filter(item => item.childid == selectedChildren)
      : historyPayment;

    return (
      <div
        style={{ flex: 1 }}
        onClick={() => document.body.classList.remove("offcanvas-active")}
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
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHistory.map((item, index) => (
                          <React.Fragment key={index}>
                            <tr>
                              <td>{index + 1}</td>
                              <td>{item?.childName}</td>
                              <td>{item?.paymentDate}</td>
                              <td>{item?.totalAmount} VNĐ</td>
                              <td>{item?.paymentName}</td>
                              <td>
                                {/* Generate PDF button */}
                                <PDFDownloadLink
                                  document={
                                    <Document>
                                      <Page size="A4">
                                        <View style={styles.page}>
                                          <Text style={styles.title}>Payment Details</Text>
                                          <Text><strong>Child Name:</strong> {item?.childName}</Text>
                                          <Text><strong>Payment Date:</strong> {item?.paymentDate}</Text>
                                          <Text><strong>Total Amount:</strong> {item?.totalAmount} VNĐ</Text>
                                          <Text><strong>Payment Name:</strong> {item?.paymentName}</Text>
                                        </View>
                                      </Page>
                                    </Document>
                                  }
                                  fileName={`payment_${item?.childName || "unknown"}.pdf`}
                                >
                                  {({ loading }) =>
                                    loading ? 'Generating PDF...' : 'Download PDF'
                                  }
                                </PDFDownloadLink>
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
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
