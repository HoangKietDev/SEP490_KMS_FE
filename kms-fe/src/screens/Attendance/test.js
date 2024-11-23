import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import CSS của DatePicker
import axios from "axios";
import './Checkin.css'; // Import CSS cho hiệu ứng nút

class Test extends React.Component {
    state = {
        studentDataCheckin: [],
        studentDataCheckout: [],
        teacherName: "",
        attendanceDataCheckin: {},
        attendanceDataCheckout: {},
        attendanceDetailsCheckin: [],
        attendanceDetailsCheckout: [],
        serviceData: [],
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

    };


    componentDidMount() {
        // Gọi API CreateDailyCheckin khi trang được tải
        this.createDailyCheckin();

        // Gọi fetchAttendanceData và fetchServiceData để tải dữ liệu khác
        this.fetchAttendanceData();
        this.fetchServiceData();
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
            this.setState({
                imageSrc: window.URL.createObjectURL(file),
            });
        }
    };
    // Hàm để gọi API CreateDailyCheckin
    createDailyCheckin = () => {
        const { classId, selectedDate } = this.state;
        const formattedDate = this.formatDate(selectedDate);

        fetch("http://localhost:5124/api/Attendance/CreateDailyCheckin", {
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
                return response.json();
            })
            .then((data) => {
                console.log("CreateDailyCheckin API called successfully:", data);
            })
            .catch((error) => {
                if (error.message.includes("500")) {
                    console.warn("Ignoring 500 error from CreateDailyCheckin API.");
                } else {
                    console.error("Error calling CreateDailyCheckin API: ", error);
                }
            });
    };







    fetchServiceData = () => {
        axios
            .get("http://localhost:5124/api/Service/GetAllServices")
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

        axios.post("http://localhost:5124/api/Sms/SendSms", body)
            .then((response) => {
                console.log("SMS sent successfully:", response.data);
                alert("Tin nhắn đã được gửi thành công!");
                this.toggleModal(); // Đóng modal sau khi gửi
            })
            .catch((error) => {
                console.error("Error sending SMS:", error);
                alert("Có lỗi xảy ra khi gửi tin nhắn.");
            });
    };

    fetchCheckedServices = (studentId, date) => {
        return axios.get(`http://localhost:5124/api/Service/GetCheckServiceByStudentIdAndDate/${studentId}/${date}`)
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
            axios.get(`http://localhost:5124/api/Children/GetChildrenByChildrenId/${studentId}`)
        );

        Promise.all(studentPromises)
            .then((responses) => {
                const studentData = responses.map(response => response.data);

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

    fetchAttendanceData = () => {
        const { activeTab, selectedDate, classId } = this.state;
        const type = activeTab === "checkin" ? "Checkin" : "Checkout";
        const formattedDate = this.formatDate(selectedDate);
        console.log(type, "loại");

        axios
            .get(`http://localhost:5124/api/Attendance/GetAttendanceByDate?classId=${classId}&type=${type}&date=${formattedDate}`)
            .then((response) => {
                const attendanceData = response.data;
                console.log(attendanceData, "test");
                console.log(attendanceData.length, "test do dai");
                if (attendanceData.length > 0) {
                    const details = attendanceData[0].attendanceDetail;
                    const attendanceMap = {};
                    details.forEach((detail) => {
                        attendanceMap[detail.studentId] = detail.status;
                    });

                    const studentIds = details.map(detail => detail.studentId);
                    console.log(activeTab, "sdadsad");

                    if (activeTab === "checkin") {
                        this.setState({
                            attendanceDataCheckin: attendanceMap,
                            attendanceDetailsCheckin: details,
                            attendanceId: attendanceData[0].attendanceId,
                            createdAt: new Date().toISOString(),
                        }, () => {
                            this.fetchStudentData(studentIds, true);
                        });
                    } else if (activeTab === "checkout") {
                        this.setState({
                            attendanceDataCheckout: attendanceMap,
                            attendanceDetailsCheckout: details,
                            attendanceId: attendanceData[0].attendanceId,
                            createdAt: new Date().toISOString(),
                        }, () => {
                            console.log(this.state.attendanceDetailsCheckout, "sadasdsadsa");

                            this.fetchStudentData(studentIds, false);
                        });

                    }
                } else {
                    // Nếu không có dữ liệu, xóa thông tin cũ
                    if (activeTab === "checkin") {
                        this.setState({ attendanceDetailsCheckin: [], attendanceDataCheckin: {} });
                    } else {
                        this.setState({ attendanceDetailsCheckout: [], attendanceDataCheckout: {} });
                    }
                }
            })
            .catch((error) => {
                console.error("Error fetching attendance data: ", error);
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
        this.setState((prevState) => {
            if (this.state.activeTab === "checkin") {
                return {
                    attendanceDataCheckin: {
                        ...prevState.attendanceDataCheckin,
                        [studentId]: status,
                    },
                };
            } else {
                return {
                    attendanceDataCheckout: {
                        ...prevState.attendanceDataCheckout,
                        [studentId]: status,
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
            axios.get(`http://localhost:5124/api/Service/GetCheckServiceByStudentIdAndDate/${studentId}/${formattedDate}`)
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

                            axios.put("http://localhost:5124/api/Service/UpdateCheckService", body)
                                .then((response) => {
                                    console.log(`Service ${serviceId} status updated to 1 for student ${studentId}:`, response.data);
                                })
                                .catch((error) => {
                                    console.error("Error updating service:", error);
                                    alert(`Có lỗi xảy ra khi cập nhật dịch vụ cho học sinh ID ${studentId}`);
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

                            axios.post("http://localhost:5124/api/Service/AddCheckService", body)
                                .then((response) => {
                                    console.log(`Service ${serviceId} added for student ${studentId}:`, response.data);
                                })
                                .catch((error) => {
                                    console.error("Error adding service:", error);
                                    alert(`Có lỗi xảy ra khi thêm dịch vụ cho học sinh ID ${studentId}`);
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

                            axios.put("http://localhost:5124/api/Service/UpdateCheckService", body)
                                .then((response) => {
                                    console.log(`Service ${serviceId} status updated to 0 for student ${studentId}:`, response.data);
                                })
                                .catch((error) => {
                                    console.error("Error updating service:", error);
                                    alert(`Có lỗi xảy ra khi cập nhật dịch vụ cho học sinh ID ${studentId}`);
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
            `http://localhost:5124/api/Attendance/UpdateAttendance?classId=${classId}&type=${activeTab === "checkin" ? "Checkin" : "Checkout"
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
                alert("Điểm danh đã được cập nhật thành công!");

                // Gọi API CreateDailyCheckout sau khi cập nhật thành công

                fetch("http://localhost:5124/api/Attendance/CreateDailyCheckout", {
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
                alert("Có lỗi xảy ra khi cập nhật điểm danh.");
            });
    };



    // Hàm để gửi tin nhắn khi học sinh vắng mặt
    sendAbsentNotification = (studentId, messageBody) => {
        const body = {
            recipientPhoneNumber: "+84365551401", // Số điện thoại mặc định hoặc cập nhật nếu cần
            body: messageBody,
        };

        axios.post("http://localhost:5124/api/Sms/SendSms", body)
            .then((response) => {
                console.log(`SMS sent for student ${studentId}:`, response.data);
                alert(`Tin nhắn đã được gửi cho học sinh ID ${studentId}`);
            })
            .catch((error) => {
                console.error("Error sending SMS:", error);
                alert(`Có lỗi xảy ra khi gửi tin nhắn cho học sinh ID ${studentId}`);
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
            imageSrc
        } = this.state;

        const isToday = this.formatDate(new Date()) === this.formatDate(selectedDate);

        return (
            <div className="container-fluid">
                <PageHeader
                    HeaderText={`Violet | Check In - Teacher: ${teacherName}`}
                    Breadcrumb={[
                        { name: "Học Thuật", navigate: "" },
                        { name: "Quản Lý Điểm Danh", navigate: "" },
                        { name: "Chi Tiết Điểm Danh", navigate: "" },
                    ]}
                />
                <div className="form-group">
                    <label htmlFor="cameraFileInput">
                        <span className="btn btn-secondary">Open Camera</span>
                        <input
                            id="cameraFileInput"
                            type="file"
                            accept="image/*"
                            capture="environment"
                            style={{ display: 'none' }}
                            ref={this.fileInputRef}
                            onChange={this.handleFileChange}
                        />
                    </label>
                </div>
                <div className="form-group">
                    <label>Chọn Ngày:</label>
                    <DatePicker
                        selected={selectedDate}
                        onChange={this.handleDateChange}
                        dateFormat="yyyy-MM-dd"
                        className="form-control"
                    />
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
                            <li className="nav-item">
                                <a
                                    className={`nav-link ${activeTab === "checkService" ? "active" : ""}`}
                                    onClick={() => this.toggleTab("checkService")}
                                >
                                    Check Service
                                </a>
                            </li>
                        </ul>

                        <div className="table-responsive">
                            {activeTab === "checkin" && (
                                <>
                                    <table className="table table-hover mt-3">
                                        <thead className="thead-light">
                                            <tr>
                                                <th>Tên học sinh</th>
                                                <th>Thông tin khác</th>
                                                <th>Thời gian đến</th>
                                                <th>Người đưa đón</th>
                                                <th>Liên hệ</th>
                                                <th>Điểm danh</th>
                                                <th>Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attendanceDetailsCheckin.length > 0 ? (
                                                studentDataCheckin.map((student, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <img
                                                                    src="https://static.vecteezy.com/system/resources/previews/005/129/844/non_2x/profile-user-icon-isolated-on-white-background-eps10-free-vector.jpg"
                                                                    alt="Profile"
                                                                    className="img-fluid rounded-circle mr-2"
                                                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                                />
                                                                <span>{student.fullName}</span>
                                                            </div>
                                                        </td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>

                                                        <td>
                                                            <button
                                                                className={`btn mr-1 ${attendanceDataCheckin[student.studentId] === "Có" ? "btn-success" : ""}`}
                                                                onClick={() => isToday && this.handleAttendance(student.studentId, "Có")}
                                                                disabled={!isToday}
                                                            >
                                                                Có
                                                            </button>
                                                            <button
                                                                className={`btn mr-1 ${attendanceDataCheckin[student.studentId] === "Muộn" ? "btn-warning" : ""}`}
                                                                onClick={() => isToday && this.handleAttendance(student.studentId, "Muộn")}
                                                                disabled={!isToday}
                                                            >
                                                                Muộn
                                                            </button>
                                                            <button
                                                                className={`btn ${attendanceDataCheckin[student.studentId] === "Vắng" ? "btn-danger" : ""}`}
                                                                onClick={() => isToday && this.handleAttendance(student.studentId, "Vắng")}
                                                                disabled={!isToday}
                                                            >
                                                                Vắng
                                                            </button>
                                                        </td>

                                                        <td className="project-actions">
                                                            <a
                                                                className="btn btn-outline-secondary mr-1"
                                                                onClick={this.handleOpenCamera}
                                                            >
                                                                <i className="icon-camera" ></i>
                                                            </a>

                                                            <a className="btn btn-outline-secondary"
                                                                onClick={this.toggleModal}>
                                                                <i className="icon-speech"></i>
                                                            </a>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="text-center">Không có dữ liệu</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>

                                    <div className="text-right mt-3">
                                        <button className="btn btn-primary" onClick={this.updateAttendance} disabled={!isToday}>
                                            Xác Nhận Điểm Danh
                                        </button>
                                    </div>
                                </>
                            )}
                            {activeTab === "checkout" && (
                                <>
                                    <table className="table table-hover mt-3">
                                        <thead className="thead-light">
                                            <tr>
                                                <th>Tên học sinh</th>
                                                <th>Thông tin khác</th>
                                                <th>Thời gian đến</th>
                                                <th>Người đưa đón</th>
                                                <th>Liên hệ</th>
                                                <th>Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attendanceDetailsCheckout.length > 0 ? (
                                                studentDataCheckout.map((student, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <img
                                                                    src="https://static.vecteezy.com/system/resources/previews/005/129/844/non_2x/profile-user-icon-isolated-on-white-background-eps10-free-vector.jpg"
                                                                    alt="Profile"
                                                                    className="img-fluid rounded-circle mr-2"
                                                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                                    onMouseEnter={(e) =>
                                                                        this.handleMouseEnter(
                                                                            "https://static.vecteezy.com/system/resources/previews/005/129/844/non_2x/profile-user-icon-isolated-on-white-background-eps10-free-vector.jpg",
                                                                            e
                                                                        )
                                                                    }
                                                                    onMouseLeave={this.handleMouseLeave}
                                                                />
                                                                <span>{student.fullName}</span>
                                                            </div>
                                                        </td>
                                                        <td>n/a</td>
                                                        <td>n/a</td>
                                                        <td>n/a</td>
                                                        <td>n/a</td>
                                                        <td>
                                                            <button
                                                                disabled={!isToday}
                                                                className="btn btn-primary mr-1"
                                                                onClick={() => this.handleAttendance(student.studentId, "Đã về")}
                                                            >
                                                                Đã về
                                                            </button>
                                                            <button
                                                                disabled={!isToday}
                                                                className="btn btn-secondary"
                                                                onClick={() => this.handleAttendance(student.studentId, "Chưa về")}
                                                            >
                                                                Chưa về
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="text-center">Không có dữ liệu cho ngày này</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>

                                    <div className="text-right mt-3">
                                        <button className="btn btn-primary" onClick={this.updateAttendance} disabled={!isToday}>
                                            Xác Nhận Điểm Danh
                                        </button>
                                    </div>
                                </>
                            )}


                            {activeTab === "checkService" && (
                                <>
                                    <table className="table table-hover mt-3">
                                        <thead className="thead-light">
                                            <tr>
                                                <th>Tên học sinh</th>
                                                {serviceData.map((service) => (
                                                    <th key={service.serviceId}>{service.serviceName}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentDataCheckin.map((student) => (
                                                <tr key={student.studentId}>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <img
                                                                src="https://static.vecteezy.com/system/resources/previews/005/129/844/non_2x/profile-user-icon-isolated-on-white-background-eps10-free-vector.jpg"
                                                                alt="Profile"
                                                                className="img-fluid rounded-circle mr-2"
                                                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                                onMouseEnter={(e) =>
                                                                    this.handleMouseEnter(
                                                                        "https://static.vecteezy.com/system/resources/previews/005/129/844/non_2x/profile-user-icon-isolated-on-white-background-eps10-free-vector.jpg",
                                                                        e
                                                                    )
                                                                }
                                                                onMouseLeave={this.handleMouseLeave}
                                                            />
                                                            <span>{student.fullName}</span>
                                                        </div>
                                                    </td>
                                                    {serviceData.map((service) => (
                                                        <td key={service.serviceId}>
                                                            <div className="fancy-checkbox d-inline-block">
                                                                <label>
                                                                    <input
                                                                        type="checkbox"
                                                                        name="checkbox"
                                                                        checked={selectedServices[student.studentId]?.includes(service.serviceId) || false}
                                                                        onChange={() => this.handleServiceSelection(student.studentId, service.serviceId)}
                                                                        disabled={!isToday} // Vô hiệu hóa nếu không phải ngày hôm nay
                                                                    />

                                                                    <span></span>
                                                                </label>
                                                            </div>
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="text-right mt-3">
                                        <button disabled={!isToday} className="btn btn-primary" onClick={this.handleConfirmService}>
                                            Xác Nhận Dịch Vụ
                                        </button>
                                    </div>
                                </>
                            )}



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


                {/* {capturedImage && (
          <div style={{ marginTop: '20px' }}>
            <h4>Ảnh đã chụp:</h4>
            <img src={capturedImage} alt="Captured" style={{ width: '100%', maxWidth: '640px' }} />
          </div>
        )} */}

                {imageSrc && (
                    <div style={{ marginTop: '20px' }}>
                        <h4>Ảnh đã chụp:</h4>
                        <img src={imageSrc} alt="Captured" style={{ width: '100%', maxWidth: '640px' }} />
                    </div>
                )}

            </div>
        );
    }
}

export default connect()(withRouter(Test));

