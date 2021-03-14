let fs = require("fs");

fs.readFile("entrada.txt", "utf-8", (erro, dado) => {
    if (erro) {
        console.log("Ocorreu algum erro ao tentar ler o arquivo -> " + erro);
    }
    console.log(dado);
});
