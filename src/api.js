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

  return fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      [headerName]: token,
    },
    body: JSON.stringify(dados),
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
