import React from "react";
import { withRouter } from "react-router-dom";
import "react-calendar/dist/Calendar.css";
import PageHeader from "../../components/PageHeader";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

class UpdateMenu extends React.Component {
    state = {
        selectedWeek: {
            startOfWeek: new Date(),
            endOfWeek: new Date(),
        },
        menuData: {},
        daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        showModal: false,
        structuredMenuData: null,
        selectedMenuItem: null,
        gradeId: null,
    };

    componentDidMount() {
        const { gradeId, startDate, endDate } = this.props.location.state;
        const { startOfWeek, endOfWeek } = this.getWeekRange(new Date());
        console.log(startOfWeek,"start week");
        console.log(endOfWeek,"end week");
        this.setState({
            selectedWeek: { startOfWeek, endOfWeek },
            gradeId: gradeId
        }, () => {
            this.fetchMenuData(startDate, endDate, gradeId);
        });
    }

    getWeekRange = (date) => {
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        const diff = day === 0 ? 6 : day - 1;
        startOfWeek.setDate(startOfWeek.getDate() - diff);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        return { startOfWeek, endOfWeek };
    };

    // fetchMenuData = async (startOfWeek, endOfWeek, gradeId) => {
    //     try {
    //         const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/Menu/GetMenuByDate`, {
    //             params: { startDate: startOfWeek, endDate: endOfWeek, gradeId },
    //         });

