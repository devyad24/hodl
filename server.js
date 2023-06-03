const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(__dirname + '/public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });


const btcSchema = new mongoose.Schema({
  name: String,
  last: Number,
  buy: Number,
  sell: Number,
  volume: Number,
  base_unit: String,
});

const btc = mongoose.model('btc', btcSchema);

app.get('/fetchData', async (req, res) => {
  try {
    const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
    const json_data = response.data;

    const bitcoins = Object.values(json_data).slice(0, 10).map(bitcoin => ({
      name: bitcoin.name,
      last: bitcoin.last,
      buy: bitcoin.buy,
      sell: bitcoin.sell,
      volume: bitcoin.volume,
      base_unit: bitcoin.base_unit,
    }));

    await btc.insertMany(bitcoins);

    res.json({ message: 'Data fetched and stored successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching and storing the data.' });
  }
});

// ...

// Route to get the stored data from the database
app.get('/get_btc', async (req, res) => {
  try {
    const bitcoins = await btc.find();

    res.json(bitcoins);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving the data.' });
  }
});

app.get('/home', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:3000/get_btc');
    const bitcoin_data = response.data;

    res.render('home', {bitcoin_data})
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
})
