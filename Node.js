var express = require("express");
var bodyParser = require("body-parser");
var mysql = require("mysql");

var serv = express();
serv.use(bodyParser.urlencoded({ extended: false }));

const connexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'uber'
});

connexion.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

function date() {
    var date = new Date();
    var d = "";
    d += date.getFullYear() + "-";
    if (date.getMonth() < 9)
        d += "0" + (date.getMonth()+1);
    else
        d += (date.getMonth()+1);
    d += "-" + date.getDate();
    return d;
}

function heure() {
    var date = new Date();
    return date.getHours()+":"+date.getMinutes();
}

serv.set('view engine', 'ejs');

serv.get("/", function(req, res) {
    date();
    res.render("connexion.ejs", {err_client : "", pseudo_cl : "",err_chauffeur : "", pseudo_ch : ""});
});

serv.post("/client", function (req, res) {
    if (req.body.id == null) {
        connexion.query("SELECT id,nom,prenom FROM client WHERE pseudo = '" + req.body.pseudo + "' AND mdp = '" + req.body.mdp + "'",
        function(err, result, fieds) {
            if (err) {
                console.log(err);
            }
            else if (result.length == 0) {
                res.render("connexion.ejs", {err_client : "Vous avez rentrez un mauvais pseudo ou mot de passe. Veuillez réessayer.", pseudo_cl : req.body.pseudo, err_chauffeur : "", pseudo_ch : ""})
            }
            else if (result.length > 0) {
                connexion.query("SELECT adresse_d, adresse_a, edlc, id_chauffeur FROM course WHERE id_client = '" + result[0].id + "' AND edlc != '3'", 
                function (err2, result2, fields2) {
                    if (err2) {
                        console.log(err2);
                    }
                    else if (result2.length == 0){
                        res.render("accueil_client.ejs", {id : result[0].id, nom : result[0].nom, prenom : result[0].prenom});
                    }
                    else if (result2.length > 0){
                        connexion.query("SELECT nom,prenom FROM chauffeur WHERE id = '" + result2[0].id_chauffeur + "'", 
                            function (err3, result3, fields3) {
                                var text = "Votre chauffeur s'appelle " + result3[0].prenom + " " + result3[0].nom + ". Il va bientôt arriver. Preparez vous !";
                                res.render("course_client.ejs" , {id :  result[0].id, texte : text, depart : result2[0].adresse_d, arrive : result2[0].adresse_a});
                        });
                    }
                });
            }
        });
    }
    else {
        connexion.query("SELECT id,nom,prenom FROM client WHERE id = '" + req.body.id + "'",
        function(err, result, fieds) {
            if (err) {
                console.log(err);
            }
            else {
                res.render("accueil_client.ejs", {id : result[0].id, nom : result[0].nom, prenom : result[0].prenom});
            }
        });
    }
});

serv.get("/inscription/client", function (req, res) {
    var d = date();
    res.render("inscri_client.ejs", {nom : "", prenom : "", date : d, err : "", date_v : "", pseudo : ""});
});

serv.post("/inscription/client", function(req, res) {
    if (req.body.mdp == req.body.cMDP) {
        connexion.query("INSERT INTO client(Nom, Prenom, DDN, Pseudo, MDP) VALUES('"
            + req.body.nom + "', '" + req.body.prenom + "', '" + req.body.aujourd + "', '" + req.body.pseudo + "', '" + req.body.mdp +"')",

            function(err, result, fields) {
            if (err) {
                var d = date();
                res.render("inscri_client.ejs", {nom : req.body.nom, prenom : req.body.prenom, date : d, date_v : req.body.aujourd, pseudo : "", err : "Le pseudo que vous venez d'entrer est déjà utiliser !"})
            }
            else{
                res.render("inscri_reussi.ejs", {type : "client"});
            }
        });
    }
    else {
        var d = date();
        res.render("inscri_client.ejs", {nom : req.body.nom, prenom : req.body.prenom, date : d, date_v : req.body.aujourd, pseudo : req.body.pseudo, err : "Les mots de passe ne corresepondent pas !"});
    }
});

