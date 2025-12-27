import { range } from "lodash";
import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { timestampToYYYYMMDD } from "../../../../components/SkillOwner/HelperFunction/timestampToYYYYMMDD";

const EmploymentChart = ({ data }) => {
  const [formattedData, setFormattedData] = useState([]);
  const [totalRange, setTotalRange] = useState([]);

  useEffect(() => {
    // Format data for Recharts
    const formattedData = data?.map((emp) => ({
      organization:
        emp.organization.length > 5
          ? emp.organization.substring(0, 5) + "..."
          : emp.organization,
      // fromDate: new Date(parseInt(emp.fromDate)).getFullYear(),
      // toDate: new Date(parseInt(emp.toDate ? emp.toDate : `${Date.now()}` )).getFullYear(),
      // fromDate: parseInt(emp.fromDate),
      // toDate: parseInt(emp.toDate ? emp.toDate : `${Date.now()}` )
      range: [
        new Date(parseInt(emp.fromDate)).getFullYear(),
        new Date(
          parseInt(emp.toDate ? emp.toDate : `${Date.now()}`)
        ).getFullYear(),
      ],
    }));
    if (formattedData) {
      const minY = Math.min(...formattedData?.map((item) => item.fromYear));
      const maxY = Math.max(...formattedData?.map((item) => item.toYear));
      setTotalRange([minY, maxY]);
      setFormattedData(formattedData);
      console.log(formattedData);
    }
  }, [data]);

  const generateMonthYearTicks = () => {
    const ticks = [];
    for (let year = 2020; year <= 2024; year++) {
      for (let month = 1; month <= 12; month++) {
        ticks.push(`${year}-${month < 10 ? "0" + month : month}`);
      }
    }
    return ticks;
  };

  const CustomYAxisTick = ({ x, y, payload }) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="end"
          fill="#666"
          transform="rotate(-45)"
        >
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    //     <BarChart width={700} height={400} data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
    //     <CartesianGrid strokeDasharray="3 3" />
    //     <XAxis dataKey="organization" />
    //     <YAxis dataKey="fromDate"/>
    //     <Tooltip />
    //     <Bar dataKey="fromDate" fill="#82ca9d" />
    //     <Bar dataKey="toDate" fill="#8884d8" />
    //   </BarChart>

    <BarChart
      width={650}
      height={400}
      data={formattedData}
      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
    >
      <XAxis dataKey="organization" />
      <YAxis
        domain={[2010, 2024]}
        ticks={[
          2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020,
          2021, 2022, 2023, 2024,
        ]}
      />
      {/* <YAxis  domain={[2010, 2024]}/> */}

      <Tooltip />
      <Tooltip />
      <Bar dataKey="range" fill="var(--primary-color)" />
    </BarChart>
  );
};

export default EmploymentChart;
