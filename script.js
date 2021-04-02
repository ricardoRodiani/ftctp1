const fs = require("fs");
const { spawnSync } = require("child_process");
const LAMBDA = "\u03BB";
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
    let objTransicoes = transicoes.map((linhaArray) => {
        return arrayParaObjeto(...linhaArray);
    });
    let objAutomato = deepMerge(...objTransicoes);
    let transicoesDot = transicoes.map((elemento) => {
        return toDot(elemento);
    });
    // console.log(transicoesDot);
    let outros = lines
        .map((linha) => linha.split(" "))
        .map((elemento) =>
            elemento.filter((elemento, indice, proprio) => {
                return indice == 0 || indice == proprio.length - 1;
            })
        );
    // planifica array
    outros = [].concat.apply([], outros);
    // retorna um array somente com dados unicos
    outros = outros.filter(dadosUnicos);
    outros = outros.filter((elemento) => {
        if (!(iniciais.includes(elemento) || finais.includes(elemento))) {
            return elemento;
        }
    });
    let automato = constroiAutomato(
        transicoesDot,
        iniciais,
        outros,
        finais,
        ""
    );
    escreveArquivoDot("automato", 0, automato);
    executaDot("automato", 0);
    let novasTransicoes = consumirPalavra(iniciais[0], palavra, objAutomato);
    let lgnd = legendas(iniciais[0], palavra, objAutomato);
    // console.log(lgnd);
    // console.log(novasTransicoes);
    novasTransicoes = novasTransicoes.map((str) => {
        return addStrModificada(transicoesDot, str);
    });
    // console.log(novasTransicoes);
    for (let i = 0; i < novasTransicoes.length; i++) {
        automato = constroiAutomato(
            novasTransicoes[i],
            iniciais,
            outros,
            finais,
            lgnd[i]
        );
        escreveArquivoDot("automato", i, automato);
        executaDot("automato", i);
    }
    fazGif();
} catch (err) {
    console.error(err);
}

function dadosUnicos(elemento, indice, proprio) {
    return proprio.indexOf(elemento) === indice;
}

function toDot(transicao) {
    let novaString = "";
    let simbolo = transicao[1];
    transicao[1] = "->";
    novaString += transicao.join(" ");
    novaString += ` [ label = "${simbolo}"];`;
    return novaString;
}

function constroiAutomato(
    transicoesDot,
    iniciais,
    outros,
    finais,
    legendaAtual
) {
    let str = `digraph finite_state_machine {
    rankdir=LR;
    size="8,5"
    subgraph cluster{
        label="${legendaAtual}"
        node [shape = point]; "";
        node [shape = circle] ${iniciais.join(" ") + " " + outros.join(" ")};
        node [shape = doublecircle] ${finais.join(" ")};
        "" -> ${iniciais.join(" ")}
        ${transicoesDot.join("\n")}
    }
}`;
    return str;
}

function escreveArquivoDot(str, indice, automato) {
    fs.writeFileSync(`./automato/${str}${indice + 1}.dot`, automato);
}

function executaDot(str, indice) {
    spawnSync(
        "dot",
        ["-Tpng", `${str}${indice + 1}.dot`, "-o", `${str}${indice + 1}.png`],
        { cwd: "./automato" }
    );
}

function arrayParaObjeto(estado1, simbolo, estado2) {
    return {
        [estado1]: {
            [simbolo]: estado2,
        },
    };
}

/*
 * @params(n objetos, usando o operador spread '...')
 * a ideia eh juntar os arrays como um array unico
 * sem sobrescrever nenhum propriedade ja existente
 * caso a propriedade exista adicionamos esse novo valor num array
 * se nao existir ela é criada
 * retorna um novo objeto que representa os estados e suas transicoes
 */
function deepMerge(...args) {
    let objFinal = {};
    let merger = (obj) => {
        for (let prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                if (
                    Object.prototype.toString.call(obj[prop]) ===
                    "[object Object]"
                ) {
                    // Se essa propriedade representar outro objeto
                    objFinal[prop] = Object.assign(
                        {},
                        objFinal[prop],
                        obj[prop]
                    );
                } else {
                    // Caso seja uma propriedade comum, so atribuir normalmente
                    objFinal[prop] = obj[prop];
                }
            }
        }
    };
    for (let i = 0; i < args.length; i++) {
        merger(args[i]);
    }

    return objFinal;
}
/*
 * @params(objeto:estadoAtual, string: palavra, objeto: objAutomato)
 * Consome recusivamente a palavra sempre pegando o primeiro caracter
 * retorna a string modificada que reflete a transição sobre o mesmo
 * para quando a string for totalmente consumida
 * unshift adiciona o elemento sempre no inicio do vetor
 * ja que a recursao retorna o ultimo elemento gerado para os primeiros
 */
function consumirPalavra(estadoAtual, palavra, objAutomato) {
    if (palavra === "") {
        return [];
    } else {
        let primeiroChar = palavra.charAt(0);
        let strRestante = palavra.substring(1);
        let transicoesPossiveis = Object.keys(objAutomato[estadoAtual]);
        let estadoDestino;
        if (transicoesPossiveis.includes(primeiroChar)) {
            estadoDestino = objAutomato[estadoAtual][primeiroChar];
        }
        const arr = consumirPalavra(estadoDestino, strRestante, objAutomato);
        // como estamos usando recursao, eh necessario adicionar o valor sempre no inicio do array
        // para que a ordem de transicao seja mantida
        arr.unshift(
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
            "300",
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

function legendas(estadoAtual, palavra, objAutomato) {
    if (palavra === "") {
        return [];
    } else {
        let primeiroChar = palavra.charAt(0);
        let strRestante = palavra.substring(1);
        let transicoesPossiveis = Object.keys(objAutomato[estadoAtual]);
        let estadoDestino;
        if (transicoesPossiveis.includes(primeiroChar)) {
            estadoDestino = objAutomato[estadoAtual][primeiroChar];
        }
        const arr = legendas(estadoDestino, strRestante, objAutomato);
        // como estamos usando recursao, eh necessario adicionar o valor sempre no inicio do array
        // para que a ordem de transicao seja mantida
        arr.unshift(
            `[${estadoAtual}/${primeiroChar}, ${
                strRestante == "" ? LAMBDA : strRestante
            }]`
        );
        return arr;
    }
}
