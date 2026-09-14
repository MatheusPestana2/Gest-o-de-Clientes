import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { buscarUsuarioPorEmail } from '../repositories/usuarioRepository';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_aqui';

export async function login(req: Request, res: Response) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: 'E-mail e senha são obrigatórios.' 
      });
    }

    const usuario = await buscarUsuarioPorEmail(email);
    if (!usuario) {
      return res.status(401).json({ 
        sucesso: false, 
        mensagem: 'E-mail ou senha incorretos.' 
      });
    }

    // Tenta validar via bcrypt; se falhar, compara texto puro (caso a senha tenha sido gravada sem hash)
    let senhaValida = await bcrypt.compare(senha, usuario.Senha);
    if (!senhaValida && senha === usuario.Senha) {
      senhaValida = true;
    }

    if (!senhaValida) {
      return res.status(401).json({ 
        sucesso: false, 
        mensagem: 'E-mail ou senha incorretos.' 
      });
    }

    const token = jwt.sign(
      {
        id: usuario.Id,
        nome: usuario.Nome,
        email: usuario.Email,
        cargo: usuario.Cargo
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      sucesso: true,
      mensagem: 'Login realizado com sucesso!',
      token,
      usuario: {
        id: usuario.Id,
        nome: usuario.Nome,
        email: usuario.Email,
        cargo: usuario.Cargo
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro interno no servidor.' 
    });
  }
}