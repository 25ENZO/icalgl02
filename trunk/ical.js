var fs        = require('fs');
var myArgs    = process.argv.slice(1);
var readline  = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var argumentEntree;
var fichiersEntree;

// creer la chaine de caractere du début de l'evenement
function heureDebut(date,heure,minute){
  var chaineFin   = "";
  var chaineDebut = "";
  if (heure <10) {
    chaineDebut ='T0';
  }
  else {
    chaineDebut ='T';
  }
  if (minute==0) {
    chaineFin = "000";
  }
  else {
    chaineFin = "00";
  }
  debut = date+chaineDebut+heure+minute+chaineFin;
  return debut;
}

// creer la chaien de caractere de la fin de l'evenement
function heureFin(date,heure,minute,duree){
  if ( ((minute+duree)%60) == 0) {
    heure++;
    minute = 0;
  }
  else {
    minute = minute+duree;
  }
  fin = heureDebut(date,heure,minute);
  return fin;
}

// cree une liste contenant tours les evenements du jour 
function creerEvenements(jour, dateJour, n, debut, heure, minute, date, duree, listeEvenements) {
  // parcourir jour
  for (i=0 ; i<jour.length ; i++) {
      // si non vide
      if (jour[i] != "vide" && jour[i] != "") {
        duree = 30;
        n++;
        //on teste si i est pair
        if (i%2 == 0){
          heure   = i/2+8;
          minute  = 0;
        }
        else {
          heure   = Math.ceil(i/2)+7; //ceil renvoie l'entier superieur
          minute  = 30;
        }

        debut = heureDebut(date,heure,minute);
        fin   = heureFin(date,heure,minute,duree);

        // crée un evenement n
        eval('var evenement' + n + ' = { duree:duree, num:n, DTSTART:debut, DTEND:fin, SUMMARY:jour[i] };');
        // tant que l'evenement continue, on ajoute 30mn
        
        while (jour[i+1] == jour [i]) {
          duree+=30;
          eval('evenement'+n+'.duree+=30;');
          fin = heureFin(date,heure,minute,duree);
          i++; // on itere comme on a deja vu la valeur     
          eval('evenement'+n+'.DTEND=fin;');
        }

        listeEvenements.push(eval('evenement'+n));
      }
    }
    return listeEvenements;
  }

// Parcours les evenements du jour et recupere les donnees
function parcourirJour (jour, dateJour) {
  var n               = 0;
  var debut           = 0;
  var heure           = 0;
  var minute          = 0;
  var date            = dateJour;
  var duree           = 0;
  var listeEvenements = [];

  listeEvenements = creerEvenements(jour, dateJour, n, debut, heure, minute, date, duree, listeEvenements);

  ecrireListe(listeEvenements);
}

// Mets dans un tableau tous les evenements du jour
function tableauEvenementsJour (jour, x){
  for (i=x ; i<input.length ; i=i+7) {
    jour.push(input[i]);
  }
}

// Tous les évènements du lundi
function faireSemaine(input) {  	
  var lundi     = [];
  var mardi     = [];
  var mercredi  = [];
  var jeudi     = [];
  var vendredi  = [];
  var samedi    = [];
  var dimanche  = [];

  var dateLundi     = input[0]; 
  var dateMardi     = input[1];
  var dateMercredi  = input[2];
  var dateJeudi     = input[3];
  var dateVendredi  = input[4];
  var dateSamedi    = input[5];
  var dateDimanche  = input[6];
  
  // on obtient un tableau par jour avec ses evenements
  tableauEvenementsJour(lundi,7);
  tableauEvenementsJour(mardi,8);
  tableauEvenementsJour(mercredi,9);
  tableauEvenementsJour(jeudi,10);
  tableauEvenementsJour(vendredi,11);
  tableauEvenementsJour(samedi,12);
  tableauEvenementsJour(dimanche,13);

  ecrireDebut();

  parcourirJour(lundi,dateLundi);
  parcourirJour(mardi,dateMardi);
  parcourirJour(mercredi,dateMercredi);
  parcourirJour(jeudi,dateJeudi);
  parcourirJour(vendredi,dateVendredi);
  parcourirJour(samedi,dateSamedi);
  parcourirJour(dimanche,dateDimanche);

  ecrireFin();

}

