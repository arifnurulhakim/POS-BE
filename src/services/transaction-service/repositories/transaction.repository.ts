// import { PrismaClient } from '@prisma/client';
// import { PrismaClient, transactions_status } from '../../../generated/prisma';
// import { nanoid } from 'nanoid';
import { PENDING_PAYMENT } from '../utils/transaction.utils';
// import { enumUtil } from 'zod/lib/helpers/enumUtil';

import prisma from '../../../prisma/client';
import type { transactions_status } from '@prisma/client';

class transactionRepository {
  // Create new transaction
  static async createTransaction(data: {
    customer_name: string;
    customer_email: string;
    gross_amount: number;
    snap_token?: string | null;
    snap_redirect_url?: string | null;
  }) {
    try {
      // const id = `TRX-${nanoid(4)}-${nanoid(8)}`;
      // console.log(data.gross_amount);
      const transaction = await prisma.transaction.create({
        data: {
          customer_name: data.customer_name,
          customer_email: data.customer_email,
          total: data.gross_amount,
          status: PENDING_PAYMENT,
          snap_token: data.snap_token ?? null,
          snap_redirect_url: data.snap_redirect_url ?? null,
          user: {
            connect: {
              id: "0b09a195-cb3d-49de-b587-6392c4a4e405", // ganti dengan user ID sebenarnya
            },
          },
        },
      });

      // Encode server key
      const btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
      const authString = btoa(`${process.env.MIDTRANS_SERVER_KEY}:`);
      const id = transaction.id;
      const grossAmountFormatted = Math.floor(data.gross_amount); 
      // Midtrans payload
      const payload = {
        transaction_details: {
          order_id: id,
          gross_amount: grossAmountFormatted,
        },
        credit_card: {
          secure: true,
        },
        customer_details: {
          first_name: data.customer_name,
          email: data.customer_email,
        },
      };
      console.log('gross_amount before rounding:', data.gross_amount);
      console.log('gross_amount after rounding:', grossAmountFormatted);
      // Kirim ke Midtrans Snap API
      const response = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const midtransRes = await response.json();

      // console.log(midtransRes.token);

      // Simpan snap_token dan snap_redirect_url
      const updatedTransaction = await prisma.transaction.update({
        where: { id },
        data: {
          snap_token: midtransRes.token,
          snap_redirect_url: midtransRes.redirect_url,
        },
      });

      return updatedTransaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw new Error('Error creating transaction');
    }
  }
  // Create multiple transaction items
  static async createTransactionItems(transaction_id: string, products: Array<{
    id: string;
    name: string;
    price: number;
    stock: number;
  }>) {
    try {
      const items = products.map(product => ({
        // id: `TRX-ITEM-${nanoid(10)}`,
        transaction_id,
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity: product.stock,
      }));

      await prisma.transactionsItem.createMany({
        data: items,
      });

      return items;
    } catch (error) {
      console.error('Error creating transaction items:', error);
      throw new Error('Error creating transaction items');
    }
  }

  

  // Get all transactions with optional status filter
  static async findAll(status?: transactions_status) {
    try {
      const where = status ? { status } : {};
      const transactions = await prisma.transaction.findMany({
        where,
        include: {
          transactions_items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  image_url: true,
                },
              },
            },
          },
        },
      });
      return transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw new Error('Error fetching transactions');
    }
  }

  // Get transaction by ID
  static async findById(transaction_id: string) {
    try {
      if (!transaction_id) {
        throw new Error('Transaction ID is required');
      }
  
      return await prisma.transaction.findUnique({
        where: { id: transaction_id },
        include: {
          transactions_items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  image_url: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      console.error('Error fetching transaction by ID:', error);
      throw new Error('Error fetching transaction by ID');
    }
  }
  static async findByEmail(email: string) {
    try {
      if (!email) {
        throw new Error('email is required');
      }
  
      return await prisma.transaction.findMany({
        where: { customer_email: email },
        include: {
          transactions_items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  image_url: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      console.error('Error fetching transaction by email:', error);
      throw new Error('Error fetching transaction by email');
    }
  }
  // Update transaction status (and optional payment method)
  static async updateStatus(transaction_id: string, status: transactions_status, payment_method?: string | null) {
    try {
      return await prisma.transaction.update({
        where: { id: transaction_id },
        data: {
          status,
          payment_method: payment_method ?? undefined,
        },
      });
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw new Error('Error updating transaction status');
    }
  }

  static async updateStatusFromMidtrans(
    transaction_id: string,
    transaction_status: string,
    fraud_status: string,
    payment_method?: string | null
  ) {
    try {
      let statusToUpdate: transactions_status;

      if (transaction_status === 'capture') {
        statusToUpdate =
          fraud_status === 'accept' ? 'PAID' : 'PENDING_PAYMENT';
      } else if (transaction_status === 'settlement') {
        statusToUpdate = 'PAID';
      } else if (
        ['cancel', 'deny', 'expire'].includes(transaction_status)
      ) {
        statusToUpdate = 'CANCELED';
      } else if (transaction_status === 'pending') {
        statusToUpdate = 'PENDING_PAYMENT';
      } else {
        throw new Error(`Unknown Midtrans status: ${transaction_status}`);
      }

      return await prisma.transaction.update({
        where: { id: transaction_id },
        data: {
          status: statusToUpdate,
          payment_method: payment_method ?? undefined,
        },
      });
    } catch (error) {
      console.error('Error updating transaction from Midtrans:', error);
      throw new Error('Failed to update transaction from Midtrans');
    }
  }
}

// transaction.repository.ts



export default transactionRepository;