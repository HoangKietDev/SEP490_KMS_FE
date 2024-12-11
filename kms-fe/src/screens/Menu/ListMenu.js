
import React from "react";
import { withRouter } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../Menu/ListMenu.css";
import PageHeader from "../../components/PageHeader";
import axios from "axios";
import Notification from "../../components/Notification";
import Modal from "react-bootstrap/Modal"; // Import Bootstrap Modal
import Button from "react-bootstrap/Button";
import { ProgressBar } from "react-loader-spinner"; // Import spinner

class ListMenu extends React.Component {
    state = {
        selectedWeek: {
            startOfWeek: new Date(),
            endOfWeek: new Date(),
        },
        menus: [], // Lưu tất cả các menu từ API
        daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        showCalendar: false,
        showNotification: false,
        notificationText: "",
        notificationType: "success",
        selectedFile: null,
        loading: false,
        showConfirmModal: false, // Moved here for consistency
    };

    componentDidMount() {
        const { startOfWeek, endOfWeek } = this.getWeekRange(new Date());
        this.setState({ selectedWeek: { startOfWeek, endOfWeek } }, () => {
            this.fetchMenuData(startOfWeek, endOfWeek);
        });
    }

    getWeekRange = (date) => {
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        const diff = day === 0 ? 6 : day - 1; // Chuyển Sunday (0) thành 6 để bắt đầu tuần từ Monday
        startOfWeek.setDate(startOfWeek.getDate() - diff);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        return { startOfWeek, endOfWeek };
    };

    handleWeekSelect = (date) => {
        const { startOfWeek, endOfWeek } = this.getWeekRange(date);
        // startOfWeek = this.formatDate(startOfWeek);
        // endOfWeek = this.formatDate(endOfWeek)
        this.setState({ selectedWeek: { startOfWeek, endOfWeek }, showCalendar: false }, () => {
            this.fetchMenuData(this.formatDate(startOfWeek),this.formatDate(endOfWeek) );
        });
    };

    formatDate = (date) => {
        if (!(date instanceof Date)) {
          date = new Date(date);
        }
        // Lấy năm, tháng, ngày từ đối tượng Date
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
    

    handleSendMailNotification = () => {
        this.setState({ showConfirmModal: true });
    };

    handleConfirmSendMail = async () => {
        this.setState({ showConfirmModal: false, loading: true }); // Bật loading

        try {
            // API call sử dụng fetch
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/Menu/SendMenuToAllParentsMail`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                this.setState({
                    notificationText: "Mail sent successfully!",
                    notificationType: "success",
                    showNotification: true
                });
            } else {
                throw new Error('Network response was not ok.');
            }
        } catch (error) {
            this.setState({
                notificationText: "Mail sent Error!",
                notificationType: "error",
                showNotification: true
            });
        } finally {
            this.setState({ loading: false }); // Kết thúc loading
        }
    };

    handleCloseConfirmModal = () => {
        this.setState({ showConfirmModal: false });
    };

    fetchMenuData = async (startOfWeek, endOfWeek) => {
        const startDate = this.formatDate(startOfWeek);
        const endDate = this.formatDate(endOfWeek);
        
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/Menu/GetMenuByDate`, {
                params: { startDate, endDate },
            });
            const data = response.data;
            // Lọc menu chỉ lấy những menu có status = 2 hoặc 1
            const filteredData = data.filter(menu => menu.status === 2 || menu.status === 1);

            // Cập nhật menus
            this.setState({ menus: filteredData || [] });
        } catch (error) {
            console.error("Error fetching menu data:", error);
            this.setState({
                notificationText: "Error fetching menu data.",
                notificationType: "error",
                showNotification: true
            });
        }
    };

    // Hàm hỗ trợ chuyển đổi status thành văn bản
    getStatusText = (status) => {
        switch (status) {
            case 0:
                return <span className="badge badge-default">Draft</span>; // Màu mặc định (xám) cho Draft
            case 1:
                return <span className="badge badge-warning">Pending</span>; // Màu vàng cho Pending
            case 2:
                return <span className="badge badge-success">Approved</span>; // Màu xanh lá cây cho Approved
            default:
                return <span className="badge badge-secondary">Unknown</span>; // Màu xám cho Unknown
        }
    };

