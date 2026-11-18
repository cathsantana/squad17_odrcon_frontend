import { useState } from 'react'; // [MODIFICADO] Removido o useEffect, pois os dados agora são fictícios

function ReclamacaoForm() {
    const [isAnonimo, setIsAnonimo] = useState('');
    const [reclamacao, setReclamacao] = useState('');
    const [querSolucao, setQuerSolucao] = useState('');
    const [solucao, setSolucao] = useState('');
    const [querAcordo, setQuerAcordo] = useState('');
    const [arquivo, setArquivo] = useState(null);

    // [ADICIONADO] Lista fictícia de 1 a 20 e estados para guardar a seleção
    const opcoesFicticias = Array.from({ length: 20 }, (_, i) => i + 1);
    const [empresaSelecionada, setEmpresaSelecionada] = useState('');
    const [unidadeSelecionada, setUnidadeSelecionada] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        
        formData.append('isAnonimo', isAnonimo === 'true');
        formData.append('reclamacao', reclamacao);
        formData.append('hasSolucao', querSolucao === 'true');
        formData.append('solucao', querSolucao === 'true' ? solucao : '');
        formData.append('hasAcordo', querAcordo === 'true');

        // [ADICIONADO] Envia os IDs fictícios de empresa e unidade se for anônimo
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
            const response = await fetch('http://localhost:8080/api/reclamacao', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const resultado = await response.json();
                console.log('Sucesso!', resultado);
                alert('Reclamação e arquivo enviados com sucesso!');
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

            {/* [ADICIONADO] Seletores de Empresa (obrigatório) e Unidade (opcional) de 1 a 20 */}
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

            <label>Reclamação</label><br />
            <textarea 
                value={reclamacao} 
                onChange={(e) => setReclamacao(e.target.value)} 
                required 
            /><br />

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