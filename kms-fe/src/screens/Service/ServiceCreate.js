import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import axios from "axios";
import Notification from "../../components/Notification";

class ServiceCreate extends React.Component {

    state = {
        categories: [],
        serviceDetail: null,
        errorMessage: "",
        serviceName: "",
        servicePrice: "",
        serviceDes: "",
        categoryServiceId: 0,

        showNotification: false, // Để hiển thị thông báo
        notificationText: "", // Nội dung thông báo
        notificationType: "success", // Loại thông báo (success/error)
    };

    componentDidMount() {
        window.scrollTo(0, 0);
        const fetchData = async () => {
            try {
                const CategoryResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/CategoryService/GetAllCategoryService`);
                const Categorydata = CategoryResponse.data;
                this.setState({ categories: Categorydata })
            } catch (error) {
                console.error('Error fetching category details:', error);
            }
        };
        fetchData();
    }

    handleCreatService = async (event) => {
        event.preventDefault(); // Ngăn hành vi mặc định của form
        const newService = {
            serviceName: this.state.serviceName,
            servicePrice: this.state.servicePrice,
            serviceDes: this.state.serviceDes,
            categoryServiceId: this.state.categoryServiceId,
            schoolId: 1,
            status: 0,
        };
        console.log(newService);
        if (this.state.servicePrice <= 0) {
            this.setState({
                notificationText: "Number of Service Price must grater than 0",
                notificationType: "error",
                showNotification: true,
            });
            return;
        }
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/Service/AddService`, newService
            );
            this.setState({
                notificationText: "Service create successfully!",
                notificationType: "success",
                showNotification: true,
            });
            setTimeout(() => {
                if (this.state.showNotification) {
                    this.props.history.push('/service');
                }
            }, 1000);
        } catch (error) {
            this.setState({
                notificationText: "Service create error!",
                notificationType: "error",
                showNotification: true,
            });
        }
    };

    render() {

        const { categories, serviceName, servicePrice, serviceDes, categoryServiceId } = this.state;
        const { showNotification, notificationText, notificationType } = this.state;

        return (
            <div
                style={{ flex: 1 }}
                onClick={() => {
                    document.body.classList.remove("offcanvas-active");
                }}
            >
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
                            HeaderText="New Service"
                            Breadcrumb={[
                                { name: "Service", navigate: "service" },
                                { name: "New Service", navigate: "" },
                            ]}
                        />
                        <div className="row clearfix">
                            <div className="col-md-12">
                                <div className="card shadow-lg">
                                    <div className="card-header text-white theme-colorbg">
                                        <h4 className="mb-0">Create Service</h4>
                                    </div>
                                    <div className="body">
                                        <form className="ng-untouched ng-dirty ng-invalid" onSubmit={this.handleCreatService}>
                                            <div className="row">
                                                <div className="form-group col-md-6">
                                                    <label>Service Name</label>
                                                    <input
                                                        className={`form-control`}
                                                        value={serviceName} // Bind value from state
                                                        name="serviceName"
                                                        required
                                                        type="text"
                                                        onChange={(e) => {
                                                            this.setState({
                                                                [e.target.name]: e.target.value,
                                                            });
                                                        }}
                                                    />
                                                </div>
                                                <div className="form-group col-md-6">
                                                    <label>Service Price</label>
                                                    <input
                                                        className={`form-control`}
                                                        value={servicePrice}
                                                        name="servicePrice"
                                                        required
                                                        type="number"
                                                        onChange={(e) => {
                                                            this.setState({ [e.target.name]: e.target.value });
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="form-group col-md-6">
                                                    <label>Service Description</label>
                                                    <input
                                                        className={`form-control`}
                                                        value={serviceDes} // Bind value from state
                                                        name="serviceDes"
                                                        required
                                                        type="text"
                                                        onChange={(e) => {
                                                            this.setState({
                                                                [e.target.name]: e.target.value,
                                                            });
                                                        }}
                                                    />
                                                </div>
                                                <div className="form-group col-md-6">
                                                    <label>Category Name</label>
                                                    <select
                                                        className="form-control"
                                                        value={categoryServiceId} // Bind categoryServiceId directly
                                                        name="categoryServiceId"
                                                        required
                                                        onChange={(e) => this.setState({ categoryServiceId: e.target.value })}
                                                    >
                                                        <option value="">Select Category</option>
                                                        {categories.map((option) => (
                                                            <option key={option?.categoryServiceId} value={option?.categoryServiceId}>
                                                                {option.categoryName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <br />
                                            <a href="/service" className="btn btn-success text-center">Back to Service List</a>
                                            <button type="submit" className="btn btn-primary ml-4">Create Service</button>
                                        </form>

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

const mapStateToProps = ({ CreateCategoryReducer }) => ({});

export default connect(mapStateToProps, {})(ServiceCreate);
