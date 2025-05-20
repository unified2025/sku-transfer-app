# SKU Transfer App

A simple Node.js app that allows SKU-to-SKU inventory transfers using the Sellercloud API.

## Setup

1. Copy `.env.example` to `.env` and fill in your Sellercloud credentials.
2. Install dependencies:
   ```
   npm install
   ```
3. Run the server:
   ```
   npm start
   ```

## Endpoint

### POST `/transfer`

**Body**:
```json
{
  "sourceSku": "SKU123",
  "destinationSku": "SKU456",
  "quantity": 5
}
```
