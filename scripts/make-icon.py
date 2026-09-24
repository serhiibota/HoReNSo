"""Генератор иконки «энсо + Хо·Рен·Со».

Запуск: python3 scripts/make-icon.py <папка>  — пишет icon.svg (со скруглением),
icon-square.svg (для PNG: iOS скругляет сама) и icon-maskable.svg (Android, safe zone 80%).
PNG в public/ отрисованы из этих SVG браузером (Playwright) в 180/192/512 px.
"""
import math, sys

def enso(cx, cy, R, wmax, a0, sweep, n=240):
    """Мазок кисти: центр по окружности, ширина — тяжёлый вход и тонкий хвост."""
    outer, inner = [], []
    for i in range(n + 1):
        t = i / n
        a = math.radians(a0 + sweep * t)
        # вход кисти: быстро набирает толщину; выход: плавно сходит на нет
        w = wmax * (0.9 + 0.1 * min(1, t / 0.06)) * (1 - t) ** 0.95 + 1.0
        # лёгкая «дыхательная» неровность, как у настоящего мазка
        w *= 1 + 0.06 * math.sin(t * 9.5)
        # хвост чуть уходит наружу — «взмах» кисти
        r = R + 3 * math.sin(t * 3.1) + 10 * max(0, t - 0.8) / 0.2
        outer.append((cx + (r + w / 2) * math.cos(a), cy + (r + w / 2) * math.sin(a)))
        inner.append((cx + (r - w / 2) * math.cos(a), cy + (r - w / 2) * math.sin(a)))
    pts = outer + inner[::-1]
    d = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts) + ' Z'
    # «Вход» кисти — капля чуть толще мазка, отдельным кругом
    a = math.radians(a0)
    r0 = wmax * 0.5
    bx, by = cx + R * math.cos(a), cy + R * math.sin(a)
    return d, (bx, by, r0)

def svg(size=512, bg=True, maskable=False, layout='row'):
    """layout: 'row' — точки в ряд, как «…» в переписке; 'tri' — треугольником."""
    c = 256
    scale = 0.8 if maskable else 1.0
    R, w = 166 * scale, 50 * scale
    d, (bx, by, r0) = enso(c, c + 4, R, w, a0=-58, sweep=298)
    dot_r = 23 * scale
    dots = []
    for k, col in enumerate(['#6F86A3', '#7E9C88', '#B08676']):  # Хо, Рен, Со
        if layout == 'row':
            x, y = c + (k - 1) * 66 * scale, c + 4
        else:
            a = math.radians(-90 + 120 * k)
            x, y = c + 58 * scale * math.cos(a), c + 4 + 58 * scale * math.sin(a)
        dots.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{dot_r:.1f}" fill="{col}"/>')
    rx = 0 if maskable else 112
    back = ''
    if bg:
        back = (f'<defs><radialGradient id="g" cx="50%" cy="38%" r="75%">'
                f'<stop offset="0" stop-color="#FBFAF6"/><stop offset="1" stop-color="#EFEBE3"/></radialGradient></defs>'
                f'<rect width="512" height="512" rx="{rx}" fill="url(#g)"/>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="{size}" height="{size}">'
            f'{back}<g fill="#2B2A28"><path d="{d}"/><circle cx="{bx:.1f}" cy="{by:.1f}" r="{r0:.1f}"/></g>{"".join(dots)}</svg>')

open(sys.argv[1] + '/icon.svg', 'w').write(svg())
open(sys.argv[1] + '/icon-maskable.svg', 'w').write(svg(maskable=True))
open(sys.argv[1] + '/icon-square.svg', 'w').write(svg().replace('rx="112"', 'rx="0"'))
