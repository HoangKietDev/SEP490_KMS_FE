
import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import { getCookie } from '../../components/Auth/Auth';
import Pagination from "../../components/Common/Pagination";
import Notification from "../../components/Notification";
import { Modal, Button } from 'react-bootstrap';
import { Bars } from 'react-loader-spinner';

class Paymenttuition extends React.Component {

    state = {
        paymentAll: [],
        searchText: "",

        startDate: "", // Lưu trữ ngày bắt đầu
        endDate: "", // Lưu trữ ngày kết thúc
        isProcessing: false, // Để hiển thị trạng thái đang xử lý
        showConfirmModal: false, // Điều khiển modal xác nhận
        showConfirmModalStaff: false, // Điều khiển modal xác nhận

        currentPage: 1,
        itemsPerPage: 10,

        showNotification: false, // Để hiển thị thông báo
        notificationText: "", // Nội dung thông báo
        notificationType: "success", // Loại thông báo (success/error)

        isUploading: false,  // Biến để theo dõi trạng thái upload
        isUploadingStaff: false,  // Biến để theo dõi trạng thái upload
    };

    // Hàm lấy ngày bắt đầu và ngày kết thúc của tháng hiện tại
    getCurrentMonthDates = () => {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Ngày đầu tháng
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1); // Ngày cuối tháng

