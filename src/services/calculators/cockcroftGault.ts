// Calculadora de Aclaramiento de Creatinina según Cockcroft-Gault (1976)
// Verificado: Nephron 1976;16(1):31-41. DOI: 10.1159/000180580

export interface CockcroftGaultResult {
  crCl: number | null;
  status: 'calculado' | 'incompleto';
  missingVariables: string[];
  limitations: string[];
  formulaString: string;
}

export function calculateCockcroftGault(
  edad: number | null,
  pesoKg: number | null,
  creatininaMgDl: number | null,
  sexo: 0 | 1 | null
): CockcroftGaultResult {
  const missing: string[] = [];
  if (edad === null || edad === undefined) missing.push('Edad');
  if (pesoKg === null || pesoKg === undefined) missing.push('Peso (kg)');
  if (creatininaMgDl === null || creatininaMgDl === undefined) missing.push('Creatinina sérica');
  if (sexo === null || sexo === undefined) missing.push('Sexo');

  if (missing.length > 0 || !creatininaMgDl || creatininaMgDl <= 0 || !pesoKg || pesoKg <= 0 || !edad || edad <= 0) {
    return {
      crCl: null,
      status: 'incompleto',
      missingVariables: missing,
      limitations: ['Faltan variables indispensables para Cockcroft-Gault (edad, peso, creatinina o sexo).'],
      formulaString: 'CrCl = [(140 - edad) × peso] / (72 × Cr) [× 0.85 si mujer]'
    };
  }

  // CrCl = ((140 - edad) * peso) / (72 * Cr) * (sexo === 1 ? 0.85 : 1.0)
  const factorSexo = sexo === 1 ? 0.85 : 1.0;
  const rawCrCl = ((140 - edad) * pesoKg * factorSexo) / (72 * creatininaMgDl);
  const rounded = Math.round(rawCrCl * 10) / 10;

  const limitations: string[] = [];
  limitations.push('No indexado a 1.73 m²; refleja aclaramiento absoluto para ajuste posológico y scores PRECISE-DAPT / CRUSADE.');
  if (creatininaMgDl < 0.6) {
    limitations.push('Creatinina muy baja: puede sobreestimar el filtrado en pacientes caquécticos o con masa muscular reducida.');
  }

  return {
    crCl: rounded,
    status: 'calculado',
    missingVariables: [],
    limitations,
    formulaString: `[ (140 - ${edad}) × ${pesoKg} × ${factorSexo} ] / (72 × ${creatininaMgDl}) = ${rounded} mL/min`
  };
}
