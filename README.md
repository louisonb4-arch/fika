# Fika — site (v3 « haute pâtisserie »)

Site statique prêt pour Vercel (racine = ce dossier ; `_source/` est exclu via `.vercelignore`).

- Voir en local : `cd ~/Developer/clients/fika-site && python3 -m http.server 5190` → http://localhost:5190
- Modifier : `_source/index.html`, `_source/style.css`, `_source/main.js`, `_source/vitrine.json`
- Rebuild : `python3 _source/build.py`
- Pâtisseries détourées : `python3 _source/cut.py <n°>` (rembg) puis `python3 _source/cutprep.py`
- La v2 est archivée dans `_source/v2/`.

## À valider avec Fika avant mise en ligne
- Prix des boissons (fiche Google) et formule 18,50 € / 16,50 € (ardoise en salle).
- Textes de l'anatomie de la choconoisette (repris de leur légende Insta, reformulés).
- Avis Google cités nominativement : accord souhaitable.
- Mentions légales : forme juridique, SIRET/RCS, directeur de publication.
- Photos : originales HD si possible (détourage fait à partir des photos Insta en 1080 px).
