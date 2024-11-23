import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from 'react-router-dom';
import axios from "axios";
import { getSession } from "../../components/Auth/Auth";
import Notification from "../../components/Notification";
import Pagination from "../../components/Common/Pagination";

// Import PDF generation utilities
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';


const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: "grey",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
  },
  tableCell: {
    flex: 1,
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    textAlign: "center",
  },
  bold: {
    fontWeight: "bold",
  },
  total: {
    marginTop: 20,
    alignItems: "flex-end",
    paddingRight: 10,
  },
  totalText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  notes: {
    marginTop: 30,
  },
});

class PaymentHistory extends React.Component {
  state = {
    historyPayment: [],
    myChildren: [],
    selectedChildren: '',
    showNotification: false,
    notificationText: "",
    notificationType: "success",

    currentPage: 1,
    itemsPerPage: 10,
  };

  async componentDidMount() {
    window.scrollTo(0, 0);
    this.loadData();
  }

  componentDidUpdate(prevProps) {
    // Kiểm tra nếu URL thay đổi
    if (this.props.location.search !== prevProps.location.search) {
      this.loadData(); // Tải lại dữ liệu khi URL thay đổi
    }
  }

  loadData = async () => {
    const userData = getSession('user')?.user;
    const parentId = userData?.userId; // Giá trị thực tế của parentId

    if (!parentId) {
      console.error("Parent ID is missing");
      return;
    }

    // Lấy tất cả các tham số từ URL
    const queryParams = new URLSearchParams(window.location.search);
    const mydata = {};
    queryParams.forEach((value, key) => {
      mydata[key] = value;
    });

    console.log("All query parameters:", mydata);

    // Kiểm tra nếu có redirect từ VNPAY
    if (mydata.vnp_TxnRef && mydata.vnp_ResponseCode && mydata.vnp_SecureHash) {
      try {
        const response = await axios.post("http://localhost:5124/api/Payment/payment-callback", {
          data: mydata,
        });

        console.log("Payment Callback Response:", response.data);

        this.setState({
          notificationText: "Payment successfully!",
          notificationType: "success",
          showNotification: true,
        });
      } catch (error) {
        console.error("Error in Payment Callback:", error);

        this.setState({
          notificationText: "Payment Cancel!",
          notificationType: "error",
          showNotification: true,
        });
      }
    }

    // Tải PaymentHistory
    try {
      await this.getPaymentHistory(parentId);
    } catch (error) {
      console.error("Error fetching payment history:", error);
    }

    // Tải danh sách Children
    try {
      const response = await axios.get("http://localhost:5124/api/Children/GetAllChildren");
      const myChildren = response.data.filter((i) => i.parentId === parentId);
      this.setState({ myChildren });
    } catch (error) {
      console.error("Error fetching children data:", error);
    }
  };


  getPaymentHistory = async (parentId) => {
    if (!parentId) {
      console.error("Parent ID is required to fetch payment history.");
      return;
    }
    try {
      const response = await axios.get(`http://localhost:5124/api/Payment/history/${parentId}`);
      this.setState({ historyPayment: response.data });
      console.log('Updated Payment History:', response.data);
    } catch (error) {
      console.error("Error fetching payment history:", error);
    }
  };


  handleChildrenFilterChange = (e) => {
    const selectedChildren = e.target.value;
    this.setState({ selectedChildren });
  };

  handlePageChange = (pageNumber) => {
    this.setState({ currentPage: pageNumber });
  };

  // Generate PDF using react-pdf
  generatePDF = (item) => {
    return (
      <Document>
        <Page style={styles.page}>
          {/* Tiêu đề hóa đơn */}
          <View style={styles.header}>
            <Text style={styles.title}>Payment Invoice</Text>
            <Text style={styles.subtitle}>Thank you for your payment!</Text>
          </View>

          {/* Thông tin người thanh toán */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            <Text>Children Name:  {item?.childName || "John Doe anh Kiệt"}</Text>
            <Text>Payment Date: {item?.paymentDate || "example@example.com"}</Text>
            <Text>Payment Name: {item?.paymentName || "DD/MM/YYYY"}</Text>
          </View>

          {/* Chi tiết thanh toán */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Details</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.bold]}>#</Text>
                <Text style={[styles.tableCell, styles.bold]}>Item</Text>
                <Text style={[styles.tableCell, styles.bold]}>Price</Text>
                <Text style={[styles.tableCell, styles.bold]}>Quantity</Text>
                <Text style={[styles.tableCell, styles.bold]}>Total</Text>
              </View>
              {item?.services?.map((item1, index) => (
                <View style={styles.tableRow} key={index}>
                  <Text style={styles.tableCell}>{index + 1}</Text>
                  <Text style={styles.tableCell}>{item1.serviceName}</Text>
                  <Text style={styles.tableCell}>{item1.servicePrice} VNĐ</Text>
                  <Text style={styles.tableCell}>{item1.quantity}</Text>
                  <Text style={styles.tableCell}>{item1.total} VNĐ</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Thông tin tuition */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tuition Information</Text>
            <Text>Start Date:  {item?.tuitionDetails?.startDate || "John Doe anh Kiệt"}</Text>
            <Text>End Date : {item?.tuitionDetails?.endDate || "example@example.com"}</Text>
            <Text>Tuition Fee : {item?.tuitionDetails?.tuitionFee || "DD/MM/YYYY"}</Text>
          </View>

          {/* Tổng cộng */}
          <View style={styles.total}>
            <Text style={styles.totalText}>Grand Total: {item?.totalAmount} VNĐ</Text>
          </View>

          {/* Ghi chú */}
          <View style={styles.notes}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text>This is an automatically generated invoice. Please keep it for your records.</Text>
          </View>
        </Page>
      </Document>

    );
  };

  render() {
    const { historyPayment, myChildren, selectedChildren, showNotification, notificationText, notificationType } = this.state;



    // Filter payment history based on selected children
    const filteredHistory = selectedChildren
      ? historyPayment.filter(item => item.childId == selectedChildren)
      : historyPayment;

    // phan trang activity
    const { currentPage, itemsPerPage } = this.state;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);

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
                        {currentItems.map((item, index) => (
                          <React.Fragment key={index}>
                            <tr>
                              <td>{index + 1}</td>
                              <td>{item?.childName}</td>
                              <td>{item?.paymentDate}</td>
                              <td>{item?.totalAmount} VNĐ</td>
                              <td>{item?.paymentName}</td>
                              <td>
                                {/* Download button */}
                                <PDFDownloadLink
                                  document={this.generatePDF(item)}
                                  fileName="payment-history.pdf"
                                >
                                  {({ loading }) => (loading ? 'Loading document...' : 'Download PDF')}
                                </PDFDownloadLink>
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
    );
  }
}

export default withRouter(PaymentHistory);
