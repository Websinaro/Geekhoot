import { Request, Response, NextFunction } from "express";
import * as orderService from "../services/order.service";
import { AuthRequest } from "../middleware/auth.middleware";

export const getMyOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orders = await orderService.getUserOrders(req.user.id);
    res.json(orders);
  } catch (error: any) {
    next(error);
  }
};

export const getOrderById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.getOrderByIdService(req.params.id, req.user.id, req.user.role);
    res.json(order);
  } catch (error: any) {
    next(error);
  }
};

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.body.userId || req.user.id;
    
    // Authorization check already in controller is good
    if (userId !== req.user.id && req.user.role !== "ADMIN") {
       return res.status(403).json({ message: "Not authorized to create order for another user" });
    }

    const order = await orderService.createOrderService(userId, req.body);
    res.status(201).json(order);
  } catch (error: any) {
    next(error);
  }
};

export const updateOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.updateOrderService(req.params.id, req.body);
    res.json(order);
  } catch (error: any) {
    next(error);
  }
};

export const getAllOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orders = await orderService.getAllOrdersService();
    res.json(orders);
  } catch (error: any) {
    next(error);
  }
};

export const generateInvoice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderCodes } = req.body;
    const invoiceUrl = await orderService.generateInvoiceForOrders(orderCodes, req.user.id, req.user.role);
    res.json({ invoiceUrl });
  } catch (error: any) {
    next(error);
  }
};

// Public — no auth. This is the link shared over WhatsApp/SMS, opened straight
// from a phone's browser with no session, so it can't sit behind `protect`.
// Security is by the unguessable token rather than a login check.
export const downloadInvoiceFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    const { buffer, filename } = await orderService.getInvoicePdfByToken(token);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length.toString());
    res.send(buffer);
  } catch (error: any) {
    next(error);
  }
};
