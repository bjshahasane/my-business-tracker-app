'use client'

import React, { useEffect, useState } from 'react';
import {
  Modal, ModalBody, ModalHeader, ModalTitle, ModalFooter,
  Form, FormLabel, FormGroup, FormControl, FormSelect,
  Accordion, AccordionItem, AccordionHeader, AccordionBody,
  Button
} from 'react-bootstrap';

const OrderFormModal = ({ show, onClose, onSubmit, isEditMode, form, setForm }) => {
  const [categories, setCategories] = useState([]);

  // Fetch categories + products from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    if (show) fetchCategories();
  }, [show]);

  // Auto calculate totals
  useEffect(() => {
    const subTotal = form.products.reduce((sum, p) => sum + p.price * p.quantity, 0);
    let discountAmount = 0;

    if (form.discountType === 'percent') {
      discountAmount = (parseFloat(form.discount) || 0) * subTotal / 100;
    } else if (form.discountType === 'rs') {
      discountAmount = parseFloat(form.discount) || 0;
    }

    const totalBeforeShipping = subTotal - discountAmount;
    const totalAfterShipping = totalBeforeShipping + (parseFloat(form.shipping) || 0);

    setForm(prev => ({
      ...prev,
      totalBeforeShipping,
      totalAfterShipping
    }));
  }, [form.products, form.discount, form.shipping, form.discountType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProductQuantityChange = (product, change, categoryType) => {
    setForm(prevForm => {
      const existing = prevForm.products.find(p => p.id === product.id);
      let updatedProducts;

      if (existing) {
        const newQty = existing.quantity + change;
        if (newQty <= 0) {
          updatedProducts = prevForm.products.filter(p => p.id !== product.id);
        } else {
          updatedProducts = prevForm.products.map(p =>
            p.id === product.id ? { ...p, quantity: newQty } : p
          );
        }
      } else if (change > 0) {
        updatedProducts = [
          ...prevForm.products,
          { id: product.id, name: product.name, price: product.price, quantity: 1, type: categoryType }
        ];
      } else {
        return prevForm;
      }

      return { ...prevForm, products: updatedProducts };
    });
  };

  const handleSubmit = () => {
    const totalBeforeShipping = form.products.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const totalAfterShipping = totalBeforeShipping + parseFloat(form.shipping || 0) - parseFloat(form.discount || 0);

    onSubmit({ ...form, totalBeforeShipping, totalAfterShipping });
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <ModalHeader closeButton>
        <ModalTitle>{isEditMode ? 'Edit Order' : 'Add Order'}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <Form>
          {/* Customer Info */}
          <FormGroup className="mb-3 col-md-9">
            <FormLabel>Customer Name</FormLabel>
            <FormControl
              type="text"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup className="mb-3 col-md-9">
            <FormLabel>Date</FormLabel>
            <FormControl
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
            />
          </FormGroup>

          {/* Products */}
          <FormGroup className="mb-3">
            <FormLabel>Products</FormLabel>
            <Accordion>
              {categories.map((group, index) => (
                <AccordionItem eventKey={index.toString()} key={group._id}>
                  <AccordionHeader>{group.type} ({group.category})</AccordionHeader>
                  <AccordionBody>
                    {group.itemList.map(product => {
                      const selected = form.products.find(p => p.id === product.id);
                      return (
                        <div
                          key={product.id}
                          className="d-flex justify-content-between align-items-center border p-2 rounded mb-2"
                        >
                          <div>
                            <strong>{product.name}</strong> – ₹{product.price}
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleProductQuantityChange(product, -1, group.type)}
                            >
                              −
                            </Button>
                            <span>{selected?.quantity || 0}</span>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleProductQuantityChange(product, 1, group.type)}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </AccordionBody>
                </AccordionItem>
              ))}
            </Accordion>
          </FormGroup>

          {/* Discount & Shipping */}
          <FormGroup className="mb-3 col-md-4 d-flex gap-2">
            <FormLabel>Discount</FormLabel>
            <FormSelect
              name="discountType"
              value={form.discountType}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="rs">(₹)</option>
              <option value="percent">%</option>
            </FormSelect>
            <FormControl
              type="number"
              name="discount"
              value={form.discount}
              onChange={handleChange}
              placeholder="Amount"
            />
          </FormGroup>

          <FormGroup className="mb-3 col-md-3">
            <FormLabel>Shipping</FormLabel>
            <FormControl
              type="number"
              name="shipping"
              value={form.shipping}
              onChange={handleChange}
            />
          </FormGroup>

          {/* Totals */}
          <FormGroup className="mb-3">
            <FormLabel>Total Before Shipping</FormLabel>
            <FormControl
              type="number"
              readOnly
              value={form.totalBeforeShipping.toFixed(2)}
            />
          </FormGroup>

          <FormGroup className="mb-3">
            <FormLabel>Total After Shipping</FormLabel>
            <FormControl
              type="number"
              readOnly
              value={form.totalAfterShipping.toFixed(2)}
            />
          </FormGroup>

          {/* Fulfilled */}
          <FormGroup className="mb-3">
            <FormLabel>Is order fulfilled?</FormLabel>
            <FormSelect
              name="isFulfilled"
              value={form.isFulfilled.toString()}
              onChange={(e) =>
                setForm(prev => ({ ...prev, isFulfilled: e.target.value === 'true' }))
              }
            >
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </FormSelect>
          </FormGroup>

          <FormGroup className="mb-3">
            <FormLabel>Other information</FormLabel>
            <FormControl
              as="textarea"
              rows={3}
              name="message"
              value={form.message}
              onChange={handleChange}
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save Changes
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default OrderFormModal;
