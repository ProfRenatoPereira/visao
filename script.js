// Variáveis globais para gerenciar a animação de correção óptica
let intervaloCorrecao = null;
let grauAtualDaLente = 0.00;
let grauOriginalDoProblema = 0.00;

/**
 * Controla os campos visíveis no formulário com base no problema refrativo selecionado.
 */
function atualizarInterfacePorCondicao() {
    const tipo = document.getElementById('tipo-visao').value;
    const labelGrau = document.getElementById('label-grau');
    const inputGrau = document.getElementById('grau-input');
    const containerEixo = document.getElementById('container-eixo');

    // Sempre interrompe e esconde animações anteriores ao trocar de condição visual
    fecharPainelLente();

    if (tipo === "miopia") {
        labelGrau.textContent = "Grau de Miopia (use valores negativos, ex: -2.50):";
        inputGrau.placeholder = "Ex: -2.00";
        containerEixo.style.display = "none";
    } else if (tipo === "hipermetropia") {
        labelGrau.textContent = "Grau de Hipermetropia (use valores positivos, ex: +2.50):";
        inputGrau.placeholder = "Ex: 2.00";
        containerEixo.style.display = "none";
    } else if (tipo === "astigmatismo") {
        labelGrau.textContent = "Grau Cilíndrico de Astigmatismo (use valores negativos, ex: -1.50):";
        inputGrau.placeholder = "Ex: -1.50";
        containerEixo.style.display = "block";
    } else if (tipo === "presbiopia") {
        labelGrau.textContent = "Grau de Adição para Presbiopia (use valores positivos, ex: +2.00):";
        inputGrau.placeholder = "Ex: 1.75";
        containerEixo.style.display = "none";
    }
}

/**
 * Reseta o estado do painel de correção visual.
 */
function fecharPainelLente() {
    clearInterval(intervaloCorrecao);
    document.getElementById('painel-lente').style.display = "none";
    document.getElementById('btn-corrigir').disabled = true;
}






/**
 * Altera de forma responsiva o tamanho da fonte dos seletores de texto da página.
 * @param {number} delta - Quantidade de pixels a somar ou subtrair.
 */
function alterarFonte(delta) {
    const elementos = document.querySelectorAll('body, p, h1, h2, h3, label, input, select, button, #grau-lente-dinamico');
    elementos.forEach(elemento => {
        const estiloAtual = window.getComputedStyle(elemento).fontSize;
        const tamanhoAtual = parseFloat(estiloAtual);
        elemento.style.fontSize = (tamanhoAtual + delta) + 'px';
    });
}

/**
 * Ativa ou desativa a classe global de Alto Contraste no elemento Body.
 */
function alternarContraste() {
    document.body.classList.toggle('alto-contraste');
}




/**
 * Valida a receita inserida e aciona o gerador de simulação inicial.
 */
function calcularVisao() {
    const tipo = document.getElementById('tipo-visao').value;
    const grauInput = document.getElementById('grau-input').value;
    const resultadoTexto = document.getElementById('resultado-texto');
    const btnAudio = document.getElementById('btn-audio');
    const btnCorrigir = document.getElementById('btn-corrigir');

    fecharPainelLente(); // Limpa processos anteriores
    grauOriginalDoProblema = parseFloat(grauInput);

    if (isNaN(grauOriginalDoProblema)) {
        resultadoTexto.textContent = "Por favor, insira um valor numérico válido para o grau.";
        btnAudio.disabled = true;
        return;
    }

    // Validações obrigatórias de sinal óptico para evitar simulação incorreta
    if (tipo === "miopia" && grauOriginalDoProblema >= 0) {
        resultadoTexto.textContent = "A miopia usa graus negativos (menores que zero).";
        return;
    }
    if (tipo === "hipermetropia" && grauOriginalDoProblema <= 0) {
        resultadoTexto.textContent = "A hipermetropia usa graus positivos (maiores que zero).";
        return;
    }
    if (tipo === "astigmatismo" && grauOriginalDoProblema >= 0) {
        resultadoTexto.textContent = "O astigmatismo cilíndrico na receita usa valores negativos.";
        return;
    }
    if (tipo === "presbiopia" && grauOriginalDoProblema <= 0) {
        resultadoTexto.textContent = "A presbiopia usa graus de adição positivos.";
        return;
    }

    // Renderiza o desfoque inicial na tela
    renderizarEfeitoOcular(tipo, grauOriginalDoProblema);

    // Elabora o texto explicativo clínico de acordo com as dioptrias
    const grauAbs = Math.abs(grauOriginalDoProblema);
    if (tipo === "miopia") {
        const d = 1 / grauAbs;
        resultadoTexto.textContent = `Com ${grauOriginalDoProblema.toFixed(2)} DP de miopia, seu ponto remoto de foco máximo é de ${d >= 1 ? d.toFixed(2) + ' metros' : (d * 100).toFixed(0) + ' centímetros'}. Clique no botão abaixo para colocar os óculos de correção.`;
    } else if (tipo === "hipermetropia") {
        resultadoTexto.textContent = `Com +${grauOriginalDoProblema.toFixed(2)} DP de hipermetropia, os objetos de perto perdem a nitidez na retina. Use a lente corretiva para reajustar o ponto focal.`;
    } else if (tipo === "astigmatismo") {
        const eixo = parseInt(document.getElementById('eixo-input').value) || 90;
        resultadoTexto.textContent = `Com grau cilíndrico de ${grauOriginalDoProblema.toFixed(2)} a ${eixo}°, os raios sofrem distorção asférica. Veja a correção agir sobre o eixo óptico.`;
    } else if (tipo === "presbiopia") {
        let idadeEstimada = Math.round(40 + (grauAbs * 6.5));
        if (idadeEstimada > 65) idadeEstimada = "mais de 65";
        resultadoTexto.textContent = `Com +${grauOriginalDoProblema.toFixed(2)} de adição por vista cansada (Presbiopia - comum em torno dos ${idadeEstimada} anos), seu foco próximo falha. Acione a lente de leitura para corrigir.`;
    }

    btnAudio.disabled = false;
    btnCorrigir.disabled = false;
}

