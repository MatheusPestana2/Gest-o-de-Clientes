import { ClienteRepository } from '../repositories/clienteRepository';
import { buscarUsuarioPorEmail, buscarUsuarioPorDocumento } from '../repositories/usuarioRepository';
import { Cliente } from '../types/cliente';

export class ClienteService {
  private repository = new ClienteRepository();

  async listarClientes(
    busca?: string,
    page = 1,
    limit = 10,
    filtro?: string,
    area?: string,
    cargo?: string
  ) {
    // Repassa os filtros de busca, filtro, área e cargo para o repositório
    return await this.repository.listar(busca, page, limit, filtro, area, cargo);
  }

  async buscarClientePorId(id: number) {
    const cliente = await this.repository.buscarPorId(id);
    if (!cliente) throw new Error('Cliente não encontrado.');
    return cliente;
  }

  async criarCliente(cliente: Cliente) {
    const nomeTratado = String(cliente.nome || '').trim();
    const docLimpo = String(cliente.documento || '').replace(/\D/g, '');
    const emailTratado = String(cliente.email || '').trim().toLowerCase();

    if (!nomeTratado || !docLimpo) {
      throw new Error('Nome e Documento (CPF/CNPJ) são obrigatórios.');
    }

    // 1. PRIORIDADE 1: Validação de CPF/CNPJ na tabela de Clientes
    const documentoExisteCliente = await this.repository.buscarPorDocumento(docLimpo);
    if (documentoExisteCliente) {
      throw new Error('Este CPF/CNPJ já está cadastrado.');
    }

    // 2. PRIORIDADE 2: Validação de CPF/CNPJ na tabela de Usuários do Sistema
    const docExisteUsuario = await buscarUsuarioPorDocumento(docLimpo);
    if (docExisteUsuario) {
      throw new Error('Este CPF/CNPJ pertence a um usuário do sistema.');
    }

    // 3. Validação por Nome
    const nomeExisteCliente = await this.repository.buscarPorNome(nomeTratado);
    if (nomeExisteCliente) {
      throw new Error('Já existe um cliente cadastrado com este nome.');
    }

    // 4. Validação por E-mail
    if (emailTratado) {
      const emailExisteUsuario = await buscarUsuarioPorEmail(emailTratado);
      if (emailExisteUsuario) {
        throw new Error('Este e-mail pertence a um usuário do sistema.');
      }
    }

    return await this.repository.criar({
      ...cliente,
      nome: nomeTratado,
      documento: docLimpo,
      email: emailTratado || cliente.email,
      ativo: true // Força o cliente a nascer ativo no cadastro
    });
  }

  async atualizarCliente(id: number, cliente: Cliente) {
    const clienteExistente = await this.repository.buscarPorId(id);
    if (!clienteExistente) throw new Error('Cliente não encontrado.');

    const docBanco = clienteExistente.documento || (clienteExistente as any).Documento || '';
    const docEnviado = cliente.documento || '';

    const docNovoLimpo = String(docEnviado).replace(/\D/g, '');
    const docExistenteLimpo = String(docBanco).replace(/\D/g, '');

    if (docNovoLimpo && docNovoLimpo !== docExistenteLimpo) {
      const docExisteCliente = await this.repository.buscarPorDocumento(docNovoLimpo);
      if (docExisteCliente) {
        throw new Error('Este CPF/CNPJ já está cadastrado para outro cliente.');
      }

      const docExisteUsuario = await buscarUsuarioPorDocumento(docNovoLimpo);
      if (docExisteUsuario) {
        throw new Error('Este CPF/CNPJ pertence a um usuário do sistema.');
      }
    }

    return await this.repository.atualizar(id, {
      ...cliente,
      nome: String(cliente.nome || '').trim(),
      documento: docNovoLimpo || docExistenteLimpo,
      ativo: cliente.ativo !== undefined ? cliente.ativo : clienteExistente.ativo
    });
  }

  async deletarCliente(id: number) {
    // Chama a função de inativação (soft delete) criada no repositório
    const inativado = await this.repository.inativar(id);
    if (!inativado) throw new Error('Cliente não encontrado para inativação.');
    return true;
  }
}