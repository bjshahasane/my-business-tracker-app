'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import LineChart from '@/app/components/LineChart';
import BarChart from '@/app/components/BarChart';
import { Carousel } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const DashboardPage = () => {
    const [loading, setLoading] = useState(true);
  
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('monthly');
  const [profitData, setProfitData] = useState({ totalSales: 0, totalExpenses: 0, profit: 0 });
  const [productData, setProductData] = useState({ totalSoldByName: {}, typeWiseSold: {} });

  const fetchOrders = async () => {
    const res = await axios.get('/api/orders');
    setOrders(res.data.data);
  };

  const fetchProfitData = async () => {
    const res = await axios.get('/api/profit');
    setProfitData(res.data);
  };

  const fetchProductData = async () => {
    const res = await axios.get('/api/dashboard/products-sold');
    setProductData(res.data);
  };

  useEffect(() => {
  const loadDashboard = async () => {
    try {
      setLoading(true);

      await Promise.all([
        fetchOrders(),
        fetchProfitData(),
        fetchProductData(),
      ]);

    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  loadDashboard();
}, []);

  const total = orders.length;
  const fulfilled = orders.filter(o => o.isFulfilled).length;
  const pending = total - fulfilled;

  const renderBarChart = (title, dataObj) => {
    const labels = Object.keys(dataObj);
    const values = Object.values(dataObj);

    const data = {
      labels,
      datasets: [
        {
          label: 'Units Sold',
          data: values,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
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
          font: { size: 16 },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
        },
      },
    };

    return <Bar data={data} options={options} />;
  };


  if (loading) {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center"
      style={{ minHeight: '70vh' }}
    >
      <div className="spinner-border text-primary" role="status" />
      <p className="mt-3 text-muted">Loading dashboard data...</p>
    </div>
  );
}

  return (
    <div className="container py-4">
      <h2 className="mb-4 fw-bold">📊 Business Dashboard</h2>

      {/* Order Stats */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="bg-light p-3 rounded border shadow-sm">
            <h6>Total Orders</h6>
            <h3>{total}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="bg-success text-white p-3 rounded shadow-sm">
            <h6>Fulfilled</h6>
            <h3>{fulfilled}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="bg-warning p-3 rounded shadow-sm">
            <h6>Pending</h6>
            <h3>{pending}</h3>
          </div>
        </div>
      </div>

      {/* Profit Section */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="card text-white bg-primary">
            <div className="card-body">
              <h5>Total Sales</h5>
              <p className="fs-4">₹ {profitData.totalSales.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-danger">
            <div className="card-body">
              <h5>Total Expenses</h5>
              <p className="fs-4">₹ {profitData.totalExpenses.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className={`card text-white ${profitData.profit >= 0 ? 'bg-success' : 'bg-warning'}`}>
            <div className="card-body">
              <h5>Profit</h5>
              <p className="fs-4">₹ {profitData.profit.toFixed(2)} {profitData.profit < 0 && '(Loss)'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Chart */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-semibold">📈 Orders Over Time</h4>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="form-select w-auto"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div style={{ maxWidth: '600px' }}>
          <LineChart orders={orders} filter={filter} />
        </div>
      </div>

      {/* Product Sales Charts */}
      <div className="mb-5">
        <h4 className="fw-semibold mb-3">📦 Product Sales Overview</h4>

        {/* All Products Sold Bar */}
        {/* <div className="mb-4" style={{ maxWidth: '700px' }}>
          {Object.keys(productData.totalSoldByName).length > 0 &&
            renderBarChart('All Products Sold', productData.totalSoldByName)}
        </div> */}

        {/* Carousel for typeWiseSold */}
        <h5 className="mb-3">🌀 Category-wise Sales</h5>
        <Carousel indicators={false} controls interval={4000} pause="hover">
          {Object.entries(productData.typeWiseSold).map(([type, data], index) => (
            <Carousel.Item key={index}>
              <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                {renderBarChart(`${type} Products Sold`, data)}
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>
    </div>
  );
};

export default DashboardPage;
