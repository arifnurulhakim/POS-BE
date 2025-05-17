import { Response } from "express";
// import { PrismaClient } from '@prisma/client';

export function response_success(res: Response, message: string, data?: any) {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
}

export function response_error(res: Response, message: string) {
  return res.status(500).json({
    success: false,
    message,
  });
}

export const PENDING_PAYMENT = 'PENDING_PAYMENT';
export const PAID = 'PAID';
export const CANCELED = 'CANCELED';


type ReformattedTransaction = {
  id: string;
  total: number;
  status: string;
  customer_name: string;
  customer_email: string;
  snap_token: string | null;
  snap_redirect_url: string | null;
  payment_method: string | null;
  products: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string | null;
  }[];
};

export const reformTransaction = (transaction: any): ReformattedTransaction => {
  return {
    id: transaction.id,
    total: transaction.total,
    status: transaction.status,
    customer_name: transaction.customer_name,
    customer_email: transaction.customer_email,
    snap_token: transaction.snap_token,
    snap_redirect_url: transaction.snap_redirect_url,
    payment_method: transaction.payment_method,
    products: transaction.transactions_items.map((transactionItem: any) => ({
      id: transactionItem.product_id,
      name: transactionItem.product_name,
      price: transactionItem.price,
      quantity: transactionItem.quantity,
      image: transactionItem.products?.image || null,
    })),
  };
};