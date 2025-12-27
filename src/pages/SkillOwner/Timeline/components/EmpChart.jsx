import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { timestampToYYYYMMDD } from "../../../../components/SkillOwner/HelperFunction/timestampToYYYYMMDD";
import { FormatDateTimeStampMonthAndDate } from "../../../../components/SkillOwner/HelperFunction/FormatDateTimeStampMonthAndDate";

const EmpChart = ({ data }) => {
  const [formattedData, setFormattedData] = useState([]);
  const [series, setSeries] = useState([
    {
      data: [
        { x: "Operations", y: [2800, 4500] },
        { x: "Customer Success", y: [3200, 4100] },
        { x: "Engineering", y: [2950, 7800] },
        { x: "Marketing", y: [3000, 4600] },
        { x: "Product", y: [3500, 4100] },
        { x: "Data Science", y: [4500, 6500] },
        { x: "Sales", y: [4100, 5600] },
      ],
    },
  ]);

  useEffect(() => {
    // Format data for Recharts
    if (data) {
      const formattedData = data?.map((emp) => ({
        x:
          emp?.organization?.length > 5
            ? emp?.organization?.substring(0, 5) + "..."
            : emp?.organization,
        // y: [new Date(parseInt(emp?.fromDate)), new Date(parseInt(emp?.toDate ? emp?.toDate : `${Date.now()}`))]
        y: [emp?.fromDate, emp?.toDate ? emp?.toDate : `${Date.now()}`],
      }));
      if (formattedData) {
        console.log(formattedData);
        setFormattedData(formattedData);
        setSeries([
          {
            data: formattedData,
          },
        ]);
      }
    }
  }, [data]);

  const [options] = useState({
    chart: {
      height: 390,
      type: "rangeBar",
      zoom: {
        enabled: false,
      },
    },
    colors: ["var(--primary-color)", "#859862"],
    plotOptions: {
      bar: {
        horizontal: true,
        isDumbbell: true,
        dumbbellColors: [["var(--primary-color)", "#859862"]],
        barHeight: 5, // Set the height of the bars
      },
    },
    // xaxis: {
    //     type: 'category',
    //     categories: ['Operations', 'Customer Success', 'Engineering', 'Marketing', 'Product', 'Data Science', 'Sales']
    //   },
    // yaxis: {
    //     type: 'numeric',
    //     labels: {
    //       formatter: function (value) {
    //         const date = new Date(value); // Assuming value is a millisecond representing a date
    //         return date.toLocaleDateString(); // Format milliseconds as date
    //       }
    //     }
    //   },
    xaxis: {
      labels: {
        formatter: function (value) {
          return FormatDateTimeStampMonthAndDate(value); // Format milliseconds as date
        },
      },
    },
    title: {
      text: "Employment Chart",
    },
    legend: {
      show: true,
      showForSingleSeries: true,
      position: "top",
      horizontalAlign: "left",
      customLegendItems: ["Start Date", "End Date"],
    },
    toolbar: {
      show: true, // Remove toolbar
    },
    fill: {
      type: "gradient",
      gradient: {
        gradientToColors: ["#859862"],
        inverseColors: false,
        stops: [0, 100],
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
  });

  //   const [series] = useState([
  //     {
  //       data: [
  //         { x: 'Operations', y: [2800, 4500] },
  //         { x: 'Customer Success', y: [3200, 4100] },
  //         { x: 'Engineering', y: [2950, 7800] },
  //         { x: 'Marketing', y: [3000, 4600] },
  //         { x: 'Product', y: [3500, 4100] },
  //         { x: 'Data Science', y: [4500, 6500] },
  //         { x: 'Sales', y: [4100, 5600] }
  //       ]
  //     }
  //   ]);

  return (
    <div>
      <div id="chart">
        <ReactApexChart
          options={options}
          series={series}
          type="rangeBar"
          height={390}
        />
      </div>
      <div id="html-dist"></div>
    </div>
  );
};

export default EmpChart;
