import { useState, useCallback, useEffect } from 'react';

export interface Cliente {
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

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'nome' | 'documento' | 'email' | 'area' | 'ativo' | 'inativo'>('todos');
  const [filtroArea, setFiltroArea] = useState('');
  const [filtroCargo, setFiltroCargo] = useState('');
  const [loading, setLoading] = useState(true);

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

      const res = await fetch(queryUrl, { headers: getHeaders() });
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

  return {
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
  };
};