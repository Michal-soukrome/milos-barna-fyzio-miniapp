# Průvodce správou obsahu webu

Tento návod je pro běžnou práci s texty na webu. Nemusíte umět programovat.
Obsah se upravuje v administraci Sanity, která se na webu jmenuje **Studio**.

## Co můžete upravovat

V administraci můžete spravovat tyto tři druhy obsahu:

- **Rady a tipy pro pacienty** – zobrazují se v části webu **Rady a tipy**
  (`/poradna`).
- **Diagnózy** – zobrazují se v části **Diagnózy** (`/diagnozy`).
- **Vzdělávací články** – zobrazují se v části **Články** (`/clanky`).

Úvodní stránka, stránka **O mně**, kontaktní údaje, navigace a vzhled webu
se v tomto Studiu neupravují. Pokud potřebujete změnit některou z těchto
stránek, požádejte správce webu.

## Než začnete

1. Otevřete web a přejděte na adresu `https://adresa-vaseho-webu.cz/studio`.
   Část `https://adresa-vaseho-webu.cz` nahraďte skutečnou adresou webu.
2. Přihlaste se svým účtem. Pokud účet nemáte nebo se nemůžete přihlásit,
   požádejte správce webu o přístup. Nesdílejte své heslo s ostatními.
3. Při práci se Studiem nepoužívejte skutečné údaje pacientů. Nevkládejte
   jména, data narození, fotografie ani jiné informace, podle kterých lze
   pacienta poznat.
4. Zdravotní doporučení, varovné příznaky a pokyny pacientům musí před
   zveřejněním zkontrolovat lékař.

## Důležité: uložení, zveřejnění a lékařská kontrola

Jsou to tři různé věci:

- Studio rozpracované změny průběžně ukládá jako koncept. Koncept ještě není
  vidět na webu.
- Tlačítko **Publish / Publikovat** zveřejní aktuální verzi dokumentu.
- Pole **Lékařsky zkontrolováno** rozhoduje, zda se obsah smí zobrazit na webu.

Po jakékoli změně dokumentu se pole **Lékařsky zkontrolováno** automaticky
vypne. Platí to i pro změnu názvu, úvodu, kategorie nebo jiného pole, nejen pro
změnu samotného zdravotního textu. Změnu proto musí lékař znovu zkontrolovat.

**Nepublikujte změněný obsah, dokud není znovu odborně schválený.** Pokud
publikujete dokument s vypnutým polem **Lékařsky zkontrolováno**, přestane se
na webu zobrazovat. Dokud změněný dokument nepublikujete, zůstává na webu
předchozí publikovaná verze.

## Úprava již existujícího obsahu

1. Ve Studiu otevřete typ obsahu, který chcete upravit:
   **Rady a tipy pro pacienty**, **Diagnózy** nebo **Vzdělávací články**.
2. Vyhledejte dokument podle názvu a otevřete ho.
3. Klikněte do pole, které chcete změnit, a upravte text. Studio změny
   průběžně ukládá.
4. Zkontrolujte celý dokument, zejména správnost názvu, zařazení a odkazů.
5. Pokud jste změnili cokoli v dokumentu, ověřte, že pole
   **Lékařsky zkontrolováno** je vypnuté.
6. **Zastavte se zde a požádejte lékaře o kontrolu.** Zatím neklikejte na
   **Publikovat**.
7. Po schválení lékař zapne **Lékařsky zkontrolováno**. Poté klikněte na
   **Publikovat**.
8. Otevřete příslušnou stránku na veřejném webu a zkontrolujte výsledek.
   Zobrazení změny může trvat až několik minut.

Pokud upravujete jen překlep, platí stejný postup. Automatické vypnutí
lékařské kontroly nelze obejít.

## Vytvoření nového obsahu

1. Ve Studiu otevřete správný typ obsahu.
2. Zvolte **Create / Vytvořit** a vytvořte nový dokument daného typu.
3. Vyplňte všechna povinná pole. Povinná pole jsou označena ve Studiu; při
   chybě vám Studio nedovolí dokument publikovat.
4. Zkontrolujte název, adresu stránky, zařazení a celý text.
5. Nechte pole **Lékařsky zkontrolováno** vypnuté, dokud obsah nezkontroluje
   lékař.
6. Po schválení lékař pole zapne a dokument zveřejní tlačítkem
   **Publikovat**.
7. Otevřete novou stránku na veřejném webu a ověřte, že se zobrazuje správně.

