'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Toast,ToastBody } from 'react-bootstrap';

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ title: '', amount: '', date: '', category: '' });
  const [toast, setToast] = useState({ show: false, message: '' });


  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const res = await axios.get('/api/expenses');
    setExpenses(res.data);
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    await axios.post('/api/expenses', {
      ...form,
      amount: parseFloat(form.amount),
      date: new Date(form.date),
    });
    setForm({ title: '', amount: '', date: '', category: '' });
    fetchExpenses();
  };

  const handleDelete = async (_id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this expense?");
    if (!confirmDelete) return; // If user clicks Cancel, stop here

    try {
     const res =  await fetch('/api/expenses', {
        method: 'DELETE',
         headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id }) // Send _id in body
      });

      // console.log("This is re",res);
      const result = await res.json();
      console.log(result);
      if (res.ok) {
        setToast({ show: true, message: 'Expense deleted successfully' });
      } else {
        setToast({ show: true, message: 'Delete failed: ' + result.message });
      }
      fetchExpenses();
      // setToast({ show: true, message: 'Expense deleted successfully' });

    } catch (error) {
      console.error("Error deleting expense:", error);
      setToast({ show: true, message: 'Network error while deleting order' });

    }
  };



  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="p-4">
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
              <ToastBody>{toast.message}</ToastBody>
            </Toast>
      <h2 className="mb-4">💸 Expense Tracker</h2>

      <div className="mb-4">
        <h5>Add New Expense</h5>
        <form onSubmit={handleSubmit} className="d-flex gap-2 flex-wrap">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            required
            className="form-control w-auto"
          />
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
            required
            className="form-control w-auto"
          />
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            className="form-control w-auto"
          />
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
            className="form-control w-auto"
          />
          <button type="submit" className="btn btn-primary">
            Add
          </button>
        </form>
      </div>

      <div className="mb-3">
        <h5>Total Expenses: ₹ {total}</h5>
      </div>

      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th>Date</th>
            <th>Title</th>
            <th>Amount (₹)</th>
            <th>Category</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map(exp => (
            <tr key={exp._id}>
              <td>{new Date(exp.date).toLocaleDateString()}</td>
              <td>{exp.title}</td>
              <td>₹ {exp.amount}</td>
              <td>{exp.category}</td>
              <td>
                <button
                  onClick={() => handleDelete(exp._id)}
                  className="btn btn-danger btn-sm"
                >
                  ❌ Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpensesPage;
