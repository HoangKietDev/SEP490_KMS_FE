// import React from "react";
// import { withRouter } from "react-router-dom";
// import Calendar from "react-calendar";
// import "react-calendar/dist/Calendar.css";
// import "../Menu/ListMenu.css";
// import PageHeader from "../../components/PageHeader";
// import axios from "axios";
// import Notification from "../../components/Notification";
// class ListMenu extends React.Component {
//     state = {
//         selectedWeek: {
//             startOfWeek: new Date(),
//             endOfWeek: new Date(),
//         },
//         menuData: {
//             "0-3": [],
//             "3-6": [],
//         },
//         daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
//         showCalendar: false,
//         selectedStatus0_3: 0, // Status for age group 0-3
//         selectedStatus3_6: 0, // Status for age group 3-6
//         showNotification: false, // State to control notification visibility
//         notificationText: "", // Text for the notification
//         notificationType: "success" // Type of notification (success or error)
//     };

//     componentDidMount() {
//         const { startOfWeek, endOfWeek } = this.getWeekRange(new Date());
//         this.setState({ selectedWeek: { startOfWeek, endOfWeek } }, () => {
//             this.fetchMenuData(startOfWeek, endOfWeek);
//         });
//     }

//     getWeekRange = (date) => {
//         const startOfWeek = new Date(date);
//         const day = startOfWeek.getDay();
//         const diff = day === 0 ? 6 : day - 1;

//         startOfWeek.setDate(startOfWeek.getDate() - diff);
//         const endOfWeek = new Date(startOfWeek);
//         endOfWeek.setDate(startOfWeek.getDate() + 6);

//         return { startOfWeek, endOfWeek };
//     };

//     handleWeekSelect = (date) => {
//         const { startOfWeek, endOfWeek } = this.getWeekRange(date);

//         this.setState({ selectedWeek: { startOfWeek, endOfWeek }, showCalendar: false }, () => {
//             this.fetchMenuData(startOfWeek, endOfWeek);
//         });
//     };

//     formatDate = (date) => {
//         const year = date.getFullYear();
//         const month = String(date.getMonth() + 1).padStart(2, "0");
//         const day = String(date.getDate()).padStart(2, "0");

//         return `${year}-${month}-${day}`;
//     };

//     fetchMenuData = async (startOfWeek, endOfWeek) => {
//         const startDate = this.formatDate(startOfWeek);
//         const endDate = this.formatDate(endOfWeek);

//         try {
//             const response1 = await fetch(`${process.env.REACT_APP_API_URL}/api/Menu/GetMenuByDate?startDate=${startDate}&endDate=${endDate}&gradeId=1`);
//             const response2 = await fetch(`${process.env.REACT_APP_API_URL}/api/Menu/GetMenuByDate?startDate=${startDate}&endDate=${endDate}&gradeId=2`);

//             const menuData1 = await response1.json();
//             const menuData2 = await response2.json();

//             this.setState({
//                 menuData: {
//                     "0-3": menuData1[0]?.menuDetails || [],
//                     "3-6": menuData2[0]?.menuDetails || [],
//                 },
//                 selectedStatus0_3: menuData1[0]?.status || 0,
//                 selectedStatus3_6: menuData2[0]?.status || 0,
//             });
//         } catch (error) {
//             console.error("Error fetching menu data:", error);
//         }
//     };

//     updateMenuStatus = async (gradeID) => {
//         const { selectedWeek } = this.state;
//         const startDate = this.formatDate(selectedWeek.startOfWeek);
//         const endDate = this.formatDate(selectedWeek.endOfWeek);

//         const response1 = await fetch(`${process.env.REACT_APP_API_URL}/api/Menu/GetMenuByDate?startDate=${startDate}&endDate=${endDate}&gradeId=${gradeID}`);
//         const menuData1 = await response1.json();

//         const { selectedStatus0_3, selectedStatus3_6 } = this.state;
//         const status = gradeID === 1 ? selectedStatus0_3 : selectedStatus3_6;

//         if (!menuData1) {
//             // alert("No menu available to update status.");
//             this.setState({
//                 notificationText: "No menu available to update status.",
//                 notificationType: "success",
//                 showNotification: true
//             });
//             return;
//         }

//         const payload = {
//             menuID: menuData1[0].menuID,
//             startDate: this.formatDate(selectedWeek.startOfWeek),
//             endDate: this.formatDate(selectedWeek.endOfWeek),
//             gradeID: gradeID,
//             status: status,
//         };

