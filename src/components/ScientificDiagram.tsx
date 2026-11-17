import React, { useState } from 'react';
import { AcademicLevel } from '../types/exam';

interface ScientificDiagramProps {
  level: AcademicLevel;
}

export const ScientificDiagram: React.FC<ScientificDiagramProps> = ({ level }) => {
  const [watershedMode, setWatershedMode] = useState<'forest' | 'deforested'>('forest');
  const [earthLayer, setEarthLayer] = useState<'subduction' | 'layers'>('subduction');
  const [vascularFlow, setVascularFlow] = useState<'xylem' | 'phloem'>('xylem');
  const [reactionYield, setReactionYield] = useState<'theoretical' | 'experimental'>('theoretical');

  if (level === 7) {
    const isForest = watershedMode === 'forest';
    return (
      <div className="border border-slate-200 rounded-xl bg-white p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h5 className="text-xs font-semibold text-slate-900">
              Modelo interactivo · Cuenca hidrográfica y balance infiltración/escorrentía
            </h5>
            <p className="text-xs text-slate-500">
              Compare el comportamiento hidrológico según la cobertura vegetal de la ladera.
            </p>
          </div>
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              type="button"
              onClick={() => setWatershedMode('forest')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                isForest
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cuenca con bosque
            </button>
            <button
              type="button"
              onClick={() => setWatershedMode('deforested')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                !isForest
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cuenca deforestada
            </button>
          </div>
        </div>

        <svg
          viewBox="0 0 640 240"
          className="w-full h-auto rounded-lg bg-slate-50 border border-slate-100"
          role="img"
          aria-label="Diagrama de cuenca hidrográfica"
        >
          {/* Sky & Rain */}
          <rect width="640" height="240" fill="#F8FAFC" />
          <path d="M90 38C90 26 104 18 118 22C126 12 146 12 154 24C168 24 178 34 176 46H92C86 46 84 40 90 38Z" fill="#CBD5E1" />
          <path d="M210 34C210 24 222 18 234 22C240 14 256 14 264 24C276 24 282 32 280 42H212C206 42 206 36 210 34Z" fill="#CBD5E1" />
          {[105, 130, 155, 225, 248, 268].map((x) => (
            <line
              key={x}
              x1={x}
              y1="52"
              x2={x - 6}
              y2="76"
              stroke="#0284C7"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          ))}

          {/* Mountain Slope & Subsoil */}
          <path d="M0 90 L280 148 L430 185 L640 185 L640 240 L0 240 Z" fill="#E2E8F0" />
          <path d="M0 90 L280 148 L430 185 L640 185 L640 202 L425 202 L275 164 L0 112 Z" fill={isForest ? '#BBF7D0' : '#FDE68A'} />

          {/* Aquifer Layer */}
          <path d="M0 205 L640 212 L640 240 L0 240 Z" fill="#BAE6FD" />
          <text x="20" y="228" fontSize="11" fill="#0369A1" fontFamily="monospace" fontWeight="600">
            ACUÍFERO SUBTERRÁNEO · ZONA DE RECARGA HÍDRICA
          </text>

          {/* Trees or Stumps */}
          {isForest ? (
            <>
              {[50, 105, 165, 225].map((x, idx) => {
                const y = 92 + idx * 12;
                return (
                  <g key={x}>
                    <rect x={x - 3} y={y - 16} width="6" height="16" fill="#78350F" />
                    <polygon points={`${x},${y - 44} ${x - 18},${y - 14} ${x + 18},${y - 14}`} fill="#059669" />
                  </g>
                );
              })}
            </>
          ) : (
            <>
              {[55, 115, 175, 230].map((x, idx) => {
                const y = 94 + idx * 12;
                return (
                  <g key={x}>
                    <rect x={x - 3} y={y - 7} width="6" height="7" fill="#92400E" />
                    <line x1={x - 8} y1={y - 7} x2={x + 8} y2={y - 7} stroke="#78350F" strokeWidth="2" />
                  </g>
                );
              })}
            </>
          )}

          {/* River Channel */}
          <path
            d={isForest ? 'M430 185 Q520 185 640 185 L640 202 L430 202 Z' : 'M410 174 Q525 170 640 172 L640 202 L410 202 Z'}
            fill={isForest ? '#0EA5E9' : '#DC2626'}
            fillOpacity={isForest ? 0.85 : 0.75}
          />

          {/* Infiltration & Runoff Arrows */}
          {isForest ? (
            <>
              {[80, 145, 210].map((x, i) => (
                <path
                  key={x}
                  d={`M${x} ${112 + i * 13} L${x} ${194}`}
                  stroke="#0284C7"
                  strokeWidth="2.5"
                  markerEnd="url(#arrowBlue)"
                />
              ))}
              <text x="295" y="130" fontSize="11" fill="#047857" fontWeight="700">
                Alta infiltración (~50%) · Caudal regulado
              </text>
              <text x="455" y="168" fontSize="11" fill="#0369A1" fontWeight="600">
                Nivel fluvial estable
              </text>
            </>
          ) : (
            <>
              <path d="M55 92 L390 165" stroke="#DC2626" strokeWidth="4" strokeDasharray="6 4" />
              <text x="240" y="114" fontSize="11" fill="#B91C1C" fontWeight="700">
                Escorrentía superficial acelerada + erosión
              </text>
              <text x="430" y="160" fontSize="11" fill="#B91C1C" fontWeight="700">
                Desbordamiento e inundación pluvial
              </text>
            </>
          )}
        </svg>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 tabular-nums">
          <span>
            <strong className="text-slate-900">Infiltración estimada:</strong>{' '}
            {isForest ? '45% – 55% hacia mantos acuíferos' : '10% – 15% (suelo compactado)'}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            <strong className="text-slate-900">Escorrentía superficial:</strong>{' '}
            {isForest ? '10% – 15% controlada' : '55% – 70% rápida hacia cauces'}
          </span>
        </div>
      </div>
    );
  }

  if (level === 8) {
    const isSubduction = earthLayer === 'subduction';
    return (
      <div className="border border-slate-200 rounded-xl bg-white p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h5 className="text-xs font-semibold text-slate-900">
              Modelo interactivo · Dinámica litosférica y estructura interna
            </h5>
            <p className="text-xs text-slate-500">
              Alterne entre la zona de subducción en Costa Rica y el perfil geoquímico-reológico.
            </p>
          </div>
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              type="button"
              onClick={() => setEarthLayer('subduction')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                isSubduction
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Subducción Cocos–Caribe
            </button>
            <button
              type="button"
              onClick={() => setEarthLayer('layers')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                !isSubduction
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Capas de la Tierra
            </button>
          </div>
        </div>

        {isSubduction ? (
          <svg
            viewBox="0 0 640 240"
            className="w-full h-auto rounded-lg bg-slate-50 border border-slate-100"
            role="img"
            aria-label="Diagrama de subducción placa de Cocos bajo placa Caribe"
          >
            <rect width="640" height="240" fill="#F8FAFC" />
            {/* Ocean */}
            <rect x="0" y="75" width="275" height="32" fill="#BAE6FD" />
            <text x="16" y="95" fontSize="11" fill="#0369A1" fontWeight="600">
              Océano Pacífico
            </text>
            {/* Asthenosphere / Mantle */}
            <rect x="0" y="140" width="640" height="100" fill="#FED7AA" />
            {/* Convection Cell Arrows */}
            <path
              d="M110 210 C110 175 200 175 200 210 C200 230 110 230 110 210 Z"
              fill="none"
              stroke="#EA580C"
              strokeWidth="2"
              strokeDasharray="5 4"
            />
            <text x="95" y="232" fontSize="10.5" fill="#9A3412" fontWeight="700">
              Celdas de convección (Astenosfera)
            </text>

            {/* Subducting Cocos Plate */}
            <path d="M0 107 L240 107 L380 220 L330 235 L205 135 L0 135 Z" fill="#475569" />
            <text x="16" y="125" fontSize="11" fill="#F8FAFC" fontWeight="600">
              Placa de Cocos (~2,5 cm/año →)
            </text>

            {/* Caribbean Plate + Volcano */}
            <path d="M245 107 L440 107 L470 58 L502 107 L640 107 L640 142 L290 142 Z" fill="#94A3B8" />
            <polygon points="440,107 470,58 502,107" fill="#64748B" />
            {/* Magma Conduit */}
            <path d="M350 185 Q420 150 470 62" stroke="#DC2626" strokeWidth="4" fill="none" />
            <circle cx="470" cy="56" r="5" fill="#EA580C" />

            <text x="315" y="95" fontSize="11" fill="#0F172A" fontWeight="700">
              Placa Caribe · Arco Volcánico CR
            </text>
            <text x="230" y="165" fontSize="10.5" fill="#1E293B" fontWeight="600">
              Fosa Mesoamericana (Subducción)
            </text>
          </svg>
        ) : (
          <svg
            viewBox="0 0 640 240"
            className="w-full h-auto rounded-lg bg-slate-50 border border-slate-100"
            role="img"
            aria-label="Capas concéntricas de la Tierra"
          >
            <rect width="640" height="240" fill="#0F172A" />
            <circle cx="150" cy="120" r="100" fill="#475569" stroke="#CBD5E1" strokeWidth="2" />
            <circle cx="150" cy="120" r="84" fill="#EA580C" />
            <circle cx="150" cy="120" r="46" fill="#FACC15" />
            <circle cx="150" cy="120" r="22" fill="#FEF9C3" />

            <text x="285" y="54" fontSize="12" fill="#E2E8F0" fontWeight="700">
              Corteza / Litósfera (O 46,6% · Si 27,7% · Sólida)
            </text>
            <text x="285" y="96" fontSize="12" fill="#FDBA74" fontWeight="700">
              Manto / Astenosfera (Silicatos · Viscoelástica)
            </text>
            <text x="285" y="138" fontSize="12" fill="#FDE047" fontWeight="700">
              Núcleo Externo (Fe–Ni Líquido · Campo magnético)
            </text>
            <text x="285" y="180" fontSize="12" fill="#FEF9C3" fontWeight="700">
              Núcleo Interno (&gt;5000 °C · Sólido por presión extrema)
            </text>
          </svg>
        )}
      </div>
    );
  }

  if (level === 9) {
    const isXylem = vascularFlow === 'xylem';
    return (
      <div className="border border-slate-200 rounded-xl bg-white p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h5 className="text-xs font-semibold text-slate-900">
              Modelo interactivo · Transporte vascular vegetal (Xilema y Floema)
            </h5>
            <p className="text-xs text-slate-500">
              Inspeccione la dirección del flujo y la composición de la savia transportada.
            </p>
          </div>
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              type="button"
              onClick={() => setVascularFlow('xylem')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                isXylem
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Xilema (Savia bruta)
            </button>
            <button
              type="button"
              onClick={() => setVascularFlow('phloem')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                !isXylem
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Floema (Savia elaborada)
            </button>
          </div>
        </div>

        <svg
          viewBox="0 0 640 220"
          className="w-full h-auto rounded-lg bg-slate-50 border border-slate-100"
          role="img"
          aria-label="Diagrama de xilema y floema en plantas vasculares"
        >
          <rect width="640" height="220" fill="#F8FAFC" />
          {/* Xylem Vessel */}
          <rect
            x="110"
            y="36"
            width="64"
            height="152"
            rx="8"
            fill={isXylem ? '#E0F2FE' : '#F1F5F9'}
            stroke={isXylem ? '#0284C7' : '#CBD5E1'}
            strokeWidth="2"
          />
          <text x="142" y="26" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#0369A1">
            XILEMA
          </text>
          {/* Upward Arrows */}
          <path d="M142 172 L142 54" stroke="#0284C7" strokeWidth="3" />
          <polygon points="142,46 136,58 148,58" fill="#0284C7" />

          {/* Phloem Vessel */}
          <rect
            x="220"
            y="36"
            width="64"
            height="152"
            rx="8"
            fill={!isXylem ? '#FEF3C7' : '#F1F5F9'}
            stroke={!isXylem ? '#D97706' : '#CBD5E1'}
            strokeWidth="2"
          />
          <text x="252" y="26" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#B45309">
            FLOEMA
          </text>
          {/* Sieve Plates */}
          <line x1="220" y1="90" x2="284" y2="90" stroke="#D97706" strokeWidth="2" strokeDasharray="5 4" />
          <line x1="220" y1="140" x2="284" y2="140" stroke="#D97706" strokeWidth="2" strokeDasharray="5 4" />
          {/* Bidirectional Arrows */}
          <path d="M242 172 L242 54" stroke="#D97706" strokeWidth="2.5" />
          <polygon points="242,46 237,56 247,56" fill="#D97706" />
          <path d="M262 54 L262 172" stroke="#D97706" strokeWidth="2.5" />
          <polygon points="262,180 257,170 267,170" fill="#D97706" />

          {/* Details Box */}
          <rect x="320" y="36" width="290" height="152" rx="10" fill="#FFFFFF" stroke="#E2E8F0" />
          <text x="340" y="64" fontSize="12.5" fontWeight="700" fill="#0F172A">
            {isXylem ? 'Transporte Unidireccional Ascendente' : 'Transporte Multidireccional (Criboso)'}
          </text>
          <text x="340" y="90" fontSize="11.5" fill="#334155">
            {isXylem
              ? '• Sustancia: Savia bruta (H₂O + sales minerales)'
              : '• Sustancia: Savia elaborada (sacarosa + nutrientes)'}
          </text>
          <text x="340" y="114" fontSize="11.5" fill="#334155">
            {isXylem
              ? '• Dirección: Raíz → Tallo → Hojas (estomas)'
              : '• Dirección: Hojas (fuente) ↔ Raíz / Frutos'}
          </text>
          <text x="340" y="138" fontSize="11.5" fill="#334155">
            {isXylem
              ? '• Células: Traqueidas y vasos lignificados'
              : '• Células: Tubos cribosos y células acompañantes'}
          </text>
          <text x="340" y="166" fontSize="11" fontFamily="monospace" fill="#64748B">
            {isXylem ? 'Transpiración estomática activa el ascenso' : 'Translocación activa por gradiente osmótico'}
          </text>
        </svg>
      </div>
    );
  }

  // Level 10: Stoichiometry Haber-Bosch
  const isTheoretical = reactionYield === 'theoretical';
  return (
    <div className="border border-slate-200 rounded-xl bg-white p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h5 className="text-xs font-semibold text-slate-900">
            Esquema estequiométrico · Síntesis del amoníaco (Proceso Haber–Bosch)
          </h5>
          <p className="text-xs text-slate-500">
            Visualización de coeficientes molares y comparación entre rendimiento teórico y real.
          </p>
        </div>
        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => setReactionYield('theoretical')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              isTheoretical
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Proporción molar (1 : 3 → 2)
          </button>
          <button
            type="button"
            onClick={() => setReactionYield('experimental')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              !isTheoretical
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Datos experimentales (42,0 g N₂)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 border border-slate-100 rounded-lg p-4">
        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1">
          <div className="text-xs text-slate-500 font-medium">Reactivo límite</div>
          <div className="font-mono text-lg font-bold text-blue-700 tabular-nums">1 mol N₂(g)</div>
          <div className="text-xs text-slate-600 font-mono tabular-nums">
            {isTheoretical ? 'MM(N₂) = 2 × 14,01 g/mol' : 'Masa inicial = 42,0 g N₂'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1">
          <div className="text-xs text-slate-500 font-medium">Reactivo en exceso</div>
          <div className="font-mono text-lg font-bold text-slate-800 tabular-nums">
            + 3 moles H₂(g)
          </div>
          <div className="text-xs text-slate-600 font-mono tabular-nums">
            {isTheoretical ? 'MM(H₂) = 2 × 1,01 g/mol' : 'Exceso estequiométrico asegurado'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1">
          <div className="text-xs text-slate-500 font-medium">Producto formado</div>
          <div className="font-mono text-lg font-bold text-emerald-700 tabular-nums">
            → 2 moles NH₃(g)
          </div>
          <div className="text-xs text-slate-600 font-mono tabular-nums">
            {isTheoretical
              ? 'Relación molar N₂ : NH₃ = 1 : 2'
              : 'Masa experimental obtenida = 45,5 g'}
          </div>
        </div>
      </div>
    </div>
  );
};
