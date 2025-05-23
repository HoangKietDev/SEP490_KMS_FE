import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import CSS của DatePicker
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import './Checkin.css'; // Import CSS cho hiệu ứng nút
import Notification from "../../components/Notification";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Pagination from "../../components/Common/Pagination";
import avtprofile from "../../assets/images/profile-default.jpg"
class Checkin extends React.Component {
  state = {
    studentDataCheckin: [],
    studentDataCheckout: [],
    teacherName: "",
    attendanceDataCheckin: {},
    attendanceDataCheckout: {},
    attendanceDetailsCheckin: [],
    attendanceDetailsCheckout: [],
    selectedServices: {},
    attendanceId: 0,
    createdAt: "",
    classId: this.props.match.params.classId,
    activeTab: "checkin",
    selectedDate: new Date(),
    showModal: false,
    recipientPhoneNumber: "+84365551401",
    messageBody: "",
    hoveredImageSrc: null, // Thêm state để lưu ảnh được hover
    hoveredImagePosition: { top: 0, left: 0 }, // Thêm state để lưu vị trí ảnh được hover
    imageSrc: null, // Lưu trữ ảnh đã chụp từ camera
    showImageModal: false, // Thêm state để điều khiển modal
    selectedFile: null, // Lưu file ảnh đã chọn từ camera
    attendanceDetailMap: {}, // Map để lưu trữ attendanceDetailID theo studentId
    isUploading: false, // Thêm state để theo dõi trạng thái upload
    selectedClass: "Tất cả", // Giá trị mặc định để hiển thị toàn bộ danh sách
    studentClassMap: {}, // Đặt giá trị mặc định là một object rỗng
    selectedStudents: [], // Lưu danh sách học sinh đã chọn
    showNotification: false, // State to control notification visibility
    notificationText: "", // Text for the notification
    notificationType: "success", // Type of notification (success or error)
    isModalVisible: false,
    isModalConfirmVisible: false,
    currentPage: 1,
    itemsPerPage: 10,
  };


  componentDidMount() {
    // Gọi API CreateDailyCheckin khi trang được tải
    this.createDailyCheckin();
    // Gọi fetchAttendanceData và fetchServiceData để tải dữ liệu khác
    this.fetchAttendanceData();
  }
  handleMouseEnter = (src, event) => {
    const rect = event.target.getBoundingClientRect();
    this.setState({
      hoveredImageSrc: src,
      hoveredImagePosition: {
        top: rect.top,
        left: rect.right + 10, // Hiển thị ảnh lớn ngay cạnh ảnh nhỏ
      },
    });
  };

