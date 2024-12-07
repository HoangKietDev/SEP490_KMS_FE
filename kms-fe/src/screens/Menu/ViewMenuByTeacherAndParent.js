// import React from "react";
// import { withRouter } from "react-router-dom";
// import Calendar from "react-calendar";
// import "react-calendar/dist/Calendar.css";
// import "./ViewMenu.css";
// import PageHeader from "../../components/PageHeader";
// import axios from "axios";
// import Notification from "../../components/Notification";
// class ViewMenuByTeacherAndParent extends React.Component {
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
//         selectedFile: null,
//         showNotification: false, // State to control notification visibility
//         notificationText: "", // Text for the notification
//         notificationType: "success" // Type of notification (success or error)
//     };

//     componentDidMount() {
//         const { startOfWeek, endOfWeek } = this.getWeekRange(new Date());
//         this.setState({ selectedWeek: { startOfWeek, endOfWeek } }, () => {
//             this.fetchMenuData(startOfWeek, endOfWeek); // Fetch data from the API
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

// fetchMenuData = async (startOfWeek, endOfWeek) => {
//     const startDate = this.formatDate(startOfWeek);
//     const endDate = this.formatDate(endOfWeek);

//     try {
//         const response1 = await fetch(`${process.env.REACT_APP_API_URL}/api/Menu/GetMenuByDate?startDate=${startDate}&endDate=${endDate}&gradeId=1`);
//         const response2 = await fetch(`${process.env.REACT_APP_API_URL}/api/Menu/GetMenuByDate?startDate=${startDate}&endDate=${endDate}&gradeId=2`);

//         const menuData1 = await response1.json();
//         const menuData2 = await response2.json();

//         // Check the status of menuData1
//         if (menuData1.length > 0 && menuData1[0].status === 1) {
//             this.setState((prevState) => ({
//                 menuData: {
//                     ...prevState.menuData,
//                     "0-3": menuData1[0]?.menuDetails || [],
//                 },
//             }));
//         } else {
//             console.log("Menu for age group 0-3 is not available due to status 0.");
//             this.setState((prevState) => ({
//                 menuData: {
//                     ...prevState.menuData,
//                     "0-3": [],
//                 },
//             }));
//         }

//         // Check the status of menuData2
//         if (menuData2.length > 0 && menuData2[0].status === 1) {
//             this.setState((prevState) => ({
//                 menuData: {
//                     ...prevState.menuData,
//                     "3-6": menuData2[0]?.menuDetails || [],
//                 },
//             }));
//         } else {
//             console.log("Menu for age group 3-6 is not available due to status 0.");
//             this.setState((prevState) => ({
//                 menuData: {
//                     ...prevState.menuData,
//                     "3-6": [],
//                 },
//             }));
//         }
//     } catch (error) {
//         console.error("Error fetching menu data:", error);
//     }
// };

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
//               }); 
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
//               }); 
//             this.fetchMenuData(new Date());
//         } catch (error) {
//             console.error("Error uploading file:", error);
//             // alert("Error uploading file.");
//             this.setState({
//                 notificationText: "Error uploading file.",
//                 notificationType: "error",
//                 showNotification: true
//               }); 
//         }
//     };

//     toggleCalendar = () => {
//         this.setState((prevState) => ({ showCalendar: !prevState.showCalendar }));
//     };

//     renderTable = (ageGroup) => {
//         const { menuData, daysOfWeek, } = this.state;

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
//                                 <Calendar
//                                     onChange={this.handleWeekSelect}
//                                     value={selectedWeek.startOfWeek}
//                                     locale="en-US"
//                                     showWeekNumbers={true}
//                                 />
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

// export default withRouter(ViewMenuByTeacherAndParent);
// src/components/Menu/ViewMenuByTeacherAndParent.js

// src/components/Menu/ViewMenuByTeacherAndParent.js

// src/components/Menu/ViewMenuByTeacherAndParent.js

// src/components/Menu/ViewMenuByTeacherAndParent.js

import React from "react";
import { withRouter } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./ViewMenu.css";
import PageHeader from "../../components/PageHeader";
import axios from "axios";
import Notification from "../../components/Notification";

class ViewMenuByTeacherAndParent extends React.Component {
    _isMounted = false; // Cờ để kiểm tra component còn mount hay không

    state = {
        selectedWeek: {
            startOfWeek: new Date(),
            endOfWeek: new Date(),
        },
        grades: [], // Lưu tất cả các grade từ API
        menus: [],
        menuData: {}, // Lưu menu cho từng gradeId
        selectedStatus: {},
        daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        showCalendar: false,
        selectedFile: null,
        showNotification: false, // State để kiểm soát hiển thị notification
        notificationText: "", // Nội dung notification
        notificationType: "success" // Loại notification (success hoặc error)
    };

