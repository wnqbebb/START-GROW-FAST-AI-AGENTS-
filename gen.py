# -*- coding: utf-8 -*-
import io

es_raw = '''No tienen suficientes creativos nuevos por semana.
Dependen de diseñadores, editores o creativos internos saturados.
La producción creativa es lenta.
Los shootings, modelos, locaciones y UGC real hacen que producir sea costoso.
El coste por pieza creativa es demasiado alto.
No tienen suficientes variaciones por anuncio.
No pueden producir múltiples versiones de un mismo concepto.
No tienen suficiente volumen para testear diferentes hooks.
No pueden testear múltiples ángulos creativos al mismo tiempo.
Los creativos se repiten demasiado.
Las campañas se quedan sin material fresco rápidamente.
No tienen backlog creativo preparado.
No pueden reaccionar rápido a tendencias, promos o cambios de mercado.
No escalan volumen creativo cuando una campaña empieza a crecer.
Tienen dificultad para producir UGC de forma constante.
Dependen demasiado de creadores externos o influencers.
Cada nueva campaña exige empezar producción casi desde cero.
No tienen suficiente B-roll, imágenes, hooks y assets auxiliares.
Les cuesta producir contenido visual para diferentes formatos y plataformas.
No pueden crear campañas visuales grandes sin gastar demasiado en producción tradicional.

No testean suficientes hipótesis creativas.
No saben qué ángulos funcionan mejor.
No tienen suficientes variantes para encontrar anuncios ganadores.
Los creativos se queman rápido por fatiga creativa.
No refrescan campañas a tiempo.
Toman decisiones creativas basadas en intuición, no en aprendizaje estructurado.
No tienen un sistema claro para aprender de cada lote creativo.
No documentan qué hooks funcionaron y cuáles fallaron.
No tienen memoria creativa por cliente o por marca.
No conectan los resultados de performance con las siguientes piezas creativas.
No tienen datos creativos organizados por ángulo, formato, hook, oferta o audiencia.
No saben qué mensajes deben repetir, mejorar o descartar.
No pueden iterar rápido después de ver métricas como CTR, CPC, CPA, ROAS o retención.
No tienen suficiente velocidad entre idea, producción, test y siguiente iteración.
No tienen una librería de ángulos ganadores reutilizable.
No saben diferenciar entre un problema de media buying, oferta, landing o creatividad.
No tienen sistema para priorizar qué creativos producir primero.
No pueden probar suficientes formatos: estáticos, UGC, B-roll, lifestyle, product shots, comparativas, demos, etc.
No tienen un proceso para combatir la fatiga creativa antes de que la campaña muera.
Les cuesta optimizar el rendimiento desde la creatividad, no solo desde la configuración de anuncios.

No quieren contratar más diseñadores, editores, creadores UGC o productores.
Gestionar freelancers les consume demasiado tiempo.
La calidad cambia demasiado según quién produzca la pieza.
No tienen procesos creativos claros ni repetibles.
Hay problemas de coordinación entre media buyers, creativos, editores y cliente final.
El equipo creativo interno está sobrecargado.
Hay retrasos constantes en entregas.
No tienen un sistema fuerte de control de calidad.
Se rompe la consistencia de marca cuando intentan producir más rápido.
No tienen un workflow replicable para producir, revisar y entregar creativos.
Los costes de producción son impredecibles.
Cada nuevo cliente o campaña aumenta el caos operativo.
No tienen una estructura clara de briefing, revisión, aprobación y entrega.
Pierden tiempo corrigiendo errores que deberían evitarse desde el sistema.
No tienen nomenclatura, organización ni librería clara de assets.
La comunicación con freelancers o proveedores genera demasiada fricción.
No tienen una capa externa confiable que se haga responsable del output creativo.
No pueden escalar producción sin perder control.
No tienen SOPs creativos que permitan repetir calidad.
No tienen un sistema que acumule aprendizaje y mejore con el tiempo.'''

