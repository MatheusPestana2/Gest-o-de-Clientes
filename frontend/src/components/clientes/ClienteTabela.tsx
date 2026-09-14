import React from 'react';
import { Cliente } from '../../hooks/useClientes';
import { getIniciais, mascararDocumento, mascararTelefone } from '../../utils/formats';

interface ClienteTabelaProps {
  clientes: Cliente[];
  loading: boolean;
  onEditar: (cliente: Cliente) => void;
  onDeletar: (id?: number) => void;
}

export const ClienteTabela: React.FC<ClienteTabelaProps> = ({
  clientes,
  loading,
  onEditar,
  onDeletar
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            <th className="py-2 px-4">NOME</th>
            <th className="py-2 px-4">DOCUMENTO</th>
            <th className="py-2 px-4">EMAIL</th>
            <th className="py-2 px-4">TELEFONE</th>
            <th className="py-2 px-4">ÁREA / CARGO</th>
            <th className="py-2 px-4 text-center">STATUS</th>
            <th className="py-2 px-4 text-center">AÇÕES</th>
          </tr>
        </thead>
        <tbody className="text-xs">
          {loading ? (
            <tr>
              <td colSpan={7} className="py-12 text-center text-gray-400">Carregando clientes...</td>
            </tr>
          ) : clientes.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-12 text-center text-gray-400">Nenhum cliente encontrado.</td>
            </tr>
          ) : (
            clientes.map((c, index) => (
              <tr key={c?.Id || index} className="bg-gray-50/50 hover:bg-gray-50 transition-colors rounded-xl">
                <td className="py-3 px-4 rounded-l-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                      {getIniciais(c?.Nome)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{c?.Nome || '-'}</p>
                      <p className="text-[10px] text-gray-400">
                        {c?.DataCriacao 
                          ? `Cliente cadastrado em ${new Date(c.DataCriacao).toLocaleDateString('pt-BR')}`
                          : 'Cliente cadastrado'}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4 text-gray-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h2a2 2 0 012 2v1m-4 0h4" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h1m-1 3h3" />
                      <circle cx="9" cy="9" r="1" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                    <span>{mascararDocumento(c?.Documento || '') || '-'}</span>
                  </div>
                </td>

                <td className="py-3 px-4 text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {c?.Email || '-'}
                  </div>
                </td>

                <td className="py-3 px-4 text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {mascararTelefone(c?.Telefone || '') || '-'}
                  </div>
                </td>

                <td className="py-3 px-4 text-gray-600">
                  <div>
                    <p className="font-semibold text-gray-800">{c?.Area || c?.area || '-'}</p>
                    <p className="text-[10px] text-gray-400">{c?.Cargo || c?.cargo || '-'}</p>
                  </div>
                </td>

                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      c?.Ativo !== false
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'bg-rose-50 text-rose-500 border border-rose-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        c?.Ativo !== false ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    {c?.Ativo !== false ? 'Ativo' : 'Inativo'}
                  </span>
                </td>

                <td className="py-3 px-4 text-center rounded-r-xl">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => onEditar(c)} 
                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => onDeletar(c?.Id)} 
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors cursor-pointer"
                      title="Excluir"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};