  handleMouseLeave = () => {
    this.setState({ hoveredImageSrc: null });
  };
  handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      this.fileInput = event.target;
      this.setState({
        imageSrc: URL.createObjectURL(file),
        selectedFile: file, // Lưu file đã chọn vào state
        showImageModal: true,
      });
    }
  };

  handleShowConfirmModal = () => {
    this.setState({ isModalConfirmVisible: true });
  };

  // Hàm đóng modal
  handleCloseConfirmModal = () => {
    this.setState({ isModalConfirmVisible: false });
  };

  // Hàm xác nhận attendance
  handleConfirmAttendance = () => {
    // Gọi hàm update attendance tại đây (ví dụ: this.updateAttendance())
    this.updateAttendance();

    // Đóng modal sau khi xác nhận
    this.handleCloseConfirmModal();
    // this.fetchAttendanceData();

  };

  closeImageModal = () => {
    this.setState(
      {
        selectedFile: null,
        imageSrc: "",
        showImageModal: false,
      },
      () => {
        // Callback function sẽ được gọi sau khi state đã được cập nhật


      }
    );
  };
  handlePageChange = (pageNumber) => {
    this.setState({ currentPage: pageNumber });
  };
  handleUpload = () => {
    const { selectedFile, imageSrc, activeTab } = this.state;
    if (activeTab === "checkin") {
      if (!selectedFile) {
        const file = this.convertDataURLToFile(imageSrc, 'captured-image.jpg');
        this.setState({ selectedFile: file }, () => this.uploadFile(file));
      } else {
        this.uploadFile(selectedFile);
      }
    }
    else {
      if (!selectedFile) {
        const file = this.convertDataURLToFile(imageSrc, 'captured-image.jpg');
        this.setState({ selectedFile: file }, () => this.uploadFile(file));
      } else {
        this.uploadFileCheckout(selectedFile);
      }
    }

  };

  convertDataURLToFile = (dataUrl, filename) => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };


  uploadFile = (file) => {
    let currentAttendanceDetailID;
    if (!file) {
      this.setState({
        notificationText: "No file selected. Please select an image before uploading.",
        notificationType: "error",
        showNotification: true,
      });
      return;
    }

    // Kiểm tra định dạng file
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      this.setState({
        notificationText: "Invalid file type. Please select a JPEG or PNG image.",
        notificationType: "error",
        showNotification: true,
      });
      return;
    }

    // Kiểm tra kích thước file (giới hạn 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.setState({
        notificationText: "File too large. Please select a file smaller than 5MB.",
        notificationType: "error",
        showNotification: true,
      });
      return;
    }

    // Hiển thị trạng thái đang upload
    this.setState({ isUploading: true });

    const formDataForRecognition = new FormData();
    formDataForRecognition.append("photo", file); // Gửi file để nhận diện

    // Gọi API nhận diện học sinh
    fetch(`${process.env.REACT_APP_API_URL}/api/Luxand/RecognizePerson?collections=student`, {
      method: "POST",
      body: formDataForRecognition,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to recognize person: ${response.statusText}`);
        }
        return response.json();
      })
      .then((recognitionData) => {
        if (recognitionData && recognitionData.length > 0) {
          const recognizedName = recognitionData[0].name;

          const matchedStudent = this.state.studentDataCheckin.find(
            (student) => String(student.studentId) === recognizedName
          );

          if (matchedStudent) {
            this.setState({
              notificationText: `Student ${matchedStudent.fullName} was successfully identified.`,
              notificationType: "success",
              showNotification: true,

            });

            currentAttendanceDetailID = this.getAttendanceDetailIDByStudentID(recognizedName);

            const formDataForUpload = new FormData();
            formDataForUpload.append("attendanceDetailID", currentAttendanceDetailID);
            formDataForUpload.append("images", file);

            return fetch(`${process.env.REACT_APP_API_URL}/api/Attendance/UploadAttendanceImages`, {
              method: "PUT",
              body: formDataForUpload,
            }).then((uploadResponse) => {
              if (!uploadResponse.ok) {
                throw new Error(
                  `Failed to upload image: ${uploadResponse.status} ${uploadResponse.statusText}`
                );
              }
              return uploadResponse.json();
            });
          } else {
            this.setState({
              notificationText: "No suitable students found.",
              notificationType: "error",
              showNotification: true,
            });
            throw new Error("No suitable students found.");
          }
        } else {
          this.setState({
            notificationText: "No matching data found in image.",
            notificationType: "error",
            showNotification: true,
          });
          throw new Error("No matching data found in image.");
        }
      })
      .then((uploadData) => {
        this.setState({
          notificationText: "Image uploaded successfully!",
          notificationType: "success",
          showNotification: true,
        });

        const studentId = this.getStudentIdByAttendanceDetailID(currentAttendanceDetailID);
        if (studentId) {
          this.handleAttendance(studentId, "Attend");
        }

        this.closeImageModal();
      })
      .catch((error) => {
        this.setState({
          notificationText: `Error: ${error.message}`,
          notificationType: "error",
          showNotification: true,
        });
      })
      .finally(() => {
        this.setState({ isUploading: false });

      });
  };

  // handleFetchPickupPersonInfo = (uuid) => {
  //   fetch(`${process.env.REACT_APP_API_URL}/api/PickupPerson/GetPickupPersonInfoByUUI?uuid=${uuid}`)
  //     .then((response) => {
  //       if (!response.ok) {
  //         throw new Error(`Failed to fetch pickup person info: ${response.statusText}`);
  //       }
  //       return response.json();
  //     })
  //     .then((pickupPersonInfo) => {
  //       console.log("Pickup Person Info:", pickupPersonInfo);

  //       // Cập nhật danh sách học sinh và hiển thị modal
  //       this.setState({
  //         studentsInModal: pickupPersonInfo.students,
  //         isModalVisible: true,
  //       });
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching pickup person info:", error);
  //       // alert("Không thể tải thông tin người đón.");
  //       this.setState({
  //         notificationText: "Unable to load pick up information.",
  //         notificationType: "error",
  //         showNotification: true,
  //       });
  //     });
  // };
  // handleFetchPickupPersonInfo = (uuid) => {
  //   fetch(`${process.env.REACT_APP_API_URL}/api/PickupPerson/GetPickupPersonInfoByUUI?uuid=${uuid}`)
  //     .then((response) => {
  //       if (!response.ok) {
  //         throw new Error(`Failed to fetch pickup person info: ${response.statusText}`);
  //       }
  //       return response.json();
  //     })
  //     .then((pickupPersonInfo) => {
  //       console.log("Pickup Person Info:", pickupPersonInfo);

  //       // Lọc danh sách học sinh để chỉ giữ lại các học sinh có studentID trùng với studentID trong attendanceDetailsCheckout
  //       const filteredStudents = pickupPersonInfo.students.filter((pickupStudent) => {
  //         return this.state.attendanceDetailsCheckout.some(
  //           (checkoutDetail) => checkoutDetail.studentId === pickupStudent.studentID
  //         );
  //       });

  //       // Cập nhật danh sách học sinh lọc và hiển thị modal
  //       this.setState({
  //         studentsInModal: filteredStudents,
  //         isModalVisible: true,
  //       });
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching pickup person info:", error);
  //       this.setState({
  //         notificationText: "Unable to load pick up information.",
  //         notificationType: "error",
  //         showNotification: true,
  //       });
  //     });
  // };
  handleFetchPickupPersonInfo = (uuid) => {
    // this.fetchAttendanceData();
    const check = this.state.attendanceDetailsCheckin
    console.log(check, "log test");
    fetch(`${process.env.REACT_APP_API_URL}/api/PickupPerson/GetPickupPersonInfoByUUI?uuid=${uuid}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch pickup person info: ${response.statusText}`);
        }
        return response.json();
      })
      .then((pickupPersonInfo) => {
        console.log("Pickup Person Info:", pickupPersonInfo);

        // Lọc danh sách học sinh theo các điều kiện:
        // 1. Học sinh có mặt tại check-in (trong attendanceDetailsCheckin) và trạng thái là "attend".
        // 2. Học sinh có studentID trùng với studentID trong attendanceDetailsCheckout.
        const filteredStudents = pickupPersonInfo.students.filter((pickupStudent) => {


          const isCheckedInAndAttend = this.state.attendanceDetailsCheckin.some(
            (checkinDetail) => checkinDetail.studentId === pickupStudent.studentID && checkinDetail.status === "Attend"
          );

          const isCheckedOut = this.state.attendanceDetailsCheckout.some(
            (checkoutDetail) => checkoutDetail.studentId === pickupStudent.studentID
          );

          return isCheckedInAndAttend && isCheckedOut; // Chỉ giữ lại học sinh đã check-in với status "attend" và có trong checkout.
        });

        // Cập nhật danh sách học sinh lọc và hiển thị modal
        this.setState({
          studentsInModal: filteredStudents,
          isModalVisible: true,
        });
      })
      .catch((error) => {
        console.error("Error fetching pickup person info:", error);
        this.setState({
          notificationText: "Unable to load pick up information.",
          notificationType: "error",
          showNotification: true,
        });
      });
  };



  renderModal = () => {
    const { studentsInModal, isModalVisible, selectedStudents } = this.state;

    const handleCheckboxChange = (studentId) => {
      this.setState((prevState) => {
        const isSelected = prevState.selectedStudents.includes(studentId);
        return {
          selectedStudents: isSelected
            ? prevState.selectedStudents.filter((id) => id !== studentId)
            : [...prevState.selectedStudents, studentId],
        };
      });
    };

    const handleConfirmCheckout = () => {
      const { selectedStudents, selectedFile } = this.state;

      if (selectedStudents.length === 0) {
        // alert("Bạn chưa chọn học sinh nào.");
        this.setState({
          notificationText: "You have not selected any students yet.",
          notificationType: "error",
          showNotification: true,
        });
        return;
      }

      if (!selectedFile) {
        // alert("Không có ảnh nào được chụp. Vui lòng chụp ảnh trước khi xác nhận.");
        this.setState({
          notificationText: "No photo taken. Please take a photo before confirming.",
          notificationType: "error",
          showNotification: true,
        });
        return;
      }

      selectedStudents.forEach((studentId) => {
        const attendanceDetailID = this.getAttendanceDetailIDByStudentID(studentId);
        console.log(attendanceDetailID, "check id attendance");

        if (attendanceDetailID) {
          // const file = this.convertDataURLToFile(imageSrc, "captured-image.jpg");

          // Gọi API UploadAttendanceImages
          this.uploadCheckoutImage(attendanceDetailID, selectedFile, studentId);
        } else {
          console.error(`Không tìm thấy attendanceDetailID cho học sinh ID: ${studentId}`);
        }
      });

      // Reset danh sách đã chọn và đóng modal
      this.setState({ selectedStudents: [], isModalVisible: false, isUploading: false, showImageModal: false }, () => {
        // alert("Cập nhật trạng thái 'Đã về' và upload ảnh thành công!");
        this.setState({
          notificationText: `Updated status 'Came Back' and uploaded photo successfully!`,
          notificationType: "success",
          showNotification: true,
        });
      });
    };


    return (
      <div className={`modal fade ${isModalVisible ? "show d-block" : "d-none"}`} tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Danh Sách Học Sinh</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => this.setState({ isModalVisible: false })}
              ></button>
            </div>
            <div className="modal-body">
              {studentsInModal && studentsInModal.length > 0 ? (
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Chọn</th>
                      <th>Avatar</th>
                      <th>Mã Học Sinh</th>
                      <th>Họ Tên</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsInModal.map((student) => (
                      <tr key={student.studentID}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.studentID)}
                            onChange={() => handleCheckboxChange(student.studentID)}
                          />
                        </td>
                        <td>
                          <img
                            src={student.avatar || avtprofile}
                            alt="Avatar"
                            className="img-fluid rounded-circle"
                            style={{ width: "50px", height: "50px", objectFit: "cover" }}
                          />
                        </td>
                        <td>{student.code}</td>
                        <td>{student.fullName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Không có học sinh nào được liên kết với người đón này.</p>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmCheckout}
              >
                OK
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => this.setState({ isModalVisible: false })}
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  };

  uploadCheckoutImage = (attendanceDetailID, file, studentID) => {
    if (!file) {
      console.error("File ảnh không tồn tại.");
      return;
    }

    const formData = new FormData();
    formData.append("attendanceDetailID", attendanceDetailID);
    formData.append("images", file);

    fetch(`${process.env.REACT_APP_API_URL}/api/Attendance/UploadAttendanceImages`, {
      method: "PUT",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to upload image for attendanceDetailID: ${attendanceDetailID}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log(`Ảnh đã được upload thành công cho attendanceDetailID: ${attendanceDetailID}`, data);
        this.handleAttendance(studentID, "Came Back");
      })
      .catch((error) => {
        console.error(`Có lỗi xảy ra khi upload ảnh cho attendanceDetailID: ${attendanceDetailID}`, error);
      });
  };


  uploadFileCheckout = (file) => {
    if (!file) {
      this.setState({
        notificationText: "No file selected. Please select an image before uploading.",
        notificationType: "error",
        showNotification: true,
      });
      return;
    }

    // Kiểm tra định dạng file
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      this.setState({
        notificationText: "Invalid file type. Please select a JPEG or PNG image.",
        notificationType: "error",
        showNotification: true,
      });
      return;
    }

    // Kiểm tra kích thước file (giới hạn 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.setState({
        notificationText: "File too large. Please select a file smaller than 5MB.",
        notificationType: "error",
        showNotification: true,
      });
      return;
    }

    // Hiển thị trạng thái đang upload
    this.setState({ isUploading: true });

    const formDataForRecognition = new FormData();
    formDataForRecognition.append("photo", file); // Gửi file để nhận diện

    // Gọi API nhận diện học sinh
    fetch(`${process.env.REACT_APP_API_URL}/api/Luxand/RecognizePerson?collections=Pickupperson`, {
      method: "POST",
      body: formDataForRecognition,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to recognize person: ${response.statusText}`);
        }
        return response.json();
      })
      .then((recognitionData) => {
        console.log("Recognition API response:", recognitionData);

        if (recognitionData && recognitionData.length > 0) {
          const recognizedUUID = recognitionData[0].uuid;
          console.log("Recognized UUID:", recognizedUUID);

          // Gọi hàm để lấy thông tin người đón
          this.handleFetchPickupPersonInfo(recognizedUUID);
        } else {
          this.setState({
            notificationText: "No matching data found in image.",
            notificationType: "error",
            showNotification: true,
          });
          throw new Error("Không tìm thấy dữ liệu phù hợp trong ảnh.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        this.setState({
          notificationText: `Error: ${error.message}`,
          notificationType: "error",
          showNotification: true,
        });
      })
      .finally(() => {
        // Kết thúc trạng thái upload
        this.setState({ isUploading: false });
      });
  };

  getStudentIdByAttendanceDetailID = (attendanceDetailID) => {
    const { attendanceDetailsCheckin } = this.state;
    const detail = attendanceDetailsCheckin.find(detail => detail.attendanceDetailId === attendanceDetailID);
    return detail ? detail.studentId : null;
  };
  getAttendanceDetailIDByStudentID = (studentID) => {
    const { attendanceDetailsCheckin, attendanceDetailsCheckout, activeTab } = this.state;

    // Chọn dữ liệu phù hợp dựa trên tab hiện tại
    const attendanceDetails =
      activeTab === "checkin" ? attendanceDetailsCheckin : attendanceDetailsCheckout;

    // Kiểm tra xem danh sách attendanceDetails có dữ liệu không
    if (!attendanceDetails || attendanceDetails.length === 0) {
      console.error("Danh sách attendanceDetails rỗng hoặc không tồn tại.");
      return null;
    }

    // Sử dụng vòng lặp for để tìm attendanceDetailId
    for (let i = 0; i < attendanceDetails.length; i++) {
      const studentIdFromData = attendanceDetails[i].studentId;

      // Chuyển cả hai về dạng chuỗi trước khi so sánh
      if (String(studentIdFromData) === String(studentID)) {
        return attendanceDetails[i].attendanceDetailId;
      }
    }

    // Nếu không tìm thấy
    console.warn(`Không tìm thấy attendanceDetail cho studentId: ${studentID}`);
    return null;
  };



  // Hàm để gọi API CreateDailyCheckin
  // createDailyCheckin = () => {
  //   const { classId, selectedDate } = this.state;
  //   const formattedDate = this.formatDate(selectedDate);

  //   fetch(`${process.env.REACT_APP_API_URL}/api/Attendance/CreateDailyCheckin`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     // body: JSON.stringify({ classId: classId, date: formattedDate }),
  //   })
  //     .then((response) => {
  //       if (!response.ok) {
  //         if (response.status === 500) {
  //           console.warn("API CreateDailyCheckin returned a 500 error, but it will be ignored.");
  //           return; // Bỏ qua lỗi 500
  //         }
  //         throw new Error("Error calling CreateDailyCheckin API: " + response.statusText);
  //       }
  //       return response.json();
  //     })
  //     .then((data) => {
  //       console.log("CreateDailyCheckin API called successfully:", data);
  //     })
  //     .catch((error) => {
  //       if (error.message.includes("500")) {
  //         console.warn("Ignoring 500 error from CreateDailyCheckin API.");
  //       } else {
  //         console.error("Error calling CreateDailyCheckin API: ", error);
  //       }
  //     });
  // };

  createDailyCheckin = () => {
    const { classId, selectedDate } = this.state;
    const formattedDate = this.formatDate(selectedDate);

    fetch(`${process.env.REACT_APP_API_URL}/api/Attendance/CreateDailyCheckin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ classId: classId, date: formattedDate }),
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 500) {
            console.warn("API CreateDailyCheckin returned a 500 error, but it will be ignored.");
            return; // Bỏ qua lỗi 500
          }
          throw new Error("Error calling CreateDailyCheckin API: " + response.statusText);
        }

        // Nếu phản hồi là chuỗi văn bản (như "Daily check-in created successfully.")
        return response.text(); // Trả về văn bản thay vì JSON
      })
      .then((data) => {
        // Xử lý chuỗi văn bản từ phản hồi
        if (data === "Daily check-in created successfully.") {
          console.log("Daily check-in created successfully.");
          this.setState({
            notificationText: "Daily check-in created successfully.",
            notificationType: "success",
            showNotification: true,
          });

          // Sau khi tạo thành công, có thể gọi componentDidMount để làm mới dữ liệu
          this.componentDidMount();
        } else {
          console.error("Unexpected response:", data);
        }
      })
      .catch((error) => {
        console.error("Error calling CreateDailyCheckin API:", error);
        this.setState({
          notificationText: "Error calling CreateDailyCheckin API",
          notificationType: "error",
          showNotification: true,
        });
      });
  };

  fetchServiceData = () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/Service/GetAllServices`)
      .then((response) => {
        this.setState({ serviceData: response.data });
      })
      .catch((error) => {
        console.error("Error fetching service data: ", error);
      });
  };

  // Hàm để định dạng ngày thành "YYYY-MM-DD"
  formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  toggleModal = () => {
    this.setState((prevState) => ({ showModal: !prevState.showModal }));
  };

  handleSendSms = () => {
    const { recipientPhoneNumber, messageBody } = this.state;
    const body = {
      recipientPhoneNumber: recipientPhoneNumber,
      body: messageBody,
    };

    axios.post(`${process.env.REACT_APP_API_URL}/api/Sms/SendSms`, body)
      .then((response) => {
        console.log("SMS sent successfully:", response.data);
        // alert("Tin nhắn đã được gửi thành công!");
        this.setState({
          notificationText: "Message sent successfully!",
          notificationType: "success",
          showNotification: true,
        });
        this.toggleModal(); // Đóng modal sau khi gửi
      })
      .catch((error) => {
        console.error("Error sending SMS:", error);
        // alert("Có lỗi xảy ra khi gửi tin nhắn.");
        this.setState({
          notificationText: "An error occurred while sending the message.",
          notificationType: "error",
          showNotification: true,
        });
      });
  };

  fetchCheckedServices = (studentId, date) => {
    return axios.get(`${process.env.REACT_APP_API_URL}/api/Service/GetCheckServiceByStudentIdAndDate/${studentId}/${date}`)
      .then((response) => {
        // Lọc chỉ những dịch vụ có status là 1
        const checkedServices = response.data
          .filter(service => service.status === 1)
          .map(service => service.serviceId);
        return checkedServices;
      })
      .catch((error) => {
        console.error(`Error fetching checked services for student ${studentId}:`, error);
        return [];
      });
  };


  fetchStudentData = (studentIds, isCheckin = true) => {
    if (!studentIds.length) {
      return;
    }

    const studentPromises = studentIds.map(studentId =>
      axios.get(`${process.env.REACT_APP_API_URL}/api/Children/GetChildrenByChildrenId/${studentId}`)
    );

    Promise.all(studentPromises)
      .then((responses) => {
        const studentData = responses.map(response => {
          const student = response.data;
          // Gán avatar mặc định nếu avatar là null
          student.avatar =
            student.avatar ||
            avtprofile;
          return student;
        });

        // Lấy các dịch vụ đã được tick cho mỗi học sinh
        const date = this.formatDate(this.state.selectedDate);
        const servicePromises = studentData.map(student =>
          this.fetchCheckedServices(student.studentId, date).then(checkedServices => {
            return { studentId: student.studentId, checkedServices };
          })
        );

        Promise.all(servicePromises).then((serviceResults) => {
          const selectedServices = {};
          serviceResults.forEach(({ studentId, checkedServices }) => {
            selectedServices[studentId] = checkedServices;
          });

          this.setState(
            isCheckin
              ? { studentDataCheckin: studentData, selectedServices }
              : { studentDataCheckout: studentData, selectedServices }
          );
        });
      })
      .catch((error) => {
        console.error("Error fetching student data: ", error);
      });
  };

  fetchParentData = (parentIds) => {
    const parentPromises = parentIds.map((parentId) =>
      axios.get(`${process.env.REACT_APP_API_URL}/api/User/ProfileById/${parentId}`)
    );

    Promise.all(parentPromises)
      .then((responses) => {
        const parentData = responses.reduce((acc, response) => {
          const parent = response.data;
          acc[parent.userId] = {
            // name: `${parent.firstName || ""} ${parent.lastName || ""}`.trim(),
            name: `${parent.firstname} ${parent.lastName}`.trim(),
            phone: parent.phoneNumber || "Không có",
            avatar: parent.avatar || avtprofile,
          };
          return acc;
        }, {});

        this.setState({ parentData }); // Lưu thông tin phụ huynh vào state
      })
      .catch((error) => {
        console.error("Error fetching parent data:", error);
      });
  };

  fetchAttendanceData = () => {
    const { activeTab, selectedDate } = this.state;
    const type = activeTab === "checkin" ? "checkin" : "checkout";
    const formattedDate = this.formatDate(selectedDate);
    console.log("sieu ngu");

    // Gọi đồng thời cả hai API
    Promise.all([
      axios.get(`${process.env.REACT_APP_API_URL}/api/Attendance/GetAttendanceByTypeAndDate?type=${type}&date=${formattedDate}`),
      axios.get(`${process.env.REACT_APP_API_URL}/api/Children/GetAllChildren`)
    ])
      .then(([attendanceResponse, childrenResponse]) => {
        const attendanceData = attendanceResponse.data;
        console.log(attendanceData, "test luc");

        const childrenData = childrenResponse.data;

        // Lấy tất cả `attendanceDetail` từ tất cả lớp
        const allDetails = attendanceData.flatMap((item) => item.attendanceDetail);

        const attendanceMap = {};
        const attendanceDetailMap = {};
        const studentClassMap = {}; // Map lưu tên lớp theo studentId
        const parentIds = new Set();

        allDetails.forEach((detail) => {
          attendanceMap[detail.studentId] = detail.status;
          attendanceDetailMap[detail.studentId] = detail.attendanceDetailId;

          // Tìm học sinh trong danh sách children
          const student = childrenData.find((child) => child.studentId === detail.studentId);
          if (student) {
            // Lấy danh sách tên lớp của học sinh
            parentIds.add(student.parentId); // Thu thập parentId

            const classNames = student.classes.map((cls) => cls.className).join(", ");
            studentClassMap[detail.studentId] = classNames;
          }
        });
        this.fetchParentData(Array.from(parentIds));

        const studentIds = allDetails.map((detail) => detail.studentId);

        if (activeTab === "checkin") {
          this.setState({
            attendanceDataCheckin: attendanceMap,
            attendanceDetailsCheckin: allDetails,
            attendanceDetailMap, // Lưu map vào state
            studentClassMap, // Lưu map tên lớp vào state
          }, () => {
            this.fetchStudentData(studentIds, true);
          });
        } else {
          this.setState({
            attendanceDataCheckout: attendanceMap,
            attendanceDetailsCheckout: allDetails,
            attendanceDetailMap, // Lưu map vào state
            studentClassMap, // Lưu map tên lớp vào state
          }, () => {
            this.fetchStudentData(studentIds, false);
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching attendance or children data: ", error);
      });
  };





  handleDateChange = (date) => {
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    this.setState({ selectedDate: localDate }, () => {
      this.fetchAttendanceData();

      // Nếu tab hiện tại là checkout, gọi lại fetchAttendanceData để tải dữ liệu mới
      if (this.state.activeTab === "checkout") {
        this.fetchAttendanceData();
      }

      // Gọi lại API check service nếu tab hiện tại là checkService
      if (this.state.activeTab === "checkService") {
        this.fetchCheckedServicesForAllStudents();
      }
    });
  };

  fetchCheckedServicesForAllStudents = () => {
    const date = this.formatDate(this.state.selectedDate);
    const { studentDataCheckin } = this.state;

    const servicePromises = studentDataCheckin.map((student) =>
      this.fetchCheckedServices(student.studentId, date).then((checkedServices) => {
        return { studentId: student.studentId, checkedServices };
      })
    );

    Promise.all(servicePromises).then((serviceResults) => {
      const selectedServices = {};
      serviceResults.forEach(({ studentId, checkedServices }) => {
        selectedServices[studentId] = checkedServices;
      });

      this.setState({ selectedServices });
    });
  };

  handleAttendance = (studentId, status) => {
    // Mặc định status là "Absence" nếu không có giá trị status
    const finalStatus = status || "Absent";

    this.setState((prevState) => {
      if (this.state.activeTab === "checkin") {
        return {
          attendanceDataCheckin: {
            ...prevState.attendanceDataCheckin,
            [studentId]: finalStatus,
          },
        };
      } else {
        return {
          attendanceDataCheckout: {
            ...prevState.attendanceDataCheckout,
            [studentId]: finalStatus,
          },
        };
      }
    });
  };


  handleServiceSelection = (studentId, serviceId) => {
    this.setState((prevState) => {
      const selectedServices = { ...prevState.selectedServices };
      if (!selectedServices[studentId]) {
        selectedServices[studentId] = [];
      }

      if (selectedServices[studentId].includes(serviceId)) {
        selectedServices[studentId] = selectedServices[studentId].filter(id => id !== serviceId);
      } else {
        selectedServices[studentId].push(serviceId);
      }

      return { selectedServices };
    });
  };

  handleConfirmService = () => {
    const { selectedServices, selectedDate, studentDataCheckin } = this.state;
    const formattedDate = this.formatDate(selectedDate);

    studentDataCheckin.forEach((student) => {
      const studentId = student.studentId;

      // Gọi API để lấy các dịch vụ đã có trong DB cho học sinh và ngày hiện tại
      axios.get(`${process.env.REACT_APP_API_URL}/api/Service/GetCheckServiceByStudentIdAndDate/${studentId}/${formattedDate}`)
        .then((response) => {
          const existingServices = response.data.map(service => ({
            serviceId: service.serviceId,
            checkServiceId: service.checkServiceId,
            status: service.status
          }));

          const previouslySelectedServices = existingServices.filter(service => service.status === 1).map(service => service.serviceId);
          const newlySelectedServices = selectedServices[studentId] || [];

          // Dịch vụ mới được tick thêm (chưa có trong DB hoặc có nhưng status là 0)
          const servicesToAdd = newlySelectedServices.filter(serviceId =>
            !previouslySelectedServices.includes(serviceId) &&
            !existingServices.some(service => service.serviceId === serviceId && service.status === 1)
          );

          // Dịch vụ bị bỏ tick (đã có trong DB và cần cập nhật status thành 0)
          const servicesToRemove = previouslySelectedServices.filter(serviceId => !newlySelectedServices.includes(serviceId));

          // Thêm các dịch vụ mới hoặc cập nhật status từ 0 lên 1
          servicesToAdd.forEach((serviceId) => {
            const existingService = existingServices.find(service => service.serviceId === serviceId && service.status === 0);

            if (existingService) {
              // Cập nhật dịch vụ nếu status là 0
              const body = {
                checkServiceId: existingService.checkServiceId,
                serviceId: serviceId,
                date: formattedDate,
                studentId: studentId,
                status: 1, // Trạng thái tick lại
              };

              console.log('Updating service status to 1:', body);

              axios.put(`${process.env.REACT_APP_API_URL}/api/Service/UpdateCheckService`, body)
                .then((response) => {
                  console.log(`Service ${serviceId} status updated to 1 for student ${studentId}:`, response.data);
                })
                .catch((error) => {
                  console.error("Error updating service:", error);
                  // alert(`Có lỗi xảy ra khi cập nhật dịch vụ cho học sinh ID ${studentId}`);
                  this.setState({
                    notificationText: `An error occurred while updating the service for student ID ${studentId}`,
                    notificationType: "error",
                    showNotification: true,
                  });
                });
            } else {
              // Thêm mới nếu chưa có trong DB
              const body = {
                checkServiceId: 0,
                serviceId: serviceId,
                date: formattedDate,
                studentId: studentId,
                status: 1,
              };

              console.log('Adding service:', body);

              axios.post(`${process.env.REACT_APP_API_URL}/api/Service/AddCheckService`, body)
                .then((response) => {
                  console.log(`Service ${serviceId} added for student ${studentId}:`, response.data);
                })
                .catch((error) => {
                  console.error("Error adding service:", error);
                  //alert(`Có lỗi xảy ra khi thêm dịch vụ cho học sinh ID ${studentId}`);
                  this.setState({
                    notificationText: `An error occurred while adding service for student ID ${studentId}`,
                    notificationType: "error",
                    showNotification: true,
                  });
                });
            }
          });

          // Cập nhật các dịch vụ bị bỏ tick
          servicesToRemove.forEach((serviceId) => {
            const serviceToUpdate = existingServices.find(service => service.serviceId === serviceId);
            if (serviceToUpdate) {
              const body = {
                checkServiceId: serviceToUpdate.checkServiceId,
                serviceId: serviceId,
                date: formattedDate,
                studentId: studentId,
                status: 0,
              };

              console.log('Updating service status to 0:', body);

              axios.put(`${process.env.REACT_APP_API_URL}/api/Service/UpdateCheckService`, body)
                .then((response) => {
                  console.log(`Service ${serviceId} status updated to 0 for student ${studentId}:`, response.data);
                })
                .catch((error) => {
                  console.error("Error updating service:", error);
                  //alert(`Có lỗi xảy ra khi cập nhật dịch vụ cho học sinh ID ${studentId}`);
                  this.setState({
                    notificationText: `An error occurred while updating the service for student ID ${studentId}`,
                    notificationType: "error",
                    showNotification: true,
                  });
                });
            }
          });
        })
        .catch((error) => {
          console.error(`Error fetching existing services for student ${studentId}:`, error);
        });
    });
  };




  toggleTab = (tab) => {
    this.setState({ activeTab: tab }, () => {
      if (tab !== "checkService") {
        this.fetchAttendanceData();
      }
    });
  };

  updateEachStudent = (studentId) => {
    const {
      attendanceDataCheckin,
      attendanceDataCheckout,
      attendanceDetailsCheckin,
      attendanceDetailsCheckout,
      classId,
      activeTab,
    } = this.state;

    const attendanceId =
      activeTab === "checkin"
        ? attendanceDetailsCheckin.length > 0
          ? attendanceDetailsCheckin[0].attendanceId
          : 115
        : attendanceDetailsCheckout.length > 0
          ? attendanceDetailsCheckout[0].attendanceId
          : 115;

    const createdAt = new Date().toISOString();
    const attendanceDetail =
      activeTab === "checkin"
        ? attendanceDetailsCheckin.find((d) => d.studentId === studentId)
        : attendanceDetailsCheckout.find((d) => d.studentId === studentId);

    const status =
      activeTab === "checkin" ? attendanceDataCheckin[studentId] : attendanceDataCheckout[studentId];

    const attendanceUpdate = [
      {
        attendanceId: attendanceId,
        type: activeTab === "checkin" ? "Checkin" : "Checkout",
        createdAt: createdAt,
        classId: classId,
        attendanceDetail: [
          {
            attendanceDetailId: attendanceDetail ? attendanceDetail.attendanceDetailId : 0,
            attendanceId: attendanceId,
            studentId: studentId,
            createdAt: createdAt,
            status: status,
          },
        ],
      },
    ];

    const data = JSON.stringify(attendanceUpdate, null, 2);
    console.log(data);

    fetch(
      `${process.env.REACT_APP_API_URL}/api/Attendance/UpdateAttendanceByType?type=${activeTab === "checkin" ? "Checkin" : "Checkout"}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: data,
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Attendance updated successfully:", data);

        // Cập nhật lại attendanceDetailsCheckin hoặc attendanceDetailsCheckout sau khi cập nhật thành công
        if (activeTab === "checkin") {
          const updatedCheckinDetails = attendanceDetailsCheckin.map((detail) =>
            detail.studentId === studentId
              ? { ...detail, status: status } // Cập nhật trạng thái cho học sinh hiện tại
              : detail
          );

          this.setState({
            attendanceDetailsCheckin: updatedCheckinDetails,
            attendanceDataCheckin: {
              ...attendanceDataCheckin,
              [studentId]: status, // Cập nhật trạng thái checkin của học sinh trong attendanceDataCheckin
            },
          });
        }

        if (activeTab === "checkout") {
          const updatedCheckoutDetails = attendanceDetailsCheckout.map((detail) =>
            detail.studentId === studentId
              ? { ...detail, status: status } // Cập nhật trạng thái cho học sinh hiện tại
              : detail
          );

          this.setState({
            attendanceDetailsCheckout: updatedCheckoutDetails,
            attendanceDataCheckout: {
              ...attendanceDataCheckout,
              [studentId]: status, // Cập nhật trạng thái checkout của học sinh trong attendanceDataCheckout
            },
          });
        }

        // Thông báo thành công
        this.setState({
          notificationText: `Attendance for student ${studentId} has been updated successfully!`,
          notificationType: "success",
          showNotification: true,
        });
      })
      .catch((error) => {
        console.error("Error updating attendance: ", error);
        // Thông báo lỗi
        this.setState({
          notificationText: `An error occurred while updating attendance for student ${studentId}.`,
          notificationType: "error",
          showNotification: true,
        });
      });
  };



  // updateAttendance = () => {
  //   const {
  //     attendanceDataCheckin,
  //     attendanceDataCheckout,
  //     attendanceDetailsCheckin,
  //     attendanceDetailsCheckout,
  //     classId,
  //     activeTab,
  //   } = this.state;

  //   const attendanceId =
  //     activeTab === "checkin"
  //       ? attendanceDetailsCheckin.length > 0
  //         ? attendanceDetailsCheckin[0].attendanceId
  //         : 115
  //       : attendanceDetailsCheckout.length > 0
  //       ? attendanceDetailsCheckout[0].attendanceId
  //       : 115;

  //   const createdAt = new Date().toISOString();
  //   const attendanceUpdate = [
  //     {
  //       attendanceId: attendanceId,
  //       type: activeTab === "checkin" ? "Checkin" : "Checkout",
  //       createdAt: createdAt,
  //       classId: classId,
  //       attendanceDetail: Object.keys(
  //         activeTab === "checkin" ? attendanceDataCheckin : attendanceDataCheckout
  //       ).map((studentId) => {
  //         const detail =
  //           activeTab === "checkin"
  //             ? attendanceDetailsCheckin.find((d) => d.studentId === Number(studentId))
  //             : attendanceDetailsCheckout.find((d) => d.studentId === Number(studentId));

  //         return {
  //           attendanceDetailId: detail ? detail.attendanceDetailId : 0,
  //           attendanceId: attendanceId,
  //           studentId: Number(studentId),
  //           createdAt: createdAt,
  //           status: activeTab === "checkin" ? attendanceDataCheckin[studentId] : attendanceDataCheckout[studentId],
  //         };
  //       }),
  //     },
  //   ];

  //   const data = JSON.stringify(attendanceUpdate, null, 2);
  //   console.log(data);

  //   fetch(
  //     `${process.env.REACT_APP_API_URL}/api/Attendance/UpdateAttendanceByType?type=${activeTab === "checkin" ? "Checkin" : "Checkout"
  //     }`,
  //     {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: data,
  //     }
  //   )
  //     .then((response) => {
  //       if (!response.ok) {
  //         throw new Error("Network response was not ok " + response.statusText);
  //       }
  //       return response.json();
  //     })
  //     .then((data) => {
  //       console.log("Attendance updated successfully:", data);

  //       // Sau khi update, cập nhật lại attendanceDetailsCheckin (nếu đang ở tab checkin)
  //       if (activeTab === "checkin") {
  //         // Lọc lại danh sách attendanceDetailsCheckin để phản ánh trạng thái mới
  //         const updatedCheckinDetails = Object.keys(attendanceDataCheckin).map((studentId) => {
  //           const studentStatus = attendanceDataCheckin[studentId];
  //           const existingDetail = attendanceDetailsCheckin.find((d) => d.studentId === Number(studentId));

  //           return {
  //             ...existingDetail,
  //             status: studentStatus, // Cập nhật trạng thái mới
  //           };
  //         });

  //         // Cập nhật lại state với danh sách điểm danh đã được cập nhật
  //         this.setState({
  //           attendanceDetailsCheckin: updatedCheckinDetails,
  //           notificationText: `Điểm danh đã được cập nhật thành công!`,
  //           notificationType: "success",
  //           showNotification: true,
  //         });
  //       }

  //       // Gọi API CreateDailyCheckout sau khi cập nhật thành công
  //       fetch(`${process.env.REACT_APP_API_URL}/api/Attendance/CreateDailyCheckout`, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ classId: classId, date: this.formatDate(this.state.selectedDate) }),
  //       })
  //         .then((response) => {
  //           if (!response.ok) {
  //             if (response.status === 500) {
  //               console.warn("API CreateDailyCheckout returned a 500 error, but it will be ignored.");
  //               return; // Bỏ qua lỗi 500
  //             }
  //             throw new Error("Error calling CreateDailyCheckout API: " + response.statusText);
  //           }
  //           return response.json();
  //         })
  //         .then((checkoutData) => {
  //           console.log("CreateDailyCheckout API called successfully:", checkoutData);
  //         })
  //         .catch((error) => {
  //           if (error.message.includes("500")) {
  //             console.warn("Ignoring 500 error from CreateDailyCheckout API.");
  //           } else {
  //             console.error("Error calling CreateDailyCheckout API: ", error);
  //           }
  //         });
  //     })
  //     .catch((error) => {
  //       console.error("Error updating attendance: ", error);
  //       this.setState({
  //         notificationText: `Có lỗi xảy ra khi cập nhật điểm danh.`,
  //         notificationType: "error",
  //         showNotification: true,
  //       });
  //       this.fetchAttendanceData();
  //     });
  // };




  // Hàm để gửi tin nhắn khi học sinh vắng mặt
  updateAttendance = () => {
    const {
      attendanceDataCheckin,
      attendanceDataCheckout,
      attendanceDetailsCheckin,
      attendanceDetailsCheckout,
      classId,
      activeTab,
    } = this.state;

    const attendanceId =
      activeTab === "checkin"
        ? attendanceDetailsCheckin.length > 0
          ? attendanceDetailsCheckin[0].attendanceId
          : 115
        : attendanceDetailsCheckout.length > 0
          ? attendanceDetailsCheckout[0].attendanceId
          : 115;

    const createdAt = new Date().toISOString();
    const attendanceUpdate = [
      {
        attendanceId: attendanceId,
        type: activeTab === "checkin" ? "Checkin" : "Checkout",
        createdAt: createdAt,
        classId: classId,
        attendanceDetail: Object.keys(
          activeTab === "checkin" ? attendanceDataCheckin : attendanceDataCheckout
        ).map((studentId) => {
          const detail =
            activeTab === "checkin"
              ? attendanceDetailsCheckin.find((d) => d.studentId === Number(studentId))
              : attendanceDetailsCheckout.find((d) => d.studentId === Number(studentId));

          return {
            attendanceDetailId: detail ? detail.attendanceDetailId : 0,
            attendanceId: attendanceId,
            studentId: Number(studentId),
            createdAt: createdAt,
            status: activeTab === "checkin" ? attendanceDataCheckin[studentId] : attendanceDataCheckout[studentId],
          };
        }),
      },
    ];

    const data = JSON.stringify(attendanceUpdate, null, 2);
    console.log(data);

    fetch(
      `${process.env.REACT_APP_API_URL}/api/Attendance/UpdateAttendanceByType?type=${activeTab === "checkin" ? "Checkin" : "Checkout"
      }`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: data,
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Attendance updated successfully:", data);

        // Cập nhật lại attendanceDetailsCheckin (nếu đang ở tab checkin)
        if (activeTab === "checkin") {
          const updatedCheckinDetails = Object.keys(attendanceDataCheckin).map((studentId) => {
            const studentStatus = attendanceDataCheckin[studentId];
            const existingDetail = attendanceDetailsCheckin.find((d) => d.studentId === Number(studentId));

            return {
              ...existingDetail,
              status: studentStatus, // Cập nhật trạng thái mới
            };
          });

          // Cập nhật lại state với danh sách điểm danh checkin đã được cập nhật
          this.setState({
            attendanceDetailsCheckin: updatedCheckinDetails,
          });
        }

        // Cập nhật lại attendanceDetailsCheckout (nếu đang ở tab checkout)
        if (activeTab === "checkout") {
          const updatedCheckoutDetails = Object.keys(attendanceDataCheckout).map((studentId) => {
            const studentStatus = attendanceDataCheckout[studentId];
            const existingDetail = attendanceDetailsCheckout.find((d) => d.studentId === Number(studentId));

            return {
              ...existingDetail,
              status: studentStatus, // Cập nhật trạng thái mới
            };
          });

          // Cập nhật lại state với danh sách điểm danh checkout đã được cập nhật
          this.setState({
            attendanceDetailsCheckout: updatedCheckoutDetails,
          });
        }

        // Thông báo thành công
        this.setState({
          notificationText: `Attendance has been updated successfully!`,
          notificationType: "success",
          showNotification: true,
        });

        // Gọi API CreateDailyCheckout sau khi cập nhật thành công
        fetch(`${process.env.REACT_APP_API_URL}/api/Attendance/CreateDailyCheckout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ classId: classId, date: this.formatDate(this.state.selectedDate) }),
        })
          .then((response) => {
            if (!response.ok) {
              if (response.status === 500) {
                console.warn("API CreateDailyCheckout returned a 500 error, but it will be ignored.");
                return; // Bỏ qua lỗi 500
              }
              throw new Error("Error calling CreateDailyCheckout API: " + response.statusText);
            }
            return response.json();
          })
          .then((checkoutData) => {
            console.log("CreateDailyCheckout API called successfully:", checkoutData);
          })
          .catch((error) => {
            if (error.message.includes("500")) {
              console.warn("Ignoring 500 error from CreateDailyCheckout API.");
            } else {
              console.error("Error calling CreateDailyCheckout API: ", error);
            }
          });
      })
      .catch((error) => {
        console.error("Error updating attendance: ", error);
        this.setState({
          notificationText: `An error occurred while updating attendance.`,
          notificationType: "error",
          showNotification: true,
        });
        this.fetchAttendanceData();
      });
  };

  sendAbsentNotification = (studentId, messageBody) => {
    const body = {
      recipientPhoneNumber: "+84365551401", // Số điện thoại mặc định hoặc cập nhật nếu cần
      body: messageBody,
    };

    axios.post(`${process.env.REACT_APP_API_URL}/api/Sms/SendSms`, body)
      .then((response) => {
        console.log(`SMS sent for student ${studentId}:`, response.data);
        // alert(`Tin nhắn đã được gửi cho học sinh ID ${studentId}`);
        this.setState({
          notificationText: `Message has been sent to student ID ${studentId}`,
          notificationType: "success",
          showNotification: true,
        });
      })
      .catch((error) => {
        console.error("Error sending SMS:", error);
        // alert(`Có lỗi xảy ra khi gửi tin nhắn cho học sinh ID ${studentId}`);

        this.setState({
          notificationText: `An error occurred while sending a message to student ID ${studentId}`,
          notificationType: "error",
          showNotification: true,
        });
      });
  };


  render() {
    const {
      studentDataCheckin,
      studentDataCheckout,
      teacherName,
      attendanceDataCheckin,
      attendanceDataCheckout,
      activeTab,
      selectedDate,
      attendanceDetailsCheckin,
      attendanceDetailsCheckout,
      serviceData,
      selectedServices,
      showModal,
      recipientPhoneNumber,
      messageBody,
      hoveredImageSrc,
      hoveredImagePosition,
      isCameraOpen,
      capturedImage,
      imageSrc,
      showImageModal,
      isUploading,
      notificationType,
      notificationText,
      showNotification,


    } = this.state;

    const isToday = this.formatDate(new Date()) === this.formatDate(selectedDate);
    console.log(attendanceDetailsCheckout, "dsdsds");
    const { currentPage, itemsPerPage } = this.state;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const dataCheckin = studentDataCheckin
      .filter(
        (student) =>
          this.state.selectedClass === "Tất cả" ||
          (this.state.studentClassMap[student.studentId] || "").includes(this.state.selectedClass)
      );
    const dataCheckout = studentDataCheckout
      .filter(
        (student) =>
          attendanceDataCheckin[student.studentId] === "Attend" // Chỉ hiển thị học sinh có trạng thái "Attend"
      )
    const currentItems = dataCheckin.slice(indexOfFirstItem, indexOfLastItem);
    const currentItemscheckout = studentDataCheckout.slice(indexOfFirstItem, indexOfLastItem);
    return (
      <div className="container-fluid">
        <PageHeader
          HeaderText={`Check In - Teacher: ${teacherName}`}
          Breadcrumb={[
            { name: "Academics", navigate: "" },
            { name: "Attendance Management", navigate: "" },
            { name: "Attendance Details", navigate: "" },
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
        <div className="form-group">
          <label>Select Date:</label>
          <DatePicker
            selected={selectedDate}
            onChange={this.handleDateChange}
            dateFormat="yyyy-MM-dd"
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>Select Class:</label>
          <select
            className="form-control"
            value={this.state.selectedClass}
            onChange={(e) => this.setState({ selectedClass: e.target.value })}
          >
            <option value="Tất cả">Tất cả</option>
            {Array.from(new Set(Object.values(this.state.studentClassMap || {}))).map((className, index) => (
              <option key={index} value={className}>
                {className}
              </option>
            ))}
          </select>
        </div>



        <div className="card">
          <div className="body">
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <a
                  className={`nav-link ${activeTab === "checkin" ? "active" : ""}`}
                  onClick={() => this.toggleTab("checkin")}
                >
                  Check In
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${activeTab === "checkout" ? "active" : ""}`}
                  onClick={() => this.toggleTab("checkout")}
                >
                  Check Out
                </a>
              </li>

            </ul>

            <div className="table-responsive">
              {activeTab === "checkin" && (
                <>

                  <label
                    htmlFor="cameraFileInput"
                    className="btn btn-outline-secondary m-2"
                    style={{ cursor: "pointer" }}
                  >
                    <i className="icon-camera"></i> Take Photo
                    <input
                      id="cameraFileInput"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      style={{ display: "none" }}
                      onChange={this.handleFileChange} // Không truyền `studentId` trực tiếp
                      disabled={!isToday}
                    />
                  </label>
                  <table className="table table-hover mt-3">
                    <thead className="thead-light">
                      <tr>
                        <th>Student Name</th>
                        <th>Class</th>
                        <th>Arrival Time</th>
                        <th>Parent</th>
                        <th>Contact</th>
                        <th>Attendance</th>
                        <th>Action</th>
                      </tr>

                    </thead>
                    <tbody>
                      {attendanceDetailsCheckin.length > 0 ? (
                        currentItems
                          .map((student, index) => {
                            const parent = this.state.parentData[student.parentId] || {}; // Lấy thông tin phụ huynh từ state
                            const studentAttendanceDetail = attendanceDetailsCheckin.find(
                              (detail) => detail.studentId === student.studentId
                            );

                            // Định dạng thời gian createdAt nếu có
                            let departureTime = "n/a"; // Mặc định là n/a
                            if (studentAttendanceDetail) {
                              const time = new Date(studentAttendanceDetail.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                              // Kiểm tra nếu thời gian là "12:00 AM" hoặc "00:00"
                              if (time !== "12:00 AM" && time !== "00:00") {
                                departureTime = time;
                              }
                            }
                            return (
                              <tr key={index}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <img
                                      src={student.avatar} // Avatar học sinh
                                      alt="Profile"
                                      className="img-fluid rounded-circle mr-2"
                                      style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                    />
                                    <span>{student.fullName}</span>
                                  </div>
                                </td>
                                <td>{this.state.studentClassMap[student.studentId] || "Math 1"}</td>
                                <td>{departureTime}</td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <img
                                      src={parent.avatar} // Avatar phụ huynh
                                      alt="Parent Avatar"
                                      className="img-fluid rounded-circle mr-2"
                                      style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                    />
                                    <span>{parent.name || "Không có tên"}</span>
                                  </div>
                                </td>
                                <td>{parent.phone || "Không có số"}</td>
                                <td>
                                  <button
                                    className={`btn mr-1 ${attendanceDataCheckin[student.studentId] === "Attend" ? "btn-success" : ""
                                      }`}
                                    onClick={() => isToday && this.handleAttendance(student.studentId, "Attend")}
                                    disabled={!isToday}
                                  >
                                    Attend
                                  </button>
                                  <button
                                    className={`btn ${attendanceDataCheckin[student.studentId] === "Absent" || !attendanceDataCheckin[student.studentId] ? "btn-danger" : ""
                                      }`}
                                    onClick={() => isToday && this.handleAttendance(student.studentId, "Absent")}
                                    disabled={!isToday}
                                  >
                                    Absent
                                  </button>
                                </td>

                                <td className="project-actions">
                                  <label
                                    className="btn btn-outline-secondary mr-1"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => this.updateEachStudent(student.studentId)}
                                  >
                                    <i className="icon-check"></i>
                                  </label>
                                  <label
                                    className="btn btn-outline-secondary mr-1"
                                    style={{ cursor: "pointer" }}
                                    onClick={this.toggleModal}
                                  >
                                    <i className="icon-speech"></i>
                                  </label>
                                </td>
                              </tr>
                            );
                          })
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center">
                            Không có dữ liệu
                          </td>
                        </tr>
                      )}
                    </tbody>

                  </table>

                  <div className="text-right mt-3">
                    <button
                      className="btn btn-primary"
                      onClick={this.handleShowConfirmModal}
                      disabled={!isToday}
                    >
                      Confirm Attendance
                    </button>
                  </div>
                  <div className="pt-4">
                    <Pagination
                      currentPage={currentPage}
                      totalItems={dataCheckin.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={this.handlePageChange}
                    />
                  </div>
                  <div className={`modal fade ${this.state.isModalConfirmVisible ? 'show' : ''}`} id="confirmModal" tabIndex="-1" aria-labelledby="confirmModalLabel" aria-hidden={!this.state.isModalVisible}>
                    <div className="modal-dialog">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title" id="confirmModalLabel">Confirm Attendance</h5>
                          <button type="button" className="close" onClick={this.handleCloseConfirmModal}>
                            <span aria-hidden="true">&times;</span>
                          </button>
                        </div>
                        <div className="modal-body">
                          Are you sure you want to confirm the attendance for today?
                        </div>
                        <div className="modal-footer">
                          <button type="button" className="btn btn-secondary" onClick={this.handleCloseConfirmModal}>
                            Cancel
                          </button>
                          <button type="button" className="btn btn-primary" onClick={this.handleConfirmAttendance}>
                            Confirm
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "checkout" && (
                <>
                  <label
                    htmlFor="cameraFileInput"
                    className="btn btn-outline-secondary m-2"
                    style={{ cursor: "pointer" }}
                  >
                    <i className="icon-camera"></i> Take Photo
                    <input
                      id="cameraFileInput"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      style={{ display: "none" }}
                      onChange={this.handleFileChange} // Không truyền `studentId` trực tiếp
                      disabled={!isToday}
                    />
                  </label>
                  <table className="table table-hover mt-3">
                    <thead className="thead-light">
                      <tr>
                        <th>Student Name</th>
                        <th>Class</th>
                        <th>Departure time</th>
                        <th>Pick-up Person</th>
                        <th>Contact</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>

                    </thead>
                    <tbody>
                      {attendanceDetailsCheckout.length > 0 ? (
                        currentItemscheckout
                          .filter(
                            (student) =>
                              attendanceDataCheckin[student.studentId] === "Attend" // Chỉ hiển thị học sinh có trạng thái "Attend"
                          )
                          .map((student, index) => {
                            const parent = this.state.parentData[student.parentId] || {}; // Lấy thông tin phụ huynh từ state
                            const studentAttendanceDetail = attendanceDetailsCheckout.find(
                              (detail) => detail.studentId === student.studentId
                            );

                            // Định dạng thời gian createdAt nếu có
                            let departureTime = "n/a"; // Mặc định là n/a
                            if (studentAttendanceDetail) {
                              const time = new Date(studentAttendanceDetail.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                              // Kiểm tra nếu thời gian là "12:00 AM" hoặc "00:00"
                              if (time !== "12:00 AM" && time !== "00:00") {
                                departureTime = time;
                              }
                            }

                            return (
                              <tr key={index}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <img
                                      src={student.avatar} // Avatar học sinh
                                      alt="Profile"
                                      className="img-fluid rounded-circle mr-2"
                                      style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                    />
                                    <span>{student.fullName}</span>
                                  </div>
                                </td>
                                <td>{this.state.studentClassMap[student.studentId] || "Không có lớp"}</td>
                                <td>{departureTime}</td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <img
                                      src={parent.avatar} // Avatar phụ huynh
                                      alt="Parent Avatar"
                                      className="img-fluid rounded-circle mr-2"
                                      style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                    />
                                    <span>{parent.name || "Không có tên"}</span>
                                  </div>
                                </td>
                                <td>{parent.phone || "Không có số"}</td>
                                <td>
                                  <button
                                    className={`btn mr-1 ${attendanceDataCheckout[student.studentId] === "Came Back" ? "btn-success" : ""
                                      }`}
                                    onClick={() => isToday && this.handleAttendance(student.studentId, "Came Back")}
                                    disabled={!isToday}
                                  >
                                    Came Back
                                  </button>
                                  <button
                                    className={`btn mr-1 ${attendanceDataCheckout[student.studentId] === "Not Back Yet" || !attendanceDataCheckout[student.studentId] ? "btn-danger" : "" ? "btn-danger" : ""
                                      }`}
                                    onClick={() => isToday && this.handleAttendance(student.studentId, "Not Back Yet")}
                                    disabled={!isToday}
                                  >
                                    Not Back Yet
                                  </button>
                                </td>
                                <td className="project-actions">
                                  <label
                                    className="btn btn-outline-secondary mr-1"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => this.updateEachStudent(student.studentId)}
                                  >
                                    <i className="icon-check"></i>
                                  </label>
                                  <label
                                    className="btn btn-outline-secondary mr-1"
                                    style={{ cursor: "pointer" }}
                                    onClick={this.toggleModal}
                                  >
                                    <i className="icon-speech"></i>
                                  </label>
                                </td>
                              </tr>
                            );
                          })
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center">
                            No data for this day
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>


                  <div className="text-right mt-3">
                    <button className="btn btn-primary" onClick={this.handleShowConfirmModal} disabled={!isToday}>
                      Confirm Attendance
                    </button>
                  </div>
                  <div className="pt-4">
                    <Pagination
                      currentPage={currentPage}
                      totalItems={dataCheckout.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={this.handlePageChange}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className={`modal fade ${this.state.isModalConfirmVisible ? 'show' : ''}`} id="confirmModal" tabIndex="-1" aria-labelledby="confirmModalLabel" aria-hidden={!this.state.isModalVisible}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="confirmModalLabel">Confirm Attendance</h5>
                <button type="button" className="close" onClick={this.handleCloseConfirmModal}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                Are you sure you want to confirm the attendance for today?
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={this.handleCloseConfirmModal}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={this.handleConfirmAttendance}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="modal" tabIndex="-1" role="dialog" style={{ display: showModal ? 'block' : 'none' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Gửi Tin Nhắn</h5>
                <button type="button" className="close" onClick={this.toggleModal}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    className="form-control"
                    value={this.state.recipientPhoneNumber}
                    onChange={(e) => this.setState({ recipientPhoneNumber: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Lời nhắn</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={messageBody}
                    onChange={(e) => this.setState({ messageBody: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={this.toggleModal}>
                  Đóng
                </button>
                <button type="button" className="btn btn-primary" onClick={this.handleSendSms}>
                  Gửi
                </button>
              </div>
            </div>
          </div>

        </div>
        {hoveredImageSrc && (
          <div
            className="hovered-image-container"
            style={{
              position: "absolute",
              top: hoveredImagePosition.top,
              left: hoveredImagePosition.left,
              zIndex: 1000,
              backgroundColor: "#fff",
              borderRadius: "10px",
              padding: "10px",
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.3)",
            }}
          >
            <img
              src={hoveredImageSrc}
              alt="Hovered Profile"
              className="img-fluid"
              style={{
                maxWidth: "150px",
                borderRadius: "10px",
              }}
            />
          </div>
        )}

        {showImageModal && (
          <div className="modal fade show" style={{ display: "block" }} tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-lg" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Ảnh đã chụp</h5>
                  <button type="button" className="close" onClick={this.closeImageModal}>
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body text-center">
                  <img
                    src={this.state.imageSrc}
                    alt="Captured"
                    className="img-fluid"
                    style={{
                      width: "100%",
                      maxWidth: "600px",
                      height: "auto",
                      maxHeight: "400px",
                      objectFit: "contain"
                    }}
                  />
                </div>
                <div className="modal-footer">
                  <button className="btn btn-primary" onClick={this.handleUpload}>
                    Upload
                  </button>
                  <button className="btn btn-secondary" onClick={this.closeImageModal}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {isUploading && (
          <div className="loading-spinner">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        )}
        {this.renderModal()}

      </div>
    );
  }
}

export default connect()(withRouter(Checkin));

