import { useState } from 'react';
import { useContext } from 'react';

import { Usuario, UsuarioErros } from '@model/usuario';
import { loginService, registerService } from '@service/authService';
import { AuthContext } from '@context/AuthContext';

export function useAuthControl() {
  const { abrirSessao } = useContext(AuthContext);
  const [usuario, setUsuario] = useState<Usuario>({ email: '', senha: '' });
  const [erros, setErros] = useState<UsuarioErros>({});
  const [loading, setLoading] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  function onChange<K extends keyof Usuario>(campo: K, valor: Usuario[K]) {
    setUsuario((prev) => ({ ...prev, [campo]: valor }));
    setErros((e) => ({ ...e, [campo]: undefined }));
    setErroGeral(null);
  }

  async function onLogin() {
    setLoading(true);
    setErroGeral(null);
    const res = await loginService(usuario);
    setLoading(false);
    if (res.ok) abrirSessao(res.token, res.email);
    else {
      if ('erros' in res) {
        setErros(res.erros || {});
        setErroGeral(res.erroGeral || null);
      } else {
        setErros({});
        setErroGeral(null);
      }
    }
  }

  async function onRegister() {
    setLoading(true);
    setErroGeral(null);
    const res = await registerService(usuario);
    setLoading(false);
    if (res.ok) abrirSessao(res.token, res.email);
    else if ('erros' in res) {
      setErros(res.erros || {});
      setErroGeral(res.erroGeral || null);
    } else {
      setErros({});
      setErroGeral(null);
    }
  }

  return { usuario, erros, erroGeral, loading, onChange, onLogin, onRegister };
}
