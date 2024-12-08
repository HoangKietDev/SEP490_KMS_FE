import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from 'react-router-dom';
import axios from "axios";
import Notification from "../../components/Notification";
import "bootstrap/dist/css/bootstrap.min.css";

class UpdateClassByPrincipal extends React.Component {
  state = {
    classId: 0,
    className: "",
    isActive: true,
    schoolId: 102,
    semesterId: 0,
    gradeId: 0,
    grades: [],   // Lưu danh sách grade
    semesters: [],  // Lưu danh sách semester
    number: 0,
    status: 0, // Trạng thái ban đầu là 0 (Draft)
    submeet: false,
    teachers: [],  // Danh sách giáo viên đã có lớp
    availableTeachers: [],  // Danh sách giáo viên chưa có lớp
    selectedNewTeacherId: 0,  // Giáo viên mới sẽ được chọn
    showNotification: false, // State to control notification visibility
    notificationText: "", // Text for the notification
    notificationType: "success" // Type of notification (success or error)
  };

  componentDidMount() {
    window.scrollTo(0, 0);
    const { classId } = this.props.match.params;
    this.setState({ classId: parseInt(classId) });

    // Gọi API để lấy thông tin lớp học
    axios.get(`${process.env.REACT_APP_API_URL}/api/Class/GetClassById/${classId}`)
      .then((response) => {
        const data = response.data;
        const formattedExpireDate = data.expireDate ? new Date(data.expireDate).toISOString().slice(0, 16) : "";

        this.setState({
          className: data.className,
          isActive: data.isActive === 1,
          expireDate: formattedExpireDate,
          schoolId: data.schoolId,
          semesterId: data.semesterId,
          gradeId: data.gradeId,
          status: data.status,  // Sử dụng giá trị trả về từ API
          teachers: data.teachers || [],  // Đảm bảo teachers luôn là một mảng

        });
      })
      .catch((error) => {
        console.error("Error fetching class data: ", error);
        alert("Failed to fetch class data. Please try again.");
      });

    // Gọi API lấy danh sách Grade
    axios.get(`${process.env.REACT_APP_API_URL}/api/Grade`)
      .then((response) => {
        this.setState({ grades: response.data });
      })
      .catch((error) => {
        console.error("Error fetching grade data:", error);
      });

    // Gọi API lấy danh sách Semester
    axios.get(`${process.env.REACT_APP_API_URL}/api/Semester/GetAllSemester`)
      .then((response) => {
        this.setState({ semesters: response.data });
      })
      .catch((error) => {
        console.error("Error fetching semester data:", error);
      });
    axios.get(`${process.env.REACT_APP_API_URL}/api/Class/GetTeachersWithoutClass`)
      .then((response) => {
        this.setState({ availableTeachers: response.data });
      })
      .catch((error) => {
        console.error("Error fetching available teachers:", error);
      });
  }

  // Hàm lấy tên grade theo gradeId
  getGradeName = (gradeId) => {
    const grade = this.state.grades.find(g => g.gradeId === gradeId);
    return grade ? grade.name : "Unknown Grade";
  };

