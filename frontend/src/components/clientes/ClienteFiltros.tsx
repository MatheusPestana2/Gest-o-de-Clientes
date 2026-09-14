import React from 'react';
import { OPCOES_AREAS_CARGOS } from '../../constants/opcoesAreasCargos';

interface ClienteFiltrosProps {
  tipoFiltro: 'todos' | 'nome' | 'documento' | 'email' | 'area' | 'ativo' | 'inativo';
  setTipoFiltro: (tipo: any) => void;
  filtroArea: string;
  setFiltroArea: (area: string) => void;
  filtroCargo: string;
  setFiltroCargo: (cargo: string) => void;
  busca: string;
  setBusca: (busca: string) => void;
  onPesquisar: (e: React.FormEvent) => void;
  onNovoCliente: () => void;
}

export const ClienteFiltros: React.FC<ClienteFiltrosProps> = ({
  tipoFiltro,
  setTipoFiltro,
  filtroArea,
  setFiltroArea,
  filtroCargo,
  setFiltroCargo,
  busca,
  setBusca,
  onPesquisar,
  onNovoCliente,
}) => {
  const handleFiltroAreaChange = (novaArea: string) => {
    setFiltroArea(novaArea);
    setFiltroCargo('');
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">
      <form onSubmit={onPesquisar} className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
        <div className="relative w-full sm:w-36">
          <select
            value={tipoFiltro}
            onChange={(e) => {
              setTipoFiltro(e.target.value);
              setFiltroArea('');
              setFiltroCargo('');
            }}
            className="w-full pl-3 pr-8 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
          >
            <option value="todos">Todos</option>
            <option value="nome">Nome</option>
            <option value="documento">CPF / CNPJ</option>
            <option value="email">E-mail</option>
            <option value="area">Área / Cargo</option>
            <option value="ativo">Somente Ativos</option>
            <option value="inativo">Somente Inativos</option>
          </select>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>

        {tipoFiltro === 'area' ? (
          <>
            <select
              value={filtroArea}
              onChange={(e) => handleFiltroAreaChange(e.target.value)}
              className="w-full sm:w-44 p-2 border border-gray-200 rounded-xl bg-white text-xs outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">Selecione a Área...</option>
              {Object.keys(OPCOES_AREAS_CARGOS).map((nomeArea) => (
                <option key={nomeArea} value={nomeArea}>
                  {nomeArea}
                </option>
              ))}
            </select>

            <select
              value={filtroCargo}
              disabled={!filtroArea}
              onChange={(e) => setFiltroCargo(e.target.value)}
              className={`w-full sm:w-44 p-2 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 ${
                !filtroArea ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white cursor-pointer'
              }`}
            >
              <option value="">
                {!filtroArea ? 'Escolha a área primeiro...' : 'Todos os cargos'}
              </option>
              {filtroArea &&
                OPCOES_AREAS_CARGOS[filtroArea]?.map((nomeCargo) => (
                  <option key={nomeCargo} value={nomeCargo}>
                    {nomeCargo}
                  </option>
                ))}
            </select>
          </>
        ) : (
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder={
                tipoFiltro === 'nome' ? 'Digite o nome...' :
                tipoFiltro === 'documento' ? 'Digite o CPF/CNPJ...' :
                tipoFiltro === 'email' ? 'Digite o e-mail...' : 'Pesquisar clientes...'
              }
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-200 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Pesquisar
        </button>
      </form>

      <button
        type="button"
        onClick={onNovoCliente}
        className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-200 transition-all cursor-pointer flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Novo Cliente
      </button>
    </div>
  );
};