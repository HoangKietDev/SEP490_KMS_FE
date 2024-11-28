
import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import { getSession } from '../../components/Auth/Auth';
import Pagination from "../../components/Common/Pagination";

class Paymenttuition extends React.Component {
    state = {
        paymentAll: [],
        searchText: "",

        startDate: "", // Lưu trữ ngày bắt đầu
        endDate: "", // Lưu trữ ngày kết thúc

        currentPage: 1,
        itemsPerPage: 10,
    };
    componentDidMount() {
        window.scrollTo(0, 0);
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5124/api/Tuition/GetAllTuitionsCheckGene');

                const data = response.data;
                this.setState({
                    paymentAll: data,
                });
                console.log(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }


    handleViewDetail = (paymentId) => {
        // Chuyển hướng đến trang chi tiet category
        this.props.history.push(`/payment-detail/${paymentId}`);
    };


    handleSearchChange = (e) => {
        this.setState({ searchText: e.target.value });
    };

    handleDateRangeFilter = () => {
        const { startDate, endDate, paymentAll } = this.state;

        // Nếu chưa có đủ thông tin về ngày bắt đầu và ngày kết thúc, không lọc
        if (!startDate || !endDate) return paymentAll;

        const start = new Date(startDate);  // Chuyển startDate thành đối tượng Date
        const end = new Date(endDate);      // Chuyển endDate thành đối tượng Date

        return paymentAll.filter(item => {
            const paymentStartDate = new Date(item.startDate);  // Lấy ngày bắt đầu của item
            const paymentEndDate = new Date(item.endDate);      // Lấy ngày kết thúc của item

            // Kiểm tra nếu ngày bắt đầu của item lớn hơn hoặc bằng startDate và ngày kết thúc của item nhỏ hơn hoặc bằng endDate
            return paymentStartDate >= start && paymentEndDate <= end;
        });
    };




    handlePageChange = (pageNumber) => {
        this.setState({ currentPage: pageNumber });
    };

    render() {

        const { paymentAll, searchText, startDate, endDate, classList } = this.state;

        const userData = getSession('user').user;
        const roleId = userData.roleId

        // Lọc theo tên
        const filteredpaymentAll = this.handleDateRangeFilter().filter((item) =>
            item.studentName.toLowerCase().includes(searchText.toLowerCase())
        );

        // phan trang
        const { currentPage, itemsPerPage } = this.state;
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = filteredpaymentAll.slice(indexOfFirstItem, indexOfLastItem);

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
                            HeaderText="Tuition Management"
                            Breadcrumb={[
                                { name: "Tuition", navigate: "" },
                            ]}
                        />
                        <div className="row clearfix">
                            <div className="col-lg-12 col-md-12">
                                <div className="card planned_task">
                                    <div className="header d-flex justify-content-between">
                                        <h2>Tuition Manager</h2>
                                    </div>
                                    <div className="form-group row pl-3">
                                        <div className="col-md-3 mb-2">
                                            <label>Search</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Search by Children Name"
                                                value={searchText}
                                                onChange={this.handleSearchChange}
                                            />
                                        </div>


                                        <div className="col-md-3 mb-2">
                                            <label>StartDate</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={startDate}
                                                onChange={(e) => this.setState({ startDate: e.target.value })}
                                            />
                                        </div>

                                        <div className="col-md-3 mb-2">
                                            <label>EndDate</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={endDate}
                                                onChange={(e) => this.setState({ endDate: e.target.value })}
                                            />
                                        </div>

                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-12">
                                <div className="card">
                                    <div className="table-responsive">
                                        <table className="table m-b-0 table-hover">
                                            <thead className="">
                                                <tr className="theme-color">
                                                    <th>#</th>
                                                    <th>Children</th>
                                                    <th>Code</th>
                                                    <th>Semester</th>
                                                    <th>Start Date</th>
                                                    <th>End Date</th>
                                                    <th>tuitionFee</th>
                                                    <th>Due Date</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentItems.map((item, i) => {
                                                    return (
                                                        <tr key={"dihf" + i}>

                                                            <td className="project-title">
                                                                <th scope="row">{i + 1}</th>
                                                            </td>
                                                            <td>
                                                                {item?.studentName}
                                                            </td>
                                                            <td>
                                                                {item?.code}
                                                            </td>
                                                            <td>
                                                                {item?.semesterName}
                                                            </td>
                                                            <td>
                                                                {item?.startDate?.split("T")[0]}
                                                            </td>
                                                            <td>
                                                                {item?.endDate?.split("T")[0]}
                                                            </td>
                                                            <td>
                                                                {item?.tuitionFee}
                                                            </td>
                                                            <td>
                                                                {item?.dueDate?.split("T")[0]}
                                                            </td>

                                                            <td>
                                                                {item.isPaid === 1 ? (
                                                                    <span className="badge badge-success">Paid</span>
                                                                ) : item?.isPaid === 0 ? (
                                                                    <span className="badge badge-default">Unpaid </span>
                                                                ) : null}
                                                            </td>

                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="pt-4">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalItems={filteredpaymentAll.length}
                                            itemsPerPage={itemsPerPage}
                                            onPageChange={this.handlePageChange}
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div >
            </div >
        );
    }
}

export default withRouter(Paymenttuition);