const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.post("/transfer", async (req, res) => {
  const { sourceSku, destinationSku, quantity } = req.body;

  try {
    const token = await getSellercloudAuthToken();

    const response = await axios.post(
      "https://api.sellercloud.com/api/inventory/transfer",
      {
        FromSKU: sourceSku,
        ToSKU: destinationSku,
        Quantity: quantity
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

async function getSellercloudAuthToken() {
  const res = await axios.post("https://api.sellercloud.com/api/token", {
    username: process.env.SC_USERNAME,
    password: process.env.SC_PASSWORD,
    client_id: process.env.SC_CLIENT_ID,
    grant_type: "password"
  });
  return res.data.access_token;
}

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
