import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import transactionRepository from '../repositories/transaction.repository';
import productRepository from '../../product-service/repositories/product.repository';
import { PENDING_PAYMENT, reformTransaction } from '../utils/transaction.utils';
import { transactions_status } from '../../../generated/prisma';
import crypto from 'crypto';


// Create Transaction
export const createTransaction = async (req: Request, res: Response): Promise<void> => {
  const { products, customer_name, customer_email } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
      res.status(400).json({
      status: 'error',
      message: 'Products are required',
    });
  }

  try {
    const productIds = products.map((p: any) => p.id);
    const productsFromDB = await productRepository.findByIds(productIds);

    if (!productsFromDB || productsFromDB.length === 0) {
        res.status(400).json({
        status: 'error',
        message: 'Products not found',
      });
    }

    // Inject quantity from request into productsFromDB
    productsFromDB.forEach((product: any) => {
      const requested = products.find((p: any) => p.id === product.id);
      product.stock = requested.quantity;
    });

    const gross_amount = productsFromDB.reduce(
      (acc: number, product: any) => acc + product.stock * product.price,
      0
    );
    // console.log(gross_amount);
    const transaction = await transactionRepository.createTransaction({
      customer_name,
      customer_email,
      gross_amount,
      snap_token: null,
      snap_redirect_url: null,
    });

    await transactionRepository.createTransactionItems(transaction.id, productsFromDB );

      res.status(201).json({
      status: 'success',
      data: {
        id: transaction.id,
        status: transaction.status,
        customer_name: transaction.customer_name,
        customer_email: transaction.customer_email,
        products: productsFromDB,
        snap_token: transaction.snap_token,
        snap_redirect_url: transaction.snap_redirect_url,
      },
    });
  } catch (error) {
    console.error('Create Transaction Error:', error);
      res.status(500).json({
      status: 'error',
      message: 'Failed to create transaction',
    });
  }
};


// Get all transactions (optional filter by status)
export const getTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status } = req.query;
      const transactions = await transactionRepository.findAll(status as transactions_status);
  
        res.json({
        status: 'success',
        data: transactions.map((transaction: any) => reformTransaction(transaction as any)),
        // atau
        // data: transactions.map((transaction: any) => reformTransaction(transaction)),
      });
    } catch (error) {
      console.error('Get Transactions Error:', error);
        res.status(500).json({
        status: 'error',
        message: 'Failed to fetch transactions',
      });
    }
  };
// Get transaction by ID
export const getTransactionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        status: 'error',
        message: 'Transaction ID is required',
      });
      ;
    }

    const transaction = await transactionRepository.findById(id);

    if (!transaction) {
      res.status(404).json({
        status: 'error',
        message: 'Transaction not found',
      });
      ;
    }

    res.json({
      status: 'success',
      data: reformTransaction(transaction),
    });
  } catch (error) {
    console.error('Get Transaction By ID Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch transaction',
    });
  }
};
export const notifMidtrans = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
    } = req.body;

    // const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    // const expectedSignature = crypto
    //   .createHash('sha512')
    //   .update(order_id + status_code + gross_amount + serverKey)
    //   .digest('hex');

    const expectedSignature = 123123;

    // Validate signature
    if (signature_key !== expectedSignature) {
       res.status(403).json({
        status: 'error',
        message: 'Invalid signature key',
      });
    }

    // Fetch transaction
    const transaction = await transactionRepository.findById(order_id);
    if (!transaction) {
       res.status(404).json({
        status: 'error',
        message: 'Transaction not found',
      });
    }

    // Update transaction status
    await transactionRepository.updateStatusFromMidtrans(
      order_id,
      transaction_status,
      fraud_status,
      payment_type
    );

     res.status(200).json({
      status: 'success',
      message: 'Transaction status updated successfully',
    });
  } catch (error) {
    console.error('Midtrans Notification Error:', error);
     res.status(500).json({
      status: 'error',
      message: 'Failed to handle Midtrans notification',
    });
  }
};
// Update transaction status and payment method
export const updateTransactionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { transaction_id } = req.params;
    const { status, payment_method } = req.body;

    const transaction = await transactionRepository.updateStatus(
      transaction_id,
      status,
      payment_method
    );

      res.json({
      status: 'success',
      data: transaction,
    });
  } catch (error) {
    console.error('Update Transaction Status Error:', error);
      res.status(500).json({
      status: 'error',
      message: 'Failed to update transaction status',
    });
  }
};

