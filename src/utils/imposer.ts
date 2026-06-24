/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";
import { ImpositionConfig, Sheet, SheetSide, GridCell, PagesPerSheet } from "../types";

/**
 * Parses user input page subsets like "1-5, 8, 10-12" into a list of 1-based indices.
 */
export function parsePageSubset(pageStr: string, maxPages: number): number[] {
  const trimmed = pageStr.trim();
  if (!trimmed) {
    // Default to all pages
    return Array.from({ length: maxPages }, (_, i) => i + 1);
  }

  const pages: number[] = [];
  const parts = trimmed.split(",");

  for (const part of parts) {
    const range = part.trim();
    if (!range) continue;

    if (range.includes("-")) {
      const [startStr, endStr] = range.split("-");
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (!isNaN(start) && !isNaN(end)) {
        const minVal = Math.max(1, Math.min(start, maxPages));
        const maxVal = Math.max(1, Math.min(end, maxPages));
        const step = minVal <= maxVal ? 1 : -1;

        for (let i = minVal; ; i += step) {
          pages.push(i);
          if (i === maxVal) break;
        }
      }
    } else {
      const pageNum = parseInt(range, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages) {
        pages.push(pageNum);
      }
    }
  }

  return pages.length > 0 ? pages : Array.from({ length: maxPages }, (_, i) => i + 1);
}

/**
 * Returns grid dimensions (cols, rows) for a given pages-per-sheet setting.
 * In a landscape sheets context, dimensions are automatically rotated to preserve ratio.
 */
export function getGridDimensions(pagesPerSheet: PagesPerSheet): { cols: number; rows: number; orientation: "portrait" | "landscape" } {
  switch (pagesPerSheet) {
    case 1:
      return { cols: 1, rows: 1, orientation: "portrait" };
    case 2:
      return { cols: 2, rows: 1, orientation: "landscape" };
    case 4:
      return { cols: 2, rows: 2, orientation: "portrait" };
    case 6:
      return { cols: 3, rows: 2, orientation: "landscape" };
    case 8:
      return { cols: 4, rows: 2, orientation: "landscape" };
    case 9:
      return { cols: 3, rows: 3, orientation: "portrait" };
    case 12:
      return { cols: 4, rows: 3, orientation: "landscape" };
    case 16:
      return { cols: 4, rows: 4, orientation: "portrait" };
    default:
      return { cols: 1, rows: 1, orientation: "portrait" };
  }
}

/**
 * Generates the sheet mappings describing which physical pages reside on which
 * sheet grid cell. Suppoorts Booklet Imposition and Normal/Duplex mapping.
 */
