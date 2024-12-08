// import React from "react";
// import { withRouter } from "react-router-dom";
// import Calendar from "react-calendar";
// import "react-calendar/dist/Calendar.css";
// import "./ViewMenu.css";
// import PageHeader from "../../components/PageHeader";
// import axios from "axios";
// import Notification from "../../components/Notification";
// class ViewMenu extends React.Component {
//   state = {
//     selectedWeek: {
//       startOfWeek: new Date(),
//       endOfWeek: new Date(),
//     },
//     menuData: {
//       "0-3": [],
//       "3-6": [],
//     },
//     daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
//     showCalendar: false,
//     selectedFile: null,
//     showNotification: false, // State to control notification visibility
//     notificationText: "", // Text for the notification
//     notificationType: "success" // Type of notification (success or error)
//   };

//   componentDidMount() {
//     const { startOfWeek, endOfWeek } = this.getWeekRange(new Date());
//     this.setState({ selectedWeek: { startOfWeek, endOfWeek } }, () => {
//       this.fetchMenuData(startOfWeek, endOfWeek); // Fetch menu data
//     });
//   }

//   getWeekRange = (date) => {
//     const startOfWeek = new Date(date);
//     const day = startOfWeek.getDay();
//     const diff = day === 0 ? 6 : day - 1;
//     startOfWeek.setDate(startOfWeek.getDate() - diff);

//     const endOfWeek = new Date(startOfWeek);
//     endOfWeek.setDate(startOfWeek.getDate() + 6);

//     return { startOfWeek, endOfWeek };
//   };

//   handleWeekSelect = (date) => {
//     const { startOfWeek, endOfWeek } = this.getWeekRange(date);
//     this.setState({ selectedWeek: { startOfWeek, endOfWeek }, showCalendar: false }, () => {
//       this.fetchMenuData(startOfWeek, endOfWeek);
//     });
//   };

//   formatDate = (date) => {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     return `${year}-${month}-${day}`;
//   };

//   fetchMenuData = async (startOfWeek, endOfWeek) => {
//     const startDate = this.formatDate(startOfWeek);
//     const endDate = this.formatDate(endOfWeek);

//     try {
//       const response1 = await fetch(`${process.env.REACT_APP_API_URL}/api/Menu/GetMenuByDate?startDate=${startDate}&endDate=${endDate}&gradeId=1`);
//       const response2 = await fetch(`${process.env.REACT_APP_API_URL}/api/Menu/GetMenuByDate?startDate=${startDate}&endDate=${endDate}&gradeId=2`);

//       const menuData1 = await response1.json();
//       const menuData2 = await response2.json();

//       this.setState({
//         menuData: {
//           "0-3": menuData1[0]?.menuDetails || [],
//           "3-6": menuData2[0]?.menuDetails || [],
//         },
//       });
//     } catch (error) {
//       console.error("Error fetching menu data:", error);
//     }
//   };

//   handleUpdate = (ageGroup) => {
//     const { selectedWeek } = this.state;
//     const startDate = this.formatDate(selectedWeek.startOfWeek);
//     const endDate = this.formatDate(selectedWeek.endOfWeek);
//     const gradeId = ageGroup === "0-3" ? 1 : 2;

//     // Navigate to `/updatemenu` with gradeId, startDate, and endDate parameters
//     this.props.history.push({
//       pathname: "/updatemenu",
//       state: {
//         gradeId: gradeId,
//         startDate: startDate,
//         endDate: endDate,
//       },
//     });
//   };
//   handleDownload = () => {
//     const link = document.createElement('a'); // Tạo thẻ a
//     link.href = '/assets/excel/MenuSample.xlsx';  // Đường dẫn đến file Excel
//     link.download = 'menusample.xlsx';             // Tên file khi tải về
//     link.click();                             // Kích hoạt sự kiện click để tải file
//   };

//   handleFileChange = (event) => {
//     this.setState({ selectedFile: event.target.files[0] });
//   };

//   handleUpload = async () => {
//     const { selectedFile } = this.state;
//     if (!selectedFile) {
//       // alert("Please select a file first!");
//       this.setState({
//         notificationText: "Please select a file first!",
//         notificationType: "error",
//         showNotification: true
//       });  
//       return;
//     }

//     const formData = new FormData();
//     formData.append("file", selectedFile);

//     try {
//       const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/Menu/ImportMenuExcel`, formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });
//       // alert("File uploaded successfully!");
//       this.setState({
//         notificationText: "File uploaded successfully!",
//         notificationType: "success",
//         showNotification: true
//       }); 
//       this.fetchMenuData(new Date());
//     } catch (error) {
//       console.error("Error uploading file:", error);
//       // alert("Error uploading file.");
//       this.setState({
//         notificationText: "Error uploading file.",
//         notificationType: "success",
//         showNotification: true
//       }); 
//     }
//   };

//   toggleCalendar = () => {
//     this.setState((prevState) => ({ showCalendar: !prevState.showCalendar }));
//   };

//   renderTable = (ageGroup) => {
//     const { menuData, daysOfWeek } = this.state;

