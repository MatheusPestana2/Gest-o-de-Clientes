import { poolPromise } from '../config/db';
import { Cliente } from '../types/cliente';

export class ClienteRepository {
  async listar(
    busca?: string,
    page = 1,
    limit = 10,
    filtro?: string,
    area?: string,
    cargo?: string
  ) {
    const pool = await poolPromise;
    const offset = (page - 1) * limit;
    
    const request = pool.request();
    
    // Inicia a query flexível sem travar o Ativo fixo em 1
    let query = 'SELECT * FROM Clientes WHERE 1=1';

    // 1. Tratamento Dinâmico de Status (Ativo / Inativo / Todos)
    if (filtro === 'ativo') {
      query += ' AND Ativo = 1';
    } else if (filtro === 'inativo') {
      query += ' AND Ativo = 0';
    } else if (filtro !== 'todos' && filtro !== 'area' && !busca) {
      // Padrão de segurança: se nenhuma opção de status foi selecionada, exibe apenas os ativos
      query += ' AND Ativo = 1';
    }

    // 2. Filtro Selecionado por Área / Cargo
    if (filtro === 'area') {
      query += ' AND Ativo = 1';
      if (area) {
        request.input('AreaFilter', area);
        query += ` AND Area = @AreaFilter`;
      }
      if (cargo) {
        request.input('CargoFilter', cargo);
        query += ` AND Cargo = @CargoFilter`;
      }
    } 
    // 3. Busca Textual por Nome, Documento ou E-mail
    else if (busca) {
      request.input('Busca', `%${busca}%`);

      if (filtro === 'nome') {
        query += ` AND Nome LIKE @Busca`;
      } else if (filtro === 'documento') {
        query += ` AND Documento LIKE @Busca`;
      } else if (filtro === 'email') {
        query += ` AND Email LIKE @Busca`;
      } else {
        query += ` AND (Nome LIKE @Busca OR Documento LIKE @Busca OR Email LIKE @Busca)`;
      }
    }

    // Paginação
    request.input('Offset', offset);
    request.input('Limit', limit);
    query += ` ORDER BY Id DESC OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY;`;

    const result = await request.query(query);
    return result.recordset;
  }

  async buscarPorId(id: number) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Id', id)
      .query('SELECT * FROM Clientes WHERE Id = @Id');

    return result.recordset[0] || null;
  }

  async buscarPorDocumento(documento: string) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Documento', documento)
      .query(`
        SELECT * FROM Clientes 
        WHERE REPLACE(REPLACE(REPLACE(Documento, '.', ''), '-', ''), '/', '') = @Documento
      `);

    return result.recordset[0] || null;
  }

  async buscarPorNome(nome: string) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Nome', nome)
      .query('SELECT * FROM Clientes WHERE Nome = @Nome');

    return result.recordset[0] || null;
  }

  async criar(cliente: Cliente) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Nome', cliente.nome)
      .input('Documento', cliente.documento)
      .input('Email', cliente.email || null)
      .input('Telefone', cliente.telefone || null)
      .input('Area', cliente.area || null)
      .input('Cargo', cliente.cargo || null)
      .input('Ativo', 1)
      .query(`
        INSERT INTO Clientes (Nome, Documento, Email, Telefone, Area, Cargo, Ativo, DataCriacao)
        OUTPUT INSERTED.*
        VALUES (@Nome, @Documento, @Email, @Telefone, @Area, @Cargo, @Ativo, GETDATE());
      `);

    return result.recordset[0];
  }

  async atualizar(id: number, cliente: Cliente) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Id', id)
      .input('Nome', cliente.nome)
      .input('Documento', cliente.documento)
      .input('Email', cliente.email || null)
      .input('Telefone', cliente.telefone || null)
      .input('Area', cliente.area || null)
      .input('Cargo', cliente.cargo || null)
      .input('Ativo', cliente.ativo !== undefined ? (cliente.ativo ? 1 : 0) : 1)
      .query(`
        UPDATE Clientes
        SET Nome = @Nome,
            Documento = @Documento,
            Email = @Email,
            Telefone = @Telefone,
            Area = @Area,
            Cargo = @Cargo,
            Ativo = @Ativo
        OUTPUT INSERTED.*
        WHERE Id = @Id;
      `);

    return result.recordset[0] || null;
  }

  async inativar(id: number) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Id', id)
      .query('UPDATE Clientes SET Ativo = 0 WHERE Id = @Id');

    return result.rowsAffected[0] > 0;
  }
}