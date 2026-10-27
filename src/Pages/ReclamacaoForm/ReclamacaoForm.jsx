
import { useState } from 'react';
import './ReclamacaoForm.css';

function ReclamacaoForm() {
    const [querSolucao, setQuerSolucao] = useState('');
    const [querAcordo, setQuerAcordo] = useState('');
    const [isAnonimo, setIsAnonimo] = useState('');

    return (
        <form>
            <label>Anônimo?</label><br />
            <input
                type="radio"
                id="is_anonimo_sim"
                name="is_anonimo"
                value="true"
                onChange={(e) => setIsAnonimo(e.target.value)}
                required
            />
            <label htmlFor="is_anonimo_sim">Sim</label><br />

            <input
                type="radio"
                id="is_anonimo_nao"
                name="is_anonimo"
                value="false"
                onChange={(e) => setIsAnonimo(e.target.value)}
                required
            />
            <label htmlFor="is_anonimo_nao">Não</label><br />

            {isAnonimo === 'false' && (
                <>
                    <label htmlFor="nome_usuario">Nome</label>
                    <input
                        type='text'
                        id="nome_usuario"
                        name="nome_usuario"
                        required
                    />
                    <br />

                    <label htmlFor="email_usuario">email</label>
                    <input
                        type='email'
                        id="email_usuario"
                        name="email_usuario"
                        required
                    />
                    <br />
                </>
            )}

            <label htmlFor="descricao_original">Reclamação</label><br />
            <textarea
                id="descricao_original"
                name="descricao_original"
                placeholder="Descreva o ocorrido."
                required
            />
            <br />
            <input
                id="descricao_original"
                name="descricao_original"
                placeholder='Suba um arquivo'
                type='file'
             /><br />

            <label>Deseja propor solução?</label><br />

            <input
                type="radio"
                id="quer_solucao_radio_sim"
                name="quer_solucao"
                value="true"
                onChange={(e) => setQuerSolucao(e.target.value)}
                required
            />
            <label htmlFor="quer_solucao_radio_sim">Sim</label><br />

            <input
                type="radio"
                id="quer_solucao_radio_nao"
                name="quer_solucao"
                value="false"
                onChange={(e) => setQuerSolucao(e.target.value)}
            />
            <label htmlFor="quer_solucao_radio_nao">Não</label><br />

            {querSolucao === 'true' && (
                <>
                    <label htmlFor="solucao_proposta">
                        Descreva a solução proposta
                    </label><br />
                    <textarea
                        id="solucao_proposta"
                        name="solucao_proposta"
                        placeholder="Descreva a solução que você propõe."
                        required
                    />
                    <br />
                </>
            )}

            <div className="tooltip-container">
                <label>Deseja formalizar o acordo?</label>

                <span className="tooltip">
                    ?
                    <span className="tooltip-text">
                        <br />
                        O Termo de Acordo é destinado a situações que exigem
                        uma solução formal e um compromisso entre as partes.
                        Reclamações cotidianas, como a falta recorrente de
                        materiais de uso comum, podem não exigir esse tipo
                        de formalização.
                        <br />
                    </span>
                </span>
            </div>
            
            <input
                type="radio"
                id="quer_acordo_radio_sim"
                name="quer_acordo"
                value="true"
                onChange={(e) => setQuerAcordo(e.target.value)}
                required
            />
            <label htmlFor="quer_acordo_radio_sim">Sim</label><br />

            <input
                type="radio"
                id="quer_acordo_radio_nao"
                name="quer_acordo"
                value="false"
                onChange={(e) => setQuerAcordo(e.target.value)}
            />
            <label htmlFor="quer_acordo_radio_nao">Não</label><br />

            {querAcordo === 'true' && (
                <p>
                    Você optou por continuar com a formalização do acordo.
                    Os termos deverão ser definidos e apresentados para
                    sua análise antes da assinatura.
                </p>
            )}

            <button type="submit">Enviar formulário</button>
        </form>
    );
}

export default ReclamacaoForm;
