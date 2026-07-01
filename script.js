// Altera dinamicamente o tamanho da fonte da página (Acessibilidade)
function alterarFonte(delta) {
    const elementos = document.querySelectorAll('body, p, h1, h2, h3, label, input, button');
    elementos.forEach(elemento => {
        const estiloAtual = window.getComputedStyle(elemento).fontSize;
        const tamanhoAtual = parseFloat(estiloAtual);
        elemento.style.fontSize = (tamanhoAtual + delta) + 'px';
    });
}

// Ativa/Desativa o modo de alto contraste usando CSS Variables
function alternarContraste() {
    document.body.classList.toggle('alto-contraste');
}

// Executa os cálculos de óptica física
function calcularVisao() {
    const grauInput = document.getElementById('grau-input').value;
    const grau = parseFloat(grauInput);
    const resultadoTexto = document.getElementById('resultado-texto');
    const textoSimulado = document.getElementById('texto-simulado');
    const btnAudio = document.getElementById('btn-audio');

    // Validação de entrada
    if (isNaN(grau)) {
        resultadoTexto.textContent = "Por favor, insira um valor numérico válido.";
        btnAudio.disabled = true;
        return;
    }

    if (grau >= 0) {
        resultadoTexto.textContent = "A miopia é representada por graus negativos. Insira um valor menor que zero (Ex: -2.0).";
        textoSimulado.style.filter = "none";
        btnAudio.disabled = true;
        return;
    }

    // Princípio óptico: Ponto remoto (foco máximo) f = 1 / |Dioptria|
    const dioptria Absoluta = Math.abs(grau);
    const distanciaMetros = 1 / dioptriaAbsoluta;
    const distanciaCentimetros = distanciaMetros * 100;

    // Constrói a resposta baseada no cálculo físico
    let mensagem = `Com o grau de ${grau.toFixed(2)}, o seu ponto remoto óptico é de ${distanciaCentimetros.toFixed(1)} centímetros. `;
    mensagem += `Isso significa que seu olho consegue focar perfeitamente apenas até essa distância. Qualquer objeto mais longe parecerá borrado.`;

    // Atualiza a interface
    resultadoTexto.textContent = mensagem;
    btnAudio.disabled = false;

    // Simulação visual: ajusta o desfoque (blur) proporcionalmente ao grau
    // Quanto maior o grau negativo, maior o desfoque
    const intensidadeDesfoque = dioptriaAbsoluta * 2;
    textoSimulado.style.filter = `blur(${intensidadeDesfoque}px)`;
}

// Acessibilidade por áudio: utiliza a API nativa do navegador (Web Speech API)
function lerTexto() {
    const texto = document.getElementById('resultado-texto').textContent;
    
    // Verifica suporte do navegador
    if ('speechSynthesis' in window) {
        // Cancela leituras anteriores em execução
        window.speechSynthesis.cancel();

        const narracao = new SpeechSynthesisUtterance(texto);
        narracao.lang = 'pt-BR';
        narracao.rate = 1.0; // Velocidade normal
        
        window.speechSynthesis.speak(narracao);
    } else {
        alert("Desculpe, seu navegador não suporta a leitura de texto em voz alta.");
    }
}
