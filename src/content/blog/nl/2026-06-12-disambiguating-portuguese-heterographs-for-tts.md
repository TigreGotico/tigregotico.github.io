---
title: "Het goed uitspreken: Portugese heterofonen desambigueren voor TTS"
description: "Veel Europees-Portugese woorden worden hetzelfde gespeld maar afhankelijk van de betekenis anders uitgesproken — en de verkeerde klinker laat een TTS-stem het verkeerde woord zeggen. We bouwden bifonia-pt-homographs, een open betekenislabelede dataset van 56.891 zinnen over 27 woorden, en een piepkleine resolver zonder afhankelijkheden die ≈94% haalt waar zware POS-taggers blijven steken op ≈75%."
date: 2026-06-12
lang: nl
author: "Casimiro Ferreira"
tags:
  - "Datasets"
  - "Portuguese"
  - "TTS"
  - "Grapheme-to-Phoneme"
  - "NLP"
  - "Accessibility"
  - "FOSS"
draft: false
---

## Het goed uitspreken: Portugese heterofonen desambigueren voor TTS

Wanneer een tekst-naar-spraakstem "Tenho sede" voorleest, verwacht een Portugese luisteraar *dorst* te horen. Maar precies dezelfde spelling, `sede`, kan ook *hoofdkantoor* betekenen — en de twee worden met verschillende klinkers uitgesproken. Zeg het met de verkeerde klinker en de stem klinkt niet alleen vreemd; hij zegt hardop een ander woord. Voor iemand die op TTS vertrouwt om het scherm voor te lezen, is dat de grens tussen verstaanbaar en verwarrend.

Dit is een front-end-probleem — de grafeem-naar-foneem-fase die bepaalt naar *welke klanken* een woord wordt gemapt, lang voordat een neurale vocoder die klanken in audio omzet. Geen enkele hoeveelheid vocoderkwaliteit lost dit op. Als de front-end de verkeerde uitspraak kiest, articuleert de stem het verkeerde woord, kraakhelder.

### Heterofone homografen: dezelfde spelling, andere klank, andere betekenis

Europees Portugees zit vol met woorden die identiek gespeld worden maar met een andere klinkerkwaliteit worden uitgesproken — een *open* klinker versus een *gesloten* — waarbij de juiste keuze afhangt van de **betekenis**, niet alleen van de grammatica. Een paar voorbeelden:

- **`sede`** — *dorst* (gesloten e, `ˈsedɨ`) vs *hoofdkantoor/zetel* (open e, `ˈsɛdɨ`). Beide zijn zelfstandige naamwoorden.
- **`forma`** — *mal / bakvorm* (gesloten o, `ˈfoɾmɐ`, geschreven *fôrma*) vs *vorm / manier* (open o, `ˈfɔɾmɐ`).
- **`molho`** — *saus* (gesloten o) vs *bundel* (open o).
- **`corte`** — *koninklijk hof* (gesloten o) vs *een snee* (open o).

Een naïef TTS-systeem legt zich vast op één uitspraak per spelling. Dus leest het *dorst* met de *hoofdkantoor*-klinker — telkens weer — en de luisteraar hoort het verkeerde woord.

### Waarom "gewoon de woordsoort taggen" niet werkt

De voor de hand liggende oplossing is een part-of-speech (POS) tagger over de zin te draaien en de uitspraak op basis van POS te kiezen. Dat helpt voor sommige paren, maar het faalt *per constructie* zodra twee betekenissen dezelfde woordsoort delen.

Neem `sede` opnieuw. *Dorst* en *hoofdkantoor* zijn **beide zelfstandige naamwoorden**. Een POS-tagger labelt ze identiek — er is geen grammaticaal signaal om ze uit elkaar te houden — dus hij kan alleen maar gokken op de meest voorkomende lezing. We hebben precies dit gemeten: op onze testset scoren zowel spaCy als Stanza **0%** op de *dorst*-betekenis van `sede`. Ze kiezen altijd *hoofdkantoor*. Hetzelfde structurele plafond verschijnt bij `corte` (snee vs hof), `forma` (mal vs vorm) en `molho` (saus vs bundel): wanneer de betekenis binnen één woordsoort splitst, kan de grammatica het niet zien.

### De dataset: betekenis labelen, niet grammatica

