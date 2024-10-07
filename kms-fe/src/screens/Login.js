import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import 'bootstrap/dist/css/bootstrap.min.css';
import Logo from "../assets/images/logo-white.svg";
import {updateUsername, updatePassword, onLoggedin } from "../actions";
import { Button } from "react-bootstrap";


class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoad: true
    }
  }
  componentDidMount() {
    setTimeout(() => {
      this.setState({
        isLoad: false
      })
    }, 500);
    document.body.classList.remove("theme-cyan");
    document.body.classList.remove("theme-purple");
    document.body.classList.remove("theme-blue");
    document.body.classList.remove("theme-green");
    document.body.classList.remove("theme-orange");
    document.body.classList.remove("theme-blush");
  }

  handleOnSubmit = async (evt) => {
    evt.preventDefault();
    try {
      // Gọi API để lấy danh sách account
      const response = await fetch("http://localhost:5124/api/Login/GetAllData");
      if (!response.ok) {
        throw new Error("Failed to fetch accounts");
      }
      const accountList = await response.json();
      console.log(accountList);

      // Tìm account có username và password trùng khớp, và status = 1
      const matchedAccount = accountList.find(user =>
        user.accounts.some(account =>
          account.username === this.props.username &&
          account.password === this.props.password &&
          account.status === 1
        )
      );

      if (matchedAccount) {
        // Đăng nhập thành công
        alert("Login successful!");

        // Lưu username hoặc token vào localStorage
        localStorage.setItem("user", this.props.username);

        // Ví dụ: bạn có thể chuyển hướng đến dashboard
        window.location.href = "/dashboard";
      } else {
        // Sai username/password hoặc tài khoản bị khóa (status != 1)
        alert("Incorrect username or password, or your account is inactive.");
      }
    } catch (error) {
      alert("Something went wrong. Please try again later.");
    }
  };
  
  render() {
    const { navigation } = this.props;
    const { username, password } = this.props;
    return (
      <div className="theme-cyan">
        <div className="page-loader-wrapper" style={{ display: this.state.isLoad ? 'block' : 'none' }}>
          <div className="loader">
            <div className="m-t-30"><img src={require('../assets/images/logo-icon.svg')} width="48" height="48" alt="Lucid" /></div>
            <p>Please wait...</p>
          </div>
        </div>
        <div className="hide-border">
          <div className="vertical-align-wrap">
            <div className="vertical-align-middle auth-main">
              <div className="auth-box">
                <div className="top">
                  <img src={Logo} alt="Lucid" style={{ height: "40px", margin: "10px" }} />
                </div>
                <div className="card">
                  <div className="header">
                    <p className="lead">Login to your account</p>
                  </div>
                  <div className="body">
                    <div className="form-auth-small">
                      <form class="space-y-4 md:space-y-6" onSubmit={this.handleOnSubmit}>
                        <div className="form-group">
                          <label className="control-label sr-only">Username</label>
                          <input
                            className="form-control"
                            id="signin-username"
                            placeholder="Username"
                            type="text"
                            value={username}
                            onChange={val => {
                              this.props.updateUsername(val.target.value);
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label className="control-label sr-only">
                            Password
                          </label>
                          <input
                            className="form-control"
                            id="signin-password"
                            placeholder="Password"
                            type="password"
                            value={password}
                            onChange={val => {
                              this.props.updatePassword(val.target.value);
                            }}
                          />
                        </div>
                        <div className="form-group clearfix">
                          <label className="fancy-checkbox element-left">
                            <input type="checkbox" />
                            <span>Remember me</span>
                          </label>
                        </div>
                        <Button
                          type="submit"
                          className="btn btn-primary btn-lg btn-block"
                        >Login</Button>

                      </form>
                      <div className="bottom">
                        <span className="helper-text m-b-10">
                          <i className="fa fa-lock"></i>{" "}
                          <a href={`${process.env.PUBLIC_URL}/forgotpassword`}
                          >
                            Forgot password?
                          </a>
                        </span>
                      </div>
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

Login.propTypes = {
  // updateEmail: PropTypes.func.isRequired,
  updateUsername: PropTypes.func.isRequired,
  updatePassword: PropTypes.func.isRequired,
  email: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired
};

const mapStateToProps = ({ loginReducer }) => ({
  username: loginReducer.username,
  password: loginReducer.password
});

export default connect(mapStateToProps, {
  updateUsername,
  updatePassword,
  onLoggedin
})(Login);
