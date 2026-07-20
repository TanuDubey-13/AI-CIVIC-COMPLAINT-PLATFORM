module.exports = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  name: process.env.DB_NAME || 'civic_complaints'
};
