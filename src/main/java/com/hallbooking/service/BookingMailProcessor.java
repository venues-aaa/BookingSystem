/*
package com.hallbooking.service;

import jakarta.activation.DataHandler;
import jakarta.activation.DataSource;
import jakarta.activation.FileDataSource;
import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeBodyPart;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

import java.util.Properties;

@Component
public class BookingMailProcessor {

	@Autowired
	private JavaMailSender sender;

	private String processBody(String toMail) { 
		  StringBuilder email = new StringBuilder();
		  email.append("<html><body>");
		  email.append("mmmmmmmmmmmmmmmmmmmmmmmm"); 
		  email.append("<br><br>");
		  email.append("</body></html>");
	  
		  return email.toString();
	}

	public String sendMail(String toMail, String fileName) {
        try {
        	sendMailViaGodaddy();
            return "Email Sent!";
        }catch(Exception ex) {
            return "Error in sending email: "+ex;
        }
    }
	
	 public static void sendMailViaGodaddy(*/
/*String emailId, String newPassword*//*
) {
        try {
        	Properties props = System.getProperties();
        	props.setProperty("mail.transport.protocol", "smtp");
        	props.setProperty("mail.host", "smtpout.secureserver.net");
	        props.put("mail.smtp.auth", "true");
        	props.setProperty("mail.user", "info@boogiee.com");
        	props.setProperty("mail.password", "m2s1v9i5!");
	 
	        Session mailSession = Session.getDefaultInstance(props, null);
	        Transport transport = mailSession.getTransport("smtp");
	        MimeMessage message = new MimeMessage(mailSession);
	        message.setSentDate(new java.util.Date());
	        message.setSubject("Boogiee.com : Booking Confirmation");
	        message.setFrom(new InternetAddress("info@boogiee.com"));
	     */
/*   for (int i=0;i < to.size();i++)
	        {
	                                         
	     *//*
 message.addRecipient(Message.RecipientType.TO, new
	    		 InternetAddress("ajithraj.in@gmail.com"));
	     //       }
               
	     BodyPart messageBodyPart1 = new MimeBodyPart();
	     messageBodyPart1.setText("Hello, Greeting!! Your booking is successfully completed. Please check the attached Invoice.");  
	       
	     //4) create new MimeBodyPart object and set DataHandler object to this object      
	     MimeBodyPart messageBodyPart2 = new MimeBodyPart();  
	   
	     String filename = "SimpleTable.pdf";//change accordingly  
	     DataSource source = new FileDataSource(filename);
	     messageBodyPart2.setDataHandler(new DataHandler(source));
	     messageBodyPart2.setFileName(filename);  
	     Multipart multipart = new MimeMultipart();
	     multipart.addBodyPart(messageBodyPart1);  
	     multipart.addBodyPart(messageBodyPart2);  
	   
	     //6) set the multiplart object to the message object  
	     message.setContent(multipart );  
    
	     
	/////////////////////////////////     
	     
	     transport.connect("smtpout.secureserver.net","info@boogiee.com","m2s1v9i5!");
            transport.sendMessage(message,
            message.getRecipients(Message.RecipientType.TO));
            transport.close();
                       
            System.out.println("Email via go daddy sent");
        } catch (Exception e) {
        	System.out.println("Failed to send Email : " + e.getMessage());
	    }
	}
 
}
*/