//         try {
//             const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/Menu/UpdateMenuStatus`, payload);
//             if (response.status === 200) {
//                 // alert(`Successfully updated the menu status for age group ${gradeID === 1 ? "0-3" : "3-6"}!`);
//                 this.setState({
//                     notificationText: `Successfully updated the menu status for age group ${gradeID === 1 ? "0-3" : "3-6"}!`,
//                     notificationType: "success",
//                     showNotification: true
//                 });
//                 this.fetchMenuData(selectedWeek.startOfWeek, selectedWeek.endOfWeek);
//             } else {
//                 // alert("Failed to update the menu status!");
//                 this.setState({
//                     notificationText: "Failed to update the menu status!",
//                     notificationType: "error",
//                     showNotification: true
//                 });
//             }
//         } catch (error) {
//             console.error("Error updating menu status:", error);
//             alert("An error occurred while updating the status.");
//         }
//     };

//     handleFileChange = (event) => {
//         this.setState({ selectedFile: event.target.files[0] });
//     };

//     handleUpload = async () => {
//         const { selectedFile } = this.state;
//         if (!selectedFile) {
//             // alert("Please select a file first!");
//             this.setState({
//                 notificationText: "Please select a file first!",
//                 notificationType: "error",
//                 showNotification: true
//             });
//             return;
//         }

//         const formData = new FormData();
//         formData.append("file", selectedFile);

//         try {
//             const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/Menu/ImportMenuExcel`, formData, {
//                 headers: {
//                     "Content-Type": "multipart/form-data",
//                 },
//             });
//             // alert("File uploaded successfully!");
//             this.setState({
//                 notificationText: "File uploaded successfully!",
//                 notificationType: "success",
//                 showNotification: true
//             });
//             this.fetchMenuData(new Date());
//         } catch (error) {
//             console.error("Error uploading file:", error);
//             // alert("Error uploading file.");
//             this.setState({
//                 notificationText: "Error uploading file.",
//                 notificationType: "error",
//                 showNotification: true
//             });
//         }
//     };

//     toggleCalendar = () => {
//         this.setState((prevState) => ({ showCalendar: !prevState.showCalendar }));
//     };

//     handleStatusChange = (ageGroup) => (event) => {
//         const value = parseInt(event.target.value, 10);
//         if (ageGroup === "0-3") {
//             this.setState({ selectedStatus0_3: value });
//         } else {
//             this.setState({ selectedStatus3_6: value });
//         }
//     };

//     renderTable = (ageGroup) => {
//         const { menuData, daysOfWeek, selectedStatus0_3, selectedStatus3_6 } = this.state;
//         const selectedStatus = ageGroup === "0-3" ? selectedStatus0_3 : selectedStatus3_6;

//         return (
//             <div className="table-wrapper">
//                 <table className="custom-table table table-bordered">
//                     <thead className="thead-light">
//                         <tr>
//                             <th></th>
//                             {daysOfWeek.map((day, index) => (
//                                 <th key={index}>{day}</th>
//                             ))}
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {/* Breakfast */}
//                         <tr>
//                             <td className="sticky-col"><strong>Breakfast</strong></td>
//                             {daysOfWeek.map((day, index) => {
//                                 const menuItems = menuData[ageGroup].filter(menu => menu.mealCode === "BS" && this.mapDayToEnglish(menu.dayOfWeek) === day);
//                                 return (
//                                     <td key={index}>
//                                         {menuItems.length > 0 ? (
//                                             <ul>
//                                                 {menuItems.map((menuItem, itemIndex) => (
//                                                     <li key={`${menuItem.foodName}-${day}-${itemIndex}`}>{menuItem.foodName}</li>
//                                                 ))}
//                                             </ul>
//                                         ) : (
//                                             "No data available"
//                                         )}
//                                     </td>
//                                 );
//                             })}
//                         </tr>

//                         {/* Lunch */}
//                         <tr>
//                             <td className="sticky-col"><strong>Lunch</strong></td>
//                             {daysOfWeek.map((day, index) => {
//                                 const menuItems = menuData[ageGroup].filter(menu => menu.mealCode === "BT" && this.mapDayToEnglish(menu.dayOfWeek) === day);
//                                 return (
//                                     <td key={index}>
//                                         {menuItems.length > 0 ? (
//                                             <ul>
//                                                 {menuItems.map((menuItem, itemIndex) => (
//                                                     <li key={`${menuItem.foodName}-${day}-${itemIndex}`}>{menuItem.foodName}</li>
//                                                 ))}
//                                             </ul>
//                                         ) : (
//                                             "No data available"
//                                         )}
//                                     </td>
//                                 );
//                             })}
//                         </tr>

