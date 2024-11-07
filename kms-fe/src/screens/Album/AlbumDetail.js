import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
// import { withRouter } from 'react-router-dom';
import axios from "axios";
import { getSession } from "../../components/Auth/Auth";
import { Modal, Button, Form } from "react-bootstrap";

class AlbumDetail extends React.Component {
  state = {
    albumId: 1,
    title: 'Thực đơn hàng ngày',
    description: 'Thực đơn ngày 20/10/2024',
    timepost: '',
    classId: '1',
    className: 'Violet',
    createBy: 'Teacher 1',
    modifyBy: 'Staff',
    status: '0',

    imageData: [],
    teacherListData: [],

    showModal: false, // Để quản lý hiển thị của modal
    caption: "", // Title mới cho album
    newImages: [], // Mảng để chứa hình ảnh được chọn từ máy
  };

  fetchAlbumImages = async () => {
    const { albumId } = this.state;

    try {
      const imageResponse = await axios.get(`http://localhost:5124/api/Images/listAllImageByAlbumId/${albumId}`);
      this.setState({ imageData: imageResponse.data }); // Cập nhật lại danh sách ảnh
    } catch (error) {
      console.error("Lỗi khi tải danh sách ảnh:", error);
    }
  };

  async componentDidMount() {
    window.scrollTo(0, 0);
    const { albumId } = this.props.match.params;
    this.setState({ albumId: parseInt(albumId) });

    try {
      // Fetch request details
      const response = await axios.get(`http://localhost:5124/api/Album/GetAlbumById/${albumId}`);
      const data = response.data;

      // Update state with request details
      this.setState({
        title: data.albumName,
        description: data.description,
        createBy: data.createBy,
        modifiBy: data.modifiBy,
        timePost: data.timePost ? new Date(data.timePost).toISOString().slice(0, 10) : "",
        status: data.status,
        studentId: data.isActive,
        ReasonReject: data.reason || "",
      });

      await this.fetchAlbumImages(); // Tải ảnh lúc load trang

      axios.get(`http://localhost:5124/api/Teacher/GetAllTeachers`)
        .then((response) => {
          this.setState({ teacherListData: response.data });
        })
        .catch((error) => {
          console.error("Error fetching data: ", error);
        });

    } catch (error) {
      console.error("Error fetching data: ", error);
      alert("Failed to fetch data. Please try again.");
    }
  }



  // Đóng modal
  handleClose = () => {
    this.setState({ showModal: false, caption: "", newImages: [] });
  };

  // Mở modal
  handleShow = () => {
    this.setState({ showModal: true });
  };

  // Xử lý khi người dùng chọn file ảnh
  handleImageChange = (event) => {
    this.setState({ newImages: [...event.target.files] });
  };

