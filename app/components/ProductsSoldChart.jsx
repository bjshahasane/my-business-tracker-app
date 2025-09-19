'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';
import { useEffect, useState } from 'react';
import axios from 'axios';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const COLORS = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
  '#9966FF', '#FF9F40', '#66FF66', '#FF6666',
  '#A0522D', '#00CED1', '#8A2BE2', '#7FFF00',
  '#FF1493', '#FFD700', '#ADFF2F', '#20B2AA'
];

const ProductsSoldCharts = () => {
  const [totalData, setTotalData] = useState({});
  const [typeWiseData, setTypeWiseData] = useState({});

  useEffect(() => {
    axios.get('/api/dashboard/products-sold').then(res => {
      setTotalData(res.data.totalSoldByName);
      setTypeWiseData(res.data.typeWiseSold);
    });
  }, []);

  const renderBarChart = (title, dataObj) => {
    const labels = Object.keys(dataObj);
    const values = Object.values(dataObj);

    const data = {
      labels,
      datasets: [
        {
          label: 'Units Sold',
          data: values,
          backgroundColor: labels.map((_, i) => COLORS[i % COLORS.length]),
          borderColor: '#333',
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: title,
          font: { size: 18 },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    };

    return <div className="mb-6 max-w-[600px]"><Bar data={data} options={options} /></div>;
  };

  return (
    <div className="p-4 flex flex-wrap gap-6">
      {Object.keys(totalData).length > 0 && renderBarChart('All Products Sold', totalData)}

      {Object.entries(typeWiseData).map(([type, data]) =>
        renderBarChart(`Products Sold - ${type}`, data)
      )}
    </div>
  );
};

export default ProductsSoldCharts;
