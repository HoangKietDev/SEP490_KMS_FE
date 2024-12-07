import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from 'react-router-dom';
import axios from "axios";
import Notification from "../../components/Notification";

class UpdateClass extends React.Component {
  state = {
    classId: 0,
    className: "",
    isActive: true,
    expireDate: "",
    schoolId: 102,
    semesterId: 0,
    gradeId: 0,
    grades: [],
    semesters: [],
    status: 0,
    submeet: false,
    showNotification: false,
    notificationText: "",
    notificationType: "success",
    teachers: [],  // Danh sách giáo viên đã có lớp
    availableTeachers: [],  // Danh sách giáo viên chưa có lớp
    selectedNewTeacherId: 0,  // Giáo viên mới sẽ được chọn
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
          status: data.status,
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

    // Gọi API lấy danh sách giáo viên chưa có lớp
    axios.get(`${process.env.REACT_APP_API_URL}/api/Class/GetTeachersWithoutClass`)
      .then((response) => {
        this.setState({ availableTeachers: response.data });
      })
      .catch((error) => {
        console.error("Error fetching available teachers:", error);
      });
  }

  // Hàm xử lý thay đổi giáo viên trong bảng
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

    const { classId, teachers } = this.state;

    // Kiểm tra nếu có bất kỳ thay đổi nào về giáo viên
    const teachersToUpdate = teachers.filter((teacher) => teacher.selectedNewTeacherId && teacher.selectedNewTeacherId !== teacher.teacherId);

    if (teachersToUpdate.length > 0) {
      // Cập nhật giáo viên trong lớp
      this.updateTeachersInClass(classId, teachersToUpdate);

      // Hiển thị thông báo thành công
      this.setState({
        notificationText: "Teachers have been updated successfully!",
        notificationType: "success",
        showNotification: true
      });

      // Chuyển hướng sau khi cập nhật
      setTimeout(() => {
        this.props.history.push('/viewclass');
      }, 1000);
    } else {
      this.setState({
        notificationText: "No teacher changes detected.",
        notificationType: "error",
        showNotification: true
      });
    }
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
    const { className, status, expireDate, submeet, grades, semesters, gradeId, semesterId, teachers, showNotification, notificationText, notificationType, availableTeachers } = this.state;

    return (
      <div style={{ flex: 1 }} onClick={() => document.body.classList.remove("offcanvas-active")}>
        <div>
          <div className="container-fluid">
            <PageHeader
              HeaderText="Class Management"
              Breadcrumb={[{ name: "Class Management", navigate: "/viewclass" }, { name: "Update Class", navigate: "" }]}
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
                          type="text"
                          className="form-control"
                          value={className}
                          onChange={(e) => this.setState({ className: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Grade</label>
                        <select
                          className="form-control"
                          value={gradeId}
                          onChange={(e) => this.setState({ gradeId: parseInt(e.target.value) })}
                        >
                          {grades.map((grade) => (
                            <option key={grade.gradeId} value={grade.gradeId}>
                              {grade.name}
                            </option>
                          ))}
                        </select>
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
                          {semesters.map((semester) => (
                            <option key={semester.semesterId} value={semester.semesterId}>
                              {semester.name}
                            </option>
                          ))}
                        </select>
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

                  <div className="text-right mt-4">
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

export default withRouter(UpdateClass);
