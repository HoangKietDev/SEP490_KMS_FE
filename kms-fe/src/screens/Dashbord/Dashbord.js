import React, { useEffect, useState } from "react";
import ReactEcharts from "echarts-for-react";
import PageHeader from "../../components/PageHeader";
import axios from "axios";

const DashboardAdmin = () => {
  const [data, setData] = useState(null);
  const [accountStats, setAccountStats] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2024); // State lưu năm đã chọn
  const [yearsList, setYearsList] = useState([]); // Danh sách năm cho phép chọn (có thể lấy từ API)

  // Fetch data from system status API
  useEffect(() => {
    axios.get("http://localhost:5124/api/system/GetStatus") // Thay URL API của bạn
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  }, []);

  // Fetch account statistics from API
  useEffect(() => {
    axios.get(`http://localhost:5124/api/Dashboard/GetAccountmentStatistics`)
      .then(response => {
        
        const allYears = response.data.map(item => item.year); // Lấy danh sách năm từ dữ liệu trả về
        setYearsList(allYears); // Cập nhật yearsList

        // Tìm dữ liệu của năm đã chọn
        const selectedYearData = response.data.find(item => item.year === parseInt(selectedYear));

        if (selectedYearData) {
          const fullYearData = selectedYearData.monthlyAccountments;

          // Chắc chắn dữ liệu cho tất cả 12 tháng đều có
          const completeData = Array.from({ length: 12 }, (_, index) => {
            const monthData = fullYearData.find(item => item.month === index + 1);
            return monthData ? monthData : { month: index + 1, newAccount: 0 }; // Nếu không có dữ liệu cho tháng này, gán newAccount = 0
          });

          setAccountStats({ ...selectedYearData, monthlyAccountments: completeData });
        }
      })
      .catch(error => {
        console.error("Error fetching account statistics:", error);
      });
  }, [selectedYear]); // Chỉ fetch lại khi selectedYear thay đổi



  // Format data to use in charts
  const cpuUsage = parseFloat(data?.cpuUsage) || 0;
  const memoryUsage = data?.memoryUsage.split(" / ") || [];
  const usedMemory = parseInt(memoryUsage[0]) || 0;
  const totalMemory = parseInt(memoryUsage[1]) || 1;

  // Options for CPU Usage Chart
  const cpuOption = {
    title: {
      text: "CPU Usage",
      left: "center",
      textStyle: {
        color: "#4c4c4c",
      },
    },
    series: [
      {
        name: "CPU Usage",
        type: "gauge",
        progress: {
          show: true,
          width: 18,
        },
        axisLine: {
          lineStyle: {
            width: 30,
            color: [[0.2, "#0ff"], [0.8, "#f8ff05"], [1, "#ff3e3e"]],
          },
        },
        axisLabel: {
          distance: 30,
          color: "#4c4c4c",
        },
        pointer: {
          width: 10,
        },
        detail: {
          valueAnimation: true,
          formatter: "{value}%",
          fontSize: 25,
          color: "#4c4c4c",
        },
        data: [{ value: cpuUsage }],
      },
    ],
  };

  // Options for Memory Usage Chart
  const memoryOption = {
    title: {
      text: "Memory Usage",
      left: "center",
      textStyle: {
        color: "#4c4c4c",
      },
    },
    series: [
      {
        name: "Memory Usage",
        type: "pie",
        radius: ["40%", "70%"],
        data: [
          {
            value: usedMemory,
            name: `Used: ${usedMemory} MB`,
            itemStyle: {
              color: "#2f7f2f",
            },
          },
          {
            value: totalMemory - usedMemory,
            name: `Free: ${totalMemory - usedMemory} MB`,
            itemStyle: {
              color: "#dd5dca",
            },
          },
        ],
      },
    ],
  };

  // Options for Account Creation Statistics Chart
const accountStatsOption = {
  title: {
    text: `New Account Statistics (${selectedYear})`,
    left: "center",
    textStyle: {
      color: "#4c4c4c",
    },
  },
  xAxis: {
    type: "category",
    data: accountStats?.monthlyAccountments?.map(item => `Month ${item.month}`), // Lấy tên tháng
  },
  yAxis: {
    type: "value",
  },
  tooltip: {
    trigger: 'axis', // Kích hoạt tooltip khi hover vào một cột
    axisPointer: {
      type: 'shadow', // Hiển thị shadow cho dễ nhìn
    },
    formatter: (params) => {
      // params là các thông tin chi tiết của các điểm dữ liệu
      const month = params[0].name; // Tên tháng
      const newAccounts = params[0].value; // Số tài khoản mới
      return `<b>${month}</b><br/>New Accounts: ${newAccounts}`;
    }
  },
  series: [
    {
      name: "New Accounts",
      type: "bar", // Dùng biểu đồ cột
      data: accountStats?.monthlyAccountments?.map(item => item.newAccount), // Lấy số tài khoản mới
      itemStyle: {
        color: "#3eaf7c",
      },
    },
  ],
};



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
            HeaderText="Dashboard"
            Breadcrumb={[{ name: "Dashboard Admin", navigate: "" }]}
          />
          <div className="row clearfix">
            <div className="col-lg-12 col-md-12">
              <div className="card planned_task">
                <div className="header d-flex justify-content-between">
                  <h2>Dashboard Admin</h2>
                </div>
              </div>
            </div>
            <div className="col-lg-12">
              <div className="card">
                <div>
                  {data ? (
                    <>
                      <div className="m-4">
                        <h5>Status: {data.statusMessage}</h5>
                        <div>Uptime: {data.uptime}</div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                        <div style={{ width: "45%" }}>
                          <ReactEcharts option={cpuOption} style={{ height: "300px", width: "100%" }} />
                        </div>
                        <div style={{ width: "45%" }}>
                          <ReactEcharts option={memoryOption} style={{ height: "300px", width: "100%" }} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="m-4">Loading...</div>
                  )}
                </div>
                <hr />
                <div>
                  <div className="m-4">
                    <label htmlFor="yearSelect">Select Year: </label>
                    <select
                      id="yearSelect"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      {yearsList.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  {accountStats ? (
                    <div className="m-4">
                      <h5>Account Creation Statistics</h5>
                      <ReactEcharts
                        option={accountStatsOption}
                        style={{ height: "400px", width: "100%" }}
                      />
                    </div>
                  ) : (
                    <div className="m-4">Loading Account Statistics...</div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
