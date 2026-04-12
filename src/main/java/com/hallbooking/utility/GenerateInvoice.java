package com.hallbooking.utility;/*package com.group.booking.click.utility;


import java.awt.Color;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Date;

//import org.example.invoice.PDFPrinter;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Component;

import com.group.booking.click.model.Booking;
import com.group.booking.click.model.Invoice;
import com.group.booking.click.model.Item;
import com.group.booking.click.model.User;

import be.quodlibet.boxable.BaseTable;
import be.quodlibet.boxable.Cell;
import be.quodlibet.boxable.Row;
@Component
public class GenerateInvoice {

	public void geneateInvoice(Invoice invoice) throws IOException {
		String outputFileName = "SimpleTable.pdf";
        
        // Create a new font object selecting one of the PDF base fonts
        PDFont fontPlain = PDType1Font.HELVETICA;
        PDFont fontBold = PDType1Font.HELVETICA_BOLD;
        PDFont fontItalic = PDType1Font.HELVETICA_OBLIQUE;
        PDFont fontMono = PDType1Font.COURIER;

        // Create a document and add a page to it
        PDDocument document = new PDDocument();
        PDPage page = new PDPage(PDRectangle.A4);
        // PDRectangle.LETTER and others are also possible
        PDRectangle rect = page.getMediaBox();
        // rect can be used to get the page width and height
        document.addPage(page);

        // Start a new content stream which will "hold" the to be created content
        PDPageContentStream cos = new PDPageContentStream(document, page);

        //Dummy Table
        float margin = 50;
        // starting y position is whole page height subtracted by top and bottom margin
        float yStartNewPage = page.getMediaBox().getHeight() - (2 * margin);
        // we want table across whole page width (subtracted by left and right margin ofcourse)
        float tableWidth = page.getMediaBox().getWidth() - (2 * margin);

        boolean drawContent = true;
        float yStart = yStartNewPage;
        float bottomMargin = 70;
        // y position is your coordinate of top left corner of the table
        float yPosition = 550;

        BaseTable table = new BaseTable(yPosition, yStartNewPage,
            bottomMargin, tableWidth, margin, document, page, true, drawContent);

        // the parameter is the row height
        Row<PDPage> headerRow = table.createRow(50);
        // the first parameter is the cell width
        Cell<PDPage> cell = headerRow.createCell(100, "Header");
        cell.setFont(fontBold);
        cell.setFontSize(20);
        
        
        PDImageXObject pdImage = PDImageXObject.createFromFile("logo.png", pdfDocument);
        final float width = 60f;
        final float scale = width / pdImage.getWidth();
        contents.drawImage(pdImage, 50, 720, width, pdImage.getHeight()*scale);


        
        header(cos, invoice.getItemDetails());
        addressPDF(cos, true, invoice.getUser());
       // addressPDF(cos, false);
        shippingData(cos, invoice.getBookingObj());
       // printRowHeader(cos, 500);
        printSummery(cos, new BigDecimal(10001));
        printFooter(cos);
        ///////////////////////
     
        // close the content stream 
        cos.close();

        // Save the results and ensure that the document is properly closed:
        document.save(outputFileName);
        document.close();

	}
	
	public static void addressPDF(PDPageContentStream contents, boolean rightSide, User userDetails) throws IOException {
		PDFont font = PDType1Font.HELVETICA;
        Color color = new Color(80, 80, 80);

        int x = rightSide ? 400 : 120;

        int y = 660;

        PDFPrinter headerPrinter = new PDFPrinter(contents, font, 10);
        headerPrinter.putText(x, y, rightSide ? "Bill to:" : "Ship to:");

        y -= 12;
        PDFPrinter addressPrinter = new PDFPrinter(contents, font, 10, color);
        addressPrinter.putText(x, y, userDetails.getDetails().getName());
        y -= 12;
        addressPrinter.putText(x, y, userDetails.getDetails().getAddress());
        y -= 12;
        	addressPrinter.putText(x, y, "Chenkottukonam");	
	        y -= 12;
            addressPrinter.putText(x, y, "Chempazhanthy PO");
	        y -= 12;
	    addressPrinter.putText(x, y, "695587"+" "+"Trivandrum");
        y -= 12;
        addressPrinter.putText(x, y, "Kerala"+", "+"India");
    }
	
	private static void header(PDPageContentStream cos, Item itemDetails) throws IOException {
		PDFont headerFont = PDType1Font.HELVETICA_BOLD;
        PDFPrinter headerPrinter = new PDFPrinter(cos, headerFont, 16);
        headerPrinter.putText(120, 740, itemDetails.getDetails().getName());

        String address = itemDetails.getDetails().getAddress();
        PDFont font = PDType1Font.HELVETICA;
        PDFPrinter textPrinter = new PDFPrinter(cos, font, 10);
        textPrinter.putText(120, 720, address);
        textPrinter.putText(120, 708, itemDetails.getDetails().getPlace());
        textPrinter.putText(120, 696, itemDetails.getDetails().getContactNum().toString() + itemDetails.getDetails().getMailId());

        Color color = new Color(200, 200, 200);
        PDFPrinter invoiceHeaderPrinter = new PDFPrinter(cos, font, 24, color);
        invoiceHeaderPrinter.putText(450, 740, "INVOICE");     

        textPrinter.putText(400, 710, "Invoice date:");
        textPrinter.putText(400, 698, "Invoice number:");
        textPrinter.putText(500, 710, new Date().toString());
        textPrinter.putText(500, 698, "1234567890");
	}
	
	 private static void shippingData(PDPageContentStream contents, Booking bookingObj) throws IOException {        
	        
	        Color fillColor = new Color(230, 230, 230);
	        Color strokeColor = new Color(100, 100, 100);
	        contents.setStrokingColor(strokeColor);
	        contents.setNonStrokingColor(fillColor);
	        contents.addRect(50, 550, 520, 20);
	        contents.fillAndStroke();
	        contents.addRect(50, 530, 520, 20);
	        contents.stroke();

	        final int headerY = 557;
	        PDFont font = PDType1Font.HELVETICA;
	        PDFPrinter headerPrinter = new PDFPrinter(contents, font, 12);
	        headerPrinter.putText(60, headerY, "Item");
	        headerPrinter.putText(160, headerY, "Booked From");
	        headerPrinter.putText(280, headerY, "Booked To");
	        headerPrinter.putText(340, headerY, "Total Amt");
	        headerPrinter.putText(450, headerY, "Discount");
	        headerPrinter.putText(510, headerY, "Advance Amt");

	        final int textY = 537;
	        PDFPrinter textPrinter = new PDFPrinter(contents, font, 8);
	        textPrinter.putText(60, textY, bookingObj.getItemName());
	        textPrinter.putText(160, textY, bookingObj.getBookingFromDate().toString());
	        textPrinter.putText(280, textY, bookingObj.getBookingToDate().toString());
	        textPrinter.putText(340, textY, String.valueOf(bookingObj.getDetails().getAmtCollected()));
	        textPrinter.putText(450, textY, "kkkkkkkkkkkk");
	        textPrinter.putText(510, textY, "gggggggggggggggg");
	    }
	
	
		
		
		public static void printSummery(PDPageContentStream contents, BigDecimal totalCost) throws IOException {
	        Color strokeColor = new Color(100, 100, 100);
	        contents.setStrokingColor(strokeColor);
	        Color fillColor = new Color(240, 240, 240);
	        contents.setNonStrokingColor(fillColor);        

	        PDFPrinter summeryLabelPrinter = new PDFPrinter(contents, PDType1Font.HELVETICA_BOLD, 8);
	        PDFPrinter summeryValuePrinter = new PDFPrinter(contents, PDType1Font.HELVETICA, 12);

	    	BigDecimal subTotal = totalCost.multiply(new BigDecimal(0.8f));
	    	BigDecimal vatValue = totalCost.multiply(new BigDecimal(0.2f));
	    	subTotal = subTotal.setScale(2, RoundingMode.HALF_EVEN);    	
	    	vatValue = vatValue.setScale(2, RoundingMode.HALF_EVEN);
	    	totalCost = totalCost.setScale(2, RoundingMode.HALF_EVEN);

	    	int summeryStartY = 171;

			summeryLabelPrinter.putText(451, summeryStartY, "Sub total");
	        contents.addRect(450, summeryStartY-17, 120, 16);
	        contents.stroke();
	        summeryValuePrinter.putTextToTheRight(566, summeryStartY-13, subTotal.toString() + " SEK");

			summeryLabelPrinter.putText(451, summeryStartY - 30, "Vat");
	        contents.addRect(450, summeryStartY - 30 - 17, 120, 16);
	        contents.stroke();
	        summeryValuePrinter.putTextToTheRight(566, summeryStartY - 30 - 13, vatValue.toString() + " SEK");

			summeryLabelPrinter.putText(451, summeryStartY - 60, "Total price");
	        contents.addRect(450, summeryStartY - 60 - 17, 120, 16);
	        contents.stroke();
	        summeryValuePrinter.putTextToTheRight(566, summeryStartY - 60 - 13, totalCost.toString() + " SEK");        
		}


		public void printRowBackGround(PDPageContentStream contents, int rowY, int numRows) throws IOException {
	        Color strokeColor = new Color(100, 100, 100);
	        contents.setStrokingColor(strokeColor);
	        Color fillColor = new Color(240, 240, 240);
	        contents.setNonStrokingColor(fillColor);

			boolean odd = true;
	        for(int i=0; i<numRows; i++) {
		        if(odd) {
			        contents.addRect(51, rowY, 518, 20);
			        contents.fill();
		        }

	        	contents.moveTo(50, rowY);
	        	contents.lineTo(50, rowY+20);
	        	contents.moveTo(570, rowY);
	        	contents.lineTo(570, rowY+20);
	        	contents.stroke();
				rowY -= 20;
				odd = !odd;
	        }

	    	contents.moveTo(50, rowY+20);
	    	contents.lineTo(570, rowY+20);
	    	contents.stroke();
		}
		
		public static void printRowHeader(PDPageContentStream contents, int headerY) throws IOException {
	        Color fillColor = new Color(230, 230, 230);
	        Color strokeColor = new Color(100, 100, 100);
	        contents.setStrokingColor(strokeColor);
	        contents.setNonStrokingColor(fillColor);
	        contents.addRect(50, headerY, 520, 20);
	        contents.fillAndStroke();

	        PDFont font = PDType1Font.HELVETICA;
	        PDFPrinter headerPrinter = new PDFPrinter(contents, font, 12);
	        headerPrinter.putText(60, headerY+7, "Product no.");
	        headerPrinter.putText(160, headerY+7, "Description");
	        headerPrinter.putText(380, headerY+7, "Quantity");
	        headerPrinter.putText(440, headerY+7, "Unit price");
	        headerPrinter.putText(510, headerY+7, "Total");
		}

		public static void printFooter(PDPageContentStream contents) throws IOException {
	        Color strokeColor = new Color(100, 100, 100);
	        contents.setStrokingColor(strokeColor);
	        contents.addRect(50, 35, 370, 135);
	        contents.stroke();

	        PDFPrinter footerLabelPrinter = new PDFPrinter(contents, PDType1Font.HELVETICA_BOLD, 8);
	        PDFPrinter footerValuePrinter = new PDFPrinter(contents, PDType1Font.HELVETICA, 8);
	        footerLabelPrinter.putText(50, 172, "Notes");
	        int rowY = 160;
	        StringBuilder sb = new StringBuilder();
	        for(String s : "jjhjjjj khkjhjhjhh yiuyuiyiuyuyyiuy ssdsdsdsdsss vnvnvnvbnnn gdgdgdgdgdgfdggg".split(" ")) {
	        	if(footerValuePrinter.widthOfText(sb.toString() + " " + s) > 365) {
		        	if(rowY < 50) {
		        		sb.append("...");
			        	footerValuePrinter.putText(55, rowY, sb.toString());
			        	sb = new StringBuilder();
			        	break;
		        	}
		        	footerValuePrinter.putText(55, rowY, sb.toString());        	
		        	rowY -= 10;
		        	sb = new StringBuilder();
	        	}        	
	        	sb.append(s);
	        	sb.append(" ");
	        }
	    	footerValuePrinter.putText(55, rowY, sb.toString());        	
		}

		
	}


*/