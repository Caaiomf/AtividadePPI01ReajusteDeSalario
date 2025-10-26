import express from 'express';

const host = '0.0.0.0';
const porta = 3000;

const server = express();

server.get('/', (requisicao, resposta) => {
    const idade = requisicao.query.idade;
    const sexo = requisicao.query.sexo;
    const salario_base = requisicao.query.salario_base;
    const anoContratacao = requisicao.query.anoContratacao;
    const matricula = requisicao.query.matricula;

      if (!idade || !sexo || !salario_base || !anoContratacao || !matricula) {
        resposta.send(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="ie=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reajuste de salário</title>
        </head>
        <body>
          <h2>Instruções</h2>
          <p>Para calcular o reajuste salarial informe na URL os seguintes dados:</p>
          <p>http://localhost:3000/?idade=18&sexo=F&salario_base=1700&anoContratacao=2014&matricula=12345</p>
          <h3>Não será válido se:</h3>
          <ul>
            <li>Idade menor que 16</li>
            <li>Salário base não for um número real válido</li>
            <li>Ano de contratação menor que 1960</li>
            <li>Matrícula menor ou igual a zero</li>
          </ul>
        </body>
        </html>
        `);
        return;
    }

    const idadeReal = parseInt(idade);
    const salarioReal = parseFloat(salario_base);
    const anoReal = parseInt(anoContratacao);
    const matriculaReal = parseInt(matricula);

    let mensagemErro = "";
    if (idadeReal < 16) mensagemErro += "<li>Idade inválida</li>";
    if (salarioReal <= 0) mensagemErro += "<li>Salário base inválido</li>";
    if (anoReal < 1960) mensagemErro += "<li>Ano de contratação inválido</li>";
    if (matriculaReal <= 0) mensagemErro += "<li>Matrícula inválida</li>";

    if (mensagemErro) {
        resposta.send(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
          <meta charset="UTF-8">
          <title>Erro nos Dados</title>
        </head>
        <body>
          <h2>Dados inválidos</h2>
          <ul>${mensagemErro}</ul>
          <p>Para calcular o reajuste salarial informe na URL os seguintes dados:</p>
          <p>http://localhost:3000/?idade=18&sexo=F&salario_base=1700&anoContratacao=2014&matricula=12345</p>
        </body>
        </html>
        `);
        return;
    }

    const anoAtual = new Date().getFullYear();
    const tempoEmpresa = anoAtual - anoReal;

    let percentual = 0;
    let ajusteFixo = 0;
    const sexoUpper = sexo.toUpperCase();

    if (idadeReal >= 18 && idadeReal <= 39) {
        if (sexoUpper === "M") {
            percentual = 0.10;
            if (tempoEmpresa > 10) {
                ajusteFixo = 17;
            } else {
                ajusteFixo = -10;
            }
        } else {
            percentual = 0.08;
            if (tempoEmpresa > 10) {
                ajusteFixo = 16;
            } else {
                ajusteFixo = -11;
            }
        }
    } else if (idadeReal >= 40 && idadeReal <= 69) {
        if (sexoUpper === "M") {
            percentual = 0.08;
            if (tempoEmpresa > 10) {
                ajusteFixo = 15;
            } else {
                ajusteFixo = -5;
            }
        } else {
            percentual = 0.10;
            if (tempoEmpresa > 10) {
                ajusteFixo = 14;
            } else {
                ajusteFixo = -7;
            }
        }
    } else if (idadeReal >= 70 && idadeReal <= 99) {
        if (sexoUpper === "M") {
            percentual = 0.15;
            if (tempoEmpresa > 10) {
                ajusteFixo = 13;
            } else {
                ajusteFixo = -15;
            }
        } else {
            percentual = 0.17;
            if (tempoEmpresa > 10) {
                ajusteFixo = 12;
            } else {
                ajusteFixo = -17;
            }
        }
    } else {
        resposta.send(`
        <html><body><h2>Faixa etária fora dos limites da tabela (18 a 99 anos).</h2></body></html>
        `);
        return;
    }

    const novoSalario = salarioReal * (1 + percentual) + ajusteFixo;

    let tipoAjuste = "";
    if (tempoEmpresa > 10) {
        tipoAjuste = "Acréscimo";
    } else {
        tipoAjuste = "Desconto";
    }

    resposta.send(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
      <meta charset="UTF-8">
      <title>Resultado do Reajuste</title>
    </head>
    <body>
        <h2>Resultado do Reajuste Salarial</h2>
        <p><strong>Matrícula:</strong> ${matriculaReal}</p>
        <p><strong>Idade:</strong> ${idadeReal}</p>
        <p><strong>Sexo:</strong> ${sexoUpper}</p>
        <p><strong>Salário Base:</strong> R$ ${salarioReal.toFixed(2)}</p>
        <p><strong>Ano de Contratação:</strong> ${anoReal}</p>
        <p><strong>Tempo de Empresa:</strong> ${tempoEmpresa} anos</p>
        <hr>
        <p><strong>Percentual de Reajuste:</strong> ${(percentual * 100).toFixed(1)}%</p>
        <p><strong>${tipoAjuste} Fixo:</strong> R$ ${Math.abs(ajusteFixo).toFixed(2)}</p>
        <hr>
        <p><strong>Novo Salário:</strong> R$ ${novoSalario.toFixed(2)}</p>
    </body>
    </html>
    `);
});

server.listen(porta, host, () => {
    console.log(`Servidor escutando em http://${host}:${porta}`);
});