serv.post("/client/course", function(req, res) {
    if (req.body.creation == "true") {
        var t = false;
        connexion.query("SELECT chauffeur.id,nom,prenom FROM chauffeur WHERE chauffeur.occupe = '0' AND TDV = '" + req.body.voiture + "'",
        function(err, result, fields) {
            if (err) {
                console.log(err);
            }
            else if(result.length == 0) {
                res.render("pas_chauffeur.ejs", {id : req.body.id});
            }
            else {
                connexion.query("INSERT INTO course(adresse_d, adresse_a, date, heure, id_client, id_chauffeur, edlc) VALUES ('"
                + req.body.adresse_d + " " + req.body.code + " " + req.body.ville + "', '" + req.body.adresse_a + "', '" + date() + "', '" + heure() + "', '" + req.body.id + "', '" + result[0].id + "', '0')");
                connexion.query("UPDATE chauffeur set occupe = '1' where id = '" + result[0].id + "'");
                var text = "Votre chauffeur s'appelle " + result[0].prenom + " " + result[0].nom + ". Il va bientôt arriver. Preparez vous !";
                res.render("course_client.ejs" , {id : req.body.id, texte : text, depart : req.body.adresse_d + " " + req.body.code + " " + req.body.ville, arrive : req.body.adresse_a});
            }
        });
    }
    else {
        connexion.query("SELECT adresse_d, adresse_a, edlc, id_chauffeur FROM course WHERE id_client = '" + req.body.id + "'",
        function(err, result, fields) {
            if (err) {
                console.log(err);
            }
            else {
                connexion.query("SELECT nom, prenom FROM chauffeur WHERE id  = '" + result[0].id_chauffeur + "'", function (err2, result2, fields2) {
                    if (result[0].edlc == 0) {
                        var text = "Votre chauffeur s'appelle " + result2[0].prenom + " " + result2[0].nom + ". Votre chauffeur va bientôt arriver. Preparez vous !";
                        res.render("course_client.ejs", {id : req.body.id, texte : text, depart : result[0].adresse_d, arrive : result[0].adresse_a});
                    }
                    else if (result[0].edlc == 1) {
                        var text = "Votre chauffeur s'appelle " + result2[0].prenom + " " + result2[0].nom + ". Votre chauffeur se trouve à l'adresse de départ. Montez dans la voiture !";
                        res.render("course_client.ejs", {id : req.body.id, texte : text, depart : result[0].adresse_d, arrive : result[0].adresse_a});
                    }
                    else if (result[0].edlc == 2) {
                        var text = "Votre chauffeur s'appelle " + result2[0].prenom + " " + result2[0].nom + ". Vous êtes actuellement dans la voiture. Vous êtes en route !";
                        res.render("course_client.ejs", {id : req.body.id, texte : text, depart : result[0].adresse_d, arrive : result[0].adresse_a});
                    }
                    else if (result[0].edlc == 3) {
                        var text = "Votre chauffeur s'appelle " + result2[0].prenom + " " + result2[0].nom + ". Vous êtes arrivez ! Merci d'avoir utilisé notre service !";
                        res.render("fin_course_client.ejs", {id : req.body.id, texte : text, depart : result[0].adresse_d, arrive : result[0].adresse_a});
                    }
                });
            }
        });
    }
});

serv.post("/client/profile", function (req, res) {
    if (req.body.nom == null) {
        connexion.query("SELECT nom,prenom,DAY(DDN) AS jour, MONTH(DDN) AS mois, YEAR(DDN) AS annee,pseudo FROM client WHERE id = '" + req.body.id + "'", function(err, result, fields) {
            var d = result[0].annee;
            if (result[0].mois < 10)
                d += "-0" + result[0].mois +"-";
            else
                d += "-" + result[0].mois +"-";
            if (result[0].jour < 10)
                d += "0" + result[0].jour;
            else
                d += result[0].jour;
            res.render("profile_client.ejs", {id : req.body.id, err : "", nom : result[0].nom, prenom : result[0].prenom, date_v : d, date : date(), pseudo : result[0].pseudo});
        });
    }
    else {
        if (req.body.mdp.length != 0) {
            if (req.body.mdp != req.body.cMDP) {
                res.render("profile_client.ejs", {id : req.body.id, err : "Les mots de passe ne correspondent pas ! Veuillez réessayer ! (Les modifications n'ont pas encore été effectué)", nom : req.body.nom, prenom : req.body.prenom, date_v : req.body.aujourd, date : date(), pseudo : req.body.pseudo});
            }
            else {
                connexion.query("UPDATE client SET nom = '" + req.body.nom + "', prenom = '" + req.body.prenom + "', DDN = '" + req.body.aujourd + "', pseudo = '" + req.body.pseudo + "', MDP = '" + req.body.mdp + "' WHERE id = '" + req.body.id +"'",
                function (err, result, fields) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        res.render("profile_client.ejs", {id : req.body.id, err : "Vos changements ont bien été modifié !", nom : req.body.nom, prenom : req.body.prenom, date_v : req.body.aujourd, date : date(), pseudo : req.body.pseudo});
                    }
                });
            }
        }
        else {
            connexion.query("UPDATE client SET nom = '" + req.body.nom + "', prenom = '" + req.body.prenom + "', DDN = '" + req.body.aujourd + "', pseudo = '" + req.body.pseudo + "' WHERE id = '" + req.body.id +"'",
            function (err, result, fields) {
                if (err) {
                    console.log(err);
                }
                else {
                    res.render("profile_client.ejs", {id : req.body.id, err : "Vos changements ont bien été modifié !", nom : req.body.nom, prenom : req.body.prenom, date_v : req.body.aujourd, date : date(), pseudo : req.body.pseudo});
                }
            });
        }
    }
});



