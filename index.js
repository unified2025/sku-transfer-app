const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const SELLERCLOUD_BASE_URL = "https://unifiedsolutions.api.sellercloud.us/rest";

let sellercloudToken = null;
let tokenExpiresAt = 0;

async function getSellercloudAuthToken() {
  const now = Date.now();
  if (sellercloudToken && now < tokenExpiresAt) return sellercloudToken;
  const response = await axios.post(
    `${SELLERCLOUD_BASE_URL}/api/token`,
    { Username: process.env.SC_USERNAME, Password: process.env.SC_PASSWORD }
  );
  const { access_token, expires_in } = response.data;
  sellercloudToken = access_token;
  // refresh 30s before expiry
  tokenExpiresAt = now + (expires_in * 1000) - 30000;
  return sellercloudToken;
}

// New endpoint: fetch SKUs with authentication
app.get("/api/skus", async (req, res) => {
  const { productGroup, productGroupFilterType, keyword } = req.query;
  try {
    const token = await getSellercloudAuthToken();
    const response = await axios.get(
      `${SELLERCLOUD_BASE_URL}/api/Catalog`,
      {
        params: { productGroup, productGroupFilterType, keyword },
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    // Return the Items array directly
    return res.json({ success: true, items: response.data.Items || [] });
  } catch (error) {
    console.error("❌ SKU fetch error:", error.response?.data || error.message);
    return res.status(500).json({ success: false, error: error.response?.data || error.message });
  }
});

// Existing transfer endpoint
app.post("/transfer", async (req, res) => {
  const {
    sourceSku, destinationSku, quantity,
    fromWarehouseId, toWarehouseId,
    fromBinId, toBinId,
    transferReason, serialNumbers
  } = req.body;
  try {
    const token = await getSellercloudAuthToken();
    const payload = {
      FromSKU: sourceSku,
      ToSKU: destinationSku,
      Qty: quantity,
      FromWarehouseID: fromWarehouseId,
      TransferReason: transferReason || "Transfer from web"
    };
    if (toWarehouseId) payload.ToWarehouseID = toWarehouseId;
    if (fromBinId) payload.FromBinID = fromBinId;
    if (toBinId) payload.ToBinID = toBinId;
    if (serialNumbers) payload.SerialNumbers = serialNumbers;
    const response = await axios.post(
      `${SELLERCLOUD_BASE_URL}/api/Inventory/SkuToSkuTransfers`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.json({ success: true, data: response.data });
  } catch (error) {
    console.error("❌ Transfer error:", error.response?.data || error.message);
    const status = error.response?.status || 500;
    return res.status(status).json({ success: false, error: error.response?.data || error.message });
  }
});

// Start server
typeof process !== 'undefined' && app.listen(3000, () => {
  console.log("🚀 SKU Transfer backend running on port 3000");
});
