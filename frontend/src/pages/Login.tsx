import React, { useState, useEffect } from 'react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrarDeMim, setLembrarDeMim] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  // Busca qualquer e-mail salvo no localStorage ao abrir a tela
  useEffect(() => {
    const emailSalvo = 
      localStorage.getItem('usuario_lembrado_email') || 
      localStorage.getItem('lembrar_email');

    if (emailSalvo) {
      setEmail(emailSalvo);
      setLembrarDeMim(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro('');

    if (!email.trim() || !senha.trim()) {
      setErro('Preencha os campos de e-mail e senha.');
      return;
    }

    setLoading(true);

    try {
      console.log('Enviando requisição de login para:', email);

      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          senha: senha,
        }),
      });

      const data = await response.json();
      console.log('Resposta do backend:', data);

      if (!response.ok || !data.sucesso) {
        throw new Error(data.mensagem || `Erro no login (Status ${response.status})`);
      }

      // TRATA O LEMBRAR DE MIM (Gravando em ambos os nomes de chave)
      const emailFinal = email.trim().toLowerCase();
      if (lembrarDeMim) {
        localStorage.setItem('usuario_lembrado_email', emailFinal);
        localStorage.setItem('lembrar_email', emailFinal);
      } else {
        localStorage.removeItem('usuario_lembrado_email');
        localStorage.removeItem('lembrar_email');
      }

      // Salva o token e dados do usuário
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('@CRM:token', data.token);
      }
      if (data.usuario) {
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        localStorage.setItem('@usuarioLogado', JSON.stringify(data.usuario));
      }

      console.log('Redirecionando para a tela de clientes...');
      
      // Redireciona
      window.location.href = '/clientes';

    } catch (err: any) {
      console.error('Erro detalhado no login:', err);
      const mensagemErro = err.message || 'Erro inesperado ao conectar com o servidor.';
      setErro(mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 w-full max-w-md">
        
        {/* Ícone */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 border-2 border-gray-900 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-900 mb-1">Gestão Comercial</h2>
        <p className="text-sm text-center text-gray-500 mb-6">Acesse sua conta para continuar</p>

        {/* Mensagem de Erro Visível */}
        {erro && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center font-medium">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* E-mail */}
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-1">E-mail corporativo</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-700 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail"
                className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-900 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-1">Senha</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-700 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type={mostrarSenha ? 'text' : 'password'}
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full pl-9 pr-10 py-2 text-sm border-2 border-gray-900 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900"
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

          {/* Checkbox Lembrar de mim */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="lembrarDeMim"
              checked={lembrarDeMim}
              onChange={(e) => setLembrarDeMim(e.target.checked)}
              className="w-4 h-4 rounded border-2 border-gray-900 accent-gray-900 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="lembrarDeMim" className="text-xs font-semibold text-gray-900 cursor-pointer">
              Lembrar de mim
            </label>
          </div>

          {/* Botão Entrar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>

          {/* Divisor */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="border-t border-gray-200 w-full"></div>
            <span className="bg-white px-3 text-xs text-gray-400 absolute">ou</span>
          </div>

          {/* Link para Cadastro */}
          <div className="text-center text-xs text-gray-600">
            Ainda não tem conta?{' '}
            <button
              type="button"
              onClick={() => { window.location.href = '/cadastro'; }}
              className="font-bold text-gray-900 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              Cadastrar colaborador <span className="text-sm">&rarr;</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;