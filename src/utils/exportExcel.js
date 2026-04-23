import ExcelJS from 'exceljs';

// Colores institucionales
const AZUL_OSCURO  = 'FF0D1F3E';
const AZUL_MEDIO   = 'FF1E4FC2';
const AZUL_CLARO   = 'FFD6E4FF';
const DORADO       = 'FFE8A820';
const BLANCO       = 'FFFFFFFF';
const GRIS_CLARO   = 'FFF5F7FC';
const GRIS_BORDE   = 'FFD1D5DB';

function borderFull() {
  const side = { style: 'thin', color: { argb: GRIS_BORDE } };
  return { top: side, left: side, bottom: side, right: side };
}

function headerStyle(bg = AZUL_OSCURO, fg = BLANCO) {
  return {
    font:      { name: 'Arial', bold: true, size: 10, color: { argb: fg } },
    fill:      { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } },
    alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
    border:    borderFull(),
  };
}

function cellStyle(bg = BLANCO) {
  return {
    font:      { name: 'Arial', size: 10 },
    fill:      { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } },
    alignment: { horizontal: 'left', vertical: 'middle' },
    border:    borderFull(),
  };
}

// ─── Hoja de Resumen ────────────────────────────────────────────────────────
function buildResumenSheet(wb, registrations) {
  const ws = wb.addWorksheet('Resumen');

  // Título principal
  ws.mergeCells('A1:F1');
  const titulo = ws.getCell('A1');
  titulo.value     = 'I ENCUENTRO DE LA RED 2026 — RED DE COLEGIOS DE ALTO HOSPICIO';
  titulo.font      = { name: 'Arial', bold: true, size: 14, color: { argb: BLANCO } };
  titulo.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL_OSCURO } };
  titulo.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 36;

  // Subtítulo fecha
  ws.mergeCells('A2:F2');
  const fecha = ws.getCell('A2');
  fecha.value     = '29 de Abril de 2026  ·  14:30 – 17:00 hrs';
  fecha.font      = { name: 'Arial', size: 11, color: { argb: AZUL_OSCURO } };
  fecha.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
  fecha.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(2).height = 22;

  ws.addRow([]);

  // Total general
  ws.mergeCells('A4:C4');
  ws.getCell('A4').value = 'TOTAL DE PARTICIPANTES REGISTRADOS';
  Object.assign(ws.getCell('A4'), headerStyle(AZUL_MEDIO));
  ws.getCell('D4').value     = registrations.length;
  ws.getCell('D4').font      = { name: 'Arial', bold: true, size: 14, color: { argb: AZUL_MEDIO } };
  ws.getCell('D4').alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getCell('D4').border    = borderFull();
  ws.getRow(4).height = 28;

  ws.addRow([]);

  // Encabezado tabla resumen
  const hRow = ws.addRow(['#', 'ESTABLECIMIENTO', 'COMUNA', 'ÁREA DE PARTICIPACIÓN', 'SEDE', 'INSCRITOS']);
  hRow.height = 24;
  hRow.eachCell((cell) => Object.assign(cell, headerStyle()));

  // Agrupar por establecimiento
  const grupos = {};
  registrations.forEach((r) => {
    const key = r.colegioOrigen || 'Sin especificar';
    if (!grupos[key]) grupos[key] = [];
    grupos[key].push(r);
  });

  const colegiosOrdenados = Object.keys(grupos).sort();
  let idx = 1;
  colegiosOrdenados.forEach((colegio) => {
    const lista = grupos[colegio];
    const areas = [...new Set(lista.map((r) => r.area))].join(', ');
    const sedes = [...new Set(lista.map((r) => r.sede))].filter(Boolean).join(', ');
    const comuna = lista[0]?.comunaOrigen || '';
    const bg = idx % 2 === 0 ? GRIS_CLARO : BLANCO;
    const row = ws.addRow([idx, colegio, comuna, areas, sedes, lista.length]);
    row.height = 20;
    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(6).font      = { name: 'Arial', bold: true, size: 11, color: { argb: AZUL_MEDIO } };
    row.eachCell((cell) => {
      if (!cell.style.fill?.fgColor?.argb || cell.style.fill.fgColor.argb === BLANCO) {
        cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
        cell.font   = cell.font || { name: 'Arial', size: 10 };
        cell.border = borderFull();
        cell.alignment = cell.alignment || { horizontal: 'left', vertical: 'middle' };
      }
    });
    idx++;
  });

  // Anchos de columna
  ws.getColumn(1).width = 5;
  ws.getColumn(2).width = 40;
  ws.getColumn(3).width = 18;
  ws.getColumn(4).width = 35;
  ws.getColumn(5).width = 40;
  ws.getColumn(6).width = 12;
}

