import type { IsabellaExamConfig } from '../types/exam.ts';

export const isabellaExamData: IsabellaExamConfig = {
  level: '10-quim-isa',
  title: 'Química Isabella Antonino',
  subtitle: 'Prueba de Química 10.° Año (Adaptación Significativa)',
  themeColor: '#0d9488',
  matching1Title: 'II Parte: Asocie 1 (Fenómenos de Luz y Energía)',
  matching2Title: 'III Parte: Asocie 2 (Clasificación de Energías)',
  images: {
    section1: {
      path: '/src/assets/images/isa_light_reflection_refraction_1794857898449.jpg',
      alt: 'Ilustración educativa de reflexión de la luz en un espejo y refracción con un lápiz en agua y una lupa',
      caption:
        'Figura 1. Reflexión de la luz en un espejo (izquierda) y refracción de la luz con lápiz en agua y lupa (derecha).',
    },
    section2: {
      path: '/src/assets/images/isa_clean_renewable_energies_1794857899760.jpg',
      alt: 'Ilustración de energías limpias y renovables en Costa Rica: hidroeléctrica, eólica, solar y geotérmica',
      caption:
        'Figura 2. Fuentes principales de energía limpia y renovable: hidroeléctrica, eólica, solar y geotérmica volcánica.',
    },
    section3: {
      path: '/src/assets/images/isa_energy_comparison_clean_fossil_1794857898437.jpg',
      alt: 'Comparación visual entre energías limpias renovables y combustibles fósiles contaminantes',
      caption:
        'Figura 3. Comparación entre energías limpias o renovables (izquierda) y energías contaminantes o no renovables como carbón y petróleo (derecha).',
    },
  },
  selection: [
    {
      q: '¿Cómo se le llama al cambio de dirección y sentido que sufren los rayos luminosos al chocar contra la superficie de un objeto?',
      options: ['A) Refracción', 'B) Reflexión', 'C) Eutrofización'],
      correct: 1,
    },
    {
      q: '¿Cuál es un ejemplo claro de un objeto que nos permite ver nuestra imagen gracias a la reflexión de la luz?',
      options: ['A) Un espejo', 'B) Un trozo de madera', 'C) Una pared opaca'],
      correct: 0,
    },
    {
      q: '¿Qué fenómeno ocurre cuando un rayo de luz pasa de un medio a otro y parece que un objeto (como un lápiz en un vaso con agua) se dobla?',
      options: ['A) Reflexión', 'B) Refracción', 'C) Combustión'],
      correct: 1,
    },
    {
      q: '¿Cuál de las siguientes herramientas de uso cotidiano utiliza la luz para ampliar la imagen de objetos pequeños?',
      options: ['A) La lupa', 'B) Una piedra', 'C) Un martillo'],
      correct: 0,
    },
    {
      q: '¿Cómo se le llama a la energía que se genera al transformar la fuerza del agua en electricidad, siendo la más utilizada en Costa Rica?',
      options: ['A) Energía eólica', 'B) Energía hidroeléctrica', 'C) Energía nuclear'],
      correct: 1,
    },
    {
      q: '¿Cuál de las siguientes opciones corresponde a una fuente natural de energía lumínica?',
      options: ['A) El Sol', 'B) Un bombillo eléctrico', 'C) Una linterna de pilas'],
      correct: 0,
    },
    {
      q: '¿Qué nombre recibe la manifestación de la energía en forma de calor debido al movimiento de las moléculas?',
      options: ['A) Energía calórica', 'B) Energía eólica', 'C) Energía mareomotriz'],
      correct: 0,
    },
    {
      q: '¿Cuál es el tipo de energía que se libera o se produce como consecuencia de una reacción química, como en los alimentos o los combustibles?',
      options: ['A) Energía química', 'B) Energía solar', 'C) Energía sísmica'],
      correct: 0,
    },
    {
      q: '¿De dónde proviene principalmente la energía geotérmica que se utiliza para generar electricidad en Costa Rica (como en el Proyecto Miravalles)?',
      options: [
        'A) Del viento de las llanuras',
        'B) Del vapor emitido por la roca caliente debajo de los volcanes',
        'C) De las olas del mar Caribe',
      ],
      correct: 1,
    },
    {
      q: '¿Cómo se le llama a la energía obtenida mediante el aprovechamiento de la fuerza del viento con la ayuda de aerogeneradores?',
      options: ['A) Energía eólica', 'B) Energía nuclear', 'C) Energía geotérmica'],
      correct: 0,
    },
    {
      q: '¿Qué tipo de energía se libera o se genera cuando ocurre un sismo o un terremoto en nuestro país?',
      options: ['A) Energía sísmica', 'B) Energía solar', 'C) Energía hidroeléctrica'],
      correct: 0,
    },
    {
      q: '¿Cuál es una característica principal de la energía solar?',
      options: [
        'A) Es una energía renovable, limpia y no contamina',
        'B) Produce altas emisiones de gas CO₂',
        'C) Se agota muy rápidamente',
      ],
      correct: 0,
    },
    {
      q: '¿Qué tipo de energía se produce gracias al movimiento generado por las mareas del océano?',
      options: ['A) Energía mareomotriz', 'B) Energía eólica', 'C) Energía calórica'],
      correct: 0,
    },
    {
      q: '¿Cómo se le llama también a las energías limpias que se reponen constantemente en la naturaleza?',
      options: [
        'A) Energías renovables',
        'B) Combustibles fósiles',
        'C) Energías no renovables',
      ],
      correct: 0,
    },
    {
      q: '¿Qué característica presentan las energías contaminantes o no renovables?',
      options: [
        'A) No producen ningún tipo de residuo',
        'B) Sus fuentes se agotan rápidamente y producen gases contaminantes como el CO₂',
        'C) Utilizan únicamente la fuerza del viento y el sol',
      ],
      correct: 1,
    },
    {
      q: '¿Cuál de los siguientes ejemplos es considerado una fuente de energía limpia o renovable?',
      options: ['A) El petróleo', 'B) El carbón mineral', 'C) La energía solar'],
      correct: 2,
    },
    {
      q: '¿Cuál de las siguientes opciones corresponde a una energía contaminante o no renovable?',
      options: ['A) El gas natural', 'B) La energía eólica', 'C) La energía geotérmica'],
      correct: 0,
    },
    {
      q: 'En la transformación de la energía, cuando un panel solar recibe la luz del Sol, ¿en qué tipo de energía se transforma principalmente para encender aparatos?',
      options: ['A) Energía eléctrica', 'B) Energía sonora', 'C) Energía química'],
      correct: 0,
    },
    {
      q: '¿Qué fuente artificial de energía calórica utilizamos comúnmente en los hogares para cocinar los alimentos?',
      options: ['A) Una cocina', 'B) Las estrellas lejanas', 'C) El magma volcánico'],
      correct: 0,
    },
    {
      q: '¿Por qué es importante cuidar y promover el uso de energías limpias en la actualidad?',
      options: [
        'A) Porque destruyen los recursos naturales rápidamente',
        'B) Porque protegen el ambiente, reducen la contaminación y cuidan el planeta',
        'C) Porque aumentan la cantidad de gases tóxicos en el aire',
      ],
      correct: 1,
    },
  ],
  matching1: [
    {
      concept: 'Reflexión de la luz',
      options: [
        '1. Energía obtenida mediante el aprovechamiento de la fuerza del viento.',
        '2. Energía que proviene del vapor de las rocas calientes bajo los volcanes.',
        '3. Cambio de dirección de la luz al chocar contra una superficie como un espejo.',
        '4. Energía renovable obtenida directamente de la radiación del Sol.',
        '5. Energía generada al transformar la fuerza del agua en electricidad.',
      ],
      correctIndex: 2,
    },
    {
      concept: 'Energía hidroeléctrica',
      options: [
        '1. Energía obtenida mediante el aprovechamiento de la fuerza del viento.',
        '2. Energía que proviene del vapor de las rocas calientes bajo los volcanes.',
        '3. Cambio de dirección de la luz al chocar contra una superficie como un espejo.',
        '4. Energía renovable obtenida directamente de la radiación del Sol.',
        '5. Energía generada al transformar la fuerza del agua en electricidad.',
      ],
      correctIndex: 4,
    },
    {
      concept: 'Energía eólica',
      options: [
        '1. Energía obtenida mediante el aprovechamiento de la fuerza del viento.',
        '2. Energía que proviene del vapor de las rocas calientes bajo los volcanes.',
        '3. Cambio de dirección de la luz al chocar contra una superficie como un espejo.',
        '4. Energía renovable obtenida directamente de la radiación del Sol.',
        '5. Energía generada al transformar la fuerza del agua en electricidad.',
      ],
      correctIndex: 0,
    },
    {
      concept: 'Energía geotérmica',
      options: [
        '1. Energía obtenida mediante el aprovechamiento de la fuerza del viento.',
        '2. Energía que proviene del vapor de las rocas calientes bajo los volcanes.',
        '3. Cambio de dirección de la luz al chocar contra una superficie como un espejo.',
        '4. Energía renovable obtenida directamente de la radiación del Sol.',
        '5. Energía generada al transformar la fuerza del agua en electricidad.',
      ],
      correctIndex: 1,
    },
    {
      concept: 'Energía solar',
      options: [
        '1. Energía obtenida mediante el aprovechamiento de la fuerza del viento.',
        '2. Energía que proviene del vapor de las rocas calientes bajo los volcanes.',
        '3. Cambio de dirección de la luz al chocar contra una superficie como un espejo.',
        '4. Energía renovable obtenida directamente de la radiación del Sol.',
        '5. Energía generada al transformar la fuerza del agua en electricidad.',
      ],
      correctIndex: 3,
    },
  ],
  matching2: [
    {
      concept: 'Petróleo',
      options: [
        '1. Fuente natural y limpia de energía lumínica.',
        '2. Energía contaminante o no renovable.',
        '3. Energía almacenada en el núcleo de los átomos.',
        '4. Energía limpia o renovable.',
        '5. Combustible fósil considerado energía no renovable.',
      ],
      correctIndex: 1,
    },
    {
      concept: 'El Sol',
      options: [
        '1. Fuente natural y limpia de energía lumínica.',
        '2. Energía contaminante o no renovable.',
        '3. Energía almacenada en el núcleo de los átomos.',
        '4. Energía limpia o renovable.',
        '5. Combustible fósil considerado energía no renovable.',
      ],
      correctIndex: 0,
    },
    {
      concept: 'Energía eólica',
      options: [
        '1. Fuente natural y limpia de energía lumínica.',
        '2. Energía contaminante o no renovable.',
        '3. Energía almacenada en el núcleo de los átomos.',
        '4. Energía limpia o renovable.',
        '5. Combustible fósil considerado energía no renovable.',
      ],
      correctIndex: 3,
    },
    {
      concept: 'Energía nuclear',
      options: [
        '1. Fuente natural y limpia de energía lumínica.',
        '2. Energía contaminante o no renovable.',
        '3. Energía almacenada en el núcleo de los átomos.',
        '4. Energía limpia o renovable.',
        '5. Combustible fósil considerado energía no renovable.',
      ],
      correctIndex: 2,
    },
    {
      concept: 'Carbón',
      options: [
        '1. Fuente natural y limpia de energía lumínica.',
        '2. Energía contaminante o no renovable.',
        '3. Energía almacenada en el núcleo de los átomos.',
        '4. Energía limpia o renovable.',
        '5. Combustible fósil considerado energía no renovable.',
      ],
      correctIndex: 4,
    },
  ],
  completes: [
    {
      prompt:
        'El fenómeno en el cual un lápiz parece doblarse dentro de un vaso con agua se llama ______________________.',
      answer: 'REFRACCION DE LA LUZ',
      acceptableAnswers: ['REFRACCION DE LA LUZ', 'REFRACCION'],
    },
    {
      prompt:
        'La fuente natural más importante de energía lumínica y calórica para nuestro planeta es ______________________.',
      answer: 'EL SOL',
      acceptableAnswers: ['EL SOL', 'SOL'],
    },
    {
      prompt:
        'La energía que se produce gracias a la fuerza del viento utilizando aerogeneradores se conoce como ______________________.',
      answer: 'ENERGIA EOLICA',
      acceptableAnswers: ['ENERGIA EOLICA', 'EOLICA'],
    },
    {
      prompt:
        'Las energías limpias también reciben el nombre de energías ______________________ porque se reponen constantemente.',
      answer: 'RENOVABLES',
      acceptableAnswers: ['RENOVABLES', 'ENERGIAS RENOVABLES'],
    },
    {
      prompt:
        'El petróleo, el carbón y el gas natural son ejemplos de energías ______________________.',
      answer: 'CONTAMINANTES',
      acceptableAnswers: [
        'CONTAMINANTES',
        'NO RENOVABLES',
        'ENERGIAS CONTAMINANTES',
        'ENERGIAS NO RENOVABLES',
      ],
    },
  ],
  development: {
    context:
      'Costa Rica es un país reconocido mundialmente por utilizar principalmente fuentes de energía limpias y renovables para generar su electricidad (como el agua, el viento, el sol y la geotermia), evitando depender de combustibles fósiles contaminantes.',
    question:
      'Mencione dos ventajas principales de utilizar energías limpias (renovables) en lugar de energías contaminantes para cuidar nuestro planeta.',
    hint: 'Escriba dos razones claras (1 punto por cada ventaja válida explicada).',
    value: 2,
  },
  bonus: {
    question:
      'En su vida diaria, ¿por qué considera que aprovechar la luz del Sol (energía solar) es bueno para cuidar nuestro planeta?',
    hint: 'Pregunta opcional: si decide no responderla no pierde puntos; si responde correctamente suma 1 punto adicional.',
    value: 1,
  },
};
