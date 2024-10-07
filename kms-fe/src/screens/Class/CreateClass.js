import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from 'react-router-dom';

class CreateClass extends React.Component {
  state = {
    classId: 0,
    className: "",
    isActive: 1,
    expireDate: "",
    schoolId: 102,
    submeet: false,
  };

  componentDidMount() {
    window.scrollTo(0, 0);
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
    const newClass = {
      classId,
      className,
      isActive,
      expireDate,
      schoolId,
    };

    // Gọi API để thêm lớp học
    fetch("http://localhost:5124/api/Class/AddClass", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newClass),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Class added successfully:", data);
        // Hiển thị thông báo thành công
        alert("Class has been added successfully!");

        // Chuyển hướng đến /viewclass
        this.props.history.push('/viewclass');

        // Reset form hoặc thực hiện các hành động khác
        this.setState({
          classId: 0,
          className: "",
          isActive: 1,  // Đặt lại trạng thái isActive mặc định
          expireDate: "",
          schoolId: 102,
          submeet: false,
        });
      })
      .catch((error) => {
        console.error("Error adding class:", error);
        alert("Failed to add class. Please try again.");
      });
  };

  render() {
    const { classId, className, isActive, expireDate, schoolId, submeet } = this.state;

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
                { name: "Upadte Class", navigate: "" },
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

              {/* <div className="form-group">
                <label>Is Active</label>
                <input
                  type="number"
                  className="form-control"
                  value={isActive}
                  name="isActive"
                  onChange={(e) => this.setState({ isActive: parseInt(e.target.value) })}
                />
              </div> */}

              <div className="form-group">
                <label>Expire Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={expireDate}
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


              {/* <div className="form-group">
                <label>School ID</label>
                <input
                  type="number"
                  className={`form-control ${schoolId === 0 && submeet && "parsley-error"}`}
                  value={schoolId}
                  name="schoolId"
                  required=""
                  onChange={(e) => this.setState({ schoolId: parseInt(e.target.value) })}
                />
                {schoolId === 0 && submeet && (
                  <ul className="parsley-errors-list filled">
                    <li className="parsley-required">School ID is required.</li>
                  </ul>
                )}
              </div> */}

              <br />
              <button type="submit" className="btn btn-primary">
                Add Class
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
export default connect(mapStateToProps)(withRouter(CreateClass));
