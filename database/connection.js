import mysql from 'mysql';
import dotenv from 'dotenv';

dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to MySQL database');
});

process.on('SIGINT', () => {
  connection.end((err) => {
    if (err) {
      console.error('Error while closing the database connection:', err.stack);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
 
export default connection;
