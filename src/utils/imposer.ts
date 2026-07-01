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
export function getGridDimensions(cols: number, rows: number): { cols: number; rows: number; orientation: "portrait" | "landscape" } {
  return {
    cols,
    rows,
    orientation: cols > rows ? "landscape" : "portrait",
  };
}

/**
 * Generates the sheet mappings describing which physical pages reside on which
 * sheet grid cell. Suppoorts Booklet Imposition and Normal/Duplex mapping.
 */
export function generateSheetLayout(
  activePages: number[],
  config: ImpositionConfig
): Sheet[] {
  const { pagesPerSheet, duplexMode, preset, columns, rows } = config;
  const { cols, rows: gridRows, orientation } = getGridDimensions(columns, rows);
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

  let effectiveFlow = config.layoutFlow;
  if (effectiveFlow === "duplex-notes" && !isDuplex) {
    // Fallback: If printing single-sided, flashcard mode drops even pages. Force sequential flow.
    effectiveFlow = "rows"; 
  }

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

        if (effectiveFlow === "duplex-notes") {
          // Normal student note organization:
          // We want Page 1 on Front to Back Page 2 directly.
          // Cell at (r, c) on Front is backed by cell at (r, cols - 1 - c) on Back!
          // So Front layout counts in steps of 2: Cell 0 = Page 1 (offset + 0), Cell 1 = Page 3 (offset + 2) etc.
          pageIdx = frontOffset + (r * cols + c) * 2;
        } else if (effectiveFlow === "columns") {
          // Column Flow: Fill top to bottom, then left to right
          pageIdx = frontOffset + (c * rows + r);
        } else {
          // Standard fluid sequential filling (Rows / Z-Curve):
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

    // Populate the back side of this sheet (if isDuplex)
    if (isDuplex) {
      const backOffset = s * cellsPerSheet;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cellIndex = r * cols + c;
          let pNum: number | null = null;
          let isFlipped = false;

          if (effectiveFlow === "duplex-notes") {
            // Determine how the paper is physically flipped to align fronts and backs.
            const isLeftRightFlip = 
              (orientation === "portrait" && config.duplexMode === "flip-long") ||
              (orientation === "landscape" && config.duplexMode === "flip-short");
              
            const isTopBottomFlip = 
              (orientation === "portrait" && config.duplexMode === "flip-short") ||
              (orientation === "landscape" && config.duplexMode === "flip-long");

            let correspondingFrontCol = c;
            let correspondingFrontRow = r;

            if (isLeftRightFlip) {
              correspondingFrontCol = cols - 1 - c;
            } else if (isTopBottomFlip) {
              correspondingFrontRow = rows - 1 - r;
              isFlipped = true; // Rotate 180 degrees to cancel out the physical upside-down flip for flashcards
            }

            const correspondingFrontPageIdx = frontOffset + (correspondingFrontRow * cols + correspondingFrontCol) * 2;
            const backingPageIdx = correspondingFrontPageIdx + 1;

            pNum = backingPageIdx < totalOriginalPages ? activePages[backingPageIdx] : null;
          } else if (effectiveFlow === "columns") {
            // Sequential back filling for columns:
            const backCellIdx = c * rows + r;
            const backPageIdx = backOffset + cellsPerSide + backCellIdx;
            pNum = backPageIdx < totalOriginalPages ? activePages[backPageIdx] : null;
          } else {
            // Standard Sequential back filling for rows:
            // Back page has its own sequential offset starting after all Front cells.
            const backPageIdx = backOffset + cellsPerSide + cellIndex;
            pNum = backPageIdx < totalOriginalPages ? activePages[backPageIdx] : null;
          }

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

  let watermarkImage: any = null;
  if (config.watermark.enabled) {
    try {
      const resp = await fetch('/watermark.png');
      if (resp.ok) {
        const imgBytes = await resp.arrayBuffer();
        watermarkImage = await destDoc.embedPng(imgBytes);
      }
    } catch (e) {
      console.warn("Could not load watermark image", e);
    }
  }

  let baseWidth = 595.28;
  let baseHeight = 841.89; // A4 default

  if (config.paperSize === "A3") {
    baseWidth = 841.89;
    baseHeight = 1190.55;
  } else if (config.paperSize === "Letter") {
    baseWidth = 612;
    baseHeight = 792;
  } else if (config.paperSize === "A5") {
    baseWidth = 420.94;
    baseHeight = 595.28;
  }

  let { orientation, cols, rows } = getGridDimensions(config.columns, config.rows);

  // Auto-Flip for Landscape Slides (PPT Trap)
  if (srcPages.length > 0) {
    const firstPage = srcPages[0];
    const cropBox = firstPage.getCropBox();
    if (cropBox.width > cropBox.height) {
      orientation = "landscape"; // Auto force landscape sheet for slide decks
    }
  }

  const pageWidth = orientation === "landscape" ? baseHeight : baseWidth;
  const pageHeight = orientation === "landscape" ? baseWidth : baseHeight;

  // Compute margin offset
  let mt = 12, mb = 12, ml = 12, mr = 12; // compact default
  if (config.margin === "none") { mt = mb = ml = mr = 0; }
  else if (config.margin === "standard") { mt = mb = ml = mr = 24; }
  else if (config.margin === "wide") { mt = mb = ml = mr = 40; }
  else if (config.margin === "custom") {
    mt = config.customMargins?.top ?? 0;
    mb = config.customMargins?.bottom ?? 0;
    ml = config.customMargins?.left ?? 0;
    mr = config.customMargins?.right ?? 0;
  }

  const usableWidth = pageWidth - (ml + mr);
  const usableHeight = pageHeight - (mt + mb);
  
  const gapH = config.gapHorizontal ?? 0;
  const gapV = config.gapVertical ?? 0;

  const cellWidth = (usableWidth - (cols - 1) * gapH) / cols;
  const cellHeight = (usableHeight - (rows - 1) * gapV) / rows;

  const fontRef = await destDoc.embedFont(StandardFonts.Helvetica);
  const fontBoldRef = await destDoc.embedFont(StandardFonts.HelveticaBold);

  // Pre-copy all active pages in a single batch to prevent duplicate resources (fonts/images)
  onProgress?.("Copying resources to prevent bloat...");
  const uniquePageNums = Array.from(new Set(activePages));
  const validPageNums = uniquePageNums.filter(p => p - 1 >= 0 && p - 1 < maxPages);
  const indicesToCopy = validPageNums.map(p => p - 1);
  
  const copiedPages = await destDoc.copyPages(srcDoc, indicesToCopy);
  
  const pageNumToCopiedPage = new Map<number, any>();
  for (let i = 0; i < validPageNums.length; i++) {
    pageNumToCopiedPage.set(validPageNums[i], copiedPages[i]);
  }

  // Embed source pages as form objects
  onProgress?.("Embedding source documents into target...");
  const embeddedPagesMap = new Map<number, any>();

  for (const pageNum of activePages) {
    if (!embeddedPagesMap.has(pageNum)) {
      const copiedPage = pageNumToCopiedPage.get(pageNum);
      if (copiedPage) {
        const embedded = await destDoc.embedPage(copiedPage);
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
      x: ml,
      y: mb,
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
      // Column `c` starts at left: `ml + c * (cellWidth + gapH)`
      // Row `r` starts from top: `pageHeight - mt - (r + 1) * cellHeight - r * gapV`
      const x = ml + c * (cellWidth + gapH);
      const y = pageHeight - mt - (r + 1) * cellHeight - r * gapV;

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

          let shouldRotate = false;
          let drawW = srcW;
          let drawH = srcH;
          let visualW = srcW;
          let visualH = srcH;

          if (config.scaleToFit) {
            const scaleNormal = Math.min(targetW / srcW, targetH / srcH);
            const scale = scaleNormal;

            shouldRotate = false;
            drawW = srcW * scale;
            drawH = srcH * scale;
            visualW = drawW;
            visualH = drawH;
          } else {
            // Stretch to fill exactly (Aspect Ratio Unlocked)
            shouldRotate = false;

            visualW = targetW;
            visualH = targetH;
            drawW = targetW;
            drawH = targetH;
          }

          // Center the embedded section inside the layout container
          const drawX = x + (cellWidth - visualW) / 2;
          const drawY = y + (cellHeight - visualH) / 2 + 3; // Nudge up to make room for cell page labels

          // The visual bounding box is [drawX, drawX + visualW] x [drawY, drawY + visualH].
          // The original page is [0, drawW] x [0, drawH].
          let angleDegrees = shouldRotate ? 90 : 0;
          if (cell.isFlipped) angleDegrees += 180;
          angleDegrees = angleDegrees % 360;

          let posX = drawX;
          let posY = drawY;

          if (angleDegrees === 90) {
            posX = drawX + visualW;
            posY = drawY;
          } else if (angleDegrees === 180) {
            posX = drawX + visualW;
            posY = drawY + visualH;
          } else if (angleDegrees === 270) {
            posX = drawX;
            posY = drawY + visualH;
          }

          pageObj.drawPage(embedded, {
            x: posX,
            y: posY,
            width: drawW,
            height: drawH,
            angle: degrees(angleDegrees),
          });

          // Draw a small sub-indicator of the original page number inside the cell padding area
          if (config.pageNumbersEnabled) {
            const fontLabelText = `Page ${pNum}`;
            const labelSize = 6.5;
            const textWidth = fontRef.widthOfTextAtSize(fontLabelText, labelSize);
            
            if (cell.isFlipped) {
               pageObj.drawText(fontLabelText, {
                 x: x + (cellWidth + textWidth) / 2,
                 y: y + cellHeight - 4,
                 size: labelSize,
                 font: fontRef,
                 color: rgb(0.5, 0.5, 0.5),
                 rotate: degrees(180)
               });
            } else {
              pageObj.drawText(fontLabelText, {
                x: x + (cellWidth - textWidth) / 2,
                y: y + 4,
                size: labelSize,
                font: fontRef,
                color: rgb(0.5, 0.5, 0.5),
              });
            }
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
    if (config.watermark.enabled && watermarkImage) {
      const opacity = config.watermark.opacity || 0.15;
      
      const centerX = pageWidth / 2;
      const centerY = pageHeight / 2;

      const imgW = watermarkImage.width;
      const imgH = watermarkImage.height;
      
      // Scale watermark to fit about 50% of the page width
      const targetW = pageWidth * 0.5;
      const scale = targetW / imgW;
      const drawW = imgW * scale;
      const drawH = imgH * scale;

      pageObj.drawImage(watermarkImage, {
        x: centerX - drawW / 2,
        y: centerY - drawH / 2,
        width: drawW,
        height: drawH,
        opacity: opacity,
      });
    } 
    
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
      y: mb > 12 ? mb / 2 : 5,
      size: footerSize,
      font: fontRef,
      color: rgb(0.4, 0.4, 0.4),
    });
  }

  onProgress?.("Building final binary buffer...");
  const compiledBytes = await destDoc.save({ useObjectStreams: true });
  return compiledBytes;
}
