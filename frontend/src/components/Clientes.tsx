import React, { useState, useEffect, useCallback } from 'react';

// Opções de Áreas e Cargos Dinâmicos
const OPCOES_AREAS_CARGOS: Record<string, string[]> = {
  'Comercial': ['Vendedor', 'Gerente Comercial', 'Consultor de Vendas', 'SDR / BDR'],
  'Financeiro': ['Analista Financeiro', 'Assistente Financeiro', 'Gerente Financeiro', 'Contador'],
  'Tecnologia / TI': ['Desenvolvedor', 'Suporte Técnico', 'Analista de Sistemas', 'Gerente de TI'],
  'Atendimento / Suporte': ['Analista de Suporte', 'Atendente', 'Gerente de CS'],
  'Recursos Humanos': ['Analista de RH', 'Recrutador', 'Gerente de RH'],
  'Operações / Logística': ['Coordenador de Logística', 'Assistente Operacional', 'Gerente Operacional']
};

interface Cliente {
  Id?: number;
  Nome: string;
  Documento: string;
  Email?: string;
  Telefone?: string;
  Area?: string;
  area?: string;
  Cargo?: string;
  cargo?: string;
  Ativo?: boolean;
  DataCriacao?: string;
}

export const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'nome' | 'documento' | 'email' | 'area' | 'ativo' | 'inativo'>('todos');
  
  // Estados para o filtro em cascata na barra de busca
  const [filtroArea, setFiltroArea] = useState('');
  const [filtroCargo, setFiltroCargo] = useState('');

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Modais
  const [modalAberto, setModalAberto] = useState(false);
  const [modalPerfilAberto, setModalPerfilAberto] = useState(false);
  const [clienteEditandoId, setClienteEditandoId] = useState<number | null>(null);

  // Campos do Form Cliente
  const [nome, setNome] = useState('');
  const [documento, setDocumento] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [area, setArea] = useState('');
  const [cargo, setCargo] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [erroForm, setErroForm] = useState('');

  // Campos Perfil Usuário
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

  const [novaSenha, setNovaSenha] = useState('');
  const [sucessoPerfil, setSucessoPerfil] = useState('');
  const [erroPerfil, setErroPerfil] = useState('');

  // Auxiliares de Formatação
  const getPrimeiroNome = (nomeCompleto: string) => {
    if (!nomeCompleto || nomeCompleto.startsWith('{')) return 'Usuário';
    return nomeCompleto.trim().split(' ')[0];
  };

  const getIniciais = (nomeStr: string) => {
    if (!nomeStr || nomeStr.startsWith('{')) return 'U';
    const partes = nomeStr.trim().split(' ').filter(Boolean);
    if (partes.length >= 2) return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
    return nomeStr.substring(0, 2).toUpperCase();
  };

  const mascararDocumento = (val: string) => {
    const str = (val || '').toString();
    const nums = str.replace(/\D/g, '');
    if (nums.length <= 11) {
      return nums
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return nums
      .slice(0, 14)
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  };

  const mascararTelefone = (val: string) => {
    const str = (val || '').toString();
    const nums = str.replace(/\D/g, '').slice(0, 11);
    if (nums.length <= 2) return nums.length > 0 ? `(${nums}` : '';
    if (nums.length <= 6) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
    if (nums.length <= 10) return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`;
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7, 11)}`;
  };

  const getHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('@CRM:token') || '';
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const carregarClientes = useCallback(async (termoBusca = busca, filtro = tipoFiltro) => {
    try {
      setLoading(true);
      
      let queryUrl = `http://localhost:3001/api/clientes?filtro=${filtro}`;
      
      if (filtro === 'area') {
        queryUrl += `&area=${encodeURIComponent(filtroArea)}&cargo=${encodeURIComponent(filtroCargo)}`;
      } else {
        queryUrl += `&busca=${encodeURIComponent(termoBusca.trim())}`;
      }

      const res = await fetch(queryUrl, {
        headers: getHeaders()
      });
      const data = await res.json();

      if (data && Array.isArray(data.data)) {
        setClientes(data.data);
      } else if (Array.isArray(data)) {
        setClientes(data);
      } else if (data && Array.isArray(data.clientes)) {
        setClientes(data.clientes);
      } else {
        setClientes([]);
      }
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  }, [busca, tipoFiltro, filtroArea, filtroCargo]);

  useEffect(() => {
    carregarClientes('', 'todos');
  }, []);

  const handleFiltroAreaChange = (novaArea: string) => {
    setFiltroArea(novaArea);
    setFiltroCargo(''); 
  };

  const handlePesquisar = (e: React.FormEvent) => {
    e.preventDefault();
    carregarClientes(busca, tipoFiltro);
  };

  const abrirModalNovo = () => {
    setClienteEditandoId(null);
    setNome(''); 
    setDocumento(''); 
    setEmail(''); 
    setTelefone(''); 
    setArea('');
    setCargo('');
    setAtivo(true);
    setErroForm('');
    setModalAberto(true);
  };

  const abrirModalEditar = (c: Cliente) => {
    setClienteEditandoId(c?.Id || null);
    setNome(c?.Nome || ''); 
    setDocumento(c?.Documento ? mascararDocumento(c.Documento) : ''); 
    setEmail(c?.Email || ''); 
    setTelefone(c?.Telefone ? mascararTelefone(c.Telefone) : '');

    const areaSalva = c?.Area || c?.area || '';
    const cargoSalvo = c?.Cargo || c?.cargo || '';

    setArea(areaSalva);
    setCargo(cargoSalvo);
    setAtivo(c?.Ativo ?? true);
    setErroForm('');
    setModalAberto(true);
  };

  const fecharModalCliente = () => {
    setModalAberto(false);
    setErroForm('');
  };

  const fecharModalPerfil = () => {
    setModalPerfilAberto(false);
    setErroPerfil('');
    setSucessoPerfil('');
    setNovaSenha('');
  };

  const handleAreaChange = (novaArea: string) => {
    setArea(novaArea);
    setCargo(''); 
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroForm('');

    if (!nome.trim()) {
      setErroForm('Informe o nome do cliente.');
      return;
    }

    if (!documento.trim()) {
      setErroForm('Informe o CPF ou CNPJ.');
      return;
    }

    setSalvando(true);

    const url = clienteEditandoId
      ? `http://localhost:3001/api/clientes/${clienteEditandoId}`
      : 'http://localhost:3001/api/clientes';
    const method = clienteEditandoId ? 'PUT' : 'POST';

    const docLimpo = (documento || '').toString().replace(/\D/g, '');
    const telLimpo = (telefone || '').toString().replace(/\D/g, '');

    try {
      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify({ 
          nome: nome.trim(), 
          documento: docLimpo, 
          email: (email || '').trim().toLowerCase(), 
          telefone: telLimpo,
          area: area.trim(),
          cargo: cargo.trim(),
          ativo
        }),
      });
      
      const data = await res.json();

      if (!res.ok) {
        setErroForm(data.message || data.mensagem || 'Erro ao salvar cliente.');
        return;
      }

      fecharModalCliente();
      carregarClientes();
    } catch (err) {
      setErroForm('Falha na comunicação com o servidor.');
    } finally {
      setSalvando(false);
    }
  };

  const handleDeletar = async (id?: number) => {
    if (!id) return;
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        const res = await fetch(`http://localhost:3001/api/clientes/${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        });

        if (res.ok) {
          carregarClientes();
        } else {
          alert('Não foi possível excluir o cliente.');
        }
      } catch (err) {
        alert('Erro ao conectar ao servidor.');
      }
    }
  };

  const handleSalvarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroPerfil('');
    setSucessoPerfil('');

    if (!nomeUsuario.trim()) {
      setErroPerfil('Informe o seu nome.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/usuario/perfil', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          nome: nomeUsuario.trim(),
          email: emailUsuario.trim().toLowerCase(),
          ...(novaSenha ? { senha: novaSenha } : {})
        })
      });

      if (!res.ok) {
        const data = await res.json();
        setErroPerfil(data.message || data.mensagem || 'Erro ao atualizar perfil.');
        return;
      }

      const usuarioStorage = JSON.parse(localStorage.getItem('usuario') || '{}');
      if (typeof usuarioStorage === 'object') {
        usuarioStorage.nome = nomeUsuario;
        usuarioStorage.email = emailUsuario;
        localStorage.setItem('usuario', JSON.stringify(usuarioStorage));
      }
      localStorage.setItem('@usuarioLogado', nomeUsuario);

      setSucessoPerfil('Perfil atualizado com sucesso!');
      setTimeout(() => {
        fecharModalPerfil();
      }, 1200);
    } catch (err) {
      localStorage.setItem('@usuarioLogado', nomeUsuario);
      setSucessoPerfil('Perfil salvo localmente!');
      setTimeout(() => fecharModalPerfil(), 1200);
    }
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

        {/* CONTAINER DA TABELA */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">
            
            {/* FORMULÁRIO DE BUSCA COM FILTRO EM CASCATA */}
            <form onSubmit={handlePesquisar} className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-36">
                <select
                  value={tipoFiltro}
                  onChange={(e) => {
                    setTipoFiltro(e.target.value as any);
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

              {/* SE FOR FILTRO POR ÁREA/CARGO, EXIBE OS SELECTS EM CASCATA */}
              {tipoFiltro === 'area' ? (
                <>
                  {/* SELECT ÁREA */}
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

                  {/* SELECT CARGO (DESABILITADO ENQUANTO NÃO HOUVER ÁREA) */}
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
                /* CAMPO DE TEXTO PADRÃO PARA OUTROS FILTROS */
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

            {/* BOTÃO NOVO CLIENTE */}
            <button 
              type="button"
              onClick={abrirModalNovo} 
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-200 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Novo Cliente
            </button>
          </div>

          {/* TABELA DE CLIENTES */}
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
                            onClick={() => abrirModalEditar(c)} 
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDeletar(c?.Id)} 
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

      {/* MODAL CLIENTE */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {clienteEditandoId ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>

            {erroForm && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium">
                {erroForm}
              </div>
            )}

            <form onSubmit={handleSalvar} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Razão Social ou Nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  CPF / CNPJ * {clienteEditandoId && <span className="text-[10px] text-gray-400 font-normal">(Inalterável)</span>}
                </label>
                <input
                  type="text"
                  required
                  disabled={Boolean(clienteEditandoId)}
                  placeholder="000.000.000-00"
                  value={documento}
                  onChange={(e) => setDocumento(mascararDocumento(e.target.value))}
                  className={`w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${
                    clienteEditandoId ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">E-mail</label>
                <input
                  type="email"
                  placeholder="cliente@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="(00) 00000-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(mascararTelefone(e.target.value))}
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* CAMPO ÁREA */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Área</label>
                <select
                  value={area}
                  onChange={(e) => handleAreaChange(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Selecione uma área...</option>
                  {Object.keys(OPCOES_AREAS_CARGOS).map((nomeArea) => (
                    <option key={nomeArea} value={nomeArea}>
                      {nomeArea}
                    </option>
                  ))}
                </select>
              </div>

              {/* CAMPO CARGO */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Cargo</label>
                <select
                  value={cargo}
                  disabled={!area}
                  onChange={(e) => setCargo(e.target.value)}
                  className={`w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${
                    !area ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white'
                  }`}
                >
                  <option value="">
                    {!area ? 'Selecione a área primeiro...' : 'Selecione um cargo...'}
                  </option>
                  {area &&
                    OPCOES_AREAS_CARGOS[area]?.map((nomeCargo) => (
                      <option key={nomeCargo} value={nomeCargo}>
                        {nomeCargo}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Status do Cadastro</label>
                <select
                  value={ativo ? 'true' : 'false'}
                  onChange={(e) => setAtivo(e.target.value === 'true')}
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={fecharModalCliente}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl font-semibold text-gray-600 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-100 cursor-pointer disabled:opacity-50"
                >
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PERFIL */}
      {modalPerfilAberto && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center font-bold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Meu Perfil</h2>
                <p className="text-[11px] text-gray-400">Atualize seus dados de acesso</p>
              </div>
            </div>

            {erroPerfil && (
              <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium">
                {erroPerfil}
              </div>
            )}

            {sucessoPerfil && (
              <div className="mb-3 p-2.5 bg-green-50 border border-green-200 text-green-600 text-xs rounded-xl font-medium">
                {sucessoPerfil}
              </div>
            )}

            <form onSubmit={handleSalvarPerfil} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  required
                  value={nomeUsuario}
                  onChange={(e) => setNomeUsuario(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={emailUsuario}
                  onChange={(e) => setEmailUsuario(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2 border-t border-gray-100">
                <label className="block font-bold text-gray-700 mb-1">
                  Nova Senha <span className="text-gray-400 font-normal">(Opcional)</span>
                </label>
                <input
                  type="password"
                  placeholder="Deixe em branco para não alterar"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={fecharModalPerfil}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl font-semibold text-gray-600 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-md shadow-teal-100 cursor-pointer"
                >
                  Salvar Perfil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};