  // Xử lý khi người dùng nhấn nút "Lưu Album"
  handleSaveAlbum = async () => {
    const { albumId, newImages, caption } = this.state;

    const formData = new FormData();
    formData.append("albumId", albumId); // Thêm albumId vào FormData
    formData.append("caption", caption); // Hoặc có thể truyền một caption khác nếu cần

    // Thêm từng ảnh vào FormData
    newImages.forEach((image) => {
      formData.append("images", image); // API của bạn nhận `images` là một field với nhiều file
    });

    try {
      await axios.post("http://localhost:5124/api/Images/CreateImages", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Ảnh đã được tải lên thành công!");
      this.handleClose(); // Đóng modal sau khi tải lên thành công
      this.fetchAlbumImages();
    } catch (error) {
      console.error("Lỗi khi tải lên ảnh:", error);
      alert("Đã xảy ra lỗi khi tải lên ảnh.");
    }
  };



  formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day} - ${month} - ${year}`;
  };

  formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes} ${day}-${month}-${year}`;
  };

  groupImagesByPostedAt(images) {
    return images.reduce((groups, image) => {
      // Lấy giờ và phút từ postedAt để làm id
      const date = new Date(image.postedAt);
      const timeKey = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (!groups[timeKey]) {
        groups[timeKey] = [];
      }
      groups[timeKey].push(image);
      return groups;
    }, {});
  }

  formatTime(date) {
    return new Date(date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
  }

  scrollToTime(id) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.error(`Element with id ${id} not found`);
    }
  }

  render() {
    const { title, description, imageData, timePost, teacherListData, createBy, showModal, caption } = this.state;
    const userData = getSession('user')?.user;
    const roleId = userData?.roleId
    const groupedImages = this.groupImagesByPostedAt(imageData);
    const timeKeys = Object.keys(groupedImages);


    return (
      <div
        style={{ flex: 1 }}
        onClick={() => document.body.classList.remove("offcanvas-active")}
      >
        <div className="container-fluid">
          <PageHeader
            HeaderText="Album Management"
            Breadcrumb={[
              { name: "Album List", navigate: "album" },
              { name: "Album Detail", navigate: "" },
            ]}
          />
          <div className="row clearfix">
            <div className="col-md-12">
              <div className="card">
                <div className="body">
                  <form className="update-teacher-form">
                    <div className="row justify-content-between">
                      <div className="form-group col-md-6">
                        <div>
                          <strong className="font-weight-bold" style={{ fontSize: '20px' }}>{title}</strong>
                          <p>{description}</p>
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <p>Số ảnh: </p> <span className="font-weight-bold">{imageData && imageData.length || 0}</span>
                          </div>
                          <div className="col-md-6">
                            <p>Ngày đăng: </p> <span className="font-weight-bold">{this.formatDate(timePost)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="form-group col-md-6 d-flex justify-content-end align-items-start">
                        {roleId === 5 && (
                          <button onClick={(e) => {
                            e.preventDefault(); // Ngăn hành động mặc định
                            this.handleShow();
                          }} className="btn btn-success text-white">Đăng Album Ảnh</button>
                        )}
                      </div>
                    </div>

                    {/* List of time links */}
                    <ul className="list-inline">
                      <span className="pr-3">Timeline:</span>
                      {timeKeys.map((time) => (
                        <li key={time} className="list-inline-item">
                          <button
                            className="btn btn-outline-primary"
                            onClick={(e) => {
                              e.preventDefault(); // Ngăn hành động mặc định
                              this.scrollToTime(time);
                            }}
                          >
                            {time}
                          </button>
                        </li>
                      ))}
                    </ul>

                    <div className="container">
                      {(!imageData || imageData.length === 0) ? (
                        <div>
                          <strong className="font-weight-bold pl-3" style={{ fontSize: '20px' }}>Album hiện đang chưa có ảnh</strong>
                        </div>
                      ) : (
                        Object.entries(groupedImages).map(([postedAt, imagesAtPostedTime]) => (
                          <div key={postedAt} id={postedAt.split(' ')[0]} className="timeline-item">
                            <div className="timeline-time d-flex align-items-center mb-3">
                              <h5 className="bg-primary text-white p-2 rounded">{postedAt}</h5>
                              <h5 className="pl-4">{imagesAtPostedTime[0].caption}</h5>
                            </div>
                            <div className="row">
                              {imagesAtPostedTime.map((image) => (
                                <div key={image.id} className="col-md-3 mb-4">
                                  <div className="card shadow-sm">
                                    <img src={image.imgUrl} alt={`Image ${image.caption}`} className="card-img-top" />
                                    <div className="card-body text-center">
                                      <p className="card-text">
                                        Đã thêm bởi: {teacherListData && teacherListData.find(item => item.teacherId === createBy)?.name}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <br />
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Modal thêm album */}
          <Modal show={showModal} onHide={this.handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Thêm Album Image Mới</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group controlId="formTitle">
                  <Form.Label>Mô tả</Form.Label>
                  <Form.Control
                    type="text"
                    value={caption}
                    onChange={(e) => this.setState({ caption: e.target.value })}
                  />
                </Form.Group>
                <Form.Group controlId="formImages">
                  <Form.Label>Hình ảnh</Form.Label>
                  <Form.Control
                    type="file"
                    multiple
                    onChange={this.handleImageChange}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.handleClose}>
                Hủy
              </Button>
              <Button variant="primary" onClick={this.handleSaveAlbum}>
                Lưu Album Image
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ ioTReducer }) => ({
  isSecuritySystem: ioTReducer.isSecuritySystem,
});

export default connect(mapStateToProps)((AlbumDetail));
