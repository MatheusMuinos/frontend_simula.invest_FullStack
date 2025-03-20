function showRecipe(recipeType) {
    var contentElement = document.getElementById('recipeContent');
    var htmlContent = '';

    if (recipeType === 'Burrito') {
        htmlContent = '<h2>Receita de Burrito</h2>' +
                      '<img src="https://images.unsplash.com/photo-1562059390-a761a084768e?q=80&w=2019&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Delicioso Burrito" style="width:100%;max-width:600px;">' +
                      '<p>Descubra como fazer um delicioso burrito, um prato tradicional mexicano.</p>' +
                      '<h3>Ingredientes</h3>' +
                      '<ol>' +
                      '<li>Tortilhas de farinha de trigo</li>' +
                      '<li>Feijão refrito</li>' +
                      '<li>Carne moída ou frango desfiado</li>' +
                      '<li>Queijo ralado</li>' +
                      '<li>Alface picada</li>' +
                      '<li>Tomate picado</li>' +
                      '<li>Molho de sua escolha</li>' +
                      '<li>Creme de leite</li>' +
                      '</ol>' +
                      '<h3>Modo de Preparo</h3>' +
                      '<ol>' +
                      '<li>Aqueça as tortilhas para torná-las mais flexíveis.</li>' +
                      '<li>Espalhe uma camada de feijão refrito sobre cada tortilha.</li>' +
                      '<li>Adicione a carne ou frango por cima do feijão.</li>' +
                      '<li>Cubra com queijo, alface, tomate e molho.</li>' +
                      '<li>Dobre as laterais da tortilha e enrole firmemente.</li>' +
                      '<li>Grelhe o burrito em uma frigideira até que a tortilha esteja levemente crocante e o queijo derretido.</li>' +
                      '<li>Sirva quente com uma porção de creme de leite.</li>' +
                      '</ol>';
    } else if (recipeType === 'Pizza') {
        htmlContent = '<h2>Receita de Pizza</h2>' +
                      '<img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Pizza Caseira" style="width:100%;max-width:600px;">' +
                      '<p>Aprenda a fazer uma pizza caseira perfeita com ingredientes simples.</p>' +
                      '<h3>Ingredientes</h3>' +
                      '<ol>' +
                      '<li>2 xícaras de farinha de trigo</li>' +
                      '<li>1 colher de chá de fermento em pó</li>' +
                      '<li>1 colher de chá de sal</li>' +
                      '<li>3/4 xícara de água morna</li>' +
                      '<li>1 colher de sopa de azeite</li>' +
                      '<li>Molho de tomate</li>' +
                      '<li>Queijo mussarela ralado</li>' +
                      '<li>Ingredientes à escolha (pepperoni, cogumelos, cebolas, pimentões, azeitonas, etc.)</li>' +
                      '</ol>' +
                      '<h3>Modo de Preparo</h3>' +
                      '<ol>' +
                      '<li>Pré-aqueça o forno a 220°C.</li>' +
                      '<li>Em uma tigela, misture a farinha, o fermento, o sal, a água e o azeite até formar uma massa homogênea.</li>' +
                      '<li>Estenda a massa em uma superfície enfarinhada até formar um disco fino.</li>' +
                      '<li>Transfira a massa para uma forma de pizza.</li>' +
                      '<li>Espalhe o molho de tomate sobre a massa.</li>' +
                      '<li>Adicione o queijo e os ingredientes escolhidos.</li>' +
                      '<li>Asse por 15-20 minutos ou até que a borda esteja dourada e o queijo borbulhante.</li>' +
                      '</ol>';
    }

    contentElement.innerHTML = htmlContent;
}