serv.post("/chauffeur", function (req, res) {
    if (req.body.id == null) {
        connexion.query("SELECT id,nom,prenom,occupe FROM chauffeur WHERE pseudo = '" + req.body.pseudo + "' AND mdp = '" + req.body.mdp + "'",
        function(err, result, fieds) {
            if (err) {
                console.log(err);
            }
            else if (result.length == 0) {
                res.render("connexion.ejs", {err_client : "", pseudo_cl : "", err_chauffeur : "Vous avez rentrez un mauvais pseudo ou mot de passe. Veuillez réessayer.", pseudo_ch : req.body.pseudo})
            }
            else {
                if (result[0].occupe == 0)
                    res.render("pas_course_chauffeur.ejs", {id : result[0].id, nom : result[0].nom, prenom : result[0].prenom});
                else {
                    res.render("debut_course_chauffeur.ejs", {id : result[0].id, nom : result[0].nom, prenom : result[0].prenom});
                }
            }
        });
    }
    else {
        connexion.query("SELECT id,nom,prenom,occupe FROM chauffeur WHERE id = '" + req.body.id + "'",
        function(err, result, fieds) {
            if (err) {
                console.log(err);
            }
            else {
                if (result[0].occupe == 0)
                    res.render("pas_course_chauffeur.ejs", {id : result[0].id, nom : result[0].nom, prenom : result[0].prenom});
                else {
                    res.render("debut_course_chauffeur.ejs", {id : result[0].id, nom : result[0].nom, prenom : result[0].prenom});
                }
            }
        });
    }
});

serv.post("/chauffeur/course", function (req, res) {
    if (req.body.edlc != null) {
        connexion.query("UPDATE course SET edlc = '" + req.body.edlc + "' WHERE id_chauffeur = '" + req.body.id +"'");
        if (req.body.edlc == 3) {
            connexion.query("UPDATE chauffeur SET occupe = '0' WHERE id = '" + req.body.id +"'");
        }
    }
    connexion.query("SELECT adresse_d,adresse_a,id_client,edlc FROM course WHERE id_chauffeur = '" + req.body.id + "' ORDER BY ID DESC LIMIT 1",
    function(err, result, fields) {
        if (err) {
            console.log(err);
        }
        else {
            connexion.query("SELECT nom,prenom FROM client WHERE id = '" + result[0].id_client +"'",
            function (err2, result2, fields2) {
                if (err2) {
                    console.log(err2);
                }
                else {
                    if (result[0].edlc == 0) {
                        res.render("etape_chauffeur_v0.ejs", {id : req.body.id, nom_c : result2[0].nom, prenom_c : result2[0].prenom, ad : result[0].adresse_d, aa : result[0].adresse_a});
                    }
                    else if (result[0].edlc == 1) {
                        res.render("etape_chauffeur_v1.ejs", {id : req.body.id, nom_c : result2[0].nom, prenom_c : result2[0].prenom, ad : result[0].adresse_d, aa : result[0].adresse_a});
                    }
                    else if (result[0].edlc == 2) {
                        res.render("etape_chauffeur_v2.ejs", {id : req.body.id, nom_c : result2[0].nom, prenom_c : result2[0].prenom, ad : result[0].adresse_d, aa : result[0].adresse_a});
                    }
                    else if (result[0].edlc == 3) {
                        res.render("etape_chauffeur_v3.ejs", {id : req.body.id});
                    }
                }
            });
        }
    });
});

serv.get("/inscription/chauffeur", function (req, res) {
    var d = date();
    res.render("inscri_chauffeur.ejs", {nom : "", prenom : "", date : d, err : "", date_v : "", pseudo : ""});
});


serv.post("/inscription/chauffeur", function(req, res) {
    if (req.body.mdp == req.body.cMDP) {
        connexion.query("INSERT INTO chauffeur(Nom, Prenom, DDN, Pseudo, MDP, TDV, Occupe) VALUES('"
            + req.body.nom + "', '" + req.body.prenom + "', '" + req.body.aujourd + "', '" + req.body.pseudo + "', '" + req.body.mdp + "', '" + req.body.voiture[0] + "', '" + 0 +"')",
            function(err, result, fields) {
            if (err) {
                console.log(err);
                var d = date();
                res.render("inscri_chauffeur.ejs", {nom : req.body.nom, prenom : req.body.prenom, date : d, date_v : req.body.aujourd, pseudo : "", err : "Le pseudo que vous venez d'entrer est déjà utiliser !"})
            }
            else{
                res.render("inscri_reussi.ejs", {type : "chauffeur"});
            }
        });
    }
    else {
        var d = date();
        res.render("inscri_chauffeur.ejs", {nom : req.body.nom, prenom : req.body.prenom, date : d, date_v : req.body.aujourd, pseudo : req.body.pseudo, err : "Les mots de passe ne corresepondent pas !"});
    }
});

