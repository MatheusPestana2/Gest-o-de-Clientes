import React, { useState } from 'react';
import { useClientes, Cliente } from '../hooks/useClientes';
import { ClienteFiltros } from './clientes/ClienteFiltros';
import { ClienteTabela } from './clientes/ClienteTabela';
import { ClienteModalForm } from './clientes/ClienteModalForm';
import { ClienteModalPerfil } from './clientes/ClienteModalPerfil';
import { getPrimeiroNome, getIniciais } from '../utils/formats';

export const Clientes: React.FC = () => {
  const {
    clientes,
    loading,
    busca,
    setBusca,
    tipoFiltro,
    setTipoFiltro,
    filtroArea,
    setFiltroArea,
    filtroCargo,
    setFiltroCargo,
    carregarClientes,
    handleDeletar,
    getHeaders
  } = useClientes();

  // Estados dos Modais
  const [modalAberto, setModalAberto] = useState(false);
  const [modalPerfilAberto, setModalPerfilAberto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);

  // Perfil Usuário
  const [nomeUsuario, setNomeUsuario] = useState(() => {
    const dadosSalvos = 
      localStorage.getItem('usuario') || 
      localStorage.getItem('@CRM:usuario') || 
      localStorage.getItem('user') ||
      localStorage.getItem('@usuarioLogado');

    if (!dadosSalvos) return '';
    try {
      const parsed = JSON.parse(dadosSalvos);
      return parsed?.nome || parsed?.Nome || (typeof parsed === 'string' ? parsed : '');
    } catch {
      return dadosSalvos.startsWith('{') ? '' : dadosSalvos;
    }
  });

  const [emailUsuario, setEmailUsuario] = useState(() => {
    const dadosSalvos = 
      localStorage.getItem('usuario') || 
      localStorage.getItem('@CRM:usuario') || 
      localStorage.getItem('user');

    if (!dadosSalvos) return '';
    try {
      const parsed = JSON.parse(dadosSalvos);
      return parsed?.email || parsed?.Email || '';
    } catch {
      return '';
    }
  });

  const abrirModalNovo = () => {
    setClienteEditando(null);
    setModalAberto(true);
  };

  const abrirModalEditar = (c: Cliente) => {
    setClienteEditando(c);
    setModalAberto(true);
  };

  const handlePesquisar = (e: React.FormEvent) => {
    e.preventDefault();
    carregarClientes(busca, tipoFiltro);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-gray-800 flex flex-col justify-between p-6">
      <div>
        {/* CABEÇALHO */}
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
              <p className="text-xs text-gray-400">Gerencie a sua base de clientes cadastrados</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white pl-2 pr-3 py-1.5 rounded-full shadow-sm border border-gray-100">
              <div className="w-7 h-7 rounded-full bg-teal-500 text-white font-bold flex items-center justify-center text-xs shrink-0">
                {getIniciais(nomeUsuario)}
              </div>
              <span className="text-xs font-bold text-gray-800 capitalize">
                {getPrimeiroNome(nomeUsuario)}
              </span>
              <button 
                onClick={() => setModalPerfilAberto(true)}
                title="Editar meu perfil"
                className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700 transition-colors cursor-pointer ml-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>

            <button 
              onClick={handleLogout}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair
            </button>
          </div>
        </header>

        {/* CONTAINER PRINCIPAL DA TABELA */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <ClienteFiltros
            tipoFiltro={tipoFiltro}
            setTipoFiltro={setTipoFiltro}
            filtroArea={filtroArea}
            setFiltroArea={setFiltroArea}
            filtroCargo={filtroCargo}
            setFiltroCargo={setFiltroCargo}
            busca={busca}
            setBusca={setBusca}
            onPesquisar={handlePesquisar}
            onNovoCliente={abrirModalNovo}
          />

          <ClienteTabela
            clientes={clientes}
            loading={loading}
            onEditar={abrirModalEditar}
            onDeletar={handleDeletar}
          />

          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400">
            <span>Total de registros: {clientes.length}</span>
          </div>
        </div>
      </div>

      <footer className="flex justify-between items-center pt-6 text-[11px] text-gray-400">
        <div className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Sistema de Clientes</span>
        </div>
        <div>
          Desenvolvido com carinho <span className="text-red-500">&hearts;</span> v1.0.0
        </div>
      </footer>

      {/* MODAL FORM CLIENTE */}
      <ClienteModalForm
        modalAberto={modalAberto}
        clienteEditandoId={clienteEditando?.Id || null}
        clienteEditando={clienteEditando}
        onFechar={() => setModalAberto(false)}
        onSucesso={() => carregarClientes()}
        getHeaders={getHeaders}
      />

      {/* MODAL PERFIL USUÁRIO */}
      <ClienteModalPerfil
        modalPerfilAberto={modalPerfilAberto}
        nomeUsuario={nomeUsuario}
        setNomeUsuario={setNomeUsuario}
        emailUsuario={emailUsuario}
        setEmailUsuario={setEmailUsuario}
        onFechar={() => setModalPerfilAberto(false)}
        getHeaders={getHeaders}
      />
    </div>
  );
};