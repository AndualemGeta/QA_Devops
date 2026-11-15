import { test, expect } from '@playwright/test';

test.describe('Critical E2E User Flow: Purchase a Product', () => {
  let userId: string;
  let productId: string;
  let transactionId: string;
  
  const baseUrl = 'http://localhost:4000'; 

  test('should successfully create a user, fetch a product, and complete a transaction', async ({ request }) => {
    
    // ----------------------------------------------------------------------
    // 1. Create User
    // ----------------------------------------------------------------------
    const userPayload = {
      name: 'QA Assessment User',
      email: `qa-user-${Date.now()}@ellatech.com`,
      password: 'SecurePassword123!'
    };

    const createUserResponse = await request.post(`${baseUrl}/users`, {
      data: userPayload
    });
    
    expect(createUserResponse.status()).toBe(201);
    const userData = await createUserResponse.json();

expect(userData.data.id).toBeDefined();
expect(userData.data.email).toBe(userPayload.email);
userId = userData.data.id;
    // ----------------------------------------------------------------------
    // 2. Setup Test Data: Create & Fetch Product
    // ----------------------------------------------------------------------
    // A. Create a product to validate the POST endpoint and ensure we have a product to work with
    const productPayload = {
      name: 'QA Assessment Laptop ' + Date.now(),
      description: 'High performance testing machine',
      price: 1200,
      quantity: 10
    };

   const createProductResponse = await request.post(`${baseUrl}/products`, {
      data: productPayload
    });


    expect(createProductResponse.status()).toBe(201);
    const createdProduct = await createProductResponse.json();
    expect(createdProduct.data.id).toBeDefined();

    // B. Fetch products to validate the GET endpoint as originally intended
    const getProductsResponse = await request.get(`${baseUrl}/products`);
    expect(getProductsResponse.status()).toBe(200);
    const productsData = await getProductsResponse.json();
    
    expect(productsData.data.length).toBeGreaterThan(0);
    
    // Use the ID of the product we just explicitly created
    productId = createdProduct.data.id;

    // ----------------------------------------------------------------------
    // 3. Create Transaction
    // ----------------------------------------------------------------------
    const transactionPayload = {
      userId: userId,
      productId: productId,
      quantity: 1
    };

    const createTransactionResponse = await request.post(`${baseUrl}/transactions`, {
      data: transactionPayload
    });
    
    expect(createTransactionResponse.status()).toBe(201);
    const transactionData = await createTransactionResponse.json();
    
    expect(transactionData.data.id).toBeDefined();
    expect(transactionData.data.user.id).toBe(userId);
    expect(transactionData.data.product.id).toBe(productId);
    transactionId = transactionData.data.id;

    // ----------------------------------------------------------------------
    // 4. Validate Transaction Exists (Verification Step)
    // ----------------------------------------------------------------------
    const getTransactionResponse = await request.get(`${baseUrl}/transactions/${transactionId}`);
    
    
    expect(getTransactionResponse.status()).toBe(200);
    const fetchedTransaction = await getTransactionResponse.json();
    
    expect(fetchedTransaction.data.id).toBe(transactionId);
    expect(fetchedTransaction.data.user.id).toBe(userId);
    expect(fetchedTransaction.data.product.id).toBe(productId);
  });
});