    handleFileChange = (event) => {
        this.setState({ selectedFile: event.target.files[0] });
    };

    handleUpload = async () => {
        const { selectedFile, selectedWeek } = this.state;
        if (!selectedFile) {
            this.setState({
                notificationText: "Please select a file first!",
                notificationType: "error",
                showNotification: true
            });
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/Menu/ImportMenuExcel`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            this.setState({
                notificationText: "File uploaded successfully!",
                notificationType: "success",
                showNotification: true
            });
            this.fetchMenuData(selectedWeek.startOfWeek, selectedWeek.endOfWeek);
        } catch (error) {
            console.error("Error uploading file:", error);
            this.setState({
                notificationText: "Error uploading file.",
                notificationType: "error",
                showNotification: true
            });
        }
    };

    toggleCalendar = () => {
        this.setState((prevState) => ({ showCalendar: !prevState.showCalendar }));
    };

    mapDayToEnglish = (day) => {
        const dayMap = {
            Monday: "Monday",
            Tuesday: "Tuesday",
            Wednesday: "Wednesday",
            Thursday: "Thursday",
            Friday: "Friday",
            Saturday: "Saturday",
            Sunday: "Sunday",
        };
        return dayMap[day] || day;
    };

    renderMenus = () => {
        const { menus, daysOfWeek } = this.state;

        if (menus.length === 0) {
            return <p>No menus available for the selected week.</p>;
        }

        return menus.map((menu) => (
            <div key={menu.menuID} className="menu-container mb-4">
                <h4 className="menu-title">Grades: {menu.gradeIDs.join(", ")}</h4>
                <h5 className="">Status: {this.getStatusText(menu.status)}</h5>
                <div className="menu-details">
                    <table className="custom-table table table-bordered">
                        <thead className="thead-light">
                            <tr>
                                <th>Meal</th>
                                {daysOfWeek.map((day, index) => (
                                    <th key={index} className="text-center">{day}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Breakfast */}
                            <tr>
                                <td><strong>Breakfast</strong></td>
                                {daysOfWeek.map((day, index) => {
                                    const breakfastItems = menu.menuDetails.filter(detail =>
                                        detail.mealCode === "BS" &&
                                        this.mapDayToEnglish(detail.dayOfWeek) === day
                                    );
                                    return (
                                        <td key={index}>
                                            {breakfastItems.length > 0 ? (
                                                <ul>
                                                    {breakfastItems.map((item, idx) => (
                                                        <li key={idx}>{item.foodName}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                "No data available"
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>

                            {/* Lunch */}
                            <tr>
                                <td><strong>Lunch</strong></td>
                                {daysOfWeek.map((day, index) => {
                                    const lunchItems = menu.menuDetails.filter(detail =>
                                        detail.mealCode === "BT" &&
                                        this.mapDayToEnglish(detail.dayOfWeek) === day
                                    );
                                    return (
                                        <td key={index}>
                                            {lunchItems.length > 0 ? (
                                                <ul>
                                                    {lunchItems.map((item, idx) => (
                                                        <li key={idx}>{item.foodName}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                "No data available"
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>

                            {/* Snack */}
                            <tr>
                                <td><strong>Snack</strong></td>
                                {daysOfWeek.map((day, index) => {
                                    const snackItems = menu.menuDetails.filter(detail =>
                                        detail.mealCode === "BC" &&
                                        this.mapDayToEnglish(detail.dayOfWeek) === day
                                    );
                                    return (
                                        <td key={index}>
                                            {snackItems.length > 0 ? (
                                                <ul>
                                                    {snackItems.map((item, idx) => (
                                                        <li key={idx}>{item.foodName}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                "No data available"
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>

                            {/* Status Actions - Optional */}
                            {(menu.status === 1 || menu.status === 2) && (
                                <tr>
                                    <td colSpan={daysOfWeek.length + 1} className="text-center">
                                        <div className="form-group text-right">
                                            <button className="btn btn-danger" onClick={() => this.handleReject(menu.menuID)}>
                                                Reject
                                            </button>
                                            <button className="btn btn-success ml-2" onClick={() => this.handleApprove(menu.menuID)}>
                                                Approve
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        ));
    };

    // Update the approve/reject methods to handle menuID instead of gradeID
    updateMenuStatus = async (menuID, newStatus) => {
        const { selectedWeek, menus } = this.state;
        const startDate = this.formatDate(selectedWeek.startOfWeek);
        const endDate = this.formatDate(selectedWeek.endOfWeek);

        // Tìm menu tương ứng với menuID
        const menuToUpdate = menus.find(m => m.menuID === menuID);

        if (!menuToUpdate) {
            this.setState({
                notificationText: "No menu available to update status.",
                notificationType: "error",
                showNotification: true
            });
            return;
        }

        const payload = {
            menuID: menuToUpdate.menuID,
            startDate: startDate,
            endDate: endDate,
            status: newStatus,
        };

        try {
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/Menu/UpdateMenuStatus`, payload);
            if (response.status === 200) {
                this.setState({
                    notificationText: `Successfully updated the menu status!`,
                    notificationType: "success",
                    showNotification: true
                });
                this.fetchMenuData(selectedWeek.startOfWeek, selectedWeek.endOfWeek);
            } else {
                this.setState({
                    notificationText: "Failed to update the menu status!",
                    notificationType: "error",
                    showNotification: true
                });
            }
        } catch (error) {
            console.error("Error updating menu status:", error);
            this.setState({
                notificationText: "An error occurred while updating the status.",
                notificationType: "error",
                showNotification: true
            });
        }
    };

    handleReject = (menuID) => {
        this.updateMenuStatus(menuID, 0);
    };

    handleApprove = (menuID) => {
        this.updateMenuStatus(menuID, 2);
    };

    render() {
        const {
            selectedWeek,
            showCalendar,
            showNotification,
            notificationText,
            notificationType,
            menus,
            showConfirmModal,
            loading
        } = this.state;

        return (
            <div className="container-fluid">
                <PageHeader
                    HeaderText="Food Management"
                    Breadcrumb={[
                        { name: "Food Management", navigate: "" },
                        { name: "View Menu", navigate: "" },
                    ]}
                />
                {showNotification && (
                    <Notification
                        type={notificationType}
                        position="top-right"
                        dialogText={notificationText}
                        show={showNotification}
                        onClose={() => this.setState({ showNotification: false })}
                    />
                )}
                <div className="row">
                    <div className="col-lg-12 col-md-12">
                        <h2>Menu</h2>

                        <div className="row align-items-center justify-content-between mb-3">
                            <div className="week-selector col-lg-3" onClick={this.toggleCalendar} style={{ cursor: 'pointer' }}>
                                Selected week: {selectedWeek.startOfWeek.toLocaleDateString("en-US")} - {selectedWeek.endOfWeek.toLocaleDateString("en-US")}
                            </div>
                            <div className="mb-3">
                                <button
                                    className="btn btn-primary ml-3"
                                    onClick={this.handleSendMailNotification}
                                    disabled={loading} // Nút bị vô hiệu hóa nếu loading = true
                                >
                                    {loading ? "Sending..." : "Send Mail Notification"}
                                </button>

                                {/* Nếu loading, hiển thị spinner */}
                                {loading && (
                                    <div className="loading-container d-inline-block ml-2">
                                        <ProgressBar color="#00BFFF" height={40} width={100} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {showCalendar && (
                            <div className="calendar-dropdown mb-3">
                                <Calendar
                                    onChange={this.handleWeekSelect}
                                    value={selectedWeek.startOfWeek}
                                    locale="en-US"
                                    showWeekNumbers={true}
                                />
                            </div>
                        )}




                        {/* Render Menus */}
                        {this.renderMenus()}
                    </div>
                </div>
                <Modal show={showConfirmModal} onHide={this.handleCloseConfirmModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Mail Notification</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to send mail notifications with the current filters?
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
            </div>
        );
    }

    handleDownload = () => {
        const link = document.createElement('a');
        link.href = '/assets/excel/MenuSample.xlsx';
        link.download = 'MenuSample.xlsx';
        link.click();
    };
}

export default withRouter(ListMenu);
