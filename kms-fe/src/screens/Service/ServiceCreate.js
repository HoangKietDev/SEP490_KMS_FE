import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import BasicValidation from "../../components/Forms/BasicValidation";
import axios from "axios";

class ServiceCreate extends React.Component {

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
        window.scrollTo(0, 0);
        const fetchData = async () => {
            try {
                const CategoryResponse = await axios.get('http://localhost:5124/api/CategoryService/GetAllCategoryService');
                const Categorydata = CategoryResponse.data;
                this.setState({ categories: Categorydata })
            } catch (error) {
                console.error('Error fetching category details:', error);
            }
        };
        fetchData();
    }

    handleCreatService = async () => {

        const newService = {
            serviceName: this.state.serviceName,
            servicePrice: this.state.servicePrice,
            serviceDes: this.state.serviceDes,
            categoryServiceId: this.state.categoryServiceId,
            schoolId: 1,
            categoryService: {
                categoryServiceId: this.state.categoryServiceId,
                categoryName: this.state.categories.find(cat => cat.categoryServiceId === this.state.categoryServiceId)?.categoryName,
            }
        };

        console.log(newService);
        try {
            const response = await axios.post(
                "http://localhost:5124/api/Service/AddService", newService
            );
            console.log("Tạo service thành công:", response.data);
            alert("Tạo service thành công!"); // User-friendly success message
            this.props.history.push('/service'); // Redirect to category list after successful update
            
        } catch (error) {
            console.error("Lỗi khi tạo service:", error);
            alert("Lỗi khi tạo service!"); // User-friendly error message
        }
    };

    render() {

        const { categories, serviceName, servicePrice, serviceDes, categoryServiceId } = this.state;

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
                            HeaderText="New Service"
                            Breadcrumb={[
                                { name: "Service", navigate: "" },
                                { name: "New Service", navigate: "" },
                            ]}
                        />
                        <div className="row clearfix">
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="header text-center">
                                        <h4>Create new category Form</h4>
                                    </div>
                                    <div className="body">
                                        <form className="ng-untouched ng-dirty ng-invalid" onSubmit={this.handleCreatService}>
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
                                                        className={`form-control ${servicePrice === "" && "parsley-error"
                                                        }`}
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
                                            <button type="submit" className="btn btn-success text-center">
                                                Create
                                            </button>
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
