import React from "react";
import { connect } from "react-redux";
import Select from "react-dropdown-select";

class BasicValidation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      textInput: "",
      emailInput: "",
      areaInput: "",
      submeet: false,
    };
  }
  render() {
    const { textInput, emailInput, areaInput, submeet } = this.state;
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return (
      <div className="col-md-12">
        <div className="card">
          <div className="header">
            <h2>Basic Validation</h2>
          </div>
          <div className="body">
            <form className="ng-untouched ng-dirty ng-invalid">
              <div className="form-group">
                <label>Text Input</label>
                <input
                  className={`form-control ${
                    textInput === "" && submeet && "parsley-error"
                  }`}
                  value={textInput}
                  name="text"
                  required=""
                  onChange={(e) => {
                    this.setState({
                      textInput: e.target.value,
                      submeet: false,
                    });
                  }}
                />
                {textInput === "" && submeet ? (
                  <ul className="parsley-errors-list filled" id="parsley-id-29">
                    <li className="parsley-required">
                      This value is required.
                    </li>
                  </ul>
                ) : null}
              </div>
              <div className="form-group">
                <label>Email Input</label>
                <input
                  className={`form-control ${
                    !reg.test(emailInput) && submeet && "parsley-error"
                  }`}
                  value={emailInput}
                  name="email"
                  pattern="^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$"
                  required=""
                  type="email"
                  onChange={(e) => {
                    this.setState({ emailInput: e.target.value });
                  }}
                />
                {submeet && !reg.test(emailInput) ? (
                  <ul className="parsley-errors-list filled" id="parsley-id-29">
                    <li className="parsley-required">
                      This value is required.
                    </li>
                  </ul>
                ) : null}
              </div>
              <div className="form-group">
                <label>Text Area</label>
                <textarea
                  className={`form-control ${
                    areaInput === "" && submeet && "parsley-error"
                  }`}
                  value={areaInput}
                  cols="30"
                  name="textarea"
                  required=""
                  rows="5"
                  onChange={(e) => {
                    this.setState({ areaInput: e.target.value });
                  }}
                ></textarea>
                {areaInput === "" && submeet ? (
                  <ul className="parsley-errors-list filled" id="parsley-id-29">
                    <li className="parsley-required">
                      This value is required.
                    </li>
                  </ul>
                ) : null}
              </div>
              <div className="form-group">
                <label>Checkbox</label>
                <br />
                <label className="fancy-checkbox">
                  <input name="checkbox" type="checkbox" />
                  <span>Option 1</span>
                </label>
                <label className="fancy-checkbox">
                  <input name="checkbox" type="checkbox" />
                  <span>Option 2</span>
                </label>
                <label className="fancy-checkbox">
                  <input name="checkbox" type="checkbox" />
                  <span>Option 3</span>
                </label>
              </div>
              <div className="form-group">
                <label>Radio Button</label>
                <br />
                <label className="fancy-radio">
                  <input
                    data-parsley-errors-container="#error-radio"
                    name="gender"
                    required=""
                    type="radio"
                    value="male"
                  />
                  <span>
                    <i></i>Male
                  </span>
                </label>
                <label className="fancy-radio">
                  <input name="gender" type="radio" value="female" />
                  <span>
                    <i></i>Female
                  </span>
                </label>
              </div>
              <div className="form-group">
                <label>Multiselect</label>
                <br />
                <Select
                  className="js-states "
                  placeholder=""
                  options={[]}
                  values={[
                    { label: " Mozzarella ", value: " Mozzarella " },
                    { label: "Mushrooms", value: "Mushrooms" },
                  ]}
                  disabled={false}
                  create={true}
                  multi={true}
                  dropdownHandle={false}
                  searchable={true}
                  onChange={(values) => {}}
                />
              </div>
              <br />
            </form>
            <button
              className="btn btn-primary"
              onClick={() => {
                this.setState({ submeet: true });
              }}
            >
              Validate
            </button>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ mailInboxReducer }) => ({});

export default connect(mapStateToProps, {})(BasicValidation);
