import connectMongoDB from '@/app/libs/mongodb';
import Expense from '@/app/models/Expense';
import { NextResponse } from 'next/server';

export async function GET() {
  await connectMongoDB();
  const expenses = await Expense.find().sort({ date: -1 });
  return Response.json(expenses);
}

export async function POST(req) {
  await connectMongoDB();
  const data = await req.json();
  const newExpense = await Expense.create(data);
  return Response.json({ success: true, expense: newExpense });
}

export async function DELETE(req) {
  try {
    await connectMongoDB();
    const body = await req.json();
    const { _id } = body;

    if (!_id) {
      return NextResponse.json({ message: "Missing _id" }, { status: 400 });
    }

    const deletedExpense = await Expense.findByIdAndDelete(_id);

    if (!deletedExpense) {
      return NextResponse.json({ message: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Expense deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}