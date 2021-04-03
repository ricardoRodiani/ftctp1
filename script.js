const fs = require("fs");
const { spawnSync } = require("child_process");
const LAMBDA = "\u03BB";
const STRINICIAL = "Simulação de AFD/AFN";
const NOMEARQUIVO = "automato";
try {
    // le o conteudo do arquivo txt de forma sincrona
    const data = fs.readFileSync("entrada.txt", "UTF-8");
    const lines = data.split(/\r?\n/);
    let iniciaisFinais = lines.shift().split(";");
    let iniciais = iniciaisFinais[0].trim().split(" ");
    let finais = iniciaisFinais[1].trim().split(" ");
    let palavra = lines.pop().trim().split(":").pop().trim();
    // gera um novo array, sem o caracter ">", novo array = ['inicial', 'simbolo', 'destino']
    let transicoes = lines
        .map((linha) => linha.split(" "))
        .map((elemento) =>
            elemento.filter((elemento, indice, proprio) => {
                return indice != 2;
            })
        );
    let objTransicoes = transicoes.map((linha) => {
        return { ...linha };
    });
    let transicoesDot = transicoes.map((elemento) => {
        return toDot(elemento);
    });
    let automato = constroiStringDot(
        transicoesDot,
        iniciais,
        finais,
        STRINICIAL
    );
    escreveArquivoDot(NOMEARQUIVO, 0, automato);
    executaDot(NOMEARQUIVO, 0);
    let novasTransicoes = consumirPalavra(
        iniciais[0],
        palavra,
        objTransicoes,
        "transicao"
    );
    let lgnd = consumirPalavra(iniciais[0], palavra, objTransicoes, "legenda");
    novasTransicoes = novasTransicoes.map((str) => {
        return addStrModificada(transicoesDot, str);
    });
    for (let i = 0; i < novasTransicoes.length; i++) {
        automato = constroiStringDot(
            novasTransicoes[i],
            iniciais,
            finais,
            lgnd[i]
        );
        escreveArquivoDot(NOMEARQUIVO, i + 1, automato);
        executaDot(NOMEARQUIVO, i + 1);
    }
    fazGif();
} catch (err) {
    console.error(err);
}

function toDot(transicao) {
    let novaString = "";
    let simbolo = transicao[1];
    transicao[1] = "->";
    novaString += transicao.join(" ");
    novaString += ` [ label = "${simbolo}"];`;
    return novaString;
}

function constroiStringDot(transicoesDot, iniciais, finais, legendaAtual) {
    let str = `digraph automato {
    rankdir=LR;
    size="8,5";
    subgraph cluster{
        label="${legendaAtual}";
        node [shape = point] "";
        node [shape = circle];
        node [shape = doublecircle] ${finais.join(" ")};
        "" -> ${iniciais.join(" ")};
        ${transicoesDot
            .map((linha, i) => {
                return i > 0 ? "\t\t" + linha : linha;
            })
            .join("\r\n")}
        ${
            legendaAtual === STRINICIAL
                ? ""
                : legendaAtual.split("/")[0].substring(1) +
                  "[ style = filled fillcolor = dimgrey ];"
        } 
    }
}`;
    return str;
}

function strComTamanhoFixo(numero) {
    return new String(numero).padStart(3, "0");
}

function escreveArquivoDot(str, indice, automato) {
    fs.writeFileSync(
        `./automato/${str}${strComTamanhoFixo(indice)}.dot`,
        automato,
        "UTF-8"
    );
}

function executaDot(str, indice) {
    spawnSync(
        "dot",
        [
            "-Tpng",
            `${str}${strComTamanhoFixo(indice)}.dot`,
            "-o",
            `${str}${strComTamanhoFixo(indice)}.png`,
        ],
        { cwd: "./automato" }
    );
}
/*
 * @params(objeto:estadoAtual, string: palavra, objeto: objTransicoes, str: opcao)
 * Consome recusivamente a palavra sempre pegando o primeiro caracter
 * retorna a string modificada que reflete a transição sobre o mesmo
 * para quando a string for totalmente consumida
 * unshift adiciona o elemento sempre no inicio do vetor
 * ja que a recursao retorna o ultimo elemento gerado para os primeiros
 */
function consumirPalavra(estadoAtual, palavra, objTransicoes, opcao) {
    if (palavra === "") {
        return [];
    } else {
        let primeiroChar = palavra.charAt(0);
        let strRestante = palavra.substring(1);
        let estadoDestino = objTransicoes
            .filter((obj) => {
                return obj[0] === estadoAtual && obj[1] === primeiroChar;
            })
            .map((obj) => {
                return obj[2];
            });
        if (estadoDestino > 1) {
        } else {
            estadoDestino = estadoDestino[0];
        }
        const arr = consumirPalavra(
            estadoDestino,
            strRestante,
            objTransicoes,
            opcao
        );
        // como estamos usando recursao, eh necessario adicionar o valor sempre no inicio do array
        // para que a ordem de transicao seja mantida
        opcao === "legenda"
            ? arr.unshift(
                  `[${estadoAtual}/${primeiroChar}, ${
                      strRestante == "" ? LAMBDA : strRestante
                  }]`
              )
            : arr.unshift(
                  `${estadoAtual} -> ${estadoDestino} [ label = "${primeiroChar}" style = bold color = red `
              );
        return arr;
    }
}

function addStrModificada(transicoesDot, strModificada) {
    let matchStr = strModificada
        .substring(0, strModificada.indexOf("style"))
        .trim();
    return transicoesDot.map((linha) => {
        return linha.replace(matchStr, strModificada);
    });
}

function fazGif() {
    spawnSync(
        "convert",
        [
            "-delay",
            "400",
            "-loop",
            "0",
            "-dispose",
            "previous",
            "automato*.png",
            "automato.gif",
        ],
        { cwd: "./automato" }
    );
}
