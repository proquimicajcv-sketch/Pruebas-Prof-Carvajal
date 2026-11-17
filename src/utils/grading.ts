import type {
  AcademicLevel,
  ExamGradeBreakdown,
  StoredSubmission,
  UserAnswers,
} from '../types/exam.ts';
import { examData } from '../data/examData.ts';
import { biologyExamData } from '../data/biologyExamData.ts';
import { isabellaExamData } from '../data/isabellaExamData.ts';

export function sanitizeCompleteInput(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

const DEVELOPMENT_RUBRICS: Record<7 | 8 | 9 | 10, string[][]> = {
  7: [
    ['infiltracion', 'bosque', 'arbol', 'cobertura', 'escorrentia', 'inundacion', 'cauce', 'suelo'],
    ['reforest', 'asada', 'proteccion', 'recarga', 'zona', 'basura', 'educacion', 'agua', 'ley', 'pbae', 'bosque', 'tala'],
  ],
  8: [
    ['conveccion', 'manto', 'astenosfera', 'temperatura', 'densidad', 'placa', 'desplaz', 'calor'],
    ['disolucion', 'acido', 'liquen', 'raiz', 'roca', 'mineral', 'humus', 'organica', 'suelo', 'edafogenesis'],
    ['geotermica', 'energia', 'fertil', 'suelo', 'turismo', 'agricultura', 'electricidad'],
  ],
  9: [
    ['clon', 'identic', 'patogeno', 'rapida', 'masiva', 'aseptica', 'espacio', 'in vitro', 'elite'],
    ['xilema', 'savia bruta', 'agua', 'mineral', 'ascendente', 'floema', 'savia elaborada', 'azucar', 'multidireccional'],
    ['bioetica', 'riesgo', 'ambiente', 'polen', 'salud', 'ecosistema', 'seguridad', 'moral', 'transgenico'],
  ],
  10: [
    ['28', '17', '1,5', '1.5', '3', '3,0', '3.0', 'mol', 'masa molar', 'n2', 'nh3'],
    ['51', '45,5', '45.5', '89', '88', '90', 'rendimiento', 'teorico', 'real', '100'],
    ['maxima', 'cantidad', 'producto', 'estequiometria', 'ecuacion', 'ideal', 'perdida'],
  ],
};

const BONUS_RUBRICS: Record<7 | 8 | 9 | 10, string[]> = {
  7: ['pesca', 'afloramiento', 'nutriente', 'fitoplancton', 'calida', 'agua', 'pez', 'peces', 'economia'],
  8: ['presion', 'fusion', 'hierro', 'gravedad', 'litostatica', 'solido', 'profundidad'],
  9: ['mielina', 'saltatoria', 'nodulo', 'ranvier', 'impulso', 'rapido', 'velocidad', 'aislante'],
  10: ['reversible', 'impureza', 'secundaria', 'perdida', 'temperatura', 'presion', 'equilibrio', 'fuga'],
};

const ISABELLA_DEV_KEYWORDS: string[] = [
  'limpia',
  'no contamina',
  'contaminacion',
  'ambiente',
  'planeta',
  'renovable',
  'reponen',
  'agot',
  'co2',
  'gases',
  'aire',
  'salud',
  'naturaleza',
  'ecosistema',
  'clima',
  'agua',
  'sol',
  'viento',
  'protege',
  'cuida',
];

const ISABELLA_BONUS_KEYWORDS: string[] = [
  'sol',
  'limpia',
  'no contamina',
  'contaminacion',
  'renovable',
  'ambiente',
  'planeta',
  'electricidad',
  'panel',
  'naturaleza',
  'aire',
  'energia',
  'luz',
  'ahorra',
];

const BIOLOGY_RUBRICS: Record<string, string[]> = {
  '1a': ['reductora', 'oxigeno', 'radiacion', 'uv', 'volcan', 'temperatura', 'descarga', 'quimiosintetica', 'complej'],
  '1b': ['miller', 'urey', 'metano', 'amoniaco', 'hidrogeno', 'vapor', 'chispa', 'aminoacido', 'caldo'],
  '1c': ['tierra', 'oceano', 'quimiosintetica', 'panspermia', 'espacio', 'meteorito', 'cometa', 'extraterrestre'],
  '2a': ['fagocitosis', 'anaerobica', 'aerobica', 'bacteria', 'simbiosis', 'endosimbiosis', 'atp', 'mitocondria'],
  '2b': ['doble membrana', 'fision binaria', 'adn circular', 'arnr', 'ribosoma', 'procariota'],
  '2c': ['atp', 'respiracion celular', 'energia', 'oxidativa', 'proteina', 'enzima', 'mitocondria'],
  '3a': ['gilbert', 'arn', 'primitivo', 'celula', 'precursor', 'genetico', 'catalitico'],
  '3b': ['informacion', 'genetica', 'enzima', 'ribozima', 'catalizar', 'autoreplicacion', 'replicar'],
  '3c': ['adn', 'doble helice', 'estable', 'mutacion', 'reparacion', 'almacenamiento', 'desoxirribosa'],
  '4a': ['hutton', 'lyell', 'uniformismo', 'gradualismo', 'lento', 'continuo', 'procesos geologicos', 'presente'],
  '4b': ['darwin', 'beagle', 'fosil', 'terremoto', 'estratos', 'andes', 'cambio', 'tiempo'],
  '4c': ['antigua', 'millones', 'tiempo', 'gradual', 'acumulacion', 'seleccion natural', 'generaciones'],
  '5a': ['lamarck', 'uso', 'desuso', 'caracteres adquiridos', 'herencia', 'necesidad', 'jirafa'],
  '5b': ['darwin', 'wallace', 'variacion', 'aleatoria', 'heredable', 'seleccion natural', 'supervivencia', 'reproduccion'],
  '5c': ['genetica', 'adn', 'gameto', 'germinal', 'somatica', 'genotipo', 'fenotipo', 'no se hereda'],
  '6a': ['homologa', 'ancestro comun', 'funcion', 'analoga', 'convergencia', 'ala', 'aleta', 'brazo'],
  '6b': ['embrio', 'temprano', 'ancestro', 'hendidura', 'faringea', 'cola', 'vertebrado', 'desarrollo'],
  '6c': ['adn', 'codigo genetico', 'universal', 'citocromo', 'aminoacido', 'proteina', 'filogenia', 'parentesco'],
  '7a': ['acervo', 'alelo', 'poblacion', 'deriva genica', 'azar', 'pequena', 'frecuencia'],
  '7b': ['efecto fundador', 'migracion', 'colonia', 'cuello de botella', 'catastrofe', 'reduccion', 'diversidad'],
  '7c': ['variabilidad', 'diversidad', 'homocigosis', 'epidemia', 'enfermedad', 'extincion', 'vulnerab', 'adaptacion'],
  '8a': ['sin mutacion', 'sin migracion', 'flujo genico', 'poblacion grande', 'apareamiento aleatorio', 'sin seleccion'],
  '8b': ['p', 'q', 'alelo', 'dominante', 'recesivo', 'genotipo', 'homocigoto', 'heterocigoto', 'frecuencia'],
  '8c': ['tropical', 'imposible', 'seleccion', 'migracion', 'mutacion', 'tamano', 'apareamiento', 'dinamica'],
  '9a': ['barrera geografica', 'aislamiento', 'flujo genico', 'alopatrica', 'divergencia', 'especie'],
  '9b': ['precigotico', 'temporal', 'ecologico', 'etologico', 'poscigotico', 'hibrido', 'esteril', 'fecundacion'],
  '9c': ['radiacion adaptativa', 'galapagos', 'pinzones', 'pico', 'nicho', 'alimento', 'ancestro'],
  '10a': ['estabilizadora', 'intermedio', 'fenotipo', 'extremo', 'varianza', 'media'],
  '10b': ['disruptiva', 'extremo', 'bimodal', 'divergencia', 'especiacion', 'intermedio'],
  '10c': ['seleccion sexual', 'intrasexual', 'competencia', 'macho', 'intersexual', 'eleccion', 'hembra', 'cortejo'],
};

function scoreRubricResponse(response: string, keywords: string[], maxPoints: number): number {
  const norm = normalizeText(response || '');
  if (norm.length < 12) return 0;

  let matches = 0;
  for (const kw of keywords) {
    if (norm.includes(normalizeText(kw))) {
      matches += 1;
    }
  }

  if (maxPoints <= 1) {
    return matches >= 1 || norm.length >= 35 ? 1 : 0;
  }

  if (matches >= 3 || (matches >= 2 && norm.length >= 55)) {
    return maxPoints;
  }
  if (matches >= 1 || norm.length >= 35) {
    return Math.max(1, Math.floor(maxPoints / 2));
  }
  return 0;
}

export function isCompleteAnswerCorrect(studentRaw: string, expectedRaw: string): boolean {
  const studentNorm = sanitizeCompleteInput(studentRaw || '').trim();
  const expectedNorm = sanitizeCompleteInput(expectedRaw).trim();
  if (studentNorm.length === 0) return false;
  return (
    studentNorm === expectedNorm ||
    (expectedNorm.endsWith('S') && studentNorm === expectedNorm.slice(0, -1)) ||
    (studentNorm.endsWith('S') && studentNorm.slice(0, -1) === expectedNorm)
  );
}

export function isIsabellaCompleteCorrect(
  studentRaw: string,
  acceptableAnswers: string[]
): boolean {
  return acceptableAnswers.some((opt) => isCompleteAnswerCorrect(studentRaw, opt));
}

export function evaluateFullSubmission(
  level: AcademicLevel,
  answers: UserAnswers
): ExamGradeBreakdown {
  if (level === '10-bio') {
    const bioAnswers = answers.biology || {};
    const biologyDetails: Record<string, number> = {};
    let biologyEarned = 0;
    let biologyTotal = 0;

    for (const mod of biologyExamData.modules) {
      for (const q of mod.questions) {
        for (const sub of q.subquestions) {
          const score = scoreRubricResponse(
            bioAnswers[sub.id] || '',
            BIOLOGY_RUBRICS[sub.id] || [],
            sub.value
          );
          biologyDetails[sub.id] = score;
          biologyEarned += score;
          biologyTotal += sub.value;
        }
      }
    }

    const finalPercentage = Math.min(
      100,
      Math.round((biologyEarned / biologyTotal) * 1000) / 10
    );

    return {
      selection: 0,
      selectionTotal: 0,
      matching: 0,
      matchingTotal: 0,
      completes: 0,
      completesTotal: 0,
      development: 0,
      developmentTotal: 0,
      developmentDetails: [],
      bonus: 0,
      bonusTotal: 0,
      biologyEarned,
      biologyTotal,
      biologyDetails,
      baseEarned: biologyEarned,
      baseTotal: biologyTotal,
      totalEarnedWithBonus: biologyEarned,
      finalPercentage,
    };
  }

  if (level === '10-quim-isa') {
    let selection = 0;
    isabellaExamData.selection.forEach((item, idx) => {
      if (answers.selection[idx] === item.correct) {
        selection += 1;
      }
    });

    let matching = 0;
    isabellaExamData.matching1.forEach((item, idx) => {
      const val = answers.matching[idx];
      if (val !== '' && val !== undefined && Number(val) === item.correctIndex) {
        matching += 1;
      }
    });

    let matching2 = 0;
    const m2Ans = answers.matching2 || {};
    isabellaExamData.matching2.forEach((item, idx) => {
      const val = m2Ans[idx];
      if (val !== '' && val !== undefined && Number(val) === item.correctIndex) {
        matching2 += 1;
      }
    });

    let completes = 0;
    isabellaExamData.completes.forEach((item, idx) => {
      if (isIsabellaCompleteCorrect(answers.completes[idx] || '', item.acceptableAnswers)) {
        completes += 1;
      }
    });

    const devText = answers.development[0] || '';
    const devScore = scoreRubricResponse(
      devText,
      ISABELLA_DEV_KEYWORDS,
      isabellaExamData.development.value
    );
    const bonusScore = scoreRubricResponse(
      answers.bonus || '',
      ISABELLA_BONUS_KEYWORDS,
      isabellaExamData.bonus.value
    );

    const selectionTotal = isabellaExamData.selection.length;
    const matchingTotal = isabellaExamData.matching1.length;
    const matching2Total = isabellaExamData.matching2.length;
    const completesTotal = isabellaExamData.completes.length;
    const developmentTotal = isabellaExamData.development.value;

    const baseEarned = selection + matching + matching2 + completes + devScore;
    const baseTotal =
      selectionTotal + matchingTotal + matching2Total + completesTotal + developmentTotal;
    const totalEarnedWithBonus = baseEarned + bonusScore;
    const finalPercentage = Math.min(
      100,
      Math.round((totalEarnedWithBonus / baseTotal) * 1000) / 10
    );

    return {
      selection,
      selectionTotal,
      matching,
      matchingTotal,
      matching2,
      matching2Total,
      completes,
      completesTotal,
      development: devScore,
      developmentTotal,
      developmentDetails: [devScore],
      bonus: bonusScore,
      bonusTotal: isabellaExamData.bonus.value,
      baseEarned,
      baseTotal,
      totalEarnedWithBonus,
      finalPercentage,
    };
  }

  const config = examData[level];

  let selection = 0;
  config.selection.forEach((item, idx) => {
    if (answers.selection[idx] === item.correct) {
      selection += 1;
    }
  });

  let matching = 0;
  config.matching.forEach((item, idx) => {
    const val = answers.matching[idx];
    if (val !== '' && val !== undefined && Number(val) === item.correctIndex) {
      matching += 1;
    }
  });

  let completes = 0;
  config.completes.forEach((item, idx) => {
    if (isCompleteAnswerCorrect(answers.completes[idx] || '', item.answer)) {
      completes += 1;
    }
  });

  const devRubrics = DEVELOPMENT_RUBRICS[level];
  const developmentDetails: number[] = config.development.questions.map((qItem, idx) =>
    scoreRubricResponse(answers.development[idx] || '', devRubrics[idx] || [], qItem.value)
  );
  const development = developmentDetails.reduce((acc, v) => acc + v, 0);
  const developmentTotal = config.development.questions.reduce((acc, q) => acc + q.value, 0);

  const bonus = scoreRubricResponse(
    answers.bonus || '',
    BONUS_RUBRICS[level],
    config.bonus.value
  );

  const selectionTotal = config.selection.length;
  const matchingTotal = config.matching.length;
  const completesTotal = config.completes.length;

  const baseEarned = selection + matching + completes + development;
  const baseTotal = selectionTotal + matchingTotal + completesTotal + developmentTotal;
  const totalEarnedWithBonus = baseEarned + bonus;
  const finalPercentage = Math.min(
    100,
    Math.round((totalEarnedWithBonus / baseTotal) * 1000) / 10
  );

  return {
    selection,
    selectionTotal,
    matching,
    matchingTotal,
    completes,
    completesTotal,
    development,
    developmentTotal,
    developmentDetails,
    bonus,
    bonusTotal: config.bonus.value,
    baseEarned,
    baseTotal,
    totalEarnedWithBonus,
    finalPercentage,
  };
}

export function buildSubmissionsCsv(submissions: StoredSubmission[]): string {
  const header = [
    'ID Registro',
    'Fecha y Hora',
    'Nombre Completo',
    'Correo Institucional',
    'Nivel Academico',
    'I. Seleccion',
    'II. Asocie (o Asocie 1+2)',
    'III/IV. Complete',
    'Desarrollo',
    'Bonificacion (+1 pt)',
    'Taller Biologia (60 pts)',
    'Puntos Obtenidos',
    'Puntos Base',
    'Nota Final (%)',
    'Infracciones',
    'Bloqueo por Fraude',
    'Detalle Infracciones',
    'Desarrollo / Taller Respuestas',
    'Bonificacion Respuesta',
  ];

  const escapeCsv = (val: string | number | boolean): string => {
    const str = String(val ?? '').replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = submissions.map((s) => {
    const g = s.gradeBreakdown ?? evaluateFullSubmission(s.student.level, s.answers);
    const levelName =
      s.student.level === '10-bio'
        ? '10.° Biología'
        : s.student.level === '10-quim-isa'
        ? 'Química Isabella Antonino'
        : s.student.level === 10
        ? '10.° Química'
        : `${s.student.level}.° Año`;

    const infDetail = s.infractions
      .map(
        (inf, idx) =>
          `#${idx + 1} (${new Date(inf.timestamp).toLocaleTimeString('es-CR')}): ${inf.reason}`
      )
      .join(' | ');

    let openResponses = '';
    if (s.student.level === '10-bio') {
      const bio = s.answers.biology || {};
      openResponses = biologyExamData.modules
        .flatMap((m) =>
          m.questions.flatMap((q) =>
            q.subquestions.map(
              (sub) =>
                `[${sub.id} (${g.biologyDetails?.[sub.id] ?? 0}/2)]: ${bio[sub.id] || 'Sin respuesta'}`
            )
          )
        )
        .join(' || ');
    } else if (s.student.level === '10-quim-isa') {
      openResponses = `[V. Desarrollo (${g.development}/2)]: ${s.answers.development[0] || 'Sin respuesta'}`;
    } else {
      openResponses = [0, 1, 2]
        .filter((i) => s.answers.development[i] !== undefined || i < 2)
        .map((i) => `[Des.${i + 1}]: ${s.answers.development[i] || 'Sin respuesta'}`)
        .join(' || ');
    }

    const asocieCol =
      s.student.level === '10-bio'
        ? 'N/A'
        : s.student.level === '10-quim-isa'
        ? `${g.matching + (g.matching2 ?? 0)} / ${g.matchingTotal + (g.matching2Total ?? 0)}`
        : g.matching;

    return [
      s.id,
      new Date(s.submittedAt).toLocaleString('es-CR'),
      s.student.name,
      s.student.email,
      levelName,
      s.student.level === '10-bio' ? 'N/A' : g.selection,
      asocieCol,
      s.student.level === '10-bio' ? 'N/A' : g.completes,
      s.student.level === '10-bio' ? 'N/A' : g.development,
      s.student.level === '10-bio' ? 'N/A' : g.bonus,
      s.student.level === '10-bio' ? g.biologyEarned ?? 0 : 'N/A',
      g.totalEarnedWithBonus,
      g.baseTotal,
      `${g.finalPercentage.toFixed(1)}%`,
      s.infractions.length,
      s.lockedOut ? 'Sí' : 'No',
      infDetail || 'Sin infracciones',
      openResponses,
      s.student.level === '10-bio' ? 'N/A' : s.answers.bonus || '',
    ];
  });

  return (
    '\uFEFF' +
    [header.map(escapeCsv).join(','), ...rows.map((r) => r.map(escapeCsv).join(','))].join('\n')
  );
}