//     return (
//       <div className="table-wrapper">
//         <table className="custom-table table table-bordered">
//           <thead className="thead-light">
//             <tr>
//               <th></th>
//               {daysOfWeek.map((day, index) => (
//                 <th key={index}>{day}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             <tr>
//               <td className="sticky-col"><strong>Breakfast</strong></td>
//               {daysOfWeek.map((day, index) => {
//                 const menuItems = menuData[ageGroup].filter(menu => menu.mealCode === "BS" && this.mapDayToEnglish(menu.dayOfWeek) === day);
//                 return (
//                   <td key={index}>
//                     {menuItems.length > 0 ? (
//                       <ul>
//                         {menuItems.map((menuItem, itemIndex) => (
//                           <li key={`${menuItem.foodName}-${day}-${itemIndex}`}>{menuItem.foodName}</li>
//                         ))}
//                       </ul>
//                     ) : (
//                       "No data available"
//                     )}
//                   </td>
//                 );
//               })}
//             </tr>
//             <tr>
//               <td className="sticky-col"><strong>Lunch</strong></td>
//               {daysOfWeek.map((day, index) => {
//                 const menuItems = menuData[ageGroup].filter(menu => menu.mealCode === "BT" && this.mapDayToEnglish(menu.dayOfWeek) === day);
//                 return (
//                   <td key={index}>
//                     {menuItems.length > 0 ? (
//                       <ul>
//                         {menuItems.map((menuItem, itemIndex) => (
//                           <li key={`${menuItem.foodName}-${day}-${itemIndex}`}>{menuItem.foodName}</li>
//                         ))}
//                       </ul>
//                     ) : (
//                       "No data available"
//                     )}
//                   </td>
//                 );
//               })}
//             </tr>
//             <tr>
//               <td className="sticky-col"><strong>Snack</strong></td>
//               {daysOfWeek.map((day, index) => {
//                 const menuItems = menuData[ageGroup].filter(menu => menu.mealCode === "BC" && this.mapDayToEnglish(menu.dayOfWeek) === day);
//                 return (
//                   <td key={index}>
//                     {menuItems.length > 0 ? (
//                       <ul>
//                         {menuItems.map((menuItem, itemIndex) => (
//                           <li key={`${menuItem.foodName}-${day}-${itemIndex}`}>{menuItem.foodName}</li>
//                         ))}
//                       </ul>
//                     ) : (
//                       "No data available"
//                     )}
//                   </td>
//                 );
//               })}
//             </tr>
//             <tr>
//               <td className="sticky-col" colSpan={daysOfWeek.length + 1}>
//                 <button type="button" onClick={() => this.handleUpdate(ageGroup)} className="btn btn-primary mr-1">
//                   <span>Update {ageGroup === "0-3" ? "0-3" : "3-6"}</span>
//                 </button>
//               </td>
//             </tr>
//           </tbody>
//         </table>
//       </div>
//     );
//   };

//   mapDayToEnglish = (day) => {
//     const dayMap = {
//       Monday: "Monday",
//       Tuesday: "Tuesday",
//       Wednesday: "Wednesday",
//       Thursday: "Thursday",
//       Friday: "Friday",
//       Saturday: "Saturday",
//       Sunday: "Sunday",
//     };
//     return dayMap[day] || day;
//   };

//   render() {
//     const { selectedWeek, showCalendar, showNotification, // State to control notification visibility
//       notificationText, // Text for the notification
//       notificationType } = this.state;

//     return (
//       <div className="container-fluid">
//         <PageHeader
//           HeaderText="Food Management"
//           Breadcrumb={[
//             { name: "Food Management", navigate: "" },
//             { name: "View Menu", navigate: "" },
//           ]}
//         />
//         {showNotification && (
//               <Notification
//                 type={notificationType}
//                 position="top-right"
//                 dialogText={notificationText}
//                 show={showNotification}
//                 onClose={() => this.setState({ showNotification: false })}
//               />
//             )}
//         <div className="row">
//           <div className="col-lg-12 col-md-12">
//             <h2>Menu</h2>

//             <div className="row align-items-center justify-content-between mb-3">
//               <div className="week-selector col-lg-3" onClick={this.toggleCalendar}>
//                 Selected week: {selectedWeek.startOfWeek.toLocaleDateString("en-US")} - {selectedWeek.endOfWeek.toLocaleDateString("en-US")}
//               </div>
//               <div>

//               </div>

//               <div className="upload-section d-flex align-items-center">
//                 <a
//                   onClick={() => {
//                     this.handleDownload()
//                   }}
//                   className="btn btn-success text-white mr-4"
//                 >
//                   <i className="icon-arrow-down mr-2"></i>Dowload Template
//                 </a>
//                 <input type="file" onChange={this.handleFileChange} className="mr-2" />
//                 <button onClick={this.handleUpload}> <i className="wi wi-cloud-up">Upload</i></button>
//               </div>
//             </div>

