'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Container,
  Spinner,
  Toast,
  ToastContainer,
  Badge,
} from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.css';

const PendingProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/productionProducts');
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // const updateQuantity = async (id, field, delta) => {
  //   const updatedProducts = products.map((p) =>
  //     p._id === id
  //       ? {
  //           ...p,
  //           [field]: Math.max(0, p[field] + delta),
  //         }
  //       : p
  //   );

  //   setProducts(updatedProducts);

  //   const updatedProduct = updatedProducts.find((p) => p._id === id);

  //   try {
  //     await axios.put('/api/productionProducts', [
  //       {
  //         productId: updatedProduct.productId,
  //         pendingQuantity: updatedProduct.pendingQuantity,
  //         // completedQuantity: updatedProduct.completedQuantity,
  //       },
  //     ]);

  //     setToast({ show: true, message: 'Quantity updated successfully' });
  //   } catch (error) {
  //     console.error('Update error:', error);
  //     setToast({ show: true, message: 'Update failed' });
  //   }
  // };
  
  // 🔸 Group products by category
  const groupedByType = products.reduce((acc, prod) => {
    const type = prod.type || 'Uncategorized';
    if (!acc[type]) acc[type] = [];
    acc[type].push(prod);
    return acc;
  }, {});

  console.log("This is products",products);

  return (
    <Container className="mt-5">
      <Card className="shadow-lg p-4">
        <h3 className="mb-4 text-center">🛠️ Production Tracker</h3>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : products.length === 0 ? (
          <p className="text-muted">No products to display.</p>
        ) : (
          Object.entries(groupedByType).map(([type, items]) => (
            <div key={type} className="mb-5">
              <h5 className="mb-3 fw-bold text-uppercase text-secondary border-bottom pb-1">
                {type}
              </h5>

              <Table responsive bordered hover className="text-center">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Pending</th>
                    {/* <th>Completed</th> */}
                    {/* <th>Actions</th> */}
                  </tr>
                </thead>
                <tbody>
                  {items.map((prod, index) => (
                    <tr key={prod._id}>
                      <td>{index + 1}</td>
                      <td className="fw-bold">{prod.name}</td>
                      <td>
                        <Badge bg="warning" pill>
                          {prod.pendingQuantity}
                        </Badge>
                      </td>
                      {/* <td>
                        <Badge bg="success" pill>
                          {prod.completedQuantity}
                        </Badge>
                      </td> */}
                      {/* <td>
                        <div className="d-flex justify-content-center gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline-warning"
                            onClick={() =>
                              updateQuantity(prod._id, 'pendingQuantity', -1)
                            }
                            disabled={prod.pendingQuantity === 0}
                          >
                            − Pending
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-warning"
                            onClick={() =>
                              updateQuantity(prod._id, 'pendingQuantity', 1)
                            }
                          >
                            + Pending
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-success"
                            onClick={() =>
                              updateQuantity(prod._id, 'completedQuantity', -1)
                            }
                            disabled={prod.completedQuantity === 0}
                          >
                            − Completed
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-success"
                            onClick={() =>
                              updateQuantity(prod._id, 'completedQuantity', 1)
                            }
                          >
                            + Completed
                          </Button>
                        </div>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ))
        )}
      </Card>

      <ToastContainer position="bottom-end" className="p-3">
        <Toast
          show={toast.show}
          bg="light"
          autohide
          delay={3000}
          onClose={() => setToast({ ...toast, show: false })}
        >
          <Toast.Body>{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default PendingProductsPage;
