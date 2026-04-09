- maintenant dans detail projet il y a tache :
    - en bas div info project il y a div :
        - liste des tache :
            - nous pouvant faire selection multiple (supprimer)
            - une tache contient :
                - nom tache 
                - description (pas dans form ajout et modifier)
                - duree
            - sur un div tache il y a:
                - nom tache 
                - duree
                - btn marquer tache comme fini
                - btn option (supprimer , modifier)
                - btn selection (pour selection multiple haut a gauche)
                si on clique sur une tache ca va vers page detail tache :
                    - dans page detail tache il y a :
                        - header :
                            - gauche : btn retour
                            - centre : nom page (detail tache)
                        - info tache :  
                            - nom projet
                            - nom tache
                            - duree tache
                        - div description :
                            - qui est editable (comme sur le app Note)
                            - chaque fois qu'on clique dessus :
                                - header devient :
                                    - gauche : btn retour
                                    - centre : rien
                                    - droite : 
                                        - btn revenir gauche
                                        - btn revenir droite
                                        - btn vrai (enregistrer)
    - en bas sur l'ecran il y a deux btn :
        - btn play/pause
        - btn + (ajouter un nouveau tache)
- maintenant duree projet = somme duree des taches

- changement :
    - change btn marquer dans home a faire par btn play
    - maintenant pour dire qu'un projet est fait il faut que tous ces taches sont marquer
    - dans card projet a faire ajoute :
        - temps passer
        - progression (tache fini / tache total) en %

- fonctionnalites :
    - nous pouvant move ordre des taches dans pages projet (comme sur les playlist de musique) :
        - appuyant maintenir sur un btn liste a gauche puis deplacer en haut et droite
        - cela est sauvegarder dans stockage de l'app
    - si un projet play :
        - btn play du projet dans home deviennent pause
        - dans home les autre projet dans a faire sont griser
        - dans projet les autres taches sont griser sauf ceux fini et celle en cours
        - les tache fini sont marquer avec check ne peuvent plus etre demarquer
        - chrono se fait se fait par des intervalle de :
            - 25 min : actif
            - 5 min : pause
        - chrono s'arrete si tous les tache du projet sont fini et les taches et les projet griser ne le sont plus
        - btn play pause dans page projet devient un btn ou il y a :
            - a droite : icone pause
            - a gauche chrono (25min , 5min) en compte a rebours
            - le btn a animation temps diminuer et couleur qui change au fure et a mesure de le temps s'ecoule (vert->rouge)
        - et si l'on quitte apk ou ecran eteint alors qu'un projet play , dans notification il y a :
            - nom projet
            - tache actuel
            - chrono
        - a chaque changement intervalle :
            - il y a une sonnerie qui sonne 
            - notification devient :
                - nom projet
                - fin de tache + nom tache / fin de pause
                - cliquer pour continuer
                et elle descend et s'affiche en permanence sur l'ecran si l'on ne clique pas
            - il faut cliquer sur notif pour que la sonnerie s'arrete de chrono change d'intervalle (ex: 25min -> 5min , 5min -> 25min)
        - si l'on clique sur btn pause :
            - chrono s'arrete ex: (12:32) et continue a cette chrono la prochaine fois que le projet est play
            - les taches et les projet griser ne le sont plus
            - btn play/pause du projet dans page projet devient :
                - chrono + icon play


    
        
        