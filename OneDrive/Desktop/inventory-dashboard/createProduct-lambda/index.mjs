import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  // ... (rest of the code is the same as before)
  const { productName, description, price, quantity, lowStockThreshold } = JSON.parse(event.body);
  const productId = uuidv4();
  const timestamp = new Date().toISOString();

  const command = new PutCommand({
    TableName: "Products",
    Item: {
      productId: productId,
      productName: productName,
      description: description,
      price: price,
      quantity: quantity,
      lowStockThreshold: lowStockThreshold,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  });

  try {
    await docClient.send(command);
    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Product created successfully", productId: productId }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error creating product", error: error.message }),
    };
  }
};