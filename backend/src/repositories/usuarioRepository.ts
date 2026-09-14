import { poolPromise } from '../config/db';

export async function buscarUsuarioPorEmail(email: string) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Email', email)
      .query('SELECT * FROM Usuarios WHERE Email = @Email');

    return result.recordset[0] || null;
  } catch (error) {
    console.error('Erro ao buscar usuário por e-mail:', error);
    return null;
  }
}

export async function buscarUsuarioPorDocumento(documento: string) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Documento', documento)
      .query('SELECT * FROM Usuarios WHERE Documento = @Documento');

    return result.recordset[0] || null;
  } catch (error) {
    // Se a coluna não existir no banco de dados, retorna null sem estourar erro 500 no Express
    return null;
  }
}