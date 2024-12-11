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
    renderMenus = () => {
        const { menus, daysOfWeek } = this.state;

        if (menus.length === 0) {
            return <p>No menus available for the selected week.</p>;
        }

        return menus.map((menu) => (
            <div key={menu.menuID} className="menu-container mb-4">
                <h4 className="menu-title">Grades: {menu.gradeIDs.join(", ")}</h4>
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
                        </tbody>
                    </table>
                </div>
            </div>
        ));
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
                        {this.renderMenus()}
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