## Co vyplnit u jednotlivých typů obsahu

### Rady a tipy pro pacienty

- **Název** – krátký a srozumitelný název rady.
- **Adresa rady** – technická část webové adresy. Vyplňte ji, pokud ji Studio
  nevytvoří samo. Po zveřejnění ji bez domluvy neměňte; změnila by se adresa
  stránky a staré odkazy by nemusely fungovat.
- **Oblast těla** – vyberte odpovídající oblast.
- **Věkové skupiny** – označte všechny skupiny, pro které je rada určena.
- **Situace** – vyberte potvrzenou situaci, pro kterou rada platí, například
  po operaci nebo při používání berlí. Nezaměňujte ji s příznaky.
- **Vyhledávací výrazy** – přidejte krátká slova nebo fráze, které může
  pacient hledat. Situace, například „po operaci“, patří do pole **Situace**.
- **Krátký popis** – jedna až dvě věty, které shrnou, co pacient v radě najde.
- **Obsah rady** – napište vlastní text. Pomocí nabídky formátování můžete
  přidávat nadpisy, odrážky, číslovaný seznam nebo obrázek. U každého obrázku
  vyplňte povinný **Alternativní text**: stručně popište, co je na obrázku.
  Popisek je volitelný.
- **Varovné příznaky** – doplňte pouze odborně ověřené příznaky, při kterých
  má pacient vyhledat pomoc.

### Diagnózy

- **Název diagnózy** – používejte běžný, srozumitelný název.
- **Kategorie** a **Oblast těla** – vyberte správné zařazení, aby pacient
  diagnózu našel v přehledu.
- **Adresa diagnózy** – technická část webové adresy. Po zveřejnění ji bez
  domluvy neměňte.
- **Krátký úvod** – stručně vysvětlete, čeho se diagnóza týká.
- **Obsah diagnózy** – použijte jen části, které jsou pro danou diagnózu
  relevantní. Text můžete rozdělit nadpisy, například na význam diagnózy,
  její typy, vyšetření, léčbu, operaci a následnou péči.

### Vzdělávací články

- **Název** – výstižný název článku.
- **Adresa článku** – Studio ji po zadání názvu vytváří automaticky. Po
  zveřejnění ji bez domluvy neměňte.
- **Oblast těla** – vyberte hlavní oblast, do které článek patří.
- **Krátký úvod** – krátké shrnutí pro přehled článků.
- **Kategorie** – přidejte vhodná klíčová slova. U podobných článků používejte
  stejné názvy kategorií.
- **Obsah článku** – rozdělte delší text nadpisy. Podle potřeby použijte
  odrážky, číslovaný seznam nebo citaci.
- **Datum zveřejnění** – datum článku; obvykle je předvyplněné.

## Jak napsat text, který pacientovi pomůže

- Začněte tím nejdůležitějším. Pište krátké věty a vysvětlete odborné výrazy.
- Používejte nadpisy, aby pacient mohl text rychle projít.
- Pokyny formulujte jednoznačně. Vyhněte se nejasným slovům jako „někdy“ nebo
  „podle potřeby“, pokud není jasné, co přesně znamenají.
- Neslibujte výsledek léčby a nevydávejte obecnou informaci za osobní
  doporučení pro konkrétního pacienta.
- Zdravotní rady, dávkování, omezení pohybu a varovné příznaky vždy nechte
  zkontrolovat lékařem.
- Nepřidávejte fotografie pacientů ani obrázky, ke kterým nemáte právo je
  zveřejnit.

## Když se obsah nezobrazuje nebo něco nefunguje

- **Dokument na webu chybí:** ověřte, že je publikovaný, má vyplněnou adresu
  stránky a má zapnuté **Lékařsky zkontrolováno**.
- **Po úpravě zmizel:** pravděpodobně byl publikován s vypnutým polem
  **Lékařsky zkontrolováno**. Požádejte lékaře o kontrolu; po schválení pole
  zapněte a dokument znovu publikujte.
- **Změna se ještě neukázala:** obnovte stránku a chvíli počkejte; web může
  obsah obnovovat se zpožděním až několika minut.
- **Nemůžete dokument najít nebo publikovat:** nic nemažte ani nevytvářejte
  duplicitně. Pořiďte snímek obrazovky chybové zprávy a pošlete ho správci
  webu.

Pokud si nejste jistí, zda změna ovlivňuje zdravotní doporučení, nepublikujte
ji a nejprve požádejte o kontrolu lékaře.