  // Hàm lấy tên semester theo semesterId
  getSemesterName = (semesterId) => {
    const semester = this.state.semesters.find(s => s.semesterId === semesterId);
    return semester ? semester.name : "Unknown Semester";
  };
  handleTeacherChange = (teacherId, newTeacherId) => {
    this.setState((prevState) => {
      const updatedTeachers = prevState.teachers.map((teacher) =>
        teacher.teacherId === teacherId ? { ...teacher, selectedNewTeacherId: newTeacherId } : teacher
      );
      return { teachers: updatedTeachers };
    });
  };
  handleRemoveTeacher = (teacherId, e) => {
    e.preventDefault(); // Ngừng hành động mặc định của sự kiện (ngừng submit form)

    const { classId } = this.state;

    // Gọi API xóa giáo viên khỏi lớp
    axios.post(`${process.env.REACT_APP_API_URL}/api/Class/RemoveTeacherFromClass?classId=${classId}&teacherId=${teacherId}`)
      .then((response) => {
        // Cập nhật lại state sau khi xóa thành công
        this.setState((prevState) => {
          const updatedTeachers = prevState.teachers.filter((teacher) => teacher.teacherId !== teacherId);
          return { teachers: updatedTeachers };
        });

        // Thông báo thành công
        this.setState({
          notificationText: "Teacher has been removed successfully!",
          notificationType: "success",
          showNotification: true,
        });
        window.location.reload();

      })
      .catch((error) => {
        console.error("Error removing teacher:", error);
        this.setState({
          notificationText: "Failed to remove teacher. Please try again.",
          notificationType: "error",
          showNotification: true,
        });
      });
  };
  handleAddTeacherrow = () => {
    const { teachers, availableTeachers } = this.state;

    // Thêm một dòng mới vào bảng teachers với selectedNewTeacherId là null
    const newTeacherRow = {
      teacherId: null,  // Giá trị mặc định, bạn có thể để null để người dùng chọn giáo viên mới
      teacherName: "Select a Teacher", // Tên giáo viên có thể đặt là "Select a Teacher" khi chưa có lựa chọn
      selectedNewTeacherId: null  // Giá trị mặc định khi chưa có giáo viên nào được chọn
    };

    this.setState((prevState) => {
      return { teachers: [...prevState.teachers, newTeacherRow] };
    });
  };
  handleTeacherSelectChange = (teacherIndex, newTeacherId) => {
    const { availableTeachers, teachers } = this.state;

    // Cập nhật thông tin của giáo viên được chọn
    const selectedTeacher = availableTeachers.find((teacher) => teacher.teacherId === newTeacherId);

    if (selectedTeacher) {
      // Cập nhật lại dòng giáo viên trong bảng với ID giáo viên mới
      const updatedTeachers = teachers.map((teacher, index) => {
        if (index === teacherIndex) {
          return {
            ...teacher,
            selectedNewTeacherId: newTeacherId,
            teacherName: selectedTeacher.teacherName,  // Cập nhật tên giáo viên
          };
        }
        return teacher;
      });

      this.setState({ teachers: updatedTeachers });
    }
  };
  handleRemoveTeacherRow = (teacherIndex, e) => {
    e.preventDefault();

    // Xóa giáo viên khỏi bảng teachers theo chỉ mục
    this.setState((prevState) => {
      const updatedTeachers = prevState.teachers.filter((_, index) => index !== teacherIndex);
      return { teachers: updatedTeachers };
    });
  };


