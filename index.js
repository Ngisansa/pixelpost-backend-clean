require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');  // <— CORS must be imported BEFORE use()

const app = express();         // <— app must be created BEFORE app.use()
const PORT = process.env.PORT || 3000;

app.use(cors());               // <— Now this is safe
app.use(express.json());       // <— parse JSON payloads

// CONNECT TO MONGODB
if (process.env.MONGO_URI) {
  mongoose.set('debug', true);
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Mongo connected'))
    .catch(err => console.error('Mongo connect error', err));
}

// Mount REST endpoints
app.use('/api/posts', require('./routes/posts'));
app.use('/api/payments', require('./routes/payments'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
