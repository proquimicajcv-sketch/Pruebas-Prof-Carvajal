import type { IsabellaExamConfig } from '../types/exam.ts';

export const isabellaBioExamData: IsabellaExamConfig = {
  level: '10-bio-isa',
  title: 'Biología Isabella Antonino',
  subtitle: 'Prueba de Biología (Adecuación Significativa)',
  themeColor: '#047857',
  matching1Title: 'II Parte: Asocie 1 (Relaciones Biológicas)',
  matching2Title: 'III Parte: Asocie 2 (Ecosistema y Niveles Tróficos)',
  images: {
    section1: {
      path: '/src/assets/images/bio_isa_interactions_clean_1794934559439.jpg',
      alt: 'Ilustración de interacciones biológicas: abeja y flor (mutualismo), garza y ganado (comensalismo), oso y salmón (depredación) y manada de lobos (asociación)',
      caption:
        'Figura 1. Interacciones biológicas: mutualismo (abeja y flor), comensalismo (garza y ganado), depredación (oso y salmón) y asociación (manada de lobos).',
    },
    section2: {
      path: '/src/assets/images/bio_isa_photosynthesis_clean_1794934559831.jpg',
      alt: 'Diagrama ilustrativo de la fotosíntesis en una planta con luz solar, raíces absorbiendo agua, cloroplasto con clorofila y liberación de oxígeno',
      caption:
        'Figura 2. Proceso de fotosíntesis: absorción de agua por las raíces, luz solar captada por la clorofila en los cloroplastos y liberación de oxígeno.',
    },
    section3: {
      path: '/src/assets/images/bio_isa_food_web_clean_1794934559194.jpg',
      alt: 'Ilustración de un ecosistema mostrando factores abióticos como el sol y el agua junto a productores, consumidores primarios y depredador tope',
      caption:
        'Figura 3. Componentes abióticos (sol y agua) y niveles tróficos: plantas (productores), saltamontes y conejo (consumidores primarios) y halcón (depredador tope).',
    },
  },
  selection: [
    {
      q: '¿Cómo se denominan las interacciones biológicas que ocurren entre organismos de la misma especie?',
      options: [
        'A) Relaciones interespecíficas',
        'B) Relaciones intraespecíficas',
        'C) Fotosíntesis',
      ],
      correct: 1,
    },
    {
      q: '¿Cuál de los siguientes ejemplos corresponde a una relación intraespecífica de competencia?',
      options: [
        'A) Los leones compiten entre sí por el dominio del territorio y la reproducción.',
        'B) La abeja se alimenta del néctar de la flor.',
        'C) El oso caza salmones en el río.',
      ],
      correct: 0,
    },
    {
      q: '¿Qué nombre recibe la relación donde los animales cooperan entre sí para cazar o defenderse, como los lobos que se unen en grupos?',
      options: ['A) Parasitismo', 'B) Asociación', 'C) Depredación'],
      correct: 1,
    },
    {
      q: '¿Cómo se clasifican las interacciones que se dan entre individuos de diferentes especies?',
      options: [
        'A) Relaciones interespecíficas',
        'B) Relaciones intraespecíficas',
        'C) Componentes abióticos',
      ],
      correct: 0,
    },
    {
      q: '¿Cuál es el tipo de relación simbiótica en donde dos especies diferentes se benefician mutuamente por decisión propia (como la abeja y la flor)?',
      options: ['A) Parasitismo', 'B) Mutualismo', 'C) Competencia'],
      correct: 1,
    },
    {
      q: '¿Qué nombre recibe la interacción biológica en la que uno de los intervinientes obtiene un beneficio, mientras que el otro no se perjudica ni se beneficia (como la garza y el ganado)?',
      options: ['A) Comensalismo', 'B) Depredación', 'C) Mutualismo'],
      correct: 0,
    },
    {
      q: '¿Cómo se le llama a la relación estrecha en la cual un parásito depende de un huésped, obteniendo beneficio y perjudicándolo (como las pulgas en un perro)?',
      options: ['A) Parasitismo', 'B) Asociación', 'C) Comensalismo'],
      correct: 0,
    },
    {
      q: '¿Qué interacción biológica ocurre cuando un individuo más fuerte (depredador) caza y se alimenta de otro (presa), como el oso pardo y el salmón?',
      options: ['A) Depredación', 'B) Mutualismo', 'C) Competencia'],
      correct: 0,
    },
    {
      q: '¿Cómo se le llama al proceso que realizan las plantas para fabricar su propio alimento a partir de luz solar, dióxido de carbono y agua?',
      options: ['A) Respiración', 'B) Fotosíntesis', 'C) Digestión'],
      correct: 1,
    },
    {
      q: '¿En qué estructura celular de las hojas y tallos se lleva a cabo la fotosíntesis?',
      options: [
        'A) En los cloroplastos',
        'B) En el núcleo celular',
        'C) En la membrana plasmática',
      ],
      correct: 0,
    },
    {
      q: '¿Cómo se llama el pigmento de color verde que se encuentra dentro de los cloroplastos y tiene la capacidad de absorber la energía de la luz solar?',
      options: ['A) Hemoglobina', 'B) Clorofila', 'C) Queratina'],
      correct: 1,
    },
    {
      q: '¿Cuáles son los dos componentes finales que se obtienen como resultado del proceso de la fotosíntesis?',
      options: [
        'A) Glucosa (alimento) y oxígeno',
        'B) Agua y dióxido de carbono',
        'C) Sales minerales y nitrógeno',
      ],
      correct: 0,
    },
    {
      q: '¿Cuál es el papel principal de las raíces de las plantas durante el proceso de la fotosíntesis?',
      options: [
        'A) Absorben el agua y los minerales de la tierra',
        'B) Capturan directamente la luz del Sol',
        'C) Fabrican la clorofila verde',
      ],
      correct: 0,
    },
    {
      q: '¿Qué elemento gaseoso liberan las plantas hacia la atmósfera como parte de los productos finales de la fotosíntesis?',
      options: ['A) Dióxido de carbono', 'B) Oxígeno', 'C) Monóxido de carbono'],
      correct: 1,
    },
    {
      q: '¿Cuál es una de las importancias principales de la fotosíntesis para los seres vivos en la Tierra?',
      options: [
        'A) Permite que las plantas expulsen el oxígeno que necesitamos para respirar.',
        'B) Produce el calentamiento global del planeta.',
        'C) Elimina por completo el agua de los ríos.',
      ],
      correct: 0,
    },
    {
      q: '¿Cómo se denominan aquellos elementos de un ecosistema que no poseen vida, pero son imprescindibles para la supervivencia (como el agua, el suelo y la luz solar)?',
      options: [
        'A) Componentes bióticos',
        'B) Componentes abióticos',
        'C) Niveles tróficos',
      ],
      correct: 1,
    },
    {
      q: '¿Cuál de los siguientes ejemplos corresponde a un componente biótico (con vida) de un ecosistema?',
      options: [
        'A) Las plantas y los animales',
        'B) Las rocas del río',
        'C) La luz solar',
      ],
      correct: 0,
    },
    {
      q: 'En una cadena alimentaria, ¿qué nombre reciben los organismos productores capaces de fabricar su propio alimento?',
      options: [
        'A) Las plantas',
        'B) Los animales carnívoros',
        'C) Los descomponedores',
      ],
      correct: 0,
    },
    {
      q: '¿Cómo se les llama a los animales herbívoros que se alimentan directamente de las plantas en una cadena trófica (como el conejo o el saltamontes)?',
      options: [
        'A) Consumidores primarios',
        'B) Consumidores terciarios',
        'C) Productores',
      ],
      correct: 0,
    },
    {
      q: '¿Qué representa una trama alimentaria dentro de una comunidad ecológica?',
      options: [
        'A) La interconexión natural de las cadenas alimenticias (quién se come a quién).',
        'B) Una sola línea recta de depredadores.',
        'C) La cantidad de agua que absorbe una planta.',
      ],
      correct: 0,
    },
  ],
  matching1: [
    {
      concept: 'Mutualismo',
      options: [
        '1. Relación donde las pulgas se alimentan de la sangre de los animales perjudicándolos.',
        '2. Interacción donde uno se beneficia y el otro no se perjudica ni se beneficia.',
        '3. Relación simbiótica donde ambas especies diferentes se benefician mutuamente.',
        '4. Relación intraespecífica donde animales cooperan para cazar o defenderse.',
        '5. Interacción donde un animal fuerte caza y se alimenta de una presa.',
      ],
      correctIndex: 2,
    },
    {
      concept: 'Depredación',
      options: [
        '1. Relación donde las pulgas se alimentan de la sangre de los animales perjudicándolos.',
        '2. Interacción donde uno se beneficia y el otro no se perjudica ni se beneficia.',
        '3. Relación simbiótica donde ambas especies diferentes se benefician mutuamente.',
        '4. Relación intraespecífica donde animales cooperan para cazar o defenderse.',
        '5. Interacción donde un animal fuerte caza y se alimenta de una presa.',
      ],
      correctIndex: 4,
    },
    {
      concept: 'Parasitismo',
      options: [
        '1. Relación donde las pulgas se alimentan de la sangre de los animales perjudicándolos.',
        '2. Interacción donde uno se beneficia y el otro no se perjudica ni se beneficia.',
        '3. Relación simbiótica donde ambas especies diferentes se benefician mutuamente.',
        '4. Relación intraespecífica donde animales cooperan para cazar o defenderse.',
        '5. Interacción donde un animal fuerte caza y se alimenta de una presa.',
      ],
      correctIndex: 0,
    },
    {
      concept: 'Asociación',
      options: [
        '1. Relación donde las pulgas se alimentan de la sangre de los animales perjudicándolos.',
        '2. Interacción donde uno se beneficia y el otro no se perjudica ni se beneficia.',
        '3. Relación simbiótica donde ambas especies diferentes se benefician mutuamente.',
        '4. Relación intraespecífica donde animales cooperan para cazar o defenderse.',
        '5. Interacción donde un animal fuerte caza y se alimenta de una presa.',
      ],
      correctIndex: 3,
    },
    {
      concept: 'Comensalismo',
      options: [
        '1. Relación donde las pulgas se alimentan de la sangre de los animales perjudicándolos.',
        '2. Interacción donde uno se beneficia y el otro no se perjudica ni se beneficia.',
        '3. Relación simbiótica donde ambas especies diferentes se benefician mutuamente.',
        '4. Relación intraespecífica donde animales cooperan para cazar o defenderse.',
        '5. Interacción donde un animal fuerte caza y se alimenta de una presa.',
      ],
      correctIndex: 1,
    },
  ],
  matching2: [
    {
      concept: 'La luz solar y el agua',
      options: [
        '1. Organismo productor en la cadena alimentaria.',
        '2. Componentes abióticos (sin vida) del ecosistema.',
        '3. Pigmento verde que absorbe la luz para la fotosíntesis.',
        '4. Consumidor primario (herbívoro).',
        '5. Consumidor terciario o depredador tope.',
      ],
      correctIndex: 1,
    },
    {
      concept: 'Las plantas',
      options: [
        '1. Organismo productor en la cadena alimentaria.',
        '2. Componentes abióticos (sin vida) del ecosistema.',
        '3. Pigmento verde que absorbe la luz para la fotosíntesis.',
        '4. Consumidor primario (herbívoro).',
        '5. Consumidor terciario o depredador tope.',
      ],
      correctIndex: 0,
    },
    {
      concept: 'El saltamontes / caracol',
      options: [
        '1. Organismo productor en la cadena alimentaria.',
        '2. Componentes abióticos (sin vida) del ecosistema.',
        '3. Pigmento verde que absorbe la luz para la fotosíntesis.',
        '4. Consumidor primario (herbívoro).',
        '5. Consumidor terciario o depredador tope.',
      ],
      correctIndex: 3,
    },
    {
      concept: 'La clorofila',
      options: [
        '1. Organismo productor en la cadena alimentaria.',
        '2. Componentes abióticos (sin vida) del ecosistema.',
        '3. Pigmento verde que absorbe la luz para la fotosíntesis.',
        '4. Consumidor primario (herbívoro).',
        '5. Consumidor terciario o depredador tope.',
      ],
      correctIndex: 2,
    },
    {
      concept: 'El halcón',
      options: [
        '1. Organismo productor en la cadena alimentaria.',
        '2. Componentes abióticos (sin vida) del ecosistema.',
        '3. Pigmento verde que absorbe la luz para la fotosíntesis.',
        '4. Consumidor primario (herbívoro).',
        '5. Consumidor terciario o depredador tope.',
      ],
      correctIndex: 4,
    },
  ],
  completes: [
    {
      prompt:
        'Las interacciones biológicas que ocurren entre organismos de la misma especie se llaman ______________________.',
      answer: 'RELACIONES INTRAESPECIFICAS',
      acceptableAnswers: ['RELACIONES INTRAESPECIFICAS', 'INTRAESPECIFICAS'],
    },
    {
      prompt:
        'El proceso mediante el cual las plantas fabrican su propio alimento utilizando luz solar se llama ______________________.',
      answer: 'FOTOSINTESIS',
      acceptableAnswers: ['FOTOSINTESIS'],
    },
    {
      prompt:
        'El pigmento de color verde encargado de absorber la luz del Sol en las hojas se llama ______________________.',
      answer: 'CLOROFILA',
      acceptableAnswers: ['CLOROFILA'],
    },
    {
      prompt:
        'Los componentes de un ecosistema que no poseen vida (como el agua y el suelo) se denominan ______________________.',
      answer: 'COMPONENTES ABIOTICOS',
      acceptableAnswers: ['COMPONENTES ABIOTICOS', 'ABIOTICOS'],
    },
    {
      prompt:
        'Las plantas ocupan el nivel trófico de ______________________ porque fabrican su propio alimento.',
      answer: 'PRODUCTORES',
      acceptableAnswers: ['PRODUCTORES', 'PRODUCTOR', 'ORGANISMOS PRODUCTORES'],
    },
  ],
  development: {
    context:
      'La fotosíntesis es fundamental para la vida en nuestro planeta, ya que permite a las plantas producir su alimento y brindar grandes beneficios al ambiente.',
    question:
      'Mencione dos importancias o aportes de la fotosíntesis para los seres vivos y el ambiente.',
    hint: 'Escriba dos razones claras (1 punto por cada beneficio válido explicado).',
    value: 2,
  },
};
