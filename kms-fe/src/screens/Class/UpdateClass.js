import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from 'react-router-dom';
import axios from "axios"; // Import axios

class UpdateClass extends React.Component {
  state = {
    classId: 0,
    className: "",
    isActive: true,
    expireDate: "",
    schoolId: 102,
    submeet: false,
  };

  componentDidMount() {
    window.scrollTo(0, 0);
    const { classId } = this.props.match.params; // Lấy classId từ URL
    this.setState({ classId: parseInt(classId) }); // Cập nhật classId vào state

    // Gọi API để lấy thông tin lớp học
    axios.get(`http://localhost:5124/api/Class/GetClassById/${classId}`)
      .then((response) => {
        const data = response.data;

        // Chuyển đổi định dạng expireDate để phù hợp với input datetime-local
        const formattedExpireDate = new Date(data.expireDate).toISOString().slice(0, 16);

        // Cập nhật state với dữ liệu lớp học
        this.setState({
          className: data.className,
          isActive: data.isActive === 1, // Chuyển đổi sang boolean
          expireDate: formattedExpireDate, // Sử dụng định dạng đã chuyển đổi
          schoolId: data.schoolId,
        });
      })
      .catch((error) => {
        console.error("Error fetching class data: ", error);
        alert("Failed to fetch class data. Please try again.");
      });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { classId, className, isActive, expireDate, schoolId } = this.state;

    // Kiểm tra dữ liệu trước khi gửi
    if (!className || !expireDate || schoolId === 0) {
      this.setState({ submeet: true });
      return;
    }

    // Chuẩn bị dữ liệu theo schema
    const updatedClass = {
      classId,
      className,
      isActive: isActive ? 1 : 0, // Chuyển đổi sang 1 hoặc 0
      expireDate,
      schoolId,
    };

    // Gọi API để cập nhật lớp học
    axios.put("http://localhost:5124/api/Class/UpdateClass", updatedClass, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        console.log("Class updated successfully:", response.data);
        alert("Class has been updated successfully!");

        // Gọi lại API để lấy thông tin lớp học mới nhất
        return axios.get(`http://localhost:5124/api/Class/GetClassById/${classId}`);
      })
      .then((response) => {
        const data = response.data;

        // Cập nhật state với dữ liệu lớp học mới
        const formattedExpireDate = new Date(data.expireDate).toISOString().slice(0, 10);
        this.setState({
          className: data.className,
          isActive: data.isActive === 1,
          expireDate: formattedExpireDate, // Chỉ chứa phần ngày YYYY-MM-DD
          schoolId: data.schoolId,
        });

        // Chuyển hướng về danh sách lớp
        this.props.history.push('/viewclass');
      })
      .catch((error) => {
        console.error("Error updating class:", error);
        alert("Failed to update class. Please try again.");
      });
  };


  render() {
    const { className, isActive, expireDate, schoolId, submeet } = this.state;

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
            <form onSubmit={this.handleSubmit}>
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

              <div className="form-group">
                <label>Status</label>
                <br />
                <label className="fancy-radio">
                  <input
                    type="radio"
                    name="isActive"
                    value="active"
                    checked={isActive}
                    onChange={() => this.setState({ isActive: true })}
                  />
                  <span>
                    <i></i>Active
                  </span>
                </label>
                <label className="fancy-radio">
                  <input
                    type="radio"
                    name="isActive"
                    value="inactive"
                    checked={!isActive}
                    onChange={() => this.setState({ isActive: false })}
                  />
                  <span>
                    <i></i>Inactive
                  </span>
                </label>
              </div>

              <div className="form-group">
                <label>Expire Date</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={expireDate} // Sử dụng giá trị expireDate đã chuyển đổi
                  name="expireDate"
                  required=""
                  onChange={(e) => this.setState({ expireDate: e.target.value })}
                />
                {expireDate === "" && submeet && (
                  <ul className="parsley-errors-list filled">
                    <li className="parsley-required">Expire date is required.</li>
                  </ul>
                )}
              </div>

              <br />
              <button type="submit" className="btn btn-primary">
                Update Class
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ ioTReducer }) => ({
  isSecuritySystem: ioTReducer.isSecuritySystem,
});

// Export component wrapped with withRouter to have access to history
export default connect(mapStateToProps)(withRouter(UpdateClass));