        return {
            startDate: startDate.toISOString().split('T')[0], // Định dạng thành YYYY-MM-DD
            endDate: endDate.toISOString().split('T')[0], // Định dạng thành YYYY-MM-DD
        };
    };

    componentDidMount() {
        window.scrollTo(0, 0);
        // Lấy ngày bắt đầu và ngày kết thúc của tháng hiện tại
        const { startDate, endDate } = this.getCurrentMonthDates();
        this.setState({ startDate, endDate });
        this.fetchData();
    }

    fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:5124/api/Tuition/GetAllTuitionsCheckGene');

            const data = response.data;
            this.setState({
                paymentAll: data,
            });
            console.log(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    handleViewDetail = (paymentId) => {
        // Chuyển hướng đến trang chi tiet category
        this.props.history.push(`/payment-detail/${paymentId}`);
    };


    handleSearchChange = (e) => {
        this.setState({ searchText: e.target.value });
    };

    handleDateRangeFilter = () => {
        const { startDate, endDate, paymentAll } = this.state;

        // Nếu chưa có đủ thông tin về ngày bắt đầu và ngày kết thúc, không lọc
        if (!startDate || !endDate) return paymentAll;

        const start = new Date(startDate);  // Chuyển startDate thành đối tượng Date
        const end = new Date(endDate);      // Chuyển endDate thành đối tượng Date

        console.log(start + "-" + end);

        return paymentAll.filter(item => {
            const paymentStartDate = new Date(item.startDate);  // Lấy ngày bắt đầu của item
            const paymentEndDate = new Date(item.endDate);      // Lấy ngày kết thúc của item

            // Kiểm tra nếu ngày bắt đầu của item lớn hơn hoặc bằng startDate và ngày kết thúc của item nhỏ hơn hoặc bằng endDate
            return paymentStartDate >= start && paymentEndDate <= end;
        });
    };

    generateTuition = async () => {
        try {
            // Hiển thị trạng thái đang tải (nếu cần)
            this.setState({ isProcessing: true });

            // Gửi yêu cầu POST để tạo học phí
            const response = await axios.post(
                "http://localhost:5124/api/Tuition/generate-tuition"
            );

            // Xử lý thành công
            this.setState({
                notificationText: "Tuition generated successfully!",
                notificationType: "success",
                showNotification: true,
            });

            await this.fetchData() // Gọi lại hàm fetch dữ liệu
        } catch (error) {
            // Xử lý lỗi
            const errorMessage = error.response?.data?.message || "Failed to generate tuition!";
            this.setState({
                notificationText: errorMessage,
                notificationType: "error",
                showNotification: true,
            });
        } finally {
            // Tắt trạng thái đang tải
            this.setState({ isProcessing: false });
        }
    };

    handleSendMailByPrin = async () => {
        try {
            // Hiển thị trạng thái đang tải (nếu cần)
            this.setState({ isUploading: true });  // Bật loading khi bắt đầu upload

            // Gửi yêu cầu POST để gửi thông báo nhắc nhở học phí
            const response = await axios.post("http://localhost:5124/api/Tuition/approve-and-send-email");

            // Xử lý thành công
            this.setState({
                notificationText: "Tuition notification sent successfully!",
                notificationType: "success",
                showNotification: true,
            });

            // Nếu cần, gọi lại hàm fetchData để cập nhật lại dữ liệu
            await this.fetchData();
        } catch (error) {
            // Xử lý lỗi
            console.log(error);

            const errorMessage = error?.response?.data || "Failed to send tuition notification!";
            this.setState({
                notificationText: errorMessage,
                notificationType: "error",
                showNotification: true,
            });
        } finally {
            // Tắt trạng thái đang tải
            this.setState({ isUploading: false });  // Tắt loader sau khi tải lên xong
        }
    };
    handleSendMailByStaff = async () => {
        try {
            // Hiển thị trạng thái đang tải (nếu cần)
            this.setState({ isUploadingStaff: true });  // Bật loading khi bắt đầu upload

            // Gửi yêu cầu POST để gửi thông báo nhắc nhở học phí
            const response = await axios.post("http://localhost:5124/api/Tuition/SendTuitionReminder");


            if (response.data.success) {
                // Xử lý thành công
                this.setState({
                    notificationText: "Tuition reminder sent successfully!",
                    notificationType: "success",
                    showNotification: true,
                });

                // Nếu cần, gọi lại hàm fetchData để cập nhật lại dữ liệu
                await this.fetchData();
            } else {
                // Xử lý ko thành công
                this.setState({
                    notificationText: response?.data?.message || "Tuition reminder Error",
                    notificationType: "error",
                    showNotification: true,
                });
            }


        } catch (error) {
            // Xử lý lỗi
            console.log(error);
            const errorMessage = error?.response?.data || "Failed to send tuition reminder!";
            this.setState({
                notificationText: errorMessage,
                notificationType: "error",
                showNotification: true,
            });
        } finally {
            // Tắt trạng thái đang tải
            this.setState({ isUploadingStaff: false });  // Tắt loader sau khi tải lên xong
        }
    };

    // Hàm hiển thị modal xác nhận gửi mail principal
    handleShowConfirmModal = () => {
        this.setState({ showConfirmModal: true });
    };

    // Hàm đóng modal xác nhận
    handleCloseConfirmModal = () => {
        this.setState({ showConfirmModal: false });
    };

    // Hàm xác nhận gửi mail
    handleConfirmSendMail = async () => {
        // Đóng modal xác nhận
        this.setState({ showConfirmModal: false });

        // Gọi hàm gửi mail
        await this.handleSendMailByPrin();
    };

    // Hàm hiển thị modal xác nhận gửi mail quá hạn Staff
    handleShowConfirmModalStaff = () => {
        this.setState({ showConfirmModalStaff: true });
    };
    handleCloseConfirmModalStaff = () => {
        this.setState({ showConfirmModalStaff: false });
    };
    handleConfirmSendMailStaff = async () => {
        // Đóng modal xác nhận
        this.setState({ showConfirmModalStaff: false });

        // Gọi hàm gửi mail
        await this.handleSendMailByStaff();
    };


    handlePageChange = (pageNumber) => {
        this.setState({ currentPage: pageNumber });
    };

    render() {

        const { paymentAll, searchText, startDate, endDate, classList } = this.state;

        const { showNotification, notificationText, notificationType } = this.state;

        const userData = getCookie('user')?.user;
        const roleId = userData.roleId

        // Lọc theo tên
        const filteredpaymentAll = this.handleDateRangeFilter().filter((item) =>
            item.studentName.toLowerCase().includes(searchText.toLowerCase())
        );

        // phan trang
        const { currentPage, itemsPerPage } = this.state;
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = filteredpaymentAll.slice(indexOfFirstItem, indexOfLastItem);

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
                            HeaderText="Tuition Management"
                            Breadcrumb={[
                                { name: "Tuition", navigate: "" },
                            ]}
                        />
                        <div className="row clearfix">
                            <div className="col-lg-12 col-md-12">
                                <div className="card planned_task">
                                    <div className="header d-flex justify-content-between">
                                        <h2>Tuition Manager</h2>
                                        {roleId === 4 ? (
                                            <div className='d-flex'>
                                                <div>
                                                    <a
                                                        href="#!"
                                                        onClick={(e) => {
                                                            e.preventDefault(); // Ngăn hành vi mặc định của thẻ <a>
                                                            if (!this.state.isProcessing) {
                                                                this.generateTuition(); // Chỉ gọi khi không đang xử lý
                                                            }
                                                        }}
                                                        className={`btn btn-primary text-white mr-4 ${this.state.isProcessing ? "disabled" : ""}`}
                                                    >
                                                        {this.state.isProcessing ? "Processing..." : "Generate Tuition"}
                                                    </a>

                                                </div>
                                                <div>

                                                    <a onClick={this.handleShowConfirmModal} className="btn btn-success text-white" style={{
                                                        width: "200px",
                                                        textAlign: 'center',
                                                        pointerEvents: this.state.isUploading ? 'none' : 'auto', // Disable click khi đang upload
                                                        opacity: this.state.isUploading ? 0.5 : 1 // Giảm độ sáng khi vô hiệu hóa
                                                    }}
                                                    >
                                                        {this.state.isUploading ? 'Sending' : 'Send Mail'}
                                                    </a>
                                                    {this.state.isUploading && (
                                                        <Bars color="#00BFFF" height={50} width={50} />
                                                    )}
                                                </div>
                                            </div>

                                        ) : null}
                                        {roleId === 3 ? (
                                            <div className='d-flex'>
                                                <div>
                                                    <a onClick={this.handleShowConfirmModalStaff} className="btn btn-success text-white" style={{
                                                        width: "200px",
                                                        textAlign: 'center',
                                                        pointerEvents: this.state.isUploadingStaff ? 'none' : 'auto', // Disable click khi đang upload
                                                        opacity: this.state.isUploadingStaff ? 0.5 : 1 // Giảm độ sáng khi vô hiệu hóa
                                                    }}
                                                    >
                                                        {this.state.isUploadingStaff ? 'Sending' : 'Send Expired Mail'}
                                                    </a>
                                                    {this.state.isUploadingStaff && (
                                                        <Bars color="#00BFFF" height={50} width={50} />
                                                    )}
                                                </div>
                                            </div>

                                        ) : null}
                                    </div>
                                    <div className="form-group row pl-3">
                                        <div className="col-md-3 mb-2">
                                            <label>Search</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Search by Children Name"
                                                value={searchText}
                                                onChange={this.handleSearchChange}
                                            />
                                        </div>


                                        <div className="col-md-3 mb-2">
                                            <label>StartDate</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={startDate}
                                                onChange={(e) => this.setState({ startDate: e.target.value })}
                                            />
                                        </div>

                                        <div className="col-md-3 mb-2">
                                            <label>EndDate</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={endDate}
                                                onChange={(e) => this.setState({ endDate: e.target.value })}
                                            />
                                        </div>

                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-12">
                                <div className="card">
                                    <div className="table-responsive">
                                        <table className="table m-b-0 table-hover">
                                            <thead className="">
                                                <tr className="theme-color">
                                                    <th>#</th>
                                                    <th>Children</th>
                                                    <th>Code</th>
                                                    <th>Semester</th>
                                                    <th>Start Date</th>
                                                    <th>End Date</th>
                                                    <th>tuitionFee</th>
                                                    <th>Due Date</th>
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
                                                                {item?.studentName}
                                                            </td>
                                                            <td>
                                                                {item?.code}
                                                            </td>
                                                            <td>
                                                                {item?.semesterName}
                                                            </td>
                                                            <td>
                                                                {item?.startDate?.split("T")[0]}
                                                            </td>
                                                            <td>
                                                                {item?.endDate?.split("T")[0]}
                                                            </td>
                                                            <td>
                                                                {item?.tuitionFee}
                                                            </td>
                                                            <td>
                                                                {item?.dueDate?.split("T")[0]}
                                                            </td>

                                                            {roleId === 4 ? (
                                                                <td>
                                                                    {item?.sendMailByPR === 1 ? (
                                                                        <span className="badge badge-success">Sent Mail</span>
                                                                    ) : item?.sendMailByPR === 0 ? (
                                                                        <span className="badge badge-info">Not Send Mail</span>
                                                                    ) : null}
                                                                </td>
                                                            ) : null}
                                                            {roleId === 3 ? (
                                                                <td>
                                                                    {new Date(item?.lastEmailSentDate).toISOString().split('T')[0] === new Date().toISOString().split('T')[0] ? (
                                                                        <span className="badge badge-success">Sent Mail</span>
                                                                    ) : (
                                                                        <span className="badge badge-info">Not Send Mail</span>
                                                                    )}
                                                                </td>
                                                            ) : null}


                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="pt-4">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalItems={filteredpaymentAll.length}
                                            itemsPerPage={itemsPerPage}
                                            onPageChange={this.handlePageChange}
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                        {this.state.showConfirmModal && (
                            <Modal show={this.state.showConfirmModal} onHide={this.handleCloseConfirmModal}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Confirm Send Mail</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    Are you sure you want to send the tuition notification emails?
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={this.handleCloseConfirmModal}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" onClick={this.handleConfirmSendMail}>
                                        Confirm
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                        )}
                        {this.state.showConfirmModalStaff && (
                            <Modal show={this.state.showConfirmModalStaff} onHide={this.handleCloseConfirmModalStaff}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Confirm Send Mail</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    Are you sure you want to send the tuition reminder emails?
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={this.handleCloseConfirmModalStaff}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" onClick={this.handleConfirmSendMailStaff}>
                                        Confirm
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                        )}
                    </div>
                </div >
            </div >
        );
    }
}

export default withRouter(Paymenttuition);