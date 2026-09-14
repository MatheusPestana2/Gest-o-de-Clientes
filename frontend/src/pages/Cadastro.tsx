import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CARGOS_POR_AREA: Record<string, string[]> = {
  Comercial: [
    'Executivo de Contas',
    'Consultor Comercial',
    'SDR (Pré-vendas)',
    'Gerente Comercial',
  ],
  Vendas: [
    'Vendedor',
    'Líder de Vendas',
    'Supervisor de Vendas',
    'Assistente de Vendas',
  ],
  Suporte: [
    'Técnico de Suporte N1',
    'Técnico de Suporte N2',
    'Analista de Suporte',
    'Supervisor de Suporte',
  ],
  Financeiro: [
    'Analista Financeiro',
    'Assistente Financeiro',
    'Gerente Financeiro',
    'Analista de Contas',
  ],
};

// Funções de Validação Rigorosas
const validarNomeCompleto = (nome: string): boolean => {
  const regexNome = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
  const partes = nome.trim().split(/\s+/);
  return regexNome.test(nome) && partes.length >= 2;
};

const validarCPFReal = (cpf: string): boolean => {
  const limpo = cpf.replace(/\D/g, '');
  if (limpo.length !== 11 || /^(\d)\1{10}$/.test(limpo)) return false;

  let soma = 0;
  let resto;
  for (let i = 1; i <= 9; i++) soma += parseInt(limpo.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(limpo.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(limpo.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(limpo.substring(10, 11))) return false;

  return true;
};

const validarEmailGoogle = (email: string): boolean => {
  const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!regexEmail.test(email)) return false;

  const partes = email.trim().toLowerCase().split('@');
  if (partes.length !== 2) return false;

  const dominio = partes[1];
  const nomeDominio = dominio.split('.')[0];
  const tld = dominio.split('.').pop();

  if (/^\d+$/.test(nomeDominio)) return false;
  if (!tld || !/^[a-zA-Z]{2,}$/.test(tld)) return false;

  return true;
};

const validarSenhaForte = (senha: string): boolean => {
  // Mínimo 8 caracteres: pelo menos 1 número, 1 letra MAIÚSCULA e 1 caractere especial
  const regexSenha = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&@#_\-]).{8,}$/;
  return regexSenha.test(senha);
};

export const Cadastro: React.FC = () => {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [area, setArea] = useState('');
  const [cargo, setCargo] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);

  const [campoComErro, setCampoComErro] = useState<string | null>(null);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      setCpf(value);
    }
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setArea(e.target.value);
    setCargo('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCampoComErro(null);

    if (!validarNomeCompleto(nome)) {
      setErro('Digite um nome e sobrenome válidos (apenas letras, sem números ou símbolos).');
      setCampoComErro('nome');
      return;
    }

    if (!validarCPFReal(cpf)) {
      setErro('Informe um CPF válido com 11 dígitos.');
      setCampoComErro('cpf');
      return;
    }

    if (!validarEmailGoogle(email)) {
      setErro('Informe um e-mail válido (exemplo: usuario@empresa.com). Domínios genéricos ou numéricos não são aceitos.');
      setCampoComErro('email');
      return;
    }

    // Validação de Força da Senha (Maiúscula + Caractere Especial + Número + Mín 8)
    if (!validarSenhaForte(senha)) {
      setErro('A senha deve ter no mínimo 8 caracteres, contendo números, pelo menos uma letra MAIÚSCULA e um caractere especial (ex: @, #, !).');
      setCampoComErro('senha');
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem!');
      setCampoComErro('confirmarSenha');
      return;
    }

    if (!aceitouTermos) {
      setErro('Você precisa aceitar os Termos de Uso.');
      return;
    }

    setLoading(true);

    try {
      const cpfLimpo = cpf.replace(/\D/g, '');

      const response = await fetch('http://localhost:3001/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nome.trim(),
          cpf: cpfLimpo,
          email: email.trim().toLowerCase(),
          area,
          cargo,
          senha,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        throw new Error(data.mensagem || 'Erro ao cadastrar colaborador.');
      }

      alert('Colaborador cadastrado com sucesso!');
      navigate('/');
    } catch (err: any) {
      setErro(err.message || 'Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const getBorderClass = (campo: string) => {
    return campoComErro === campo
      ? 'border-red-500 focus:ring-red-500'
      : 'border-gray-900 focus:ring-gray-900';
  };

  const getIconClass = (campo: string) => {
    return campoComErro === campo ? 'text-red-500' : 'text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 w-full max-w-lg">
        
        {/* Ícone do Topo */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 border-2 border-gray-900 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>

        {/* Cabeçalho */}
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-1">Cadastrar colaborador</h2>
        <p className="text-sm text-center text-gray-500 mb-6">Preencha os dados do colaborador para realizar o cadastro.</p>

        {/* Mensagem de Erro */}
        <div className={`transition-all duration-200 overflow-hidden ${erro ? 'max-h-20 mb-4 opacity-100' : 'max-h-0 mb-0 opacity-0'}`}>
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
            {erro}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome Completo e CPF */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1">Nome completo</label>
              <div className="relative">
                <span className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none ${getIconClass('nome')}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Digite o nome completo"
                  className={`w-full pl-9 pr-3 py-2 text-sm border-2 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 ${getBorderClass('nome')}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1">CPF</label>
              <div className="relative">
                <span className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none ${getIconClass('cpf')}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h2a2 2 0 012 2v1m-4 0h4" />
                  </svg>
                </span>
                <input
                  type="text"
                  required
                  value={cpf}
                  onChange={handleCpfChange}
                  placeholder="000.000.000-00"
                  className={`w-full pl-9 pr-3 py-2 text-sm border-2 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 ${getBorderClass('cpf')}`}
                />
              </div>
            </div>
          </div>

          {/* E-mail corporativo */}
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-1">E-mail corporativo</label>
            <div className="relative">
              <span className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none ${getIconClass('email')}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite o e-mail corporativo"
                className={`w-full pl-9 pr-3 py-2 text-sm border-2 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 ${getBorderClass('email')}`}
              />
            </div>
          </div>

          {/* Área / Setor e Cargo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1">Área / Setor</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-700 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </span>
                <select
                  required
                  value={area}
                  onChange={handleAreaChange}
                  className="w-full pl-9 pr-8 py-2 text-sm border-2 border-gray-900 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 appearance-none cursor-pointer"
                >
                  <option value="">Selecione a área</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Vendas">Vendas</option>
                  <option value="Suporte">Suporte Técnico</option>
                  <option value="Financeiro">Financeiro</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1">Cargo</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-700 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <select
                  required
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  disabled={!area}
                  className="w-full pl-9 pr-8 py-2 text-sm border-2 border-gray-900 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-gray-900 appearance-none cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!area ? 'Selecione a área primeiro' : 'Selecione o cargo'}
                  </option>
                  {area && CARGOS_POR_AREA[area]?.map((c, idx) => (
                    <option key={idx} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Senha */}
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-1">Senha</label>
            <div className="relative">
              <span className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none ${getIconClass('senha')}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type={mostrarSenha ? "text" : "password"}
                required
                autoComplete="new-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mín. 8 chars (com maiúscula e especial)"
                className={`w-full pl-9 pr-10 py-2 text-sm border-2 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 ${getBorderClass('senha')}`}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-700 hover:text-black cursor-pointer"
              >
                {mostrarSenha ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a8.959 8.959 0 013.122-.387c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirmar senha */}
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-1">Confirmar senha</label>
            <div className="relative">
              <span className={`absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none ${getIconClass('confirmarSenha')}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type={mostrarConfirmarSenha ? "text" : "password"}
                required
                autoComplete="new-password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Confirme sua senha"
                className={`w-full pl-9 pr-10 py-2 text-sm border-2 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 ${getBorderClass('confirmarSenha')}`}
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-700 hover:text-black cursor-pointer"
              >
                {mostrarConfirmarSenha ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a8.959 8.959 0 013.122-.387c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Termos de Uso */}
          <div className="flex items-center gap-2 text-xs text-gray-600 pt-1">
            <input
              type="checkbox"
              id="termos"
              checked={aceitouTermos}
              onChange={(e) => setAceitouTermos(e.target.checked)}
              className="w-4 h-4 rounded border-2 border-gray-900 accent-gray-900 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="termos" className="cursor-pointer text-gray-900 font-medium">
              Li e aceito os <a href="#" className="font-bold text-gray-900 hover:underline">Termos de Uso</a> e a <a href="#" className="font-bold text-gray-900 hover:underline">Política de Privacidade</a>
            </label>
          </div>

          {/* Botão Criar Cadastro */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-lg transition-colors mt-2 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cadastrando...
              </>
            ) : (
              'Criar cadastro'
            )}
          </button>

          {/* Divisor */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="border-t border-gray-200 w-full"></div>
            <span className="bg-white px-3 text-xs text-gray-400 absolute">ou</span>
          </div>

          {/* Voltar ao Login */}
          <div className="text-center text-xs text-gray-600">
            Já possui uma conta?{' '}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="font-bold text-gray-900 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              Fazer login <span className="text-sm">&rarr;</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Cadastro;