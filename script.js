const fs = require("fs");

try {
    // read contents of the file
    const data = fs.readFileSync("entrada.txt", "UTF-8");
    const lines = data.split(/\r?\n/);
    let iniciaisFinais = lines.shift().split(";");
    let iniciais = iniciaisFinais[0].trim().split(" ");
    let finais = iniciaisFinais[1].trim().split(" ");
    let palavra = lines.pop().trim().split(":").pop();
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
    console.log(outros);
    console.log(iniciais);
    console.log(finais);
    console.log(todos);
} catch (err) {
    console.error(err);
}

function Automato(todos) {}

function dadosUnicos(elemento, indice, self) {
    return self.indexOf(elemento) === indice;
}
