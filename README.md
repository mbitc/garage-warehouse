
# Garage-Warehouse (Garažas-Sandėlis)

Moderni, stabili ir autonomiška lokali sandėlio valdymo sistema, sukurta monolitinės architektūros pagrindu. Sistema pritaikyta stacionariam naudojimui (Electron) bei greitam valdymui per vietinį tinklą (LAN).

## 🚀 Architektūra ir Technologijos

Projektas atsisako sudėtingų tarpinių serverių ir veikia kaip vieningas monolitai:
* **Desktop Apvalkalas:** [Electron](https://www.electronjs.org/)
* **Full-stack Karkasas:** [Next.js](https://nextjs.org/) (App Router, naudojant tiek React UI, tiek vidinius API maršrutus)
* **Duomenų Bazė:** [SQLite](https://github.com/WiseLibs/better-sqlite3) (`better-sqlite3`)
* **Stilius:** Tailwind CSS
* **Kalba:** TypeScript / JavaScript

## 📦 Pagrindinės Funkcijos

1. **Vartotojų Rolės ir Autorizacija:** Sistema palaiko tris vartotojų grupes (Administratorius, Operatorius/Sandėlininkas, Svečias/Mobilus vartotojas) su atitinkamomis prieigomis.
2. **Milimetrinis Tūrio Varikliukas (Tetris Logic):** Automatinis erdvės patikrinimas prieš talpinant prekę į lentyną (skaičiuojamas tikslus tūris milimetrais, tikrinami gabaritai).
3. **Prekių ir Lentynų Valdymas:** Dinaminis prekių katalogas, lentynų konfigūracija bei sandėlio likučių stebėsena.

## ⚙️ Diegimas ir Paleidimas

1. **Klonuokite saugyklą arba atidarykite projekto aplanką:**
   ```bash
   cd garage-warehouse

    ```

2. **Įdiekite priklausomybes:**
    ```bash
    npm install

    ```


3. **Paleiskite vystymo režimu (kartu su Electron langu):**
    ```bash
    npm run electron:dev

    ```



## 🔑 Testiniai Prisijungimai

* **Administratorius:** `admin` / `admin123`
* **Operatorius:** `operator` / `oper123`
* **Svečias:** `guest` / `guest123`