// ─── Hoja por establecimiento ───────────────────────────────────────────────
function buildColegioSheet(wb, colegio, lista, numero) {
  // Nombre de hoja seguro (máx 31 chars, sin caracteres inválidos)
  const sheetName = colegio.replace(/[\\\/\?\*\[\]:]/g, '').substring(0, 28).trim()
    || `Establecimiento ${numero}`;

  const ws = wb.addWorksheet(sheetName);

  // Título
  ws.mergeCells('A1:H1');
  const t = ws.getCell('A1');
  t.value     = colegio.toUpperCase();
  t.font      = { name: 'Arial', bold: true, size: 13, color: { argb: BLANCO } };
  t.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL_MEDIO } };
  t.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 30;

  // Info de la hoja
  ws.mergeCells('A2:H2');
  const info = ws.getCell('A2');
  info.value     = `${lista.length} participante${lista.length !== 1 ? 's' : ''} registrado${lista.length !== 1 ? 's' : ''}  ·  I Encuentro de la Red 2026`;
  info.font      = { name: 'Arial', size: 10, italic: true, color: { argb: AZUL_OSCURO } };
  info.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL_CLARO } };
  info.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(2).height = 18;

  ws.addRow([]);

  // Encabezados
  const COLS = ['#', 'NOMBRE COMPLETO', 'RUT', 'CARGO', 'ÁREA DE PARTICIPACIÓN', 'SEDE', 'CORREO', 'TELÉFONO'];
  const hRow = ws.addRow(COLS);
  hRow.height = 22;
  hRow.eachCell((cell) => Object.assign(cell, headerStyle(AZUL_OSCURO)));

  // Datos
  lista.forEach((r, i) => {
    const bg = i % 2 === 0 ? BLANCO : GRIS_CLARO;
    const row = ws.addRow([
      i + 1,
      r.nombreCompleto,
      r.rut,
      r.cargo,
      r.area,
      r.sede || '',
      r.email,
      r.telefono,
    ]);
    row.height = 18;
    row.eachCell((cell, col) => {
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      cell.font      = { name: 'Arial', size: 10 };
      cell.border    = borderFull();
      cell.alignment = col === 1
        ? { horizontal: 'center', vertical: 'middle' }
        : { horizontal: 'left',   vertical: 'middle' };
    });
  });

  // Fila total
  const totalRow = ws.addRow(['', `TOTAL: ${lista.length} participante${lista.length !== 1 ? 's' : ''}`, '', '', '', '', '', '']);
  totalRow.height = 20;
  ws.mergeCells(`B${totalRow.number}:H${totalRow.number}`);
  totalRow.eachCell((cell) => {
    cell.font   = { name: 'Arial', bold: true, size: 10, color: { argb: BLANCO } };
    cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL_OSCURO } };
    cell.border = borderFull();
    cell.alignment = { horizontal: 'left', vertical: 'middle' };
  });

  // Anchos
  ws.getColumn(1).width = 5;
  ws.getColumn(2).width = 38;
  ws.getColumn(3).width = 14;
  ws.getColumn(4).width = 22;
  ws.getColumn(5).width = 28;
  ws.getColumn(6).width = 38;
  ws.getColumn(7).width = 30;
  ws.getColumn(8).width = 16;
}

// ─── Exportar ────────────────────────────────────────────────────────────────
export async function exportarParticipantes(registrations) {
  const wb = new ExcelJS.Workbook();
  wb.creator  = 'Sistema Red de Colegios Alto Hospicio';
  wb.created  = new Date();
  wb.modified = new Date();

  // 1. Hoja resumen
  buildResumenSheet(wb, registrations);

  // 2. Una hoja por establecimiento (ordenados alfabéticamente)
  const grupos = {};
  registrations.forEach((r) => {
    const key = r.colegioOrigen || 'Sin especificar';
    if (!grupos[key]) grupos[key] = [];
    grupos[key].push(r);
  });

  Object.keys(grupos)
    .sort()
    .forEach((colegio, i) => {
      buildColegioSheet(wb, colegio, grupos[colegio], i + 1);
    });

  // Descargar
  const buffer = await wb.xlsx.writeBuffer();
  const blob   = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement('a');
  a.href       = url;
  a.download   = `participantes_encuentro_red_2026_${new Date().toISOString().slice(0,10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
