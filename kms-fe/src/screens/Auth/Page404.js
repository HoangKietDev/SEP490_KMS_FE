import React from "react";
import { connect } from "react-redux";
import 'bootstrap/dist/css/bootstrap.min.css';
import Logo from "../../assets/images/logo-white.png";

class Page404 extends React.Component {
  render() {
    return (
      <div className="theme-cyan">
        <div >
          <div className="vertical-align-wrap">
            <div className="vertical-align-middle auth-main">
              <div className="auth-box">
                <div className="top">
                  <img src={Logo} alt="EduNest" style={{ width: "50%", margin: "10px" }} />
                </div>
                <div className="card">
                  <div className="header">
                    <h3 >
                      <span className="clearfix title">
                        <span className="number left">404</span>
                        <span className="text">Oops! <br />Page Not Found</span>
                        <span className="text"> <br /> <br />Or you do not have permission to access</span>
                      </span>
                    </h3>
                  </div>
                  <div className="body">
                    <div className="margin-top-30">
                      <a className="btn btn-default" onClick={() => this.props.history.goBack()}><i className="fa fa-arrow-left"></i>&nbsp;<span >Go Back</span></a>&nbsp;
                      <a className="btn btn-primary" href="/"><i className="fa fa-home"></i>&nbsp;<span >Home</span></a>
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

Page404.propTypes = {
};

const mapStateToProps = ({ loginReducer }) => ({
});

export default connect(mapStateToProps, {
})(Page404);
