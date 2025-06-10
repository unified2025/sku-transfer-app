import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.text({ type: 'text/xml' }));

app.post('/authenticate', async (req, res) => {
  try {
    const response = await axios.post(
      'http://unifiedsolutions.ws.sellercloud.us/scservice.asmx',
      req.body,
      {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': '"http://api.sellercloud.com/Authenticate"'
        }
      }
    );
    res.send(response.data);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

app.post('/get-product', async (req, res) => {
  try {
    const response = await axios.post(
      'http://unifiedsolutions.ws.sellercloud.us/scservice.asmx',
      req.body,
      {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': '"http://api.sellercloud.com/GetProductDetailsBySerial"'
        }
      }
    );
    res.send(response.data);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

app.listen(port, () => {
  console.log(`✅ Sellercloud proxy running on port ${port}`);
});