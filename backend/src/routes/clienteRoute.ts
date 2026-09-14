import { Router } from 'express';
import { ClienteController } from '../controllers/clienteController';
import { login } from '../controllers/authController'; // 1. Importa a função de login

const router = Router();
const controller = new ClienteController();

// Rota de Autenticação
router.post('/login', login); // 2. Adiciona a rota de login

// Rotas de Clientes
router.get('/clientes', controller.listar);
router.get('/clientes/:id', controller.buscarPorId);
router.post('/clientes', controller.criar);
router.put('/clientes/:id', controller.atualizar);
router.delete('/clientes/:id', controller.deletar);

export default router;