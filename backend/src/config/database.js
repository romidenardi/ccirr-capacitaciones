import pkg from 'sequelize';
const { Sequelize } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql',
  logging: false,
  timezone: '-03:00',
  define: {
    // Columnas en snake_case en la base (created_at, capacitacion_id) y camelCase en el código
    underscored: true,
  },
});

export default sequelize;
