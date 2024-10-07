import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from 'react-router-dom';

class ViewClass extends React.Component {
  state = {
    ProjectsData: [], // State để lưu trữ dữ liệu từ API
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
    // Chuyển hướng đến trang cập nhật lớp học
    this.props.history.push(`/updateclass/${classId}`);
  };

  render() {
    const { ProjectsData } = this.state;

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
                          {ProjectsData.map((classData, classIndex) => (
                            <React.Fragment key={"class" + classIndex}>
                              <tr>
                                <td>{classData.className}</td>
                                <td>
                                  {classData.isActive === 1 ? (
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
                                  {new Date(classData.expireDate).toLocaleDateString()}
                                </td>
                                <td className="project-actions">
                                  <a className="btn btn-outline-secondary mr-1">
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
