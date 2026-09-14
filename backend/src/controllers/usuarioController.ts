import { Request, Response } from 'express';
import sql from 'mssql';
import { poolPromise, } from '../config/db';

export class UsuarioController {
  async criar(req: Request, res: Response) {
    const { nome, cpf, email, area, cargo, senha } = req.body;

    try {
      const pool = await poolPromise;

      // Verifica se e-mail ou CPF já constam no banco
      const checkUser = await pool.request()
        .input('Email', sql.VarChar, email)
        .input('Cpf', sql.VarChar, cpf)
        .query('SELECT Id FROM Usuarios WHERE Email = @Email OR Cpf = @Cpf');

      if (checkUser.recordset.length > 0) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'E-mail ou CPF já cadastrados no sistema.'
        });
      }

      // Insere o novo colaborador na tabela Usuarios
      await pool.request()
        .input('Nome', sql.VarChar, nome)
        .input('Email', sql.VarChar, email)
        .input('Senha', sql.VarChar, senha)
        .input('Cargo', sql.VarChar, cargo)
        .input('Cpf', sql.VarChar, cpf)
        .input('Area', sql.VarChar, area)
        .query(`
          INSERT INTO Usuarios (Nome, Email, Senha, Cargo, Cpf, Area, CriadoEm)
          VALUES (@Nome, @Email, @Senha, @Cargo, @Cpf, @Area, GETDATE())
        `);

      return res.status(201).json({
        sucesso: true,
        mensagem: 'Colaborador cadastrado com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro interno ao salvar colaborador no banco de dados.'
      });
    }
  }
}