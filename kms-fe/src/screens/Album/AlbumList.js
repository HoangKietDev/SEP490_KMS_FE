import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
// import { withRouter } from 'react-router-dom';
import axios from "axios";
import { modifyAlpha } from "echarts-gl";
import { getSession } from "../../components/Auth/Auth";
import Pagination from "../../components/Common/Pagination";
import { Modal, Button } from "react-bootstrap"; // Thêm modal từ react-bootstrap


class Albumlist extends React.Component {
  state = {
    teacherListData: [],
    classListData: [],
    AlbumListData: [],
    NewAlbumListData: [],
    filteredAlbumListData: [],

    classId: null,
    currentPage: 1,
    itemsPerPage: 10,

    selectedStatusId: "", // Duy trì giá trị chọn trạng thái
    searchTerm: "", // Thêm trường tìm kiếm

    showModal: false, // State để kiểm soát hiển thị modal
    reason: "", // State để lưu lý do
    currentAlbumId: null // Lưu albumId của album đang cập nhật
  };

  componentDidMount() {
    window.scrollTo(0, 0);

    const userData = getSession('user')?.user;
    const roleId = userData?.roleId;

    // Gọi API và cập nhật state bằng axios
    axios.get("http://localhost:5124/api/Album/GetAllAlbums")
      .then((response) => {
        const albumData = response.data;

        if (roleId === 5) {
          axios.get(`http://localhost:5124/api/Class/GetClassesByTeacherId/${userData?.userId}`)
            .then((classResponse) => {
              const teacherClassId = classResponse.data[0]?.classId; // classId của lớp mà giáo viên phụ trách

              // Lọc danh sách album theo teacherClassId
              const teacherFilteredAlbums = albumData.filter(album => album.classId === teacherClassId);
              console.log(teacherFilteredAlbums);

              // Cập nhật state với dữ liệu lọc
              this.setState({
                AlbumListData: albumData,
                filteredAlbumListData: teacherFilteredAlbums,
                classId: teacherClassId,
                selectedClassId: teacherClassId
              });
            })
            .catch((error) => {
              console.error("Error fetching teacher's classId:", error);
            });
        } else if (roleId === 2) {
          // Nếu là giáo viên, chỉ lấy các album có status = 1
          const approvedAlbums = albumData.filter(album => album.status === 1);
          this.setState({
            AlbumListData: approvedAlbums,
            filteredAlbumListData: approvedAlbums // Chỉ hiển thị album đã phê duyệt
          });
        } else {
          this.setState({
            AlbumListData: albumData,
            filteredAlbumListData: albumData // Hiển thị tất cả album cho các vai trò khác
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });

    axios.get(`http://localhost:5124/api/Teacher/GetAllTeachers`)
      .then((response) => {
        this.setState({ teacherListData: response.data });
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });

    axios.get(`http://localhost:5124/api/Class/GetAllClass`)
      .then((response) => {
        this.setState({ classListData: response.data });
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }


  handlePageChange = (pageNumber) => {
    this.setState({ currentPage: pageNumber });
  };


  handleCreateAlbum = () => {
    // Chuyển hướng đến trang add teacher
    this.props.history.push(`/create-album`);
  };

  handleDetailAlbum = (albumId) => {
    this.props.history.push(`/album-detail/${albumId}`);
  }

  handleClassFilterChange = (e) => {
    const selectedClassId = e.target.value;
    this.setState({ selectedClassId });

    // Lọc Album theo classId đã chọn
    if (selectedClassId) {
      const filteredAlbumListData = this.state.AlbumListData.filter(
        (album) => album.classId === parseInt(selectedClassId)
      );
      this.setState({ filteredAlbumListData });
    } else {
      this.setState({ filteredAlbumListData: this.state.AlbumListData });
    }
  };

  handleStatusFilterChange = (e) => {
    const selectedStatusId = e.target.value;
    this.setState({ selectedStatusId });

    // Lọc Album theo status đã chọn
    const { AlbumListData, selectedClassId } = this.state;

    let filteredData = AlbumListData;

    // Lọc theo classId
    if (selectedClassId) {
      filteredData = filteredData.filter(
        (album) => album.classId === parseInt(selectedClassId)
      );
    }

    // Lọc theo status
    if (selectedStatusId) {
      filteredData = filteredData.filter(
        (album) => album.status === parseInt(selectedStatusId)
      );
    }

    this.setState({ filteredAlbumListData: filteredData });
  };

  handleSearchChange = (e) => {
    const searchTerm = e.target.value.toLowerCase(); // Chuyển đổi thành chữ thường
    this.setState({ searchTerm });

    const { AlbumListData, selectedClassId, selectedStatusId } = this.state;

    let filteredData = AlbumListData;

    // Lọc theo classId
    if (selectedClassId) {
      filteredData = filteredData.filter(
        (album) => album.classId === parseInt(selectedClassId)
      );
    }

    // Lọc theo status
    if (selectedStatusId) {
      filteredData = filteredData.filter(
        (album) => album.status === parseInt(selectedStatusId)
      );
    }

    // Lọc theo AlbumTitle
    if (searchTerm) {
      filteredData = filteredData.filter((album) =>
        album.albumName.toLowerCase().includes(searchTerm)
      );
    }

    this.setState({ filteredAlbumListData: filteredData });
  };

  handleClearFilters = () => {
    this.setState({
      selectedClassId: "",   // Reset lớp đã chọn
      selectedStatusId: "",   // Reset trạng thái đã chọn
      searchTerm: "",         // Reset từ khóa tìm kiếm
      filteredAlbumListData: this.state.AlbumListData // Đặt lại danh sách album về ban đầu
    });
  };

  // Phương thức để mở modal
  openModal = (albumId) => {
    this.setState({ showModal: true, currentAlbumId: albumId });
  };

  // Phương thức để đóng modal
  closeModal = () => {
    this.setState({ showModal: false, reason: "" });
  };

  handleStatusChange = async (albumId, newStatus) => {
    let reason = "";

    // Kiểm tra newStatus
    if (newStatus === 1) {
      reason = ""; // Nếu status là 1, lý do là rỗng
    } else if (newStatus === 2) {
      this.openModal(albumId); // Nếu status là 2, mở modal
      return; // Trả về để không thực hiện tiếp
    }

    try {
      console.log(albumId, newStatus, reason);

      const response = await axios.put(`http://localhost:5124/api/Album/UpdateStatusAlbum`, {
        albumId: albumId,
        status: newStatus,
        reason: reason
      });
      console.log("Status updated successfully:", response.data);
      alert("Status updated successfully!");

      // Cập nhật trạng thái trong state
      this.setState((prevState) => {
        const updatedAlbumListData = prevState.filteredAlbumListData.map((item) =>
          item.albumId === albumId ? { ...item, status: newStatus } : item
        );
        return { filteredAlbumListData: updatedAlbumListData };
      });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status!");
    }
  };

  // Phương thức để xử lý khi nhấn cập nhật trong modal
  handleUpdateStatus = async () => {
    const { currentAlbumId, reason } = this.state;
    try {
      const response = await axios.put(`http://localhost:5124/api/Album/UpdateStatusAlbum`, {
        albumId: currentAlbumId,
        status: 2, // Cập nhật status là 2
        reason: reason // Lý do được nhập trong modal
      });
      console.log("Status updated successfully:", response.data);
      alert("Status updated successfully!");

      // Cập nhật trạng thái trong state
      this.setState((prevState) => {
        const updatedAlbumListData = prevState.filteredAlbumListData.map((item) =>
          item.albumId === currentAlbumId ? { ...item, status: 2 } : item
        );
        return { filteredAlbumListData: updatedAlbumListData };
      });

      this.closeModal(); // Đóng modal sau khi cập nhật
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status!");
    }
  };

  formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  render() {
    const { AlbumListData, classListData, teacherListData, selectedClassId, filteredAlbumListData, showModal, reason } = this.state;
    const statusOptions = [
      { value: 1, label: "Aprroved", className: "badge-success" },
      { value: 2, label: "Reject", className: "badge-danger" },
      { value: 0, label: "Pending", className: "badge-default" },
    ];

    // phan trang
    const { currentPage, itemsPerPage } = this.state;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAlbumListData.slice(indexOfFirstItem, indexOfLastItem);

    // Get user data from cookie
    const userData = getSession('user')?.user;
    const roleId = userData?.roleId;

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
              HeaderText="Album Management"
              Breadcrumb={[
                { name: "Album List", navigate: "" },
              ]}
            />
            <div className="row clearfix">

              <div className="col-lg-12 col-md-12">
                <div className="card planned_task">
                  <div className="header d-flex justify-content-between">
                    <h2>Album Manager</h2>
                    {roleId === 5 ? (
                      <a onClick={() => this.handleCreateAlbum()} class="btn btn-success text-white">Create New Album</a>
                    ) : null}
                  </div>
                  <div className="form-group row pl-3">
                    <div className="col-md-3">
                      <label htmlFor="classFilter">Filter by Class</label>
                      <select
                        id="classFilter"
                        className="form-control"
                        value={selectedClassId}
                        onChange={this.handleClassFilterChange}
                        disabled={roleId === 5} // Vô hiệu hóa khi roleId = 5
                      >
                        <option value="">All Classes</option>
                        {classListData.map((classItem) => (
                          <option key={classItem.classId} value={classItem.classId}>
                            {classItem.className}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className=" col-md-3">
                      <label htmlFor="statusFilter">Filter by Status</label>
                      <select
                        id="statusFilter"
                        className="form-control"
                        value={this.state.selectedStatusId}
                        onChange={this.handleStatusFilterChange}
                        disabled={roleId === 2} // Vô hiệu hóa dropdown nếu roleId = 2
                      >
                        <option value="">All Status</option>
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group col-md-3">
                      <label htmlFor="searchFilter">Search</label>
                      <input
                        type="text"
                        id="searchFilter"
                        className="form-control"
                        value={this.state.searchTerm}
                        onChange={this.handleSearchChange}
                        placeholder="Enter album title"
                      />
                    </div>
                    <div className="form-group col-md-3">
                      <button className="btn btn-primary " onClick={this.handleClearFilters}>
                        Clear Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-12 col-md-12">
                <div className="card">
                  <div className="body project_report">
                    <div className="table-responsive">
                      <table className="table m-b-0 table-hover">
                        <thead className="">
                          <tr className="theme-color">
                            <th>#</th>
                            <th>AlbumTitle</th>
                            <th>TimePost</th>
                            <th>Class</th>
                            <th>Desciption</th>
                            <th>CreateBy</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems?.map((album, index) => {
                            // Đặt fullname ra ngoài return của map
                            return (
                              <React.Fragment key={"teacher" + index}>
                                <tr>
                                  <td>{index + 1}</td>
                                  <td
                                    onClick={() => this.handleDetailAlbum(album?.albumId)}
                                    style={{ cursor: 'pointer' }}
                                    className="theme-color">{album?.albumName}</td>

                                  <td>{album?.timePost ? this.formatDate(album.timePost) : "N/A"}</td>
                                  <td>
                                    {classListData && classListData?.find(item => item.classId === album?.classId)?.className}
                                    {album?.className}
                                  </td>
                                  <td className="text-truncate" style={{ maxWidth: "150px" }}>{album?.description}</td>
                                  <td>
                                    {teacherListData && teacherListData?.find(item => item.teacherId === album?.createBy)?.name}
                                  </td>


                                  {(roleId === 3) && ( // Chỉ cho phép roleId = 3 thay đổi trạng thái
                                    <td>
                                      <select
                                        value={album?.status}
                                        onChange={(e) => this.handleStatusChange(album.albumId, parseInt(e.target.value))}
                                        className={`form-control ${album?.status === 1 ? 'badge-success' : album?.status === 2 ? 'badge-danger' : 'badge-default'}`}
                                      >
                                        {statusOptions.map(option => (
                                          <option key={option.value} value={option.value} className={option.className}>
                                            {option.label}
                                          </option>
                                        ))}
                                      </select>
                                    </td>
                                  )}
                                  {(roleId === 5 || roleId === 2) && ( // Nếu roleId = 5, chỉ hiển thị trạng thái mà không có select
                                    <td>
                                      <span className={`badge ${album?.status === 1 ? 'badge-success' : album?.status === 2 ? 'badge-danger' : 'badge-default'}`}>
                                        {statusOptions.find(option => option.value === album?.status)?.label} {/* Hiển thị trạng thái */}
                                      </span>
                                    </td>
                                  )}
                                </tr>
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="pt-4">
                      <Pagination
                        currentPage={currentPage}
                        totalItems={filteredAlbumListData.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={this.handlePageChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Modal show={showModal} onHide={this.closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>Reason for Rejection</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <textarea
              rows="4"
              className="form-control"
              value={reason}
              onChange={(e) => this.setState({ reason: e.target.value })}
              placeholder="Please enter the reason for rejection"
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.closeModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={this.handleUpdateStatus}>
              Update Status
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = ({ ioTReducer }) => ({
  isSecuritySystem: ioTReducer.isSecuritySystem,
});

export default connect(mapStateToProps)((Albumlist));
