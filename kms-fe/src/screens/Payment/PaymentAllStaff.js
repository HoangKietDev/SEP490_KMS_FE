
import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import PageHeader from "../../components/PageHeader";
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import { getSession } from '../../components/Auth/Auth';
import Pagination from "../../components/Common/Pagination";

class PaymentAllStaff extends React.Component {
    state = {
        paymentAll: [],
        classList: [],
        searchText: "",

        paymentDate: new Date().toISOString().split('T')[0], // Lấy ngày theo định dạng YYYY-MM-DD
        selectDate: false,

        currentPage: 1,
        itemsPerPage: 10,
    };
    componentDidMount() {
        window.scrollTo(0, 0);
        const fetchData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/Payment/get-all-payment-histories`);
                const responseClass = await axios.get(`${process.env.REACT_APP_API_URL}/api/Class/GetAllClass`);

                const data = response.data;
                const dataClass = responseClass.data;

                this.setState({
                    paymentAll: data,
                    classList: dataClass
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




    handlePageChange = (pageNumber) => {
        this.setState({ currentPage: pageNumber });
    };

    render() {

        const { paymentAll, searchText, paymentDate, selectDate } = this.state;

        const userData = getSession('user')?.user;
        const roleId = userData.roleId

        // Lọc theo tên (searchText)
        let filteredpaymentAll = paymentAll.filter((item) =>
            item.childName.toLowerCase().includes(searchText.toLowerCase())
        );

        // Lọc theo paymentDate (nếu có)
        if (selectDate) {
            filteredpaymentAll = filteredpaymentAll.filter((item) => {
                const paymentDateItem = item.paymentDate?.split("T")[0]; // Chuyển đổi paymentDate thành định dạng YYYY-MM-DD
                return paymentDateItem === paymentDate; // So sánh với paymentDate đã chọn
            });
        }

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
                            HeaderText="Payment Management"
                            Breadcrumb={[
                                { name: "PaymentAll", navigate: "" },
                            ]}
                        />
                        <div className="row clearfix">
                            <div className="col-lg-12 col-md-12">
                                <div className="card planned_task">
                                    <div className="header d-flex justify-content-between">
                                        <h2>Payment Manager</h2>
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
                                            <label>Payment Date</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={paymentDate}
                                                onChange={(e) => this.setState({ paymentDate: e.target.value, selectDate: true })}
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
                                                    <th>Parent</th>
                                                    <th>Payment Name</th>
                                                    <th>Payment Date</th>
                                                    <th>Total</th>
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
                                                                {item?.childName}
                                                            </td>
                                                            <td>
                                                                {item?.parentName}
                                                            </td>
                                                            <td>
                                                                {item?.paymentName}
                                                            </td>
                                                            <td>
                                                                {item?.paymentDate?.split("T")[0]}
                                                            </td>
                                                            <td>
                                                                {item?.totalAmount?.toLocaleString('vi-VN')}
                                                            </td>
                                                            <td>

                                                                <span className="badge badge-success">Paid</span>

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

export default withRouter(PaymentAllStaff);