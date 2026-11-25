import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import { preview } from 'vite';

test('exibe e copia somente o protocolo confirmado pela API', { timeout: 30_000 }, async (t) => {
    const caminhoPlaywright = process.env.ODRCON_PLAYWRIGHT_MODULE;
    const { chromium } = await import(caminhoPlaywright
        ? pathToFileURL(resolve(caminhoPlaywright)).href
        : 'playwright');
    const vite = await preview({ configFile: false, preview: { host: '127.0.0.1', port: 0 } });
    t.after(() => vite.close());

    const navegador = await chromium.launch({ channel: 'chrome' });
    t.after(() => navegador.close());
    const pagina = await navegador.newPage();
    const protocolo = '738194205';
    const envios = [];

    await pagina.addInitScript(() => {
        Object.defineProperty(navigator, 'clipboard', {
            value: {
                async writeText(texto) {
                    window.protocoloCopiadoNoTeste = texto;
                },
            },
        });
    });
    await pagina.route('**/api/auth/csrf', rota => rota.fulfill({
        json: { headerName: 'X-CSRF-TOKEN', token: 'token-teste' },
    }));
    await pagina.route('**/api/reclamacao', rota => {
        envios.push(rota.request().headers());
        switch (envios.length) {
            case 1:
                return rota.fulfill({ status: 503 });
            case 2:
                return rota.fulfill({ status: 201, json: {} });
            default:
                return rota.fulfill({
                    status: 201,
                    json: { mensagem: 'Manifestação registrada com sucesso.', protocolo },
                });
        }
    });

    await pagina.goto(new URL('/reclamacao', vite.resolvedUrls.local[0]).href);
    await pagina.locator('input[name="is_anonimo"][value="true"]').check();
    await pagina.locator('select').first().selectOption('3');
    await pagina.getByLabel('Reclamação', { exact: true }).fill('Manifestação de teste');
    await pagina.locator('input[name="quer_solucao"][value="false"]').check();
    await pagina.locator('input[name="quer_acordo"][value="false"]').check();

    const enviar = pagina.getByRole('button', { name: 'Enviar formulário' });
    const recibo = pagina.getByRole('region', { name: 'Confirmação do registro' });
    await enviar.click();
    await pagina.getByText('Não foi possível registrar a manifestação. Tente novamente.').waitFor();
    assert.equal(await recibo.count(), 0);

    await enviar.click();
    await pagina.getByText('O servidor confirmou o registro, mas não retornou um protocolo válido.').waitFor();
    assert.equal(await recibo.count(), 0);

    await enviar.click();
    await recibo.getByText(protocolo, { exact: true }).waitFor();
    await recibo.getByText('Guarde este número para acompanhar sua manifestação.').waitFor();
    await recibo.getByRole('button', { name: 'Copiar protocolo' }).click();
    await recibo.getByText('Protocolo copiado.').waitFor();
    assert.equal(await pagina.evaluate(() => window.protocoloCopiadoNoTeste), protocolo);
    assert.equal(await recibo.getByText(protocolo, { exact: true }).isVisible(), true);
    assert.equal(envios.length, 3);
    for (const headers of envios) {
        assert.equal(headers['x-csrf-token'], 'token-teste');
        assert.match(headers['content-type'], /^multipart\/form-data; boundary=/);
    }
});