serv.post("/chauffeur/profile", function (req, res) {
    if (req.body.nom == null) {
        connexion.query("SELECT nom, prenom,DAY(DDN) AS jour, MONTH(DDN) AS mois, YEAR(DDN) AS annee, pseudo, TDV FROM chauffeur WHERE id = '" + req.body.id + "'",
        function (err, result, fields) {
            if (err) {
                console.log(err);
            }
            else {
                var d = result[0].annee;
                if (result[0].mois < 10)
                    d += "-0" + result[0].mois + "-";
                else
                    d += "-" + result[0].mois + "-";
                 if (result[0].jour < 10)
                    d += "0" + result[0].jour;
                else
                    d += result[0].jour;
                var v1 = "";
                var v2 = "";
                var v3 = "";
                if (result[0].TDV == 1)
                    v1 = "checked";
                else if (result[0].TDV == 2)
                    v2 = "checked";
                else
                    v3 = "checked";
                res.render("profile_chauffeur.ejs", {id : req.body.id, err : "", nom : result[0].nom, prenom : result[0].prenom, date_v : d, date : date(), pseudo : result[0].pseudo, v1 : v1, v2 : v2, v3 : v3});
            }
        });
    }
    else {
        if (req.body.mdp.length != 0) {
            if (req.body.mdp != req.body.cMDP) {
                var v1 = "";
                var v2 = "";
                var v3 = "";
                if (req.body.voiture == 1) {
                    v1 = "checked";
                }
                else if (req.body.voiture == 2)
                    v2 = "checked";
                else if (req.body.voiture == 3)
                    v3 = "checked";
                res.render("profile_chauffeur.ejs", {id : req.body.id, err : "Les mots de passe ne correspondent pas ! Veuillez réessayer ! (Les modifications n'ont pas encore été effectué)", nom : req.body.nom, prenom : req.body.prenom, date_v : req.body.aujourd, date : date(), pseudo : req.body.pseudo, v1 : v1, v2 : v2, v3 : v3});
            }
            else {
                connexion.query("UPDATE chauffeur SET nom = '" + req.body.nom + "', prenom = '" + req.body.prenom +"', DDN = '" + req.body.aujourd + "', pseudo = '" + req.body.pseudo + "', MDP = '" + req.body.mdp + "', TDV = '" + req.body.voiture + "' WHERE id = '" + req.body.id + "'",
                function(err, result,fields){
                    if (err) {
                        console.log(err);
                    }
                    else {
                        var v1 = "";
                        var v2 = "";
                        var v3 = "";
                        if (req.body.voiture == 1) {
                            v1 = "checked";
                        }
                        else if (req.body.voiture == 2)
                            v2 = "checked";
                        else if (req.body.voiture == 3)
                            v3 = "checked";
                        res.render("profile_chauffeur.ejs", {id : req.body.id, err : "Vos changements ont bien été modifié !", nom : req.body.nom, prenom : req.body.prenom, date_v : req.body.aujourd, date : date(), pseudo : req.body.pseudo, v1 : v1, v2 : v2, v3 : v3});
                    }
                });
            }
        }
        else {
            connexion.query("UPDATE chauffeur SET nom = '" + req.body.nom + "', prenom = '" + req.body.prenom +"', DDN = '" + req.body.aujourd + "', pseudo = '" + req.body.pseudo + "', TDV = '" + req.body.voiture + "' WHERE id = '" + req.body.id + "'",
                function(err, result,fields){
                    if (err) {
                        console.log(err);
                    }
                    else {
                        var v1 = "";
                        var v2 = "";
                        var v3 = "";
                        if (req.body.voiture == 1) {
                            v1 = "checked";
                        }
                        else if (req.body.voiture == 2)
                            v2 = "checked";
                        else if (req.body.voiture == 3)
                            v3 = "checked";
                        res.render("profile_chauffeur.ejs", {id : req.body.id, err : "Vos changements ont bien été modifié !", nom : req.body.nom, prenom : req.body.prenom, date_v : req.body.aujourd, date : date(), pseudo : req.body.pseudo, v1 : v1, v2 : v2, v3 : v3});
                    }
                });
        }
    }
});

serv.listen(8080);