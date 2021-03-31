const fs = require("fs");
const { spawnSync } = require("child_process");

try {
    // read contents of the file
    const data = fs.readFileSync("entrada.txt", "UTF-8");
    const lines = data.split(/\r?\n/);
    let iniciaisFinais = lines.shift().split(";");
    let iniciais = iniciaisFinais[0].trim().split(" ");
    let finais = iniciaisFinais[1].trim().split(" ");
    let palavra = lines.pop().trim().split(":").pop();
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
    console.log(objTransicoes);
    let objAutomato = deepMerge(...objTransicoes);
    console.log(objAutomato);
    let transicoesDot = transicoes.map((elemento) => {
        return toDot(elemento);
    });
    console.log(transicoesDot);
    let alfabeto = lines
        .map((linha) => linha.split(" "))
        .map((elemento) =>
            elemento.filter((elemento, indice, proprio) => {
                return indice == 1;
            })
        );
    alfabeto = [].concat.apply([], alfabeto);
    alfabeto = alfabeto.filter(dadosUnicos);
    let outros = lines
        .map((linha) => linha.split(" "))
        .map((elemento) =>
            elemento.filter((elemento, indice, proprio) => {
                return indice == 0 || indice == proprio.length - 1;
            })
        );
    outros = [].concat.apply([], outros);
    outros = outros.filter(dadosUnicos);
    outros = outros.filter((x) => {
        if (!(iniciais.includes(x) || finais.includes(x))) {
            return x;
        }
    });
    let todos = [].concat(iniciais, outros, finais);
    let automato = constroiAutomato(transicoesDot, iniciais, outros, finais);
    escreveArquivoDot("automato", automato);
    executaDot("automato");
    consumirPalavra("s0", "aab", objAutomato);
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

function constroiAutomato(transicoesDot, iniciais, outros, finais) {
    let str = `digraph finite_state_machine {
    rankdir=LR;
    size="8,5"
    node [shape = none]; "";
    node [shape = circle] ${iniciais.join(" ") + " " + outros.join(" ")};
    node [shape = doublecircle] ${finais.join(" ")};
    "" -> ${iniciais.join(" ")}
    ${transicoesDot.join("\n\t")}
}`;
    return str;
}

function escreveArquivoDot(str, automato) {
    fs.writeFileSync(`${str}.dot`, automato);
}

function executaDot(str) {
    spawnSync("dot", ["-Tpng", "automato.dot", "-o", "automato.png"]);
}

function arrayParaObjeto(estado1, simbolo, estado2) {
    return {
        [estado1]: {
            [simbolo]: estado2,
        },
    };
}

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

function consumirPalavra(estadoAtual, palavra, objAutomato) {
    if (palavra == "") {
        return "";
    } else {
        let primeiroChar = palavra.charAt(0);
        let strRestante = palavra.substring(1);
        let transicoesPossiveis = Object.keys(objAutomato[estadoAtual]);
        let estadoDestino;
        if (transicoesPossiveis.includes(primeiroChar)) {
            estadoDestino = objAutomato[estadoAtual][primeiroChar];
        }
        console.log(
            `${estadoAtual} -> ${estadoDestino} [ label = "${primeiroChar}" style = bold color = red]`
        );
        consumirPalavra(estadoDestino, strRestante, objAutomato);
    }
}
