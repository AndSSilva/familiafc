// ==============================
// CONFIGURAÇÕES
// ==============================

const QUALIDADES_LINHA = [
    "Finalização",
    "Passe",
    "Drible",
    "Velocidade",
    "Marcação",
    "Força",
    "Visão de jogo",
    "Posicionamento"
];


const QUALIDADES_GOLEIRO = [
    "Reflexo",
    "Saída do gol",
    "Jogo com os pés",
    "Comunicação"
];


const LIMITE_LINHA = 16;
const LIMITE_GOLEIRO = 2;


const API_URL = "https://script.google.com/macros/s/AKfycbz3CW_mRfcpzuv1zlqtZxxYQRa93qbgRRFPSvQjZN6TDMGOw7Fq0z_nG5_odPAbAlAz/exec";



// ==============================
// ESTADO DO APP
// ==============================

let jogadorAtual = null;

let filaAvaliacoes = [];

let indiceAvaliacao = 0;



// ==============================
// INICIALIZAÇÃO
// ==============================

document.addEventListener("DOMContentLoaded", async () => {

    const salvo = localStorage.getItem("familia_fc_player");

    if (!salvo) {
        mostrarTela("tela-cadastro");
        return;
    }

    jogadorAtual = JSON.parse(salvo);

    try {

        const resposta = await fetch(API_URL + "?action=participants");
        const participantes = await resposta.json();

        const existe = participantes.some(
            p => p.id === jogadorAtual.id
        );

        if (!existe) {

            localStorage.removeItem("familia_fc_player");
            jogadorAtual = null;

            mostrarTela("tela-cadastro");
            return;
        }

        mostrarTela("tela-espera");
        carregarSala();

    } catch (erro) {

        console.error(erro);

        mostrarTela("tela-cadastro");

    }

});

// Atualiza sala automaticamente
setInterval(() => {

    carregarSala();

}, 5000);




// ==============================
// CONTROLE DE TELAS
// ==============================

function mostrarTela(id) {


    const telas =
        document.querySelectorAll(".tela");


    telas.forEach(tela => {

        tela.classList.remove(
            "ativa"
        );

    });



    const tela =
        document.getElementById(id);


    if(tela){

        tela.classList.add(
            "ativa"
        );

    }

}



// ==============================
// CADASTRO
// ==============================

document
.getElementById("btn-cadastrar")
.addEventListener(
    "click",
    cadastrar
);



async function cadastrar() {


    const nome =
        document
        .getElementById("nome")
        .value
        .trim();



    const time =
        document
        .getElementById("time")
        .value;



    const posicao =
        document
        .getElementById("posicao")
        .value;



    if(!nome){

        mostrarMensagem(
            "Digite seu nome"
        );

        return;

    }



    const jogador = {

        id:
            crypto.randomUUID(),

        nome,

        time,

        posicao,

        criado:
            new Date()
            .toISOString()

    };



    try {


        const resposta =
            await fetch(
                API_URL,
                {

                    method:"POST",

                    body:JSON.stringify({

                        tipo:"participant",

                        dados:jogador

                    })

                }
            );



        const resultado =
            await resposta.json();



        if(!resultado.sucesso){


            mostrarMensagem(
                resultado.erro
            );

            return;

        }



        localStorage.setItem(

            "familia_fc_player",

            JSON.stringify(jogador)

        );



        jogadorAtual =
            jogador;



        mostrarTela(
            "tela-espera"
        );


        carregarSala();



    } catch(error){


        console.error(error);


        mostrarMensagem(
            "Erro ao conectar servidor"
        );


    }


}

// ==============================
// SALA DE ESPERA
// ==============================

async function carregarSala() {


    try {


        const resposta =
            await fetch(
                API_URL +
                "?action=participants"
            );



        const participantes =
            await resposta.json();



        const listaVerde =
            document.getElementById(
                "lista-verde"
            );


        const listaVermelho =
            document.getElementById(
                "lista-vermelho"
            );



        if(listaVerde){

            listaVerde.innerHTML = "";

        }


        if(listaVermelho){

            listaVermelho.innerHTML = "";

        }




        participantes.forEach(p => {


            const item =
                document.createElement(
                    "li"
                );


            item.textContent =
                `${p.nome} (${p.posicao})`;



            if(
                p.time === "Verde"
            ){


                if(listaVerde){

                    listaVerde.appendChild(
                        item
                    );

                }


            } else {


                if(listaVermelho){

                    listaVermelho.appendChild(
                        item
                    );

                }

            }


        });





        const linha =
            participantes.filter(
                p =>
                p.posicao === "Linha"
            )
            .length;




        const goleiro =
            participantes.filter(
                p =>
                p.posicao === "Goleiro"
            )
            .length;






        const contadorLinha =
            document.getElementById(
                "contador-linha"
            );


        if(contadorLinha){

            contadorLinha.textContent =
                `${linha}/${LIMITE_LINHA}`;

        }





        const contadorGoleiro =
            document.getElementById(
                "contador-goleiro"
            );


        if(contadorGoleiro){

            contadorGoleiro.textContent =
                `${goleiro}/${LIMITE_GOLEIRO}`;

        }





        const aviso =
            document.getElementById(
                "aguardando-jogadores"
            );



        if(aviso){


            if(
                linha === LIMITE_LINHA &&
                goleiro === LIMITE_GOLEIRO
            ){


                aviso.textContent =
                    "✅ Elenco completo! Avaliações liberadas.";



            } else {



                aviso.textContent =
                    `Aguardando jogadores... ${linha}/${LIMITE_LINHA} linhas e ${goleiro}/${LIMITE_GOLEIRO} goleiros`;

            }


        }




    } catch(error){


        console.error(
            "Erro sala:",
            error
        );


    }


}





