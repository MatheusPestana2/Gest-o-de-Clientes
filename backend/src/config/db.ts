import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig: sql.config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'SuaSenhaAqui',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'DB_CLIENTES',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

console.log('Usuário:', process.env.DB_USER);
console.log('Servidor:', process.env.DB_SERVER);
console.log('Banco:', process.env.DB_NAME);

export const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then((pool) => {
    console.log('Conexão com o SQL Server estabelecida com sucesso!');
    return pool;
  })
  .catch((err) => {
    console.error('Falha ao conectar no SQL Server:', err);
    process.exit(1);
  });

  