    componentDidMount() {
        const { startOfWeek, endOfWeek } = this.getWeekRange(new Date());
        this.setState({ selectedWeek: { startOfWeek, endOfWeek } }, () => {
            this.fetchGrades();
            this.fetchMenuData(startOfWeek, endOfWeek);
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
    }
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
    // Hàm lấy phạm vi tuần
    getWeekRange = (date) => {
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        const diff = day === 0 ? 6 : day - 1; // Chuyển Sunday (0) thành 6 để bắt đầu tuần từ Monday
        startOfWeek.setDate(startOfWeek.getDate() - diff);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        return { startOfWeek, endOfWeek };
    };

    // Hàm xử lý chọn tuần
    handleWeekSelect = (date) => {
        const { startOfWeek, endOfWeek } = this.getWeekRange(date);
        this.setState({ selectedWeek: { startOfWeek, endOfWeek }, showCalendar: false }, () => {
            this.fetchMenuData(startOfWeek, endOfWeek);
        });
    };

    // Hàm định dạng ngày
    formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    // Hàm lấy danh sách grades từ API


    // Hàm lấy menu data cho từng grade với status=2
    // fetchMenuData = async (startOfWeek, endOfWeek) => {
    //     const startDate = this.formatDate(startOfWeek);
    //     const endDate = this.formatDate(endOfWeek);

    //     const { grades } = this.state;

    //     // Kiểm tra nếu không có grades
    //     if (grades.length === 0) {
    //         console.warn("No grades found. Cannot fetch menu data.");
    //         return;
    //     }

    //     try {
    //         const apiUrl = process.env.REACT_APP_API_URL;

    //         // Kiểm tra nếu biến môi trường chưa được định nghĩa
    //         if (!apiUrl) {
    //             throw new Error("REACT_APP_API_URL is not defined in environment variables.");
    //         }

    //         // Tạo các yêu cầu GET cho từng grade
    //         const requests = grades.map(grade =>
    //             fetch(`${apiUrl}/api/Menu/GetMenuByDate?startDate=${startDate}&endDate=${endDate}&gradeId=${grade.id}`)
    //                 .then((response) => response.json())
    //         );

    //         // Thực hiện tất cả các yêu cầu đồng thời
    //         const responses = await Promise.all(requests);

    //         // Khởi tạo đối tượng mới để lưu trữ dữ liệu theo grade
    //         let newMenuData = [];

    //         // Duyệt qua từng menu trong responses
    //         responses.forEach((menu) => {
    //             // Kiểm tra xem menu có hợp lệ và có status = 2
    //             if (menu && menu.status === 2) {
    //                 menu.gradeIDs.forEach((gradeId) => {
    //                     // Nếu chưa có dữ liệu cho gradeId này, tạo một mảng mới
    //                     if (!newMenuData[gradeId]) {
    //                         newMenuData[gradeId] = [];
    //                     }

    //                     // Duyệt qua từng menuDetail và thêm vào newMenuData nếu chưa có
    //                     menu.menuDetails.forEach((menuDetail) => {
    //                         // Kiểm tra xem menuDetail đã tồn tại chưa
    //                         if (!newMenuData[gradeId].some(item => item.menuDetailId === menuDetail.menuDetailId)) {
    //                             newMenuData[gradeId].push(menuDetail);
    //                         }
    //                     });
    //                 });
    //             }
    //         });

    //         // In kết quả
    //         console.log("Menu Data: ", newMenuData);

    //         // Cập nhật state với menuData
    //         if (this._isMounted) {
    //             this.setState({ menuData: newMenuData });
    //         }

    //     } catch (error) {
    //         console.error("Error fetching menu data:", error);

    //         // Xử lý thông báo lỗi
    //         if (this._isMounted) {
    //             this.setState({
    //                 notificationText: "Error fetching menu data.",
    //                 notificationType: "error",
    //                 showNotification: true
    //             });
    //         }
    //     }
    // };

    fetchMenuData = async (startOfWeek, endOfWeek) => {
        const startDate = this.formatDate(startOfWeek);
        const endDate = this.formatDate(endOfWeek);

        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/Menu/GetMenuByDate`, {
                params: { startDate, endDate },
            });
            const data = response.data;

            // Lọc menu chỉ lấy những menu có status = 2
            const filteredData = data.filter(menu => menu.status === 2);

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
    // Hàm xử lý thay đổi file
    handleFileChange = (event) => {
        this.setState({ selectedFile: event.target.files[0] });
    };

    // Hàm xử lý upload file
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
            const apiUrl = process.env.REACT_APP_API_URL;
            if (!apiUrl) {
                throw new Error("REACT_APP_API_URL is not defined in environment variables.");
            }

            const response = await axios.post(`${apiUrl}/api/Menu/ImportMenuExcel`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            this.setState({
                notificationText: "File uploaded successfully!",
                notificationType: "success",
                showNotification: true
            });

            // Fetch lại dữ liệu menu sau khi upload thành công
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

    // Hàm toggle lịch
    toggleCalendar = () => {
        this.setState(prevState => ({ showCalendar: !prevState.showCalendar }));
    };

    // Hàm hỗ trợ chuyển đổi status thành văn bản
    getStatusText = (status) => {
        switch (status) {
            case 1:
                return "Pending";
            case 2:
                return "Approved";
            default:
                return "Unknown";
        }
    };

    // Hàm render bảng menu cho từng grade
    // renderTable = (grade) => {
    //     const { menuData, daysOfWeek } = this.state;
    //     const gradeId = grade.gradeId;
    //     const gradeName = grade.name;

    //     // Đảm bảo menuData[gradeId] luôn là một mảng
    //     const gradeMenu = Array.isArray(menuData[gradeId]) ? menuData[gradeId] : [];

    //     // Kiểm tra xem có dữ liệu menu nào không
    //     const hasData = gradeMenu.length > 0;
    //     console.log(hasData, "test há data");

    //     console.log(menuData, "ssdsdsd");

    //     if (!hasData) {
    //         // Nếu không có menu với status=2, không hiển thị bảng
    //         return null;

    //         // Nếu bạn muốn hiển thị thông báo, có thể thay thế bằng đoạn mã dưới đây:
    //         /*
    //         return (
    //             <div className="table-container" key={gradeId}>
    //                 <h4 className="menu-title">Grade: {gradeName}</h4>
    //                 <div className="no-data">
    //                     No data available for this grade.
    //                 </div>
    //             </div>
    //         );
    //         */
    //     }

    //     return (
    //         <div className="table-container" key={gradeId}>
    //             <h4 className="menu-title">Grade: {gradeName}</h4>
    //             <div className="table-wrapper">
    //                 <table className="custom-table table table-bordered">
    //                     <thead className="thead-light">
    //                         <tr>
    //                             <th></th>
    //                             {daysOfWeek.map((day, index) => (
    //                                 <th key={index} className="text-center">{day}</th>
    //                             ))}
    //                             <th className="text-center">Status</th>
    //                         </tr>
    //                     </thead>
    //                     <tbody>
    //                         {/* Breakfast */}
    //                         <tr>
    //                             <td className="sticky-col"><strong>Breakfast</strong></td>
    //                             {daysOfWeek.map((day, index) => {
    //                                 const menuItems = gradeMenu.filter(menu =>
    //                                     menu.mealCode === "BS" &&
    //                                     this.mapDayToEnglish(menu.dayOfWeek) === day
    //                                 );
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
    //                             <td rowSpan={3} className="text-center align-middle">
    //                                 {this.getStatusText(2)}
    //                             </td>
    //                         </tr>

    //                         {/* Lunch */}
    //                         <tr>
    //                             <td className="sticky-col"><strong>Lunch</strong></td>
    //                             {daysOfWeek.map((day, index) => {
    //                                 const menuItems = gradeMenu.filter(menu =>
    //                                     menu.mealCode === "BT" &&
    //                                     this.mapDayToEnglish(menu.dayOfWeek) === day
    //                                 );
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

    //                         {/* Snack */}
    //                         <tr>
    //                             <td className="sticky-col"><strong>Snack</strong></td>
    //                             {daysOfWeek.map((day, index) => {
    //                                 const menuItems = gradeMenu.filter(menu =>
    //                                     menu.mealCode === "BC" &&
    //                                     this.mapDayToEnglish(menu.dayOfWeek) === day
    //                                 );
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
    //                     </tbody>
    //                 </table>
    //             </div>
    //         </div>
    //     );
    // };
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
                                <td rowSpan={3} className="text-center align-middle ">
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
                            {/* {hasData && menuForGrade && (menuForGrade.status === 1 || menuForGrade.status === 2) && (
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
                            )} */}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };
    // Hàm chuyển đổi tên ngày nếu cần thiết
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

    render() {
        const {
            selectedWeek,
            showCalendar,
            showNotification,
            notificationText,
            notificationType,

        } = this.state;

        const { grades } = this.state;

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
                            <div
                                className="week-selector col-lg-3"
                                onClick={this.toggleCalendar}
                                style={{ cursor: 'pointer' }}
                            >
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

                        {/* Hiển thị tất cả các bảng cho các grade có dữ liệu */}
                        {grades && grades.length > 0 ? (
                            grades.map((grade) => this.renderTable(grade))
                        ) : (
                            <p>No grades available</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Hàm download template
    handleDownload = () => {
        const link = document.createElement('a');
        link.href = '/assets/excel/MenuSample.xlsx';
        link.download = 'MenuSample.xlsx';
        link.click();
    };
}

export default withRouter(ViewMenuByTeacherAndParent);


