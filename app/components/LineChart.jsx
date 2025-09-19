'use client';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip } from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip);

const LineChart = ({ orders, filter }) => {
  const dateMap = {};

  orders.forEach(order => {
    const date = new Date(order.date);
    let key = '';

    if (filter === 'weekly') {
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
      key = weekStart.toISOString().slice(0, 10);
    } else if (filter === 'monthly') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else {
      key = `${date.getFullYear()}`;
    }

    dateMap[key] = (dateMap[key] || 0) + 1;
  });

  const labels = Object.keys(dateMap).sort();
  const values = labels.map(label => dateMap[label]);

  const data = {
    labels,
    datasets: [
      {
        label: 'Orders',
        data: values,
        fill: false,
        borderColor: 'blue',
        tension: 0.3,
      },
    ],
  };

  return <Line data={data} />;
};

export default LineChart;
