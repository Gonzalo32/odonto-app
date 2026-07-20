# Guía de posicionamiento — Impresión Odonto App

## ¿Qué archivo controla qué?

| ¿Dónde? | Archivo a modificar |
|---|---|
| **Previsualización en pantalla** | `src/app/features/patient-form/components/print-template/print-template.component.scss` |
| **Lo que realmente se imprime** | `src/app/features/patient-form/steps/step-review.component.ts` → constante `PRINT_CSS` (líneas 5–90) |

> ⚠️ La previsualización NO es 100% fiel a la impresión.
> El archivo que importa para el resultado final en papel es `step-review.component.ts`.

---

## ¿Cómo funcionan los valores de posición?

Cada campo usa dos propiedades CSS:

```css
.nombre-del-campo {
  top:  calc(Xcm + var(--off-y));   /* altura */
  left: calc(Xcm + var(--off-x));   /* posición horizontal */
}
```

### `top` → controla la altura (eje vertical)

| Acción               | Qué hacer                              |
|----------------------|----------------------------------------|
| Mover hacia **abajo**  | **Aumentar** el valor (ej: 3.9 → 4.2) |
| Mover hacia **arriba** | **Disminuir** el valor (ej: 3.9 → 3.5) |

### `left` → controla la posición horizontal

| Acción                    | Qué hacer                               |
|---------------------------|-----------------------------------------|
| Mover hacia la **derecha** | **Aumentar** el valor (ej: 13.6 → 15.0) |
| Mover hacia la **izquierda** | **Disminuir** el valor (ej: 13.6 → 12.0) |

---

## Posición actual de la matrícula

### En el SCSS (previsualización en pantalla)
Archivo: `print-template.component.scss` — línea ~113

```css
.matricula-field {
  top:  calc(4.65cm + var(--off-y));   /* altura */
  left: calc(17.5cm + var(--off-x));   /* posición horizontal */
}
```

### En el PRINT_CSS (impresión real)
Archivo: `step-review.component.ts` — línea ~84

```css
.matricula-field {
  top:  calc(4.65cm + var(--off-y));   /* altura */
  left: calc(18cm + var(--off-x));     /* posición horizontal */
}
```

---

## Flujo recomendado para ajustar posición

1. Modificá los valores en `step-review.component.ts` (PRINT_CSS).
2. Usá **Ctrl+P** en el navegador para ver la previsualización de impresión real.
3. Repetí hasta que quede en el lugar correcto.
4. Opcionalmente copiá los mismos valores al SCSS para que la vista en pantalla sea más aproximada.
