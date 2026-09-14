export const getPrimeiroNome = (nomeCompleto: string) => {
  if (!nomeCompleto || nomeCompleto.startsWith('{')) return 'Usuário';
  return nomeCompleto.trim().split(' ')[0];
};

export const getIniciais = (nomeStr: string) => {
  if (!nomeStr || nomeStr.startsWith('{')) return 'U';
  const partes = nomeStr.trim().split(' ').filter(Boolean);
  if (partes.length >= 2) return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
  return nomeStr.substring(0, 2).toUpperCase();
};

export const mascararDocumento = (val: string) => {
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

export const mascararTelefone = (val: string) => {
  const str = (val || '').toString();
  const nums = str.replace(/\D/g, '').slice(0, 11);
  if (nums.length <= 2) return nums.length > 0 ? `(${nums}` : '';
  if (nums.length <= 6) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
  if (nums.length <= 10) return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`;
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7, 11)}`;
};