import React from "react";
import { withRouter } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../Menu/ListMenu.css"
import PageHeader from "../../components/PageHeader";
import axios from "axios";

class ListMenu extends React.Component {
    state = {
        selectedWeek: {
            startOfWeek: new Date(),
            endOfWeek: new Date(),
        },
        menuData: {
            "0-3": [],
            "3-6": [],
        },
        daysOfWeek: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"],
        showCalendar: false,
        selectedStatus0_3: 0, // Trạng thái cho khối lớp 0-3
        selectedStatus3_6: 0, // Trạng thái cho khối lớp 3-6
    };

    componentDidMount() {
        const { startOfWeek, endOfWeek } = this.getWeekRange(new Date());
        this.setState({ selectedWeek: { startOfWeek, endOfWeek } }, () => {
            this.fetchMenuData(startOfWeek, endOfWeek); // Gọi API để lấy dữ liệu
        });
    }

    getWeekRange = (date) => {
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        const diff = day === 0 ? 6 : day - 1;

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
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    fetchMenuData = async (startOfWeek, endOfWeek) => {
        const startDate = this.formatDate(startOfWeek);
        const endDate = this.formatDate(endOfWeek);

        try {
            const response1 = await fetch(`http://localhost:5124/api/Menu/GetMenuByDate?startDate=${startDate}&endDate=${endDate}&gradeId=1`);
            const response2 = await fetch(`http://localhost:5124/api/Menu/GetMenuByDate?startDate=${startDate}&endDate=${endDate}&gradeId=2`);

            const menuData1 = await response1.json();
            const menuData2 = await response2.json();

            this.setState({
                menuData: {
                    "0-3": menuData1[0]?.menuDetails || [],
                    "3-6": menuData2[0]?.menuDetails || [],
                },
                selectedStatus0_3: menuData1[0]?.status || 0, // Giả sử status nằm trong menuData1
                selectedStatus3_6: menuData2[0]?.status || 0, // Giả sử status nằm trong menuData2
            });
        } catch (error) {
            console.error("Error fetching menu data:", error);
        }
    };

    updateMenuStatus = async (gradeID) => {
        console.log(gradeID, "gradeID");

        const { selectedWeek } = this.state;
        const startDate = this.formatDate(selectedWeek.startOfWeek);
        const endDate = this.formatDate(selectedWeek.endOfWeek);
        console.log(startDate, "sdasdsa");


        const response1 = await fetch(`http://localhost:5124/api/Menu/GetMenuByDate?startDate=${startDate}&endDate=${endDate}&gradeId=${gradeID}`);

        const menuData1 = await response1.json();

        const { selectedStatus0_3, selectedStatus3_6 } = this.state;
        const status = gradeID === 1 ? selectedStatus0_3 : selectedStatus3_6;

        console.log(menuData1, "dsdsd");


        if (!menuData1) {
            alert("Không có thực đơn để cập nhật trạng thái.");
            return;
        }

        const payload = {
            menuID: menuData1[0].menuID,
            startDate: this.formatDate(selectedWeek.startOfWeek),
            endDate: this.formatDate(selectedWeek.endOfWeek),
            gradeID: gradeID,
            status: status,
        };
        console.log(payload, "ooo");

        try {
            const response = await axios.put("http://localhost:5124/api/Menu/UpdateMenuStatus", payload);
            if (response.status === 200) {
                alert(`Cập nhật trạng thái của thực đơn khối ${gradeID === 1 ? "0-3" : "3-6"} thành công!`);
                this.fetchMenuData(selectedWeek.startOfWeek, selectedWeek.endOfWeek);
            } else {
                alert("Cập nhật trạng thái thất bại!");
            }
        } catch (error) {
            console.error("Error updating menu status:", error);
            alert("Đã xảy ra lỗi khi cập nhật trạng thái.");
        }
    };

    handleFileChange = (event) => {
        this.setState({ selectedFile: event.target.files[0] });
    };

    handleUpload = async () => {
        const { selectedFile } = this.state;
        if (!selectedFile) {
            alert("Please select a file first!");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const response = await axios.post("http://localhost:5124/api/Menu/ImportMenuExcel", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            alert("File uploaded successfully!");
            this.fetchMenuData(new Date());
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("Error uploading file.");
        }
    };

    toggleCalendar = () => {
        this.setState((prevState) => ({ showCalendar: !prevState.showCalendar }));
    };

    handleStatusChange = (ageGroup) => (event) => {
        const value = parseInt(event.target.value, 10);
        if (ageGroup === "0-3") {
            this.setState({ selectedStatus0_3: value });
        } else {
            this.setState({ selectedStatus3_6: value });
        }
    };

    renderTable = (ageGroup) => {
        const { menuData, daysOfWeek, selectedStatus0_3, selectedStatus3_6 } = this.state;
        const selectedStatus = ageGroup === "0-3" ? selectedStatus0_3 : selectedStatus3_6;

        return (
            <div className="table-wrapper">
                <table className="custom-table table table-bordered">
                    <thead className="thead-light">
                        <tr>
                            <th></th>
                            {daysOfWeek.map((day, index) => (
                                <th key={index}>{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {/* Bữa Sáng */}
                        <tr>
                            <td className="sticky-col"><strong>Bữa Sáng</strong></td>
                            {daysOfWeek.map((day, index) => {
                                const menuItems = menuData[ageGroup].filter(menu => menu.mealCode === "BS" && this.mapDayToVietnamese(menu.dayOfWeek) === day);
                                return (
                                    <td key={index}>
                                        {menuItems.length > 0 ? (
                                            <ul>
                                                {menuItems.map((menuItem, itemIndex) => (
                                                    <li key={`${menuItem.foodName}-${day}-${itemIndex}`}>{menuItem.foodName}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            "Không có dữ liệu"
                                        )}
                                    </td>
                                );
                            })}
                        </tr>

                        {/* Bữa Trưa */}
                        <tr>
                            <td className="sticky-col"><strong>Bữa Trưa</strong></td>
                            {daysOfWeek.map((day, index) => {
                                const menuItems = menuData[ageGroup].filter(menu => menu.mealCode === "BT" && this.mapDayToVietnamese(menu.dayOfWeek) === day);
                                return (
                                    <td key={index}>
                                        {menuItems.length > 0 ? (
                                            <ul>
                                                {menuItems.map((menuItem, itemIndex) => (
                                                    <li key={`${menuItem.foodName}-${day}-${itemIndex}`}>{menuItem.foodName}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            "Không có dữ liệu"
                                        )}
                                    </td>
                                );
                            })}
                        </tr>

                        {/* Bữa Chiều */}
                        <tr>
                            <td className="sticky-col"><strong>Bữa Chiều</strong></td>
                            {daysOfWeek.map((day, index) => {
                                const menuItems = menuData[ageGroup].filter(menu => menu.mealCode === "BC" && this.mapDayToVietnamese(menu.dayOfWeek) === day);
                                return (
                                    <td key={index}>
                                        {menuItems.length > 0 ? (
                                            <ul>
                                                {menuItems.map((menuItem, itemIndex) => (
                                                    <li key={`${menuItem.foodName}-${day}-${itemIndex}`}>{menuItem.foodName}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            "Không có dữ liệu"
                                        )}
                                    </td>
                                );
                            })}
                        </tr>

                        {/* Chọn trạng thái và nút cập nhật */}
                        {menuData[ageGroup]?.length > 0 && (
                            <tr>
                                <td colSpan={daysOfWeek.length + 1} className="text-center">
                                    <div className="status-selector">
                                        <label className="status-label">
                                            Chọn trạng thái:
                                            <select
                                                value={selectedStatus}
                                                onChange={this.handleStatusChange(ageGroup)}
                                                className="status-dropdown"
                                            >
                                                <option value={0}>Không hoạt động</option>
                                                <option value={1}>Hoạt động</option>
                                            </select>
                                        </label>
                                        <button
                                            onClick={() => this.updateMenuStatus(ageGroup === "0-3" ? 1 : 2)}
                                            className="update-status-button"
                                        >
                                            Cập nhật trạng thái thực đơn khối {ageGroup === "0-3" ? "0-3" : "3-6"}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    mapDayToVietnamese = (day) => {
        const dayMap = {
            Monday: "Thứ 2",
            Tuesday: "Thứ 3",
            Wednesday: "Thứ 4",
            Thursday: "Thứ 5",
            Friday: "Thứ 6",
            Saturday: "Thứ 7",
            Sunday: "Chủ nhật",
        };
        return dayMap[day] || day;
    };

    render() {
        const { selectedWeek, showCalendar } = this.state;

        return (
            <div className="container-fluid">
                <PageHeader
                    HeaderText="Food Management"
                    Breadcrumb={[
                        { name: "Food Management", navigate: "" },
                        { name: "View Menu", navigate: "" },
                    ]}
                />
                <div className="row">
                    <div className="col-lg-12 col-md-12">
                        <h2>Thực Đơn</h2>

                        <div className="row align-items-center justify-content-between mb-3">
                            <div className="week-selector col-lg-3" onClick={this.toggleCalendar}>
                                Tuần được chọn: {selectedWeek.startOfWeek.toLocaleDateString("vi-VN")} - {selectedWeek.endOfWeek.toLocaleDateString("vi-VN")}
                            </div>
                        </div>

                        {showCalendar && (
                            <div className="calendar-dropdown">
                                <Calendar onChange={this.handleWeekSelect} value={selectedWeek.startOfWeek} locale="en-EN" showWeekNumbers={true} />
                            </div>
                        )}

                        <h4 className="menu-title">Tất cả: 0-3</h4>
                        <div className="table-container">{this.renderTable("0-3")}</div>

                        <h4 className="menu-title">Tất cả: 3-6</h4>
                        <div className="table-container">{this.renderTable("3-6")}</div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(ListMenu);