//             {showCalendar && (
//               <div className="calendar-dropdown">
//                 <Calendar
//                   onChange={this.handleWeekSelect}
//                   value={selectedWeek.startOfWeek}
//                   locale="en-US"
//                   showWeekNumbers={true}
//                 />
//               </div>
//             )}

//             <h4 className="menu-title">All: 0-3</h4>
//             <div className="table-container">{this.renderTable("0-3")}</div>

//             <h4 className="menu-title">All: 3-6</h4>
//             <div className="table-container">{this.renderTable("3-6")}</div>
//           </div>
//         </div>
//       </div>
//     );
//   }
// }

// export default withRouter(ViewMenu);
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
    menus: [],     // Lưu các menus lấy từ API Menu
    grades: [],    // Lưu các grade lấy từ API Grade
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
      await this.fetchGrades(); // Lấy danh sách grade
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
      startDate: startOfWeek.toISOString().split('T')[0],  // Convert to YYYY-MM-DD
      endDate: endOfWeek.toISOString().split('T')[0],      // Convert to YYYY-MM-DD
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
    this.setState({ selectedWeek: { startOfWeek, endOfWeek }, showCalendar: false }, async () => {
      await this.fetchMenuData(startOfWeek, endOfWeek);
      // Sau khi đổi tuần, cũng gọi lại fetchGrades() nếu cần (thực tế grades không đổi theo tuần)
      // nhưng nếu grade là cố định, có thể bỏ qua:
      // await this.fetchGrades();
    });
  };


  formatDate = (date) => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    return date.toISOString().split('T')[0];
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

  fetchGrades = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/Grade`);
      const gradesData = await response.json();
      this.setState({ grades: gradesData || [] });
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };

  handleUpdate = (gradeId) => {
    const { selectedWeek } = this.state;
    const startDate = this.formatDate(selectedWeek.startOfWeek);
    const endDate = this.formatDate(selectedWeek.endOfWeek);

    this.props.history.push({
      pathname: "/updatemenu",
      state: {
        gradeId: gradeId,
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
      // Sau khi upload thành công, fetch lại dữ liệu:
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

  renderTable = (menuID, gradeId, menuDetails, status) => {
    const { daysOfWeek } = this.state;

    return (
      <div className="table-wrapper">
        <table className="custom-table table table-bordered">
          <thead className="thead-light">
            <tr>
              <th></th>
              {daysOfWeek.map((day, index) => (
                <th key={index}>{day}</th>
              ))}
              <th className="text-center">Status</th> {/* Thêm cột Status */}
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
              <td rowSpan={3} className="text-center align-middle">
                {status === 0 ? (
                  <span className="badge badge-default">Draft</span> // Thêm màu cho trạng thái Draft
                ) : status === 1 ? (
                  <span className="badge badge-warning">Pending</span> // Thêm màu cho trạng thái Pending
                ) : status === 2 ? (
                  <span className="badge badge-success">Approved</span> // Thêm màu cho trạng thái Approved
                ) : (
                  <span className="badge badge-secondary">Unknown</span> // Thêm màu cho trạng thái Unknown
                )}
              </td>

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

            <tr>
              {status === 0 && ( // Kiểm tra nếu status là 0 (Draft)
                <td className="sticky-col" colSpan={daysOfWeek.length + 1}>
                  <button type="button" onClick={() => this.handleUpdate(gradeId)} className="btn btn-primary mr-1">
                    <span>Update Grade {gradeId}</span>
                  </button>
                  <button type="button" onClick={() => this.handleSubmitToPrin(menuID)} className="btn btn-primary mr-1">
                    <span>Submit to Principal</span>
                  </button>
                </td>
              )}
            </tr>

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
      menus,
      grades
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
                <button onClick={this.handleUpload}><i className="wi wi-cloud-up"></i> Upload</button>
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


            {grades && grades.length > 0 ? (
              grades.map((grade) => {
                const gradeId = grade.gradeId;
                // Tìm tất cả menuDetails từ menus mà có chứa gradeId này
                const combinedMenuDetails = menus
                  ?.filter(m => m.gradeIDs?.includes(gradeId))  // Lọc menu có gradeID này
                  ?.flatMap(m => m.menuDetails);  // Kết hợp tất cả menuDetails của các menu có gradeId này

                return (
                  <div key={gradeId}>
                    <h4 className="menu-title">Grade: {grade.name}</h4>
                    <div className="table-container">
                      {menus
                        .filter(m => m.gradeIDs.includes(gradeId))  // Lọc các menus có gradeId này
                        .map((menu) => (
                          <div key={menu.menuID}>
                            {/* Truyền menuID, gradeId và combinedMenuDetails vào renderTable */}
                            {this.renderTable(menu.menuID, gradeId, combinedMenuDetails, menu.status)}
                            {combinedMenuDetails.length === 0 && (
                              <p>No data available</p> // Hiển thị khi không có dữ liệu
                            )}
                          </div>
                        ))
                      }
                      {/* Hiển thị thông báo nếu không có menu nào cho gradeId */}
                      {combinedMenuDetails.length === 0 && (
                        <p>No menus available for this grade.</p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No grades available</p>
            )}

          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(ViewMenu);
