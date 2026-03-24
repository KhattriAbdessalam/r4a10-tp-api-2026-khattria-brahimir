// Le lien de l'API 
var urlApi = "https://ddragon.leagueoflegends.com/cdn/14.5.1/data/fr_FR/champion.json";

// Mon tableau global pour stocker les persos (plus simple pour y accéder partout)
var tabChampions = [];

window.onload = function() {
    fetch(urlApi)
        .then(function(reponse) {
            return reponse.json();
        })
        .then(function(leJson) {
            console.log("C'est bon on a les datas"); // Petit check au cas où ça crash
            
            // L'API de Riot renvoie un vieil objet bizarre, je le passe en tableau c'est plus simple à gérer
            tabChampions = Object.values(leJson.data);
            remplirLesSelects();
        })
        .catch(function(erreur) {
            // Si la co lâche
            alert("Gros bug avec l'API, regarde la console chef");
            console.error(erreur);
        });

    // Les clics sur les boutons
    document.getElementById("validerTeam").onclick = afficherEquipe;
    document.getElementById("btnFavoris").onclick = ajouterFavori;
    
    // Pour fermer la popup
    document.querySelector(".fermerModal").onclick = function() {
        document.getElementById("monModal").style.display = "none";
    }

    // On affiche les fav direct
    afficherFavoris();
};

function remplirLesSelects() {
    // Les tags pour filtrer les rôles d'après op.gg
    var filtreTop = ["Tank", "Fighter"];
    var filtreJng = ["Fighter", "Assassin"];
    var filtreMid = ["Mage", "Assassin"];
    var filtreAdc = ["Marksman"];
    var filtreSup = ["Support", "Tank"];

    // Je récupère tous mes select
    var sTop = document.getElementById("choix-top");
    var sJng = document.getElementById("choix-jng");
    var sMid = document.getElementById("choix-mid");
    var sAdc = document.getElementById("choix-adc");
    var sSup = document.getElementById("choix-sup");

    // J'ai fais de mon mieux
    for (var i = 0; i < tabChampions.length; i++) {
        var champ = tabChampions[i];
        
        // On check pour le Top
        for (var j = 0; j < champ.tags.length; j++) {
            if (filtreTop.includes(champ.tags[j])) {
                sTop.add(new Option(champ.name, champ.id));
                break;
            }
        }
        // Pareil pour Jng (c'est du copier/coller)
        for (var j = 0; j < champ.tags.length; j++) {
            if (filtreJng.includes(champ.tags[j])) {
                sJng.add(new Option(champ.name, champ.id));
                break;
            }
        }
        // Pareil pour Mid
        for (var j = 0; j < champ.tags.length; j++) {
            if (filtreMid.includes(champ.tags[j])) {
                sMid.add(new Option(champ.name, champ.id));
                break;
            }
        }
        // Pareil pour Adc
        for (var j = 0; j < champ.tags.length; j++) {
            if (filtreAdc.includes(champ.tags[j])) {
                sAdc.add(new Option(champ.name, champ.id));
                break;
            }
        }
        // Pareil pour Sup
        for (var j = 0; j < champ.tags.length; j++) {
            if (filtreSup.includes(champ.tags[j])) {
                sSup.add(new Option(champ.name, champ.id));
                break;
            }
        }
    }
}

function afficherEquipe() {
    var zone = document.getElementById("display-equipe");
    zone.innerHTML = "";
    
    var mesSelects = ["choix-top", "choix-jng", "choix-mid", "choix-adc", "choix-sup"];

     mesSelects.forEach(function(idSelect) {
        var val = document.getElementById(idSelect).value;
        
        // On vérifie que le gars a bien choisi un truc
        if (val !== "") {
            var leChampion = null;
            // Je cherche le bon champ dans le tableau
            for(var i=0; i < tabChampions.length; i++) {
                if(tabChampions[i].id === val) {
                    leChampion = tabChampions[i];
                    break;
                }
            }

            if (leChampion) {
                // Construction du HTML à l'ancienne avec des + partout
                var htmlCarte = '<div class="carte-du-champ" onclick="ouvrirModal(\''+leChampion.id+'\')">';
                htmlCarte += '<img src="https://ddragon.leagueoflegends.com/cdn/14.5.1/img/champion/'+leChampion.id+'.png" alt="'+leChampion.name+'">';
                htmlCarte += '<p>'+leChampion.name+'</p>';
                htmlCarte += '</div>';
                
                zone.innerHTML += htmlCarte;
            }
        }
    });
}

