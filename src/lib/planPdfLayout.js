const C = { ink: "#17172f", cream: "#f5efdf", paper: "#fffdf5", yellow: "#f0ee32", pink: "#ff4fa0", grey: "#6c6873" };
const PAGE = { width: 595.28, height: 841.89, left: 48, right: 547 };

function text(value) { return String(value || ""); }
function twoDigit(value) { return String(value).padStart(2, "0"); }
function paintPage(doc, colour = C.paper) { doc.save().rect(0, 0, PAGE.width, PAGE.height).fill(colour).restore(); }
function brand(doc, light = false) { doc.font("Anton").fontSize(22).fillColor(light ? C.cream : C.ink).text("Good", PAGE.left, 38, { continued: true }); doc.fillColor(C.pink).text(" Grief"); }
function footer(doc, label, pageNumber) { doc.save().moveTo(PAGE.left, 800).lineTo(PAGE.right, 800).lineWidth(.7).strokeColor("#c7c0b2").stroke(); doc.font("InterBold").fontSize(7).fillColor(C.grey).text(`GOOD GRIEF  /  ${label.toUpperCase()}`, PAGE.left, 811, { characterSpacing: .7 }); doc.text(twoDigit(pageNumber), PAGE.right - 20, 811, { width: 20, align: "right" }).restore(); }
function contentHeader(doc, title, marker) { brand(doc); doc.font("InterBold").fontSize(8).fillColor(C.ink).text(marker, 465, 44, { width: 82, align: "right", characterSpacing: 1.1 }); doc.moveTo(PAGE.left, 75).lineTo(PAGE.right, 75).lineWidth(2).strokeColor(C.ink).stroke(); doc.font("Anton").fontSize(47).fillColor(C.ink).text(title.toUpperCase(), PAGE.left, 98, { width: 470, lineGap: -4 }); }

export function renderPlanPdfDocument(doc, { answers, steps, ownerName = "My", updatedAt = new Date() }) {
  const answered = steps.filter(step => text(answers[step.key]).trim());
  if (!answered.length) throw new Error("Add at least one answer before downloading your plan.");
  const date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(updatedAt);
  let pageNumber = 1;

  paintPage(doc, C.ink); brand(doc, true);
  doc.save().rotate(7, { origin: [488, 84] }).rect(437, 51, 106, 63).fill(C.pink).lineWidth(1.5).strokeColor(C.cream).stroke().restore();
  doc.font("InterBold").fontSize(12).fillColor(C.ink).text("MY PLAN\nKEEP SAFE", 446, 67, { width: 88, align: "center", lineGap: 1 });
  doc.font("InterBold").fontSize(8).fillColor(C.pink).text("YOUR LIFE. YOUR SEND-OFF.", PAGE.left, 210, { characterSpacing: 1.8 });
  doc.font("Anton").fontSize(86).fillColor(C.cream).text("MY", PAGE.left, 244, { lineGap: -11 });
  doc.fillColor(C.yellow).text("SEND-OFF.", PAGE.left, 315, { lineGap: -11 });
  doc.fillColor(C.pink).text("MY RULES.", PAGE.left, 386, { lineGap: -11 });
  doc.moveTo(PAGE.left, 699).lineTo(PAGE.right, 699).lineWidth(1).strokeColor("#5e5c72").stroke();
  doc.font("InterBold").fontSize(13).fillColor(C.cream).text(ownerName === "My" ? "My Good Grief plan" : `${ownerName}'s Good Grief plan`, PAGE.left, 721);
  doc.font("Inter").fontSize(8).fillColor("#c8c5bd").text(`Prepared ${date}  /  ${answered.length} of ${steps.length} sections completed`, PAGE.left, 744);
  doc.font("InterBold").fontSize(10).fillColor(C.yellow).text("PLAN THE SEND-OFF. GET BACK TO LIVING.", 310, 724, { width: 237, align: "right" });

  doc.addPage(); pageNumber += 1; paintPage(doc); contentHeader(doc, "The running order.", "PLAN OVERVIEW");
  doc.font("Inter").fontSize(11).fillColor(C.grey).text("A clear record of the choices, details and personality that matter. Keep it safe, revisit it when life changes, and share it with the people who may need it.", PAGE.left, 195, { width: 470, lineGap: 5 });
  const indexY = 270;
  steps.forEach((step, index) => { const col = index % 2; const row = Math.floor(index / 2); const x = PAGE.left + col * 252; const y = indexY + row * 62; doc.rect(x, y, 238, 48).fillAndStroke(C.cream, C.ink); doc.font("Anton").fontSize(22).fillColor(C.pink).text(twoDigit(index + 1), x + 13, y + 11, { width: 31 }); doc.font("InterBold").fontSize(8).fillColor(C.ink).text(step.title.toUpperCase(), x + 50, y + 16, { width: 166, characterSpacing: .6 }); if (answers[step.key]) doc.circle(x + 218, y + 24, 7).fill(C.yellow); });
  doc.rect(PAGE.left, 627, 499, 82).fillAndStroke(C.pink, C.ink); doc.font("InterBold").fontSize(9).fillColor(C.ink).text("A USEFUL NOTE", PAGE.left + 18, 645, { characterSpacing: 1 }); doc.font("Inter").fontSize(9).fillColor(C.ink).text("Good Grief records personal wishes. It is not a will, funeral contract or legal instruction. Discuss anything legally significant with a qualified professional.", PAGE.left + 18, 665, { width: 457, lineGap: 3 }); footer(doc, "Plan overview", pageNumber);

  let y = PAGE.height; let contentPage = 0;
  const startContentPage = () => { doc.addPage(); pageNumber += 1; contentPage += 1; paintPage(doc); contentHeader(doc, contentPage === 1 ? "The plan." : "The plan, continued.", `UPDATED ${date.toUpperCase()}`); y = 190; };
  startContentPage();
  answered.forEach(step => {
    const index = steps.findIndex(item => item.key === step.key);
    doc.font("Anton").fontSize(24);
    const promptHeight = doc.heightOfString(step.prompt.toUpperCase(), { width: 410, lineGap: -1 });
    doc.font("Inter").fontSize(10);
    const answerHeight = Math.max(50, doc.heightOfString(text(answers[step.key]), { width: 371, lineGap: 4 }) + 22);
    const boxOffset = 37 + promptHeight + 10;
    const itemHeight = Math.max(142, boxOffset + answerHeight + 14);
    if (y + itemHeight > 770) { footer(doc, "My send-off", pageNumber); startContentPage(); }
    doc.moveTo(PAGE.left, y).lineTo(PAGE.right, y).lineWidth(1.5).strokeColor(C.ink).stroke();
    doc.font("Anton").fontSize(36).fillColor(C.pink).text(twoDigit(index + 1), PAGE.left, y + 18, { width: 56 });
    doc.font("InterBold").fontSize(7).fillColor(C.grey).text(step.title.toUpperCase(), 116, y + 21, { characterSpacing: 1 });
    doc.font("Anton").fontSize(24).fillColor(C.ink).text(step.prompt.toUpperCase(), 116, y + 37, { width: 410, lineGap: -1 });
    const boxY = y + boxOffset;
    doc.rect(116, boxY, 410, answerHeight).fill(C.cream);
    doc.rect(116, boxY, 5, answerHeight).fill(C.yellow);
    doc.font("Inter").fontSize(10).fillColor(C.ink).text(text(answers[step.key]), 135, boxY + 12, { width: 371, lineGap: 4 });
    y += itemHeight;
  });
  footer(doc, "My send-off", pageNumber);
}