// ==============================
// BOTÃO JÁ JOGUEI
// ==============================

document
.getElementById("btn-jogar")
.addEventListener(
    "click",
    () => {


        mostrarTela(
            "tela-stats"
        );


    }
);




// ==============================
// SALVAR ESTATÍSTICAS
// ==============================

document
.getElementById(
    "btn-salvar-stats"
)
.addEventListener(
    "click",
    salvarEstatisticas
);





async function salvarEstatisticas(){


    const gols =
        Number(
            document
            .getElementById("gols")
            .value
        );



    const assistencias =
        Number(
            document
            .getElementById("assistencias")
            .value
        );



    const dados = {


        participant_id:
            jogadorAtual.id,


        gols,


        assistencias


    };



    try {



        const resposta =
            await fetch(
                API_URL,
                {

                    method:"POST",

                    body:JSON.stringify({

                        tipo:"stats",

                        dados

                    })

                }
            );



        const resultado =
            await resposta.json();




        if(resultado.sucesso){


            const completo =
                await verificarElencoCompleto();




            if(completo){


                /*iniciarAvaliacoes();


            } else {


                mostrarTela(
                    "tela-espera"
                );


                alert(
                    "Estatísticas salvas. Aguardando todos os jogadores entrarem."
                );*/
                if(resultado.sucesso){

    iniciarAvaliacoes();

} else {

    alert(resultado.erro);

}


            }



        } else {


            alert(
                resultado.erro
            );


        }



    } catch(error){


        console.error(error);


        alert(
            "Erro ao salvar estatísticas"
        );


    }


}

// ==============================
// INICIAR AVALIAÇÕES
// ==============================

async function iniciarAvaliacoes(){


    const resposta =
        await fetch(
            API_URL +
            "?action=participants"
        );



    const participantes =
        await resposta.json();




    filaAvaliacoes =
        participantes.filter(
            p =>
            p.id !== jogadorAtual.id
        );



    indiceAvaliacao = 0;



    mostrarTela(
        "tela-avaliacao"
    );



    mostrarProximoJogador();


}







// ==============================
// MOSTRAR JOGADOR PARA AVALIAR
// ==============================

function mostrarProximoJogador(){



    if(
        indiceAvaliacao >=
        filaAvaliacoes.length
    ){


        mostrarTela(
            "tela-final"
        );


        return;


    }





    const jogador =
        filaAvaliacoes[
            indiceAvaliacao
        ];




    const nomeAvaliado =
        document.getElementById(
            "nome-avaliado"
        );



    if(nomeAvaliado){

        nomeAvaliado.textContent =
            jogador.nome;

    }





    const container =
        document.getElementById(
            "qualidades"
        );



    if(!container){

        return;

    }



    container.innerHTML = "";




    const listaQualidades =
        jogador.posicao === "Goleiro"
        ? QUALIDADES_GOLEIRO
        : QUALIDADES_LINHA;




    let selecionadas = [];






    listaQualidades.forEach(qualidade => {



        const div =
            document.createElement(
                "div"
            );



        const checkbox =
            document.createElement(
                "input"
            );



        checkbox.type =
            "checkbox";



        checkbox.value =
            qualidade;




        const texto =
            document.createElement(
                "span"
            );



        texto.textContent =
            qualidade;





        checkbox.addEventListener(
            "change",
            () => {



                if(
                    checkbox.checked
                ){


                    if(
                        selecionadas.length >= 2
                    ){


                        checkbox.checked =
                            false;



                        alert(
                            "Escolha no máximo 2 qualidades"
                        );



                        return;


                    }



                    selecionadas.push(
                        qualidade
                    );



                } else {


                    selecionadas =
                        selecionadas.filter(
                            item =>
                            item !== qualidade
                        );


                }



            }
        );





        div.appendChild(
            checkbox
        );


        div.appendChild(
            texto
        );


        container.appendChild(
            div
        );



    });






    const botao =
        document.getElementById(
            "btn-enviar-avaliacao"
        );



    if(botao){



        botao.onclick = () => {



            const evolucao =
                listaQualidades.filter(
                    item =>
                    !selecionadas.includes(item)
                );





            salvarAvaliacao({

                evaluator_id:
                    jogadorAtual.id,


                evaluated_id:
                    jogador.id,


                qualidades:
                    selecionadas,


                evolucao


            });



        };


    }




}







// ==============================
// SALVAR AVALIAÇÃO
// ==============================

async function salvarAvaliacao(dados){



    try {



        const resposta =
            await fetch(
                API_URL,
                {

                    method:"POST",

                    body:JSON.stringify({

                        tipo:"evaluation",

                        dados

                    })

                }
            );



        const resultado =
            await resposta.json();





        if(resultado.sucesso){


            indiceAvaliacao++;


            mostrarProximoJogador();



        } else {



            alert(
                resultado.erro
            );



        }




    } catch(error){



        console.error(error);



        alert(
            "Erro ao salvar avaliação"
        );


    }


}







// ==============================
// VERIFICAR ELENCO COMPLETO
// ==============================

async function verificarElencoCompleto(){



    const resposta =
        await fetch(
            API_URL +
            "?action=participants"
        );



    const participantes =
        await resposta.json();




    const linhas =
        participantes.filter(
            p =>
            p.posicao === "Linha"
        )
        .length;



    const goleiros =
        participantes.filter(
            p =>
            p.posicao === "Goleiro"
        )
        .length;





    return (

        linhas === LIMITE_LINHA &&

        goleiros === LIMITE_GOLEIRO

    );


}






// ==============================
// MENSAGENS
// ==============================

function mostrarMensagem(texto){



    const campo =
        document.getElementById(
            "mensagem-cadastro"
        );



    if(campo){

        campo.textContent =
            texto;

    }


}
