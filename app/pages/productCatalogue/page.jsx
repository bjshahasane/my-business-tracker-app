"use client";
import { useEffect, useState } from "react";
import {
  Container, Button,
  Card, CardBody, CardTitle, Form, FormControl, FormLabel, FormGroup, Table,
  Modal, ModalTitle, ModalBody, ModalHeader, ModalFooter
} from "react-bootstrap";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [formData, setFormData] = useState({ type: "", category: "", itemList: [] });
  const [productForm, setProductForm] = useState({ name: "", price: "" });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  // Fetch categories
  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Create Category
  const handleCreateCategory = async () => {
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setShowCategoryModal(false);
    setFormData({ type: "", category: "", itemList: [] });
    fetchCategories();
  };


  // Add Product
  const handleAddProduct = async () => {
    // if (!selectedCategory) return;

    const updated = {
      _id: selectedCategory._id,
      name: productForm.name,
      price: Number(productForm.price),
    };


    if (editingProductId) {
      updated.productId = editingProductId;
    }

    await fetch("/api/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    setShowProductModal(false);
    setProductForm({ name: "", price: "" });
    fetchCategories();
  };

  // Edit Product
  const EditProduct = (catId, productId) => {
    setSelectedCategory({ _id: catId });
    setEditingProductId(productId);
    const product = categories
      .find(c => c._id === catId)
      .itemList.find(p => p.id === productId);

    setProductForm({
      name: product.name,
      price: product.price
    });

    setShowProductModal(true);
  };




  // Delete Product
  const deleteProduct = async (catId, productId) => {
    if (!confirm("Delete this product?")) return;
    await fetch("/api/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: catId, productId }),
    });
    fetchCategories();
  };

  // Delete Category
  const deleteCategory = async (catId) => {
    if (!confirm("Delete this category?")) return;
    await fetch("/api/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: catId }),
    });
    fetchCategories();
  };

  return (
    <Container className="my-4">
      <h2 className="mb-4">Categories & Products</h2>
      <Button onClick={() => setShowCategoryModal(true)}>+ Add Category</Button>

      <div className="mt-4">
        {categories.map((cat) => (
          <Card key={cat._id} className="mb-3">
            <CardBody>
              <CardTitle>{cat.category} <small>({cat.type})</small></CardTitle>
              <Button
                size="sm"
                variant="success"
                onClick={() => {
                  setSelectedCategory(cat);
                  setShowProductModal(true);
                }}
              >
                + Add Product
              </Button>{" "}
              <Button size="sm" variant="danger" onClick={() => deleteCategory(cat._id)}>
                Delete Category
              </Button>

              <Table striped bordered hover size="sm" className="mt-3">
                <thead>
                  <tr>
                    {/* <th>ID</th> */}
                    <th>Product</th>
                    <th>Price</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cat.itemList.map((p) => (
                    <tr key={p.id}>
                      {/* <td>{p.id}</td> */}
                      <td>{p.name}</td>
                      <td>₹{p.price}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="warning"
                          onClick={() => { EditProduct(cat._id, p.id); }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => deleteProduct(cat._id, p.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Category Modal */}
      <Modal show={showCategoryModal} onHide={() => setShowCategoryModal(false)}>
        <ModalHeader closeButton>
          <ModalTitle>Create Category</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <FormLabel>Type</FormLabel>
              <FormControl
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />
            </FormGroup>
            <FormGroup className="mt-2">
              <FormLabel>Category</FormLabel>
              <FormControl
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleCreateCategory}>Save</Button>
        </ModalFooter>
      </Modal>

      {/* Product Modal */}
      <Modal show={showProductModal} onHide={() => setShowProductModal(false)}>
        <ModalHeader closeButton>
          <ModalTitle>Add Product to {selectedCategory?.category}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <FormLabel>Product Name</FormLabel>
              <FormControl
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              />
            </FormGroup>
            <FormGroup className="mt-2">
              <FormLabel>Price</FormLabel>
              <FormControl
                type="number"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleAddProduct}>Save</Button>
        </ModalFooter>
      </Modal>
    </Container >
  );
}
