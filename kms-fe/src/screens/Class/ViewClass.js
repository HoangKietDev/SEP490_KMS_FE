import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from 'react-router-dom';

class ViewClass extends React.Component {
  state = {
    ProjectsData: [], // State để lưu trữ dữ liệu từ API
    statusFilter: '', // State để lưu trạng thái lọc
  };

  componentDidMount() {
    window.scrollTo(0, 0);
    // Gọi API và cập nhật state
    fetch("http://localhost:5124/api/Class/GetAllClass")
      .then((response) => response.json())
      .then((data) => {
        this.setState({ ProjectsData: data });
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }

  handleEdit = (classId) => {
    const user = JSON.parse(localStorage.getItem('user')); // Lấy thông tin user từ localStorage

    if (user && user.user.roleId === 3) {
      this.props.history.push(`/updateclass/${classId}`);
    } else if (user && user.user.roleId === 4) {
      this.props.history.push(`/updateclass2/${classId}`);
    } else {
      console.error("User roleId không hợp lệ hoặc không tồn tại.");
    }
  };

  handleView = (classId) => {
    this.props.history.push(`/viewchildrenbyclassid/${classId}`);
  };

  handleStatusFilterChange = (event) => {
    this.setState({ statusFilter: event.target.value });
  };

  // Hàm để định dạng ngày tháng
  formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0'); // Lấy ngày
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Lấy tháng (0-11)
    const year = date.getFullYear(); // Lấy năm
    return `${day}/${month}/${year}`; // Trả về định dạng dd/mm/yyyy
  };

  render() {
    const { ProjectsData, statusFilter } = this.state;

    // Lọc dữ liệu theo trạng thái
    const filteredData = ProjectsData.filter(classData => {
      if (statusFilter === '') return true; // Không lọc nếu không có bộ lọc
      return (statusFilter === 'active' && classData.status === 1) ||
        (statusFilter === 'inactive' && classData.status === 0);
    });

    return (
      <div
        style={{ flex: 1 }}
        onClick={() => {
          document.body.classList.remove("offcanvas-active");
        }}
      >
        <div>
          <div className="container-fluid">
            <PageHeader
              HeaderText="Class Management"
              Breadcrumb={[
                { name: "Class Management", navigate: "" },
                { name: "View Class", navigate: "" },
              ]}
            />
            <div className="row clearfix">
              <div className="col-lg-12 col-md-12">
                <div className="card">
                  <div className="body project_report">
                    {/* Dropdown để chọn trạng thái */}
                    <div className="form-group">
                      <label htmlFor="statusFilter">Filter by Status:</label>
                      <select
                        id="statusFilter"
                        className="form-control"
                        value={statusFilter}
                        onChange={this.handleStatusFilterChange}
                      >
                        <option value="">All</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    
                    <div className="table-responsive">
                      <table className="table m-b-0 table-hover">
                        <thead className="thead-light">
                          <tr>
                            <th>Class Name</th>
                            <th>Status</th>
                            <th>Expire Date</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.map((classData, classIndex) => (
                            <React.Fragment key={"class" + classIndex}>
                              <tr>
                                <td>{classData.className}</td>
                                <td>
                                  {classData.status === 1 ? (
                                    <span className="badge badge-success">
                                      Active
                                    </span>
                                  ) : (
                                    <span className="badge badge-default">
                                      Inactive
                                    </span>
                                  )}
                                </td>
                                <td>
                                  {this.formatDate(classData.expireDate)} {/* Sử dụng hàm định dạng */}
                                </td>
                                <td className="project-actions">
                                  <a className="btn btn-outline-secondary mr-1"
                                    onClick={() => this.handleView(classData.classId)} // Gọi hàm handleView
                                  >
                                    <i className="icon-eye"></i>
                                  </a>
                                  <a
                                    className="btn btn-outline-secondary"
                                    onClick={() => this.handleEdit(classData.classId)} // Gọi hàm handleEdit
                                  >
                                    <i className="icon-pencil"></i>
                                  </a>
                                  <a className="btn btn-outline-secondary">
                                    <i className="icon-trash"></i>
                                  </a>
                                </td>
                              </tr>
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
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

export default connect(mapStateToProps)(withRouter(ViewClass));
