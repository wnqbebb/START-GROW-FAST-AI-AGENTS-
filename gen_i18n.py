# -*- coding: utf-8 -*-
import io

es_services = '''      items: [
        {
          tag: "01 / Entry",
          name: "Creative Sprint White-Label",
          cycle: "Proyecto puntual",
          promise: "En 7 días te entregamos un lote de creativos listos para testear para una campaña o cliente ecommerce, sin contratar más equipo ni coordinar producción tradicional.",
          bullets: [
            "Análisis rápido de la marca/campaña",
            "3–5 ángulos creativos para test",
            "5 creativos estáticos hiperrealistas",
            "2 videos cortos tipo UGC IA, B-roll o product ad",
            "Hooks y líneas de copy visual",
            "Adaptaciones para Meta/TikTok/Reels",
          ],
        },
        {
          tag: "02 / Core",
          name: "Creative Testing Retainer",
          cycle: "Retainer mensual",
          promise: "Backlog creativo mensual para agencias y marcas que necesitan alimentar tests cada semana sin saturar a su equipo interno.",
          bullets: [
            "Producción semanal o quincenal",
            "Nuevos hooks, ángulos y UGC IA",
            "Variaciones A/B + refresh creativo",
            "Dirección creativa mensual + QA",
            "Reporte de aprendizaje continuo",
          ],
        },
        {
          tag: "03 / Sistema",
          name: "Creative Performance OS",
          cycle: "Partnership",
          promise: "Instalamos y operamos un sistema creativo de performance para que tu equipo produzca, testee, aprenda y refresque campañas con una operación repetible.",
          bullets: [
            "Intake estandarizado + memoria",
            "Librería de hooks y ángulos",
            "Estructura de backlog creativo",
            "Feedback loop + reporting",
            "Priorización y SOPs internos",
          ],
        },
        {
          tag: "04 / Premium",
          name: "AI Campaign Production",
          cycle: "Por proyecto",
          promise: "Campañas visuales premium con IA para lanzamientos, colecciones y conceptos caros o lentos de producir tradicionalmente.",
          bullets: [
            "Concepto de campaña y narrativa",
            "Dirección creativa y modelos IA",
            "B-roll y UGC premium",
            "Hero ads y lookbooks",
            "Campañas por temporada o lanzamiento",
          ],
        },
        {
          tag: "05 / Elite",
          name: "White-Label Creative Department",
          cycle: "Partnership estratégico",
          promise: "Operamos como el departamento creativo externo de tu agencia para producir backlog de anuncios, variaciones y campañas para múltiples clientes sin equipo interno.",
          bullets: [
            "Producción para múltiples clientes",
            "Sistema de intake por cliente",
            "QA centralizado y calendario",
            "Backlog por marca/campaña",
            "Procesos y memoria creativa compartida",
          ],
        },
      ],'''

en_services = '''      items: [
        {
          tag: "01 / Entry",
          name: "Creative Sprint White-Label",
          cycle: "One-time project",
          promise: "In 7 days we deliver a batch of creatives ready to test for an ecommerce campaign or client, without hiring more team members or coordinating traditional production.",
          bullets: [
            "Quick brand/campaign analysis",
            "3-5 creative angles for testing",
            "5 hyper-realistic static creatives",
            "2 short videos (AI UGC, B-roll, product ad)",
            "Hooks and visual copy lines",
            "Meta / TikTok / Reels adaptations",
          ],
        },
        {
          tag: "02 / Core",
          name: "Creative Testing Retainer",
          cycle: "Monthly retainer",
          promise: "Monthly creative backlog for agencies and brands that need to feed weekly tests without saturating their internal team.",
          bullets: [
            "Weekly or bi-weekly production",
            "New hooks, angles and AI UGC",
            "A/B variations + creative refresh",
            "Monthly creative direction + QA",
            "Continuous learning report",
          ],
        },
        {
          tag: "03 / System",
          name: "Creative Performance OS",
          cycle: "Partnership",
          promise: "We install and operate a creative performance system so your team produces, tests, learns, and refreshes campaigns with a repeatable operation.",
          bullets: [
            "Standardized intake + memory",
            "Hooks and angles library",
            "Creative backlog structure",
            "Feedback loop + reporting",
            "Prioritization and internal SOPs",
          ],
        },
        {
          tag: "04 / Premium",
          name: "AI Campaign Production",
          cycle: "Per project",
          promise: "Premium visual campaigns with AI for launches, collections, and concepts that would be expensive or slow to produce traditionally.",
          bullets: [
            "Campaign concept and narrative",
            "Creative direction and AI models",
            "B-roll and premium UGC",
            "Hero ads and lookbooks",
            "Seasonal or launch campaigns",
          ],
        },
        {
          tag: "05 / Elite",
          name: "White-Label Creative Department",
          cycle: "Strategic partnership",
          promise: "We operate as the external creative department of your agency to produce a backlog of ads, variations, and campaigns for multiple clients without internal team.",
          bullets: [
            "Production for multiple clients",
            "Per-client intake system",
            "Centralized QA and calendar",
            "Backlog per brand/campaign",
            "Shared processes and creative memory",
          ],
        },
      ],'''

with io.open(r'c:\Users\Admin\Downloads\WEB 2.0\i18n.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace ES
es_start_marker = '      items: [\n        {\n          tag: "01 / Entrada"'
es_end_marker = '      footnote: "Sin precios'
es_start_idx = content.find(es_start_marker)
es_end_idx = content.find(es_end_marker)

if es_start_idx != -1 and es_end_idx != -1:
    content = content[:es_start_idx] + es_services + "\n" + content[es_end_idx:]

# Replace EN
en_start_marker = '      items: [\n        {\n          tag: "01 / Entry"'
en_end_marker = '      footnote: "No pricing'
en_start_idx = content.find(en_start_marker)
en_end_idx = content.find(en_end_marker)

if en_start_idx != -1 and en_end_idx != -1:
    content = content[:en_start_idx] + en_services + "\n" + content[en_end_idx:]

with io.open(r'c:\Users\Admin\Downloads\WEB 2.0\i18n.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("i18n.js updated successfully")