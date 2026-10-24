
import { useState } from 'react';

function ReclamacaoForm() {
    const [querSolucao, setQuerSolucao] = useState('');
    const [querAcordo, setQuerAcordo] = useState('');

    return (
        <form>
            <label htmlFor="descricao_original">Reclamação</label><br />
            <textarea
                id="descricao_original"
                name="descricao_original"
                placeholder="Descreva o ocorrido."
                required
            />
            <br />

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

            <p>
                <strong>Atenção: formalização de acordo</strong><br />
                O Termo de Acordo é destinado a situações que exigem uma
                solução formal e um compromisso entre as partes. Reclamações
                sobre questões cotidianas, como a falta recorrente de materiais
                de uso comum, podem não exigir esse tipo de formalização.
                Antes de continuar, avalie se a situação relatada realmente
                demanda um acordo formal. A assinatura do termo implica o
                compromisso com as condições estabelecidas para a solução da
                reclamação.
            </p>

            <label>Deseja continuar com a formalização do acordo?</label><br />

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

            {querAcordo === 'false' && (
                <p>
                    Você optou por não continuar com a formalização do acordo.
                </p>
            )}

            <button type="submit">Enviar formulário</button>
        </form>
    );
}

export default ReclamacaoForm;
