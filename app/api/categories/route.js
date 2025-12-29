import { NextResponse } from "next/server";
import connectMongoDB from "@/app/libs/mongodb";
import Category from "@/app/models/Category";

// Helper: generate random product ID
function generateProductId(categoryName) {
  const base = categoryName.toLowerCase().replace(/\s+/g, "_");
  const random = Math.floor(100 + Math.random() * 900); // random 3-digit
  return `${base}_${random}`;
}

// CREATE Category
export async function POST(req) {
  try {
    await connectMongoDB();
    const body = await req.json();
    const { type, category } = body;

    const newCategory = await Category.create({
      type,
      category,
      itemList: [],
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// GET Categories
export async function GET() {
  try {
    await connectMongoDB();
    const categories = await Category.find();
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// UPDATE Category OR Product
export async function PUT(req) {
  try {
    await connectMongoDB();
    const { _id, productId, name, price, type, category } = await req.json();

    const cat = await Category.findById(_id);
    if (!cat) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    if (productId) {
      // Update product
      const product = cat.itemList.id(productId);
      if (!product) {
        return NextResponse.json({ message: "Product not found" }, { status: 404 });
      }
      if (name) product.name = name;
      if (price !== undefined) product.price = price;
    } else if (name || type || category) {
      // Update category itself
      if (type) cat.type = type;
      if (category) cat.category = category;
    }

    await cat.save();
    return NextResponse.json(cat, { status: 200 });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// ADD or EDIT Product in Category
export async function PATCH(req) {
  try {
    await connectMongoDB();
    const { _id, productId, name, price } = await req.json();

    const cat = await Category.findById(_id);
    if (!cat) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    // ------------------------------------
    // ✔ EDIT PRODUCT (only changed fields)
    // ------------------------------------
    if (productId) {
      const index = cat.itemList.findIndex((item) => item.id === productId);

      if (index === -1) {
        return NextResponse.json(
          { message: "Product not found" },
          { status: 404 }
        );
      }

      const product = cat.itemList[index];
      let updated = false;

      // Update only if name changed
      if (name !== undefined && name !== product.name) {
        product.name = name;
        updated = true;
      }

      // Update only if price changed
      if (price !== undefined && price !== product.price) {
        product.price = price;
        updated = true;
      }

      if (updated) {
        await cat.save();
      }

      return NextResponse.json(
        {
          message: updated ? "Product updated" : "No changes detected",
          category: cat,
        },
        { status: 200 }
      );
    }

    // ------------------------------------
    // ✔ ADD NEW PRODUCT
    // ------------------------------------
    const newProduct = {
      id: generateProductId(cat.category),
      name,
      price,
    };

    cat.itemList.push(newProduct);
    await cat.save();

    return NextResponse.json(
      { message: "Product added", category: cat },
      { status: 200 }
    );

  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}



// DELETE Category OR Product
export async function DELETE(req) {
  try {
    await connectMongoDB();
    const { _id, productId } = await req.json();

    if (productId) {
      // Delete product
      const cat = await Category.findById(_id);
      if (!cat) {
        return NextResponse.json({ message: "Category not found" }, { status: 404 });
      }
      cat.itemList = cat.itemList.filter((p) => p.id !== productId);
      await cat.save();
      return NextResponse.json({ message: "Product deleted" }, { status: 200 });
    } else {
      // Delete entire category
      const deletedCategory = await Category.findByIdAndDelete(_id);
      if (!deletedCategory) {
        return NextResponse.json({ message: "Category not found" }, { status: 404 });
      }
      return NextResponse.json({ message: "Category deleted" }, { status: 200 });
    }
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
