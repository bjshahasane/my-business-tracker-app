import connectMongoDB from '@/app/libs/mongodb';
import ProductionProduct from '@/app/models/ProductionProduct';

export async function GET() {
  await connectMongoDB();

  const products = await ProductionProduct.find();

  // Group by name for overall chart
  const totalSoldByName = {};
  const typeWiseSold = {};

  products.forEach(p => {
    // All Products Sold
    if (!totalSoldByName[p.name]) totalSoldByName[p.name] = 0;
    totalSoldByName[p.name] += p.completedQuantity;

    // By Type
    if (!typeWiseSold[p.type]) typeWiseSold[p.type] = {};
    if (!typeWiseSold[p.type][p.name]) typeWiseSold[p.type][p.name] = 0;
    typeWiseSold[p.type][p.name] += p.completedQuantity;
  });

  return Response.json({
    totalSoldByName,
    typeWiseSold,
  });
}
