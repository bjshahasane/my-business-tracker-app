import connectMongoDB from '@/app/libs/mongodb';
import ProductionProduct from '@/app/models/ProductionProduct';

export async function GET() {
  await connectMongoDB();
  const products = await ProductionProduct.find();
  return Response.json(products);
}

export async function PUT(req) {
  await connectMongoDB();
  const updates = await req.json(); // Array of { productId, pendingQuantity, completedQuantity }
    console.log("updates",updates);

  const bulkOps = updates.map(({ productId, pendingQuantity, completedQuantity }) => ({
    updateOne: {
      filter: { productId },
      update: { $set: { pendingQuantity, completedQuantity } },
    }
  }));

  await ProductionProduct.bulkWrite(bulkOps);

  return Response.json({ success: true });
}