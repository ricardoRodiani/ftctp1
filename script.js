"use strict";
const fs = require("fs");
const { spawnSync } = require("child_process");
const LAMBDA = "\u03BB";
const STR_INICIAL = "Simulação de AFD/AFN";
const NOME_ARQUIVO = "automato";
const DELAY_GIF =
    process.argv.slice(2)[0] === undefined ? "300" : process.argv.slice(2)[0];
const TAMANHO_FIXO_STRING = 3;
try {
    if (isNaN(DELAY_GIF)) {
        throw "Argumento inválido!";
    }
    // le o conteudo do arquivo txt de forma sincrona
    const data = fs.readFileSync("entrada.txt", "UTF-8");
    const lines = data.split(/\r?\n/);
    const iniciaisFinais = lines.shift().split(";");
    const iniciais = iniciaisFinais[0].trim().split(" ");
    const finais = iniciaisFinais[1].trim().split(" ");
    const palavra = lines.pop().trim().split(":").pop().trim();
    // gera um novo array, sem o caracter ">", novo array = ['inicial', 'simbolo', 'destino']
    const transicoes = lines
        .map((linha) => linha.split(" "))
        .map((elemento) =>
            elemento.filter((elemento, indice, proprio) => {
                return indice != 2;
            })
        );
    const objTransicoes = transicoes.map((linha) => {
        return { ...linha };
    });
    const transicoesDot = transicoes.map((elemento) => {
        return toDot(elemento);
    });
    let automato = constroiStringDot(transicoesDot, iniciais, finais, true);
    escreveArquivoDot(NOME_ARQUIVO, 0, automato);
    executaDot(NOME_ARQUIVO, 0);
    global.novasTransicoes = [];
    consumirPalavra(iniciais, palavra, objTransicoes, "transicao");
    const arrayConsumo = novasTransicoes.map((obj) => {
        const estIni = obj.prmroEst;
        const estFin = obj.estDestino[0];
        const sim = obj.prmroChar;
        const rest = obj.strRestante;
        const indice = objTransicoes.findIndex((x) => {
            return x[0] === estIni && x[1] === sim && x[2] === estFin;
        });
        return {
            transicao: `${estIni} -> ${estFin} [ label = "${sim}" style = bold color = red ]`,
            legenda: `[${estIni}/${sim}, ${rest === "" ? LAMBDA : rest}]`,
            indice: indice,
        };
    });
    let newDots = [];
    for (let i = 0; i < arrayConsumo.length; i++) {
        let changeIndice = arrayConsumo[i].indice;
        let newTransicao = arrayConsumo[i].transicao;
        let legenda = arrayConsumo[i].legenda;
        let copiaDots = [...transicoesDot];
        copiaDots[changeIndice] = newTransicao;
        let novoArray = [...copiaDots];
        novoArray.push(legenda);
        newDots.push(novoArray);
    }
    for (let i = 0; i < newDots.length; i++) {
        automato = constroiStringDot(newDots[i], iniciais, finais, false);
        escreveArquivoDot(NOME_ARQUIVO, i + 1, automato);
        executaDot(NOME_ARQUIVO, i + 1);
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
    novaString += ` [ label = "${simbolo}" ];`;
    return novaString;
}

function constroiStringDot(dots, iniciais, finais, primeiraExec) {
    let legenda = "";
    if (!primeiraExec) {
        legenda = dots.pop();
    }
    const str = `digraph automato {
    rankdir=LR;
    size="8.5";
    subgraph cluster{
        label="${primeiraExec ? STR_INICIAL : legenda}";
        ${iniciais
            .map(() => {
                return `node [shape = none]; "";`;
            })
            .join("\r\n")}
        node [shape = doublecircle]; ${finais.join(" ")};
        node [shape = circle];          
        ${iniciais
            .map((s) => {
                return `"" -> ${s};`;
            })
            .join("\r\n")}
        ${dots.join("\r\n")}
        ${
            primeiraExec
                ? ""
                : legenda.split("/")[0].substring(1) +
                  " [ style = filled fillcolor = dimgrey ];"
        } 
    }
}`;
    return str;
}

function strComTamanhoFixo(numero) {
    return new String(numero).padStart(TAMANHO_FIXO_STRING, "0");
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
        let cpy = [...estadoAtual];
        let prmroEst = cpy.shift();
        let prmroChar = palavra.charAt(0);
        let strRestante = palavra.substring(1);
        let estDestino = objTransicoes
            .filter((obj) => {
                return obj[0] === prmroEst && obj[1] === prmroChar;
            })
            .map((obj) => {
                return obj[2];
            });
        if (estDestino.length === 0) {
            throw new Error("Palavra não reconhecida!");
        }
        // chamada recursiva com o restante da palavra
        novasTransicoes.push({
            cpy,
            prmroEst,
            estDestino,
            prmroChar,
            strRestante,
        });
        consumirPalavra(estDestino, strRestante, objTransicoes, opcao);
        /*
         * Podemos mandar os daods para um arrray de "legendas"
         * Ou para um array de transicao
         */
        if (cpy.length > 0) {
            consumirPalavra(cpy, palavra, objTransicoes, opcao);
        }
        return;
    }
}

function fazGif() {
    spawnSync(
        "convert",
        [
            "-delay",
            DELAY_GIF,
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
