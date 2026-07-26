import prisma from '../prisma/db';
import { AppError } from '../middleware/error.middleware';
import { generateInvoicePdfBuffer } from './invoice.service';
import { uploadInvoiceToCloudinary } from './cloudinary.service';

export const getUserOrders = async (userId: string) => {
  return await prisma.order.findMany({
    where: { userId },
    include: { product: true, user: true },
    orderBy: { createdAt: "desc" },
  });
};

export const getOrderByIdService = async (orderId: string, userId: string, role: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { product: true, user: true },
  });

  if (!order) throw new AppError('Order not found', 404);

  if (order.userId !== userId && role !== 'ADMIN') {
    throw new AppError('Not authorized to view this order', 403);
  }

  return order;
};

export const createOrderService = async (userId: string, data: any) => {
  const { orderCode, locationUrl, ...orderData } = data;
  const finalOrderCode = orderCode || Math.random().toString(36).substring(2, 10).toUpperCase();

  const productId = orderData.productId;
  const quantity = parseInt(orderData.quantity) || 1;
  const size = orderData.size || null;

  if (!productId) {
    throw new AppError('Product ID is required to place an order', 400);
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Fetch current product safely
    const product = await tx.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // 1.5 If the product tracks per-size stock and a size was chosen, validate against that size's stock
    const sizeStock = (product.sizeStock as Record<string, number> | null) || null;
    let updatedSizeStock: Record<string, number> | undefined = undefined;

    if (sizeStock && size) {
      const currentSizeQty = Number(sizeStock[size] ?? 0);
      if (currentSizeQty < quantity) {
        throw new AppError(`Only ${currentSizeQty} items left in stock for size ${size}`, 400);
      }
      updatedSizeStock = { ...sizeStock, [size]: currentSizeQty - quantity };
    }

    // 2. Check overall stock level
    if (product.stock < quantity) {
      throw new AppError(`Only ${product.stock} items left in stock`, 400);
    }

    // 3. Decrement stock (overall + per-size) & increment bookings
    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: {
        stock: {
          decrement: quantity,
        },
        bookings: {
          increment: quantity,
        },
        ...(updatedSizeStock ? { sizeStock: updatedSizeStock } : {}),
      },
    });

    // 3.5 Record Stock History
    await tx.stockHistory.create({
      data: {
        productId,
        quantity: -quantity,
        prevStock: product.stock,
        newStock: updatedProduct.stock,
        reason: `Auto Stock Reduction (Order #${finalOrderCode})`,
        actor: "System",
      }
    });

    // 3.6 Check for low stock alert
    if (updatedProduct.stock <= updatedProduct.lowStockThreshold) {
      await tx.notification.create({
        data: {
          title: `⚠️ Low Stock Alert: ${updatedProduct.name}`,
          message: `Product "${updatedProduct.name}" is running low. Current stock is ${updatedProduct.stock} (Threshold: ${updatedProduct.lowStockThreshold}). Please replenish soon!`,
          productId: updatedProduct.id,
        }
      });
    }

    // 4. Create and return order
    return await tx.order.create({
      data: {
        ...orderData,
        quantity,
        userId,
        orderCode: finalOrderCode,
        locationUrl,
      },
    });
  });
};

export const updateOrderService = async (id: string, data: any) => {
  return await prisma.order.update({
    where: { id },
    data,
  });
};

export const getAllOrdersService = async () => {
  return await prisma.order.findMany({
    include: { product: true, user: true },
    orderBy: { createdAt: "desc" },
  });
};

// Builds a single consolidated PDF invoice covering one or more orders (e.g. a
// whole cart checkout), uploads it, and returns a shareable, downloadable URL —
// this is what gets linked in the short WhatsApp message sent to the admin
// instead of spelling every line item out as raw text.
export const generateInvoiceForOrders = async (orderCodes: string[], userId: string, role: string) => {
  if (!orderCodes || orderCodes.length === 0) {
    throw new AppError('No order codes provided', 400);
  }

  const orders = await prisma.order.findMany({
    where: { orderCode: { in: orderCodes } },
    include: { product: true, user: true },
  });

  if (orders.length === 0) {
    throw new AppError('Orders not found', 404);
  }

  const unauthorized = orders.some((o) => o.userId !== userId && role !== 'ADMIN');
  if (unauthorized) {
    throw new AppError('Not authorized to generate an invoice for these orders', 403);
  }

  // If every one of these orders already has the same invoice on file (e.g. the
  // download button was clicked again later), just hand back that link instead
  // of generating and uploading a fresh PDF.
  const existingUrl = orders[0].invoiceUrl;
  if (existingUrl && orders.every((o) => o.invoiceUrl === existingUrl)) {
    return existingUrl;
  }

  const first = orders[0];

  const buffer = await generateInvoicePdfBuffer({
    orders: orders.map((o) => ({
      orderCode: o.orderCode,
      quantity: o.quantity,
      size: o.size,
      totalAmount: o.totalAmount,
      product: {
        name: o.product.name,
        price: o.product.price,
        images: o.product.images,
      },
    })),
    customer: {
      name: first.user.name,
      phone: first.user.phone,
      address: first.user.address,
      houseNo: first.user.houseNo,
      streetNear: first.user.streetNear,
      road: first.user.road,
      district: first.user.district,
      state: first.user.state,
      pincode: first.user.pincode,
    },
    locationUrl: first.locationUrl || first.user.locationUrl,
  });

  const filename = `invoice-${orderCodes.join('-').slice(0, 60)}-${Date.now()}`;
  const invoiceUrl = await uploadInvoiceToCloudinary(buffer, filename);

  await prisma.order.updateMany({
    where: { orderCode: { in: orderCodes } },
    data: { invoiceUrl },
  });

  return invoiceUrl;
};
