import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import axios from "axios";
import { withRouter } from "react-router-dom/cjs/react-router-dom.min";
import { Modal, Button, Form } from "react-bootstrap"; // Thêm modal từ react-bootstrap
import Notification from "../../components/Notification";


class SemserterDetail extends React.Component {

    state = {
        semesterDetail: null,
        name: "",
        status: 1,
        startDate: '',
        endDate: '',

        semesterRealList: [],
        showModal: false, // State để kiểm soát hiển thị modal

        newName: "", // Tạo state mới để lưu tên khi nhập trong modal
        newStartDate: "", // Tạo state mới để lưu startDate khi nhập trong modal
        newEndDate: "", // Tạo state mới để lưu endDate khi nhập trong modal

        showNotification: false, // State to control notification visibility
        notificationText: "", // Text for the notification
        notificationType: "success", // Type of notification (success or error)
    };
    componentDidMount() {
        this.fetchData();
    };

    fetchData = async () => {
        const { semesterId } = this.props.match.params; // Get categoryServiceId from URL
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/Semester/GetAllSemester`);
            const data = response.data;
            const dataDetail = data?.find(i => i.semesterId == semesterId)

            const responseSemesterReal = await axios.get(`${process.env.REACT_APP_API_URL}/api/Semester/GetListSemesterBySchoolYear/${semesterId}`);
            const dataSemesterReal = responseSemesterReal.data;

            console.log(dataDetail);
            this.setState({
                semesterDetail: dataDetail,
                name: dataDetail.name,
                status: dataDetail.status,
                startDate: dataDetail.startDate.split("T")[0],
                endDate: dataDetail.endDate.split("T")[0],
                semesterRealList: dataSemesterReal
            });
        } catch (error) {
            console.error('Error fetching category details:', error);
        }
    };

    handleShowModal = () => {
        this.setState({ showModal: true });
    };

    handleCloseModal = () => {
        this.setState({
            showModal: false,
            newName: "",
            newStartDate: "",
            newEndDate: "",
        });
    };

    handleInputName = (e) => {
        this.setState({ newName: e.target.value });
    };

    handleInputStart = (e) => {
        this.setState({ newStartDate: e.target.value });
    };

    handleInputEnd = (e) => {
        this.setState({ newEndDate: e.target.value });
    };

    handleCreateOrUpdate = async () => {
        const { newName, newStartDate, newEndDate, semesterRealId } = this.state;
        const { semesterId } = this.props.match.params;

        try {
            let response;
            if (semesterRealId) {
                // Cập nhật semester real
                response = await axios.put(
                    `${process.env.REACT_APP_API_URL}/api/Semester/UpdateSemesterReal/${semesterId}`,
                    {
                        semesterrealId: semesterRealId,
                        name: newName,
                        startDate: newStartDate,
                        endDate: newEndDate,
                    }
                );
            } else {
                // Thêm mới semester real
                response = await axios.post(
                    `${process.env.REACT_APP_API_URL}/api/Semester/AddSemesterReal/${semesterId}`,
                    {
                        name: newName,
                        startDate: newStartDate,
                        endDate: newEndDate,
                    }
                );
            }

            // Đóng modal và tải lại dữ liệu
            this.handleCloseModal();
            this.fetchData();
            this.setState({
                notificationText: semesterRealId ? "Semester Real updated successfully!" : "Semester Real created successfully!",
                notificationType: "success",
                showNotification: true,
            });

        } catch (error) {
            const errorMessage = error?.response?.data || 'Somthing Error !'
            this.setState({
                notificationText: errorMessage,
                notificationType: "error",
                showNotification: true,
            });
        }
    };

    handleDelete = async (id) => {
        try {
            const confirmation = window.prompt("Please confirm by typing 'yes' to close Modal and Delete Data:", "");
            if (confirmation === "yes") {
                // Người dùng nhập "yes", thực hiện hành động cần thiết

                // Gọi API để xóa dữ liệu
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/Semester/DeleteSemesterReal/${id}`)

