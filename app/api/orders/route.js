import connectMongoDB from '@/app/libs/mongodb';
import orders from '@/app/models/Orders';
import { NextResponse } from 'next/server';
import ProductionProduct from '@/app/models/ProductionProduct';

export async function GET() {
  await connectMongoDB();
  const orderP = await orders.find().sort({ date: -1 });
  return NextResponse.json(orderP);
}

export async function POST(req) {
  try {
    await connectMongoDB();

    const body = await req.json();
    const { products, isFulfilled } = body;

    // Create new order first
    const newOrder = await orders.create(body);

    // Update ProductionProduct collection
    for (const product of products) {
      const updateField = isFulfilled ? 'completedQuantity' : 'pendingQuantity';

      const update = {};
      update[updateField] = product.quantity;

      await ProductionProduct.findOneAndUpdate(
        { productId: product.id },
        {
          $inc: update,
          $setOnInsert: {
            name: product.name,
            type: product.type,
          }
        },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({ success: true, data: newOrder }, { status: 201 });

  } catch (error) {
    console.error("Order Creation Error:", error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectMongoDB();

    const body = await req.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json({ success: false, message: "Missing order ID" }, { status: 400 });
    }

    const existingOrder = await orders.findById(_id);
    if (!existingOrder) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // 1. Reverse old product quantities
    for (const product of existingOrder.products) {
      const fieldToDecrement = existingOrder.isFulfilled ? 'completedQuantity' : 'pendingQuantity';

      const decrement = {};
      decrement[fieldToDecrement] = -product.quantity;

      await ProductionProduct.findOneAndUpdate(
        { productId: product.id },
        { $inc: decrement }
      );
    }

    // 2. Update the order
    const updatedOrder = await orders.findByIdAndUpdate(_id, updateData, { new: true });

    // 3. Apply new product quantities
    for (const product of updateData.products) {
      const fieldToIncrement = updateData.isFulfilled ? 'completedQuantity' : 'pendingQuantity';

      const increment = {};
      increment[fieldToIncrement] = product.quantity;

      await ProductionProduct.findOneAndUpdate(
        { productId: product.id },
        {
          $inc: increment,
          $setOnInsert: {
            name: product.name,
            type: product.type
          }
        },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({ success: true, data: updatedOrder }, { status: 200 });

  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectMongoDB();

    const body = await req.json();
    const { _id } = body;

    if (!_id) {
      return NextResponse.json({ success: false, message: "Missing order ID" }, { status: 400 });
    }

    // 1. Find the order before deleting it
    const order = await orders.findById(_id);

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // 2. Adjust production product quantities before deletion
    for (const product of order.products) {
      const fieldToDecrement = order.isFulfilled ? 'completedQuantity' : 'pendingQuantity';

      const decrement = {};
      decrement[fieldToDecrement] = -product.quantity;

      await ProductionProduct.findOneAndUpdate(
        { productId: product.id },
        { $inc: decrement }
      );
    }

    // 3. Delete the order
    await orders.findByIdAndDelete(_id);

    return NextResponse.json({ success: true, message: "Order deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}