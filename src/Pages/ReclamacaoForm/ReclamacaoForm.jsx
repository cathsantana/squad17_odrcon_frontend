import { useState } from 'react'; // [MODIFICADO] Removido o useEffect, pois os dados agora são fictícios
import { reformularReclamacao } from '../../api.js';
import './ReclamacaoForm.css';

function ReclamacaoForm() {
    const [isAnonimo, setIsAnonimo] = useState('');
    const [reclamacao, setReclamacao] = useState('');
    const [querSolucao, setQuerSolucao] = useState('');
    const [solucao, setSolucao] = useState('');
    const [querAcordo, setQuerAcordo] = useState('');
    const [arquivo, setArquivo] = useState(null);
    const opcoesFicticias = Array.from({ length: 20 }, (_, i) => i + 1);
    const [empresaSelecionada, setEmpresaSelecionada] = useState('');
    const [unidadeSelecionada, setUnidadeSelecionada] = useState('');
    const [resultadoIA, setResultadoIA] = useState(null);
    const [gerandoSugestao, setGerandoSugestao] = useState(false);
    const [usarSugestao, setUsarSugestao] = useState(false);
    const revisao = resultadoIA?.original === reclamacao ? resultadoIA : null;
    const sugestao = revisao?.textoReformulado;

    const gerarSugestao = async () => {
        const original = reclamacao;
        setResultadoIA(null);
        setUsarSugestao(false);
        setGerandoSugestao(true);

        try {
            const textoReformulado = await reformularReclamacao(original);
            setResultadoIA({ original, textoReformulado });
        } catch (error) {
            setResultadoIA({ original, erro: error.message });
        } finally {
            setGerandoSugestao(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        
        formData.append('isAnonimo', isAnonimo === 'true');
        formData.append('reclamacao', usarSugestao && sugestao ? sugestao : reclamacao);
        formData.append('hasSolucao', querSolucao === 'true');
        formData.append('solucao', querSolucao === 'true' ? solucao : '');
        formData.append('hasAcordo', querAcordo === 'true');

        if (isAnonimo === 'true') {
            formData.append('idEmpresa', empresaSelecionada);
            if (unidadeSelecionada) {
                formData.append('idUnidade', unidadeSelecionada);
            }
        }

        if (arquivo) {
            formData.append('arquivo', arquivo);
        }

        try {
            const response = await fetch('/api/reclamacao', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                alert('Reclamação enviada com sucesso!');
            } else {
                alert('Erro ao enviar.');
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>Anônimo?</label><br />
            <input 
                type="radio" 
                name="is_anonimo" 
                value="true" 
                onChange={(e) => setIsAnonimo(e.target.value)} 
                required 
            /> Sim
            <input 
                type="radio" 
                name="is_anonimo" 
                value="false" 
                onChange={(e) => setIsAnonimo(e.target.value)} 
                required 
            /> Não
            <br />

            {isAnonimo === 'true' && (
                <>
                    <label>Empresa</label><br />
                    <select 
                        value={empresaSelecionada} 
                        onChange={(e) => setEmpresaSelecionada(e.target.value)} 
                        required
                    >
                        <option value="">Selecione a empresa...</option>
                        {opcoesFicticias.map((num) => (
                            <option key={num} value={num}>Empresa {num}</option>
                        ))}
                    </select><br />

                    <label>Unidade (Opcional)</label><br />
                    <select 
                        value={unidadeSelecionada} 
                        onChange={(e) => setUnidadeSelecionada(e.target.value)}
                    >
                        <option value="">Nenhuma unidade</option>
                        {opcoesFicticias.map((num) => (
                            <option key={num} value={num}>Unidade {num}</option>
                        ))}
                    </select><br />
                </>
            )}

            <label htmlFor="texto-reclamacao">Reclamação</label><br />
            <textarea 
                id="texto-reclamacao"
                value={reclamacao} 
                onChange={(e) => {
                    setReclamacao(e.target.value);
                    setResultadoIA(null);
                    setUsarSugestao(false);
                }}
                required 
            /><br />

            <fieldset>
                <legend>Reformulação por IA (opcional)</legend>
                <p>Ao pedir uma sugestão, o relato é processado pelo Gemini. Evite incluir dados pessoais desnecessários.</p>
                <button
                    type="button"
                    onClick={gerarSugestao}
                    disabled={gerandoSugestao || !reclamacao.trim() || reclamacao.length > 5000}
                >
                    {gerandoSugestao ? 'Reformulando…' : 'Sugerir reformulação'}
                </button>
                {reclamacao.length > 5000 && <p>A reformulação aceita até 5.000 caracteres.</p>}
                {revisao?.erro && (
                    <p role="alert">{revisao.erro} Você pode enviar o relato original.</p>
                )}
                {sugestao && (
                    <>
                        <p>Confira datas, valores, protocolos e pedidos antes de usar a sugestão.</p>
                        <label htmlFor="texto-sugerido">Sugestão da IA</label><br />
                        <textarea id="texto-sugerido" value={sugestao} readOnly /><br />
                        <button type="button" onClick={() => setUsarSugestao(true)} disabled={usarSugestao}>
                            Usar sugestão no envio
                        </button>
                        <button type="button" onClick={() => setUsarSugestao(false)} disabled={!usarSugestao}>
                            Manter original
                        </button>
                        <p role="status">{usarSugestao ? 'Sugestão selecionada para envio.' : 'Original selecionado para envio.'}</p>
                    </>
                )}
            </fieldset>

            <label>Suba um arquivo</label><br />
            <input 
                type="file" 
                onChange={(e) => setArquivo(e.target.files[0])} 
            /><br />

            <label>Deseja propor solução?</label><br />
            <input 
                type="radio" 
                name="quer_solucao" 
                value="true" 
                onChange={(e) => setQuerSolucao(e.target.value)} 
                required
            /> Sim
            <input 
                type="radio" 
                name="quer_solucao" 
                value="false" 
                onChange={(e) => setQuerSolucao(e.target.value)} 
                required
            /> Não            
            <br />

            {querSolucao === 'true' && (
                <>
                    <textarea 
                        placeholder="Descreva a solução..."
                        value={solucao} 
                        onChange={(e) => setSolucao(e.target.value)} 
                        required 
                    /><br />
                </>
            )}

            <label>Deseja formalizar o acordo?</label><br />
            <input 
                type="radio" 
                name="quer_acordo" 
                value="true" 
                onChange={(e) => setQuerAcordo(e.target.value)} 
                required 
            /> Sim
            <input 
                type="radio" 
                name="quer_acordo" 
                value="false" 
                onChange={(e) => setQuerAcordo(e.target.value)}
                required
            /> Não
            <br />

            <button type="submit">Enviar formulário</button>
        </form>
    );
}

export default ReclamacaoForm;
