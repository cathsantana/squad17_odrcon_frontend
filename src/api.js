async function postComCsrf(url, dados) {
  const respostaCsrf = await fetch("/api/auth/csrf", {
    credentials: "include",
    cache: "no-store",
  });
  if (!respostaCsrf.ok) {
    const dados = await respostaCsrf.json().catch(() => null);
    throw new Error(dados?.erro || "Não foi possível obter o token de segurança.");
  }

  const { headerName, token } = await respostaCsrf.json();
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
    throw new Error(dados?.erro || "Não foi possível gerar a sugestão. Tente novamente.");
  }

  if (typeof dados?.textoReformulado !== "string" || !dados.textoReformulado.trim()) {
    throw new Error("O servidor não retornou uma reformulação utilizável.");
  }

  return dados.textoReformulado;
}