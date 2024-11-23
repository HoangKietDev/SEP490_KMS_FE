import React from "react";
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import { Tabs, Tab } from "react-bootstrap";
import imageuser from "../../assets/images/user.png";

class ProfileV1Page extends React.Component {
  state = {
    userData: null,
    updatedUserData: {
      firstname: "",
      lastName: "",
      address: "",
      phoneNumber: "",
      gender: 0, // 0 cho Female, 1 cho Male
      dob: "",
      mail: "",
      accounts: [],
    },
    selectedFile: null, // Lưu file ảnh
    previewImage: null, // URL để xem trước ảnh
  };

  componentDidMount() {
    window.scrollTo(0, 0);
    this.fetchUserData();
  }

  fetchUserData = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userId = storedUser.user.userId;

      const response = await fetch(`http://localhost:5124/api/User/ProfileById/${userId}`);
      const data = await response.json();

      this.setState({
        userData: data,
        updatedUserData: {
          firstname: data.firstname,
          lastName: data.lastName,
          address: data.address,
          phoneNumber: data.phoneNumber,
          gender: data.gender || 0, // Đảm bảo giá trị mặc định là 0 (Female)
          dob: data.dob ? data.dob.split("T")[0] : "",
          mail: data.mail,
          accounts: data.accounts,
        },
        previewImage: data.avatar || null, // Lưu URL avatar vào state
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };


  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState((prevState) => ({
      updatedUserData: {
        ...prevState.updatedUserData,
        [name]: value,
      },
    }));
  };

  handleGenderChange = (e) => {
    const selectedGender = e.target.value === "male" ? 1 : 0;
    this.setState((prevState) => ({
      updatedUserData: {
        ...prevState.updatedUserData,
        gender: selectedGender,
      },
    }));
  };

  handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);

      this.setState({
        selectedFile: file,
        previewImage: preview,
      });
    }
  };

  handleUpdate = async () => {
    const { updatedUserData, selectedFile } = this.state;
    const storedUser = JSON.parse(localStorage.getItem("user"));

    const formData = new FormData();
    formData.append("userId", storedUser.user.userId);
    formData.append("firstname", updatedUserData.firstname);
    formData.append("lastName", updatedUserData.lastName);
    formData.append("address", updatedUserData.address);
    formData.append("phoneNumber", updatedUserData.phoneNumber);
    formData.append("gender", updatedUserData.gender);
    formData.append("dob", updatedUserData.dob ? `${updatedUserData.dob}T00:00:00.000Z` : null);

    if (selectedFile) {
      formData.append("avatar", selectedFile);
    }

    try {
      const response = await fetch("http://localhost:5124/api/User/UpdateProfile", {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("User updated successfully:", result);
        alert("Cập nhật người dùng thành công!");
      } else {
        console.error("Failed to update user:", response.statusText);
        alert("Cập nhật người dùng thất bại.");
      }
    } catch (error) {
      console.error("Error updating user data:", error);
      alert("Có lỗi xảy ra trong quá trình cập nhật.");
    }
  };

  render() {
    const { updatedUserData, previewImage } = this.state;

    if (!updatedUserData) {
      return <div>Loading...</div>;
    }

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
              HeaderText="User Profile"
              Breadcrumb={[{ name: "Profile", navigate: "" }]}
            />
            <div className="row clearfix">
              <div className="col-lg-12">
                <div className="card">
                  <div className="body">
                    <Tabs defaultActiveKey="settings" id="uncontrolled-tab-example">
                      <Tab eventKey="settings" title="Settings">
                        <div>
                          <div className="body">
                            <h6>Profile Photo</h6>
                            <div className="media">
                              <div className="media-left m-r-15">
                                <img
                                  alt="User"
                                  className="user-photo media-object"
                                  src={this.state.previewImage || imageuser} // Sử dụng ảnh avatar hoặc ảnh mặc định
                                  style={{ width: "140px", height: "140px", objectFit: "cover" }}
                                />
                              </div>

                              <div className="media-body">
                                <p>
                                  Upload your photo. <br />
                                  <em>Image should be at least 140px x 140px</em>
                                </p>
                                <label className="btn btn-default-dark" htmlFor="filePhoto">
                                  Upload Photo
                                </label>
                                <input
                                  id="filePhoto"
                                  type="file"
                                  className="sr-only"
                                  accept="image/*"
                                  onChange={this.handleFileChange}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="body">
                            <h6>Basic Information</h6>
                            <div className="row clearfix">
                              <div className="col-lg-6 col-md-12">
                                <div className="form-group">
                                  <label>First Name</label>
                                  <input
                                    className="form-control"
                                    type="text"
                                    name="firstname"
                                    value={updatedUserData.firstname || ""}
                                    onChange={this.handleChange}
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Last Name</label>
                                  <input
                                    className="form-control"
                                    type="text"
                                    name="lastName"
                                    value={updatedUserData.lastName || ""}
                                    onChange={this.handleChange}
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Gender</label>
                                  <div>
                                    <label className="fancy-radio">
                                      <input
                                        name="gender"
                                        type="radio"
                                        value="male"
                                        checked={updatedUserData.gender === 1}
                                        onChange={this.handleGenderChange}
                                      />
                                      <span>
                                        <i></i>Male
                                      </span>
                                    </label>
                                    <label className="fancy-radio">
                                      <input
                                        name="gender"
                                        type="radio"
                                        value="female"
                                        checked={updatedUserData.gender === 0}
                                        onChange={this.handleGenderChange}
                                      />
                                      <span>
                                        <i></i>Female
                                      </span>
                                    </label>
                                  </div>
                                </div>
                                <div className="form-group">
                                  <label>Birthdate</label>
                                  <input
                                    className="form-control"
                                    type="date"
                                    name="dob"
                                    value={updatedUserData.dob || ""}
                                    onChange={this.handleChange}
                                  />
                                </div>
                              </div>
                              <div className="col-lg-6 col-md-12">
                                <div className="form-group">
                                  <label>Address</label>
                                  <input
                                    className="form-control"
                                    type="text"
                                    name="address"
                                    value={updatedUserData.address || ""}
                                    onChange={this.handleChange}
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Phone Number</label>
                                  <input
                                    className="form-control"
                                    type="text"
                                    name="phoneNumber"
                                    value={updatedUserData.phoneNumber || ""}
                                    onChange={this.handleChange}
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Email</label>
                                  <input
                                    className="form-control"
                                    type="email"
                                    name="mail"
                                    value={updatedUserData.mail || ""}
                                    readOnly
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Country</label>
                                  <select className="form-control" defaultValue="VN">
                                    <option value="">-- Select Country --</option>
                                    <option value="VN">Viet Nam</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                            <button className="btn btn-primary" type="button" onClick={this.handleUpdate}>
                              Update
                            </button>{" "}
                            &nbsp;&nbsp;
                            <button className="btn btn-default" type="button">
                              Cancel
                            </button>
                          </div>
                        </div>
                      </Tab>
                    </Tabs>
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

const mapStateToProps = (state) => {
  return {
    // Dữ liệu từ redux nếu cần
  };
};

export default connect(mapStateToProps)(ProfileV1Page);
