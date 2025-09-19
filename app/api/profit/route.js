import connectMongoDB from '@/app/libs/mongodb';
import Order from '@/app/models/Orders';
import Expense from '@/app/models/Expense';

export async function GET() {
  await connectMongoDB();

  // Get sales from fulfilled orders
  const fulfilledOrders = await Order.find({ isFulfilled: true });
  const totalSales = fulfilledOrders.reduce((sum, order) => sum + (order.totalBeforeShipping || 0), 0);

  // Get total expenses
  const allExpenses = await Expense.find();
  const totalExpenses = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const profit = totalSales - totalExpenses;

  return Response.json({
    totalSales,
    totalExpenses,
    profit,
  });
}