//                         {/* Dinner */}
//                         <tr>
//                             <td className="sticky-col"><strong>Snack</strong></td>
//                             {daysOfWeek.map((day, index) => {
//                                 const menuItems = menuData[ageGroup].filter(menu => menu.mealCode === "BC" && this.mapDayToEnglish(menu.dayOfWeek) === day);
//                                 return (
//                                     <td key={index}>
//                                         {menuItems.length > 0 ? (
//                                             <ul>
//                                                 {menuItems.map((menuItem, itemIndex) => (
//                                                     <li key={`${menuItem.foodName}-${day}-${itemIndex}`}>{menuItem.foodName}</li>
//                                                 ))}
//                                             </ul>
//                                         ) : (
//                                             "No data available"
//                                         )}
//                                     </td>
//                                 );
//                             })}
//                         </tr>

//                         {/* Status selection */}
//                         {menuData[ageGroup]?.length > 0 && (
//                             <tr>
//                                 <td colSpan={daysOfWeek.length + 1} className="text-center">
//                                     <div className="status-selector">
//                                         <label className="status-label">
//                                             Select status:
//                                             <select
//                                                 value={selectedStatus}
//                                                 onChange={this.handleStatusChange(ageGroup)}
//                                                 className="status-dropdown"
//                                             >
//                                                 <option value={0}>Inactive</option>
//                                                 <option value={1}>Active</option>
//                                             </select>
//                                         </label>
//                                         <button
//                                             onClick={() => this.updateMenuStatus(ageGroup === "0-3" ? 1 : 2)}
//                                             className="update-status-button"
//                                         >
//                                             Update menu status for {ageGroup === "0-3" ? "0-3" : "3-6"}
//                                         </button>
//                                     </div>
//                                 </td>
//                             </tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>
//         );
//     };

//     mapDayToEnglish = (day) => {
//         const dayMap = {
//             Monday: "Monday",
//             Tuesday: "Tuesday",
//             Wednesday: "Wednesday",
//             Thursday: "Thursday",
//             Friday: "Friday",
//             Saturday: "Saturday",
//             Sunday: "Sunday",
//         };
//         return dayMap[day] || day;
//     };

//     render() {
//         const { selectedWeek, showCalendar, showNotification, // State to control notification visibility
//             notificationText, // Text for the notification
//             notificationType } = this.state;

//         return (
//             <div className="container-fluid">
//                 <PageHeader
//                     HeaderText="Food Management"
//                     Breadcrumb={[
//                         { name: "Food Management", navigate: "" },
//                         { name: "View Menu", navigate: "" },
//                     ]}
//                 />
//                 {showNotification && (
//                     <Notification
//                         type={notificationType}
//                         position="top-right"
//                         dialogText={notificationText}
//                         show={showNotification}
//                         onClose={() => this.setState({ showNotification: false })}
//                     />
//                 )}
//                 <div className="row">
//                     <div className="col-lg-12 col-md-12">
//                         <h2>Menu</h2>

//                         <div className="row align-items-center justify-content-between mb-3">
//                             <div className="week-selector col-lg-3" onClick={this.toggleCalendar}>
//                                 Selected week: {selectedWeek.startOfWeek.toLocaleDateString("en-US")} - {selectedWeek.endOfWeek.toLocaleDateString("en-US")}
//                             </div>
//                         </div>

//                         {showCalendar && (
//                             <div className="calendar-dropdown">
//                                 <Calendar onChange={this.handleWeekSelect} value={selectedWeek.startOfWeek} locale="en-US" showWeekNumbers={true} />
//                             </div>
//                         )}

//                         <h4 className="menu-title">All: 0-3</h4>
//                         <div className="table-container">{this.renderTable("0-3")}</div>

//                         <h4 className="menu-title">All: 3-6</h4>
//                         <div className="table-container">{this.renderTable("3-6")}</div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }
// }

// export default withRouter(ListMenu);
// src/components/Menu/ListMenu.js

// src/components/Menu/ListMenu.js

// src/components/Menu/ListMenu.js
// src/components/Menu/ListMenu.js

// src/components/Menu/ListMenu.js

