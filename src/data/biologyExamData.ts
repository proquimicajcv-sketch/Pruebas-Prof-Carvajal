import type { BiologyExamConfig } from '../types/exam.ts';

// Miércoles 18 de noviembre de 2026 — Evaluaciones habilitadas inmediatamente
export const BIOLOGY_UNLOCK_ISO = '2026-11-18T07:00:00-06:00';

export function isBiologyScheduledOpen(nowMs: number = Date.now()): boolean {
  return nowMs >= Date.parse(BIOLOGY_UNLOCK_ISO);
}

export const biologyExamData: BiologyExamConfig = {
  level: '10-bio',
  title: 'Biología de 10.° Año',
  subtitle: 'Taller de Investigación y Análisis a Libro Abierto (Versión Ampliada)',
  themeColor: '#059669',
  unlockAtIso: BIOLOGY_UNLOCK_ISO,
  modules: [
    {
      id: 'mod1',
      tabLabel: 'Módulo 1: Origen de la Vida',
      title: 'MÓDULO 1: Origen y Evolución de la Vida (Lección 12)',
      subtitle: 'Valor del módulo: 18 puntos (3 preguntas · 9 subpreguntas de 2 pts)',
      imagePath: '/src/assets/images/bio_m1_origin_endosymbiosis_1794852111601.jpg',
      imageAlt:
        'Ilustración científica de la síntesis prebiótica en la Tierra primitiva y el origen endosimbiótico de la mitocondria',
      imageCaption:
        'Figura 1. Síntesis prebiótica en atmósfera reductora (Miller-Urey) e incorporación endosimbiótica de bacterias aeróbicas ancestrales.',
      questions: [
        {
          number: 1,
          title: 'El debate histórico sobre el origen de la vida y la síntesis prebiótica',
          subquestions: [
            {
              id: '1a',
              label: 'a',
              prompt:
                'Explique qué condiciones fisicoquímicas de la Tierra primitiva hacían inviable el surgimiento directo de organismos complejos según la teoría quimiosintética.',
              value: 2,
            },
            {
              id: '1b',
              label: 'b',
              prompt:
                'Describa cómo el modelo experimental de Miller y Urey (1953) logró simular el caldo primordial en ausencia de oxígeno libre.',
              value: 2,
            },
            {
              id: '1c',
              label: 'c',
              prompt:
                'Contraste la teoría quimiosintética con la hipótesis de la panspermia en cuanto al lugar de origen de las primeras moléculas orgánicas.',
              value: 2,
            },
          ],
        },
        {
          number: 2,
          title: 'La revolución endosimbiótica de Lynn Margulis (1971)',
          subquestions: [
            {
              id: '2a',
              label: 'a',
              prompt:
                'Explique el proceso biológico mediante el cual una célula anaeróbica primitiva incorporó bacterias aeróbicas dando origen a las mitocondrias.',
              value: 2,
            },
            {
              id: '2b',
              label: 'b',
              prompt:
                'Mencione y detalle dos de las pruebas fundamentales (doble membrana, fisión binaria, ADN circular o ARNr) que sustentan la teoría endosimbiótica.',
              value: 2,
            },
            {
              id: '2c',
              label: 'c',
              prompt:
                'Si una mutación alterara irreversiblemente el ADN propio de las mitocondrias humanas, ¿por qué la célula eucariota perdería su viabilidad energética?',
              value: 2,
            },
          ],
        },
        {
          number: 3,
          title: 'La paradoja del mundo de ARN y la transición celular',
          subquestions: [
            {
              id: '3a',
              label: 'a',
              prompt:
                'Explique la hipótesis del "Mundo de ARN" propuesta por Walter Gilbert en la evolución celular temprana.',
              value: 2,
            },
            {
              id: '3b',
              label: 'b',
              prompt:
                '¿Qué doble propiedad fisicoquímica poseía el ARN ancestral que le permitió cumplir simultáneamente roles genéticos y metabólicos?',
              value: 2,
            },
            {
              id: '3c',
              label: 'c',
              prompt:
                'Analice por qué la posterior evolución biológica desplazó al ARN, delegando el almacenamiento genético exclusivo en el ADN.',
              value: 2,
            },
          ],
        },
      ],
    },
    {
      id: 'mod2',
      tabLabel: 'Módulo 2: Ideas Evolutivas',
      title: 'MÓDULO 2: Biodiversidad y Primeras Ideas Evolutivas (Lección 13)',
      subtitle: 'Valor del módulo: 18 puntos (3 preguntas · 9 subpreguntas de 2 pts)',
      imagePath: '/src/assets/images/bio_m2_evolution_anatomy_1794852112300.jpg',
      imageAlt:
        'Ilustración científica comparada de extremidades homólogas de vertebrados y pinzones de las islas Galápagos',
      imageCaption:
        'Figura 2. Anatomía comparada de estructuras homólogas en vertebrados y radiación adaptativa en pinzones de Galápagos.',
      questions: [
        {
          number: 4,
          title: 'El impacto geológico en el pensamiento evolutivo',
          subquestions: [
            {
              id: '4a',
              label: 'a',
              prompt:
                'Explique en qué consisten las corrientes uniformistas y gradualistas formuladas por James Hutton y Charles Lyell.',
              value: 2,
            },
            {
              id: '4b',
              label: 'b',
              prompt:
                'Describa cómo influyeron estas premisas geológicas en las deducciones de Charles Darwin durante su viaje en el Beagle.',
              value: 2,
            },
            {
              id: '4c',
              label: 'c',
              prompt:
                'Justifique por qué una Tierra considerada "inmensamente antigua" constituía un requisito físico indispensable para que operara la selección natural.',
              value: 2,
            },
          ],
        },
        {
          number: 5,
          title: 'Lamarck frente a la síntesis moderna',
          subquestions: [
            {
              id: '5a',
              label: 'a',
              prompt:
                'Detalle el mecanismo evolutivo propuesto por Jean-Baptiste Lamarck basado en la herencia de los caracteres adquiridos (uso y desuso).',
              value: 2,
            },
            {
              id: '5b',
              label: 'b',
              prompt:
                'Contraste dicho postulado con el mecanismo de variación heredable y selección natural propuesto por Darwin y Wallace.',
              value: 2,
            },
            {
              id: '5c',
              label: 'c',
              prompt:
                'Explique por qué la genética moderna descarta que un cambio morfológico inducido por el uso durante la vida de un organismo se transmita directamente a la descendencia.',
              value: 2,
            },
          ],
        },
        {
          number: 6,
          title: 'La triangulación de evidencias evolutivas',
          subquestions: [
            {
              id: '6a',
              label: 'a',
              prompt:
                'Defina y diferencie las estructuras anatómicas homólogas de las análogas, aportando un ejemplo biológico para cada caso.',
              value: 2,
            },
            {
              id: '6b',
              label: 'b',
              prompt:
                'Explique cómo la embriología comparada (como el análisis de patrones embrionarios tempranos) aporta pruebas de un ancestro común.',
              value: 2,
            },
            {
              id: '6c',
              label: 'c',
              prompt:
                'Analice la importancia de las evidencias moleculares (como la universalidad del código genético y el citocromo c) en la filogenia actual.',
              value: 2,
            },
          ],
        },
      ],
    },
    {
      id: 'mod3',
      tabLabel: 'Módulo 3: Genética y Especiación',
      title: 'MÓDULO 3: Mecanismos de la Evolución y Genética de Poblaciones (Lección 14)',
      subtitle: 'Valor del módulo: 24 puntos (4 preguntas · 12 subpreguntas de 2 pts)',
      imagePath: '/src/assets/images/bio_m3_population_genetics_1794852113050.jpg',
      imageAlt:
        'Esquema científico de cuello de botella genético, especiación alopátrica y curvas de selección estabilizadora y disruptiva',
      imageCaption:
        'Figura 3. Deriva génica (cuello de botella y efecto fundador), especiación alopátrica por barrera geográfica y topología de la selección natural.',
      questions: [
        {
          number: 7,
          title: 'Deriva génica y catástrofes poblacionales',
          subquestions: [
            {
              id: '7a',
              label: 'a',
              prompt:
                'Defina el concepto de acervo genético y explique qué es la deriva génica en poblaciones pequeñas.',
              value: 2,
            },
            {
              id: '7b',
              label: 'b',
              prompt:
                'Distinga los mecanismos del efecto fundador frente al cuello de botella en la pérdida de diversidad alélica.',
              value: 2,
            },
            {
              id: '7c',
              label: 'c',
              prompt:
                'Si una población silvestre en Costa Rica sufre un cuello de botella extremo, ¿cómo afectará esto su capacidad de adaptación ante una epidemia?',
              value: 2,
            },
          ],
        },
        {
          number: 8,
          title: 'Modelos matemáticos de poblaciones (Hardy-Weinberg)',
          subquestions: [
            {
              id: '8a',
              label: 'a',
              prompt:
                'Enuncie las cinco condiciones teóricas necesarias para que una población se mantenga en equilibrio de Hardy-Weinberg (sin evolucionar).',
              value: 2,
            },
            {
              id: '8b',
              label: 'b',
              prompt:
                'Describa el significado biológico y matemático de las ecuaciones p + q = 1 y p² + 2pq + q² = 1.',
              value: 2,
            },
            {
              id: '8c',
              label: 'c',
              prompt:
                'Analice por qué en la realidad ecológica de los ecosistemas tropicales es imposible que una población natural cumpla con dichas condiciones.',
              value: 2,
            },
          ],
        },
        {
          number: 9,
          title: 'Aislamiento reproductivo y especiación alopátrica',
          subquestions: [
            {
              id: '9a',
              label: 'a',
              prompt:
                'Explique cómo una barrera geográfica desencadena el proceso de especiación alopátrica.',
              value: 2,
            },
            {
              id: '9b',
              label: 'b',
              prompt:
                'Diferencie los mecanismos de aislamiento reproductivo precigótico (ej. temporal o ecológico) de los poscigóticos (ej. esterilidad de híbridos).',
              value: 2,
            },
            {
              id: '9c',
              label: 'c',
              prompt:
                'Relacione este proceso con el fenómeno de la radiación adaptativa tomando como referencia los pinzones de las islas Galápagos.',
              value: 2,
            },
          ],
        },
        {
          number: 10,
          title: 'La dinámica y topología de la selección natural',
          subquestions: [
            {
              id: '10a',
              label: 'a',
              prompt:
                'Describa el funcionamiento de la selección estabilizadora y explique qué tipo de fenotipos favorece en la población.',
              value: 2,
            },
            {
              id: '10b',
              label: 'b',
              prompt:
                'Analice las características de la selección disruptiva y su rol como promotora de la divergencia poblacional.',
              value: 2,
            },
            {
              id: '10c',
              label: 'c',
              prompt:
                'Explique en qué consiste la selección sexual, distinguiendo entre la competencia intrasexual y la elección intersexual.',
              value: 2,
            },
          ],
        },
      ],
    },
  ],
};
