import { DataSource, DataSourceOptions } from 'typeorm';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USERNAME = process.env.DB_USERNAME || 'vitahub';
const DB_PASSWORD = process.env.DB_PASSWORD || 'vitahub_secret';
const DB_DATABASE = process.env.DB_DATABASE || 'vitahub';

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  extra: {
    charset: 'utf8mb4_unicode_ci',
  },
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
