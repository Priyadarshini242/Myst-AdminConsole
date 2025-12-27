import React from 'react'
import { BarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts';

const ExampleChart = () => {
    const data = [
        {
          "day": "05-01",
          "temperature": [-1, 10]
        },
        {
          "day": "05-02",
          "temperature": [2, 15]
        },
        {
          "day": "05-03",
          "temperature": [3, 12]
        },
        {
          "day": "05-04",
          "temperature": [4, 12]
        },
        {
          "day": "05-05",
          "temperature": [12, 16]
        },
        {
          "day": "05-06",
          "temperature": [5, 16]
        },
        {
          "day": "05-07",
          "temperature": [3, 12]
        },
        {
          "day": "05-08",
          "temperature": [0, 8]
        },
        {
          "day": "05-09",
          "temperature": [-3, 5]
        }
      ];
      
      const rangeData = data.map(entry => ({
        ...entry,
        temperature: entry.temperature[1] // Assuming you want to display the maximum temperature
      }));
      
      const generateMonthYearTicks = () => {
        const ticks = [];
        for (let year = 2020; year <= 2024; year++) {
          for (let month = 1; month <= 12; month++) {
            ticks.push(`${year}-${month < 10 ? '0' + month : month}`);
          }
        }
        return ticks;
      };
      
      const CustomYAxisTick = ({ x, y, payload }) => {
        return (
          <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-45)">
              {payload.value}
            </text>
          </g>
        );
      };
  return (
    <BarChart width={730} height={250} data={rangeData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
    <XAxis dataKey="day" />
    <YAxis type="category" dataKey="day" ticks={generateMonthYearTicks()} tick={<CustomYAxisTick />} />
    <Tooltip />
    <Bar dataKey="temperature" fill="#8884d8" />
  </BarChart>
  )
}

export default ExampleChart