function ouvrirModal(idChamp) {
    // Je refais un fetch pour le lore et les stats...
    fetch("https://ddragon.leagueoflegends.com/cdn/14.5.1/data/fr_FR/champion/"+idChamp+".json")
        .then(function(r){ return r.json(); })
        .then(function(data){
            var c = data.data[idChamp]; 
            var zoneContenu = document.getElementById("contenuModal");

            // Bricolage du HTML de la modale (je sais c'est moche désolé)
            var textHtml = '<div class="header-image-modal">';
            textHtml += '<img src="https://ddragon.leagueoflegends.com/cdn/img/champion/splash/'+c.id+'_0.jpg" alt="Splash art">';
            textHtml += '</div>';
            textHtml += '<div class="infos-modal">';
            textHtml += '<h2>'+c.name+'</h2>';
            textHtml += '<i>'+c.title+'</i><br><br>';
            textHtml += '<b>Tags:</b> '+c.tags.join(' - ') + '<br><br>';
            textHtml += '<h3>Histoire</h3><p>'+c.lore+'</p>';
            textHtml += '<ul>';
            textHtml += '<li>Attaque: '+c.info.attack+'/10</li>';
            textHtml += '<li>Magie: '+c.info.magic+'/10</li>';
            textHtml += '<li>Défense: '+c.info.defense+'/10</li>';
            textHtml += '</ul>';
            textHtml += '</div>';

            zoneContenu.innerHTML = textHtml;
            document.getElementById("monModal").style.display = "flex";
        });
}


function ajouterFavori() {
    var t = document.getElementById("choix-top").value;
    var j = document.getElementById("choix-jng").value;
    var m = document.getElementById("choix-mid").value;
    var a = document.getElementById("choix-adc").value;
    var s = document.getElementById("choix-sup").value;

    // je check si ya des trous
    if(t == "" || j == "" || m == "" || a == "" || s == "") {
        alert("Gros, il manque des champions ! Remplis tous les rôles d'abord.");
        return;
    }

    var nom = prompt("C'est quoi le petit nom de cette compo ?");
    if (nom == null || nom == "") {
        return;
    }

    var monFav = {
        nomTeam: nom,
        dateAjout: new Date().toLocaleDateString(),
        champs: [t, j, m, a, s]
    };

    // on parse sinon c'est pas beau
    var favs = localStorage.getItem("mesFavorisLoL");
    var tableauFavs = [];
    if (favs != null) {
        tableauFavs = JSON.parse(favs); 
    }

    // On push et on re-transforme en texte 
    tableauFavs.push(monFav);
    localStorage.setItem("mesFavorisLoL", JSON.stringify(tableauFavs));
    
    //màj de l'affichage direct
    afficherFavoris();
}

function afficherFavoris() {
    var zone = document.getElementById("zone-favoris");
    var favs = localStorage.getItem("mesFavorisLoL");
    
    //Si y'a r en mémoire
    if (favs == null || JSON.parse(favs).length === 0) {
        zone.innerHTML = "<h3 class='titre-fav'>Mes Compos Favorites ⭐</h3><p style='color: #a09b8c;'>Aucun favori pour le moment. Fais une team et clique sur l'étoile !</p>";
        return;
    }

    var tableauFavs = JSON.parse(favs);
    var html = "<h3 class='titre-fav'>Mes Compos Favorites ⭐</h3>";

    //On boucle pour afficher toutes les teams save
    for (var i = 0; i < tableauFavs.length; i++) {
        var f = tableauFavs[i];
        html += '<div class="item-fav">';
        html += '<div class="infos-fav">';
        html += '<b style="color: #f0e6d2; font-size: 1.1em;">'+f.nomTeam+'</b> <small>('+f.dateAjout+')</small><br>';
        html += '<span style="color: #0ac8b9;">'+f.champs.join(' - ')+'</span>';
        html += '</div>';
        html += '<button class="btn-suppr" onclick="retirerFavori('+i+')">Retirer</button>';
        html += '</div>';
    }
    
    zone.innerHTML = html;
}

function retirerFavori(index) {
    if(confirm("T'es sûr de vouloir virer cette compo de tes favoris ?")) {
        var tableauFavs = JSON.parse(localStorage.getItem("mesFavorisLoL"));
        
        tableauFavs.splice(index, 1); 
        
        // On ecrase l'ancienne save avec le tableau mis à jour
        localStorage.setItem("mesFavorisLoL", JSON.stringify(tableauFavs));
        
        afficherFavoris();
    }
}