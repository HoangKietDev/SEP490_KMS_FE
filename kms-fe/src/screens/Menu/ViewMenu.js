import React from "react";
import { withRouter } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./ViewMenu.css";
import PageHeader from "../../components/PageHeader";
import axios from "axios";
import Notification from "../../components/Notification";

class ViewMenu extends React.Component {
  state = {
    selectedWeek: {
      startOfWeek: new Date(),
      endOfWeek: new Date(),
    },
    menus: [], // Lưu các menus lấy từ API Menu
    daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    showCalendar: false,
    selectedFile: null,
    showNotification: false,
    notificationText: "",
    notificationType: "success"
  };

  async componentDidMount() {
    const { startOfWeek, endOfWeek } = this.getWeekRange(new Date());
    this.setState({ selectedWeek: { startOfWeek, endOfWeek } }, async () => {
      await this.fetchMenuData(startOfWeek, endOfWeek);
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

  handleSubmitToPrin = (menuID) => {
    const { startOfWeek, endOfWeek } = this.state.selectedWeek;

    const data = {
      menuID: menuID,
      startDate: startOfWeek.toISOString().split('T')[0], // Convert to YYYY-MM-DD
      endDate: endOfWeek.toISOString().split('T')[0],     // Convert to YYYY-MM-DD
      status: 1
    };
    console.log(data, "test dataaaaa");

    // Call the API to update status
    axios.put(`${process.env.REACT_APP_API_URL}/api/Menu/UpdateMenuStatus`, data)
      .then(response => {
        // Handle successful response (e.g., show notification)
        this.setState({
          showNotification: true,
          notificationText: 'Status updated successfully!',
          notificationType: 'success'
        });
        this.fetchMenuData(data.startDate, data.endDate);
      })
      .catch(error => {
        // Handle error response
        this.setState({
          showNotification: true,
          notificationText: 'Error updating status.',
          notificationType: 'error'
        });
      });
  }

  handleWeekSelect = (date) => {
    const { startOfWeek, endOfWeek } = this.getWeekRange(date);
    console.log(startOfWeek, "test date");

    this.setState({ selectedWeek: { startOfWeek, endOfWeek }, showCalendar: false }, async () => {
      await this.fetchMenuData(this.formatDate(startOfWeek), this.formatDate(endOfWeek));
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

  fetchMenuData = async (startOfWeek, endOfWeek) => {
    const startDate = this.formatDate(startOfWeek);
    const endDate = this.formatDate(endOfWeek);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/Menu/GetMenuByDate?startDate=${startDate}&endDate=${endDate}`);
      const data = await response.json();
      console.log(data, "sdsdsd");

      this.setState({
        menus: data || []
      });
    } catch (error) {
      console.error("Error fetching menu data:", error);
    }
  };

  handleUpdate = (menuID) => {
    const { selectedWeek } = this.state;
    const startDate = this.formatDate(selectedWeek.startOfWeek);
    const endDate = this.formatDate(selectedWeek.endOfWeek);

    this.props.history.push({
      pathname: "/updatemenu",
      state: {
        menuID: menuID,
        startDate: startDate,
        endDate: endDate,
      },
    });
  };

  handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/assets/excel/MenuSample.xlsx';
    link.download = 'menusample.xlsx';
    link.click();
  };

  handleFileChange = (event) => {
    this.setState({ selectedFile: event.target.files[0] });
  };

  handleUpload = async () => {
    const { selectedFile, selectedWeek } = this.state;
  
    // Kiểm tra nếu không có tệp được chọn
    if (!selectedFile) {
      this.setState({
        notificationText: "Please select a file first!",
        notificationType: "error",
        showNotification: true,
      });
      return;
    }
  
    const formData = new FormData();
    formData.append("file", selectedFile);
  
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/Menu/ImportMenuExcel`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      // Kiểm tra mã trạng thái HTTP để xem có phải 200 không
      if (response.status !== 200) {
        // Nếu không phải mã 200, hiển thị thông báo lỗi
        this.setState({
          notificationText: response.data.message || "Error uploading file.",
          notificationType: "error",
          showNotification: true,
        });
        return; // Dừng xử lý tiếp theo nếu có lỗi
      }
  
      // Nếu upload thành công, thông báo thành công
      this.setState({
        notificationText: "File uploaded successfully!",
        notificationType: "success",
        showNotification: true,
      });
  
      // Sau khi upload thành công, fetch lại dữ liệu:
      this.fetchMenuData(selectedWeek.startOfWeek, selectedWeek.endOfWeek);
  
    } catch (error) {
      console.error("Error uploading file:", error);
  
      // Kiểm tra nếu có lỗi từ API (khi có mã trạng thái khác 200)
      if (error.response && error.response.data && error.response.data.message) {
        this.setState({
          notificationText: error.response.data.message, // Hiển thị thông báo lỗi từ phản hồi API
          notificationType: "error",
          showNotification: true,
        });
      } else {
        // Nếu không có thông báo lỗi rõ ràng từ API, hiển thị lỗi chung
        this.setState({
          notificationText: "Error uploading file.",
          notificationType: "error",
          showNotification: true,
        });
      }
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

  renderTable = (menu) => {
    const { daysOfWeek } = this.state;
    const { menuID, menuDetails, status } = menu;

    return (
      <div className="table-wrapper" key={menuID}>
        <p><strong>Status:</strong> {status === 0 ? (
          <span className="badge badge-default">Draft</span> // Thêm màu cho trạng thái Draft
        ) : status === 1 ? (
          <span className="badge badge-warning">Pending</span> // Thêm màu cho trạng thái Pending
        ) : status === 2 ? (
          <span className="badge badge-success">Approved</span> // Thêm màu cho trạng thái Approved
        ) : (
          <span className="badge badge-secondary">Unknown</span> // Thêm màu cho trạng thái Unknown
        )}</p>

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
            {/* Breakfast */}
            <tr>
              <td className="sticky-col"><strong>Breakfast</strong></td>
              {daysOfWeek.map((day, index) => {
                const menuItems = menuDetails.filter(menu => menu.mealCode === "BS" && this.mapDayToEnglish(menu.dayOfWeek) === day);
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
            {/* Lunch */}
            <tr>
              <td className="sticky-col"><strong>Lunch</strong></td>
              {daysOfWeek.map((day, index) => {
                const menuItems = menuDetails.filter(menu => menu.mealCode === "BT" && this.mapDayToEnglish(menu.dayOfWeek) === day);
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
                const menuItems = menuDetails.filter(menu => menu.mealCode === "BC" && this.mapDayToEnglish(menu.dayOfWeek) === day);
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

            {status === 0 && ( // Kiểm tra nếu status là 0 (Draft)
              <tr>
                <td className="sticky-col" colSpan={daysOfWeek.length + 1}>
                  <button type="button" onClick={() => this.handleUpdate(menu.menuID)} className="btn btn-primary mr-1">
                    <span>Update Menu</span>
                  </button>
                  <button type="button" onClick={() => this.handleSubmitToPrin(menu.menuID)} className="btn btn-primary mr-1">
                    <span>Submit to Principal</span>
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
      menus
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
              <div className="week-selector col-lg-3" onClick={this.toggleCalendar}>
                Selected week: {selectedWeek.startOfWeek.toLocaleDateString("en-US")} - {selectedWeek.endOfWeek.toLocaleDateString("en-US")}
              </div>

              <div className="upload-section d-flex align-items-center">
                <a
                  onClick={this.handleDownload}
                  className="btn btn-success text-white mr-4"
                >
                  <i className="icon-arrow-down mr-2"></i>Download Template
                </a>
                <input type="file" onChange={this.handleFileChange} className="mr-2" />
                <button onClick={this.handleUpload} className="btn btn-primary">
                  <i className="wi wi-cloud-up"></i> Upload
                </button>
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

            {menus && menus.length > 0 ? (
              menus.map((menu) => (
                <div key={menu.menuID}>
                  <h4 className="menu-title">Grades: {menu.gradeIDs.join(", ")}</h4>
                  <div className="table-container">
                    {this.renderTable(menu)}
                  </div>
                </div>
              ))
            ) : (
              <p>No menus available for this week.</p>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(ViewMenu);