// Extrais tous les evenements du fichier CSV
function imprimer (data) {
  var reg = new RegExp("[;\n\r]+","g");//tous les caractères ";" suivis ou non d'un retour ligne
  input   = data.split(reg);	

  faireSemaine(input);


}

// Ecris le debut du fichier iCal
function ecrireDebut() {
  fs.appendFileSync(argumentEntree+'.ics',
    "BEGIN:VCALENDAR\n"+ 
    "VERSION:2.0\n"+
    "CALSCALE:GREGORIAN\n");
}

// Ecris la fin du fichier iCal
function ecrireFin() {
  fs.appendFileSync(argumentEntree+'.ics',
    "END:VCALENDAR");
	
	console.log("\n\n\n\n------------ GENERATION ICAL REUSSIE ------------\n\n\n\n");
    fermer();
}

// Ecris l'ensemble des evenements dans le fichier iCal
function ecrireListe(data) {
  for(var i= 0; i < data.length; i++)
  {
    fs.appendFileSync(argumentEntree+'.ics',
      "BEGIN:VEVENT\n"+
      "DTSTART:"+data[i].DTSTART+"\n"+
      "DTEND:"+data[i].DTEND+"\n"+
      "DESCRIPTION:"+data[i].SUMMARY+"\n"+
      "SUMMARY:"+data[i].SUMMARY+"\n"+
      "END:VEVENT\n");
  }
}

// Lit le fichier passe en argument dans la console
function lire (nom,nb) {
	if (nom.match(/\w+\.\w+ \w+\.\w+/)) {
		files = nom.split(" ");
		files[0] = files[0].substr(0,files[0].length-4);
		files[1] = files[1].substr(0,files[1].length-4);
		fs.readFile(files[0]+".ics", "utf8", function(err, data1) {
			if (err) {
				return console.log(err);
			}
			fs.readFile(files[1]+".ics", "utf8", function(err, data2) {
				if (err) {
					return console.log(err);
				}
				switch (nb) {
					case 3: union(data1, data2);
					break;
					case 4: intersection(data1, data2);
					break;
				}
			});
		});
	}
    else {
		fs.readFile(nom, 'utf8', function (err,data) {
		if (err) {
			return console.log(err);
		}
		switch(nb) {
			case 1: imprimer(data);
			break;
			case 2: DetectIntervenant(data);
			break;
		}
    });
  }
}

  function fermer(){
    rl.close();
}
  