en_raw = '''Not enough new creatives per week.
Dependent on overloaded internal designers or editors.
Creative production is slow.
Shoots, models, locations, and real UGC make production expensive.
Cost per creative piece is too high.
Not enough variations per ad.
Cannot produce multiple versions of the same concept.
Not enough volume to test different hooks.
Cannot test multiple creative angles at once.
Creatives repeat too much.
Campaigns run out of fresh material quickly.
No prepared creative backlog.
Cannot react quickly to trends, promos, or market changes.
Don't scale creative volume when a campaign starts growing.
Difficulty producing UGC consistently.
Rely too heavily on external creators or influencers.
Every new campaign requires starting production almost from scratch.
Not enough B-roll, images, hooks, and auxiliary assets.
Struggle to produce visual content for different formats and platforms.
Cannot create large visual campaigns without spending too much on traditional production.

Don't test enough creative hypotheses.
Don't know which angles work best.
Not enough variants to find winning ads.
Creatives burn out quickly due to ad fatigue.
Campaigns aren't refreshed on time.
Creative decisions are based on intuition, not structured learning.
No clear system to learn from each creative batch.
Don't document which hooks worked and which failed.
No creative memory per client or brand.
Performance results aren't connected to the next creative pieces.
No creative data organized by angle, format, hook, offer, or audience.
Don't know which messages to repeat, improve, or discard.
Cannot iterate quickly after seeing metrics like CTR, CPC, CPA, ROAS, or retention.
Not enough speed between idea, production, test, and next iteration.
No reusable library of winning angles.
Don't know how to differentiate between a media buying, offer, landing page, or creative problem.
No system to prioritize which creatives to produce first.
Cannot test enough formats: static, UGC, B-roll, lifestyle, product shots, comparisons, demos, etc.
No process to combat creative fatigue before the campaign dies.
Struggle to optimize performance through creatives, not just ad setup.

Don't want to hire more designers, editors, UGC creators, or producers.
Managing freelancers consumes too much time.
Quality varies too much depending on who produces the piece.
No clear or replicable creative processes.
Coordination issues between media buyers, creatives, editors, and the final client.
Internal creative team is overloaded.
Constant delays in deliveries.
No strong quality control system.
Brand consistency breaks when trying to produce faster.
No replicable workflow to produce, review, and deliver creatives.
Production costs are unpredictable.
Every new client or campaign increases operational chaos.
No clear structure for briefing, review, approval, and delivery.
Wasting time fixing errors that should be avoided by the system.
No clear naming convention, organization, or asset library.
Communication with freelancers or suppliers generates too much friction.
No reliable external layer to take responsibility for creative output.
Cannot scale production without losing control.
No creative SOPs to ensure repeatable quality.
No system that accumulates learning and improves over time.'''

es_lines = [l.strip() for l in es_raw.split('\n') if l.strip()]
en_lines = [l.strip() for l in en_raw.split('\n') if l.strip()]

es_data = []
en_data = []

for i, line in enumerate(es_lines):
    p = 1
    if i >= 20: p = 2
    if i >= 40: p = 3
    es_data.append({'text': line, 'p': p})

for i, line in enumerate(en_lines):
    p = 1
    if i >= 20: p = 2
    if i >= 40: p = 3
    en_data.append({'text': line, 'p': p})

output = 'const PROBLEMS_DATA = {\n  es: [\n'
for item in es_data:
    output += f'    {{ text: "{item["text"]}", p: {item["p"]} }},\n'
output += '  ],\n  en: [\n'
for item in en_data:
    output += f'    {{ text: "{item["text"]}", p: {item["p"]} }},\n'
output += '  ],\n};\n'

with io.open(r'c:\Users\Admin\Downloads\WEB 2.0\app.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find('const PROBLEMS_DATA = {')
end_idx = content.find('function ProblemsSection({ lang }) {')

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + output + "\n" + content[end_idx:]
    new_content = new_content.replace('35</span>', '60</span>')
    new_content = new_content.replace('35 variaciones', '60 variaciones')
    new_content = new_content.replace('35 variations', '60 variations')
    with io.open(r'c:\Users\Admin\Downloads\WEB 2.0\app.jsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("app.jsx successfully updated!")
else:
    print("Could not find insertion points")