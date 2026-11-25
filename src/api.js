async function postComCsrf(url, dados) {
  const respostaCsrf = await fetch("/api/auth/csrf", {
    credentials: "include",
    cache: "no-store",
  });
  const dadosCsrf = await respostaCsrf.json().catch(() => null);
  if (!respostaCsrf.ok) {
    throw new Error(dadosCsrf?.erro || "Não foi possível obter o token de segurança.");
  }

  const { headerName, token } = dadosCsrf ?? {};
  if (!headerName || !token) {
    throw new Error("O servidor retornou um token de segurança inválido.");
  }

  const multipart = dados instanceof FormData;

  return fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      ...(multipart ? {} : { "Content-Type": "application/json" }),
      [headerName]: token,
    },
    body: multipart ? dados : JSON.stringify(dados),
  });
}

export async function reformularReclamacao(textoOriginal) {
  const resposta = await postComCsrf("/api/ia/reformular", { textoOriginal });
  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    if (resposta.status === 403) {
      throw new Error(dados?.erro || "A verificação de segurança recusou a solicitação. Recarregue a página e tente novamente.");
    }
    throw new Error(dados?.erro || "Não foi possível gerar a sugestão. Tente novamente.");
  }

  const textoReformulado = dados?.textoReformulado;
  if (typeof textoReformulado !== "string" || !textoReformulado.trim()) {
    throw new Error("O servidor não retornou uma reformulação utilizável.");
  }

  return textoReformulado;
}

export async function registrarReclamacao(formData) {
  const resposta = await postComCsrf("/api/reclamacao", formData);

  if (resposta.status === 409) {
    throw new Error("Esta reclamação já foi registrada.");
  }
  if (resposta.status === 401 || resposta.status === 403) {
    throw new Error("Seu acesso ao registro foi recusado. Verifique sua sessão e tente novamente.");
  }
  if (resposta.status !== 201) {
    throw new Error("Não foi possível registrar a manifestação. Tente novamente.");
  }

  const confirmacao = await resposta.json().catch(() => null);
  if (typeof confirmacao?.protocolo !== "string" || !/^[1-9][0-9]{8}$/.test(confirmacao.protocolo)) {
    throw new Error("O servidor confirmou o registro, mas não retornou um protocolo válido.");
  }

  return {
    mensagem: confirmacao.mensagem || "Manifestação registrada com sucesso.",
    protocolo: confirmacao.protocolo,
  };
}
