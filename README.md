# Tinta para Lupa

Extrae el contenido legible de una página y lo convierte a Markdown mediante Mozilla Readability y Turndown. Incluye popup para previsualizar, copiar y descargar.

Versión de la extensión: **0.2.0**. Manifest V3, JavaScript sin paso de compilación.

## Instalar en Chromium

```sh
git clone https://github.com/bunxdev/lupa_extension_tinta.git
```

Abre `chrome://extensions`, activa el modo desarrollador y carga la carpeta del repositorio como extensión desempaquetada.

## Instalar en Lupa

En Lupa 0.0.3 con Compose slim, clona este repositorio en `deploy/slim/.runtime/extensions/tinta/` de tu instalación. En el Compose tradicional, usa `extensions/tinta/`. El archivo debe quedar en `/extensions/tinta/manifest.json` dentro del contenedor.

Lupa descubre los manifiestos al abrir un contexto de Chromium. Reabre el contexto en un momento apropiado, guardando antes el trabajo de la sesión. La descarga del repositorio no modifica las pestañas que ya están abiertas.

## Permisos y límites

- Permisos: `activeTab`, `scripting`.
- Acceso a sitios: `<all_urls>`.

La extracción puede devolver `null` en páginas sin artículo reconocible. Las páginas internas del navegador restringen las extensiones.

## Procedencia

Consulta [PROVENANCE.md](PROVENANCE.md). Esta publicación conserva el código instalado y añade documentación de distribución; no representa una batería nueva de pruebas contra sitios externos.

## API de extracción

El content script expone `window.__tinta.extract()` en el mundo principal. Devuelve metadatos del artículo y `markdown`, o `null` si no encuentra contenido legible.

```sh
curl http://127.0.0.1:3136/extension/run \
  -H "Authorization: Bearer $LUPA_API_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"extension":"tinta","url":"https://example.com","script":"return window.__tinta.extract()"}'
```

Para generar un ZIP (requiere Python 3): `bash scripts/pack.sh`. Dependencias incluidas: Readability 0.5.0 (Apache-2.0) y Turndown 7.2.0 (MIT); sus avisos y licencias están en `LICENSES/`. No se declara una licencia nueva para el código original de Tinta.
