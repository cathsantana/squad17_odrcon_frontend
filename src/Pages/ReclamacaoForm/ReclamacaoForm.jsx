import { useState } from 'react';
import './ReclamacaoForm.css';

function ReclamacaoForm() {
    const [isAnonimo, setIsAnonimo] = useState('');
    const [reclamacao, setReclamacao] = useState('');
    const [querSolucao, setQuerSolucao] = useState('');
    const [solucao, setSolucao] = useState('');
    const [querAcordo, setQuerAcordo] = useState('');
    const [arquivo, setArquivo] = useState(null); // Guarda o arquivo real

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Cria a caixa do formulário com suporte a arquivos
        const formData = new FormData();
        
        // 2. Adiciona os campos de texto/booleano um por um
        formData.append('isAnonimo', isAnonimo === 'true');
        formData.append('reclamacao', reclamacao);
        formData.append('hasSolucao', querSolucao === 'true');
        formData.append('solucao', querSolucao === 'true' ? solucao : '');
        formData.append('hasAcordo', querAcordo === 'true');

        // 3. Adiciona o arquivo real (se o usuário selecionou algum)
        if (arquivo) {
            formData.append('arquivo', arquivo);
        }

        try {
            // 4. Envia para o Spring Boot (Note que NÃO colocamos o Header Content-Type aqui!)
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
            {/* Seus campos de rádio de anônimo */}
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

            <label>Reclamação</label><br />
            <textarea 
                value={reclamacao} 
                onChange={(e) => setReclamacao(e.target.value)} 
                required 
            /><br />

            {/* Captura o arquivo de verdade aqui */}
            <label>Suba um arquivo</label><br />
            <input 
                type="file" 
                onChange={(e) => setArquivo(e.target.files[0])} 
            /><br />

            {/* Resto dos seus campos de solução e acordo... */}
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