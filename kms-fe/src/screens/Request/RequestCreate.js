import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import axios from "axios";

class RequestCreate extends React.Component {
    state = {
        requestId: 1,
        title: "Change Class",
        description: "",
        statusRequest: 1,
        createAt: new Date().toLocaleDateString(),
        createBy: "Staff",
        classId: 101,
        studentId: '',
        classChangeId: 103,
        ReasonReject: "",
        childerParent: [],
        classAll: [],
        studentClasses: null // Start with null for better control
    };

    typeRequest = [
        { typeRequestId: 1, typeRequestName: "Change Class" },
        { typeRequestId: 2, typeRequestName: "More Request" },
    ];

    componentDidMount() {
        window.scrollTo(0, 0);
        const fetchData = async () => {
            try {
                const CategoryResponse = await axios.get('http://localhost:5124/api/CategoryService/GetAllCategoryService');
                const Categorydata = CategoryResponse.data;
                this.setState({ categories: Categorydata });

                // Fetch student by ParentID
                const user = localStorage.getItem("user");
                const parentId = JSON.parse(user).user.userId;
                const studentResponse = await axios.get(`http://localhost:5124/api/Request/GetStudentsByParentId/${parentId}`);
                const studentData = studentResponse.data;
                this.setState({ createBy: parentId });

                // Fetch all class
                const classAllResponse = await axios.get(`http://localhost:5124/api/Class/GetAllClass`);
                const classAllData = classAllResponse.data;

                this.setState({ childerParent: studentData, classAll: classAllData });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }

    handleStudentChange = async (e) => {
        const studentId = e.target.value;
        this.setState({ studentId });
        try {
            // Fetch classes for the selected student
            const classResponse = await axios.get(`http://localhost:5124/api/Class/GetClassesByStudentId/${studentId}`);
            const classData = classResponse.data;

            // If classData is an array with a single object, set it directly; otherwise, set to null
            this.setState({ studentClasses: classData.length === 1 ? classData[0] : null });
        } catch (error) {
            console.error("Error fetching class data:", error);
        }
    };

    handleCreateRequest = async (e) => {
        e.preventDefault(); // Prevent default form submission
        const { studentId, classChangeId, description, studentClasses, createBy, reasonReject} = this.state;

        const newRequest = {
            studentId,
            title: "Change Class",
            createAt: new Date().toISOString().slice(0, 19),
            createBy,
            statusRequest: 1,
            classChangeId,
            description,
            reasonReject,
            classId: studentClasses ? studentClasses.classId : null, // Ensure you are getting the class ID
        };
        console.log(newRequest);
        try {
            const response = await axios.post("http://localhost:5124/api/Request/AddRequest", newRequest);
            
            console.log("Request created successfully:", response.data);
            alert("Request created successfully!");
            this.props.history.push('/request'); 
        } catch (error) {
            console.error("Error creating request:", error);
            alert("Error creating request!");
        }
    };

    render() {
        const { studentId, childerParent, typeRequestId, classAll, classChangeId, description, studentClasses } = this.state;

        return (
            <div style={{ flex: 1 }} onClick={() => document.body.classList.remove("offcanvas-active")}>
                <div className="container-fluid">
                    <PageHeader
                        HeaderText="New Request"
                        Breadcrumb={[
                            { name: "Request", navigate: "request" },
                            { name: "New Request", navigate: "" },
                        ]}
                    />
                    <div className="row clearfix">
                        <div className="col-lg-12 col-md-12">
                            <div className="card planned_task">
                                <div className="header d-flex justify-content-between">
                                    <div className="form-group col-md-6">
                                        <label>Type Request</label>
                                        <select
                                            className="form-control"
                                            value={typeRequestId}
                                            name="typeRequestId"
                                            required
                                            onChange={(e) => this.setState({ typeRequestId: e.target.value })}
                                        >
                                            <option value="">Choose Type Request</option>
                                            {this.typeRequest.map((option) => (
                                                <option key={option.typeRequestId} value={option.typeRequestId}>
                                                    {option.typeRequestName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {typeRequestId === "1" && ( // Check if type request is "Change Class"
                            <div className="col-md-12">
                                <div className="card">
                                    <div className="header text-center">
                                        <h4>Change Class Form Request</h4>
                                    </div>
                                    <div className="body">
                                        <form onSubmit={this.handleCreateRequest}>
                                            <div className="row">
                                                <div className="form-group col-md-6">
                                                    <label>Children</label>
                                                    <select
                                                        className="form-control"
                                                        value={studentId}
                                                        name="studentId"
                                                        required
                                                        onChange={this.handleStudentChange}
                                                    >
                                                        <option value="">Choose Student</option>
                                                        {childerParent.map((option) => (
                                                            <option key={option.studentId} value={option.studentId}>
                                                                {option.fullName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="form-group col-md-6">
                                                    <label>Class Studying</label>
                                                    <input
                                                        className="form-control"
                                                        value={studentClasses ? studentClasses.className : ''}
                                                        name="studentClasses"
                                                        required
                                                        type="text"
                                                        readOnly // Making this read-only since it auto-fills based on selection
                                                    />
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="form-group col-md-6">
                                                    <label>Class Want To Change</label>
                                                    <select
                                                        className="form-control"
                                                        value={classChangeId}
                                                        name="classChangeId"
                                                        required
                                                        onChange={(e) => this.setState({ classChangeId: e.target.value })}
                                                    >
                                                        <option value="">Choose Class Change</option>
                                                        {classAll.map((option) => (
                                                            <option key={option.classId} value={option.classId}>
                                                                {option.className}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="form-group col-md-12 d-flex flex-column">
                                                    <label>Description</label>
                                                    <textarea
                                                        className="form"
                                                        rows="6"
                                                        value={description}
                                                        name="description"
                                                        onChange={(e) => this.setState({ description: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <br />
                                            <div className="text-center">
                                                <button type="submit" className="btn btn-success">
                                                    Create Request
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = ({ ioTReducer }) => ({
    isSecuritySystem: ioTReducer.isSecuritySystem,
});

export default connect(mapStateToProps, {})(RequestCreate);
