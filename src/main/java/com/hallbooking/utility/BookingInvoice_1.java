package com.hallbooking.utility;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.springframework.stereotype.Component;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.util.stream.Stream;

@Component
public class BookingInvoice_1 {

	public void generateBookingInvoice() throws FileNotFoundException, DocumentException {
		Document document = new Document(PageSize.A4, 20, 20, 50, 25);
		PdfWriter writer = PdfWriter.getInstance(document, new FileOutputStream("iTextHello.pdf"));
		HeaderFooterPageEvent event = new HeaderFooterPageEvent();
		writer.setPageEvent(event);
		document.open();
		
		ColumnText.showTextAligned(writer.getDirectContent(), Element.ALIGN_LEFT, new Phrase(".com"), 30, 700, 0);
		ColumnText.showTextAligned(writer.getDirectContent(), Element.ALIGN_LEFT, new Phrase("Trivandrum"), 30, 685, 0);
		ColumnText.showTextAligned(writer.getDirectContent(), Element.ALIGN_LEFT, new Phrase("boogiee.com"), 30, 670, 0);
		ColumnText.showTextAligned(writer.getDirectContent(), Element.ALIGN_LEFT, new Phrase("9048263553"), 30, 655, 0);
		
		PdfContentByte canvas = writer.getDirectContent();
		CMYKColor magentaColor = new CMYKColor(0.f, 0.f, 0.f, 1.f);
		canvas.setColorStroke(magentaColor);
		canvas.moveTo(16, 630);
		canvas.lineTo(600, 630);
		
		canvas.closePathStroke();
		
		ColumnText.showTextAligned(writer.getDirectContent(), Element.ALIGN_LEFT, new Phrase("Invoice Number"), 30, 600, 0);
		ColumnText.showTextAligned(writer.getDirectContent(), Element.ALIGN_LEFT, new Phrase("Invoice Date"), 30, 585, 0);
		
		Paragraph paragraph = new Paragraph();
		paragraph.add(new Phrase(""));
		paragraph.setSpacingAfter(250);
		document.add(paragraph);
		
		PdfPTable table = new PdfPTable(4);
		table.setPaddingTop(100);
		table.setWidthPercentage(100);
		addTableHeader(table);
		addRows(table);
		
		document.add(table);
		document.close();
	}
	
	private void addTableHeader(PdfPTable table) {
		Stream.of("Description", "Date From", "Date To", "Amount")
			.forEach(columnTitle -> {
				PdfPCell header = new PdfPCell();
				header.setBackgroundColor(BaseColor.GREEN);
				header.setBorderWidth(0);
				header.setRightIndent(10);
				header.setIndent(10);
				header.setFixedHeight(30);
				header.setPhrase(new Phrase(columnTitle));
				table.addCell(header);
			});
	}
	
	private void addRows(PdfPTable table) {
		for(int i =0; i <= 4; i++) {
			PdfPCell cell = new PdfPCell();
			cell.setPhrase(new Phrase("Kalyana Mandapam, Kazhakuttam, Trivandrum"));
			cell.setBorder(0);
			cell.setBorderWidthBottom(0);
			cell.setBorderColorBottom(BaseColor.BLACK);
			table.addCell(cell);
			
			PdfPCell cell1 = new PdfPCell();
			cell1.setPhrase(new Phrase("20/03/2019"));
			cell1.setBorder(0);
			cell1.setBorderWidthBottom(0);
			cell1.setBorderColorBottom(BaseColor.BLACK);
			table.addCell(cell1);
			
			PdfPCell cell2 = new PdfPCell();
			cell2.setPhrase(new Phrase("21/03/2019"));
			cell2.setBorder(0);
			cell2.setBorderWidthBottom(0.5f);
			cell2.setBorderColorBottom(BaseColor.BLACK);
			table.addCell(cell2);
			
			PdfPCell cell3 = new PdfPCell();
			cell3.setPhrase(new Phrase("Rs. 2000/-"));
			cell3.setBorder(0);
			cell3.setRightIndent(100);
			cell3.setBorderWidthBottom(0.5f);
			cell3.setBorderColorBottom(BaseColor.BLACK);
			table.addCell(cell3);
			
			table.setPaddingTop(90);
			table.setSplitRows(true);
		}
	}
}
