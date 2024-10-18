import React from "react";
import { withRouter } from "react-router-dom";
import "./ViewMenu.css"; // Tạo file CSS riêng cho các style

class ViewMenu extends React.Component {
  state = {
    menuData: {
      "0-3": [
        {
          breakfast: "Bún riêu cua, Sữa yakult",
          lunch: "Cháo thịt bằm, Thịt hấp nước tương Hàn Quốc, Rau cải xào ngô ngọt, Canh bí ngòi nấu kiểu Hàn Quốc, Cơm trắng, Dưa lưới",
          snack: "Cháo bơ củ dền, Phô mai",
        },
        {
          breakfast: "Bánh đa nấu thịt bằm cà chua, Sữa chua",
          lunch: "Cháo tôm, Tôm viên rong biển, Bí xanh, cà rốt luộc, Canh cải xanh nấu thịt, Cơm trắng, Thanh long",
          snack: "Cơm cuộn, Chè hoa quả",
        },
        {
          breakfast: "Xôi mặn thập cẩm, Sữa yakult",
          lunch: "Cháo thịt hầm hạt sen, Thịt hầm hạt sen, Cải chip xào nấm, Canh bầu tôm nón, Cơm trắng, Táo Mỹ",
          snack: "Nui nơ sốt gà nấm, Sữa tươi",
        },
        {
          breakfast: "Bánh canh thịt bằm, Sữa chua",
          lunch: "Cháo cá (cá điêu hồng), Cá điêu hồng, thịt sốt teriyaki, Su su, cà rốt bào sợi xào, Canh rau ngót nấu thịt, Cơm trắng, Dưa hấu",
          snack: "Bún chả, Sữa tươi",
        },
        {
          breakfast: "Phở bò, Sữa yakult",
          lunch: "Cháo gà, Cá ri gà, Bắp cải trộn cá bào, Canh sumashi, Cơm trắng, Quýt ngọt",
          snack: "Bánh Dorayaki, Sữa tươi",
        },
        {}, // Dữ liệu trống cho Thứ 7
        {}, // Dữ liệu trống cho Chủ nhật
      ],
      "3-6": [
        {
          breakfast: "Bún riêu cua, Sữa yakult",
          lunch: "Cháo thịt bằm, Thịt hấp nước tương Hàn Quốc, Rau cải xào ngô ngọt, Canh bí ngòi nấu kiểu Hàn Quốc, Cơm trắng, Dưa lưới",
          snack: "Cháo bơ củ dền, Phô mai",
        },
        {
          breakfast: "Bánh đa nấu thịt bằm cà chua, Sữa chua",
          lunch: "Cháo tôm, Tôm viên rong biển, Bí xanh, cà rốt luộc, Canh cải xanh nấu thịt, Cơm trắng, Thanh long",
          snack: "Cơm cuộn, Chè hoa quả",
        },
        {
          breakfast: "Xôi mặn thập cẩm, Sữa yakult",
          lunch: "Cháo thịt hầm hạt sen, Thịt hầm hạt sen, Cải chip xào nấm, Canh bầu tôm nón, Cơm trắng, Táo Mỹ",
          snack: "Nui nơ sốt gà nấm, Sữa tươi",
        },
        {
          breakfast: "Bánh canh thịt bằm, Sữa chua",
          lunch: "Cháo cá (cá điêu hồng), Cá điêu hồng, thịt sốt teriyaki, Su su, cà rốt bào sợi xào, Canh rau ngót nấu thịt, Cơm trắng, Dưa hấu",
          snack: "Bún chả, Sữa tươi",
        },
        {
          breakfast: "Phở bò, Sữa yakult",
          lunch: "Cháo gà, Cá ri gà, Bắp cải trộn cá bào, Canh sumashi, Cơm trắng, Quýt ngọt",
          snack: "Bánh Dorayaki, Sữa tươi",
        },
        {}, // Dữ liệu trống cho Thứ 7
        {}, // Dữ liệu trống cho Chủ nhật
      ],
    },
    daysOfWeek: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"],
  };

  renderTable = (ageGroup) => {
    const { menuData, daysOfWeek } = this.state;

    return (
      <div className="table-wrapper">
        <table className="custom-table table table-bordered">
          <thead className="thead-light">
            <tr>
              <th></th>
              {daysOfWeek.map((day, index) => (
                <th key={index}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="sticky-col"><strong>Bữa Sáng</strong></td>
              {menuData[ageGroup].map((menu, index) => (
                <td key={index}>
                  {menu.breakfast
                    ? menu.breakfast.split(", ").map((item, i) => (
                        <div key={i}>{item}</div>
                      ))
                    : "Không có dữ liệu"} {/* Hiển thị khi không có dữ liệu */}
                </td>
              ))}
            </tr>
            <tr>
              <td className="sticky-col"><strong>Bữa Trưa</strong></td>
              {menuData[ageGroup].map((menu, index) => (
                <td key={index}>
                  {menu.lunch
                    ? menu.lunch.split(", ").map((item, i) => (
                        <div key={i}>{item}</div>
                      ))
                    : "Không có dữ liệu"} {/* Hiển thị khi không có dữ liệu */}
                </td>
              ))}
            </tr>
            <tr>
              <td className="sticky-col"><strong>Bữa Chiều</strong></td>
              {menuData[ageGroup].map((menu, index) => (
                <td key={index}>
                  {menu.snack
                    ? menu.snack.split(", ").map((item, i) => (
                        <div key={i}>{item}</div>
                      ))
                    : "Không có dữ liệu"} {/* Hiển thị khi không có dữ liệu */}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12 col-md-12">
            <h2>Thực Đơn</h2>

            <h4>Song ngữ: 0-3</h4>
            <div className="table-container">
              {this.renderTable("0-3")}
            </div>

            <h4>Song ngữ: 3-6</h4>
            <div className="table-container">
              {this.renderTable("3-6")}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(ViewMenu);
