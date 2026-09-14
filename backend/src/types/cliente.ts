export interface Cliente {
  id?: number;
  nome: string;
  documento: string;
  email?: string;
  telefone?: string;
  area?: string;   
  cargo?: string;  
  ativo?: boolean | number;
  dataCriacao?: Date;
}