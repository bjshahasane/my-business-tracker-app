'use client';

import React, { useState, useEffect } from 'react';
import { productCatalogue } from '../../js/productCatalogue';
import Button from 'react-bootstrap/Button';
import { Table, Container, Badge, Tooltip, OverlayTrigger, Toast, Row, Col } from 'react-bootstrap';
import OrderFormModal from '../../components/OrderFormModal';
import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Pagination from 'react-bootstrap/Pagination';


const initialValue = {
  customerName: '',
  date: '',
  products: [],
  discount: '',
  discountType: '',
  shipping: '',
  totalBeforeShipping: 0,
  totalAfterShipping: 0,
  message: '',
  isFulfilled: false,
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialValue);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const itemsPerPage = 5;

const fetchOrders = async (page = 1) => {
  const res = await fetch(
    `/api/orders?page=${page}&limit=${itemsPerPage}`
  );

  const result = await res.json();

  setOrders(result.data);
  setTotalPages(result.pagination.totalPages);
};

  const flatProductList = productCatalogue.flatMap(group => group.itemList);

 useEffect(() => {
  fetchOrders(currentPage);
}, [currentPage]);

  // const fetchOrders = async () => {
  //   const res = await fetch('/api/orders');
  //   const data = await res.json();
  //   setOrders(data);
  // };

  const handleDelete = async (_id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this order?");
    if (!confirmDelete) return;

    try {
      const res = await fetch('/api/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id }),
      });

      const result = await res.json();
      if (res.ok) {
        setToast({ show: true, message: 'Order deleted successfully' });
        setOrders(orders.filter(order => order._id !== _id));
      } else {
        setToast({ show: true, message: 'Delete failed: ' + result.message });
      }
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: 'Network error while deleting order' });
    }
  };

  const handleAdd = () => {
    setForm(initialValue);
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleEdit = (order) => {
    const enrichedProducts = order.products.map(p => {
      const found = flatProductList.find(item => item.id === p.id);
      return found ? { ...found, quantity: p.quantity } : { ...p };
    });

    setForm({ ...order, products: enrichedProducts });
    setIsEditMode(true);
    setEditingId(order._id);
    setShowModal(true);
  };

  const handleSubmit = async (formData) => {
    if (isEditMode && editingId) {
      await axios.put(`/api/orders`, { _id: editingId, ...formData });
    } else {
      await axios.post('/api/orders', formData);
    }
    fetchOrders();
    setShowModal(false);
  };

  return (
    <Container className="py-4">
      <Row className="mb-4 justify-content-between align-items-center">
        <Col><h3>📦 Orders Management</h3></Col>
        <Col className="text-end">
          <Button onClick={handleAdd}>+ New Order</Button>
        </Col>
      </Row>

      {orders.length > 0 ? (
        <Table bordered striped responsive hover>
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Products</th>
              <th>Total (₹)</th>
              <th>Shipping (₹)</th>
              <th>Final Total (₹)</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{order.customerName}</td>
                <td>{order.date}</td>
                <td>
                  <ul className="mb-0 ps-3">
                    {order.products.map((p, i) => (
                      <li key={i}>{p.name} × {p.quantity} = ₹{(p.price * p.quantity).toFixed(2)}</li>
                    ))}
                  </ul>
                </td>
                <td>₹{order.totalBeforeShipping.toFixed(2)}</td>
                <td>₹{order.shipping || 0}</td>
                <td>₹{order.totalAfterShipping.toFixed(2)}</td>
                <td>
                  <Badge bg={order.isFulfilled ? 'success' : 'warning'}>
                    {order.isFulfilled ? 'Fulfilled' : 'Pending'}
                  </Badge>
                </td>
                <td>{order.message || '-'}</td>
                <td>
                  <OverlayTrigger placement="top" overlay={<Tooltip>Edit</Tooltip>}>
                    <Button variant="outline-primary" size="sm" onClick={() => handleEdit(order)} className="me-2">
                      <FaEdit />
                    </Button>
                  </OverlayTrigger>
                  <OverlayTrigger placement="top" overlay={<Tooltip>Delete</Tooltip>}>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(order._id)}>
                      <FaTrash />
                    </Button>
                  </OverlayTrigger>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <div className="text-center mt-5">
          <h5>No orders found</h5>
          <p>Click "New Order" to add your first order.</p>
        </div>
      )}

{totalPages > 1 && (
  <Pagination className="justify-content-center mt-4">
    <Pagination.Prev
      disabled={currentPage === 1}
      onClick={() => setCurrentPage(p => p - 1)}
    />

    {[...Array(totalPages)].map((_, i) => (
      <Pagination.Item
        key={i}
        active={currentPage === i + 1}
        onClick={() => setCurrentPage(i + 1)}
      >
        {i + 1}
      </Pagination.Item>
    ))}

    <Pagination.Next
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage(p => p + 1)}
    />
  </Pagination>
)}

      <OrderFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        isEditMode={isEditMode}
        form={form}
        setForm={setForm}
      />

      <Toast
        show={toast.show}
        onClose={() => setToast({ show: false, message: '' })}
        delay={3000}
        autohide
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          minWidth: '250px',
          backgroundColor: '#198754',
          color: 'white',
        }}
      >
        <Toast.Body>{toast.message}</Toast.Body>
      </Toast>
    </Container>
  );
};

export default Orders;
