# Hugo Cáceres — Portfolio personal

Web en español de sistemas, automatización, seguridad, redes y datos. React, Vite y CSS, con diagramas conceptuales, animaciones discretas, navegación por teclado y adaptación a movimiento reducido.

## Desarrollo

Requisitos: Node.js 22 y pnpm 11.19.0.

```sh
corepack enable
corepack prepare pnpm@11.19.0 --activate
pnpm install
pnpm dev
```

```sh
pnpm build
pnpm preview
```

## Contenido editable

`src/data/profile.js` centraliza nombre, presentación, email, LinkedIn, CV, formación, experiencia, certificaciones, conocimientos y proyectos. Los enlaces de email, LinkedIn y CV aparecen al completar sus campos. Para el CV, guarda el PDF en `public/cv.pdf` y asigna `/cv.pdf` a `cv`. No se ha fabricado un CV sin información suficiente.

## Publicación en GitHub Pages

1. Crea el repositorio **público** `HugoCaceres22/hugocaceres22.github.io`, vacío y sin README generado.
2. En **Settings → Pages → Build and deployment**, selecciona **GitHub Actions**.
3. Desde esta carpeta, ejecuta:

```sh
git add .
git commit -m "Crear portfolio profesional de Hugo Cáceres"
git branch -M main
git remote add origin https://github.com/HugoCaceres22/hugocaceres22.github.io.git
git push -u origin main
```

El workflow compila y publica `dist/` en cada push a `main`. La web utiliza anclas en una única página, con base `/`, apropiada para `https://hugocaceres22.github.io/`. No necesita backend ni redirecciones de SPA.

## Estructura

- `src/main.jsx`: secciones y componentes.
- `src/styles.css`: identidad visual, responsive y movimiento reducido.
- `src/data/profile.js`: contenido personal y proyectos.
- `public/`: favicon y futuros archivos públicos.
- `.github/workflows/deploy.yml`: publicación automática.
- `docs/sources.md`: selección y evidencia de contenido.

Las fuentes tipográficas se sirven desde Google Fonts con `display=swap` y alternativas locales. No hay imágenes de stock ni estadísticas remotas. La publicación aún requiere crear el repositorio y activar Pages: la conexión disponible no ofrece esas operaciones.
