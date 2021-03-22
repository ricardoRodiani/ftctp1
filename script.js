const fs = require("fs");

try {
    // read contents of the file
    const data = fs.readFileSync("entrada.txt", "UTF-8");

    // splita o conteudo de cada linha transformando num objeto
    const lines = data.split(/\r?\n/);
    // const array = [];
    // lines.forEach((line) => {
    //     const i = line.split(" ");
    //     array.push(i);
    // });
    // console.log(array);
    // let iniciasFinais = array[0];
    // console.log(iniciasFinais);
    let primeiraLinha = lines.shift().split(";");
    let palavra = lines.pop().split(":").pop();
    console.log(primeiraLinha, palavra, lines);
} catch (err) {
    console.error(err);
}

function Estado(nome, tipo) {
    this.nome = nome;
    this.tipo = tipo;
}
