import React from "react";
import { connect } from "react-redux";
import axios from 'axios'; // Import axios
import 'bootstrap/dist/css/bootstrap.min.css';
import Logo from "../../assets/images/logo-white.svg";

class ForgotPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",  // State to store email input
      errorMessage: "",
      successMessage: "",
    };
    
  }

  handleEmailChange = (event) => {
    this.setState({ email: event.target.value });  // Update state with email input
  }

  handleSubmit = async (event) => {
    event.preventDefault();  // Prevent default form submission
    const { email } = this.state;

    if (!email) {
      this.setState({ errorMessage: "Please enter a valid email address." });
      return;
    }
    console.log(email);
    
    try {
      const response = await axios.post("http://localhost:5124/api/Account/forgot-password", {
        mail: email,  // Send the email in the request body
      });

      if (response.status === 200) {
        this.setState({
          successMessage: "Password reset instructions have been sent to your email.",
          errorMessage: "",
        });
        // Optionally redirect to login
        this.props.history.push("login");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        this.setState({ errorMessage: error.response.data.message || "Failed to send reset instructions." });
      } else {
        this.setState({ errorMessage: "An error occurred while sending the request." });
      }
    }
  }

  render() {
    return (
      <div className="theme-cyan">
        <div >
          <div className="vertical-align-wrap">
            <div className="vertical-align-middle auth-main">
              <div className="auth-box">
                <div className="top">
                  <img src={Logo} alt="Lucid" style={{ height: "40px", margin: "10px" }} />
                </div>
                <div className="card">
                  <div className="header">
                    <p className="lead">Recover my password</p>
                  </div>
                  <div className="body">
                    <p>Please enter your email address below to receive instructions for resetting password.</p>
                    <form className="form-auth-small ng-untouched ng-pristine ng-valid" onSubmit={this.handleSubmit}>
                      <div className="form-group">
                        <input
                          className="form-control"
                          placeholder="Email"
                          type="email"
                          value={this.state.email}
                          onChange={this.handleEmailChange} // Capture email input
                          required
                        />
                      </div>
                      {this.state.errorMessage && (
                        <p style={{ color: "red" }}>{this.state.errorMessage}</p>
                      )}
                      {this.state.successMessage && (
                        <p style={{ color: "green" }}>{this.state.successMessage}</p>
                      )}
                      <button className="btn btn-primary btn-lg btn-block" type="submit">
                        RESET PASSWORD
                      </button>
                      <div className="bottom">
                        <span className="helper-text">Know your password? <a href="login">Login</a></span>
                      </div>
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

ForgotPassword.propTypes = {
};

const mapStateToProps = ({ loginReducer }) => ({
});

export default connect(mapStateToProps, {
})(ForgotPassword);