export function generateSheetLayout(
  activePages: number[],
  config: ImpositionConfig
): Sheet[] {
  const { pagesPerSheet, duplexMode, preset } = config;
  const { cols, rows } = getGridDimensions(pagesPerSheet);
  const cellsPerSide = cols * rows;

  const totalOriginalPages = activePages.length;

  if (preset === "booklet") {
    // Booklet mode: 2 portrait pages per landscape sheet side -> 4 pages per sheet total.
    // Round active page list to a multiple of 4.
    const bookletTotal = Math.ceil(totalOriginalPages / 4) * 4;
    const numSheets = bookletTotal / 4;
    const sheets: Sheet[] = [];

    for (let s = 0; s < numSheets; s++) {
      // Booklet Front Side: Left = bookletTotal - 2*s, Right = 2*s + 1
      const flIndex = bookletTotal - 2 * s;
      const frIndex = 2 * s + 1;

      // Booklet Back Side: Left = 2*s + 2, Right = bookletTotal - 2*s - 1
      const blIndex = 2 * s + 2;
      const brIndex = bookletTotal - 2 * s - 1;

      // Map back to our page array
      const pFrontLeft = flIndex <= totalOriginalPages ? activePages[flIndex - 1] : null;
      const pFrontRight = frIndex <= totalOriginalPages ? activePages[frIndex - 1] : null;

      const pBackLeft = blIndex <= totalOriginalPages ? activePages[blIndex - 1] : null;
      const pBackRight = brIndex <= totalOriginalPages ? activePages[brIndex - 1] : null;

      sheets.push({
        sheetIndex: s,
        front: {
          side: "front",
          cells: [
            { cellIndex: 0, originalPageNumber: pFrontLeft, isFlipped: false },
            { cellIndex: 1, originalPageNumber: pFrontRight, isFlipped: false },
          ],
        },
        back: {
          side: "back",
          cells: [
            { cellIndex: 0, originalPageNumber: pBackLeft, isFlipped: false },
            { cellIndex: 1, originalPageNumber: pBackRight, isFlipped: false },
          ],
        },
      });
    }

    return sheets;
  }

  // --- GENERAL DUPLEX IMPOSITION ENGINE ---
  // A single physical sheet has both front and back (unless duplexMode is 'none', which splits sheets)
  const isDuplex = duplexMode !== "none";
  const cellsPerSheet = isDuplex ? cellsPerSide * 2 : cellsPerSide;

  const numSheets = Math.ceil(totalOriginalPages / cellsPerSheet);
  const sheets: Sheet[] = [];

  for (let s = 0; s < numSheets; s++) {
    const frontCells: GridCell[] = [];
    const backCells: GridCell[] = [];

    // Let's populate the front side of this sheet
    const frontOffset = s * cellsPerSheet;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cellIndex = r * cols + c;

        let pageIdx: number;

        if (config.layoutFlow === "duplex-notes") {
          // Normal student note organization:
          // We want Page 1 on Front to Back Page 2 directly.
          // Cell at (r, c) on Front is backed by cell at (r, cols - 1 - c) on Back!
          // So Front layout counts in steps of 2: Cell 0 = Page 1 (offset + 0), Cell 1 = Page 3 (offset + 2) etc.
          pageIdx = frontOffset + (r * cols + c) * 2;
        } else {
          // Standard fluid sequential filling:
          // Front side is filled sequentially first from 1 to cellsPerSide
          pageIdx = frontOffset + cellIndex;
        }

        const pNum = pageIdx < totalOriginalPages ? activePages[pageIdx] : null;
        frontCells.push({
          cellIndex,
          originalPageNumber: pNum,
          isFlipped: false,
        });
      }
    }

    // Populate the back side of this sheet (if duplex)
    if (isDuplex) {
      const backOffset = s * cellsPerSheet;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cellIndex = r * cols + c;
          let pNum: number | null = null;

          if (config.layoutFlow === "duplex-notes") {
            // Under duplex note logic, Back cell at (r, c) aligns with Front cell at (r, cols - 1 - c).
            // So we fetch the backing sibling page for Front at (r, cols - 1 - c).
            // Backing page number is (Front Page) + 1.
            const correspondingFrontCol = cols - 1 - c;
            const correspondingFrontPageIdx = frontOffset + (r * cols + correspondingFrontCol) * 2;
            const backingPageIdx = correspondingFrontPageIdx + 1;

            pNum = backingPageIdx < totalOriginalPages ? activePages[backingPageIdx] : null;
          } else {
            // Standard Sequential back filling:
            // Back page has its own sequential offset starting after all Front cells.
            const backPageIdx = backOffset + cellsPerSide + cellIndex;
            pNum = backPageIdx < totalOriginalPages ? activePages[backPageIdx] : null;
          }

          // In flip-short duplex modes, the back page text needs 180 degrees flip,
          // depending on the physical printing parameters.
          const isFlipped = duplexMode === "flip-short";

          backCells.push({
            cellIndex,
            originalPageNumber: pNum,
            isFlipped,
          });
        }
      }
    }

    sheets.push({
      sheetIndex: s,
      front: { side: "front", cells: frontCells },
      back: { side: "back", cells: isDuplex ? backCells : [] },
    });
  }

  return sheets;
}

/**
 * Creates an imposed PDF document inside the browser using pdf-lib. Uses formXObjects for vector graphics scaling.
 */
