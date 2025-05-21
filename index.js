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

  // Debug environment variables
  console.log("🔍 SC_USERNAME loaded:", process.env.SC_USERNAME ? "✅ Present" : "❌ Missing");
  console.log("🔍 SC_PASSWORD loaded:", process.env.SC_PASSWORD ? "✅ Present" : "❌ Missing");

  if (sellercloudToken && now < tokenExpiresAt) {
    console.log("✅ Using cached token");
    return sellercloudToken;
  }

  try {
    const response = await axios.post(`${SELLERCLOUD_BASE_URL}/api/token`, {
      Username: process.env.SC_USERNAME,
      Password: process.env.SC_PASSWORD
    });

    console.log("✅ Token response:", response.data);

    const { access_token, expires_in } = response.data;
    sellercloudToken = access_token;
    tokenExpiresAt = now + expires_in * 1000 - 30000;

    return sellercloudToken;
  } catch (error) {
    console.error("❌ Token fetch failed:", error.response?.data || error.message);
    throw new Error("Failed to get token");
  }
}

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
      ToWarehouseID: toWarehouseId,
      FromBinID: fromBinId,
      ToBinID: toBinId,
      TransferReason: transferReason,
      SerialNumbers: serialNumbers
    };

    console.log("📦 Sending payload to Sellercloud:", JSON.stringify(payload, null, 2));

    const response = await axios.post(
      `${SELLERCLOUD_BASE_URL}/api/Inventory/SkuToSkuTransfers`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error("❌ Transfer error:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000, () => {
  console.log("🚀 SKU Transfer backend running on port 3000");
});