  // Cập nhật giáo viên theo API
  updateTeachersInClass = (classId, teachers) => {
    teachers.forEach((teacher) => {
      if (teacher.selectedNewTeacherId && teacher.selectedNewTeacherId !== teacher.teacherId) {
        // Gửi yêu cầu API cho mỗi giáo viên được thay đổi
        axios.put(`${process.env.REACT_APP_API_URL}/api/Class/UpdateTeacherToClass/${classId}/${teacher.teacherId}/${teacher.selectedNewTeacherId}`)
          .then((response) => {
            console.log(`Teacher ${teacher.teacherName} updated successfully.`);
          })
          .catch((error) => {
            console.error("Error updating teacher:", error);
          });
      }
    });
  };
  handleSubmit = (e) => {
    e.preventDefault();

    const { classId, className, number, isActive, schoolId, semesterId, gradeId, status, teachers } = this.state;

    // Kiểm tra nếu có bất kỳ thay đổi nào về giáo viên
    const teachersToUpdate = teachers.filter(
      (teacher) => teacher.selectedNewTeacherId && teacher.selectedNewTeacherId !== teacher.teacherId
    );

    // Cập nhật thông tin lớp học nếu có thay đổi
    const updatedClassData = {
      classId,
      className,
      number: number,
      isActive: 1,
      schoolId,
      semesterId,
      gradeId,
      status
    };

    // Gọi API UpdateClass để cập nhật thông tin lớp học
    const updateClass = async () => {
      try {
        const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/Class/UpdateClass`, updatedClassData);

        if (response.status === 200) {
          console.log("Class updated successfully");
          this.setState({
            notificationText: "Class has been updated successfully!",
            notificationType: "success",
            showNotification: true
          });

          // Nếu có thay đổi về giáo viên, cập nhật giáo viên
          if (teachersToUpdate.length > 0) {
            this.updateTeachersInClass(classId, teachersToUpdate);
          }

          // Chuyển hướng sau khi cập nhật lớp và giáo viên
          setTimeout(() => {
            this.props.history.push('/viewclass');
          }, 1000);
        }
      } catch (error) {
        console.error("Error updating class: ", error);
        this.setState({
          notificationText: "Failed to update class. Please try again.",
          notificationType: "error",
          showNotification: true
        });
      }
    };

    // Tiến hành cập nhật lớp học
    updateClass();
  };

  handleAddNewTeacher = (index, e) => {
    e.preventDefault(); // Ngừng hành động mặc định của sự kiện

    const { teachers, classId } = this.state;
    const selectedTeacherId = teachers[index].selectedNewTeacherId;

    // Kiểm tra nếu không chọn giáo viên
    if (!selectedTeacherId) {
      alert("Please select a teacher to add.");
      return;
    }

    // Lấy giáo viên từ availableTeachers dựa trên selectedNewTeacherId
    const selectedTeacher = this.state.availableTeachers.find(teacher => teacher.teacherId === selectedTeacherId);


    if (!selectedTeacher) {
      alert("Teacher not found.");
      return;
    }

    // Gọi API để thêm giáo viên vào lớp
    axios.post(`${process.env.REACT_APP_API_URL}/api/Class/AddTeacherToClass?classId=${classId}&teacherId=${selectedTeacherId}`, {
      classId: classId,
      teacherId: selectedTeacherId,
    })
      .then((response) => {
        // Cập nhật lại state sau khi thêm giáo viên thành công
        this.setState((prevState) => {
          const updatedTeachers = prevState.teachers.map((teacher, i) => {
            if (i === index && teacher.teacherId === null) {
              return { ...teacher, teacherId: selectedTeacherId, teacherName: selectedTeacher.teacherName }; // Cập nhật teacherId và teacherName
            }
            return teacher;
          });
          return { teachers: updatedTeachers };
        });

        // Thông báo thành công
        this.setState({
          notificationText: "Teacher added successfully!",
          notificationType: "success",
          showNotification: true,
        });
        window.location.reload();

      })
      .catch((error) => {
        console.error("Error adding teacher:", error);
        this.setState({
          notificationText: "Failed to add teacher. Please try again.",
          notificationType: "error",
          showNotification: true,
        });
      });
  };

  render() {
    const { className, status, submeet, grades, semesters, gradeId, semesterId, showNotification, notificationText, notificationType, teachers, availableTeachers } = this.state;

    return (
      <div
        style={{ flex: 1 }}
        onClick={() => document.body.classList.remove("offcanvas-active")}
      >
        <div>
          <div className="container-fluid">
            <PageHeader
              HeaderText="Class Management"
              Breadcrumb={[
                { name: "Class Management", navigate: "" },
                { name: "Update Class", navigate: "" },
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

            <div className="card shadow-lg">
              <div className="card-header text-white" style={{ backgroundColor: "#48C3B4" }}>
                <h4 className="mb-0">Update Class</h4>
              </div>
              <div className="card-body">
                <form onSubmit={this.handleSubmit}>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Class Name</label>
                        <input
                          className={`form-control ${className === "" && submeet && "parsley-error"}`}
                          value={className}
                          name="className"
                          required=""
                          onChange={(e) => this.setState({ className: e.target.value })}
                        />
                        {className === "" && submeet && (
                          <ul className="parsley-errors-list filled">
                            <li className="parsley-required">Class name is required.</li>
                          </ul>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Status</label>
                        <br />
                        <label className="fancy-radio">
                          <input
                            type="radio"
                            name="status"
                            value="0"
                            checked={status === 0}
                            onChange={() => this.setState({ status: 0 })}
                          />
                          <span>
                            <i></i> Draft
                          </span>
                        </label>
                        <label className="fancy-radio">
                          <input
                            type="radio"
                            name="status"
                            value="1"
                            checked={status === 1}
                            onChange={() => this.setState({ status: 1 })}
                          />
                          <span>
                            <i></i> Pending
                          </span>
                        </label>
                        <label className="fancy-radio">
                          <input
                            type="radio"
                            name="status"
                            value="2"
                            checked={status === 2}
                            onChange={() => this.setState({ status: 2 })}
                          />
                          <span>
                            <i></i> Approved
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Grade</label>
                        <select
                          className="form-control"
                          value={gradeId}
                          onChange={(e) => this.setState({ gradeId: parseInt(e.target.value) })}
                        >
                          <option value={0}>Select Grade</option>
                          {grades.map((grade) => (
                            <option key={grade.gradeId} value={grade.gradeId}>
                              {grade.name}
                            </option>
                          ))}
                        </select>
                        {gradeId === 0 && submeet && (
                          <ul className="parsley-errors-list filled">
                            <li className="parsley-required">Grade is required.</li>
                          </ul>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Semester</label>
                        <select
                          className="form-control"
                          value={semesterId}
                          onChange={(e) => this.setState({ semesterId: parseInt(e.target.value) })}
                        >
                          <option value={0}>Select Semester</option>
                          {semesters.map((semester) => (
                            <option key={semester.semesterId} value={semester.semesterId}>
                              {semester.name}
                            </option>
                          ))}
                        </select>
                        {semesterId === 0 && submeet && (
                          <ul className="parsley-errors-list filled">
                            <li className="parsley-required">Semester is required.</li>
                          </ul>
                        )}
                      </div>
                    </div>
                    <div className="col-md-12">
                      <h5>Assigned Teachers</h5>
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th>Teacher Name</th>
                            <th>Change Teacher</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teachers.map((teacher, index) => (
                            <tr key={index}>
                              <td>{teacher.teacherName}</td>
                              <td>
                                <select
                                  className="form-control"
                                  onChange={(e) => this.handleTeacherChange(teacher.teacherId, parseInt(e.target.value))}
                                  value={teacher.selectedNewTeacherId || teacher.teacherId || ""}
                                >
                                  <option value="">Select a Teacher</option>
                                  {availableTeachers.map((availableTeacher) => (
                                    <option key={availableTeacher.teacherId} value={availableTeacher.teacherId}>
                                      {availableTeacher.teacherName}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                {/* Nếu dòng mới (teacherId là null), hiển thị nút Add Teacher */}
                                {teacher.teacherId === null ? (
                                  <>
                                    <button
                                      className="btn btn-success"
                                      onClick={(e) => this.handleAddNewTeacher(index, e)} // Gọi hàm để thêm giáo viên vào dòng mới
                                    >
                                      Add Teacher
                                    </button>
                                    <button
                                      className="btn btn-danger ml-2"
                                      onClick={(e) => this.handleRemoveTeacherRow(index, e)} // Gọi hàm để xóa dòng
                                    >
                                      Remove Row
                                    </button>
                                  </>
                                ) : (
                                  // Nếu dòng cũ (teacherId có giá trị), hiển thị nút Remove Teacher
                                  <button
                                    className="btn btn-danger"
                                    onClick={(e) => this.handleRemoveTeacher(teacher.teacherId, e)} // Gọi hàm để xóa giáo viên
                                  >
                                    Remove Teacher
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Nút "Add Teacher" ở ngoài bảng */}
                      <button className="btn btn-success" type="button" onClick={this.handleAddTeacherrow}>
                        Add New Teacher Row
                      </button>
                    </div>

                  </div>

                  <div className="text-right">
                    <button type="submit" className="btn btn-primary">
                      Update Class
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ ioTReducer }) => ({
  isSecuritySystem: ioTReducer.isSecuritySystem,
});

export default connect(mapStateToProps)(withRouter(UpdateClassByPrincipal));