export async function createImposedPDF(
  srcPdfBytes: ArrayBuffer,
  config: ImpositionConfig,
  onProgress?: (text: string) => void
): Promise<Uint8Array> {
  onProgress?.("Reading original PDF structure...");
  const srcDoc = await PDFDocument.load(srcPdfBytes);
  const srcPages = srcDoc.getPages();
  const maxPages = srcPages.length;

  onProgress?.("Parsing requested page range...");
  const activePages = parsePageSubset(config.selectedPages, maxPages);

  onProgress?.("Assembling layout matrices...");
  const sheets = generateSheetLayout(activePages, config);

  onProgress?.("Synthesizing output document...");
  const destDoc = await PDFDocument.create();

  // Define physical page size: standard Letter (8.5" x 11" @ 72 dpi) is 612 x 792.
  // Standard A4 is 595.27 x 841.89 points. Let's use standard Letter.
  // If orientation is "landscape" (e.g. 2 pages per sheet), we invert width and height.
  const { orientation, cols, rows } = getGridDimensions(config.pagesPerSheet);
  const baseWidth = 612;
  const baseHeight = 792;

  const pageWidth = orientation === "landscape" ? baseHeight : baseWidth;
  const pageHeight = orientation === "landscape" ? baseWidth : baseHeight;

  // Compute margin offset
  let marginSize = 12; // compact default
  if (config.margin === "none") marginSize = 0;
  else if (config.margin === "standard") marginSize = 24;
  else if (config.margin === "wide") marginSize = 40;

  if (config.customMarginValue !== undefined && config.preset === "custom") {
    marginSize = config.customMarginValue;
  }

  const usableWidth = pageWidth - marginSize * 2;
  const usableHeight = pageHeight - marginSize * 2;

  const cellWidth = usableWidth / cols;
  const cellHeight = usableHeight / rows;

  const fontRef = await destDoc.embedFont(StandardFonts.Helvetica);
  const fontBoldRef = await destDoc.embedFont(StandardFonts.HelveticaBold);

  // Embed source pages as form objects
  onProgress?.("Embedding source documents into target...");
  const embeddedPagesMap = new Map<number, any>();

  for (const pageNum of activePages) {
    // 0-bound page index to embed
    const srcIndex = pageNum - 1;
    if (srcIndex >= 0 && srcIndex < maxPages) {
      if (!embeddedPagesMap.has(pageNum)) {
        const embedded = await destDoc.embedPage(srcPages[srcIndex]);
        embeddedPagesMap.set(pageNum, embedded);
      }
    }
  }

  let printedSheetCount = 0;
  const totalSheets = sheets.length;

  for (let s = 0; s < totalSheets; s++) {
    onProgress?.(`Forming physical sheet ${s + 1} of ${totalSheets}...`);
    const sheet = sheets[s];

    // --- RENDER FRONT SIDE ---
    const frontPage = destDoc.addPage([pageWidth, pageHeight]);
    printedSheetCount++;

    await drawSheetSide(frontPage, sheet.front, "front", s, totalSheets);

    // --- RENDER BACK SIDE (if active) ---
    if (config.duplexMode !== "none" && sheet.back.cells.length > 0) {
      const backPage = destDoc.addPage([pageWidth, pageHeight]);
      await drawSheetSide(backPage, sheet.back, "back", s, totalSheets);
    }
  }

  async function drawSheetSide(
    pageObj: any,
    sideData: SheetSide,
    sideType: "front" | "back",
    sheetIndex: number,
    totalSheetsCount: number
  ) {
    const isBack = sideType === "back";

    // Draw grid border lines if requested, or clean border outlines for print alignments
    // (A subtle gray grid makes notes extremely neat and easier to crop/cut!)
    pageObj.drawRectangle({
      x: marginSize,
      y: marginSize,
      width: usableWidth,
      height: usableHeight,
      borderColor: rgb(0.85, 0.85, 0.85),
      borderWidth: 0.5,
    });

    // 1. Draw Cell Boundaries and Content
    for (const cell of sideData.cells) {
      const cellIdx = cell.cellIndex;
      const r = Math.floor(cellIdx / cols);
      const c = cellIdx % cols;

      // Calculate cell bounding box
      // In PDF, target origin (0,0) is bottom-left!
      // So rows are counted upwards from bottom!
      // Column `c` starts at left: `marginSize + c * cellWidth`
      // Row `r` starts from top: `pageHeight - marginSize - (r + 1) * cellHeight`
      const x = marginSize + c * cellWidth;
      const y = pageHeight - marginSize - (r + 1) * cellHeight;

      // Draw light gray grid boundaries for each note segment
      pageObj.drawRectangle({
        x,
        y,
        width: cellWidth,
        height: cellHeight,
        borderColor: rgb(0.9, 0.9, 0.9),
        borderWidth: 0.5,
      });

      if (cell.originalPageNumber !== null) {
        const pNum = cell.originalPageNumber;
        const embedded = embeddedPagesMap.get(pNum);

        if (embedded) {
          // Determine scale and position to preserve content aspect ratios
          const srcW = embedded.width;
          const srcH = embedded.height;

          // Inner padding inside cells for page numbers and aesthetics
          const innerPad = 14;
          const targetW = cellWidth - innerPad * 2;
          const targetH = cellHeight - innerPad * 2;

          let scale = 1;
          if (config.scaleToFit) {
            scale = Math.min(targetW / srcW, targetH / srcH);
          }

          const drawW = srcW * scale;
          const drawH = srcH * scale;

          // Center the embedded section inside the layout container
          const drawX = x + (cellWidth - drawW) / 2;
          const drawY = y + (cellHeight - drawH) / 2 + 3; // Nudge up to make room for cell page labels

          // Draw the embedded page
          pageObj.drawPage(embedded, {
            x: drawX,
            y: drawY,
            width: drawW,
            height: drawH,
          });

          // Draw a small sub-indicator of the original page number inside the cell padding area
          if (config.pageNumbersEnabled) {
            const fontLabelText = `Page ${pNum}`;
            const labelSize = 6.5;
            const textWidth = fontRef.widthOfTextAtSize(fontLabelText, labelSize);
            pageObj.drawText(fontLabelText, {
              x: x + (cellWidth - textWidth) / 2,
              y: y + 4,
              size: labelSize,
              font: fontRef,
              color: rgb(0.5, 0.5, 0.5),
            });
          }
        }
      } else {
        // Draw a light crossed pattern for unmapped/empty padding cells
        pageObj.drawLine({
          start: { x: x + 10, y: y + 10 },
          end: { x: x + cellWidth - 10, y: y + cellHeight - 10 },
          color: rgb(0.95, 0.95, 0.95),
          thickness: 1,
        });
        pageObj.drawLine({
          start: { x: x + cellWidth - 10, y: y + 10 },
          end: { x: x + 10, y: y + cellHeight - 10 },
          color: rgb(0.95, 0.95, 0.95),
          thickness: 1,
        });
      }
    }

    // 2. Overlay Global Watermark
    if (config.watermark.enabled && config.watermark.text) {
      const wText = config.watermark.text.toUpperCase();
      const wSize = config.watermark.size || 34;
      const opacity = config.watermark.opacity || 0.12;

      // Draw watermark text diagonally centered on the paper sheet
      const textWidth = fontBoldRef.widthOfTextAtSize(wText, wSize);
      const textHeight = wSize;

      // Coordinate center
      const centerX = pageWidth / 2;
      const centerY = pageHeight / 2;

      pageObj.drawText(wText, {
        x: centerX - textWidth / 2 + Math.sin(Math.PI / 6) * (textHeight / 2),
        y: centerY - textHeight / 2,
        size: wSize,
        font: fontBoldRef,
        color: rgb(0.7, 0.7, 0.7),
        opacity,
        rotate: degrees(30),
      });
    }

    // 3. Draw physical sheet indices at sheet bottom center margins
    const footerText = `${sideType.toUpperCase()} - Sheet ${sheetIndex + 1} of ${totalSheetsCount}`;
    const footerSize = 8;
    const footerWidth = fontRef.widthOfTextAtSize(footerText, footerSize);
    pageObj.drawText(footerText, {
      x: (pageWidth - footerWidth) / 2,
      y: marginSize > 12 ? marginSize / 2 : 5,
      size: footerSize,
      font: fontRef,
      color: rgb(0.4, 0.4, 0.4),
    });
  }

  onProgress?.("Building final binary buffer...");
  const compiledBytes = await destDoc.save();
  return compiledBytes;
}