Dus bouwden we een open dataset die datgene labelt wat er echt toe doet — betekenis. **`bifonia-pt-homographs`** bestaat uit **56.891 Europees-Portugese zinnen** die **27 heterofone homografen** dekken. Elke zin is gelabeld met het woord, de **betekenis** (zin), de woordsoort, de IPA-uitspraak, en een vorm met herstelde diakritische tekens (bijvoorbeeld *sêde* vs *séde*) die de bedoelde lezing op papier ondubbelzinnig maakt.

De bucketsleutel is betekenis — dat is de hele bedoeling. Eén record ziet er zo uit:

```json
{
  "word": "sede",
  "sense": "thirst",
  "pos": "NOUN",
  "ipa": "ˈsedɨ",
  "sentence": "Depois da corrida tinha tanta sede que bebi um litro de água."
}
```

Uitspraken werden geverifieerd tegen het woordenboek [infopédia](https://www.infopedia.pt) (Porto Editora) in plaats van geraden, en de train/test-splitsingen zijn gestratificeerd per `(word, meaning)` zodat een stroomafwaarts model — bijvoorbeeld een BiLSTM — elke betekenis in beide helften ziet. Het is gepubliceerd op Hugging Face als [`TigreGotico/bifonia-pt-homographs`](https://huggingface.co/datasets/TigreGotico/bifonia-pt-homographs).

### Hoe goed is het op te lossen?

Met betekenisgelabelde data konden we meten hoe verschillende benaderingen presteren bij het kiezen van de juiste betekenis — en dus de juiste uitspraak:

| Benadering | Nauwkeurigheid |
| --- | --- |
| Altijd de meest voorkomende betekenis gokken | ≈53% |
| spaCy POS → betekenis | ≈66% |
| Stanza POS → betekenis | ≈75% |
| `bifonia`-regel + betekenisresolver | **≈94%** |

De POS-gebaseerde benaderingen blijven precies steken waar je het zou verwachten: ze kunnen routeren op grammatica maar nooit op betekenis, dus de splitsingen binnen zelfstandige naamwoorden blijven onbereikbaar. Onze resolver — de [`bifonia`](https://github.com/TigreGotico/bifonia)-bibliotheek, lichtgewicht en **volledig zonder afhankelijkheden** — bereikt **≈94%**, en haalt cruciaal **100%** op de `sede`/*dorst*-casus waar de POS-taggers **0%** halen.

De kop is niet alleen het getal. Het is dat een kleine, snelle, volledig open component de zware neurale POS-taggers op deze taak verslaat — omdat hij *betekenis* oplost, niet alleen grammatica. Geen GPU, geen modeldownload, geen netwerkoproep.

### Waarom het ertoe doet

Correcte uitspraak is fundamenteel, niet cosmetisch. Schermlezers en spraakassistenten zijn hoe blinde en spraak-alleen-gebruikers de wereld lezen, en een front-end die veelvoorkomende woorden verkeerd uitspreekt, verslechtert stilletjes elke zin die hij aanraakt. Het bij de bron oplossen van heterofoon-desambiguatie betekent dat de stem zegt wat de tekst bedoelt.

Omdat de dataset open is en de resolver klein en te forken, kan iedereen die een Portugese TTS-front-end bouwt dit goed doen zonder een gigantisch model — en dezelfde benadering is netjes over te zetten naar een verwante taal als Galicisch, waar het onderscheid tussen open en gesloten klinkers dezelfde valkuil creëert. De gelabelde data doet ook dubbel dienst: het is precies wat je nodig hebt om compacte statistische modellen te trainen, zoals een classificator per woord, voor teams die het corpus hebben en naast de regelgebaseerde resolver een geleerde willen.

### Probeer het

De dataset staat op Hugging Face bij [`TigreGotico/bifonia-pt-homographs`](https://huggingface.co/datasets/TigreGotico/bifonia-pt-homographs), en de resolver leeft bij [`bifonia`](https://github.com/TigreGotico/bifonia). Het past in het bredere Portugese fonetiekwerk achter **[Klassieke NLP voor Portugees](/nl/blog/2026-02-28-classical-nlp-for-portuguese-syllables-and-phonemes)** en de **[grafeem-naar-IPA-stack voor 350+ talen](/nl/blog/2026-01-15-grapheme-to-ipa-for-350-languages)** — kleine, deterministische stukjes die een stem een taal laten uitspreken zoals de sprekers ervan dat werkelijk doen.
