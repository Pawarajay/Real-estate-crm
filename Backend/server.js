require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();

app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true,
}));

app.use(bodyParser.json());

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'LeadcaptureCRM',
};

let connection;
async function connectDB() {
  if (!connection) {
    connection = await mysql.createConnection(dbConfig);
    console.log(' MySQL connected.');
  }
  return connection;
}

app.use((req, res, next) => {
  req.db = connectDB();
  next();
});

const whatsappRoutes = require('./routes/whatsapp');
const leadsRoutes = require('./routes/leads');
const duplicatesRoutes = require('./routes/duplicates');

app.use('/api/leads', leadsRoutes);         
app.use('/api/contacts', whatsappRoutes);   
app.use('/api/duplicates', duplicatesRoutes); 

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
