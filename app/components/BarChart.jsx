'use client';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Title } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Title);

const BarChart = ({ orders }) => {
  const productMap = {};

  orders.forEach(order => {
    order.products.forEach(product => {
      const name = product.name;
      productMap[name] = (productMap[name] || 0) + product.quantity;
    });
  });

  const labels = Object.keys(productMap);
  const values = labels.map(label => productMap[label]);

  const data = {
    labels,
    datasets: [
      {
        label: 'Quantity Sold',
        data: values,
        backgroundColor: 'orange',
      },
    ],
  };

  return <Bar data={data} />;
};

export default BarChart;
