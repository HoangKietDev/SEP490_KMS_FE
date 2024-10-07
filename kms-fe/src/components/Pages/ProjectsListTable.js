import React from "react";
import { connect } from "react-redux";

class ProjectsListTable extends React.Component {
  render() {
    const { bodyData } = this.props;
    return (
      <div className="table-responsive">
        <table className="table m-b-0 table-hover">
          <thead className="thead-light">
            <tr>
              <th>Class Name</th>
              <th>Status</th>
              <th>Expire Date</th>
              <th>School ID</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bodyData.map((data, i) => {
              return (
                <tr key={"class" + i}>
                  <td>{data.className}</td>
                  <td>
                    {data.isActive === 1 ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-default">Inactive</span>
                    )}
                  </td>
                  <td>{new Date(data.expireDate).toLocaleDateString()}</td>
                  <td>{data.schoolId}</td>
                  <td className="project-actions">
                    <a className="btn btn-outline-secondary mr-1">
                      <i className="icon-eye"></i>
                    </a>
                    <a className="btn btn-outline-secondary">
                      <i className="icon-pencil"></i>
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

const mapStateToProps = ({ mailInboxReducer }) => ({});

export default connect(mapStateToProps, {})(ProjectsListTable);