// Permet l'intersection de deux plannings
function intersection(planning1, planning2) {
	var dateDebut1 = planning1.match(/DTSTART:\d{8}T\d{6}/g);
	var dateFin1 = planning1.match(/DTEND:\d{8}T\d{6}/g);
	var description1 = planning1.match(/DESCRIPTION:[\d\w .'àéèêîù\(\)]+/g);
	var summary1 = planning1.match(/SUMMARY:[\d\w .'àéèêîù\(\)]+/g);
	
	var dateDebut2 = planning2.match(/DTSTART:\d{8}T\d{6}/g);
	var dateFin2 = planning2.match(/DTEND:\d{8}T\d{6}/g);
	var description2 = planning2.match(/DESCRIPTION:[\d\w .'àéèêîù\(\)]+/g);
	var summary2 = planning2.match(/SUMMARY:[\d\w .'àéèêîù\(\)]+/g);
	
	diviserDemiHeures(dateDebut1, dateFin1, description1, summary1);
	diviserDemiHeures(dateDebut2, dateFin2, description2, summary2);
	
	for (var i=0 ; i<dateDebut2.length ; i++) {
		for (var j=0 ; j<dateDebut1.length ; j++) {
			if (dateDebut2[i] == dateDebut1[j]) {
				description1[j] = description1[j] + " ; " + description2[i].substr(12);
				summary1[j] = summary1[j] + " ; " + summary2[i].substr(8);
				dateDebut2.splice(i,1);
				dateFin2.splice(i,1);
				description2.splice(i,1);
				summary2.splice(i,1);
			}
		}
	}
	
	argumentEntree = files[0] + "_inter_" + files[1];
	
	ecrireDebut();
	ecrireEvents(dateDebut1, dateFin1, description1, summary1, "intersection");
	ecrireFin();
}

// Permet l'union de deux plannings
function union(planning1, planning2) {
	var dateDebut1 = planning1.match(/DTSTART:\d{8}T\d{6}/g);
	var dateFin1 = planning1.match(/DTEND:\d{8}T\d{6}/g);
	var description1 = planning1.match(/DESCRIPTION:[\d\w .'àéèêîù\(\)]+/g);
	var summary1 = planning1.match(/SUMMARY:[\d\w .'àéèêîù\(\)]+/g);
	
	var dateDebut2 = planning2.match(/DTSTART:\d{8}T\d{6}/g);
	var dateFin2 = planning2.match(/DTEND:\d{8}T\d{6}/g);
	var description2 = planning2.match(/DESCRIPTION:[\d\w .'àéèêîù\(\)]+/g);
	var summary2 = planning2.match(/SUMMARY:[\d\w .'àéèêîù\(\)]+/g);
	
	diviserDemiHeures(dateDebut1, dateFin1, description1, summary1);
	diviserDemiHeures(dateDebut2, dateFin2, description2, summary2);
	
	for (var i=0 ; i<dateDebut2.length ; i++) {
		for (var j=0 ; j<dateDebut1.length ; j++) {
			if (dateDebut2[i] == dateDebut1[j]) {
				description1[j] = description1[j] + " ; " + description2[i].substr(12);
				summary1[j] = summary1[j] + " ; " + summary2[i].substr(8);
				dateDebut2.splice(i,1);
				dateFin2.splice(i,1);
				description2.splice(i,1);
				summary2.splice(i,1);
			}
		}
	}
	
	argumentEntree = files[0] + "_union_" + files[1];
	
	ecrireDebut();
	ecrireEvents(dateDebut1, dateFin1, description1, summary1, "union");
	ecrireEvents(dateDebut2, dateFin2, description2, summary2, "union");
	ecrireFin();
}

// Permet d'écrire les événements relatifs à l'union ou l'intersection dans un fichier
function ecrireEvents(dateDebut, dateFin, description, summary, type) {
	if (type == "intersection") {
		for (var i=0 ; i<dateDebut.length ; i++) {
			if (description[i].match(/DESCRIPTION:[\d\w .'àéèêîù\(\)]+ ; [\d\w .'àéèêîù\(\)]+/)) {
				fs.appendFileSync(argumentEntree + ".ics",
					"BEGIN:VEVENT\n"+
					dateDebut[i]+"\n"+
					dateFin[i]+"\n"+
					description[i]+"\n"+
					summary[i]+"\n"+
					"END:VEVENT\n");
			}
		}
	}
	
	else for (var i=0 ; i<dateDebut.length ; i++) {
		fs.appendFileSync(argumentEntree + ".ics",
			"BEGIN:VEVENT\n"+
			dateDebut[i]+"\n"+
			dateFin[i]+"\n"+
			description[i]+"\n"+
			summary[i]+"\n"+
			"END:VEVENT\n");
	}
}

// Permet de diviser un planning en cases de 30 minutes
function diviserDemiHeures(dateDebut, dateFin, description, summary) {
	var newDateDebut = "";
	var newDateFin = "";
	for (var i=0 ; i<dateDebut.length ; i++) {
		var nbSegments = nombreSegments(dateDebut[i], dateFin[i]);
		if (nbSegments > 1) {
			dateFin[i] = ajouter30Minutes(dateFin[i].substr(0, dateFin[i].length-6) + dateDebut[i].substr(dateDebut[i].length-6,6));
			newDateDebut = dateDebut[i];
			newDateFin = dateFin[i];
			for (j = 1 ; j<nbSegments ; j++) {
				newDateDebut = ajouter30Minutes(newDateDebut);
				newDateFin = ajouter30Minutes(newDateFin);
				dateDebut.push(newDateDebut);
				dateFin.push(newDateFin);
				description.push(description[i]);
				summary.push(summary[i]);
			}
		}
	}
}

// Permet d'ajouter 30 minutes à un horaire sous format DTBEGIN ou DTEND
function ajouter30Minutes(horaire) {
	var heures = horaire.substr(horaire.length-6, 2);
	var minutes = horaire.substr(horaire.length-4, 2);
	if (minutes == "30") {
		heures = (parseInt(heures)+1).toString();
		heures.length < 2 ? heures = "0" + heures : heures;
		minutes = ((parseInt(minutes)+30)%60).toString();
		minutes.length < 2 ? minutes = "0" + minutes : minutes;
		return horaire.substr(0,horaire.length-6) + heures + minutes + horaire.substr(horaire.length-2, 2);
	}
	else {
		heures.length < 2 ? heures = "0" + heures : heures;
		minutes = ((parseInt(minutes)+30)%60).toString();
		minutes.length < 2 ? minutes = "0" + minutes : minutes;
		return horaire.substr(0,horaire.length-6) + heures + minutes + horaire.substr(horaire.length-2, 2);
	}
}

// Retourne le nombre de segments de 30 min qui séparent deux valeurs de temps
function nombreSegments(heureDebut, heureFin) {
	return (parseInt(heureFin.substr(heureFin.length-6, 2)) * 60 + parseInt(heureFin.substr(heureFin.length-4, 2)) - (parseInt(heureDebut.substr(heureDebut.length-6, 2)) * 60 + parseInt(heureDebut.substr(heureDebut.length-4, 2)))) / 30;
}
  
function DetectIntervenant(data) {
	var reginter = /(\([\w+ .'àéèêîù]+\))/g; //les mots qui sont dans les parentheses (les parentheses inclus)
	var regtimedeb = /DTSTART:[d{8}T\d{6}]+/g; // tous les dates debut d evenement
	var regtimefin = /DTEND:[d{8}T\d{6}]+/g;  // tous les dates fin d evenement
	var result1 = data.match(reginter); // Cherche les mots correspondant au reg
	var result2 = data.match(regtimedeb);
	var result3 = data.match(regtimefin);
	var intervenant = new Array();
	var timedeb = new Array();
	var timefin = new Array();
	var time = new Array();
	
	
	for(var i = 0 ; i<result1.length;i=i+2)
	{
	intervenant[i]= result1[i].substr(1,result1[i].length-2);
	}
	
	// enlever tous les cases sans valeurs
	var intervenant = intervenant.filter(function(val) {
	if(val == '' || val == NaN || val == undefined || val == null) {
		return false;
	}
	return true;
	});
	
	for(var i = 0 ; i<result2.length;i++) {
	timedeb[i] = toDate(result2[i].substr(17,2) + ":" + result2[i].substr(19,2),"h:m");
	}
	
	for(var i = 0 ; i<result3.length;i++) {
	timefin[i] = toDate(result3[i].substr(15,2) + ":" + result3[i].substr(17,2),"h:m");
	}
	
	for(var i = 0 ; i<timedeb.length;i++) {
	time[i]=parseInt((timefin[i]-timedeb[i])/1000/60); // convertir millisecondes en minutes
	}
	
	var fusion = zip(intervenant,time).sort();
	var nbh = sommeh(fusion);
	
	//enlever tous les cases vides et remettre les valeurs dans l ordre
	var nbh = nbh.filter(function(val) {
	if(val == '' || val == NaN || val == undefined || val == null) {
		return false;
	}
	return true;
	});
	
	//Changement de minutes en heures + minutes pour le volume horaire
	var min,h;
	for(var i = 0 ; i < nbh.length ; i++) {
	min=nbh[i]%60;
	h=(nbh[i]- min) / 60;
	if(h==0){
		nbh[i] = min + "min";}
		else if(min==0){
		nbh[i] = h + "h";}
		else {
			nbh[i] = h + "h" + min + "min";
		}
		} 
	
		var nbi = CompterNbInter(intervenant);
		var nbi = nbi.filter(function(val){
		if(val == '' || val == NaN || val == undefined || val == null) {
			return false;
		}
		return true;
		});
	
	//Recuperer les valeurs distincts d un tableau  
	var e,i;
	var intervenant = intervenant.filter(function (e, i, intervenant) {
	return intervenant.lastIndexOf(e) === i;
	});
	intervenant.sort();
	
	ecrireListeSpec2(intervenant,nbh,nbi);
}

//Fusion de deux tableaux en tableaux 2 dimensionnel
function zip(arrayA, arrayB) {
  var length = Math.min(arrayA.length, arrayB.length);
  var result = [];
  for (var n = 0; n < length; n++) {
    result.push([arrayA[n], arrayB[n]]);
  }
  return result;
}

//Fonction permettant recuperer le volume horaire d interventions
function sommeh(data) {

  var current = null;
  var sum = 0;
  var nbh =[];
  for (var i = 0 ; i < data.length ; i++) {
    if (data[i][0] != current) {
      if(sum > 0) {
        nbh[i] = sum;
      }
      current = data[i][0];
      sum=data[i][1];
      
    } else {
      sum = sum + data[i][1];
    }
  }
  if (sum > 0) {
    nbh[i] = sum;
  }
  return nbh;
}

//Fonction permettant recuperer le nombre total d interventions
function CompterNbInter(data) {
  data.sort();    //Tri des intervenants par ordre alphabetique
  var current = null;
  var count = 0;
  var nbi = [];
  for (var i = 0; i < data.length; i++) {
    if (data[i] != current) {
      if (count > 0) {
        nbi[i] = count;
      }
      current = data[i];
      count = 1;
    } else {
      count++;
    }
  }
  if (count > 0) {
    nbi[i] = count;
  }
  return nbi;
}
//changer string de forme "h:m" en date
function toDate(dStr,format) {
  var now = new Date();
  if (format == "h:m") {
    now.setHours(dStr.substr(0,dStr.indexOf(":")));
    now.setMinutes(dStr.substr(dStr.indexOf(":")+1));
    now.setSeconds(0);
    return now;
  } else return "Invalid Format";
}

//ecrire la liste des intervenants, leur volume horaire, leur nombre d'interventions
function ecrireListeSpec2(a,b,c) {
  var str = new Array();
  for(var i= 0; i < a.length; i++)
  {
    str += a[i] + ";" + b[i] + ";" + c[i] + "\n";
  }
  fs.appendFileSync(argumentEntree+"-interventions.csv", 
    "Intervenant;Volume horaire;Nombre d'interventions\n"+str);
	console.log("\n\n\n\n------------ INTERVENTIONS DISPONIBLES ------------\n\n\n\n");
  fermer();
}

function menu() {
	console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n                    ------------ AMDY ------------\n\n\n\n\n"+
	"Entrez le nombre précédant la fonction désirée : \n"+
	"1 : Générer un planning d’intervention au format iCalendar \n (conversion csv -> iCal)\n\n"+
	"2 : Générer un rapport d’intervention hebdomadaire (à partir d'un iCal)\n\n"+
	"3 : Générer l'union (ajout) de deux plannings d'intervention (à partir de deux iCal)\n\n"+
	"4 : Générer l'intersection (horaires communs) de deux plannings d'intervention (à partir de deux iCal)\n\n");
	rl.on('line', function (answer) {
		switch (answer) {
			case '1':
			console.log("Spec 1 : indiquer le nom du fichier csv à importer (ex : nom.csv)");
			rl.on('line', function (arg) {
				argumentEntree = arg.substr(0,arg.length-4);
				lire("./"+arg,1);
			});
			break;
			case '2':
			console.log("Spec 2 : indiquer le nom du fichier à importer (ex: nom.ics)");
			rl.on('line', function (arg) {
				argumentEntree = arg.substr(0,arg.length-4);  
				lire("./"+arg,2);      
			});
			break;
			case '3':
			console.log("Spec 3 : indiquer le nom des deux fichiers à importer, séparés d'un espace (ex: nom.ics nom2.ics)");
			rl.on('line', function (arg) {
				argumentEntree = arg.substr(0,arg.length-4);
				lire(arg,3);
			});
			break;
			case '4':
			console.log("Spec 4 : indiquer le nom des deux fichiers à importer, séparés d'un espace (ex: nom.ics nom2.ics)");
			rl.on('line', function (arg) {
				argumentEntree = arg.substr(0,arg.length-4);
				lire(arg,4);
			});
			break;
		}
	});
}

menu();
