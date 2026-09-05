import antonUrl from "@fontsource/montserrat/files/montserrat-latin-900-normal.woff?url";
import interUrl from "@fontsource/montserrat/files/montserrat-latin-400-normal.woff?url";
import interBoldUrl from "@fontsource/montserrat/files/montserrat-latin-700-normal.woff?url";
import { renderPlanPdfDocument } from "./planPdfLayout.js";

async function loadBrandFonts(doc) {
  const [anton, inter, interBold] = await Promise.all([antonUrl, interUrl, interBoldUrl].map(url => fetch(url).then(response => { if (!response.ok) throw new Error("Unable to load the Good Grief PDF fonts."); return response.arrayBuffer(); })));
  doc.registerFont("Anton", anton); doc.registerFont("Inter", inter); doc.registerFont("InterBold", interBold);
}

export async function exportPlanPdf(data) {
  const { default: PDFDocument } = await import("pdfkit/js/pdfkit.standalone.js");
  const doc = new PDFDocument({ autoFirstPage: true, size: "A4", margin: 0, info: { Title: "My Good Grief send-off plan", Author: "Good Grief", Subject: "Funeral wishes and practical plan" } });
  await loadBrandFonts(doc);
  const chunks = [];
  doc.on("data", chunk => chunks.push(chunk));
  const complete = new Promise((resolve, reject) => { doc.on("end", resolve); doc.on("error", reject); });
  renderPlanPdfDocument(doc, data); doc.end();
  await complete;
  const url = URL.createObjectURL(new Blob(chunks, { type: "application/pdf" }));
  const link = document.createElement("a"); link.href = url; link.download = "good-grief-my-send-off.pdf"; document.body.appendChild(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
