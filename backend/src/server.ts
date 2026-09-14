import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import clienteRoutes from './routes/clienteRoute';
import usuarioRoutes from './routes/usuarioRoute';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas da aplicação
app.use('/api', clienteRoutes);
app.use('/api', usuarioRoutes);

// 1. Tratamento para Rota Não Encontrada (Erro 404)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    sucesso: false,
    mensagem: `A rota ${req.originalUrl} não existe no servidor.`
  });
});

// 2. Tratamento para Erro Geral do Servidor (Erro 500)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('💥 Erro no Servidor:', err.stack || err);
  
  res.status(err.status || 500).json({
    sucesso: false,
    mensagem: err.message || 'Ocorreu um erro interno no servidor.'
  });
});

app.listen(port, () => {
  console.log(`🚀 Servidor rodando com sucesso na porta ${port}`);
});