                // Đóng modal và hiển thị thông báo xóa thành công
                this.setState({
                    notificationText: "Semester Real deleted successfully!",
                    notificationType: "success",
                    showNotification: true,
                });
                this.fetchData(); // Tải lại dữ liệu sau khi tạo mới
            }
            else {
                this.setState({
                    notificationText: "Incorrect Input to delete!!",
                    notificationType: "info",
                    showNotification: true,
                });
            }
        } catch (error) {
            console.error("Error Delete Semester Real:", error);
            this.setState({
                notificationText: "Semester Real deleted error!",
                notificationType: "error",
                showNotification: true,
            });
        }
    }

    // Khi nhấn Edit, sẽ mở modal với dữ liệu hiện tại
    handleEdit = (id) => {
        const { semesterRealList } = this.state;
        const semesterReal = semesterRealList.find(item => item.semesterrealId === id);

        if (semesterReal) {
            this.setState({
                showModal: true,
                semesterRealId: id,
                newName: semesterReal.name,
                newStartDate: semesterReal.startDate.split("T")[0], // Convert to yyyy-mm-dd
                newEndDate: semesterReal.endDate.split("T")[0], // Convert to yyyy-mm-dd
            });
        }
    };

    render() {
        const { semesterDetail, name, status, startDate, endDate, semesterRealList, showModal } = this.state;
        const { semesterId } = this.props.match.params;
        const { newName, newStartDate, newEndDate } = this.state;
        const { showNotification, notificationText, notificationType } = this.state;

        return (
            <div style={{ flex: 1 }} onClick={() => document.body.classList.remove("offcanvas-active")}>
                {showNotification && (
                    <Notification
                        type={notificationType}
                        position="top-right"
                        dialogText={notificationText}
                        show={showNotification}
                        onClose={() => this.setState({ showNotification: false })}
                    />
                )}
                <div>
                    <div className="container-fluid">
                        <PageHeader
                            HeaderText="Semester Detail"
                            Breadcrumb={[
                                { name: "Semester", navigate: "semester" },
                                { name: "Semester Detail", navigate: "" },
                            ]}
                        />
                        <div className="row clearfix">
                            <div className="col-md-12">
                                <div className="card shadow-lg">
                                    <div className="card-header text-white theme-colorbg">
                                        <h4 className="mb-0">Detail Semester</h4>
                                    </div>
                                    <div className="body">
                                        <form onSubmit={this.handleSubmit}>
                                            <div className="form-group">
                                                <label>School Year</label>
                                                <input
                                                    className={`form-control`}
                                                    value={name} // Bind value from state
                                                    name="name"
                                                    readOnly
                                                />
                                            </div>
                                            <div className="row">
                                                <div className="form-group col-md-6">
                                                    <label>Start Date</label>
                                                    <input
                                                        className={`form-control`}
                                                        value={startDate} // Bind value from state
                                                        name="startDate"
                                                        type="date"
                                                        readOnly
                                                    />
                                                </div>
                                                <div className="form-group col-md-6">
                                                    <label>End Date</label>
                                                    <input
                                                        className={`form-control`}
                                                        value={endDate} // Bind value from state
                                                        name="endDate"
                                                        type="date"
                                                        readOnly
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>Status</label>
                                                <br />
                                                <label className="fancy-radio">
                                                    <input
                                                        name="status"
                                                        type="radio"
                                                        value="1"
                                                        defaultChecked={status === 1}
                                                        disabled
                                                    />
                                                    <span>
                                                        <i></i>Enable
                                                    </span>
                                                </label>
                                                <label className="fancy-radio">
                                                    <input
                                                        name="status"
                                                        type="radio"
                                                        value="0"
                                                        defaultChecked={status === 0}
                                                        disabled
                                                    />
                                                    <span>
                                                        <i></i>Disable
                                                    </span>
                                                </label>
                                            </div>

                                            <div className="form-group">
                                                {semesterRealList && semesterRealList.length !== 0 ?
                                                    <div className="table-responsive">
                                                        <table className="table m-b-0 table-hover">
                                                            <thead className="">
                                                                <tr className="theme-color">
                                                                    <th>#</th>
                                                                    <th>Name</th>
                                                                    <th>Start Date</th>
                                                                    <th>End Date</th>
                                                                    <th>Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {semesterRealList.map((item, i) => {
                                                                    return (
                                                                        <tr key={"dihf" + i}>

                                                                            <td className="project-title">
                                                                                <th scope="row">{i + 1}</th>
                                                                            </td>
                                                                            <td>
                                                                                {item?.name}
                                                                            </td>
                                                                            <td>
                                                                                {item?.startDate?.split("T")[0]}
                                                                            </td>
                                                                            <td>
                                                                                {item?.endDate?.split("T")[0]}
                                                                            </td>
                                                                            <td className="project-actions">
                                                                                <a onClick={() => this.handleDelete(item.semesterrealId)} className="btn btn-outline-secondary mr-1">
                                                                                    <i className="icon-trash"></i>
                                                                                </a>
                                                                                <a onClick={() => this.handleEdit(item.semesterrealId)} className="btn btn-outline-secondary">
                                                                                    <i className="icon-pencil"></i>
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}


                                                            </tbody>
                                                        </table>
                                                    </div> : <><p>No SemesterReal Data</p></>
                                                }
                                            </div>
                                            <a onClick={() => this.handleShowModal(semesterId)} className="btn btn-primary text-white mb-2">
                                                <i className="icon-plus"></i>
                                            </a>
                                            <br />
                                            <br />
                                            <a href="/semester" className="btn btn-success text-center">Back to Semester List</a>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Modal show={showModal} onHide={this.handleCloseModal}>
                            <Modal.Header closeButton>
                                <Modal.Title>Create New Semester Item</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form>
                                    <Form.Group controlId="form">
                                        <Form.Label>Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter Name"
                                            value={newName}
                                            onChange={this.handleInputName}
                                        />
                                        <Form.Label className="pt-2">StartDate</Form.Label>
                                        <Form.Control
                                            type="date"
                                            placeholder="Enter StartDate"
                                            value={newStartDate}
                                            onChange={this.handleInputStart}
                                        />
                                        <Form.Label className="pt-2">EndDate</Form.Label>
                                        <Form.Control
                                            type="date"
                                            placeholder="Enter EndDate"
                                            value={newEndDate}
                                            onChange={this.handleInputEnd}
                                        />
                                    </Form.Group>
                                </Form>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={this.handleCloseModal}>
                                    Close
                                </Button>
                                <Button variant="primary" onClick={this.handleCreateOrUpdate}>
                                    Save
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </div>
                </div>
            </div>
        );
    }
}


export default withRouter(SemserterDetail);
