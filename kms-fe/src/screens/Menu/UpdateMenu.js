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
        menuData: {}, // Store menu data
        daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        showModal: false,
        selectedMenuItem: null,
        menuID: null,
        startDate: null, // Added to keep startDate
        endDate: null,   // Added to keep endDate
    };

    componentDidMount() {
        const { location, history } = this.props;

        if (location && location.state && location.state.menuID) {
            const { menuID, startDate, endDate } = location.state;
            console.log("Received state:", location.state);
            const { startOfWeek, endOfWeek } = this.getWeekRange(new Date());
            console.log("Start of Week:", startOfWeek);
            console.log("End of Week:", endOfWeek);
            this.setState({
                selectedWeek: { startOfWeek, endOfWeek },
                menuID: menuID,
                startDate: startDate, // Set startDate in state
                endDate: endDate,     // Set endDate in state
            }, () => {
                this.fetchMenuData(menuID);
            });
        } else {
            console.error("No state found in location. Redirecting to /viewmenu.");
            history.push('/viewmenu'); // Redirect if state is missing
        }
    }

    /**
     * Calculates the start and end of the current week.
     * @param {Date} date 
     * @returns {Object} { startOfWeek, endOfWeek }
     */
    getWeekRange = (date) => {
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        const diff = day === 0 ? 6 : day - 1; // Sunday is 0
        startOfWeek.setDate(startOfWeek.getDate() - diff);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        return { startOfWeek, endOfWeek };
    };

    /**
     * Fetches menu data based on the provided menuID.
     * Note: startDate and endDate are no longer required in the API call.
     * @param {number} menuID 
     */
    fetchMenuData = async (menuID) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/Menu/GetMenuByMenuId?MenuId=${menuID}`);

            const data = response.data;
            console.log("Fetched menu data:", data);

            // Assuming API returns a single menu object, not an array
            if (data && data.menuID) {
                const structuredMenuData = this.structureMenuData(data);
                this.setState({
                    menuData: structuredMenuData,
                });
            } else {
                console.warn("No menu data found for the given menuID.");
                this.setState({ menuData: {} });
            }
        } catch (error) {
            console.error("Error fetching menu data:", error);
            this.setState({ menuData: {} });
        }
    };

    /**
     * Structures the raw menu data from the API into a usable format.
     * @param {Object} menuData 
     * @returns {Object} structured menu data
     */
    structureMenuData = (menuData) => {
        const { menuID, startDate, endDate, status, menuDetails } = menuData;
        return {
            menuID,
            startDate,
            endDate,
            status,
            menuDetails: menuDetails.map(detail => ({
                menuDetailId: detail.menuDetailId,
                mealCode: detail.mealCode,
                dayOfWeek: detail.dayOfWeek,
                foodName: detail.foodName,
            })),
        };
    };

    /**
     * Toggles the visibility of the modal and sets the selected menu item.
     * @param {Object|null} menuItem 
     */
    toggleModal = (menuItem) => {
        this.setState(prevState => ({
            showModal: !prevState.showModal,
            selectedMenuItem: menuItem,
        }));
    };

    /**
     * Formats a Date object into YYYY-MM-DD string.
     * @param {Date} date 
     * @returns {string} formatted date
     */
    formatDate = (date) => {
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    };

    /**
     * Handles saving the updated menu item.
     */
    handleSave = async () => {
        const { selectedMenuItem, menuData, startDate, endDate } = this.state;
        const requestBody = this.createRequestBody(selectedMenuItem, menuData, startDate, endDate);
        console.log("Request Body:", requestBody);

        try {
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/Menu/UpdateMenu`, requestBody);
            console.log("Update response status:", response.status);
            if (response.status === 204 || response.status === 200) {
                this.setState({ showModal: false });
                this.fetchMenuData(this.state.menuID);
                // Optionally, display a success notification here
            } else {
                // Handle unexpected status codes
                console.warn("Unexpected response status:", response.status);
                // Optionally, display a warning notification here
            }
        } catch (error) {
            console.error("Error updating menu item:", error);
            // Optionally, display an error notification here
        }
    };

    /**
     * Creates the request body for updating the menu.
     * Includes menuID, startDate, endDate, status, and menuDetails.
     * @param {Object} selectedMenuItem 
     * @param {Object} menuData 
     * @param {string} startDate 
     * @param {string} endDate 
     * @returns {Object} request body
     */
    createRequestBody = (selectedMenuItem, menuData, startDate, endDate) => {
        return {
            menuID: menuData?.menuID || 0,
            startDate: startDate, // Include startDate
            endDate: endDate,     // Include endDate
            status: menuData?.status || 0,
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

    /**
     * Renders the menu table.
     * @returns JSX.Element
     */
    renderTable = () => {
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
                            <th className="text-center">Status</th> {/* Add Status Column */}
                        </tr>
                    </thead>
                    <tbody>
                        {["BS", "BT", "BC"].map(mealCode => (
                            <React.Fragment key={mealCode}>
                                <tr>
                                    <td className="sticky-col text-bold"><strong>{this.getMealLabel(mealCode)}</strong></td>
                                    {this.renderMeals(mealCode)}
                                    {mealCode === "BS" && (
                                        <td rowSpan={3} className="text-center align-middle">
                                            {menuData.status === 0 ? (
                                                <span className="badge badge-secondary">Draft</span>
                                            ) : menuData.status === 1 ? (
                                                <span className="badge badge-warning">Pending</span>
                                            ) : menuData.status === 2 ? (
                                                <span className="badge badge-success">Approved</span>
                                            ) : (
                                                <span className="badge badge-secondary">Unknown</span>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    /**
     * Renders meals for each meal code and day.
     * @param {string} mealCode 
     * @returns JSX.Element[]
     */
    renderMeals = (mealCode) => {
        const { menuData, daysOfWeek } = this.state;

        const menuDetails = menuData.menuDetails || [];

        return daysOfWeek.map((day, index) => {
            const menuItems = menuDetails.filter(menu => menu.mealCode === mealCode && this.mapDayToEnglish(menu.dayOfWeek) === day);
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

    /**
     * Returns the label for a given meal code.
     * @param {string} mealCode 
     * @returns {string}
     */
    getMealLabel = (mealCode) => {
        const mealLabels = {
            BS: "Breakfast",
            BT: "Lunch",
            BC: "Snack",
        };
        return mealLabels[mealCode];
    };

    /**
     * Maps the day to its English representation.
     * @param {string} day 
     * @returns {string}
     */
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
        const { showModal, selectedMenuItem, menuData, selectedWeek } = this.state;

        return (
            <div className="container-fluid">
                <PageHeader
                    HeaderText="Food Management"
                    Breadcrumb={[
                        { name: "Food Management", navigate: "/viewmenu" },
                        { name: "Update Menu", navigate: "" },
                    ]}
                />
                <div className="row">
                    <div className="col-lg-12 col-md-12">
                        <h2>Update Menu</h2>
                        <div className="week-selector">
                            Selected Week: {selectedWeek.startOfWeek.toLocaleDateString("en-US")} - {selectedWeek.endOfWeek.toLocaleDateString("en-US")}
                        </div>

                        {menuData && menuData.menuID ? (
                            <>
                                <h4 className="menu-title">Menu ID: {menuData.menuID}</h4>
                                <div className="table-container">{this.renderTable()}</div>
                            </>
                        ) : (
                            <p>No menu data available.</p>
                        )}

                        {/* Modal for editing menu item */}
                        <Modal show={showModal} onHide={() => this.toggleModal(null)} centered>
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
                                <Button variant="secondary" onClick={() => this.toggleModal(null)}>
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