    //         const menuData = response.data[0];
    //         if (menuData) {
    //             const structuredMenuData = this.structureMenuData(menuData);
    //             this.setState({
    //                 structuredMenuData,
    //                 menuData: { [gradeId]: structuredMenuData.menuDetails },
    //             });
    //         } else {
    //             // Nếu không có menu cho grade này, vẫn gán mảng rỗng
    //             this.setState({
    //                 structuredMenuData: null,
    //                 menuData: { [gradeId]: [] },
    //             });
    //         }
    //     } catch (error) {
    //         console.error("Error fetching menu data:", error);
    //     }
    // };
    fetchMenuData = async (startOfWeek, endOfWeek, gradeId) => {
        // Nếu startOfWeek và endOfWeek đang là chuỗi, parse chúng sang Date
        const start = typeof startOfWeek === 'string' ? new Date(startOfWeek) : startOfWeek;
        const end = typeof endOfWeek === 'string' ? new Date(endOfWeek) : endOfWeek;

        const startDate = this.formatDate(start);
        const endDate = this.formatDate(end);

        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/Menu/GetMenuByDate`, {
                params: { startDate, endDate },
            });

            const data = response.data;
            const menuForGrade = data.find(m => m.gradeIDs.includes(gradeId));

            if (menuForGrade) {
                const structuredMenuData = this.structureMenuData(menuForGrade);
                this.setState({
                    structuredMenuData,
                    menuData: { [gradeId]: structuredMenuData.menuDetails },
                });
            } else {
                this.setState({
                    structuredMenuData: null,
                    menuData: { [gradeId]: [] },
                });
            }
        } catch (error) {
            console.error("Error fetching menu data:", error);
        }
    };


    structureMenuData = (menuData) => {
        const { menuID, startDate, endDate, gradeID, status, menuDetails } = menuData;
        return {
            menuID,
            startDate,
            endDate,
            gradeID,
            status,
            menuDetails: menuDetails.map(detail => ({
                menuDetailId: detail.menuDetailId,
                mealCode: detail.mealCode,
                dayOfWeek: detail.dayOfWeek,
                foodName: detail.foodName,
            })),
        };
    };

    toggleModal = (menuItem) => {
        this.setState(prevState => ({
            showModal: !prevState.showModal,
            selectedMenuItem: menuItem,
        }));
    };

    formatDate = (date) => {
        const d = new Date(date);  // Tạo đối tượng Date từ tham số đầu vào
        return d.toISOString().split('T')[0];  // Trả về định dạng yyyy-mm-dd
    };
    
    

    handleSave = async () => {
        const { selectedMenuItem, selectedWeek, structuredMenuData, gradeId } = this.state;
        const requestBody = this.createRequestBody(selectedMenuItem, selectedWeek, structuredMenuData);
        console.log(requestBody,"sdsdsdsd");
        
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/Menu/UpdateMenu`, requestBody);
            this.setState({ showModal: false });
            this.fetchMenuData(this.formatDate(selectedWeek.startOfWeek), this.formatDate(selectedWeek.endOfWeek), gradeId);
        } catch (error) {
            console.error("Error updating menu item:", error);
        }
    };

    createRequestBody = (selectedMenuItem, selectedWeek, structuredMenuData, gradeId) => {
        console.log(this.formatDate(selectedWeek.startOfWeek),"okeokeokeo");
        
        return {
            menuID: structuredMenuData?.menuID || 0,
            startDate: this.formatDate(selectedWeek.startOfWeek),
            endDate: this.formatDate(selectedWeek.endOfWeek),
            gradeID: gradeId,
            status: structuredMenuData?.status || 0,
            menuDetails: [
                {
                    menuDetailId: selectedMenuItem.menuDetailId,
                    mealCode: selectedMenuItem.mealCode,
                    dayOfWeek: selectedMenuItem.dayOfWeek,
                    foodName: selectedMenuItem.foodName,
                },
            ],
        };
    };

    renderTable = (gradeId) => {
        const { menuData, daysOfWeek } = this.state;

        return (
            <div className="table-wrapper">
                <table className="custom-table table table-striped table-bordered">
                    <thead className="thead-light">
                        <tr>
                            <th></th>
                            {daysOfWeek.map((day, index) => (
                                <th key={index} className="text-center">{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {["BS", "BT", "BC"].map(mealCode => (
                            <tr key={mealCode}>
                                <td className="sticky-col text-bold"><strong>{this.getMealLabel(mealCode)}</strong></td>
                                {this.renderMeals(gradeId, mealCode)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    renderMeals = (gradeId, mealCode) => {
        const { menuData, daysOfWeek } = this.state;

        const gradeMenuData = menuData[gradeId] || [];

        return daysOfWeek.map((day, index) => {
            const menuItems = gradeMenuData.filter(menu => menu.mealCode === mealCode && this.mapDayToEnglish(menu.dayOfWeek) === day);
            return (
                <td key={index} className="text-center">
                    {menuItems.length > 0 ? (
                        <ul className="list-unstyled" style={{ paddingLeft: '0' }}>
                            {menuItems.map((menuItem, itemIndex) => (
                                <li key={`${menuItem.foodName}-${day}-${itemIndex}`} style={{ textAlign: 'left', margin: 0, listStyleType: 'disc', marginLeft: '20px' }}>
                                    <span
                                        className="menu-item text-info"
                                        onClick={() => this.toggleModal(menuItem)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {menuItem.foodName}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <span className="text-muted">No data available</span>
                    )}
                </td>
            );
        });
    };

    getMealLabel = (mealCode) => {
        const mealLabels = {
            BS: "Breakfast",
            BT: "Lunch",
            BC: "Snack",
        };
        return mealLabels[mealCode];
    };

    mapDayToEnglish = (day) => {
        const dayMap = {
            Monday: "Monday",
            Tuesday: "Tuesday",
            Wednesday: "Wednesday",
            Thursday: "Thursday",
            Friday: "Friday",
            Saturday: "Saturday",
            Sunday: "Sunday",
        };
        return dayMap[day] || day;
    };

    render() {
        const { selectedWeek, showModal, selectedMenuItem, gradeId } = this.state;

        return (
            <div className="container-fluid">
                <PageHeader
                    HeaderText="Food Management"
                    Breadcrumb={[{ name: "Food Management", navigate: "/viewmenu" }, { name: "View Menu", navigate: "" }]}
                />
                <div className="row">
                    <div className="col-lg-12 col-md-12">
                        <h2>Menu</h2>
                        <div className="week-selector">
                            Selected Week: {selectedWeek.startOfWeek.toLocaleDateString("en-US")} - {selectedWeek.endOfWeek.toLocaleDateString("en-US")}
                        </div>
                        {/* Đổi All: 0-3 thành Grade: {gradeId}, và render với gradeId */}
                        {gradeId && (
                            <>
                                <h4 className="menu-title">Grade: {gradeId}</h4>
                                <div className="table-container">{this.renderTable(gradeId)}</div>
                            </>
                        )}

                        {/* Modal for editing menu item */}
                        <Modal show={showModal} onHide={this.toggleModal} centered>
                            <Modal.Header closeButton>
                                <Modal.Title>Edit Menu Item</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form>
                                    <Form.Group controlId="foodName">
                                        <Form.Label>Food Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={selectedMenuItem ? selectedMenuItem.foodName : ''}
                                            onChange={(e) => this.setState({ selectedMenuItem: { ...selectedMenuItem, foodName: e.target.value } })}
                                        />
                                    </Form.Group>
                                </Form>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={this.toggleModal}>
                                    Cancel
                                </Button>
                                <Button variant="primary" onClick={this.handleSave}>
                                    Save Changes
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(UpdateMenu);