/**
 * Modifica as propriedades CSS de desfoque, escala e sombra com base na patologia e gravidade.
 */
function renderizarEfeitoOcular(tipo, grauResidual) {
    const textoSimulado = document.getElementById('texto-simulado');
    const grauAbs = Math.abs(grauResidual);

    // Se o grau já foi anulado pela lente corretiva, zera os filtros visuais
    if (grauAbs <= 0.02) {
        textoSimulado.style.filter = "none";
        textoSimulado.style.transform = "none";
        return;
    }

    if (tipo === "miopia") {
        textoSimulado.style.filter = `blur(${grauAbs * 2.5}px)`;
    } 
    else if (tipo === "hipermetropia") {
        textoSimulado.style.transform = `scale(${Math.max(0.6, 1 - (grauAbs * 0.1))})`;
        textoSimulado.style.filter = `blur(${grauAbs * 1.2}px)`;
    } 
    else if (tipo === "astigmatismo") {
        const eixo = parseInt(document.getElementById('eixo-input').value) || 90;
        const radianos = (eixo * Math.PI) / 180;
        const dx = (Math.cos(radianos) * grauAbs * 4).toFixed(1);
        const dy = (Math.sin(radianos) * grauAbs * 4).toFixed(1);
        textoSimulado.style.filter = `blur(0.5px) drop-shadow(${dx}px ${dy}px 2px var(--text-color))`;
    } 
    else if (tipo === "presbiopia") {
        textoSimulado.style.transform = `scale(${Math.max(0.5, 1 - (grauAbs * 0.15))})`;
        textoSimulado.style.filter = `blur(${grauAbs * 1.8}px)`;
    }
}





/**
 * Inicia o loop temporal que simula a inserção gradual da lente de óculos.
 */
function iniciarCorrecaoOcular() {
    const tipo = document.getElementById('tipo-visao').value;
    const painelLente = document.getElementById('painel-lente');
    const displayGrauLente = document.getElementById('grau-lente-dinamico');
    const resultadoTexto = document.getElementById('resultado-texto');

    clearInterval(intervaloCorrecao); // Impede sobreposição de timers
    grauAtualDaLente = 0.00;
    painelLente.style.display = "block";

    const passoLente = 0.05; // Fração de grau aplicada a cada frame
    
    intervaloCorrecao = setInterval(() => {
        // Lógica de progressão para receitas de sinais negativos
        if (grauOriginalDoProblema < 0) {
            grauAtualDaLente -= passoLente;
            
            if (grauAtualDaLente <= grauOriginalDoProblema) {
                grauAtualDaLente = grauOriginalDoProblema;
                clearInterval(intervaloCorrecao);
                resultadoTexto.textContent = "Visão perfeitamente corrigida! A lente compensou 100% do erro refrativo na retina.";
            }
        } 
        // Lógica de progressão para receitas de sinais positivos
        else {
            grauAtualDaLente += passoLente;
            
            if (grauAtualDaLente >= grauOriginalDoProblema) {
                grauAtualDaLente = grauOriginalDoProblema;
                clearInterval(intervaloCorrecao);
                resultadoTexto.textContent = "Visão perfeitamente corrigida! O ponto próximo voltou para a distância confortável de leitura.";
            }
        }

        // Atualiza a dioptria atual exibida no painel de correção
        displayGrauLente.textContent = (grauAtualDaLente > 0 ? "+" : "") + grauAtualDaLente.toFixed(2);

        // O erro visual restante na tela é a diferença matemática entre o problema e a lente atual
        const grauResidualNoOlho = grauOriginalDoProblema - grauAtualDaLente;
        renderizarEfeitoOcular(tipo, grauResidualNoOlho);

    }, 50); // Roda frame a frame a cada 50 milissegundos
}

/**
 * Executa a leitura em voz alta do resultado atual na tela (Web Speech API).
 */
function lerTexto() {
    const texto = document.getElementById('resultado-texto').textContent;
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Silencia leituras antigas travadas
        const narracao = new SpeechSynthesisUtterance(texto);
        narracao.lang = 'pt-BR';
        window.speechSynthesis.speak(narracao);
    } else {
        alert("Navegador sem suporte para leitura por voz.");
    }
}

