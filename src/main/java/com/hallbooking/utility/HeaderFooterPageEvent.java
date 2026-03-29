package com.hallbooking.utility;

import com.itextpdf.text.*;
import com.itextpdf.text.Font.FontFamily;
import com.itextpdf.text.pdf.ColumnText;
import com.itextpdf.text.pdf.PdfPageEventHelper;
import com.itextpdf.text.pdf.PdfWriter;

import java.io.IOException;

public class HeaderFooterPageEvent extends PdfPageEventHelper {

	public void onStartPage(PdfWriter writer, Document document) {
		Image image;
		try {
			image = Image.getInstance("downoad.jpg");
			image.setAlignment(Element.ALIGN_RIGHT);
			image.setAbsolutePosition(500, 750);
			image.scalePercent(7.5f, 7.5f);
			writer.getDirectContent().addImage(image, true);
		} catch(IOException | DocumentException e) {
			
		}
		
		Font font = new Font(FontFamily.HELVETICA, 12, Font.BOLD);
		ColumnText.showTextAligned(writer.getDirectContent(), Element.ALIGN_LEFT, new Phrase("INVOICE", font), 30, 750, 0);
	}
	
	public void onEndPage(PdfWriter writer, Document document) {
		ColumnText.showTextAligned(writer.getDirectContent(), Element.ALIGN_LEFT, new Phrase("http://www.boogiee.com"), 110, 30, 0);
		ColumnText.showTextAligned(writer.getDirectContent(), Element.ALIGN_CENTER, new Phrase("page"+ document.getPageNumber()), 550, 30, 0);
	}
}
