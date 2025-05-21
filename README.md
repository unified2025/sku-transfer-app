# SKU Transfer App

A Node.js app that performs SKU-to-SKU inventory transfers using the Sellercloud REST API.

## Setup

1. Copy `.env.example` to `.env` and fill in your Sellercloud credentials.
2. Run `npm install` to install dependencies.
3. Start the app with `npm start`.

## Endpoint

### POST /transfer

**Request Body:**
```json
{
  "sourceSku": "SKU123",
  "destinationSku": "SKU456",
  "quantity": 5,
  "fromWarehouseId": 1,
  "toWarehouseId": 2,
  "fromBinId": 100,
  "toBinId": 200,
  "transferReason": "Restocking",
  "serialNumbers": "SN001,SN002"
}
```