// src/components/Menu/ListMenu.js

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
        grades: [], // Lưu tất cả các grade từ API
        daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        showCalendar: false,
        selectedStatus: {}, // Lưu trạng thái cho từng grade
        showNotification: false,
        notificationText: "",
        notificationType: "success",
        selectedFile: null,
        loading: false
    };

    componentDidMount() {
        const { startOfWeek, endOfWeek } = this.getWeekRange(new Date());
        this.setState({ selectedWeek: { startOfWeek, endOfWeek } }, () => {
            this.fetchGrades();
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
        this.setState({ selectedWeek: { startOfWeek, endOfWeek }, showCalendar: false }, () => {
            this.fetchMenuData(startOfWeek, endOfWeek);
        });
    };

    formatDate = (date) => {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        return date.toISOString().split('T')[0];
    };
    handleSendMailNotification = () => {
        this.setState({ showConfirmModal: true });
    };
    handleConfirmSendMail = async () => {
        this.setState({ showConfirmModal: false, loading: true }); // Bật loading

        // Lấy classId từ URL

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
    fetchGrades = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/Grade`);
            const gradesData = response.data;
            this.setState({
                grades: gradesData || [],
                // Khởi tạo selectedStatus cho từng grade, giá trị sẽ được cập nhật sau khi fetch menu
                selectedStatus: gradesData.reduce((acc, grade) => {
                    acc[grade.gradeId] = 0; // Khởi tạo mặc định là 0
                    return acc;
                }, {})
            });
        } catch (error) {
            console.error("Error fetching grades:", error);
            this.setState({
                notificationText: "Error fetching grades.",
                notificationType: "error",
                showNotification: true
            });
        }
    };

    fetchMenuData = async (startOfWeek, endOfWeek) => {
        const startDate = this.formatDate(startOfWeek);
        const endDate = this.formatDate(endOfWeek);

        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/Menu/GetMenuByDate`, {
                params: { startDate, endDate },
            });
            const data = response.data;
            // Lọc menu chỉ lấy những menu có status = 2
            const filteredData = data.filter(menu => menu.status === 2 || menu.status == 1);

            // Cập nhật menus
            this.setState({ menus: filteredData || [] }, () => {
                this.updateSelectedStatus();
            });
        } catch (error) {
            console.error("Error fetching menu data:", error);
            this.setState({
                notificationText: "Error fetching menu data.",
                notificationType: "error",
                showNotification: true
            });
        }
    };

    // Hàm cập nhật selectedStatus dựa trên dữ liệu menus
    updateSelectedStatus = () => {
        const { menus, grades } = this.state;
        const newSelectedStatus = { ...this.state.selectedStatus };

        menus.forEach(menu => {
            const { gradeIDs, status } = menu;
            gradeIDs.forEach(gradeId => {
                newSelectedStatus[gradeId] = status;
            });
        });

        // Cập nhật state.selectedStatus
        this.setState({ selectedStatus: newSelectedStatus });
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


    updateMenuStatus = async (gradeID, newStatus) => {
        const { selectedWeek, menus } = this.state;
        const startDate = this.formatDate(selectedWeek.startOfWeek);
        const endDate = this.formatDate(selectedWeek.endOfWeek);

        // Tìm menu tương ứng với gradeID
        const menuForGrade = menus.find(m => m.gradeIDs.includes(gradeID));

        if (!menuForGrade) {
            this.setState({
                notificationText: "No menu available to update status.",
                notificationType: "error",
                showNotification: true
            });
            return;
        }

        const payload = {
            menuID: menuForGrade.menuID,
            startDate: startDate,
            endDate: endDate,
            gradeID: gradeID,
            status: newStatus,
        };

        try {
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/Menu/UpdateMenuStatus`, payload);
            if (response.status === 200) {
                this.setState({
                    notificationText: `Successfully updated the menu status for grade ${gradeID}!`,
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

    handleReject = (gradeID) => {
        this.updateMenuStatus(gradeID, 0);
    };

    handleApprove = (gradeID) => {
        this.updateMenuStatus(gradeID, 2);
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

    renderTable = (grade) => {
        const { menus, daysOfWeek, selectedStatus } = this.state;
        const gradeId = grade.gradeId;
        const gradeName = grade.name;

        // Tìm menu cho grade này
        const menuForGrade = menus.find(m => m.gradeIDs.includes(gradeId));
        const menuDetails = menuForGrade ? menuForGrade.menuDetails : [];

        // Kiểm tra xem có bất kỳ menuDetail nào có dữ liệu không
        const hasData = menuDetails.some(menu => menu.foodName && menu.foodName.trim() !== '');

        return (
            <div key={gradeId} className="table-container">
                <h4 className="menu-title">Grade: {gradeName}</h4>
                <div className="table-wrapper">
                    <table className="custom-table table table-bordered">
                        <thead className="thead-light">
                            <tr>
                                <th></th>
                                {daysOfWeek.map((day, index) => (
                                    <th key={index} className="text-center">{day}</th>
                                ))}
                                <th className="text-center">Status</th> {/* Thêm cột Status */}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Breakfast */}
                            <tr>
                                <td className="sticky-col"><strong>Breakfast</strong></td>
                                {daysOfWeek.map((day, index) => {
                                    const menuItems = menuDetails.filter(menu =>
                                        menu.mealCode === "BS" &&
                                        this.mapDayToEnglish(menu.dayOfWeek) === day
                                    );
                                    return (
                                        <td key={index}>
                                            {menuItems.length > 0 ? (
                                                <ul>
                                                    {menuItems.map((menuItem, itemIndex) => (
                                                        <li key={`${menuItem.foodName}-${day}-${itemIndex}`}>{menuItem.foodName}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                "No data available"
                                            )}
                                        </td>
                                    );
                                })}
                                <td rowSpan={3} className="text-center align-middle">
                                    {menuForGrade && this.getStatusText(menuForGrade.status)}
                                </td>

                            </tr>

                            {/* Lunch */}
                            <tr>
                                <td className="sticky-col"><strong>Lunch</strong></td>
                                {daysOfWeek.map((day, index) => {
                                    const menuItems = menuDetails.filter(menu =>
                                        menu.mealCode === "BT" &&
                                        this.mapDayToEnglish(menu.dayOfWeek) === day
                                    );
                                    return (
                                        <td key={index}>
                                            {menuItems.length > 0 ? (
                                                <ul>
                                                    {menuItems.map((menuItem, itemIndex) => (
                                                        <li key={`${menuItem.foodName}-${day}-${itemIndex}`}>{menuItem.foodName}</li>
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
                                <td className="sticky-col"><strong>Snack</strong></td>
                                {daysOfWeek.map((day, index) => {
                                    const menuItems = menuDetails.filter(menu =>
                                        menu.mealCode === "BC" &&
                                        this.mapDayToEnglish(menu.dayOfWeek) === day
                                    );
                                    return (
                                        <td key={index}>
                                            {menuItems.length > 0 ? (
                                                <ul>
                                                    {menuItems.map((menuItem, itemIndex) => (
                                                        <li key={`${menuItem.foodName}-${day}-${itemIndex}`}>{menuItem.foodName}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                "No data available"
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>

                            {/* Status selection - Chỉ hiển thị nếu có dữ liệu và status là 1 hoặc 2 */}
                            {hasData && menuForGrade && (menuForGrade.status === 1 || menuForGrade.status === 2) && (
                                <tr>
                                    <td colSpan={daysOfWeek.length + 2} className="text-center">
                                        <div className="form-group text-right">
                                            <button className="btn btn-danger" onClick={() => this.handleReject(gradeId)}>
                                                Reject
                                            </button>
                                            <button className="btn btn-success ml-2" onClick={() => this.handleApprove(gradeId)}>
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
        );
    };

    render() {
        const {
            selectedWeek,
            showCalendar,
            showNotification,
            notificationText,
            notificationType,
            grades,
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


                        </div>

                        {showCalendar && (
                            <div className="calendar-dropdown">
                                <Calendar
                                    onChange={this.handleWeekSelect}
                                    value={selectedWeek.startOfWeek}
                                    locale="en-US"
                                    showWeekNumbers={true}
                                />
                            </div>
                        )}
                        <>
                            <button
                                className="btn btn-primary ml-3"
                                onClick={this.handleSendMailNotification}
                                disabled={loading} // Nút bị vô hiệu hóa nếu loading = true
                            >
                                {loading ? "Sending..." : "Send Mail Notification"}
                            </button>

                            {/* Nếu loading, hiển thị spinner */}
                            {loading && (
                                <div className="loading-container">
                                    <ProgressBar color="#00BFFF" height={40} width={100} />
                                </div>
                            )}
                        </>
                        {/* Lặp qua tất cả các grade để render bảng */}
                        {grades && grades.length > 0 ? (
                            grades.map((grade) => this.renderTable(grade))
                        ) : (
                            <p>No grades available</p>
                        )}
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
