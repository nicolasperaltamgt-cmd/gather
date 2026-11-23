# Gather · animación de la mascota

## Qué hay hoy (funciona)
- 11 poses reales recortadas de la hoja de referencia (`assets/*.webp`): celular, risas, sorpresa, cocina, futbol, cine, gaming, baile, foodie, aventura, recompensa.
- La mascota **cambia de pose** según el momento (portada, chat, juego, planes, recuerdos) con una transición de entrada con rebote y confeti en "recompensa".
- Transiciones de interfaz: tarjetas de la IA, burbujas, ícono de la barra, barras de progreso.
- Respeta `prefers-reduced-motion` (sin ciclo ni rebotes), no reproduce sonido, y usa solo imágenes WebP livianas.

## Qué NO es
Es un cambio entre poses fijas. **No** es animación corporal: no hay un modelo 3D ni clips de movimiento.
La pose "picardía" de la hoja de referencia está excluida a propósito (gesto obsceno).

## Archivos que faltan para movimiento real
Clips cortos, de 1 a 3 segundos, con fondo transparente (WebM VP9 con alfa), mismo encuadre y proporciones que las poses, 480x540 px aprox, menos de 400 KB cada uno:

| Clip | Dónde se usa |
|---|---|
| `saludar.webm` | Entrada a la portada y al grupo |
| `mirar-celular.webm` | Mientras Gather "escribe" |
| `reir.webm` | Cuando el grupo hace un chiste |
| `celebrar.webm` | Reto cumplido, racha, plan confirmado |
| `juntar-manos-picardia.webm` | Cuando propone un reto (manos juntas, sonrisa pícara; sin gestos obscenos) |
| `sorpresa.webm` | Resultado inesperado del juego |

## Cómo conectarlos
1. Copiá los archivos a `assets/clips/`.
2. En `app.js`, completá el objeto `CLIPS`, por ejemplo:
   `const CLIPS = { risas: 'assets/clips/reir.webm', recompensa: 'assets/clips/celebrar.webm' };`
3. Cualquier pose cuyo nombre esté en `CLIPS` se reproduce como video (sin sonido, sin bucle) en lugar de la imagen fija.
