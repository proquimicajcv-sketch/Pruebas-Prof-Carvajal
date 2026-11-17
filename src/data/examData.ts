import type { LevelExamConfig, StandardAcademicLevel } from '../types/exam.ts';

export const TEACHER_SECRET_CODE = '5531';

export const examData: Record<StandardAcademicLevel, LevelExamConfig> = {
  7: {
    level: 7,
    title: 'Ciencias de 7.° Año',
    shortLabel: '7.° Año',
    themeColor: '#0284c7',
    accentBgClass: 'bg-sky-600',
    accentTextClass: 'text-sky-700',
    selection: [
      {
        q: '¿Cómo varían las condiciones eólicas y oceanográficas durante la fase cálida del evento ENOS (El Niño)?',
        options: [
          'A) Los vientos alisios se fortalecen y provocan afloramiento de aguas frías.',
          'B) Los vientos alisios se debilitan o invierten, permitiendo el desplazamiento de aguas cálidas hacia el Pacífico oriental.',
          'C) Se registra un aumento drástico de lluvias en la vertiente del Caribe y sequía total en Sudamérica.',
        ],
        correct: 1,
      },
      {
        q: '¿Cuál es la función ecológica vital del afloramiento profundo (upwelling) en las costas marinas?',
        options: [
          'A) Elevar la temperatura superficial del mar por encima de los 30°C.',
          'B) Elevar a la superficie aguas ricas en nutrientes minerales que alimentan al fitoplancton.',
          'C) Detener por completo las corrientes de marea.',
        ],
        correct: 1,
      },
      {
        q: 'Durante la fase fría del ENOS (La Niña), ¿qué impacto climatológico se experimenta típicamente en gran parte de Costa Rica?',
        options: [
          'A) Un incremento significativo en las tasas de precipitación e inundaciones en la Vertiente del Pacífico.',
          'B) Una sequía prolongada sin precipitaciones en todo el istmo.',
          'C) La anulación absoluta de los vientos alisios.',
        ],
        correct: 0,
      },
      {
        q: '¿Qué diferencia fundamental existe entre la fase El Niño y La Niña respecto al gradiente barométrico?',
        options: [
          'A) En El Niño la presión atmosférica es idéntica en Tahití y Darwin.',
          'B) En La Niña se refuerza la diferencia de presión entre Tahití y Darwin, intensificando los vientos alisios.',
          'C) En ninguna fase interviene la presión barométrica.',
        ],
        correct: 1,
      },
      {
        q: '¿Cómo se clasifican las aguas residuales de origen agrícola que contienen fertilizantes ricos en nitrógeno y fósforo?',
        options: [
          'A) Aguas residuales de origen industrial pesado.',
          'B) Aguas residuales de origen agrícola o agropecuario.',
          'C) Aguas servidas estrictamente urbanas.',
        ],
        correct: 1,
      },
      {
        q: '¿Qué contaminantes característicos aportan las aguas residuales de origen industrial a los cuerpos de agua?',
        options: [
          'A) Metales pesados, ácidos y sustancias químicas sintéticas.',
          'B) Exclusivamente materia orgánica y detergentes domésticos.',
          'C) Semillas y restos vegetales de cosecha.',
        ],
        correct: 0,
      },
      {
        q: '¿Cuál es el proceso biológico y químico que desencadena la eutrofización en lagos y ríos?',
        options: [
          'A) El aumento masivo de nutrientes (N y P) estimula la proliferación de algas; al morir, su descomposición bacteriana agota el oxígeno disuelto (anoxia).',
          'B) La congelación instantánea del lecho acuático.',
          'C) La purificación natural del agua mediante metales pesados.',
        ],
        correct: 0,
      },
      {
        q: '¿Qué factor humano y meteorológico detona principalmente los deslizamientos en los taludes de las carreteras?',
        options: [
          'A) La reforestación intensiva con árboles nativos.',
          'B) La saturación hídrica de los suelos debido a lluvias intensas combinada con cortes antrópicos en los taludes.',
          'C) La escasez absoluta de humedad atmosférica.',
        ],
        correct: 1,
      },
      {
        q: '¿A qué se debe principalmente el efecto invernadero natural que mantiene una temperatura promedio en la Tierra de ~15°C?',
        options: [
          'A) Al reflejo total de la luz solar por los casquetes polares.',
          'B) A la retención de parte del calor infrarrojo terrestre por los gases naturales de la atmósfera.',
          'C) A la combustión constante de combustibles fósiles.',
        ],
        correct: 1,
      },
      {
        q: '¿Cuál de los Gases de Efecto Invernadero (GEI) antropogénicos es responsable del mayor porcentaje de forzamiento térmico global (~76%)?',
        options: [
          'A) El metano (CH4)',
          'B) El óxido nitroso (N2O)',
          'C) El dióxido de carbono (CO2)',
        ],
        correct: 2,
      },
      {
        q: '¿Cuáles son las principales fuentes emisoras de metano (CH4) a la atmósfera relacionadas con actividades humanas?',
        options: [
          'A) La ganadería intensiva y los cultivos de arroz anegados.',
          'B) El uso exclusivo de paneles solares fotovoltaicos.',
          'C) La purificación de agua en acueductos rurales.',
        ],
        correct: 0,
      },
      {
        q: '¿Qué consecuencia química directa provoca la absorción excesiva de CO2 atmosférico por los océanos?',
        options: [
          'A) La alcalinización extrema del agua salada.',
          'B) La acidificación de los océanos, dificultando la formación de carbonato de calcio para conchas y corales.',
          'C) La congelación de corrientes profundas.',
        ],
        correct: 1,
      },
      {
        q: '¿Qué ácidos principales componen el fenómeno de la lluvia ácida generado por emisiones industriales de azufre y nitrógeno?',
        options: [
          'A) Ácido sulfúrico y ácido nítrico.',
          'B) Ácido acético y ácido cítrico.',
          'C) Ácido clorhídrico y ácido carbónico.',
        ],
        correct: 0,
      },
      {
        q: '¿Cómo actúa un mecanismo de retroalimentación positiva en el sistema climático global?',
        options: [
          'A) Revierte instantáneamente el calentamiento mediante lluvias artificiales.',
          'B) Amplifica o acelera un cambio climático inicial (ej. derretimiento de hielo reduce el albedo y absorbe más calor).',
          'C) Estabiliza la temperatura a niveles preindustriales.',
        ],
        correct: 1,
      },
      {
        q: '¿Qué institución en Costa Rica tiene la rectoría jurídica y técnica sobre la gestión, dominio y protección de las aguas nacionales?',
        options: [
          'A) El Ministerio de Ambiente y Energía (MINAE) a través de la Dirección de Aguas.',
          'B) El Instituto Costarricense de Electricidad (ICE).',
          'C) Las corporaciones municipales.',
        ],
        correct: 0,
      },
      {
        q: '¿Cuál es la competencia principal de las ASADAS en el contexto de la gestión hídrica comunal en Costa Rica?',
        options: [
          'A) Administrar, operar y mantener los acueductos rurales en colaboración con las comunidades.',
          'B) Regular tarifas eléctricas nacionales.',
          'C) Fiscalizar la pesca industrial en altamar.',
        ],
        correct: 0,
      },
      {
        q: '¿Qué función ecológica cumplen los ecosistemas de páramo en las cordilleras de Costa Rica?',
        options: [
          "A) Son consideradas 'fábricas naturales de agua dulce' que regulan el caudal de las cuencas.",
          'B) Funcionan como desiertos de altura sin retención.',
          'C) Generan depósitos masivos de petróleo.',
        ],
        correct: 0,
      },
      {
        q: "¿Cómo se define la huella hídrica de tipo 'azul'?",
        options: [
          'A) El volumen de agua de lluvia consumida y almacenada en el suelo.',
          'B) El volumen de agua dulce superficial o subterránea consumida (evaporada o incorporada) en un proceso productivo.',
          'C) El volumen de agua para diluir contaminantes.',
        ],
        correct: 1,
      },
      {
        q: "¿A qué se refiere la huella hídrica 'gris' en la contabilidad ambiental?",
        options: [
          'A) Al agua utilizada para lavar ropa.',
          'B) Al volumen de agua dulce requerido para diluir los contaminantes hasta cumplir los estándares de calidad ambiental.',
          'C) Al agua congelada en Talamanca.',
        ],
        correct: 1,
      },
      {
        q: '¿Qué mide específicamente la huella de carbono (CO2e) en una organización o producto?',
        options: [
          'A) La cantidad total de emisiones de Gases de Efecto Invernadero expresadas en equivalente de dióxido de carbono.',
          'B) La cantidad de carbón mineral extraído en minas.',
          'C) El peso de residuos sólidos.',
        ],
        correct: 0,
      },
      {
        q: '¿Qué galardón institucional promueve en Costa Rica la gestión ambiental, el ahorro de agua y la mitigación en comunidades y centros educativos?',
        options: [
          'A) El Programa Bandera Azul Ecológica (PBAE).',
          'B) El sello de calidad de café.',
          'C) La certificación de zonas francas.',
        ],
        correct: 0,
      },
      {
        q: '¿Cuál es el papel del Incopesca en relación con los recursos acuáticos del país?',
        options: [
          'A) Regular, fomentar y administrar el desarrollo de la pesca y la acuicultura nacional de forma sostenible.',
          'B) Racionar agua potable urbana.',
          'C) Construir represas.',
        ],
        correct: 0,
      },
      {
        q: '¿Qué función desempeña la ARESEP en el marco de los servicios públicos vinculados al recurso hídrico?',
        options: [
          'A) Establecer, regular y fijar las tarifas aplicables al servicio público de acueductos y alcantarillados.',
          'B) Diseñar mapas meteorológicos de huracanes.',
          'C) Ejecutar reforestación.',
        ],
        correct: 0,
      },
      {
        q: '¿Qué fenómeno oceánico provoca la mortandad masiva de peces y el blanqueamiento de los arrecifes coralinos en el Pacífico tropical?',
        options: [
          'A) El afloramiento excesivo de agua congelada.',
          'B) El colapso pesquero y térmico asociado a anomalías cálidas severas del ENOS.',
          'C) La purificación total de la salinidad.',
        ],
        correct: 1,
      },
      {
        q: '¿Cómo influye la alteración antrópica en los procesos planetarios de evaporación y condensación?',
        options: [
          'A) Modificando el uso del suelo, la deforestación y las emisiones térmicas urbanas que alteran el ciclo hidrológico local.',
          'B) Deteniendo la rotación terrestre.',
          'C) Eliminando la humedad atmosférica.',
        ],
        correct: 0,
      },
      {
        q: '¿Cuál es una medida concreta de mitigación para reducir la huella hídrica y el desperdicio de agua en el hogar?',
        options: [
          'A) Dejar tuberías abiertas al lavar aceras.',
          'B) Reparar fugas inmediatamente, instalar dispositivos ahorradores y recolectar agua pluvial.',
          'C) Utilizar mangueras a presión sin cierre.',
        ],
        correct: 1,
      },
      {
        q: '¿Qué relación existe entre la deforestación de cuencas hidrográficas y las inundaciones pluviales?',
        options: [
          'A) La pérdida de cobertura boscosa disminuye la infiltración, incrementando la escorrentía superficial rápida y desbordando cauces.',
          'B) La deforestación congela la lluvia.',
          'C) No existe relación.',
        ],
        correct: 0,
      },
      {
        q: '¿Qué gas atmosférico natural es también considerado un potente gas de efecto invernadero cuyo vapor contribuye al ciclo térmico?',
        options: [
          'A) El vapor de agua (H2O)',
          'B) El argón (Ar)',
          'C) El helio (He)',
        ],
        correct: 0,
      },
      {
        q: '¿Qué efecto produce la anoxia (cero oxígeno disuelto) en los ecosistemas fluviales afectados por eutrofización?',
        options: [
          'A) La reproducción acelerada de peces gigantes.',
          'B) La muerte masiva de la fauna acuática aeróbica (peces, crustáceos) por asfixia.',
          'C) El endurecimiento del agua en hielo.',
        ],
        correct: 1,
      },
      {
        q: '¿Qué institución se encarga específicamente de la operación de sistemas de acueductos y alcantarillados urbanos en Costa Rica?',
        options: [
          'A) El Instituto Costarricense de Acueductos y Alcantarillados (AyA).',
          'B) El Ministerio de Salud Pública.',
          'C) El Patronato Nacional de la Infancia.',
        ],
        correct: 0,
      },
      {
        q: "¿Cómo se define la huella hídrica 'verde'?",
        options: [
          'A) El agua de lluvia almacenada en la zona radicular del suelo y utilizada por la vegetación.',
          'B) El agua residual tratada.',
          'C) El agua potable embotellada.',
        ],
        correct: 0,
      },
      {
        q: '¿Qué ocurre con la presión atmosférica en Tahití y Darwin durante la oscilación del sur asociada al ENOS?',
        options: [
          'A) Se mantiene estática sin variaciones.',
          'B) Se produce un basculamiento o inversión en el gradiente de presión que debilita o impulsa los vientos alisios.',
          'C) Aumenta al doble.',
        ],
        correct: 1,
      },
      {
        q: '¿Cuál es una causa directa de la sequía meteorológica en regiones tropicales vinculada a desequilibrios climáticos?',
        options: [
          'A) La reducción drástica y prolongada de precipitaciones por debajo de la media histórica, influenciada por fases anómalas como El Niño.',
          'B) El desbordamiento de lagos.',
          'C) Exceso de nubosidad nocturna.',
        ],
        correct: 0,
      },
      {
        q: '¿Por qué razón los arrecifes de coral sufren blanqueamiento ante aumentos térmicos marinos?',
        options: [
          'A) Porque expulsan a las microalgas simbióticas (zooxantelas) que les dan color y alimento debido al estrés térmico.',
          'B) Porque absorben sal cristalizada.',
          'C) Porque cambian a plantas terrestres.',
        ],
        correct: 0,
      },
      {
        q: '¿Qué acción humana incrementa directamente la emisión de óxido nitroso (N2O) a la atmósfera?',
        options: [
          'A) El uso excesivo de fertilizantes nitrogenados en la agricultura intensiva.',
          'B) La conducción de vehículos eléctricos.',
          'C) Reforestación de manglares.',
        ],
        correct: 0,
      },
      {
        q: '¿Qué impacto ambiental genera el vertido de plaguicidas agrícolas sin tratar en los cuerpos de agua dulce?',
        options: [
          'A) Purificación instantánea del cauce.',
          'B) La intoxicación de la biota acuática y la alteración de la cadena trófica.',
          'C) Incremento de potabilidad.',
        ],
        correct: 1,
      },
      {
        q: '¿Cuál es el objetivo de calcular la huella hídrica en productos de consumo cotidiano (taza de café o camisa)?',
        options: [
          'A) Conocer el volumen total de agua dulce consumida y contaminada durante toda su cadena de suministro.',
          'B) Establecer el precio de venta internacional.',
          'C) Determinar el peso del embalaje.',
        ],
        correct: 0,
      },
      {
        q: '¿Qué representa el calentamiento global antropogénico en comparación con el efecto invernadero natural?',
        options: [
          'A) Un incremento anómalo y acelerado de la temperatura debido a la emisión masiva de GEI por actividades humanas.',
          'B) Un ciclo natural periódico de 100 años.',
          'C) Enfriamiento por satélites.',
        ],
        correct: 0,
      },
      {
        q: '¿Cómo impactan los deslizamientos en las comunidades humanas ubicadas en laderas vulnerables?',
        options: [
          'A) Generan pérdidas materiales, destrucción de infraestructura vial y riesgo vital por sepultamiento.',
          'B) Mejoran la conectividad terrestre.',
          'C) Incrementan la fertilidad urbana.',
        ],
        correct: 0,
      },
      {
        q: '¿Qué medida de adaptación institucional implementa Costa Rica para proteger las zonas de recarga acuífera y los páramos?',
        options: [
          'A) La declaración de áreas silvestres protegidas, parques nacionales y reservas forestales bajo tutela del MINAE.',
          'B) Urbanización total de cumbres.',
          'C) Privatización del agua subterránea.',
        ],
        correct: 0,
      },
    ],
    matching: [
      {
        concept: 'El Niño',
        options: [
          '1. Ecosistema de alta montaña considerado fábrica natural de agua dulce.',
          '2. Organización comunitaria encargada de administrar acueductos rurales.',
          '3. Fase cálida del ENOS caracterizada por aguas cálidas en el Pacífico oriental.',
          '4. Proceso de enriquecimiento de nutrientes que genera anoxia y muerte de peces.',
          '5. Volumen de agua dulce necesario para diluir contaminantes a niveles seguros.',
        ],
        correctIndex: 2,
      },
      {
        concept: 'Huella hídrica gris',
        options: [
          '1. Ecosistema de alta montaña considerado fábrica natural de agua dulce.',
          '2. Organización comunitaria encargada de administrar acueductos rurales.',
          '3. Fase cálida del ENOS caracterizada por aguas cálidas en el Pacífico oriental.',
          '4. Proceso de enriquecimiento de nutrientes que genera anoxia y muerte de peces.',
          '5. Volumen de agua dulce necesario para diluir contaminantes a niveles seguros.',
        ],
        correctIndex: 4,
      },
      {
        concept: 'Páramo',
        options: [
          '1. Ecosistema de alta montaña considerado fábrica natural de agua dulce.',
          '2. Organización comunitaria encargada de administrar acueductos rurales.',
          '3. Fase cálida del ENOS caracterizada por aguas cálidas en el Pacífico oriental.',
          '4. Proceso de enriquecimiento de nutrientes que genera anoxia y muerte de peces.',
          '5. Volumen de agua dulce necesario para diluir contaminantes a niveles seguros.',
        ],
        correctIndex: 0,
      },
      {
        concept: 'Eutrofización',
        options: [
          '1. Ecosistema de alta montaña considerado fábrica natural de agua dulce.',
          '2. Organización comunitaria encargada de administrar acueductos rurales.',
          '3. Fase cálida del ENOS caracterizada por aguas cálidas en el Pacífico oriental.',
          '4. Proceso de enriquecimiento de nutrientes que genera anoxia y muerte de peces.',
          '5. Volumen de agua dulce necesario para diluir contaminantes a niveles seguros.',
        ],
        correctIndex: 3,
      },
      {
        concept: 'ASADA',
        options: [
          '1. Ecosistema de alta montaña considerado fábrica natural de agua dulce.',
          '2. Organización comunitaria encargada de administrar acueductos rurales.',
          '3. Fase cálida del ENOS caracterizada por aguas cálidas en el Pacífico oriental.',
          '4. Proceso de enriquecimiento de nutrientes que genera anoxia y muerte de peces.',
          '5. Volumen de agua dulce necesario para diluir contaminantes a niveles seguros.',
        ],
        correctIndex: 1,
      },
    ],
    completes: [
      {
        prompt:
          'La fase cálida del evento ENOS, caracterizada por el desplazamiento de aguas cálidas hacia el Pacífico oriental, se conoce como...',
        answer: 'El Niño',
      },
      {
        prompt:
          'El movimiento de ascenso de aguas profundas frías y ricas en nutrientes hacia la superficie marina se denomina...',
        answer: 'afloramiento',
      },
      {
        prompt:
          'El proceso mediante el cual un cuerpo de agua se enriquece en nutrientes (N y P), provocando proliferación de algas y posterior anoxia, se llama...',
        answer: 'eutrofización',
      },
      {
        prompt:
          'Los ecosistemas de alta montaña en Costa Rica que actúan como fábricas naturales de agua dulce se denominan...',
        answer: 'páramos',
      },
      {
        prompt:
          'Las organizaciones comunales rurales encargadas de administrar los acueductos locales se conocen como...',
        answer: 'ASADAS',
      },
    ],
    development: {
      text: 'Las cuencas hidrográficas en Costa Rica constituyen unidades territoriales fundamentales para la gestión integral del recurso hídrico. La deforestación de las laderas y el cambio climático alteran drásticamente el ciclo hidrológico, incrementando la escorrentía superficial y provocando inundaciones en las partes bajas, además de acelerar la pérdida de suelos fértiles.',
      questions: [
        {
          q: '1. Explique cómo la deforestación de una cuenca hidrográfica afecta directamente la infiltración del agua de lluvia y genera un aumento en el riesgo de inundaciones pluviales.',
          value: 2,
        },
        {
          q: '2. Describa dos medidas de mitigación y gestión ambiental que pueden implementar las comunidades y municipalidades para proteger las zonas de recarga hídrica.',
          value: 2,
        },
      ],
    },
    bonus: {
      q: 'Explique brevemente por qué el fenómeno de El Niño genera impactos socioeconómicos tan severos en el sector pesquero del Pacífico tropical.',
      value: 1,
    },
  },
  8: {
    level: 8,
    title: 'Ciencias de 8.° Año',
    shortLabel: '8.° Año',
    themeColor: '#0d9488',
    accentBgClass: 'bg-teal-600',
    accentTextClass: 'text-teal-700',
    selection: [
      {
        q: '¿Cómo se diferencian las capas geoquímicas y reológicas de la Tierra según su grosor, composición y estado físico?',
        options: [
          'A) Las geoquímicas se basan en propiedades mecánicas y las reológicas en la densidad del núcleo.',
          'B) Las geoquímicas (corteza, manto, núcleo) se definen por su composición química elemental, mientras que las reológicas por su comportamiento mecánico y estado físico.',
          'C) Ambas clasificaciones utilizan exactamente los mismos criterios.',
        ],
        correct: 1,
      },
      {
        q: '¿Cuáles son los dos elementos químicos predominantes en la composición elemental de la corteza terrestre (silicatos)?',
        options: [
          'A) Oxígeno (46,6%) y Silicio (27,7%)',
          'B) Hierro (Fe) y Níquel (Ni)',
          'C) Hidrógeno y Helio',
        ],
        correct: 0,
      },
      {
        q: '¿Qué efecto físico produce la presión confinante extrema en el punto de fusión del hierro en el núcleo interno de la Tierra?',
        options: [
          'A) Obliga al núcleo interno a mantenerse en estado líquido hirviente.',
          'B) Eleva el punto de fusión del hierro por encima de la temperatura real del núcleo, forzándolo a un estado hiperdenso sólido a más de 5000°C.',
          'C) Provoca evaporación total.',
        ],
        correct: 1,
      },
      {
        q: '¿En qué capa concéntrica de la Tierra se genera el campo geomagnético debido a las corrientes de convección de metales líquidos?',
        options: [
          'A) En la corteza continental',
          'B) En el núcleo externo (fluido metálico líquido)',
          'C) En el manto superior rígido',
        ],
        correct: 1,
      },
      {
        q: '¿Qué mecanismo termodinámico impulsa el desplazamiento cinemático de las placas litosféricas sobre la astenosfera (~2,5 cm/año)?',
        options: [
          'A) Las corrientes de convección térmica en el manto',
          'B) La atracción gravitacional directa de la Luna',
          'C) La rotación de los océanos profundos',
        ],
        correct: 0,
      },
      {
        q: '¿Qué tipo de borde tectónico se caracteriza por la separación de placas, dorsales oceánicas y expansión del suelo marino (constructivo)?',
        options: [
          'A) Bordes divergentes',
          'B) Bordes convergentes por subducción',
          'C) Bordes transformantes conservativos',
        ],
        correct: 0,
      },
      {
        q: '¿Qué geoformas y fenómenos se originan típicamente en los bordes convergentes destructivos donde ocurre subducción?',
        options: [
          'A) Dorsales oceánicas pasivas sin vulcanismo',
          'B) Fosas abisales, cinturones orogénicos, arcos de islas y vulcanismo activo',
          'C) Fallas de desgarre horizontal puro sin sismos',
        ],
        correct: 1,
      },
      {
        q: '¿Cómo actúan los bordes transformantes (conservativos) en la dinámica litosférica?',
        options: [
          'A) Destruyen corteza oceánica fundiéndola en el núcleo',
          'B) Generan fricción por deslizamiento lateral entre placas sin destruir ni crear corteza (ej. Falla de San Andrés)',
          'C) Expanden los fondos abisales',
        ],
        correct: 1,
      },
      {
        q: '¿Cuál es el origen geológico de la cadena volcánica activa en Costa Rica (Turrialba, Poás, Rincón de la Vieja)?',
        options: [
          'A) La subducción de la placa de Cocos bajo la placa Caribe en el Cinturón de Fuego del Pacífico',
          'B) Un punto caliente intraplaca',
          'C) Separación divergente hacia el Atlántico',
        ],
        correct: 0,
      },
      {
        q: '¿Cuál es la secuencia correcta del modelado del relieve terrestre por dinámica externa?',
        options: [
          'A) Transporte → Sedimentación → Meteorización → Erosión',
          'B) Meteorización → Erosión → Transporte → Sedimentación',
          'C) Sedimentación → Meteorización → Transporte → Erosión',
        ],
        correct: 1,
      },
      {
        q: '¿En qué consiste la meteorización física por termoclastia?',
        options: [
          'A) Disolución de rocas calizas por ácidos orgánicos',
          'B) Fracturación de la roca debido a cambios bruscos de temperatura entre día y noche que dilatan y contraen los minerales',
          'C) Ruptura por raíces',
        ],
        correct: 1,
      },
      {
        q: '¿Qué nombre recibe el proceso de meteorización física en el cual el agua se introduce en grietas, se congela y se expande (gelivación)?',
        options: [
          'A) Oxidación ferrosa',
          'B) Termoclastia solar',
          'C) Gelivación o crioclastia',
        ],
        correct: 2,
      },
      {
        q: '¿Cuál de los siguientes procesos corresponde a un ejemplo de meteorización química de las rocas?',
        options: [
          'A) Fragmentación por raíces de árboles',
          'B) La oxidación de minerales ferrosos y la disolución cárstica de rocas calizas',
          'C) Expansión térmica por insolación',
        ],
        correct: 1,
      },
      {
        q: '¿Qué función desempeñan los líquenes y bacterias en la alteración del sustrato rocoso (acción biológica)?',
        options: [
          'A) Excreción de ácidos biológicos que corroen minerales y generan cuñas químicas y mecánicas',
          'B) Construcción de arrecifes',
          'C) Compactación impermeable',
        ],
        correct: 0,
      },
      {
        q: '¿Cómo se define el proceso de edafogénesis en la formación de los suelos?',
        options: [
          'A) Acumulación exclusiva de lava enfriada',
          'B) Descomposición gradual de la roca madre por acción de la intemperie, aireación, agua e incorporación biológica',
          'C) Depósito artificial de sedimentos',
        ],
        correct: 1,
      },
      {
        q: '¿Qué propiedad edáfica determina la proporción relativa de arena, limo y arcilla en una muestra de suelo?',
        options: [
          'A) La textura del suelo',
          'B) La porosidad magnética',
          'C) El pH salino absoluto',
        ],
        correct: 0,
      },
      {
        q: '¿Qué característica principal presentan los suelos de tipo arenoso en comparación con los arcillosos?',
        options: [
          'A) Presentan excelente drenaje y baja retención hídrica debido a su alta permeabilidad',
          'B) Son altamente compactos y asfixian raíces',
          'C) Poseen exceso de humus coloidal',
        ],
        correct: 0,
      },
      {
        q: '¿Qué importancia ecológica tiene el mantillo orgánico (humus coloidal) en la superficie del suelo?',
        options: [
          'A) Incrementa la temperatura hasta fundir minerales',
          'B) Favorece la retención hídrica, aporta fertilidad y protege contra la erosión',
          'C) Impide el crecimiento vegetal',
        ],
        correct: 1,
      },
      {
        q: '¿Cuál es el estado físico y la consistencia reológica del manto terrestre (astenosfera)?',
        options: [
          'A) Sólido hiperdenso cristalino',
          'B) Viscoelasticidad o plasticidad fluida (magma semidifuso)',
          'C) Gas ionizado a alta presión',
        ],
        correct: 1,
      },
      {
        q: '¿Qué agente externo es el principal responsable de la acumulación de sedimentos en cuencas y deltas fluviales?',
        options: [
          'A) Corrientes fluviales, oleaje costero, viento y glaciares',
          'B) El campo magnético externo',
          'C) Radiación ultravioleta',
        ],
        correct: 0,
      },
      {
        q: '¿Qué elementos químicos metálicos y no metálicos complementan la composición de la corteza además de oxígeno y silicio?',
        options: [
          'A) Aluminio (8,1%), Hierro (Fe), Calcio, Sodio y Potasio',
          'B) Oro, plata y platino puro',
          'C) Uranio y plutonio',
        ],
        correct: 0,
      },
      {
        q: '¿Por qué razón la corteza oceánica es más delgada y densa que la continental?',
        options: [
          'A) Está compuesta principalmente por basaltos ricos en hierro y magnesio, a diferencia de los granitos continentales.',
          'B) Está formada por capas de hielo.',
          'C) Carece de elementos sólidos.',
        ],
        correct: 0,
      },
      {
        q: '¿Qué consecuencia geomorfológica genera el transporte fluvial de sedimentos a lo largo de su cauce?',
        options: [
          'A) El desgaste, redondeamiento y acarreo de materiales rocosos hacia zonas bajas',
          'B) Creación instantánea de volcanes',
          'C) Solidificación absoluta',
        ],
        correct: 0,
      },
      {
        q: '¿Cómo se clasifican los suelos que poseen un contenido abundante de materia orgánica descompuesta y alta fertilidad biológica?',
        options: [
          'A) Suelos orgánicos o húmicos',
          'B) Suelos puramente arenosos',
          'C) Suelos rocosos estériles',
        ],
        correct: 0,
      },
      {
        q: '¿Qué propiedad del suelo se relaciona directamente con su capacidad para almacenar agua útil para las plantas y permitir circulación de aire?',
        options: [
          'A) La porosidad y la estructura edáfica',
          'B) El color azulado de los cuarzos',
          'C) Radiactividad natural',
        ],
        correct: 0,
      },
      {
        q: '¿Qué ocurre en los bordes divergentes oceánicos conocidos como dorsales?',
        options: [
          'A) Se destruyen continentes',
          'B) El magma asciende desde el manto para solidificarse y formar nueva corteza oceánica (expansión marina)',
          'C) Se detiene la sismicidad',
        ],
        correct: 1,
      },
      {
        q: '¿Qué tipo de meteorización química debilita rocas ricas en carbonato de calcio (mármol o caliza) al entrar en contacto con agua ácida?',
        options: [
          'A) Disolución cárstica',
          'B) Crioclastia por congelación',
          'C) Termoclastia desértica',
        ],
        correct: 0,
      },
      {
        q: '¿Cuál es el espesor y comportamiento mecánico de la litósfera según su clasificación reológica?',
        options: [
          'A) Capa externa rígida y frágil que comprende la corteza y parte del manto superior',
          'B) Capa líquida metálica',
          'C) Capa gaseosa',
        ],
        correct: 0,
      },
      {
        q: '¿Qué relación existe entre la textura arcillosa de un suelo y su capacidad de retención hídrica?',
        options: [
          'A) Las partículas muy finas de arcilla generan microporos que retienen gran cantidad de agua, dificultando el drenaje',
          'B) Filtra instantáneamente sin retener',
          'C) Transforma el agua en vapor',
        ],
        correct: 0,
      },
      {
        q: '¿Qué fenómeno geológico y geotérmico se aprovecha en Costa Rica gracias a la actividad volcánica asociada a la subducción?',
        options: [
          'A) La generación de energía geotérmica para electricidad',
          'B) Extracción masiva de diamantes',
          'C) Formación de glaciares permanentes',
        ],
        correct: 0,
      },
      {
        q: '¿Qué papel juegan los agentes biológicos en la meteorización externa de las rocas?',
        options: [
          'A) Fracturan la roca mecánicamente con raíces y la alteran químicamente con ácidos orgánicos',
          'B) Recubren con polímeros plásticos',
          'C) Detienen la erosión eólica',
        ],
        correct: 0,
      },
      {
        q: '¿Por qué el núcleo interno se encuentra en estado sólido a pesar de superar los 5000°C?',
        options: [
          'A) Debido a la gigantesca presión litostática y gravitacional que soporta, la cual eleva su punto de fusión',
          'B) Porque está refrigerado por aire',
          'C) Ausencia de metales',
        ],
        correct: 0,
      },
      {
        q: '¿Qué caracteriza a los bordes convergentes continentales-continentales (como el Himalaya)?',
        options: [
          'A) Subducción profunda hacia el núcleo',
          'B) Colisión sin subducción que genera intenso plegamiento y formación de grandes cadenas montañosas (orogénesis)',
          'C) Separación pacífica',
        ],
        correct: 1,
      },
      {
        q: '¿Qué efectos produce la erosión por el oleaje marino en las costas rocosas?',
        options: [
          'A) Formación de acantilados, plataformas de abrasión y modelado litoral',
          'B) Crecimiento instantáneo de bosques',
          'C) Solidificación de mareas',
        ],
        correct: 0,
      },
      {
        q: '¿Cuál es la diferencia fundamental entre el núcleo externo y el interno en términos de su estado mecánico?',
        options: [
          'A) El núcleo externo es un fluido metálico líquido y el núcleo interno es un sólido hiperdenso',
          'B) Ambos son gases nobles',
          'C) El externo es sólido y el interno gaseoso',
        ],
        correct: 0,
      },
      {
        q: '¿Qué impacto tiene la pérdida de mantillo orgánico en los suelos agrícolas?',
        options: [
          'A) Aumenta la fertilidad infinitamente',
          'B) Reduce la retención de agua, empobrece nutrientes y acelera la erosión por viento y lluvia',
          'C) Convierte el suelo en granito puro',
        ],
        correct: 1,
      },
      {
        q: '¿Qué son las celdas de convección en el manto terrestre?',
        options: [
          'A) Movimientos circulares de material rocoso fundido debido a diferencias de temperatura y densidad',
          'B) Corrientes de agua fría',
          'C) Vientos huracanados',
        ],
        correct: 0,
      },
      {
        q: '¿Qué tipo de suelo presenta partículas de tamaño intermedio entre arena y arcilla, ofreciendo excelente fertilidad agrícola?',
        options: [
          'A) Suelo limoso',
          'B) Suelo exclusivamente pedregoso',
          'C) Suelo de salinidad marina',
        ],
        correct: 0,
      },
      {
        q: '¿Qué rol cumple la astenosfera en la tectónica de placas?',
        options: [
          'A) Actúa como la capa plástica y semifluida sobre la cual se deslizan mecánicamente las placas litosféricas rígidas',
          'B) Funciona como barrera antiseísmos',
          'C) Es la capa externa atmosférica',
        ],
        correct: 0,
      },
      {
        q: '¿Por qué es fundamental estudiar la edafología y la dinámica de la geósfera en la ciencia moderna?',
        options: [
          'A) Para comprender la gestión de riesgos naturales, la fertilidad de los suelos y la estabilidad de los recursos terrestres',
          'B) Para predecir cotización de metales',
          'C) Para eliminar la erosión natural',
        ],
        correct: 0,
      },
    ],
    matching: [
      {
        concept: 'Núcleo externo',
        options: [
          '1. Capa externa rígida y frágil de la Tierra que incluye la corteza.',
          '2. Suelo caracterizado por su excelente drenaje y partículas gruesas.',
          '3. Capa fluida metálica responsable de la generación del campo magnético.',
          '4. Proceso de hundimiento de una placa tectónica bajo otra en bordes convergentes.',
          '5. Meteorización física por expansión volumétrica del hielo en las rocas.',
        ],
        correctIndex: 2,
      },
      {
        concept: 'Gelivación / Crioclastia',
        options: [
          '1. Capa externa rígida y frágil de la Tierra que incluye la corteza.',
          '2. Suelo caracterizado por su excelente drenaje y partículas gruesas.',
          '3. Capa fluida metálica responsable de la generación del campo magnético.',
          '4. Proceso de hundimiento de una placa tectónica bajo otra en bordes convergentes.',
          '5. Meteorización física por expansión volumétrica del hielo en las rocas.',
        ],
        correctIndex: 4,
      },
      {
        concept: 'Litósfera',
        options: [
          '1. Capa externa rígida y frágil de la Tierra que incluye la corteza.',
          '2. Suelo caracterizado por su excelente drenaje y partículas gruesas.',
          '3. Capa fluida metálica responsable de la generación del campo magnético.',
          '4. Proceso de hundimiento de una placa tectónica bajo otra en bordes convergentes.',
          '5. Meteorización física por expansión volumétrica del hielo en las rocas.',
        ],
        correctIndex: 0,
      },
      {
        concept: 'Subducción',
        options: [
          '1. Capa externa rígida y frágil de la Tierra que incluye la corteza.',
          '2. Suelo caracterizado por su excelente drenaje y partículas gruesas.',
          '3. Capa fluida metálica responsable de la generación del campo magnético.',
          '4. Proceso de hundimiento de una placa tectónica bajo otra en bordes convergentes.',
          '5. Meteorización física por expansión volumétrica del hielo en las rocas.',
        ],
        correctIndex: 3,
      },
      {
        concept: 'Suelo arenoso',
        options: [
          '1. Capa externa rígida y frágil de la Tierra que incluye la corteza.',
          '2. Suelo caracterizado por su excelente drenaje y partículas gruesas.',
          '3. Capa fluida metálica responsable de la generación del campo magnético.',
          '4. Proceso de hundimiento de una placa tectónica bajo otra en bordes convergentes.',
          '5. Meteorización física por expansión volumétrica del hielo en las rocas.',
        ],
        correctIndex: 1,
      },
    ],
    completes: [
      {
        prompt:
          'Las capas concéntricas de la Tierra según su composición geoquímica son la corteza, el manto y el...',
        answer: 'núcleo',
      },
      {
        prompt:
          'Los dos elementos químicos que predominan mayoritariamente en la composición de la corteza terrestre son el oxígeno y el...',
        answer: 'silicio',
      },
      {
        prompt: 'El estado físico del núcleo externo de la Tierra corresponde a un fluido metálico...',
        answer: 'líquido',
      },
      {
        prompt:
          'Las corrientes de convección térmica en el manto impulsan el desplazamiento de las placas litosféricas a una velocidad aproximada de 2,5...',
        answer: 'cm/año',
      },
      {
        prompt:
          'El proceso de formación y evolución de los suelos a partir de la roca madre se conoce como...',
        answer: 'edafogénesis',
      },
    ],
    development: {
      text: 'La dinámica interna del planeta impulsa el desplazamiento constante de las placas litosféricas sobre la astenosfera. En los bordes convergentes, la subducción genera intensa actividad sísmica y magmática, modelando arcos volcánicos como los presentes en el territorio costarricense. Simultáneamente, los agentes externos desgastan y transforman el relieve mediante meteorización y edafogénesis.',
      questions: [
        {
          q: '1. Explique el papel termodinámico y mecánico que desempeñan las celdas de convección del manto y la astenosfera en el movimiento de las placas tectónicas (Valor: 2 puntos).',
          value: 2,
        },
        {
          q: '2. Describa cómo interactúan la meteorización química (como la disolución cárstica) y la acción biológica en la formación del suelo a partir de la roca madre (Valor: 2 puntos).',
          value: 2,
        },
        {
          q: '3. Explique qué importancia geológica y económica tiene el vulcanismo asociado a la subducción en Costa Rica (Valor: 1 punto).',
          value: 1,
        },
      ],
    },
    bonus: {
      q: 'Explique brevemente por qué el núcleo interno se mantiene sólido a más de 5000°C a pesar de que dicha temperatura fundiría cualquier metal en la superficie terrestre.',
      value: 1,
    },
  },
  9: {
    level: 9,
    title: 'Ciencias de 9.° Año',
    shortLabel: '9.° Año',
    themeColor: '#7c3aed',
    accentBgClass: 'bg-violet-600',
    accentTextClass: 'text-violet-700',
    selection: [
      {
        q: '¿Cómo se diferencian los tejidos meristemáticos primarios y secundarios en el cuerpo de las plantas vasculares?',
        options: [
          'A) Los meristemos primarios provocan el crecimiento en longitud (apical), mientras que los secundarios (cámbium y felógeno) generan el crecimiento en grosor.',
          'B) Los meristemos secundarios realizan fotosíntesis estival.',
          'C) Ambos se localizan exclusivamente en la cofia.',
        ],
        correct: 0,
      },
      {
        q: '¿Cuál es la función principal del tejido vascular conocido como xilema en las plantas superiores?',
        options: [
          'A) Conducir savia elaborada multidireccionalmente.',
          'B) Transportar la savia bruta (agua y sales minerales disueltas) de forma ascendente desde la raíz hasta el follaje.',
          'C) Almacenar almidón.',
        ],
        correct: 1,
      },
      {
        q: '¿Qué estructuras epidérmicas de las hojas están formadas por dos células oclusivas que regulan el intercambio gaseoso y la transpiración?',
        options: [
          'A) Lenticelas',
          'B) Los estomas con sus respectivos ostíolos',
          'C) Tubos cribosos del floema',
        ],
        correct: 1,
      },
      {
        q: '¿Qué tipo de tejido fundamental vegetal se caracteriza por proporcionar soporte flexible a órganos jóvenes gracias al engrosamiento desigual de sus paredes?',
        options: [
          'A) Parénquima clorofílico',
          'B) El colénquima',
          'C) Esclerénquima lignificado',
        ],
        correct: 1,
      },
      {
        q: '¿Cuál es la función del parénquima aerífero (aerénquima) en las plantas acuáticas o de humedales?',
        options: [
          'A) Almacenar agua dulce en desiertos',
          'B) Facilitar la flotación y el intercambio interno de gases en ambientes inundados',
          'C) Conducir savia elaborada',
        ],
        correct: 1,
      },
      {
        q: '¿Qué componente estructural de la peridermis vegetal (súber o corcho) le confiere impermeabilidad frente a la pérdida de agua y patógenos?',
        options: ['A) La suberina', 'B) Lignina pura', 'C) Clorofila b'],
        correct: 0,
      },
      {
        q: '¿Cómo se denominan los verticilos florales fértiles encargados de producir los gametos en una flor completa de angiospermas?',
        options: [
          'A) Cáliz y corola',
          'B) Androceo (con estambres) y gineceo (con carpelos)',
          'C) Receptáculo y pedúnculo',
        ],
        correct: 1,
      },
      {
        q: '¿Qué evento reproductivo ocurre inmediatamente después de la germinación del grano de polen sobre el estigma de la flor?',
        options: [
          'A) Formación de fruto partenocárpico',
          'B) El crecimiento del tubo polínico a través del estilo para lograr la doble fecundación en el óvulo',
          'C) Transformación de pétalos en raíces',
        ],
        correct: 1,
      },
      {
        q: '¿Cuál de los siguientes ejemplos corresponde a un mecanismo de reproducción asexual vegetativa natural?',
        options: [
          'A) Injerto de yema en frutales',
          'B) Propagación por bulbos, tubérculos, rizomas y estolones',
          'C) Micropropagación in vitro en laboratorios',
        ],
        correct: 1,
      },
      {
        q: '¿Qué ventaja reproductiva principal ofrece la reproducción asexual (clonal) frente a la sexual en las plantas?',
        options: [
          'A) Genera gran variabilidad genética adaptativa.',
          'B) Permite la multiplicación rápida de individuos idénticos con características agronómicas deseables sin depender de polinizadores.',
          'C) Elimina susceptibilidad a hongos.',
        ],
        correct: 1,
      },
      {
        q: '¿Qué importancia ecológica y socioeconómica tienen los sistemas agroforestales y el Pago por Servicios Ambientales (PSA) en Costa Rica?',
        options: [
          'A) Fomentan deforestación controlada.',
          'B) Incentivan la conservación forestal, la captura de carbono y la protección de los recursos hídricos en cuencas.',
          'C) Incrementan agroquímicos.',
        ],
        correct: 1,
      },
      {
        q: '¿Cómo se clasifica el tejido epitelial que presenta múltiples capas de células dispuestas sobre una membrana basal (ej. epidermis de la piel)?',
        options: [
          'A) Epitelio simple plano',
          'B) Epitelio estratificado',
          'C) Tejido conectivo laxo',
        ],
        correct: 1,
      },
      {
        q: '¿Qué tipo de tejido animal se especializa en el almacenamiento de lípidos y protección térmica, formando la capa adiposa subcutánea?',
        options: ['A) Tejido cartilaginoso', 'B) El tejido adiposo', 'C) Músculo liso'],
        correct: 1,
      },
      {
        q: '¿Cuál es la principal característica histológica y funcional del tejido muscular cardíaco en vertebrados?',
        options: [
          'A) Células estriadas involuntarias interconectadas estructuralmente por discos intercalares',
          'B) Células fusiformes voluntarias',
          'C) Fibras conectivas sin irrigación',
        ],
        correct: 0,
      },
      {
        q: '¿Qué estructura de la neurona se encarga de acelerar la conducción saltatoria del impulso nervioso gracias a la vaina de mielina?',
        options: [
          'A) Dendritas ramificadas',
          'B) El axón mielinizado',
          'C) Cuerpo celular o soma',
        ],
        correct: 1,
      },
      {
        q: '¿Qué función desempeñan las células de la neuroglía (como los astrocitos) en el tejido nervioso?',
        options: [
          'A) Conducir impulsos hacia músculos esqueléticos',
          'B) Sostener, nutrir y proteger metabólicamente a las neuronas',
          'C) Secretar hormonas esteroides',
        ],
        correct: 1,
      },
      {
        q: '¿Qué aspecto regula estrictamente la Ley de Bienestar de los Animales (N.° 7451/9458) en Costa Rica?',
        options: [
          'A) La prohibición del maltrato, crueldad y negligencia hacia animales domésticos y de producción',
          'B) Comercialización ilimitada de silvestres',
          'C) Pruebas cosméticas industriales',
        ],
        correct: 0,
      },
      {
        q: '¿Cuál es el objetivo principal de la Ley de Conservación de Vida Silvestre (N.° 7317) en el territorio nacional?',
        options: [
          'A) Fomentar la caza deportiva de felinos',
          'B) Proteger, regular y administrar la flora y la fauna silvestre como patrimonio natural del Estado',
          'C) Transformar refugios en zonas industriales',
        ],
        correct: 1,
      },
      {
        q: '¿Qué técnica biotecnológica moderna permite la multiplicación masiva de plantas élite libres de patógenos en condiciones asépticas?',
        options: [
          'A) La micropropagación vegetal in vitro',
          'B) Hibridación por polinización tradicional',
          'C) Deforestación selectiva',
        ],
        correct: 0,
      },
      {
        q: '¿Qué dilemas bioéticos y ambientales se asocian comúnmente con el uso de cultivos transgénicos (ADN recombinante)?',
        options: [
          'A) Agotamiento absoluto de energía solar',
          'B) El riesgo de escape polínico hacia especies silvestres emparentadas y resistencia de plagas',
          'C) Transformación de la atmósfera en metano líquido',
        ],
        correct: 1,
      },
      {
        q: '¿Qué tejido fundamental vegetal se especializa en el almacenamiento de sustancias de reserva (almidón en tubérculos)?',
        options: [
          'A) El parénquima reservante',
          'B) Esclerénquima fibroso',
          'C) Tejido meristemático secundario',
        ],
        correct: 0,
      },
      {
        q: '¿Cuál es el tejido animal responsable de la contracción voluntaria y el movimiento corporal, unido a los huesos mediante tendones?',
        options: [
          'A) Tejido muscular esquelético (estriado voluntario)',
          'B) Músculo liso visceral',
          'C) Epitelio glandular exocrino',
        ],
        correct: 0,
      },
      {
        q: '¿Qué función cumple el tejido conectivo óseo en los vertebrados?',
        options: [
          'A) Sostener mecánicamente el cuerpo, proteger órganos vitales y almacenar minerales gracias a sus osteocitos mineralizados',
          'B) Conducir savia elaborada',
          'C) Proveer cubierta impermeable UV',
        ],
        correct: 0,
      },
      {
        q: '¿Qué son los sistemas silvopastoriles en el contexto de la producción pecuaria sostenible (NAMA Ganadería)?',
        options: [
          'A) Sistemas que combinan la ganadería con árboles maderables y forrajes para capturar carbono y mejorar el bienestar animal',
          'B) Confinamiento estricto sin vegetación',
          'C) Cultivos de cereales transgénicos',
        ],
        correct: 0,
      },
      {
        q: '¿Cómo actúa la nanotecnología aplicada en la medicina moderna a través de nanotubos?',
        options: [
          'A) Como vehiculizadores precisos para transportar fármacos directamente a las células enfermas',
          'B) Como prótesis mecánicas de extremidades',
          'C) Como fertilizantes químicos masivos',
        ],
        correct: 0,
      },
      {
        q: '¿Qué función cumplen los tricomas situados en la epidermis de algunas hojas?',
        options: [
          'A) Proteger a la planta contra la herbivoría, reducir la transpiración y secretar sustancias defensivas',
          'B) Transportar azúcares hacia la raíz',
          'C) Realizar división celular longitudinal',
        ],
        correct: 0,
      },
      {
        q: '¿Qué tipo de tejido vegetal fibroso y con paredes secundarias lignificadas proporciona dureza y resistencia mecánica a las estructuras adultas?',
        options: [
          'A) El esclerénquima',
          'B) Parénquima aerífero',
          'C) Tejido embrionario',
        ],
        correct: 0,
      },
      {
        q: '¿Qué proceso ocurre durante la fase de gametogénesis en las plantas angiospermas?',
        options: [
          'A) La formación de los gametos masculinos (granos de polen) y femeninos (saco embrionario)',
          'B) Crecimiento longitudinal de la raíz',
          'C) Transformación del cáliz en pétalos',
        ],
        correct: 0,
      },
      {
        q: '¿Qué relación existe entre los usos etnobotánicos y la sostenibilidad en Costa Rica?',
        options: [
          'A) El aprovechamiento tradicional de plantas con fines alimentarios, textiles y farmacológicos debe vincularse a la conservación de la biodiversidad',
          'B) Obligan a la tala total de bosques',
          'C) Sustituyen por completo la medicina alopática',
        ],
        correct: 0,
      },
      {
        q: '¿Qué diferencia estructural existe entre el tejido epitelial glandular exocrino y el endocrino?',
        options: [
          'A) El exocrino secreta sustancias hacia el exterior o cavidades mediante conductos, mientras que el endocrino vierte hormonas directamente al torrente sanguíneo',
          'B) El endocrino carece de células vivas',
          'C) No hay diferencia',
        ],
        correct: 0,
      },
      {
        q: '¿Qué componentes forman la sangre como tejido conectivo especializado?',
        options: [
          'A) Matriz líquida denominada plasma y células formes (eritrocitos, leucocitos y plaquetas)',
          'B) Condrocitos en fibras colágenas densas',
          'C) Osteocitos unidos por canalículos',
        ],
        correct: 0,
      },
      {
        q: '¿Qué ocurre en la sinapsis química entre dos neuronas?',
        options: [
          'A) Los neurotransmisores químicos se liberan en la hendidura sináptica para transmitir el impulso nervioso de una célula a otra',
          'B) Los axones se fusionan físicamente',
          'C) Se detiene la actividad eléctrica',
        ],
        correct: 0,
      },
      {
        q: '¿Qué son los subproductos animales y los insumos biomédicos derivados de la fauna?',
        options: [
          'A) Materiales como lana, cuero, lanolina e insulina purificada utilizados en la industria y medicina',
          'B) Residuos tóxicos en ríos',
          'C) Cultivos transgénicos vegetales',
        ],
        correct: 0,
      },
      {
        q: '¿Cómo participan las células madre pluripotentes en la medicina regenerativa y la biotecnología?',
        options: [
          'A) Tienen la capacidad de diferenciarse en múltiples tipos de tejidos especializados para reparar órganos dañados',
          'B) Destruyen tejidos sanos',
          'C) Reemplazan cloroplastos',
        ],
        correct: 0,
      },
      {
        q: '¿Qué rol desempeñan los estolones en la reproducción asexual natural de ciertas plantas (fresas)?',
        options: [
          'A) Tallos rastreros horizontales que generan nuevas plantas hijas a partir de nudos adventicios',
          'B) Raíces subterráneas profundas',
          'C) Esporas resistentes al fuego',
        ],
        correct: 0,
      },
      {
        q: '¿Qué función cumple el cámbium vascular en el crecimiento secundario de los tallos leñosos?',
        options: [
          'A) Producir nuevo xilema secundario hacia adentro y floema secundario hacia afuera, incrementando el grosor del tallo',
          'B) Alargar el tallo verticalmente',
          'C) Generar cutícula cerosa',
        ],
        correct: 0,
      },
      {
        q: '¿Qué característica distingue al tejido muscular liso en los vertebrados?',
        options: [
          'A) Fibras fusiformes sin estriaciones, de contracción involuntaria, presentes en paredes de vísceras y vasos sanguíneos',
          'B) Fibras estriadas voluntarias',
          'C) Células cardíacas ramificadas',
        ],
        correct: 0,
      },
      {
        q: '¿Cuál es el propósito de las certificaciones comerciales Cruelty-Free en la producción industrial?',
        options: [
          'A) Garantizar que los productos no han sido probados en animales, promoviendo la ética comercial',
          'B) Acelerar la deforestación',
          'C) Autorizar colorantes químicos',
        ],
        correct: 0,
      },
      {
        q: '¿Qué representan las prótesis mioeléctricas en el campo de la biónica aplicada a vertebrados?',
        options: [
          'A) Extremidades artificiales controladas por señales eléctricas musculares del sistema nervioso del usuario',
          'B) Medicamentos analgésicos',
          'C) Dispositivos mecánicos sin biología',
        ],
        correct: 0,
      },
      {
        q: '¿Por qué es fundamental la integración de la bioética al evaluar aplicaciones biotecnológicas modernas?',
        options: [
          'A) Permite analizar críticamente las consecuencias ambientales, los riesgos sanitarios y la moralidad del uso de organismos modificados',
          'B) Restringe la investigación científica por completo',
          'C) Sustituye leyes nacionales',
        ],
        correct: 0,
      },
    ],
    matching: [
      {
        concept: 'Xilema',
        options: [
          '1. Estructura epidérmica vegetal reguladora del intercambio gaseoso.',
          '2. Tejido muscular involuntario con discos intercalares presente en el corazón.',
          '3. Tejido vascular vegetal encargado de transportar la savia bruta.',
          '4. Tejido dérmico protector impermeable gracias a la presencia de suberina.',
          '5. Verticilo floral fértil masculino compuesto por los estambres.',
        ],
        correctIndex: 2,
      },
      {
        concept: 'Androceo',
        options: [
          '1. Estructura epidérmica vegetal reguladora del intercambio gaseoso.',
          '2. Tejido muscular involuntario con discos intercalares presente en el corazón.',
          '3. Tejido vascular vegetal encargado de transportar la savia bruta.',
          '4. Tejido dérmico protector impermeable gracias a la presencia de suberina.',
          '5. Verticilo floral fértil masculino compuesto por los estambres.',
        ],
        correctIndex: 4,
      },
      {
        concept: 'Estoma',
        options: [
          '1. Estructura epidérmica vegetal reguladora del intercambio gaseoso.',
          '2. Tejido muscular involuntario con discos intercalares presente en el corazón.',
          '3. Tejido vascular vegetal encargado de transportar la savia bruta.',
          '4. Tejido dérmico protector impermeable gracias a la presencia de suberina.',
          '5. Verticilo floral fértil masculino compuesto por los estambres.',
        ],
        correctIndex: 0,
      },
      {
        concept: 'Súber / Corcho',
        options: [
          '1. Estructura epidérmica vegetal reguladora del intercambio gaseoso.',
          '2. Tejido muscular involuntario con discos intercalares presente en el corazón.',
          '3. Tejido vascular vegetal encargado de transportar la savia bruta.',
          '4. Tejido dérmico protector impermeable gracias a la presencia de suberina.',
          '5. Verticilo floral fértil masculino compuesto por los estambres.',
        ],
        correctIndex: 3,
      },
      {
        concept: 'Tejido cardíaco',
        options: [
          '1. Estructura epidérmica vegetal reguladora del intercambio gaseoso.',
          '2. Tejido muscular involuntario con discos intercalares presente en el corazón.',
          '3. Tejido vascular vegetal encargado de transportar la savia bruta.',
          '4. Tejido dérmico protector impermeable gracias a la presencia de suberina.',
          '5. Verticilo floral fértil masculino compuesto por los estambres.',
        ],
        correctIndex: 1,
      },
    ],
    completes: [
      {
        prompt:
          'El tejido meristemático encargado del crecimiento en longitud de la raíz y el tallo se denomina meristemo...',
        answer: 'primario',
      },
      {
        prompt: 'El tejido vascular vegetal encargado de transportar la savia bruta ascendente es el...',
        answer: 'xilema',
      },
      {
        prompt:
          'El tejido vascular encargado de conducir la savia elaborada de forma multidireccional es el...',
        answer: 'floema',
      },
      {
        prompt:
          'Las estructuras epidérmicas vegetales reguladoras del intercambio gaseoso y la transpiración son los...',
        answer: 'estomas',
      },
      {
        prompt:
          'El componente químico impermeabilizante presente en las células del súber (corcho) se llama...',
        answer: 'suberina',
      },
    ],
    development: {
      text: 'La biotecnología vegetal contemporánea, mediante técnicas avanzadas de cultivo de tejidos y micropropagación in vitro, permite la clonación masiva de variedades élite libres de patógenos. Estas técnicas se complementan con el estudio histológico de los tejidos vegetales (xilema, floema, meristemos) y animales (epitelial, nervioso, muscular), garantizando la sostenibilidad agrícola y el avance biomédico bajo estrictos principios bioéticos.',
      questions: [
        {
          q: '1. Explique dos ventajas biológicas y prácticas de la micropropagación in vitro frente a la reproducción sexual tradicional en la agricultura moderna (Valor: 2 puntos).',
          value: 2,
        },
        {
          q: '2. Describa la función histológica del xilema y el floema en las plantas vasculares superiores (Valor: 2 puntos).',
          value: 2,
        },
        {
          q: '3. Explique por qué es fundamental integrar la bioética en la evaluación de aplicaciones biotecnológicas modernas como los cultivos transgénicos (Valor: 1 punto).',
          value: 1,
        },
      ],
    },
    bonus: {
      q: 'Explique brevemente cómo la vaina de mielina acelera la conducción del impulso nervioso a lo largo del axón mediante la conducción saltatoria.',
      value: 1,
    },
  },
  10: {
    level: 10,
    title: '10.° Química',
    shortLabel: '10.° Química',
    themeColor: '#2563eb',
    accentBgClass: 'bg-blue-600',
    accentTextClass: 'text-blue-700',
    selection: [
      {
        q: '¿A cuántas unidades de entidades elementales equivale exactamente un mol de cualquier sustancia según el Sistema Internacional?',
        options: ['A) 6,022 × 10^20', 'B) 6,02214076 × 10^23', 'C) 1,993 × 10^-23'],
        correct: 1,
      },
      {
        q: '¿Cómo se define la masa molar de un compuesto químico?',
        options: [
          'A) La masa en gramos de un mol de partículas de dicho compuesto.',
          'B) El número total de átomos en una molécula.',
          'C) La masa absoluta de una sola molécula en unidades atómicas.',
        ],
        correct: 0,
      },
      {
        q: '¿Cuál es la masa molar aproximada del agua (H2O), sabiendo que H = 1 g/mol y O = 16 g/mol?',
        options: ['A) 16 g/mol', 'B) 18 g/mol', 'C) 36 g/mol'],
        correct: 1,
      },
      {
        q: '¿Qué ley fundamental de la química establece que en una reacción química balanceada la masa total de los reactivos debe ser igual a la de los productos?',
        options: [
          'A) Ley de las proporciones definidas (Proust)',
          'B) Ley de conservación de la materia (Lavoisier)',
          'C) Ley de las presiones parciales',
        ],
        correct: 1,
      },
      {
        q: '¿Cuál es el factor de conversión adecuado para transformar moles de una sustancia a gramos?',
        options: [
          'A) 1 mol / Masa Molar (g)',
          'B) Masa Molar (g) / 1 mol',
          'C) 6,022 × 10^23 moléculas / 1 mol',
        ],
        correct: 1,
      },
      {
        q: 'Si se tienen 1,800 moles de plata (Ag), cuya masa molar es 107,9 g/mol, ¿a qué masa en gramos equivale?',
        options: ['A) 59,9 g', 'B) 194,2 g', 'C) 388,4 g'],
        correct: 1,
      },
      {
        q: '¿Qué instrumento matemático se emplea en estequiometría para cambiar una unidad por otra mediante igualdades con fracciones equivalentes?',
        options: [
          'A) Factores de conversión',
          'B) Ecuaciones diferenciales',
          'C) Matrices estequiométricas',
        ],
        correct: 0,
      },
      {
        q: 'Para convertir un número determinado de moléculas o átomos a moles, ¿cuál valor numérico se debe utilizar obligatoriamente en el denominador?',
        options: [
          'A) La masa molar del elemento',
          'B) El número de Avogadro (6,022 × 10^23)',
          'C) La unidad de masa atómica (1,66 × 10^-27 kg)',
        ],
        correct: 1,
      },
      {
        q: '¿Qué relación estequiométrica se utiliza cuando se requiere calcular la cantidad de gramos de un producto a partir de los moles de un reactivo?',
        options: [
          'A) Relación mol-mol exclusivamente',
          'B) Relación masa-masa directa',
          'C) Relación mol-masa (o masa-mol)',
        ],
        correct: 2,
      },
      {
        q: 'En una ecuación química balanceada, ¿qué indican los coeficientes estequiométricos antepuestos a cada fórmula?',
        options: [
          'A) La proporción en moles de las sustancias que reaccionan o se producen.',
          'B) El número de electrones de valencia.',
          'C) La temperatura de la reacción.',
        ],
        correct: 0,
      },
      {
        q: '¿Cómo se denomina al reactivo que se consume por completo en primer lugar durante una reacción química, limitando la cantidad de producto formado?',
        options: [
          'A) Reactivo en exceso',
          'B) Reactivo límite',
          'C) Catalizador homogéneo',
        ],
        correct: 1,
      },
      {
        q: '¿Qué nombre recibe el reactivo que queda sobrante o sin reaccionar una vez que se ha detenido la reacción química?',
        options: ['A) Reactivo en exceso', 'B) Reactivo limitante', 'C) Impureza inerte'],
        correct: 0,
      },
      {
        q: 'Para hallar el reactivo límite entre dos reactivos disponibles, ¿qué operación matemática se debe realizar con los moles de cada uno?',
        options: [
          'A) Multiplicarlos por la masa molar',
          'B) Dividir el número de moles disponibles entre su respectivo coeficiente estequiométrico',
          'C) Sumar las masas atómicas',
        ],
        correct: 1,
      },
      {
        q: '¿Qué fórmula matemática se emplea para calcular el porcentaje de pureza (%P) de un reactivo comercial?',
        options: [
          'A) %P = (Masa Pura / Masa Impura) × 100',
          'B) %P = (Rendimiento Real / Rendimiento Teórico) × 100',
          'C) %P = (Moles Totales / Avogadro) × 100',
        ],
        correct: 0,
      },
      {
        q: 'Si una muestra de 300 g de CaCO3 presenta un porcentaje de pureza del 80,0%, ¿qué cantidad de carbonato de calcio puro contiene la muestra?',
        options: ['A) 150 g', 'B) 240 g', 'C) 300 g'],
        correct: 1,
      },
      {
        q: '¿Qué representa el rendimiento teórico de una reacción química?',
        options: [
          'A) La cantidad máxima de producto que se puede formar según la estequiometría de la ecuación.',
          'B) La cantidad real obtenida en laboratorio tras pesar el producto seco.',
          'C) Pérdidas por filtración.',
        ],
        correct: 0,
      },
      {
        q: '¿Por qué razón el rendimiento real en un proceso industrial suele ser menor al rendimiento teórico?',
        options: [
          'A) Debido a reacciones secundarias, presencia de impurezas o carácter reversible de los procesos.',
          'B) Porque se viola la ley de conservación de la masa.',
          'C) Debido a un exceso de Avogadro.',
        ],
        correct: 0,
      },
      {
        q: '¿Cuál es la expresión matemática correcta para calcular el porcentaje de rendimiento (%R) de una reacción?',
        options: [
          'A) %R = (Masa Real / Masa Teórica) × 100',
          'B) %R = (Masa Pura / Masa Impura) × 100',
          'C) %R = (Moles de Reactivos / Moles de Productos) × 100',
        ],
        correct: 0,
      },
      {
        q: '¿Cuál es la masa molar del dióxido de carbono (CO2), si C = 12,01 g/mol y O = 16,00 g/mol?',
        options: ['A) 28,01 g/mol', 'B) 44,01 g/mol', 'C) 56,02 g/mol'],
        correct: 1,
      },
      {
        q: 'En la fabricación de jabón, la estequiometría permite mezclar ácidos grasos con bases fuertes minimizando desechos. ¿A qué rama corresponde?',
        options: ['A) Termodinámica', 'B) Estequiometría', 'C) Electroquímica'],
        correct: 1,
      },
      {
        q: '¿Qué valor representa la unidad de masa atómica (u) expresada en kilogramos?',
        options: ['A) 1,66 × 10^-27 kg', 'B) 6,022 × 10^23 kg', 'C) 9,11 × 10^-31 kg'],
        correct: 0,
      },
      {
        q: '¿Cómo se le llama al conjunto de 6,02214076 × 10^23 partículas ya sean átomos, moléculas o iones?',
        options: ['A) Docena', 'B) Mol', 'C) Ión'],
        correct: 1,
      },
      {
        q: 'Si un átomo de carbono-12 tiene una masa de 12 u, ¿cuál es la masa en gramos de un mol de átomos de carbono-12?',
        options: ['A) 1,00 g', 'B) 12,00 g', 'C) 6,02 × 10^23 g'],
        correct: 1,
      },
      {
        q: '¿Qué nombre recibe el físico italiano en cuyo honor se nombró la constante de proporcionalidad del número de partículas en un mol?',
        options: ['A) Amadeo Avogadro', 'B) Dmitri Mendeléyev', 'C) Svante Arrhenius'],
        correct: 0,
      },
      {
        q: '¿Cuál de las siguientes unidades es la correcta para expresar la masa molar de una sustancia?',
        options: ['A) u', 'B) g/mol', 'C) mol/L'],
        correct: 1,
      },
      {
        q: 'Al balancear una ecuación química por tanteo, ¿qué norma básica no se debe alterar bajo ninguna circunstancia?',
        options: [
          'A) Los subíndices de las fórmulas químicas verdaderas de los compuestos',
          'B) Los coeficientes estequiométricos iniciales',
          'C) La cantidad de moles',
        ],
        correct: 0,
      },
      {
        q: '¿Qué tipo de cálculo estequiométrico relaciona exclusivamente la cantidad en moles de un reactivo con los moles de un producto?',
        options: [
          'A) Cálculo mol-mol',
          'B) Cálculo masa-masa',
          'C) Cálculo de pureza porcentual',
        ],
        correct: 0,
      },
      {
        q: 'Si en una reacción el reactivo A se agota antes que el B, ¿qué sucede con la reacción?',
        options: [
          'A) Continúa indefinidamente',
          'B) Se detiene por completo',
          'C) Cambia espontáneamente de productos a reactivos',
        ],
        correct: 1,
      },
      {
        q: '¿Qué indica un porcentaje de rendimiento del 100% en una práctica de laboratorio?',
        options: [
          'A) Que se obtuvo exactamente la cantidad teórica prevista sin pérdidas.',
          'B) Que el reactivo limitante tenía impurezas.',
          'C) Que la reacción fue reversible.',
        ],
        correct: 0,
      },
      {
        q: '¿Qué se debe hacer antes de relacionar las masas de los reactivos y productos en una ecuación química?',
        options: [
          'A) Balancear correctamente la ecuación e interpretar las masas molares.',
          'B) Calcular volumen molar a 0°C.',
          'C) Determinar punto de ebullición.',
        ],
        correct: 0,
      },
      {
        q: '¿Cuál es la masa molar del óxido de calcio (CaO), si Ca = 40,08 g/mol y O = 16,00 g/mol?',
        options: ['A) 56,08 g/mol', 'B) 24,08 g/mol', 'C) 72,04 g/mol'],
        correct: 0,
      },
      {
        q: 'Si se tienen 500 g de CaO, ¿a cuántos moles equivale si su masa molar es 56,08 g/mol?',
        options: ['A) 5,12 moles', 'B) 8,93 moles', 'C) 12,4 moles'],
        correct: 1,
      },
      {
        q: '¿Qué regla numérica debe aplicarse al realizar operaciones con cifras significativas en estequiometría?',
        options: [
          'A) Conservar la menor precisión o cantidad de cifras significativas de los datos de partida.',
          'B) Redondear siempre al entero superior.',
          'C) Eliminar decimales en el primer paso.',
        ],
        correct: 0,
      },
      {
        q: '¿Qué representa una muestra de NaOH al 95% de pureza?',
        options: [
          'A) Que por cada 100 g de muestra impura hay 95 g de NaOH puro.',
          'B) Que la solución está sobresaturada.',
          'C) Que contiene 5 g de catalizador.',
        ],
        correct: 0,
      },
      {
        q: '¿Cuál es el objetivo principal de aplicar la estequiometría a nivel industrial?',
        options: [
          'A) Optimizar recursos, evitar desperdicios y minimizar la generación de residuos peligrosos.',
          'B) Aumentar el costo de producción.',
          'C) Modificar la tabla periódica.',
        ],
        correct: 0,
      },
      {
        q: 'En el estudio de la combustión del octano (C8H18), ¿qué tipo de relación se aplica para calcular gramos de agua a partir de una masa dada?',
        options: [
          'A) Relación masa-masa',
          'B) Relación mol-número cuántico',
          'C) Relación de presión',
        ],
        correct: 0,
      },
      {
        q: '¿Qué tipo de partículas son contadas típicamente mediante el número de Avogadro en estequiometría?',
        options: ['A) Átomos, moléculas e iones', 'B) Protones únicamente', 'C) Fotones y mesones'],
        correct: 0,
      },
      {
        q: 'Si una reacción presenta un porcentaje de rendimiento muy bajo, ¿qué implicación práctica tiene?',
        options: [
          'A) El proceso es ineficiente y genera pérdidas económicas considerables.',
          'B) Se obtuvo más producto del esperado.',
          'C) Los reactivos eran 100% puros.',
        ],
        correct: 0,
      },
      {
        q: '¿Cómo se define el término estequiometría según los principios de la química?',
        options: [
          'A) Parte de la química que estudia las relaciones cuantitativas entre reactivos y productos en una reacción balanceada.',
          'B) Ciencia que mide la velocidad de reacciones endotérmicas.',
          'C) Método para purificar metales.',
        ],
        correct: 0,
      },
      {
        q: '¿Cuál es la importancia de identificar correctamente el reactivo límite en un proceso químico industrial?',
        options: [
          'A) Permite calcular con precisión la cantidad máxima de producto obtenible y evitar costos por desperdicio de reactivos en exceso.',
          'B) Evita que la temperatura descienda al cero absoluto.',
          'C) Determina el color final.',
        ],
        correct: 0,
      },
    ],
    matching: [
      {
        concept: 'Número de Avogadro',
        options: [
          '1. Cantidad máxima de producto obtenida teóricamente.',
          '2. Sustancia que se agota primero en una reacción química.',
          '3. Constante equivalente a 6,022 × 10^23 partículas/mol.',
          '4. Relación cuantitativa entre masas y moles de reactivos y productos.',
          '5. Porcentaje de sustancia verdadera y útil en una muestra comercial.',
        ],
        correctIndex: 2,
      },
      {
        concept: 'Pureza de reactivos',
        options: [
          '1. Cantidad máxima de producto obtenida teóricamente.',
          '2. Sustancia que se agota primero en una reacción química.',
          '3. Constante equivalente a 6,022 × 10^23 partículas/mol.',
          '4. Relación cuantitativa entre masas y moles de reactivos y productos.',
          '5. Porcentaje de sustancia verdadera y útil en una muestra comercial.',
        ],
        correctIndex: 4,
      },
      {
        concept: 'Rendimiento teórico',
        options: [
          '1. Cantidad máxima de producto obtenida teóricamente.',
          '2. Sustancia que se agota primero en una reacción química.',
          '3. Constante equivalente a 6,022 × 10^23 partículas/mol.',
          '4. Relación cuantitativa entre masas y moles de reactivos y productos.',
          '5. Porcentaje de sustancia verdadera y útil en una muestra comercial.',
        ],
        correctIndex: 0,
      },
      {
        concept: 'Reactivo límite',
        options: [
          '1. Cantidad máxima de producto obtenida teóricamente.',
          '2. Sustancia que se agota primero en una reacción química.',
          '3. Constante equivalente a 6,022 × 10^23 partículas/mol.',
          '4. Relación cuantitativa entre masas y moles de reactivos y productos.',
          '5. Porcentaje de sustancia verdadera y útil en una muestra comercial.',
        ],
        correctIndex: 1,
      },
      {
        concept: 'Estequiometría',
        options: [
          '1. Cantidad máxima de producto obtenida teóricamente.',
          '2. Sustancia que se agota primero en una reacción química.',
          '3. Constante equivalente a 6,022 × 10^23 partículas/mol.',
          '4. Relación cuantitativa entre masas y moles de reactivos y productos.',
          '5. Porcentaje de sustancia verdadera y útil en una muestra comercial.',
        ],
        correctIndex: 3,
      },
    ],
    completes: [
      {
        prompt:
          'La unidad oficial del Sistema Internacional para medir la cantidad de sustancia es el...',
        answer: 'mol',
      },
      {
        prompt:
          'En una ecuación química, las sustancias iniciales se denominan reactivos y las finales se llaman...',
        answer: 'productos',
      },
      {
        prompt:
          'El reactivo que se consume totalmente durante una reacción química recibe el nombre de reactivo...',
        answer: 'límite',
      },
      {
        prompt:
          'La ley ponderal que afirma que la materia no se crea ni se destruye, solo se transforma, fue enunciada por...',
        answer: 'Lavoisier',
      },
      {
        prompt:
          'El proceso matemático para hallar el reactivo límite consiste en dividir los moles disponibles entre su respectivo coeficiente...',
        answer: 'estequiométrico',
      },
    ],
    development: {
      text: 'Considere la siguiente ecuación química balanceada para la síntesis industrial del amoníaco:\n\nN₂(g) + 3H₂(g) → 2NH₃(g)\n\nEn un experimento de laboratorio, se ponen a reaccionar 42,0 g de nitrógeno gaseoso (N₂) con exceso de hidrógeno. Masas atómicas: N = 14,01 g/mol, H = 1,01 g/mol.',
      questions: [
        {
          q: '1. Calcule la masa molar del nitrógeno gaseoso (N2) y del amoníaco (NH3), y determine los moles teóricos de NH3 que se producen a partir de los 42,0 g de N2 (Valor: 2 puntos).',
          value: 2,
        },
        {
          q: '2. Si en la práctica de laboratorio se obtienen experimentalmente 45,5 g de amoníaco (NH3), calcule el porcentaje de rendimiento de la reacción (%R) (Valor: 2 puntos).',
          value: 2,
        },
        {
          q: "3. Explique brevemente qué representa el término 'rendimiento teórico' en este proceso estequiométrico (Valor: 1 punto).",
          value: 1,
        },
      ],
    },
    bonus: {
      q: 'Explique brevemente por qué el rendimiento real en la síntesis industrial de amoníaco suele ser menor al 100% en condiciones operativas reales.',
      value: 1,
    },
  },
};
