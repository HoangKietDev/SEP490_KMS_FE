
import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import axios from "axios";

class ServiceUpdate extends React.Component {
    state = {
        categories: [],
        serviceDetail: null,
        errorMessage: "",
        serviceName: "",
        servicePrice: "",
        serviceDes: "",
        categoryServiceId: ""
    };

    componentDidMount() {
        const { serviceId } = this.props.match.params;
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:5124/api/Service/GetServiceById/${serviceId}`);
                const data = response.data;

                const CategoryResponse = await axios.get('http://localhost:5124/api/CategoryService/GetAllCategoryService');
                const Categorydata = CategoryResponse.data;
                this.setState({ categories: Categorydata });

                this.setState({
                    serviceDetail: data,
                    serviceName: data.serviceName,
                    servicePrice: data.servicePrice,
                    serviceDes: data.serviceDes,
                    categoryServiceId: data.categoryService.categoryServiceId,
                });

                console.log(Categorydata);

            } catch (error) {
                console.error('Error fetching category details:', error);
            }
        };

        fetchData();
    };

    handleSubmit = async (event) => {

        event.preventDefault(); // Make sure this is at the top
        const updatedService = {
            serviceId: this.state.serviceDetail?.serviceId,
            serviceName: this.state.serviceName,
            servicePrice: this.state.servicePrice,
            serviceDes: this.state.serviceDes,
            categoryServiceId: this.state.categoryServiceId,
            schoolId: 1,
            categoryService: {
                categoryServiceId: this.state.categoryServiceId,
                categoryName: this.state.categories.find(cat => cat.categoryServiceId === this.state.categoryServiceId)?.categoryName, // Find category name based on selected id
            }
        };

        try {
            await axios.put(`http://localhost:5124/api/Service/UpdateService`, updatedService, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            alert("Service has been updated successfully!");
            this.props.history.push('/service');
        } catch (error) {
            console.error('Error updating Service:', error);
            this.setState({ errorMessage: 'Error updating Service' });
        }
    };

    render() {
        const { categories, serviceName, servicePrice, serviceDes, categoryServiceId } = this.state;

        return (
            <div style={{ flex: 1 }} onClick={() => document.body.classList.remove("offcanvas-active")}>
                <div>
                    <div className="container-fluid">
                        <PageHeader
                            HeaderText="Service Update"
                            Breadcrumb={[
                                { name: "Service", navigate: "" },
                                { name: "Service Update", navigate: "" },
                            ]}
                        />
                        <div className="row clearfix">
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="body">
                                        <form onSubmit={this.handleSubmit}>
                                            <div className="row">
                                                <div className="form-group col-md-6">
                                                    <label>Service Name</label>
                                                    <input
                                                        className={`form-control ${serviceName === "" && "parsley-error"
                                                            }`}
                                                        value={serviceName} // Bind value from state
                                                        name="serviceName"
                                                        required=""
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
                                                        className="form-control"
                                                        value={servicePrice}
                                                        name="servicePrice"
                                                        required=""
                                                        type="text"
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
                                                        className={`form-control ${serviceDes === "" && "parsley-error"
                                                            }`}
                                                        value={serviceDes} // Bind value from state
                                                        name="serviceDes"
                                                        required=""
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
                                                        required=""
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
                                            <button type="submit" className="btn btn-primary">Update Service</button>
                                            <a href="/service" className="btn btn-success text-center">Back to Service List</a>
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

const mapStateToProps = ({ updatedServiceReducer }) => ({});

export default connect(mapStateToProps, {})(ServiceUpdate);
