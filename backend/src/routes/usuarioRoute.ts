import { Router } from 'express';
import { UsuarioController } from '../controllers/usuarioController';

const router = Router();
const controller = new UsuarioController();

// POST /api/usuarios
router.post('/usuarios', controller.criar);

export default router;