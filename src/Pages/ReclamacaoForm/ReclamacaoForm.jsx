import { useState } from 'react';
import './ReclamacaoForm.css';

const opcoesFicticias = Array.from({ length: 20 }, (_, i) => i + 1);

function ReclamacaoForm() {
    const [isAnonimo, setIsAnonimo] = useState('');
    const [reclamacao, setReclamacao] = useState('');
    const [querSolucao, setQuerSolucao] = useState('');
    const [solucao, setSolucao] = useState('');
    const [querAcordo, setQuerAcordo] = useState('');
    const [arquivo, setArquivo] = useState(null);
    const [empresaSelecionada, setEmpresaSelecionada] = useState('');
    const [unidadeSelecionada, setUnidadeSelecionada] = useState('');
    const [enviando, setEnviando] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (enviando) return;

        const anonimo = isAnonimo === 'true';
        const temSolucao = querSolucao === 'true';
        const formData = new FormData();

        formData.append('isAnonimo', String(anonimo));
        formData.append('reclamacao', reclamacao);
        formData.append('hasSolucao', String(temSolucao));
        formData.append('solucao', temSolucao ? solucao : '');
        formData.append('hasAcordo', String(querAcordo === 'true'));

        if (anonimo) {
            formData.append('idEmpresa', empresaSelecionada);

            if (unidadeSelecionada) {
                formData.append('idUnidade', unidadeSelecionada);
            }
        }

        if (arquivo) {
            formData.append('arquivo', arquivo);
        }

        setEnviando(true);

        try {
            const respostaCsrf = await fetch('/api/auth/csrf', {
                credentials: 'include',
                cache: 'no-store',
            });

            if (!respostaCsrf.ok) {
                throw new Error(
                    `Não foi possível iniciar o envio (${respostaCsrf.status}).`
                );
            }

            const { headerName, token } = await respostaCsrf.json();

            if (!headerName || !token) {
                throw new Error('O backend não retornou um token de segurança válido.');
            }

            const resposta = await fetch('/api/reclamacao', {
                method: 'POST',
                credentials: 'include',
                headers: { [headerName]: token },
                body: formData,
            });

            const mensagem = (await resposta.text()).trim();

            if (!resposta.ok) {
                const textoDoBackend = resposta.headers
                    .get('content-type')
                    ?.startsWith('text/plain');

                const detalhe = textoDoBackend && mensagem ? ` ${mensagem}` : '';
                throw new Error(`Erro ao enviar (${resposta.status}).${detalhe}`);
            }

            alert(mensagem || 'Reclamação enviada com sucesso!');
        } catch (erro) {
            alert(erro.message || 'Não foi possível conectar ao servidor.');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <span>Anônimo?</span><br />
            <label>
                <input
                    type="radio"
                    name="is_anonimo"
                    value="true"
                    checked={isAnonimo === 'true'}
                    onChange={(event) => setIsAnonimo(event.target.value)}
                    required
                /> Sim
            </label>
            <label>
                <input
                    type="radio"
                    name="is_anonimo"
                    value="false"
                    checked={isAnonimo === 'false'}
                    onChange={(event) => setIsAnonimo(event.target.value)}
                    required
                /> Não
            </label>
            <br />

            {isAnonimo === 'true' && (
                <>
                    <label htmlFor="reclamacao-empresa">Empresa</label><br />
                    <select
                        id="reclamacao-empresa"
                        value={empresaSelecionada}
                        onChange={(event) => {
                            setEmpresaSelecionada(event.target.value);
                            setUnidadeSelecionada('');
                        }}
                        required
                    >
                        <option value="">Selecione a empresa...</option>
                        {opcoesFicticias.map((numero) => (
                            <option key={numero} value={numero}>
                                Empresa {numero}
                            </option>
                        ))}
                    </select><br />

                    <label htmlFor="reclamacao-unidade">Unidade (opcional)</label><br />
                    <select
                        id="reclamacao-unidade"
                        value={unidadeSelecionada}
                        onChange={(event) => setUnidadeSelecionada(event.target.value)}
                    >
                        <option value="">Nenhuma unidade</option>
                        {opcoesFicticias.map((numero) => (
                            <option key={numero} value={numero}>
                                Unidade {numero}
                            </option>
                        ))}
                    </select><br />
                </>
            )}

            <label htmlFor="reclamacao-descricao">Reclamação</label><br />
            <textarea
                id="reclamacao-descricao"
                value={reclamacao}
                onChange={(event) => setReclamacao(event.target.value)}
                required
            /><br />

            <label htmlFor="reclamacao-arquivo">Suba um arquivo</label><br />
            <input
                id="reclamacao-arquivo"
                type="file"
                onChange={(event) => setArquivo(event.target.files[0] ?? null)}
            /><br />

            <span>Deseja propor solução?</span><br />
            <label>
                <input
                    type="radio"
                    name="quer_solucao"
                    value="true"
                    checked={querSolucao === 'true'}
                    onChange={(event) => setQuerSolucao(event.target.value)}
                    required
                /> Sim
            </label>
            <label>
                <input
                    type="radio"
                    name="quer_solucao"
                    value="false"
                    checked={querSolucao === 'false'}
                    onChange={(event) => setQuerSolucao(event.target.value)}
                    required
                /> Não
            </label>
            <br />

            {querSolucao === 'true' && (
                <>
                    <label htmlFor="reclamacao-solucao">Solução proposta</label><br />
                    <textarea
                        id="reclamacao-solucao"
                        placeholder="Descreva a solução..."
                        value={solucao}
                        onChange={(event) => setSolucao(event.target.value)}
                        required
                    /><br />
                </>
            )}

            <span>Deseja formalizar o acordo?</span><br />
            <label>
                <input
                    type="radio"
                    name="quer_acordo"
                    value="true"
                    checked={querAcordo === 'true'}
                    onChange={(event) => setQuerAcordo(event.target.value)}
                    required
                /> Sim
            </label>
            <label>
                <input
                    type="radio"
                    name="quer_acordo"
                    value="false"
                    checked={querAcordo === 'false'}
                    onChange={(event) => setQuerAcordo(event.target.value)}
                    required
                /> Não
            </label>
            <br />

            <button type="submit" disabled={enviando}>
                {enviando ? 'Enviando...' : 'Enviar formulário'}
            </button>
        </form>
    );
}

export default ReclamacaoForm;