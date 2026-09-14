import React, { useState, useEffect } from 'react';
import { Cliente } from '../../hooks/useClientes';
import { OPCOES_AREAS_CARGOS } from '../../constants/opcoesAreasCargos';
import { mascararDocumento, mascararTelefone }from '../../utils/formats';
interface ClienteModalFormProps {
  modalAberto: boolean;
  clienteEditandoId: number | null;
  clienteEditando: Cliente | null;
  onFechar: () => void;
  onSucesso: () => void;
  getHeaders: () => Record<string, string>;
}

export const ClienteModalForm: React.FC<ClienteModalFormProps> = ({
  modalAberto,
  clienteEditandoId,
  clienteEditando,
  onFechar,
  onSucesso,
  getHeaders
}) => {
  const [nome, setNome] = useState('');
  const [documento, setDocumento] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [area, setArea] = useState('');
  const [cargo, setCargo] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [erroForm, setErroForm] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (clienteEditando) {
      setNome(clienteEditando.Nome || '');
      setDocumento(clienteEditando.Documento ? mascararDocumento(clienteEditando.Documento) : '');
      setEmail(clienteEditando.Email || '');
      setTelefone(clienteEditando.Telefone ? mascararTelefone(clienteEditando.Telefone) : '');
      setArea(clienteEditando.Area || clienteEditando.area || '');
      setCargo(clienteEditando.Cargo || clienteEditando.cargo || '');
      setAtivo(clienteEditando.Ativo ?? true);
    } else {
      setNome('');
      setDocumento('');
      setEmail('');
      setTelefone('');
      setArea('');
      setCargo('');
      setAtivo(true);
    }
    setErroForm('');
  }, [clienteEditando, modalAberto]);

  if (!modalAberto) return null;

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

      onFechar();
      onSucesso();
    } catch (err) {
      setErroForm('Falha na comunicação com o servidor.');
    } finally {
      setSalvando(false);
    }
  };

  return (
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
              onClick={onFechar}
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
  );
};