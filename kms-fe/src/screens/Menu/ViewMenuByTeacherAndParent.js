import React from "react";
import { withRouter } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./ViewMenu.css";
import PageHeader from "../../components/PageHeader";
import axios from "axios";

class ViewMenuByTeacherAndParent extends React.Component {
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
        selectedFile: null,
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
        const diff = (day === 0) ? 6 : day - 1;
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
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    fetchMenuData = async (startOfWeek, endOfWeek) => {
        const startDate = this.formatDate(startOfWeek);
        const endDate = this.formatDate(endOfWeek);
        console.log(startDate, endDate);

        try {
            const response1 = await fetch(`http://localhost:5124/api/Menu/GetMenuByDate?startDate=${startDate}&endDate=${endDate}&gradeId=1`);
            const response2 = await fetch(`http://localhost:5124/api/Menu/GetMenuByDate?startDate=${startDate}&endDate=${endDate}&gradeId=2`);

            const menuData1 = await response1.json();
            const menuData2 = await response2.json();

            // Kiểm tra status của menuData1
            if (menuData1.length > 0 && menuData1[0].status === 1) {
                this.setState((prevState) => ({
                    menuData: {
                        ...prevState.menuData,
                        "0-3": menuData1[0]?.menuDetails || [],
                    },
                }));
            } else {
                console.log("Menu khối 0-3 không khả dụng vì status là 0.");
                this.setState((prevState) => ({
                    menuData: {
                        ...prevState.menuData,
                        "0-3": [],
                    },
                }));
            }

            // Kiểm tra status của menuData2
            if (menuData2.length > 0 && menuData2[0].status === 1) {
                this.setState((prevState) => ({
                    menuData: {
                        ...prevState.menuData,
                        "3-6": menuData2[0]?.menuDetails || [],
                    },
                }));
            } else {
                console.log("Menu khối 3-6 không khả dụng vì status là 0.");
                this.setState((prevState) => ({
                    menuData: {
                        ...prevState.menuData,
                        "3-6": [],
                    },
                }));
            }
        } catch (error) {
            console.error("Error fetching menu data:", error);
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

    renderTable = (ageGroup) => {
        const { menuData, daysOfWeek } = this.state;

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
                        <h2>Menu</h2>
                        <div className="row align-items-center justify-content-between mb-3">
                            <div className="week-selector col-lg-3" onClick={this.toggleCalendar}>
                                Tuần được chọn: {selectedWeek.startOfWeek.toLocaleDateString("vi-VN")} - {selectedWeek.endOfWeek.toLocaleDateString("vi-VN")}
                            </div>
                        </div>
                        {showCalendar && (
                            <div className="calendar-dropdown">
                                <Calendar
                                    onChange={this.handleWeekSelect}
                                    value={selectedWeek.startOfWeek}
                                    locale="en-EN"
                                    showWeekNumbers={true}
                                />
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

export default withRouter(ViewMenuByTeacherAndParent);
