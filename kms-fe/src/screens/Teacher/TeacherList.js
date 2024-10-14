import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { withRouter } from 'react-router-dom';


class TeacherList extends React.Component {
  state = {
    // TeacherListData: [], // State để lưu trữ dữ liệu từ API
    TeacherListData: [{
      teacherId: 0,
      firstName: "Hoang",
      lastName: "Kiet",
      address: "Thai Binh",
      phone: "0323241545",
      mail: "kiet7cvl@gmail.com",
      gender: 1,
      status: 1,
      dob: "21/3/2002",
      code: "TC101",
      education: "string",
      experience: "string",
      avatar: "https://greekherald.com.au/wp-content/uploads/2020/07/default-avatar.png"
    },{
      teacherId: 1,
      firstName: "Hoang1",
      lastName: "Kiet1",
      address: "Thai Binh",
      phone: "0323241545",
      mail: "kiet7cvl@gmail.com",
      gender: 1,
      status: 1,
      dob: "21/3/2002",
      code: "TC101",
      education: "string",
      experience: "string",
      avatar: "https://greekherald.com.au/wp-content/uploads/2020/07/default-avatar.png"
    }]
  };

  componentDidMount() {
    window.scrollTo(0, 0);
    // Gọi API và cập nhật state
    // fetch("http://localhost:5124/api/ChildrenDetail/GetAllChildrenDetails")
    //   .then((response) => response.json())
    //   .then((data) => {
    //     this.setState({ TeacherListData: data });
    //   })
    //   .catch((error) => {
    //     console.error("Error fetching data: ", error);
    //   });
  }

  // handleEdit = (teacherId) => {
  //   // // Chuyển hướng đến trang cập nhật thông tin học sinh
  //   // this.props.history.push(`/viewstudentbyId/${studentId}`);
  // };

  render() {
    const { TeacherListData } = this.state;

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
              HeaderText="Teacher Management"
              Breadcrumb={[
                { name: "Teacher Management", navigate: "" },
                { name: "Teacher List", navigate: "" },
              ]}
            />
            <div className="row clearfix">

            <div className="col-lg-12 col-md-12">
                <div className="card planned_task">
                  <div className="header d-flex justify-content-between">
                    <h2>Teacher Manager</h2>
                    <a onClick={() => this.handleCreateCategory()} class="btn btn-success text-white">Add Teacher</a>
                  </div>
                </div>
              </div>
              <div className="col-lg-12 col-md-12">
                <div className="card">
                  <div className="body project_report">
                    <div className="table-responsive">
                      <table className="table m-b-0 table-hover">
                        <thead className="thead-light">
                          <tr>
                            <th>#</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Phone</th>
                            <th>Gender</th>
                            <th>Code</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {TeacherListData?.map((teacher, index) => (
                            <React.Fragment key={"teacher" + index}>
                              <tr>
                                <td>{index + 1}</td>
                                <td>{teacher?.firstName}</td>
                                <td>{teacher.lastName}</td>
                                <td>{teacher.phone}</td>
                                <td>
                                  {teacher.gender === 1 ? (
                                    <span className="">
                                      Male
                                    </span>
                                  ) : (
                                    <span className="">
                                      Female
                                    </span>
                                  )}
                                </td>
                                <td>{teacher.code}</td>
                                <td className="project-actions">
                                  <a className="btn btn-outline-secondary mr-1">
                                    <i className="icon-eye"></i>
                                  </a>
                                  <a
                                    className="btn btn-outline-secondary"
                                  // onClick={() => this.handleEdit(teacher.teacherId)} // Gọi hàm handleEdit
                                  >
                                    <i className="icon-pencil"></i>
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

export default connect(mapStateToProps)(withRouter(TeacherList));
