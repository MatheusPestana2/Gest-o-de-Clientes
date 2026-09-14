import React, { useState } from 'react';

interface ClienteModalPerfilProps {
  modalPerfilAberto: boolean;
  nomeUsuario: string;
  setNomeUsuario: React.Dispatch<React.SetStateAction<string>>;
  emailUsuario: string;
  setEmailUsuario: React.Dispatch<React.SetStateAction<string>>;
  onFechar: () => void;
  getHeaders: () => Record<string, string>;
}

export const ClienteModalPerfil: React.FC<ClienteModalPerfilProps> = ({
  modalPerfilAberto,
  nomeUsuario,
  setNomeUsuario,
  emailUsuario,
  setEmailUsuario,
  onFechar,
  getHeaders
}) => {
  const [novaSenha, setNovaSenha] = useState('');
  const [sucessoPerfil, setSucessoPerfil] = useState('');
  const [erroPerfil, setErroPerfil] = useState('');

  if (!modalPerfilAberto) return null;

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
        onFechar();
      }, 1200);
    } catch (err) {
      localStorage.setItem('@usuarioLogado', nomeUsuario);
      setSucessoPerfil('Perfil salvo localmente!');
      setTimeout(() => onFechar(), 1200);
    }
  };

  return (
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
              onClick={onFechar}
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
  );
};