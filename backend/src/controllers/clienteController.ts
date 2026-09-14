import { Request, Response } from 'express';
import { ClienteService } from '../services/clienteService';

export class ClienteController {
  private service = new ClienteService();

  listar = async (req: Request, res: Response) => {
    try {
      // CORREÇÃO: Extraindo filtro, area e cargo de req.query
      const { busca, filtro, area, cargo, page, limit } = req.query;

      const resultado = await this.service.listarClientes(
        busca ? (busca as string).trim() : undefined,
        Number(page) || 1,
        Number(limit) || 10,
        filtro ? (filtro as string) : undefined, // <--- Adicionado
        area ? (area as string).trim() : undefined,    // <--- Adicionado
        cargo ? (cargo as string).trim() : undefined   // <--- Adicionado
      );

      return res.status(200).json(resultado);
    } catch (error: any) {
      console.error('Erro ao listar clientes:', error);
      return res.status(500).json({ message: 'Erro interno ao listar clientes.' });
    }
  };

  buscarPorId = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ message: 'O ID informado é inválido.' });
      }

      const cliente = await this.service.buscarClientePorId(id);
      return res.status(200).json(cliente);
    } catch (error: any) {
      return res.status(404).json({ message: error.message || 'Cliente não encontrado.' });
    }
  };

  criar = async (req: Request, res: Response) => {
    try {
      const { nome, documento, email, telefone, area, cargo, ativo } = req.body;

      const dadosLimpos = {
        ...req.body,
        nome: nome?.trim(),
        documento: documento?.trim(),
        email: email?.trim() || null,
        telefone: telefone?.trim() || null,
        area: area?.trim() || null,
        cargo: cargo?.trim() || null,
        ativo: ativo ?? true
      };

      if (!dadosLimpos.nome || !dadosLimpos.documento) {
        return res.status(400).json({ message: 'Nome e Documento (CPF/CNPJ) são obrigatórios.' });
      }

      const cliente = await this.service.criarCliente(dadosLimpos);
      return res.status(201).json(cliente);
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Erro ao criar cliente.' });
    }
  };

  atualizar = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ message: 'O ID informado é inválido.' });
      }

      const { nome, documento, email, telefone, area, cargo, ativo } = req.body;

      const clienteExistente = await this.service.buscarClientePorId(id);

      const dadosLimpos = {
        ...req.body,
        nome: nome?.trim() || clienteExistente.nome,
        documento: documento?.trim() || clienteExistente.documento,
        email: email !== undefined ? email?.trim() : clienteExistente.email,
        telefone: telefone !== undefined ? telefone?.trim() : clienteExistente.telefone,
        area: area !== undefined ? area?.trim() : (clienteExistente.area || clienteExistente.Area),
        cargo: cargo !== undefined ? cargo?.trim() : (clienteExistente.cargo || clienteExistente.Cargo),
        ativo: ativo !== undefined ? ativo : clienteExistente.ativo
      };

      const cliente = await this.service.atualizarCliente(id, dadosLimpos);
      return res.status(200).json(cliente);
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Erro ao atualizar cliente.' });
    }
  };

  deletar = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ message: 'O ID informado é inválido.' });
      }

      await this.service.deletarCliente(id);
      return res.status(204).send();
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Erro ao deletar cliente.' });
    }
  };
}